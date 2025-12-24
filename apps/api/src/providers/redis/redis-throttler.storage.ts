import { Injectable, Inject, OnModuleDestroy } from '@nestjs/common';
import { ThrottlerStorage } from '@nestjs/throttler';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

interface ThrottlerStorageRecord {
  totalHits: number;
  timeToExpire: number;
  isBlocked: boolean;
  timeToBlockExpire: number;
}

@Injectable()
export class RedisThrottlerStorage implements ThrottlerStorage, OnModuleDestroy {
  private readonly prefix = 'throttle:';
  private shutdownHooks: (() => Promise<void>)[] = [];

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async increment(
    key: string,
    ttl: number,
    limit: number,
    blockDuration: number,
    throttlerName: string,
  ): Promise<ThrottlerStorageRecord> {
    const redisKey = `${this.prefix}${throttlerName}:${key}`;
    const blockKey = `${this.prefix}${throttlerName}:block:${key}`;

    // Check if blocked
    const blockedTtl = await this.redis.ttl(blockKey);
    if (blockedTtl > 0) {
      return {
        totalHits: limit + 1,
        timeToExpire: ttl,
        isBlocked: true,
        timeToBlockExpire: blockedTtl * 1000,
      };
    }

    // Increment counter
    const hits = await this.redis.incr(redisKey);

    // Set expiry on first hit
    if (hits === 1) {
      await this.redis.expire(redisKey, Math.ceil(ttl / 1000));
    }

    const currentTtl = await this.redis.ttl(redisKey);

    // Block if over limit
    if (hits > limit && blockDuration > 0) {
      await this.redis.setex(blockKey, Math.ceil(blockDuration / 1000), '1');
      return {
        totalHits: hits,
        timeToExpire: currentTtl * 1000,
        isBlocked: true,
        timeToBlockExpire: blockDuration,
      };
    }

    return {
      totalHits: hits,
      timeToExpire: currentTtl * 1000,
      isBlocked: false,
      timeToBlockExpire: 0,
    };
  }

  addShutdownHook(hook: () => Promise<void>): void {
    this.shutdownHooks.push(hook);
  }

  async onModuleDestroy(): Promise<void> {
    for (const hook of this.shutdownHooks) {
      await hook();
    }
  }
}
