import { Module } from '@nestjs/common';
import { AnalysesController } from './analyses.controller';
import { AnalysesService } from './analyses.service';
import { AnalysisProcessor } from './analysis.processor';
import { AuthModule } from '../auth/auth.module';
import { QueueModule } from '../../providers/queue/queue.module';
import { AIModule } from '../../providers/ai/ai.module';

@Module({
  imports: [AuthModule, QueueModule, AIModule],
  controllers: [AnalysesController],
  providers: [AnalysesService, AnalysisProcessor],
  exports: [AnalysesService],
})
export class AnalysesModule {}
