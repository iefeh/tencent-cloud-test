import Redis from 'ioredis';

// export const redis = new Redis(process.env.REDIS_URI as string);

const globalForRedis = global as unknown as { redis?: Redis };

if (!globalForRedis.redis || globalForRedis.redis.status == "end") {
  console.log(`[Redis] - Init redis`)
  globalForRedis.redis = new Redis(process.env.REDIS_URI as string);
}

export const redis = globalForRedis.redis;