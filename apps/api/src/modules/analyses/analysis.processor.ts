import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import { Job } from 'bull';
import { PrismaService } from '../../prisma/prisma.service';
import { AI_PROVIDER } from '../../providers/ai/ai.module';
import { AIProvider } from '../../providers/ai/ai.types';

interface AnalysisJobData {
  analysisId: string;
  inputText: string;
}

@Processor('analysis')
export class AnalysisProcessor {
  private readonly logger = new Logger(AnalysisProcessor.name);

  constructor(
    private readonly prisma: PrismaService,
    @Inject(AI_PROVIDER) private readonly aiProvider: AIProvider,
  ) {}

  @Process('process')
  async handleAnalysis(job: Job<AnalysisJobData>) {
    const { analysisId, inputText } = job.data;
    const startTime = Date.now();

    this.logger.log(`Processing analysis: ${analysisId}`);

    // Update status to PROCESSING
    await this.prisma.analysis.update({
      where: { id: analysisId },
      data: { status: 'PROCESSING' },
    });

    try {
      // Call AI provider
      const result = await this.aiProvider.analyze(inputText);

      const processingTime = Date.now() - startTime;

      // Update with results
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'COMPLETED',
          biases: JSON.parse(JSON.stringify(result.biases)),
          patterns: JSON.parse(JSON.stringify(result.patterns)),
          insights: JSON.parse(JSON.stringify(result.insights)),
          emotionalState: JSON.parse(JSON.stringify(result.emotionalState)),
          processingTime,
          completedAt: new Date(),
        },
      });

      this.logger.log(
        `Analysis completed: ${analysisId} (${processingTime}ms)`,
      );

      return { success: true, analysisId };
    } catch (error) {
      this.logger.error(`Analysis failed: ${analysisId}`, error);

      // Update with error
      await this.prisma.analysis.update({
        where: { id: analysisId },
        data: {
          status: 'FAILED',
          errorMessage:
            error instanceof Error ? error.message : 'Unknown error',
        },
      });

      throw error;
    }
  }
}
