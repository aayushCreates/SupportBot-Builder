import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

const redis = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

export const verifyRedisConnection = async () => {
  try {
    await redis.ping();
    console.log('Redis connection successful ✅✅✅');
  } catch (error) {
    console.error('Failed to connect to Redis ❌❌❌');
    throw error;
  }
};

export default redis;
