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
