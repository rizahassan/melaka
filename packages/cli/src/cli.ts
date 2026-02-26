#!/usr/bin/env node
/**
 * Melaka CLI
 *
 * Command-line interface for Melaka - AI-powered Firestore localization.
 */

import { Command } from 'commander';
import { initCommand } from './commands/init';
import { deployCommand } from './commands/deploy';
import { translateCommand } from './commands/translate';
import { statusCommand } from './commands/status';
import { validateCommand } from './commands/validate';

const program = new Command();

program
  .name('melaka')
  .description('AI-powered localization for Firebase Firestore')
  .version('0.0.0');

// Register commands
program.addCommand(initCommand);
program.addCommand(deployCommand);
program.addCommand(translateCommand);
program.addCommand(statusCommand);
program.addCommand(validateCommand);

// Parse arguments
program.parse();
