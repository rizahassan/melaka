/**
 * Melaka CLI - Deploy Command
 *
 * Generate and deploy Melaka Cloud Functions.
 */

import { Command } from 'commander';
import { writeFile, mkdir, access } from 'fs/promises';
import { join, dirname } from 'path';
import { loadConfig } from '@melaka/core';
import { generateTriggers, type GeneratedFile } from '@melaka/firestore';

export const deployCommand = new Command('deploy')
  .description('Generate and deploy Melaka triggers')
  .option('-o, --output <dir>', 'Output directory for generated files', 'functions/src/melaka')
  .option('--no-firebase', 'Skip Firebase deployment (generate only)')
  .option('--dry-run', 'Show what would be generated without writing')
  .action(async (options) => {
    const chalk = (await import('chalk')).default;
    const ora = (await import('ora')).default;

    // Load config
    const configSpinner = ora('Loading melaka.config.ts...').start();
    let config;

    try {
      config = await loadConfig();
      configSpinner.succeed(`Loaded config: ${config.collections.length} collections, ${config.languages.length} languages`);
    } catch (error) {
      configSpinner.fail('Failed to load config');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    // Generate files
    const genSpinner = ora('Generating Cloud Functions...').start();

    try {
      const files = generateTriggers(config, {
        outputDir: options.output,
      });

      if (options.dryRun) {
        genSpinner.succeed('Generated (dry run)');
        console.log('');
        console.log(chalk.gray('Files that would be created:'));
        for (const file of files) {
          console.log(chalk.cyan(`  ${options.output}/${file.path}`));
        }
        console.log('');
        return;
      }

      // Write files
      await writeGeneratedFiles(files, options.output);
      genSpinner.succeed(`Generated ${files.length} files in ${options.output}/`);
    } catch (error) {
      genSpinner.fail('Failed to generate files');
      console.error(chalk.red(error instanceof Error ? error.message : String(error)));
      process.exit(1);
    }

    // Deploy to Firebase (unless --no-firebase)
    if (options.firebase !== false) {
      console.log('');
      console.log(chalk.yellow('📦 To deploy to Firebase, run:'));
      console.log(chalk.cyan('   firebase deploy --only functions'));
      console.log('');
      console.log(chalk.gray('Or add the exports to your functions/src/index.ts:'));
      console.log(chalk.gray(`   export * from './melaka';`));
    }

    // Show summary
    console.log('');
    console.log(chalk.green('✨ Melaka triggers generated!'));
    console.log('');
    console.log('Generated triggers:');
    for (const collection of config.collections) {
      const name = `melakaTranslate${pascalCase(collection.path)}`;
      console.log(chalk.gray(`  - ${name} → ${collection.path}`));
    }
    console.log(chalk.gray('  - melakaTranslateTask (task handler)'));
    console.log('');
  });

/**
 * Write generated files to disk.
 */
async function writeGeneratedFiles(
  files: GeneratedFile[],
  outputDir: string
): Promise<void> {
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true });

  for (const file of files) {
    const filePath = join(outputDir, file.path);
    const fileDir = dirname(filePath);

    // Ensure parent directory exists
    await mkdir(fileDir, { recursive: true });

    await writeFile(filePath, file.content);
  }
}

/**
 * Convert string to PascalCase.
 */
function pascalCase(str: string): string {
  return str
    .split(/[-_\/]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}
