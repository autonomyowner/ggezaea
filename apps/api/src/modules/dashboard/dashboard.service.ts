import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

export interface BiasStats {
  name: string;
  avgIntensity: number;
  count: number;
}

export interface PatternStats {
  name: string;
  avgPercentage: number;
}

@Injectable()
export class DashboardService {
  constructor(private readonly prisma: PrismaService) {}

  async getDashboard(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        usageLimit: true,
        analyses: {
          where: { status: 'COMPLETED' },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!user) {
      throw new Error('User not found');
    }

    const now = new Date();
    const completedAnalyses = user.analyses;
    const totalAnalyses = completedAnalyses.length;

    // Calculate usage
    let analysesThisMonth = 0;
    if (user.usageLimit) {
      if (new Date(user.usageLimit.monthResetAt) > now) {
        analysesThisMonth = user.usageLimit.analysesThisMonth;
      }
    }

    const analysesRemaining =
      user.tier === 'PRO' ? null : Math.max(0, 3 - analysesThisMonth);

    // Get last analysis date
    const lastAnalysis = completedAnalyses[0];
    const lastAnalysisDate = lastAnalysis?.createdAt.toISOString() || null;

    // Calculate profile completion (based on number of analyses)
    const completionPercentage = Math.min(100, Math.round((totalAnalyses / 15) * 100));

    // Aggregate bias statistics
    const biasStats = this.aggregateBiases(completedAnalyses);

    // Aggregate pattern statistics
    const patternStats = this.aggregatePatterns(completedAnalyses);

    // Get recent insights
    const recentInsights = this.getRecentInsights(completedAnalyses.slice(0, 5));

    return {
      profile: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        tier: user.tier,
        memberSince: user.createdAt.toISOString(),
        completionPercentage,
      },
      usage: {
        analysesThisMonth,
        analysesRemaining,
        totalAnalyses,
        lastAnalysisDate,
      },
      stats: {
        topBiases: biasStats.slice(0, 4),
        patterns: patternStats,
      },
      recentInsights,
    };
  }

  private aggregateBiases(analyses: any[]): BiasStats[] {
    const biasMap = new Map<string, { total: number; count: number }>();

    for (const analysis of analyses) {
      if (!analysis.biases) continue;

      const biases = analysis.biases as Array<{ name: string; intensity: number }>;
      for (const bias of biases) {
        const existing = biasMap.get(bias.name) || { total: 0, count: 0 };
        existing.total += bias.intensity;
        existing.count += 1;
        biasMap.set(bias.name, existing);
      }
    }

    return Array.from(biasMap.entries())
      .map(([name, { total, count }]) => ({
        name,
        avgIntensity: Math.round(total / count),
        count,
      }))
      .sort((a, b) => b.avgIntensity - a.avgIntensity);
  }

  private aggregatePatterns(analyses: any[]): PatternStats[] {
    const patternMap = new Map<string, { total: number; count: number }>();

    for (const analysis of analyses) {
      if (!analysis.patterns) continue;

      const patterns = analysis.patterns as Array<{ name: string; percentage: number }>;
      for (const pattern of patterns) {
        const existing = patternMap.get(pattern.name) || { total: 0, count: 0 };
        existing.total += pattern.percentage;
        existing.count += 1;
        patternMap.set(pattern.name, existing);
      }
    }

    return Array.from(patternMap.entries())
      .map(([name, { total, count }]) => ({
        name,
        avgPercentage: Math.round(total / count),
      }))
      .sort((a, b) => b.avgPercentage - a.avgPercentage)
      .slice(0, 4);
  }

  private getRecentInsights(analyses: any[]): string[] {
    const insights: string[] = [];

    for (const analysis of analyses) {
      if (!analysis.insights) continue;

      const analysisInsights = analysis.insights as string[];
      for (const insight of analysisInsights) {
        if (!insights.includes(insight)) {
          insights.push(insight);
        }
        if (insights.length >= 5) break;
      }
      if (insights.length >= 5) break;
    }

    return insights;
  }
}
