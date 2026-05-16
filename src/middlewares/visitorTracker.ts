import { Request, Response, NextFunction } from 'express';
import {
  computeVisitorId,
  isBotUserAgent,
  recordVisit,
} from '../utils/visitor-tracking';

const SKIP_PATH_PREFIXES = [
  '/health',
  '/api-docs',
  '/uploads',
  '/api/notifications/sse',
];

const SKIP_METHODS = new Set(['OPTIONS', 'HEAD']);

export const visitorTracker = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (SKIP_METHODS.has(req.method)) return next();
  if (SKIP_PATH_PREFIXES.some((prefix) => req.path.startsWith(prefix))) {
    return next();
  }
  if (isBotUserAgent(req.headers['user-agent'])) return next();

  res.on('finish', () => {
    if (res.statusCode >= 400) return;
    void recordVisit(computeVisitorId(req));
  });

  next();
};
