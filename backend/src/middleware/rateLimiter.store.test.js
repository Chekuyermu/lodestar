import { vi, describe, it, expect, beforeEach } from 'vitest';
import { RedisStore } from 'rate-limit-redis';
import { writeRateLimiter } from './rateLimiter.js';

// Mock config
vi.mock('../config.js', () => ({
  default: {
    redisUrl: 'redis://localhost:6379',
    rateLimit: {
      windowMs: 60_000,
      max: 10,
    },
    logLevel: 'info',
    nodeEnv: 'test',
  },
}));

vi.mock('../lib/logger.js', () => ({
  default: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

vi.mock('ioredis', () => ({
    Redis: vi.fn().mockImplementation(() => ({
        sendCommand: vi.fn(),
    })),
}));

vi.mock('rate-limit-redis', () => ({
    RedisStore: vi.fn().mockImplementation((options) => options),
}));

describe('writeRateLimiter RedisStore creation', () => {
  it('creates a new RedisStore instance for each limiter', async () => {
    const limiter1 = writeRateLimiter(10, 60_000);
    const limiter2 = writeRateLimiter(10, 60_000);

    // express-rate-limit internal checks will fail if they shared the same store instance.
    // The implementation now creates a new RedisStore instance for each writeRateLimiter call.
    expect(RedisStore).toHaveBeenCalledTimes(2);
    expect(limiter1.options.store).not.toBe(limiter2.options.store);
  });
});
