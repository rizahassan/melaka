/**
 * Melaka CLI - Init Command
 *
 * Interactive step-by-step initialization for Melaka configuration.
 */

import { Command } from 'commander';
import { writeFile, access } from 'fs/promises';
import { join } from 'path';

// Common language options with their display names
const LANGUAGE_OPTIONS = [
  { value: 'ms-MY', name: 'Malay (Malaysia)' },
  { value: 'zh-CN', name: 'Chinese (Simplified)' },
  { value: 'zh-TW', name: 'Chinese (Traditional)' },
  { value: 'ja-JP', name: 'Japanese' },
  { value: 'ko-KR', name: 'Korean' },
  { value: 'th-TH', name: 'Thai' },
  { value: 'vi-VN', name: 'Vietnamese' },
  { value: 'id-ID', name: 'Indonesian' },
  { value: 'hi-IN', name: 'Hindi' },
  { value: 'ar-SA', name: 'Arabic' },
  { value: 'es-ES', name: 'Spanish' },
  { value: 'fr-FR', name: 'French' },
  { value: 'de-DE', name: 'German' },
  { value: 'pt-BR', name: 'Portuguese (Brazil)' },
];

// AI provider configurations
const AI_PROVIDERS = {
  gemini: {
    name: 'Google Gemini',
    description: 'Cost-effective, fast translations (recommended)',
    models: [
      { value: 'gemini-3-flash-preview', name: 'Gemini 3 Flash Preview - Fast & affordable (recommended)' },
      { value: 'gemini-2.5-pro', name: 'Gemini 2.5 Pro - Higher quality' },
      { value: 'gemini-2.0-flash', name: 'Gemini 2.0 Flash - Legacy fast model' },
    ],
    secretName: 'GEMINI_API_KEY',
  },
  openai: {
    name: 'OpenAI',
    description: 'High quality, established provider',
    models: [
      { value: 'gpt-4o-mini', name: 'GPT-4o Mini - Cost-effective (recommended)' },
      { value: 'gpt-4o', name: 'GPT-4o - Highest quality' },
      { value: 'gpt-4-turbo', name: 'GPT-4 Turbo - Fast & powerful' },
    ],
    secretName: 'OPENAI_API_KEY',
  },
  claude: {
    name: 'Anthropic Claude',
    description: 'Nuanced, creative translations',
    models: [
      { value: 'claude-sonnet-4-20250514', name: 'Claude Sonnet 4 - Balanced (recommended)' },
      { value: 'claude-opus-4-20250514', name: 'Claude Opus 4 - Premium quality' },
    ],
    secretName: 'CLAUDE_API_KEY',
  },
};

// Firebase regions
const REGION_OPTIONS = [
  { value: 'us-central1', name: 'US Central (Iowa)' },
  { value: 'us-east1', name: 'US East (South Carolina)' },
  { value: 'us-west1', name: 'US West (Oregon)' },
  { value: 'europe-west1', name: 'Europe West (Belgium)' },
  { value: 'europe-west2', name: 'Europe West (London)' },
  { value: 'asia-southeast1', name: 'Asia Southeast (Singapore)' },
  { value: 'asia-east1', name: 'Asia East (Taiwan)' },
  { value: 'asia-northeast1', name: 'Asia Northeast (Tokyo)' },
  { value: 'australia-southeast1', name: 'Australia Southeast (Sydney)' },
];

interface CollectionConfig {
  path: string;
  fields: string[];
  prompt?: string;
}

