import { createHash } from 'crypto';
import { Request } from 'express';
import redisClient from '../config/redis';

const HLL_KEY_PREFIX = 'visitors:hll:';
const HLL_TTL_SECONDS = 60 * 60 * 24 * 400;
const KST_OFFSET_MS = 9 * 60 * 60 * 1000;

const BOT_UA_PATTERN =
  /bot|crawl|spider|scrape|preview|monitor|uptime|curl|wget|python-requests|node-fetch|axios|http-client|libwww|java\/|okhttp/i;

export const toKstDateString = (date: Date): string =>
  new Date(date.getTime() + KST_OFFSET_MS).toISOString().slice(0, 10);

export const buildHllKey = (kstDate: string): string =>
  `${HLL_KEY_PREFIX}${kstDate}`;

export const isBotUserAgent = (ua: string | undefined): boolean => {
  if (!ua) return true;
  return BOT_UA_PATTERN.test(ua);
};

export const getClientIp = (req: Request): string => {
  const xff = req.headers['x-forwarded-for'];
  if (typeof xff === 'string' && xff.length > 0) {
    return xff.split(',')[0].trim();
  }
  return req.ip || req.socket.remoteAddress || 'unknown';
};

const hashIp = (ip: string): string => {
  const salt = process.env.VISITOR_HASH_SALT ?? '';
  return createHash('sha256').update(`${ip}:${salt}`).digest('hex').slice(0, 24);
};

export const computeVisitorId = (req: Request): string => {
  const userId = (req.user as { user_id?: number } | undefined)?.user_id;
  if (userId) {
    return `u:${userId}`;
  }
  return `i:${hashIp(getClientIp(req))}`;
};

export const recordVisit = async (
  visitorId: string,
  date: Date = new Date(),
): Promise<void> => {
  try {
    const key = buildHllKey(toKstDateString(date));
    await redisClient.pfAdd(key, visitorId);
    await redisClient.expire(key, HLL_TTL_SECONDS);
  } catch (error) {
    console.error('[visitor-tracking] failed to record visit', {
      visitorId,
      error,
    });
  }
};
