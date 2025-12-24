# Horizontal Scaling Implementation Plan

## Goal
Enable the NestJS backend to run multiple instances behind a load balancer on Render, with shared state via Redis and proper connection pooling.

## Architecture
Replace in-memory rate limiting with Redis-backed storage, add connection pooling for PostgreSQL via Prisma, implement a shared Redis caching layer for AI responses, separate the Bull worker into its own service, and configure Render for multi-instance deployment with health checks.

## Tech Stack
- NestJS 10.4.15
- Prisma 5.22.0 with PostgreSQL
- Redis via ioredis 5.8.2 (already installed)
- Bull 4.16.5 for job queues
- @nestjs/throttler 6.4.0
- Render platform (web services + background worker)

## Tasks

---

### Task 1: Create Redis Module for Shared State

**File:** `apps/api/src/providers/redis/redis.module.ts`

**Implementation:**
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url', 'redis://localhost:6379');
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          enableReadyCheck: true,
          lazyConnect: true,
        });

        redis.on('error', (err) => {
          console.error('Redis connection error:', err.message);
        });

        redis.on('connect', () => {
          console.log('Redis connected');
        });

        return redis;
      },
      inject: [ConfigService],
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): add global Redis module for shared state`

---

### Task 2: Create Redis-backed Throttler Storage

**File:** `apps/api/src/providers/redis/redis-throttler.storage.ts`

**Implementation:**
```typescript
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
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): add Redis-backed throttler storage`

---

### Task 3: Update AppModule to Use Redis Throttler

**File:** `apps/api/src/app.module.ts`

**Implementation:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AnalysesModule } from './modules/analyses/analyses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PlansModule } from './modules/plans/plans.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { ChatModule } from './modules/chat/chat.module';
import { TtsModule } from './modules/tts/tts.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { VoiceModule } from './modules/voice/voice.module';
import { PrismaModule } from './prisma/prisma.module';
import { RedisModule } from './providers/redis/redis.module';
import { RedisThrottlerStorage } from './providers/redis/redis-throttler.storage';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    RedisModule,
    ThrottlerModule.forRootAsync({
      imports: [RedisModule],
      useFactory: (storage: RedisThrottlerStorage) => ({
        throttlers: [
          {
            name: 'short',
            ttl: 1000,
            limit: 3,
          },
          {
            name: 'medium',
            ttl: 60000,
            limit: 60,
          },
          {
            name: 'long',
            ttl: 3600000,
            limit: 1000,
          },
        ],
        storage,
      }),
      inject: [RedisThrottlerStorage],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AnalysesModule,
    DashboardModule,
    PlansModule,
    WebhooksModule,
    ChatModule,
    TtsModule,
    VoiceModule,
    StripeModule,
    HealthModule,
  ],
  controllers: [],
  providers: [
    RedisThrottlerStorage,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): integrate Redis-backed rate limiting`

---

### Task 4: Add Redis Cache Service

**File:** `apps/api/src/providers/redis/cache.service.ts`

**Implementation:**
```typescript
import { Injectable, Inject, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { REDIS_CLIENT } from './redis.module';

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly prefix = 'cache:';

  constructor(@Inject(REDIS_CLIENT) private readonly redis: Redis) {}

  async get<T>(key: string): Promise<T | null> {
    try {
      const data = await this.redis.get(`${this.prefix}${key}`);
      if (!data) return null;
      return JSON.parse(data) as T;
    } catch (error) {
      this.logger.warn(`Cache get error for key ${key}: ${error}`);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttlSeconds: number = 300): Promise<void> {
    try {
      await this.redis.setex(
        `${this.prefix}${key}`,
        ttlSeconds,
        JSON.stringify(value),
      );
    } catch (error) {
      this.logger.warn(`Cache set error for key ${key}: ${error}`);
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.redis.del(`${this.prefix}${key}`);
    } catch (error) {
      this.logger.warn(`Cache delete error for key ${key}: ${error}`);
    }
  }

  async delPattern(pattern: string): Promise<void> {
    try {
      const keys = await this.redis.keys(`${this.prefix}${pattern}`);
      if (keys.length > 0) {
        await this.redis.del(...keys);
      }
    } catch (error) {
      this.logger.warn(`Cache delete pattern error: ${error}`);
    }
  }

  generateKey(...parts: string[]): string {
    return parts.join(':');
  }
}
```

**File:** `apps/api/src/providers/redis/redis.module.ts` (update exports)

