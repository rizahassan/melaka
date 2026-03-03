/**
 * Melaka CLI - Export Command
 *
 * Export translations to JSON or CSV for human review.
 */

import { Command } from 'commander';
import { loadConfig, getLanguageName, type MelakaConfig } from '@melaka/core';
import * as fs from 'fs';
import * as path from 'path';

interface ExportedTranslation {
  collection: string;
  documentId: string;
  language: string;
  field: string;
  source: string;
  translation: string;
  status: string;
  reviewed: boolean;
}

export const exportCommand = new Command('export')
  .description('Export translations to JSON or CSV for review')
  .option('-c, --collection <path>', 'Specific collection to export')
  .option('-l, --language <code>', 'Specific language to export')
  .option('-f, --format <format>', 'Output format: json or csv', 'json')
  .option('-o, --output <path>', 'Output file path')
  .option('--failed-only', 'Export only failed translations')
  .option('--unreviewed-only', 'Export only unreviewed translations')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;

    // Load config
    const configSpinner = ora('Loading melaka.config.ts...').start();
    let config: MelakaConfig;

    try {
      config = await loadConfig();
      configSpinner.succeed('Loaded config');
    } catch (error) {
      configSpinner.fail('Failed to load config');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    // Filter collections if specified
    const collectionsToExport = options.collection
      ? config.collections.filter((c) => c.path === options.collection)
      : config.collections;

    if (options.collection && collectionsToExport.length === 0) {
      console.error(chalk.red(`Collection "${options.collection}" not found in config`));
      process.exit(1);
    }

    // Filter languages if specified
    const languagesToExport = options.language
      ? config.languages.filter((l) => l === options.language)
      : config.languages;

    if (options.language && languagesToExport.length === 0) {
      console.error(chalk.red(`Language "${options.language}" not found in config`));
      process.exit(1);
    }

    // Validate format
    if (!['json', 'csv'].includes(options.format)) {
      console.error(chalk.red(`Invalid format "${options.format}". Use "json" or "csv".`));
      process.exit(1);
    }

    // Initialize Firebase
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.getFirestore();

    const exportSpinner = ora('Exporting translations...').start();
    const translations: ExportedTranslation[] = [];

    try {
      for (const collectionConfig of collectionsToExport) {
        // Query collection (support collection groups)
        const query = collectionConfig.isCollectionGroup
          ? db.collectionGroup(collectionConfig.path)
          : db.collection(collectionConfig.path);

        const snapshot = await query.get();

        for (const doc of snapshot.docs) {
          const sourceData = doc.data();
          const fields = collectionConfig.fields || Object.keys(sourceData).filter(
            (k) => typeof sourceData[k] === 'string' && !k.startsWith('_')
          );

          for (const lang of languagesToExport) {
            const i18nDoc = await doc.ref.collection('i18n').doc(lang).get();
            const i18nData = i18nDoc.data() || {};
            const metadata = i18nData._melaka || {};

            // Apply filters
            if (options.failedOnly && metadata.status !== 'failed') continue;
            if (options.unreviewedOnly && metadata.reviewed === true) continue;

            for (const field of fields) {
              if (sourceData[field] === undefined) continue;

              const sourceValue = typeof sourceData[field] === 'string'
                ? sourceData[field]
                : JSON.stringify(sourceData[field]);

              const translationValue = i18nData[field] !== undefined
                ? (typeof i18nData[field] === 'string' ? i18nData[field] : JSON.stringify(i18nData[field]))
                : '';

              translations.push({
                collection: collectionConfig.isCollectionGroup ? doc.ref.parent.path : collectionConfig.path,
                documentId: doc.id,
                language: lang,
                field,
                source: sourceValue,
                translation: translationValue,
                status: metadata.status || 'unknown',
                reviewed: metadata.reviewed || false,
              });
            }
          }
        }
      }

      exportSpinner.succeed(`Exported ${translations.length} translation entries`);
    } catch (error) {
      exportSpinner.fail('Failed to export translations');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    // Generate output
    let output: string;
    const ext = options.format === 'csv' ? 'csv' : 'json';

    if (options.format === 'csv') {
      output = generateCSV(translations);
    } else {
      output = JSON.stringify(translations, null, 2);
    }

    // Write output
    const outputPath = options.output || `melaka-export-${Date.now()}.${ext}`;

    try {
      fs.writeFileSync(outputPath, output, 'utf-8');
      console.log(chalk.green(`✓ Exported to ${outputPath}`));
    } catch (error) {
      console.error(chalk.red(`Failed to write output: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }

    // Summary
    console.log('');
    console.log(chalk.cyan('Export Summary:'));
    console.log(chalk.gray(`  Collections: ${collectionsToExport.length}`));
    console.log(chalk.gray(`  Languages: ${languagesToExport.join(', ')}`));
    console.log(chalk.gray(`  Entries: ${translations.length}`));

    const reviewed = translations.filter((t) => t.reviewed).length;
    const failed = translations.filter((t) => t.status === 'failed').length;

    if (reviewed > 0) {
      console.log(chalk.green(`  ✓ Reviewed: ${reviewed}`));
    }
    if (failed > 0) {
      console.log(chalk.red(`  ✗ Failed: ${failed}`));
    }
  });

/**
 * Generate CSV output from translations.
 */
function generateCSV(translations: ExportedTranslation[]): string {
  const headers = ['collection', 'documentId', 'language', 'field', 'source', 'translation', 'status', 'reviewed'];
  const rows = translations.map((t) => [
    escapeCSV(t.collection),
    escapeCSV(t.documentId),
    escapeCSV(t.language),
    escapeCSV(t.field),
    escapeCSV(t.source),
    escapeCSV(t.translation),
    escapeCSV(t.status),
    t.reviewed ? 'true' : 'false',
  ]);

  return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
}

/**
 * Escape a value for CSV output.
 */
function escapeCSV(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}
