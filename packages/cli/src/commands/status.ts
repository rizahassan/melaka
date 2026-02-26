/**
 * Melaka CLI - Status Command
 *
 * Check translation status for collections.
 */

import { Command } from 'commander';
import { loadConfig, getLanguageName } from '@melaka/core';

export const statusCommand = new Command('status')
  .description('Check translation status')
  .option('-c, --collection <path>', 'Specific collection to check')
  .option('--json', 'Output as JSON')
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

    // Note: Actual status checking requires Firebase Admin SDK
    // This is a placeholder showing the config
    console.log('');
    console.log(chalk.cyan('Melaka Configuration:'));
    console.log('');

    console.log(chalk.white('AI Provider:'));
    console.log(chalk.gray(`  Provider: ${config.ai.provider}`));
    console.log(chalk.gray(`  Model: ${config.ai.model}`));
    console.log(chalk.gray(`  Region: ${config.region || 'us-central1'}`));
    console.log('');

    console.log(chalk.white('Languages:'));
    for (const lang of config.languages) {
      console.log(chalk.gray(`  - ${lang} (${getLanguageName(lang)})`));
    }
    console.log('');

    console.log(chalk.white('Collections:'));
    for (const collection of config.collections) {
      const fields = collection.fields?.join(', ') || 'auto-detect';
      console.log(chalk.gray(`  ${collection.path}`));
      console.log(chalk.gray(`    Fields: ${fields}`));
      if (collection.prompt) {
        const shortPrompt = collection.prompt.length > 50 
          ? collection.prompt.substring(0, 50) + '...'
          : collection.prompt;
        console.log(chalk.gray(`    Prompt: ${shortPrompt}`));
      }
    }
    console.log('');

    if (config.glossary && Object.keys(config.glossary).length > 0) {
      console.log(chalk.white('Shared Glossary:'));
      for (const [term, translation] of Object.entries(config.glossary)) {
        console.log(chalk.gray(`  ${term} → ${translation}`));
      }
      console.log('');
    }

    console.log(chalk.yellow('⚠️  Live status checking requires Firebase connection.'));
    console.log(chalk.gray('   Status will show actual translation progress in Phase 2.'));
  });
