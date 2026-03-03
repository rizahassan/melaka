/**
 * Melaka CLI - Status Command
 *
 * Check translation status for collections with detailed statistics.
 */

import { Command } from 'commander';
import { loadConfig, getLanguageName, MelakaConfig } from '@melaka/core';

interface CollectionStats {
  path: string;
  totalDocs: number;
  languages: {
    [locale: string]: {
      translated: number;
      pending: number;
      failed: number;
      missing: number;
    };
  };
}

interface StatusResult {
  config: {
    provider: string;
    model: string;
    region: string;
    languages: string[];
  };
  collections: CollectionStats[];
  summary: {
    totalDocs: number;
    totalTranslations: number;
    translated: number;
    pending: number;
    failed: number;
    missing: number;
    completionPercent: number;
  };
}

export const statusCommand = new Command('status')
  .description('Check translation status')
  .option('-c, --collection <path>', 'Specific collection to check')
  .option('--json', 'Output as JSON')
  .option('--live', 'Query Firestore for live status (requires Firebase connection)')
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
    const collectionsToCheck = options.collection
      ? config.collections.filter((c) => c.path === options.collection)
      : config.collections;

    if (options.collection && collectionsToCheck.length === 0) {
      console.error(chalk.red(`Collection "${options.collection}" not found in config`));
      process.exit(1);
    }

    // If live mode, query Firestore
    if (options.live) {
      await showLiveStatus(config, collectionsToCheck, options, chalk, ora);
      return;
    }

    // Show config-only status
    showConfigStatus(config, collectionsToCheck, options, chalk);
  });

/**
 * Show config-only status (no Firebase connection needed).
 */
