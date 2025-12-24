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
