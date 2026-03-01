/**
 * Melaka CLI - Retry Command
 *
 * Retry failed translations for a collection.
 */

import { Command } from 'commander';
import { loadConfig } from '@melaka/core';

export const retryCommand = new Command('retry')
  .description('Retry failed translations')
  .option('-c, --collection <path>', 'Specific collection to retry')
  .option('-l, --language <code>', 'Specific language to retry')
  .option('--dry-run', 'Show what would be retried without making changes')
  .option('-v, --verbose', 'Show detailed output')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;
    const admin = await import('firebase-admin');

    // Load config
    const configSpinner = ora('Loading melaka.config.ts...').start();
    let config;

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
    const collectionsToProcess = options.collection
      ? config.collections.filter((c) => c.path === options.collection)
      : config.collections;

    if (options.collection && collectionsToProcess.length === 0) {
      console.error(chalk.red(`Collection "${options.collection}" not found in config`));
      process.exit(1);
    }

    // Filter languages if specified
    const languagesToProcess = options.language ? [options.language] : config.languages;

    if (options.language && !config.languages.includes(options.language)) {
      console.error(chalk.red(`Language "${options.language}" not in configured languages: ${config.languages.join(', ')}`));
      process.exit(1);
    }

    const scanSpinner = ora('Scanning for failed translations...').start();

    interface FailedDoc {
      collectionPath: string;
      documentId: string;
      language: string;
      error: string;
      translatedAt: Date;
    }

    let totalFailed = 0;
    const failedDocs: FailedDoc[] = [];

    try {
      for (const collectionConfig of collectionsToProcess) {
        // Get all documents in the collection
        const snapshot = await db.collection(collectionConfig.path).get();

        for (const doc of snapshot.docs) {
          for (const lang of languagesToProcess) {
            // Check the i18n subcollection for failed status
            const i18nDoc = await doc.ref.collection('i18n').doc(lang).get();

            if (i18nDoc.exists) {
              const data = i18nDoc.data();
              const metadata = data?._melaka;

              if (metadata?.status === 'failed') {
                totalFailed++;
                failedDocs.push({
                  collectionPath: collectionConfig.path,
                  documentId: doc.id,
                  language: lang,
                  error: metadata.error || 'Unknown error',
                  translatedAt: metadata.translated_at?.toDate() || new Date(),
                });
              }
            }
          }
        }
      }

      scanSpinner.succeed(`Found ${totalFailed} failed translation(s)`);
    } catch (error) {
      scanSpinner.fail('Failed to scan for failed translations');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    if (totalFailed === 0) {
      console.log(chalk.green('\n✅ No failed translations found!'));
      return;
    }

    // Display failed translations
    console.log('');
    console.log(chalk.white('Failed translations:'));
    console.log('');

    for (const doc of failedDocs) {
      console.log(chalk.gray(`  ${doc.collectionPath}/${doc.documentId} [${doc.language}]`));
      console.log(chalk.red(`    Error: ${doc.error}`));
      if (options.verbose) {
        console.log(chalk.gray(`    Failed at: ${doc.translatedAt.toISOString()}`));
      }
    }
    console.log('');

    if (options.dryRun) {
      console.log(chalk.yellow('🔍 Dry run mode - no changes made'));
      console.log(chalk.gray(`   Would retry ${totalFailed} translation(s)`));
      return;
    }

    // Retry by clearing failed status
    const retrySpinner = ora('Resetting failed translations to pending...').start();
    let totalRetried = 0;

    try {
      for (const doc of failedDocs) {
        const docRef = db.collection(doc.collectionPath).doc(doc.documentId);
        const i18nRef = docRef.collection('i18n').doc(doc.language);

        // Update status to pending and clear the error
        await i18nRef.update({
          '_melaka.status': 'pending',
          '_melaka.error': admin.firestore.FieldValue.delete(),
          '_melaka.source_hash': '', // Clear hash to force re-translation
        });

        totalRetried++;

        if (options.verbose) {
          retrySpinner.text = `Reset ${totalRetried}/${totalFailed}: ${doc.documentId}/${doc.language}`;
        }
      }

      retrySpinner.succeed(`Reset ${totalRetried} translation(s) to pending`);
    } catch (error) {
      retrySpinner.fail('Failed to reset translations');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    console.log('');
    console.log(chalk.cyan('Next steps:'));
    console.log(chalk.gray('  • Translations will be re-processed on next document update'));
    console.log(chalk.gray('  • Or run "melaka translate" to process them now'));
  });

/**
 * Get count of failed translations for status display.
 */
export async function getFailedCount(
  db: FirebaseFirestore.Firestore,
  collections: { path: string }[],
  languages: string[]
): Promise<number> {
  let failedCount = 0;

  for (const collection of collections) {
    const snapshot = await db.collection(collection.path).get();

    for (const doc of snapshot.docs) {
      for (const lang of languages) {
        const i18nDoc = await doc.ref.collection('i18n').doc(lang).get();

        if (i18nDoc.exists) {
          const metadata = i18nDoc.data()?._melaka;
          if (metadata?.status === 'failed') {
            failedCount++;
          }
        }
      }
    }
  }

  return failedCount;
}
