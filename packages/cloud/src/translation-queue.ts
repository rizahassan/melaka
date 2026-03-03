/**
 * Translation Queue - Manages translation jobs with Redis.
 */

import Redis from 'ioredis';

export interface TranslationJob {
  id: string;
  projectId: string;
  documentPath: string;
  sourceLocale: string;
  targetLocale: string;
  fields: Record<string, string>;
  glossary?: Record<string, Record<string, string>>;
  createdAt: Date;
  attempts: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  error?: string;
  completedAt?: Date;
}

export interface QueueConfig {
  redisUrl: string;
  maxRetries?: number;
  retryDelayMs?: number;
}

const QUEUE_KEY = 'melaka:jobs:pending';
const PROCESSING_KEY = 'melaka:jobs:processing';
const COMPLETED_KEY = 'melaka:jobs:completed';
const FAILED_KEY = 'melaka:jobs:failed';

export class TranslationQueue {
  private redis: Redis;
  private maxRetries: number;
  private retryDelayMs: number;

  constructor(config: QueueConfig) {
    this.redis = new Redis(config.redisUrl);
    this.maxRetries = config.maxRetries ?? 3;
    this.retryDelayMs = config.retryDelayMs ?? 5000;
  }

  /**
   * Add a job to the queue.
   */
  async enqueue(job: TranslationJob): Promise<void> {
    const jobData = JSON.stringify(job);
    await this.redis.lpush(QUEUE_KEY, jobData);
  }

  /**
   * Get the next job from the queue.
   */
  async dequeue(): Promise<TranslationJob | null> {
    const jobData = await this.redis.rpoplpush(QUEUE_KEY, PROCESSING_KEY);
    if (!jobData) return null;

    const job = JSON.parse(jobData) as TranslationJob;
    job.status = 'processing';
    job.attempts += 1;

    return job;
  }

  /**
   * Mark a job as completed.
   */
  async complete(job: TranslationJob): Promise<void> {
    job.status = 'completed';
    job.completedAt = new Date();

    // Remove from processing
    await this.redis.lrem(PROCESSING_KEY, 1, JSON.stringify({ ...job, status: 'processing' }));

    // Add to completed (with TTL for cleanup)
    await this.redis.lpush(COMPLETED_KEY, JSON.stringify(job));
    await this.redis.ltrim(COMPLETED_KEY, 0, 999); // Keep last 1000
  }

  /**
   * Mark a job as failed.
   */
  async fail(job: TranslationJob, error: string): Promise<void> {
    job.error = error;

    // Remove from processing
    const processingData = JSON.stringify({ ...job, status: 'processing', error: undefined });
    await this.redis.lrem(PROCESSING_KEY, 1, processingData);

    if (job.attempts < this.maxRetries) {
      // Retry: put back in queue with delay
      job.status = 'pending';
      setTimeout(async () => {
        await this.enqueue(job);
      }, this.retryDelayMs * job.attempts);
    } else {
      // Max retries reached: move to failed
      job.status = 'failed';
      await this.redis.lpush(FAILED_KEY, JSON.stringify(job));
      await this.redis.ltrim(FAILED_KEY, 0, 999);
    }
  }

  /**
   * Get queue statistics.
   */
  async getStats(): Promise<{
    pending: number;
    processing: number;
    completed: number;
    failed: number;
  }> {
    const [pending, processing, completed, failed] = await Promise.all([
      this.redis.llen(QUEUE_KEY),
      this.redis.llen(PROCESSING_KEY),
      this.redis.llen(COMPLETED_KEY),
      this.redis.llen(FAILED_KEY),
    ]);

    return { pending, processing, completed, failed };
  }

  /**
   * Get failed jobs.
   */
  async getFailedJobs(limit = 50): Promise<TranslationJob[]> {
    const jobs = await this.redis.lrange(FAILED_KEY, 0, limit - 1);
    return jobs.map((j) => JSON.parse(j) as TranslationJob);
  }

  /**
   * Retry all failed jobs.
   */
  async retryAllFailed(): Promise<number> {
    const failed = await this.getFailedJobs(1000);
    let count = 0;

    for (const job of failed) {
      job.attempts = 0;
      job.status = 'pending';
      job.error = undefined;
      await this.enqueue(job);
      count++;
    }

    // Clear failed queue
    await this.redis.del(FAILED_KEY);

    return count;
  }

  /**
   * Clear all queues (for testing).
   */
  async clearAll(): Promise<void> {
    await Promise.all([
      this.redis.del(QUEUE_KEY),
      this.redis.del(PROCESSING_KEY),
      this.redis.del(COMPLETED_KEY),
      this.redis.del(FAILED_KEY),
    ]);
  }

  /**
   * Close Redis connection.
   */
  async close(): Promise<void> {
    await this.redis.quit();
  }
}