**Implementation:**
```typescript
import { Module, Global } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { CacheService } from './cache.service';
import { RedisThrottlerStorage } from './redis-throttler.storage';

export const REDIS_CLIENT = 'REDIS_CLIENT';

@Global()
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: (configService: ConfigService) => {
        const redisUrl = configService.get<string>('redis.url', 'redis://localhost:6379');
        const redis = new Redis(redisUrl, {
          maxRetriesPerRequest: 3,
          retryStrategy: (times) => Math.min(times * 50, 2000),
          enableReadyCheck: true,
          lazyConnect: true,
        });

        redis.on('error', (err) => {
          console.error('Redis connection error:', err.message);
        });

        redis.on('connect', () => {
          console.log('Redis connected');
        });

        return redis;
      },
      inject: [ConfigService],
    },
    CacheService,
    RedisThrottlerStorage,
  ],
  exports: [REDIS_CLIENT, CacheService, RedisThrottlerStorage],
})
export class RedisModule {}
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): add Redis cache service`

---

### Task 5: Enhanced Health Check with Redis

**File:** `apps/api/src/modules/health/health.controller.ts`

**Implementation:**
```typescript
import { Controller, Get, Inject } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { R2StorageService } from '../../providers/storage/r2.service';
import { REDIS_CLIENT } from '../../providers/redis/redis.module';
import Redis from 'ioredis';

@Controller('health')
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly r2Storage: R2StorageService,
    @Inject(REDIS_CLIENT) private readonly redis: Redis,
  ) {}

  @Get()
  async check() {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const allHealthy = dbStatus === 'connected' && redisStatus === 'connected';

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
      services: {
        database: dbStatus,
        redis: redisStatus,
        storage: this.r2Storage.isReady() ? 'configured' : 'not configured',
      },
    };
  }

  @Get('live')
  liveness() {
    return { status: 'ok' };
  }

  @Get('ready')
  async readiness() {
    const [dbStatus, redisStatus] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
    ]);

    const ready = dbStatus === 'connected' && redisStatus === 'connected';

    return {
      ready,
      services: {
        database: dbStatus,
        redis: redisStatus,
      },
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'connected';
    } catch {
      return 'error';
    }
  }

  private async checkRedis(): Promise<string> {
    try {
      await this.redis.ping();
      return 'connected';
    } catch {
      return 'error';
    }
  }
}
```

**File:** `apps/api/src/modules/health/health.module.ts`

**Implementation:**
```typescript
import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { StorageModule } from '../../providers/storage/storage.module';

@Module({
  imports: [StorageModule],
  controllers: [HealthController],
})
export class HealthModule {}
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): add liveness and readiness health probes with Redis check`

---

### Task 6: Implement Graceful Shutdown

**File:** `apps/api/src/main.ts`

**Implementation:**
```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { AppModule } from './app.module';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { LoggingInterceptor } from './common/interceptors/logging.interceptor';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  logger.log('Starting application...');
  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.log(`PORT: ${process.env.PORT || 4000}`);
  logger.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  logger.log(`REDIS_URL exists: ${!!process.env.REDIS_URL}`);

  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Global prefix
  app.setGlobalPrefix('api');

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS configuration
  const allowedOrigins = [
    'http://localhost:3000',
    process.env.FRONTEND_URL?.replace(/\/$/, ''),
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
  ].filter(Boolean) as string[];

  logger.log(`Allowed CORS origins: ${allowedOrigins.join(', ')}`);

  app.enableCors({
    origin: (origin, callback) => {
      if (!origin) {
        callback(null, true);
        return;
      }
      if (allowedOrigins.some(allowed => origin === allowed || origin.endsWith('.vercel.app'))) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 4000;

  // Graceful shutdown handling
  const server = await app.listen(port);

  // Configure server timeouts for graceful shutdown
  server.keepAliveTimeout = 65000; // Slightly higher than ALB idle timeout
  server.headersTimeout = 66000;

  // Handle shutdown signals
  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);

    // Stop accepting new connections
    server.close(async () => {
      logger.log('HTTP server closed');

      try {
        await app.close();
        logger.log('Application closed successfully');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    });

    // Force exit after 30 seconds
    setTimeout(() => {
      logger.error('Forced shutdown after timeout');
      process.exit(1);
    }, 30000);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.log(`Application is running on: http://localhost:${port}`);
  logger.log(`Health check: http://localhost:${port}/api/health`);
  logger.log(`Liveness probe: http://localhost:${port}/api/health/live`);
  logger.log(`Readiness probe: http://localhost:${port}/api/health/ready`);
}

