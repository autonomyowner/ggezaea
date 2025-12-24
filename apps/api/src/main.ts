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
    rawBody: true, // Required for webhook signature verification
  });

  // Enable graceful shutdown hooks
  app.enableShutdownHooks();

  // Global prefix
  app.setGlobalPrefix('api');

  // Global filters
  app.useGlobalFilters(new HttpExceptionFilter());

  // Global interceptors
  app.useGlobalInterceptors(new LoggingInterceptor());

  // CORS - support multiple origins
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
      if (
        allowedOrigins.some(
          (allowed) => origin === allowed || origin.endsWith('.vercel.app'),
        )
      ) {
        callback(null, true);
      } else {
        logger.warn(`CORS blocked origin: ${origin}`);
        callback(null, false);
      }
    },
    credentials: true,
  });

  const port = process.env.PORT || 4000;

  // Start server with graceful shutdown
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
