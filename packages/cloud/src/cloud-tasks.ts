/**
 * Cloud Tasks integration for Melaka Cloud.
 * Uses Google Cloud Tasks for reliable job processing.
 */

import { CloudTasksClient, protos } from '@google-cloud/tasks';

export interface CloudTasksConfig {
  projectId: string;
  location: string;
  queueName: string;
  serviceUrl: string; // URL of the task handler service
  serviceAccountEmail?: string;
}

export interface TaskPayload {
  jobId: string;
  projectId: string;
  documentPath: string;
  sourceLocale: string;
  targetLocale: string;
  fields: Record<string, string>;
  attempt?: number;
}

export class MelakaCloudTasks {
  private client: CloudTasksClient;
  private config: CloudTasksConfig;
  private queuePath: string;

  constructor(config: CloudTasksConfig) {
    this.client = new CloudTasksClient();
    this.config = config;
    this.queuePath = this.client.queuePath(
      config.projectId,
      config.location,
      config.queueName
    );
  }

  /**
   * Enqueue a translation job.
   */
  async enqueueTranslation(payload: TaskPayload, delaySeconds?: number): Promise<string> {
    const task: protos.google.cloud.tasks.v2.ITask = {
      httpRequest: {
        httpMethod: 'POST',
        url: `${this.config.serviceUrl}/api/tasks/translate`,
        headers: {
          'Content-Type': 'application/json',
        },
        body: Buffer.from(JSON.stringify(payload)).toString('base64'),
      },
    };

    // Add OIDC token for authentication if service account is provided
    if (this.config.serviceAccountEmail) {
      task.httpRequest!.oidcToken = {
        serviceAccountEmail: this.config.serviceAccountEmail,
        audience: this.config.serviceUrl,
      };
    }

    // Schedule with delay if specified
    if (delaySeconds && delaySeconds > 0) {
      task.scheduleTime = {
        seconds: Math.floor(Date.now() / 1000) + delaySeconds,
      };
    }

    const [response] = await this.client.createTask({
      parent: this.queuePath,
      task,
    });

    return response.name || '';
  }

  /**
   * Enqueue multiple translation jobs with staggered delays.
   */
  async enqueueBatch(
    payloads: TaskPayload[],
    options?: {
      delayBetweenMs?: number;
      maxConcurrent?: number;
    }
  ): Promise<string[]> {
    const delayBetween = options?.delayBetweenMs ?? 100;
    const taskNames: string[] = [];

    for (let i = 0; i < payloads.length; i++) {
      const delaySeconds = Math.floor((i * delayBetween) / 1000);
      const taskName = await this.enqueueTranslation(payloads[i], delaySeconds);
      taskNames.push(taskName);
    }

    return taskNames;
  }

  /**
   * Create the queue if it doesn't exist.
   */
  async ensureQueue(): Promise<void> {
    const parent = this.client.locationPath(this.config.projectId, this.config.location);

    try {
      await this.client.getQueue({ name: this.queuePath });
      console.log(`Queue ${this.config.queueName} already exists`);
    } catch (error: unknown) {
      if ((error as { code?: number }).code === 5) {
        // NOT_FOUND
        await this.client.createQueue({
          parent,
          queue: {
            name: this.queuePath,
            rateLimits: {
              maxDispatchesPerSecond: 10,
              maxConcurrentDispatches: 5,
            },
            retryConfig: {
              maxAttempts: 3,
              minBackoff: { seconds: 60 },
              maxBackoff: { seconds: 300 },
            },
          },
        });
        console.log(`Created queue ${this.config.queueName}`);
      } else {
        throw error;
      }
    }
  }

  /**
   * Pause the queue.
   */
  async pauseQueue(): Promise<void> {
    await this.client.pauseQueue({ name: this.queuePath });
  }

  /**
   * Resume the queue.
   */
  async resumeQueue(): Promise<void> {
    await this.client.resumeQueue({ name: this.queuePath });
  }

  /**
   * Purge all tasks from the queue.
   */
  async purgeQueue(): Promise<void> {
    await this.client.purgeQueue({ name: this.queuePath });
  }
}
