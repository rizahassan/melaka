/**
 * Melaka CLI - Watch Command
 *
 * Watch for document changes and translate in real-time during development.
 */

import { Command } from 'commander';
import { loadConfig, type MelakaConfig } from '@melaka/core';

export const watchCommand = new Command('watch')
  .description('Watch for document changes and translate in real-time (development)')
  .option('-c, --collection <path>', 'Specific collection to watch')
  .option('-l, --language <code>', 'Specific language to translate')
  .option('--emulator', 'Connect to Firebase emulator')
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
    const collectionsToWatch = options.collection
      ? config.collections.filter((c) => c.path === options.collection)
      : config.collections;

    if (options.collection && collectionsToWatch.length === 0) {
      console.error(chalk.red(`Collection "${options.collection}" not found in config`));
      process.exit(1);
    }

    // Filter languages if specified
    const languagesToTranslate = options.language
      ? config.languages.filter((l) => l === options.language)
      : config.languages;

    if (options.language && languagesToTranslate.length === 0) {
      console.error(chalk.red(`Language "${options.language}" not found in config`));
      process.exit(1);
    }

    // Check for emulator environment
    const emulatorHost = process.env.FIRESTORE_EMULATOR_HOST;
    if (options.emulator && !emulatorHost) {
      console.log(chalk.yellow('⚠️  FIRESTORE_EMULATOR_HOST not set. Setting to localhost:8080'));
      process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080';
    }

    // Initialize Firebase
    const admin = await import('firebase-admin');
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    const db = admin.getFirestore();

    console.log('');
    console.log(chalk.cyan('🔍 Melaka Watch Mode'));
    console.log(chalk.gray(`   Collections: ${collectionsToWatch.map(c => c.path).join(', ')}`));
    console.log(chalk.gray(`   Languages: ${languagesToTranslate.join(', ')}`));
    if (process.env.FIRESTORE_EMULATOR_HOST) {
      console.log(chalk.yellow(`   Emulator: ${process.env.FIRESTORE_EMULATOR_HOST}`));
    }
    console.log('');
    console.log(chalk.gray('Press Ctrl+C to stop watching...'));
    console.log('');

    // Import processor for translations
    const { processTranslation } = await import('@melaka/firestore');

    // Set up listeners for each collection
    const unsubscribers: (() => void)[] = [];

    for (const collectionConfig of collectionsToWatch) {
      const query = collectionConfig.isCollectionGroup
        ? db.collectionGroup(collectionConfig.path)
        : db.collection(collectionConfig.path);

      const unsubscribe = query.onSnapshot(
        async (snapshot) => {
          for (const change of snapshot.docChanges()) {
            if (change.type === 'removed') continue;

            const doc = change.doc;
            const docPath = doc.ref.path;

            if (options.verbose) {
              console.log(chalk.gray(`[${change.type}] ${docPath}`));
            }

            // Translate to each language
            for (const language of languagesToTranslate) {
              try {
                const result = await processTranslation(
                  doc.ref,
                  doc.data(),
                  language,
                  config,
                  collectionConfig,
                  { forceUpdate: false }
                );

                if (result.skipped) {
                  if (options.verbose) {
                    console.log(chalk.gray(`  ↳ ${language}: skipped (unchanged)`));
                  }
                } else if (result.success) {
                  console.log(chalk.green(`  ✓ ${docPath} → ${language} (${result.durationMs}ms)`));
                } else {
                  console.log(chalk.red(`  ✗ ${docPath} → ${language}: ${result.error}`));
                }
              } catch (error) {
                console.error(chalk.red(`  ✗ ${docPath} → ${language}: ${error instanceof Error ? error.message : String(error)}`));
              }
            }
          }
        },
        (error) => {
          console.error(chalk.red(`Watch error on ${collectionConfig.path}: ${error.message}`));
        }
      );

      unsubscribers.push(unsubscribe);
      console.log(chalk.gray(`Watching: ${collectionConfig.path}`));
    }

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('');
      console.log(chalk.gray('Stopping watch mode...'));
      for (const unsubscribe of unsubscribers) {
        unsubscribe();
      }
      process.exit(0);
    });

    // Keep the process running
    await new Promise(() => {});
  });
