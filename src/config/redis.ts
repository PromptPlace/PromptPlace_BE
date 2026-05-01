import { createClient } from 'redis';

const redisClient = createClient({
  url: process.env.REDIS_URL,
});

redisClient.on('connect', () => {
  console.log('Redis connected successfully!');
});

redisClient.on('error', (err) => {
  console.error('Redis connection error:', err);
});

const connectRedis = async () => {
  try {
    await redisClient.connect();
  } catch (error) {
    console.error('Redis 연결 실패, 서버를 다시 확인해주세요.', error);
  }
};

connectRedis();

export default redisClient;
