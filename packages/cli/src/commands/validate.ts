/**
 * Melaka CLI - Validate Command
 *
 * Validate the melaka.config.ts file.
 */

import { Command } from 'commander';
import { loadConfig, configExists, getLanguageName } from '@melaka/core';

export const validateCommand = new Command('validate')
  .description('Validate melaka.config.ts')
  .action(async () => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;

    // Check if config exists
    const existsSpinner = ora('Checking for melaka.config.ts...').start();
    const exists = await configExists();

    if (!exists) {
      existsSpinner.fail('melaka.config.ts not found');
      console.log('');
      console.log(chalk.gray('Run `melaka init` to create one.'));
      process.exit(1);
    }

    existsSpinner.succeed('Found melaka.config.ts');

    // Load and validate
    const validateSpinner = ora('Validating configuration...').start();

    try {
      const config = await loadConfig();
      validateSpinner.succeed('Configuration is valid');

      console.log('');
      console.log(chalk.green('✓ Config file found: melaka.config.ts'));

      // Languages
      const langList = config.languages
        .map((l) => `${l}`)
        .join(', ');
      console.log(chalk.green(`✓ Languages valid: ${langList}`));

      // AI Provider
      console.log(chalk.green(`✓ AI provider configured: ${config.ai.provider} (${config.ai.model})`));

      // Collections
      console.log(chalk.green(`✓ Collections configured: ${config.collections.length}`));
      for (const collection of config.collections) {
        const fieldCount = collection.fields?.length || 'auto';
        const groupFlag = collection.isCollectionGroup ? ' (collection group)' : '';
        console.log(chalk.gray(`    - ${collection.path} (${fieldCount} fields)${groupFlag}`));
      }

      // Glossary
      const glossaryCount = config.glossary ? Object.keys(config.glossary).length : 0;
      console.log(chalk.green(`✓ Glossary entries: ${glossaryCount}`));

      console.log('');
      console.log(chalk.green('✨ Config is valid!'));
      console.log('');
    } catch (error) {
      validateSpinner.fail('Configuration is invalid');
      console.log('');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });
