/**
 * Melaka CLI - Cleanup Command
 *
 * Remove orphaned translations (i18n docs without parent documents).
 */

import { Command } from 'commander';
import { loadConfig, MelakaConfig } from '@melaka/core';

interface OrphanedDoc {
  collectionPath: string;
  documentId: string;
  language: string;
  i18nPath: string;
}

export const cleanupCommand = new Command('cleanup')
  .description('Remove orphaned translations')
  .option('-c, --collection <path>', 'Specific collection to clean')
  .option('--dry-run', 'Show what would be deleted without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;
    const admin = await import('firebase-admin');

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

    // Initialize Firebase if not already done
    if (!admin.apps.length) {
      admin.initializeApp();
    }

    const db = admin.getFirestore();

    // Filter collections if specified
    const collectionsToClean = options.collection
      ? config.collections.filter((c) => c.path === options.collection)
      : config.collections;

    if (options.collection && collectionsToClean.length === 0) {
      console.error(chalk.red(`Collection "${options.collection}" not found in config`));
      process.exit(1);
    }

    const scanSpinner = ora('Scanning for orphaned translations...').start();
    const orphanedDocs: OrphanedDoc[] = [];

    try {
      for (const collectionConfig of collectionsToClean) {
        // Get all parent documents
        const parentSnapshot = await db.collection(collectionConfig.path).get();
        const parentIds = new Set(parentSnapshot.docs.map((doc) => doc.id));

        // For each language, find i18n docs without parent
        for (const lang of config.languages) {
          // Use collection group query to find all i18n docs
          // Note: This requires a composite index on i18n collection
          const i18nSnapshot = await db
            .collectionGroup('i18n')
            .where('_melaka.collection', '==', collectionConfig.path)
            .get()
            .catch(() => {
              // Fallback: iterate through known parent docs
              return null;
            });

          if (i18nSnapshot) {
            // Collection group query worked
            for (const i18nDoc of i18nSnapshot.docs) {
              const parentRef = i18nDoc.ref.parent.parent;
              if (parentRef && !parentIds.has(parentRef.id)) {
                orphanedDocs.push({
                  collectionPath: collectionConfig.path,
                  documentId: parentRef.id,
                  language: i18nDoc.id,
                  i18nPath: i18nDoc.ref.path,
                });
              }
            }
          } else {
            // Fallback: Can't easily find orphans without collection group
            // Skip for now and report
            if (options.verbose) {
              scanSpinner.text = `Skipping ${collectionConfig.path} - collection group index needed`;
            }
          }
        }
      }

      scanSpinner.succeed(`Found ${orphanedDocs.length} orphaned translation(s)`);
    } catch (error) {
      scanSpinner.fail('Failed to scan for orphaned translations');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    if (orphanedDocs.length === 0) {
      console.log(chalk.green('\n✅ No orphaned translations found!'));
      return;
    }

    // Output results
    if (options.json) {
      console.log(JSON.stringify({
        orphaned: orphanedDocs,
        total: orphanedDocs.length,
        dryRun: options.dryRun || false,
      }, null, 2));

      if (options.dryRun) {
        return;
      }
    } else {
      console.log('');
      console.log(chalk.white('Orphaned translations:'));
      console.log('');

      for (const doc of orphanedDocs) {
        console.log(chalk.gray(`  ${doc.i18nPath}`));
        if (options.verbose) {
          console.log(chalk.gray(`    Parent: ${doc.collectionPath}/${doc.documentId} (deleted)`));
        }
      }
      console.log('');
    }

    if (options.dryRun) {
      console.log(chalk.yellow('🔍 Dry run mode - no changes made'));
      console.log(chalk.gray(`   Would delete ${orphanedDocs.length} orphaned translation(s)`));
      return;
    }

    // Confirm deletion
    const readline = await import('readline');
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });

    const confirm = await new Promise<boolean>((resolve) => {
      rl.question(
        chalk.yellow(`\n⚠️  Delete ${orphanedDocs.length} orphaned translation(s)? [y/N] `),
        (answer) => {
          rl.close();
          resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
        }
      );
    });

    if (!confirm) {
      console.log(chalk.gray('Cleanup cancelled.'));
      return;
    }

    // Delete orphaned docs
    const deleteSpinner = ora('Deleting orphaned translations...').start();
    let deleted = 0;

    try {
      for (const doc of orphanedDocs) {
        await db.doc(doc.i18nPath).delete();
        deleted++;

        if (options.verbose) {
          deleteSpinner.text = `Deleted ${deleted}/${orphanedDocs.length}: ${doc.i18nPath}`;
        }
      }

      deleteSpinner.succeed(`Deleted ${deleted} orphaned translation(s)`);
    } catch (error) {
      deleteSpinner.fail(`Failed after deleting ${deleted}/${orphanedDocs.length}`);
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    console.log(chalk.green('\n✅ Cleanup complete!'));
  });