export const initCommand = new Command('init')
  .description('Initialize Melaka in your Firebase project (interactive)')
  .option('-f, --force', 'Overwrite existing config file')
  .option('-q, --quick', 'Use defaults for quick setup')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;
    const { select, checkbox, input, confirm } = await import('@inquirer/prompts');

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

    console.log('');
    console.log(chalk.bold.cyan('🌏 Welcome to Melaka!'));
    console.log(chalk.gray('   AI-powered localization for Firebase Firestore'));
    console.log('');
    console.log(chalk.dim('   Let\'s set up your translation configuration step by step.'));
    console.log(chalk.dim('   Press Ctrl+C anytime to cancel.'));
    console.log('');

    try {
      // Step 1: Select target languages
      console.log(chalk.bold.white('Step 1/5: Target Languages'));
      console.log(chalk.gray('Which languages do you want to translate your content into?'));
      console.log('');

      const selectedLanguages = await checkbox({
        message: 'Select target languages:',
        choices: LANGUAGE_OPTIONS.map(lang => ({
          value: lang.value,
          name: `${lang.name} (${lang.value})`,
        })),
        required: true,
        instructions: chalk.dim('(Use arrow keys to move, space to select, enter to confirm)'),
      });

      if (selectedLanguages.length === 0) {
        console.log(chalk.red('Please select at least one language.'));
        process.exit(1);
      }

      // Ask for additional custom languages
      const addCustomLanguages = await confirm({
        message: 'Add custom language codes? (BCP 47 format)',
        default: false,
      });

      let customLanguages: string[] = [];
      if (addCustomLanguages) {
        const customInput = await input({
          message: 'Enter additional language codes (comma-separated):',
          transformer: (value) => value.trim(),
        });
        customLanguages = customInput.split(',').map(l => l.trim()).filter(Boolean);
      }

      const languages = [...selectedLanguages, ...customLanguages];

      console.log('');
      console.log(chalk.green(`✓ Selected ${languages.length} language(s): ${languages.join(', ')}`));
      console.log('');

      // Step 2: Select AI provider
      console.log(chalk.bold.white('Step 2/5: AI Provider'));
      console.log(chalk.gray('Choose the AI provider for translations.'));
      console.log('');

      const provider = await select({
        message: 'Select AI provider:',
        choices: Object.entries(AI_PROVIDERS).map(([key, config]) => ({
          value: key,
          name: `${config.name} - ${config.description}`,
        })),
        default: 'gemini',
      }) as keyof typeof AI_PROVIDERS;

      const providerConfig = AI_PROVIDERS[provider];

      console.log('');
      console.log(chalk.green(`✓ Selected: ${providerConfig.name}`));
      console.log('');

      // Step 3: Select model
      console.log(chalk.bold.white('Step 3/5: AI Model'));
      console.log(chalk.gray(`Choose the ${providerConfig.name} model to use.`));
      console.log('');

      const model = await select({
        message: 'Select model:',
        choices: providerConfig.models,
        default: providerConfig.models[0].value,
      });

      console.log('');
      console.log(chalk.green(`✓ Selected: ${model}`));
      console.log('');

      // Step 4: Select region
      console.log(chalk.bold.white('Step 4/5: Firebase Region'));
      console.log(chalk.gray('Select the region for your Firebase Functions (should match your Firestore region).'));
      console.log('');

      const region = await select({
        message: 'Select Firebase region:',
        choices: REGION_OPTIONS,
        default: 'us-central1',
      });

      console.log('');
      console.log(chalk.green(`✓ Selected: ${region}`));
      console.log('');

      // Step 5: Configure collections
      console.log(chalk.bold.white('Step 5/5: Collections'));
      console.log(chalk.gray('Configure the Firestore collections you want to translate.'));
      console.log('');

      const collections: CollectionConfig[] = [];
      let addMoreCollections = true;

      while (addMoreCollections) {
        const collectionPath = await input({
          message: collections.length === 0 
            ? 'Enter collection path (e.g., articles, products):'
            : 'Enter another collection path:',
          validate: (value) => {
            if (!value.trim()) return 'Collection path is required';
            if (collections.some(c => c.path === value.trim())) return 'Collection already added';
            return true;
          },
        });

        const fieldsInput = await input({
          message: `Enter fields to translate in "${collectionPath}" (comma-separated):`,
          default: 'title, content',
          transformer: (value) => value.trim(),
        });

        const fields = fieldsInput.split(',').map(f => f.trim()).filter(Boolean);

        const addPrompt = await confirm({
          message: 'Add a custom prompt for context? (helps improve translation quality)',
          default: false,
        });

        let prompt: string | undefined;
        if (addPrompt) {
          prompt = await input({
            message: 'Enter context prompt:',
            default: 'Content for translation.',
          });
        }

        collections.push({
          path: collectionPath.trim(),
          fields,
          ...(prompt && { prompt }),
        });

        console.log('');
        console.log(chalk.green(`✓ Added collection: ${collectionPath} [${fields.join(', ')}]`));
        console.log('');

        addMoreCollections = await confirm({
          message: 'Add another collection?',
          default: false,
        });
        console.log('');
      }

      // Generate config
      const spinner = ora('Creating melaka.config.ts...').start();

      const configContent = generateConfigTemplate({
        languages,
        provider,
        model,
        apiKeySecret: providerConfig.secretName,
        region,
        collections,
      });

      await writeFile(configPath, configContent);
      spinner.succeed('Created melaka.config.ts');

      // Summary
      console.log('');
      console.log(chalk.green.bold('✨ Melaka initialized successfully!'));
      console.log('');
      console.log(chalk.white.bold('Configuration Summary:'));
      console.log(chalk.gray('  Languages:    ') + languages.join(', '));
      console.log(chalk.gray('  AI Provider:  ') + providerConfig.name);
      console.log(chalk.gray('  Model:        ') + model);
      console.log(chalk.gray('  Region:       ') + region);
      console.log(chalk.gray('  Collections:  ') + collections.map(c => c.path).join(', '));
      console.log('');
      console.log(chalk.white.bold('Next steps:'));
      console.log(chalk.gray('  1. Review your config:'));
      console.log(chalk.cyan('     cat melaka.config.ts'));
      console.log('');
      console.log(chalk.gray('  2. Set up your AI API key:'));
      console.log(chalk.cyan(`     firebase functions:secrets:set ${providerConfig.secretName}`));
      console.log('');
      console.log(chalk.gray('  3. Deploy translation triggers:'));
      console.log(chalk.cyan('     melaka deploy'));
      console.log('');

    } catch (error) {
      // Handle Ctrl+C gracefully
      if ((error as Error).name === 'ExitPromptError') {
        console.log('');
        console.log(chalk.yellow('Setup cancelled.'));
        process.exit(0);
      }
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }
  });

