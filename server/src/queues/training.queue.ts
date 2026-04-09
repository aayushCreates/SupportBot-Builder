import Bull from 'bull';
import { trainBot } from '../services/training.service';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const trainingQueue = new Bull('training', REDIS_URL);

// Worker process
trainingQueue.process(async (job) => {
  const { botId } = job.data;
  console.log(`Processing training job for bot: ${botId}`);
  await trainBot(botId);
  return { success: true };
});

export const addTrainingJob = async (botId: string) => {
  return await trainingQueue.add({ botId }, {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 5000,
    },
    removeOnComplete: true,
  });
};
