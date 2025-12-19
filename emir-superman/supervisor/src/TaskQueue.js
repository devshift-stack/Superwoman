
const { Queue, Worker } = require('bullmq');
const Redis = require('ioredis');

class TaskQueue {
  constructor(redisUrl) {
    this.redisUrl = redisUrl;
    this.redis = null;
    this.queue = null;
    this.worker = null;
    this.resultRedis = null; // Separate connection for blocking calls
  }

  async initialize() {
    console.log('📋 Initialisiere Task Queue...');
    this.redis = new Redis(this.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });
    this.resultRedis = new Redis(this.redisUrl, { maxRetriesPerRequest: null, enableReadyCheck: false });
    this.queue = new Queue('supervisor-tasks', { connection: this.redis });
    console.log('✅ Task Queue initialisiert');
  }

  async startWorker(handler) {
    if (this.worker) return;

    this.worker = new Worker(
      'supervisor-tasks',
      async (job) => {
        console.log(`🔄 Verarbeite Job: ${job.id} - ${job.data.type}`);
        const result = await handler(job.data);
        // Store the result in Redis with an expiration
        await this.resultRedis.set(`task-result:${job.id}`, JSON.stringify(result), 'EX', 3600); // 1-hour expiration
        return result;
      },
      {
        connection: this.redis,
        concurrency: 5,
      }
    );

    this.worker.on('completed', (job) => {
      console.log(`✅ Job abgeschlossen: ${job.id}`);
    });

    this.worker.on('failed', (job, err) => {
      console.error(`❌ Job fehlgeschlagen: ${job.id}`, err);
      // Store error information as well
      const errorResult = { error: err.message, stack: err.stack };
      this.resultRedis.set(`task-result:${job.id}`, JSON.stringify(errorResult), 'EX', 3600);
    });

    console.log('✅ Task Queue Worker gestartet');
  }

  async add(task) {
    const job = await this.queue.add('task', task);
    return job.id;
  }

  async getTaskResult(taskId, timeout = 30000) {
    const startTime = Date.now();
    const resultKey = `task-result:${taskId}`;

    while (Date.now() - startTime < timeout) {
        const result = await this.resultRedis.get(resultKey);
        if (result) {
            // Once we have a result, we can remove it from Redis
            await this.resultRedis.del(resultKey);
            return JSON.parse(result);
        }
        // Wait for a short period before polling again
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    throw new Error(`Timeout waiting for task result: ${taskId}`);
  }

  async getStatus() {
    return {
      waiting: await this.queue.getWaitingCount(),
      active: await this.queue.getActiveCount(),
      completed: await this.queue.getCompletedCount(),
      failed: await this.queue.getFailedCount(),
    };
  }

  async shutdown() {
    if (this.worker) await this.worker.close();
    if (this.queue) await this.queue.close();
    if (this.redis) await this.redis.quit();
    if (this.resultRedis) await this.resultRedis.quit();
    console.log('✅ Task Queue beendet');
  }
}

module.exports = TaskQueue;
