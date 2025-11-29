import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { Analysis } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAnalysisDto } from './dto/create-analysis.dto';

const FREE_MONTHLY_LIMIT = 3;

@Injectable()
export class AnalysesService {
  private readonly logger = new Logger(AnalysesService.name);

  constructor(
    private readonly prisma: PrismaService,
    @InjectQueue('analysis') private readonly analysisQueue: Queue,
  ) {}

  async create(userId: string, dto: CreateAnalysisDto) {
    // Check usage limits
    await this.checkUsageLimit(userId);

    // Create analysis record
    const analysis = await this.prisma.analysis.create({
      data: {
        userId,
        inputText: dto.inputText,
        status: 'PENDING',
      },
    });

    // Increment usage count
    await this.incrementUsage(userId);

    // Queue the analysis job
    await this.analysisQueue.add(
      'process',
      {
        analysisId: analysis.id,
        inputText: dto.inputText,
      },
      {
        jobId: analysis.id,
      },
    );

    this.logger.log(`Analysis queued: ${analysis.id}`);

    return this.formatAnalysis(analysis);
  }

  async findAll(userId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;

    const [analyses, total] = await Promise.all([
      this.prisma.analysis.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.analysis.count({ where: { userId } }),
    ]);

    return {
      data: analyses.map((a: Analysis) => this.formatAnalysis(a)),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(userId: string, id: string) {
    const analysis = await this.prisma.analysis.findFirst({
      where: {
        id,
        userId,
      },
    });

    if (!analysis) {
      throw new NotFoundException('Analysis not found');
    }

    return this.formatAnalysis(analysis);
  }

  async checkUsageLimit(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { usageLimit: true },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Pro users have unlimited analyses
    if (user.tier === 'PRO') {
      return;
    }

    const now = new Date();
    const usageLimit = user.usageLimit;

    if (!usageLimit) {
      // No usage record yet, user can proceed
      return;
    }

    // Check if month has reset
    if (new Date(usageLimit.monthResetAt) <= now) {
      // Month has passed, reset the counter
      await this.prisma.usageLimit.update({
        where: { userId },
        data: {
          analysesThisMonth: 0,
          monthResetAt: this.getNextMonthReset(),
        },
      });
      return;
    }

    // Check if limit reached
    if (usageLimit.analysesThisMonth >= FREE_MONTHLY_LIMIT) {
      throw new ForbiddenException(
        `Monthly analysis limit reached (${FREE_MONTHLY_LIMIT}). Upgrade to Pro for unlimited analyses.`,
      );
    }
  }

  private async incrementUsage(userId: string) {
    const now = new Date();
    const nextReset = this.getNextMonthReset();

    await this.prisma.usageLimit.upsert({
      where: { userId },
      update: {
        analysesThisMonth: { increment: 1 },
      },
      create: {
        userId,
        analysesThisMonth: 1,
        monthResetAt: nextReset,
      },
    });
  }

  private getNextMonthReset(): Date {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth() + 1, 1);
  }

  private formatAnalysis(analysis: Analysis) {
    return {
      id: analysis.id,
      status: analysis.status,
      inputText: analysis.inputText,
      biases: analysis.biases,
      patterns: analysis.patterns,
      insights: analysis.insights,
      emotionalState: analysis.emotionalState,
      processingTime: analysis.processingTime,
      errorMessage: analysis.errorMessage,
      createdAt: analysis.createdAt.toISOString(),
      completedAt: analysis.completedAt?.toISOString() || null,
    };
  }
}
