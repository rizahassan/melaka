/**
 * Melaka CLI - Translate Command
 *
 * Manually trigger translation for collections.
 */

import { Command } from 'commander';
import { loadConfig, findCollectionConfig } from '@melaka/core';

export const translateCommand = new Command('translate')
  .description('Manually translate a collection')
  .option('-c, --collection <path>', 'Collection path to translate')
  .option('-l, --language <code>', 'Specific language to translate')
  .option('--force', 'Force re-translation of all documents')
  .option('--dry-run', 'Show what would be translated without doing it')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;

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

    // Determine which collections to translate
    let collectionsToTranslate = config.collections;

    if (options.collection) {
      const collectionConfig = findCollectionConfig(config, options.collection);
      if (!collectionConfig) {
        console.error(chalk.red(`Collection not found in config: ${options.collection}`));
        console.log(chalk.gray('Available collections:'));
        for (const c of config.collections) {
          console.log(chalk.gray(`  - ${c.path}`));
        }
        process.exit(1);
      }
      collectionsToTranslate = [collectionConfig];
    }

    // Determine which languages to translate
    let languagesToTranslate = config.languages;

    if (options.language) {
      if (!config.languages.includes(options.language)) {
        console.error(chalk.red(`Language not found in config: ${options.language}`));
        console.log(chalk.gray('Available languages:'));
        for (const l of config.languages) {
          console.log(chalk.gray(`  - ${l}`));
        }
        process.exit(1);
      }
      languagesToTranslate = [options.language];
    }

    // Show what will be translated
    console.log('');
    console.log(chalk.cyan('Translation Plan:'));
    console.log(chalk.gray(`  Collections: ${collectionsToTranslate.map((c) => c.path).join(', ')}`));
    console.log(chalk.gray(`  Languages: ${languagesToTranslate.join(', ')}`));
    console.log(chalk.gray(`  Force: ${options.force ? 'yes' : 'no'}`));
    console.log('');

    if (options.dryRun) {
      console.log(chalk.yellow('Dry run - no translations will be performed.'));
      console.log('');
      console.log(chalk.gray('To perform translations, this command needs to be run'));
      console.log(chalk.gray('in a Firebase Functions environment or with emulators.'));
      console.log('');
      console.log(chalk.gray('For now, use triggers or the Firebase console to trigger translations.'));
      return;
    }

    // Note: Actual translation requires Firebase Admin SDK
    // This is a placeholder for the MVP
    console.log(chalk.yellow('⚠️  Manual translation requires Firebase Functions environment.'));
    console.log('');
    console.log('To translate documents:');
    console.log(chalk.gray('  1. Deploy triggers: melaka deploy'));
    console.log(chalk.gray('  2. Update a document to trigger translation'));
    console.log(chalk.gray('  3. Or use Firebase Console to call the Cloud Task directly'));
    console.log('');
    console.log(chalk.gray('Batch translation via CLI will be available in Phase 2.'));
  });
