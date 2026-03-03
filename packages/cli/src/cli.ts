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
import { retryCommand } from './commands/retry';
import { cleanupCommand } from './commands/cleanup';
import { exportCommand } from './commands/export';
import { importCommand } from './commands/import';
import { watchCommand } from './commands/watch';

const program = new Command();

program
  .name('melaka')
  .description('AI-powered localization for Firebase Firestore')
  .version('0.1.0');

// Register commands
program.addCommand(initCommand);
program.addCommand(deployCommand);
program.addCommand(translateCommand);
program.addCommand(statusCommand);
program.addCommand(validateCommand);
program.addCommand(retryCommand);
program.addCommand(cleanupCommand);
program.addCommand(exportCommand);
program.addCommand(importCommand);
program.addCommand(watchCommand);

// Parse arguments
program.parse();
