import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        usageLimit: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return this.formatUser(user);
  }

  async update(id: string, data: UpdateUserDto) {
    const user = await this.prisma.user.update({
      where: { id },
      data: {
        firstName: data.firstName,
      },
      include: {
        usageLimit: true,
      },
    });

    return this.formatUser(user);
  }

  private formatUser(user: any) {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    // Check if usage limit needs reset
    let analysesThisMonth = 0;
    if (user.usageLimit) {
      if (new Date(user.usageLimit.monthResetAt) <= now) {
        // Month has passed, reset count
        analysesThisMonth = 0;
      } else {
        analysesThisMonth = user.usageLimit.analysesThisMonth;
      }
    }

    const analysesRemaining =
      user.tier === 'PRO' ? null : Math.max(0, 3 - analysesThisMonth);

    return {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      tier: user.tier,
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
      usage: {
        analysesThisMonth,
        analysesRemaining,
      },
    };
  }
}