bootstrap();
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): implement graceful shutdown with signal handling`

---

### Task 7: Configure Prisma Connection Pooling

**File:** `apps/api/src/prisma/prisma.service.ts`

**Implementation:**
```typescript
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(private configService: ConfigService) {
    const databaseUrl = configService.get<string>('database.url');

    // Parse and enhance connection string for pooling
    const url = new URL(databaseUrl || 'postgresql://localhost:5432/matcha');

    // Add connection pool parameters if not present
    if (!url.searchParams.has('connection_limit')) {
      url.searchParams.set('connection_limit', '10');
    }
    if (!url.searchParams.has('pool_timeout')) {
      url.searchParams.set('pool_timeout', '10');
    }

    super({
      datasources: {
        db: {
          url: url.toString(),
        },
      },
      log:
        process.env.NODE_ENV === 'development'
          ? ['query', 'info', 'warn', 'error']
          : ['error'],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
      this.logger.log('Successfully connected to database with connection pooling');
    } catch (error) {
      this.logger.error('Failed to connect to database', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    this.logger.log('Disconnecting from database...');
    await this.$disconnect();
    this.logger.log('Disconnected from database');
  }
}
```

**File:** `apps/api/src/prisma/prisma.module.ts`

**Implementation:**
```typescript
import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Global()
@Module({
  providers: [PrismaService],
  exports: [PrismaService],
})
export class PrismaModule {}
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): configure Prisma connection pooling`

---

### Task 8: Create Standalone Worker Entry Point

**File:** `apps/api/src/worker.ts`

**Implementation:**
```typescript
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { WorkerModule } from './worker.module';

async function bootstrap() {
  const logger = new Logger('Worker');

  logger.log('Starting worker process...');
  logger.log(`NODE_ENV: ${process.env.NODE_ENV}`);
  logger.log(`DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);
  logger.log(`REDIS_URL exists: ${!!process.env.REDIS_URL}`);

  const app = await NestFactory.createApplicationContext(WorkerModule);

  app.enableShutdownHooks();

  const shutdown = async (signal: string) => {
    logger.log(`Received ${signal}, starting graceful shutdown...`);

    try {
      await app.close();
      logger.log('Worker closed successfully');
      process.exit(0);
    } catch (error) {
      logger.error('Error during shutdown:', error);
      process.exit(1);
    }
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  logger.log('Worker is running and listening for jobs...');
}

bootstrap();
```

**File:** `apps/api/src/worker.module.ts`

**Implementation:**
```typescript
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './providers/queue/queue.module';
import { AIModule } from './providers/ai/ai.module';
import { AnalysisProcessor } from './modules/analyses/analysis.processor';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    QueueModule,
    AIModule,
  ],
  providers: [AnalysisProcessor],
})
export class WorkerModule {}
```

**File:** `apps/api/package.json` (add worker script)

Add to `scripts`:
```json
"start:worker": "node dist/worker.js",
"start:worker:dev": "npx ts-node src/worker.ts"
```

**File:** `apps/api/nest-cli.json` (configure worker build)

**Implementation:**
```json
{
  "$schema": "https://json.schemastore.org/nest-cli",
  "collection": "@nestjs/schematics",
  "sourceRoot": "src",
  "entryFile": "main",
  "compilerOptions": {
    "deleteOutDir": true,
    "assets": [],
    "watchAssets": true
  },
  "projects": {
    "worker": {
      "type": "application",
      "root": ".",
      "entryFile": "worker",
      "sourceRoot": "src"
    }
  }
}
```

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): add standalone worker process for Bull job processing`

---

### Task 9: Update Render Configuration for Multi-Instance

**File:** `apps/api/render.yaml`

**Implementation:**
```yaml
services:
  # API Service (scalable)
  - type: web
    name: matcha-api
    runtime: node
    region: frankfurt
    plan: starter
    scaling:
      minInstances: 1
      maxInstances: 3
      targetMemoryPercent: 80
      targetCPUPercent: 80
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start:prod
    healthCheckPath: /api/health/ready
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 4000
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        fromService:
          type: redis
          name: matcha-redis
          property: connectionString
      - key: CLERK_SECRET_KEY
        sync: false
      - key: CLERK_PUBLISHABLE_KEY
        sync: false
      - key: CLERK_WEBHOOK_SECRET
        sync: false
      - key: R2_ACCOUNT_ID
        sync: false
      - key: R2_ENDPOINT
        sync: false
      - key: R2_ACCESS_KEY_ID
        sync: false
      - key: R2_SECRET_ACCESS_KEY
        sync: false
      - key: R2_BUCKET_NAME
        sync: false
      - key: FRONTEND_URL
        sync: false
      - key: OPENROUTER_API_KEY
        sync: false
      - key: OPENROUTER_FAST_MODEL
        sync: false
      - key: OPENROUTER_DEEP_MODEL
        sync: false
      - key: VAPI_API_KEY
        sync: false
      - key: VAPI_PUBLIC_KEY
        sync: false
      - key: STRIPE_SECRET_KEY
        sync: false
      - key: STRIPE_WEBHOOK_SECRET
        sync: false

  # Background Worker (separate process)
  - type: worker
    name: matcha-worker
    runtime: node
    region: frankfurt
    plan: starter
    buildCommand: npm install && npx prisma generate && npm run build
    startCommand: npm run start:worker
    envVars:
      - key: NODE_ENV
        value: production
      - key: DATABASE_URL
        sync: false
      - key: REDIS_URL
        fromService:
          type: redis
          name: matcha-redis
          property: connectionString
      - key: OPENROUTER_API_KEY
        sync: false
      - key: OPENROUTER_FAST_MODEL
        sync: false
      - key: FRONTEND_URL
        sync: false

  # Managed Redis
  - type: redis
    name: matcha-redis
    region: frankfurt
    plan: starter
    maxmemoryPolicy: allkeys-lru
    ipAllowList: []
```

**Verification:**
- Check YAML syntax
- Verify all env vars are present

**Commit:** `feat(api): configure Render for horizontal scaling with separate worker`

---

### Task 10: Add AI Response Caching to Chat Service

**File:** `apps/api/src/modules/chat/chat.service.ts`

Find the `sendMessage` method and add caching. Add these imports and inject CacheService:

```typescript
import { CacheService } from '../../providers/redis/cache.service';
import * as crypto from 'crypto';

// In constructor:
constructor(
  private readonly prisma: PrismaService,
  private readonly openRouter: OpenRouterProvider,
  private readonly cacheService: CacheService, // Add this
  // ... other deps
) {}

// Add helper method:
private generateCacheKey(messages: Array<{ role: string; content: string }>): string {
  const hash = crypto
    .createHash('md5')
    .update(JSON.stringify(messages.slice(-5))) // Last 5 messages
    .digest('hex');
  return `chat:${hash}`;
}

// In sendMessage, before calling AI:
const cacheKey = this.generateCacheKey(messagesToSend);
const cached = await this.cacheService.get<ChatWithAnalysisResponse>(cacheKey);
if (cached) {
  this.logger.log('Returning cached AI response');
  // Still save to DB but skip AI call
  // ... handle cached response
}

// After getting AI response:
await this.cacheService.set(cacheKey, aiResponse, 300); // 5 min TTL
```

**Note:** This is a partial implementation guide. The exact changes depend on the current chat.service.ts structure.

**Verification:**
```bash
cd apps/api && npm run build
```

**Commit:** `feat(api): add AI response caching to reduce duplicate calls`

---

### Task 11: Update Chat Module Dependencies

**File:** `apps/api/src/modules/chat/chat.module.ts`

Ensure the module imports RedisModule (it's global, so just verify CacheService is injectable).

**Verification:**
```bash
cd apps/api && npm run build && npm run start:dev
```

Test with:
```bash
curl http://localhost:4000/api/health/ready
```

**Commit:** `feat(api): wire up chat module with Redis caching`

---

## Summary of Changes

| File | Change |
|------|--------|
| `src/providers/redis/redis.module.ts` | New - Global Redis client |
| `src/providers/redis/redis-throttler.storage.ts` | New - Distributed rate limiting |
| `src/providers/redis/cache.service.ts` | New - Generic caching |
| `src/app.module.ts` | Modified - Redis throttler integration |
| `src/main.ts` | Modified - Graceful shutdown |
| `src/prisma/prisma.service.ts` | Modified - Connection pooling |
| `src/modules/health/health.controller.ts` | Modified - Redis health check |
| `src/worker.ts` | New - Worker entry point |
| `src/worker.module.ts` | New - Worker module |
| `render.yaml` | Modified - Multi-service config |
| `package.json` | Modified - Worker scripts |
| `nest-cli.json` | Modified - Worker build config |

## Execution Path

Choose one:

1. **Subagent-Driven Development** - Execute tasks in current session with fresh subagent per task
2. **Parallel Session** - Start new session using `/executing-plans` skill with this plan file

## Verification Checklist

- [ ] `npm run build` passes
- [ ] `npm run start:dev` starts without errors
- [ ] `/api/health` returns database + redis status
- [ ] `/api/health/ready` returns ready: true
- [ ] Rate limiting works across simulated instances
- [ ] Worker processes jobs independently
- [ ] Graceful shutdown completes within 30s
