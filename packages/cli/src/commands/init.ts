/**
 * Melaka CLI - Init Command
 *
 * Initialize a new melaka.config.ts in the current project.
 */

import { Command } from 'commander';
import { writeFile, access } from 'fs/promises';
import { join } from 'path';

export const initCommand = new Command('init')
  .description('Initialize Melaka in your Firebase project')
  .option('-f, --force', 'Overwrite existing config file')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;

    const configPath = join(process.cwd(), 'melaka.config.ts');

    // Check if config already exists
    try {
      await access(configPath);
      if (!options.force) {
        console.log(chalk.yellow('⚠️  melaka.config.ts already exists.'));
        console.log(chalk.gray('   Use --force to overwrite.'));
        return;
      }
    } catch {
      // File doesn't exist, continue
    }

    const spinner = ora('Creating melaka.config.ts...').start();

    try {
      await writeFile(configPath, CONFIG_TEMPLATE);
      spinner.succeed('Created melaka.config.ts');

      console.log('');
      console.log(chalk.green('✨ Melaka initialized!'));
      console.log('');
      console.log('Next steps:');
      console.log(chalk.gray('  1. Edit melaka.config.ts with your collections'));
      console.log(chalk.gray('  2. Set up your AI API key:'));
      console.log(chalk.cyan('     firebase functions:secrets:set GEMINI_API_KEY'));
      console.log(chalk.gray('  3. Deploy triggers:'));
      console.log(chalk.cyan('     melaka deploy'));
      console.log('');
    } catch (error) {
      spinner.fail('Failed to create config file');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

const CONFIG_TEMPLATE = `import { defineConfig } from 'melaka';

/**
 * Melaka Configuration
 * 
 * Configure your Firestore collections for automatic AI translation.
 * 
 * @see https://github.com/rizahassan/melaka/blob/main/docs/CONFIGURATION.md
 */
export default defineConfig({
  // Target languages (BCP 47 format)
  languages: ['ms-MY', 'zh-CN'],

  // AI provider configuration
  ai: {
    provider: 'gemini',
    model: 'gemini-2.5-flash',
    apiKeySecret: 'GEMINI_API_KEY', // Firebase secret name
    temperature: 0.3,
  },

  // Firebase region (should match your Firestore region)
  region: 'us-central1',

  // Default settings for all collections
  defaults: {
    batchSize: 20,
    maxConcurrency: 10,
    forceUpdate: false,
  },

  // Shared glossary (optional)
  // Terms here are used consistently across all collections
  glossary: {
    // 'brand_name': 'Brand Name', // Don't translate
  },

  // Collections to translate
  collections: [
    {
      path: 'articles',
      fields: ['title', 'content', 'summary'],
      prompt: 'Blog article content. Maintain markdown formatting.',
    },
    // Add more collections as needed:
    // {
    //   path: 'products',
    //   fields: ['name', 'description'],
    //   prompt: 'E-commerce product descriptions.',
    // },
  ],
});
`;