function showConfigStatus(
  config: MelakaConfig,
  collections: typeof config.collections,
  options: { json?: boolean; verbose?: boolean },
  chalk: typeof import('chalk').default
): void {
  if (options.json) {
    console.log(JSON.stringify({
      config: {
        provider: config.ai.provider,
        model: config.ai.model,
        region: config.region || 'us-central1',
        languages: config.languages,
      },
      collections: collections.map((c) => ({
        path: c.path,
        fields: c.fields || [],
        prompt: c.prompt,
      })),
    }, null, 2));
    return;
  }

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
  for (const collection of collections) {
    const fields = collection.fields?.join(', ') || 'auto-detect';
    const groupLabel = collection.isCollectionGroup ? chalk.cyan(' (collection group)') : '';
    console.log(chalk.gray(`  ${collection.path}${groupLabel}`));
    console.log(chalk.gray(`    Fields: ${fields}`));
    if (options.verbose && collection.prompt) {
      console.log(chalk.gray(`    Prompt: ${collection.prompt}`));
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

  console.log(chalk.cyan('💡 Use --live to query Firestore for translation status'));
}

/**
 * Show live status from Firestore.
 */
async function showLiveStatus(
  config: MelakaConfig,
  collections: typeof config.collections,
  options: { json?: boolean; verbose?: boolean },
  chalk: typeof import('chalk').default,
  ora: typeof import('ora').default
): Promise<void> {
  const admin = await import('firebase-admin');

  // Initialize Firebase if not already done
  if (!admin.apps.length) {
    admin.initializeApp();
  }

  const db = admin.getFirestore();
  const statsSpinner = ora('Querying translation status...').start();

  const collectionStats: CollectionStats[] = [];
  let totalDocs = 0;
  let totalTranslations = 0;
  let translated = 0;
  let pending = 0;
  let failed = 0;
  let missing = 0;

  try {
    for (const collectionConfig of collections) {
      // Use collectionGroup query for collection groups
      const query = collectionConfig.isCollectionGroup
        ? db.collectionGroup(collectionConfig.path)
        : db.collection(collectionConfig.path);
      
      const snapshot = await query.get();
      const stats: CollectionStats = {
        path: collectionConfig.path,
        totalDocs: snapshot.size,
        languages: {},
      };

      totalDocs += snapshot.size;

      // Initialize language stats
      for (const lang of config.languages) {
        stats.languages[lang] = {
          translated: 0,
          pending: 0,
          failed: 0,
          missing: 0,
        };
      }

      for (const doc of snapshot.docs) {
        for (const lang of config.languages) {
          totalTranslations++;
          const i18nDoc = await doc.ref.collection('i18n').doc(lang).get();

          if (!i18nDoc.exists) {
            stats.languages[lang].missing++;
            missing++;
          } else {
            const metadata = i18nDoc.data()?._melaka;
            const status = metadata?.status || 'unknown';

            switch (status) {
              case 'translated':
              case 'complete':
                stats.languages[lang].translated++;
                translated++;
                break;
              case 'pending':
                stats.languages[lang].pending++;
                pending++;
                break;
              case 'failed':
                stats.languages[lang].failed++;
                failed++;
                break;
              default:
                // Unknown status - count as translated if has content
                if (Object.keys(i18nDoc.data() || {}).filter(k => k !== '_melaka').length > 0) {
                  stats.languages[lang].translated++;
                  translated++;
                } else {
                  stats.languages[lang].missing++;
                  missing++;
                }
            }
          }
        }
      }

      collectionStats.push(stats);
    }

    statsSpinner.succeed('Retrieved translation status');
  } catch (error) {
    statsSpinner.fail('Failed to query Firestore');
    console.error(chalk.red(error instanceof Error ? error.message : String(error)));
    process.exit(1);
  }

  const completionPercent = totalTranslations > 0
    ? Math.round((translated / totalTranslations) * 100)
    : 0;

  const result: StatusResult = {
    config: {
      provider: config.ai.provider,
      model: config.ai.model,
      region: config.region || 'us-central1',
      languages: config.languages,
    },
    collections: collectionStats,
    summary: {
      totalDocs,
      totalTranslations,
      translated,
      pending,
      failed,
      missing,
      completionPercent,
    },
  };

  if (options.json) {
    console.log(JSON.stringify(result, null, 2));
    return;
  }

  // Display formatted output
  console.log('');
  console.log(chalk.cyan('Translation Status:'));
  console.log('');

  // Summary bar
  const barWidth = 40;
  const filledWidth = Math.round((completionPercent / 100) * barWidth);
  const emptyWidth = barWidth - filledWidth;
  const progressBar = chalk.green('█'.repeat(filledWidth)) + chalk.gray('░'.repeat(emptyWidth));
  console.log(`  ${progressBar} ${completionPercent}%`);
  console.log('');

  // Summary stats
  console.log(chalk.white('Summary:'));
  console.log(chalk.gray(`  Documents: ${totalDocs}`));
  console.log(chalk.gray(`  Languages: ${config.languages.length}`));
  console.log(chalk.green(`  ✓ Translated: ${translated}`));
  if (pending > 0) {
    console.log(chalk.yellow(`  ○ Pending: ${pending}`));
  }
  if (failed > 0) {
    console.log(chalk.red(`  ✗ Failed: ${failed}`));
  }
  if (missing > 0) {
    console.log(chalk.gray(`  - Missing: ${missing}`));
  }
  console.log('');

  // Per-collection breakdown
  if (options.verbose || collectionStats.length > 1) {
    console.log(chalk.white('By Collection:'));
    for (const stats of collectionStats) {
      console.log(chalk.gray(`  ${stats.path} (${stats.totalDocs} docs)`));
      for (const lang of config.languages) {
        const langStats = stats.languages[lang];
        const langTotal = langStats.translated + langStats.pending + langStats.failed + langStats.missing;
        const langPercent = langTotal > 0 ? Math.round((langStats.translated / langTotal) * 100) : 0;

        let statusIcon = chalk.green('✓');
        if (langStats.failed > 0) statusIcon = chalk.red('✗');
        else if (langStats.pending > 0) statusIcon = chalk.yellow('○');
        else if (langStats.missing > 0) statusIcon = chalk.gray('-');

        console.log(chalk.gray(`    ${statusIcon} ${lang}: ${langStats.translated}/${langTotal} (${langPercent}%)`));
      }
    }
    console.log('');
  }

  // Next steps
  if (failed > 0) {
    console.log(chalk.yellow(`⚠️  ${failed} failed translation(s). Run "melaka retry" to retry.`));
  }
  if (pending > 0) {
    console.log(chalk.cyan(`ℹ️  ${pending} translation(s) pending processing.`));
  }
  if (missing > 0) {
    console.log(chalk.cyan(`ℹ️  ${missing} translation(s) not yet created. Run "melaka translate" to process.`));
  }
}