function generateConfigTemplate(config: {
  languages: string[];
  provider: string;
  model: string;
  apiKeySecret: string;
  region: string;
  collections: CollectionConfig[];
}): string {
  const collectionsStr = config.collections
    .map(col => {
      const lines = [
        '    {',
        `      path: '${col.path}',`,
        `      fields: [${col.fields.map(f => `'${f}'`).join(', ')}],`,
      ];
      if (col.prompt) {
        lines.push(`      prompt: '${col.prompt.replace(/'/g, "\\'")}',`);
      }
      lines.push('    },');
      return lines.join('\n');
    })
    .join('\n');

  return `import { defineConfig } from 'melaka';

/**
 * Melaka Configuration
 * 
 * AI-powered localization for your Firestore collections.
 * Generated by: melaka init
 * 
 * @see https://github.com/rizahassan/melaka/blob/main/docs/CONFIGURATION.md
 */
export default defineConfig({
  // Target languages (BCP 47 format)
  languages: [${config.languages.map(l => `'${l}'`).join(', ')}],

  // AI provider configuration
  ai: {
    provider: '${config.provider}',
    model: '${config.model}',
    apiKeySecret: '${config.apiKeySecret}',
    temperature: 0.3,
  },

  // Firebase region (should match your Firestore region)
  region: '${config.region}',

  // Default batch processing settings
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
${collectionsStr}
  ],
});
`;
}

