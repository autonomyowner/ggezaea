import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClerkClient } from '@clerk/clerk-sdk-node';

interface VerifiedUser {
  userId: string;
  email: string;
  firstName: string | null;
}

@Injectable()
export class ClerkService {
  private readonly logger = new Logger(ClerkService.name);
  private readonly clerk;

  constructor(private readonly configService: ConfigService) {
    const secretKey = this.configService.get<string>('clerk.secretKey');

    if (!secretKey) {
      this.logger.warn('Clerk secret key not configured');
    }

    this.clerk = createClerkClient({ secretKey });
  }

  async verifyToken(token: string): Promise<VerifiedUser | null> {
    try {
      const payload = await this.clerk.verifyToken(token);

      // Get full user details to get email
      const user = await this.clerk.users.getUser(payload.sub);

      return {
        userId: payload.sub,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || null,
      };
    } catch (error) {
      this.logger.error('Token verification failed', error);
      return null;
    }
  }

  async getUser(userId: string) {
    try {
      const user = await this.clerk.users.getUser(userId);
      return {
        id: user.id,
        email: user.emailAddresses[0]?.emailAddress || '',
        firstName: user.firstName || null,
        lastName: user.lastName || null,
        imageUrl: user.imageUrl,
        createdAt: new Date(user.createdAt),
      };
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}`, error);
      return null;
    }
  }
}
