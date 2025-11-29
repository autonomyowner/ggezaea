import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { Request } from 'express';
import { ClerkService } from '../clerk.service';
import { PrismaService } from '../../../prisma/prisma.service';

export interface AuthenticatedUser {
  id: string;
  email: string;
  firstName: string | null;
  tier: 'FREE' | 'PRO';
}

export interface AuthenticatedRequest extends Request {
  user: AuthenticatedUser;
}

@Injectable()
export class ClerkAuthGuard implements CanActivate {
  private readonly logger = new Logger(ClerkAuthGuard.name);

  constructor(
    private readonly clerkService: ClerkService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request);

    if (!token) {
      throw new UnauthorizedException('No authorization token provided');
    }

    const clerkUser = await this.clerkService.verifyToken(token);

    if (!clerkUser) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    // Get or create user in database
    let user = await this.prisma.user.findUnique({
      where: { id: clerkUser.userId },
    });

    if (!user) {
      // Auto-create user on first API call
      this.logger.log(`Creating new user: ${clerkUser.userId}`);
      user = await this.prisma.user.create({
        data: {
          id: clerkUser.userId,
          email: clerkUser.email || '',
          firstName: clerkUser.firstName,
          tier: 'FREE',
        },
      });
    }

    // Attach user to request
    request.user = {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      tier: user.tier,
    };

    return true;
  }

  private extractToken(request: Request): string | null {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      return null;
    }

    const [type, token] = authHeader.split(' ');

    if (type !== 'Bearer' || !token) {
      return null;
    }

    return token;
  }
}
