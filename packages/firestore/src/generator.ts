/**
 * Melaka Firestore - Trigger Generator
 *
 * Generates Cloud Function code for Firestore triggers.
 */

import type { MelakaConfig, CollectionConfig } from '@melaka/core';

/**
 * Options for generating trigger code.
 */
export interface GeneratorOptions {
  /**
   * Output directory for generated files.
   */
  outputDir: string;

  /**
   * Import path for Melaka packages.
   * @default '@melaka/firestore'
   */
  melakaImport?: string;
}

/**
 * Generated file output.
 */
export interface GeneratedFile {
  /**
   * File path relative to output directory.
   */
  path: string;

  /**
   * File content.
   */
  content: string;
}

/**
 * Generate trigger code for all configured collections.
 *
 * @param config - Melaka configuration
 * @param options - Generator options
 * @returns Array of generated files
 */
export function generateTriggers(
  config: MelakaConfig,
  options: GeneratorOptions
): GeneratedFile[] {
  const files: GeneratedFile[] = [];

  // Generate triggers file
  files.push({
    path: 'triggers.ts',
    content: generateTriggersFile(config),
  });

  // Generate task handler file
  files.push({
    path: 'task-handler.ts',
    content: generateTaskHandlerFile(config),
  });

  // Generate index file
  files.push({
    path: 'index.ts',
    content: generateIndexFile(config),
  });

  return files;
}

/**
 * Generate the triggers.ts file content.
 */
function generateTriggersFile(config: MelakaConfig): string {
  const imports = `
import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFunctions } from 'firebase-admin/functions';
import type { CollectionConfig } from '@melaka/core';
`.trim();

  const triggerFunctions = config.collections
    .map((collection) => generateTriggerFunction(collection, config))
    .join('\n\n');

  const enqueueHelper = `
/**
 * Enqueue translation tasks for a document.
 */
async function enqueueTranslation(
  collectionPath: string,
  documentId: string,
  languages: string[],
  config: CollectionConfig,
  batchId: string
): Promise<void> {
  const queue = getFunctions().taskQueue('melakaTranslateTask');

  for (let i = 0; i < languages.length; i++) {
    const language = languages[i];
    await queue.enqueue(
      {
        collectionPath,
        documentId,
        targetLanguage: language,
        config,
        batchId,
      },
      {
        scheduleDelaySeconds: i * 2, // Stagger by 2 seconds
      }
    );
  }
}

/**
 * Generate a unique batch ID.
 */
function generateBatchId(): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  return \`batch_\${timestamp}_\${random}\`;
}
`.trim();

  return `${imports}\n\n${triggerFunctions}\n\n${enqueueHelper}`;
}

/**
 * Generate a single trigger function.
 */
function generateTriggerFunction(
  collection: CollectionConfig,
  config: MelakaConfig
): string {
  const functionName = `melakaTranslate${pascalCase(collection.path)}`;
  const documentPath = collection.isCollectionGroup
    ? `{parentPath}/${collection.path}/{docId}`
    : `${collection.path}/{docId}`;

  const collectionConfigStr = JSON.stringify(collection, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : '  ' + line))
    .join('\n');

  return `
/**
 * Auto-generated trigger for ${collection.path} collection.
 */
export const ${functionName} = onDocumentWritten(
  {
    document: '${documentPath}',
    region: '${config.region || 'us-central1'}',
  },
  async (event) => {
    // Skip deletes
    if (!event.data?.after.exists) {
      return;
    }

    const collectionPath = ${collection.isCollectionGroup ? 'event.data.after.ref.parent.path' : `'${collection.path}'`};
    const documentId = event.params.docId;
    const batchId = generateBatchId();

    const collectionConfig: CollectionConfig = ${collectionConfigStr};

    const languages = ${JSON.stringify(config.languages)};

    await enqueueTranslation(
      collectionPath,
      documentId,
      languages,
      collectionConfig,
      batchId
    );
  }
);
`.trim();
}

/**
 * Generate the task-handler.ts file content.
 */
function generateTaskHandlerFile(config: MelakaConfig): string {
  const apiKeySecret = config.ai.apiKeySecret || 'GEMINI_API_KEY';

  return `
import { onTaskDispatched } from 'firebase-functions/v2/tasks';
import { defineSecret } from 'firebase-functions/params';
import { getFirestore } from 'firebase-admin/firestore';
import { handleTranslationTask } from '@melaka/firestore';
import type { MelakaConfig } from '@melaka/core';

const apiKeySecret = defineSecret('${apiKeySecret}');

/**
 * Melaka configuration.
 * 
 * This is a copy of your melaka.config.ts for runtime use.
 * If you update melaka.config.ts, run \`melaka deploy\` to regenerate.
 */
const config: MelakaConfig = ${JSON.stringify(config, null, 2)};

/**
 * Task handler for processing translation tasks.
 */
export const melakaTranslateTask = onTaskDispatched(
  {
    secrets: [apiKeySecret],
    retryConfig: {
      maxAttempts: 3,
      minBackoffSeconds: 60,
      maxBackoffSeconds: 300,
    },
    rateLimits: {
      maxConcurrentDispatches: ${config.defaults?.maxConcurrency || 10},
    },
    region: '${config.region || 'us-central1'}',
  },
  async (request) => {
    const result = await handleTranslationTask(request.data, {
      firestore: getFirestore(),
      config,
      apiKey: apiKeySecret.value(),
    });

    if (!result.success && !result.skipped) {
      // Throw to trigger retry
      throw new Error(result.error || 'Translation failed');
    }
  }
);
`.trim();
}

/**
 * Generate the index.ts file content.
 */
function generateIndexFile(config: MelakaConfig): string {
  const triggerExports = config.collections
    .map((c) => `melakaTranslate${pascalCase(c.path)}`)
    .join(',\n  ');

  return `
/**
 * Melaka - Auto-generated Cloud Functions
 * 
 * This file exports all Melaka triggers and task handlers.
 * Import these in your main functions/src/index.ts file.
 */

export {
  ${triggerExports},
} from './triggers';

export { melakaTranslateTask } from './task-handler';
`.trim();
}

/**
 * Convert a string to PascalCase.
 */
function pascalCase(str: string): string {
  return str
    .split(/[-_\/]/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join('');
}
