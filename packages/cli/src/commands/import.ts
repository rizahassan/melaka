/**
 * Melaka CLI - Import Command
 *
 * Import reviewed translations from JSON or CSV.
 */

import { Command } from 'commander';
import { loadConfig, type MelakaConfig } from '@melaka/core';
import * as fs from 'fs';

interface ImportedTranslation {
  collection: string;
  documentId: string;
  language: string;
  field: string;
  source: string;
  translation: string;
  status?: string;
  reviewed?: boolean;
}

interface ImportResult {
  updated: number;
  skipped: number;
  failed: number;
  errors: string[];
}

export const importCommand = new Command('import')
  .description('Import reviewed translations from JSON or CSV')
  .argument('<file>', 'Input file path (JSON or CSV)')
  .option('--dry-run', 'Show what would be imported without making changes')
  .option('--mark-reviewed', 'Mark imported translations as reviewed', true)
  .option('-v, --verbose', 'Show detailed output')
  .action(async (file, options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;

    // Check file exists
    if (!fs.existsSync(file)) {
      console.error(chalk.red(`File not found: ${file}`));
      process.exit(1);
    }

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

    // Parse input file
    const parseSpinner = ora('Parsing input file...').start();
    let translations: ImportedTranslation[];

    try {
      const content = fs.readFileSync(file, 'utf-8');
      const ext = file.toLowerCase().split('.').pop();

      if (ext === 'csv') {
        translations = parseCSV(content);
      } else {
        translations = JSON.parse(content);
      }

      parseSpinner.succeed(`Parsed ${translations.length} translation entries`);
    } catch (error) {
      parseSpinner.fail('Failed to parse input file');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    // Validate translations
    const validationErrors: string[] = [];
    for (let i = 0; i < translations.length; i++) {
      const t = translations[i];
      if (!t.collection || !t.documentId || !t.language || !t.field) {
        validationErrors.push(`Row ${i + 1}: Missing required field (collection, documentId, language, or field)`);
      }
      if (!config.languages.includes(t.language)) {
        validationErrors.push(`Row ${i + 1}: Unknown language "${t.language}"`);
      }
    }

    if (validationErrors.length > 0) {
      console.error(chalk.red('\nValidation errors:'));
      for (const error of validationErrors.slice(0, 10)) {
        console.error(chalk.red(`  - ${error}`));
      }
      if (validationErrors.length > 10) {
        console.error(chalk.red(`  ... and ${validationErrors.length - 10} more`));
      }
      process.exit(1);
    }

    // Dry run mode
    if (options.dryRun) {
      console.log('');
      console.log(chalk.yellow('DRY RUN - No changes will be made'));
      console.log('');
      
      // Group by collection/doc/language
      const grouped = new Map<string, ImportedTranslation[]>();
      for (const t of translations) {
        const key = `${t.collection}/${t.documentId}/${t.language}`;
        if (!grouped.has(key)) grouped.set(key, []);
        grouped.get(key)!.push(t);
      }

      console.log(chalk.cyan(`Would update ${grouped.size} translation documents:`));
      for (const [key, fields] of grouped) {
        console.log(chalk.gray(`  ${key} (${fields.length} fields)`));
        if (options.verbose) {
          for (const f of fields) {
            console.log(chalk.gray(`    - ${f.field}: "${f.translation.slice(0, 50)}..."`));
          }
        }
      }
      return;
    }

    // Initialize Firebase
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.getFirestore();
    const { Timestamp } = await import('firebase-admin/firestore');

    // Import translations
    const importSpinner = ora('Importing translations...').start();
    const result: ImportResult = { updated: 0, skipped: 0, failed: 0, errors: [] };

    // Group translations by document
    const grouped = new Map<string, ImportedTranslation[]>();
    for (const t of translations) {
      const key = `${t.collection}/${t.documentId}/${t.language}`;
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key)!.push(t);
    }

    try {
      for (const [key, fields] of grouped) {
        const [collection, documentId, language] = parseKey(key);

        try {
          const docRef = db.collection(collection).doc(documentId);
          const i18nRef = docRef.collection('i18n').doc(language);

          // Get existing i18n doc
          const existingDoc = await i18nRef.get();
          const existingData = existingDoc.data() || {};
          const existingMetadata = existingData._melaka || {};

          // Build update
          const update: Record<string, unknown> = {};
          for (const field of fields) {
            if (field.translation && field.translation.trim() !== '') {
              update[field.field] = field.translation;
            }
          }

          if (Object.keys(update).length === 0) {
            result.skipped++;
            continue;
          }

          // Update metadata
          update._melaka = {
            ...existingMetadata,
            status: 'completed',
            reviewed: options.markReviewed ?? true,
            imported_at: Timestamp.now(),
          };

          await i18nRef.set(update, { merge: true });
          result.updated++;

          if (options.verbose) {
            importSpinner.text = `Imported ${result.updated}/${grouped.size}...`;
          }
        } catch (error) {
          result.failed++;
          result.errors.push(`${key}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }

      importSpinner.succeed(`Imported ${result.updated} translations`);
    } catch (error) {
      importSpinner.fail('Import failed');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    // Summary
    console.log('');
    console.log(chalk.cyan('Import Summary:'));
    console.log(chalk.green(`  ✓ Updated: ${result.updated}`));
    if (result.skipped > 0) {
      console.log(chalk.gray(`  - Skipped: ${result.skipped}`));
    }
    if (result.failed > 0) {
      console.log(chalk.red(`  ✗ Failed: ${result.failed}`));
      if (options.verbose) {
        for (const error of result.errors.slice(0, 5)) {
          console.log(chalk.red(`    ${error}`));
        }
      }
    }
  });

/**
 * Parse CSV content into translation objects.
 */
function parseCSV(content: string): ImportedTranslation[] {
  const lines = content.split('\n').filter((l) => l.trim());
  if (lines.length < 2) return [];

  const headers = parseCSVLine(lines[0]);
  const translations: ImportedTranslation[] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    const obj: Record<string, string> = {};

    for (let j = 0; j < headers.length && j < values.length; j++) {
      obj[headers[j]] = values[j];
    }

    translations.push({
      collection: obj.collection || '',
      documentId: obj.documentId || '',
      language: obj.language || '',
      field: obj.field || '',
      source: obj.source || '',
      translation: obj.translation || '',
      status: obj.status,
      reviewed: obj.reviewed === 'true',
    });
  }

  return translations;
}

/**
 * Parse a single CSV line, handling quoted values.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
  }

  values.push(current);
  return values;
}

/**
 * Parse a grouped key back into components.
 */
function parseKey(key: string): [string, string, string] {
  const parts = key.split('/');
  const language = parts.pop()!;
  const documentId = parts.pop()!;
  const collection = parts.join('/');
  return [collection, documentId, language];
}
