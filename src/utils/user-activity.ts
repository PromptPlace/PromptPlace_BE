import redisClient from '../config/redis';
import prisma from '../config/prisma';

const THROTTLE_SECONDS = 300;

export const recordUserActivity = async (userId: number): Promise<void> => {
  try {
    const key = `user_active:${userId}`;
    const setResult = await redisClient.set(key, '1', {
      NX: true,
      EX: THROTTLE_SECONDS,
    });

    if (setResult !== 'OK') {
      return;
    }

    await prisma.user.update({
      where: { user_id: userId },
      data: { last_active_at: new Date() },
    });
  } catch (error) {
    console.error('[user-activity] failed to record activity', {
      userId,
      error,
    });
  }
};
