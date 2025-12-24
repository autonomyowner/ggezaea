import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from '@nestjs/common';
import { Prisma, PrismaClient } from '@prisma/client';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor(configService: ConfigService) {
    // Build connection URL with pooling parameters
    const databaseUrl = configService.get<string>('database.url') || '';
    let connectionUrl = databaseUrl;

    try {
      const url = new URL(databaseUrl || 'postgresql://localhost:5432/matcha');
      // Add connection pool parameters if not present
      if (!url.searchParams.has('connection_limit')) {
        url.searchParams.set('connection_limit', '10');
      }
      if (!url.searchParams.has('pool_timeout')) {
        url.searchParams.set('pool_timeout', '10');
      }
      connectionUrl = url.toString();
    } catch {
      // Use original URL if parsing fails
    }

    const logConfig: Prisma.LogLevel[] =
      process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'];

    super({
      datasources: {
        db: {
          url: connectionUrl,
        },
      },
      log: logConfig,
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
