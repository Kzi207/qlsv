import type { NextFunction, Request, Response } from 'express';

type RateLimitOptions = {
  keyPrefix?: string;
  windowMs: number;
  max: number;
  message?: string;
  skip?: (req: Request) => boolean;
};

type RateLimitBucket = {
  count: number;
  resetAt: number;
};

const buckets = new Map<string, RateLimitBucket>();

const normalizeIp = (value: string) =>
  String(value || '')
    .trim()
    .replace(/^::ffff:/, '')
    .replace(/^::1$/, '127.0.0.1')
    .toLowerCase();

const getClientKey = (req: Request) => {
  const forwarded = req.headers['x-forwarded-for'];
  const rawForwarded = Array.isArray(forwarded) ? forwarded[0] || '' : String(forwarded || '');
  const forwardedIp = rawForwarded.split(',')[0]?.trim() || '';
  const ip = normalizeIp(forwardedIp || String(req.ip || 'unknown'));
  return ip || 'unknown';
};

const pruneExpiredBuckets = (now: number) => {
  for (const [key, bucket] of buckets.entries()) {
    if (bucket.resetAt <= now) {
      buckets.delete(key);
    }
  }
};

export const createRateLimitMiddleware = (options: RateLimitOptions) => {
  const keyPrefix = options.keyPrefix || 'rate-limit';
  const message = options.message || 'Too many requests, please try again later.';

  return (req: Request, res: Response, next: NextFunction) => {
    if (options.skip?.(req)) {
      return next();
    }

    const now = Date.now();
    if (Math.random() < 0.02) {
      pruneExpiredBuckets(now);
    }

    const key = `${keyPrefix}:${getClientKey(req)}`;
    const existing = buckets.get(key);

    if (!existing || existing.resetAt <= now) {
      buckets.set(key, {
        count: 1,
        resetAt: now + options.windowMs,
      });
      return next();
    }

    existing.count += 1;

    if (existing.count > options.max) {
      const retryAfterSeconds = Math.max(Math.ceil((existing.resetAt - now) / 1000), 1);
      res.setHeader('Retry-After', String(retryAfterSeconds));
      return res.status(429).json({ message });
    }

    return next();
  };
};

