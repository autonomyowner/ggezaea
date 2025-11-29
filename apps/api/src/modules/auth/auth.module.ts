import { Module } from '@nestjs/common';
import { ClerkService } from './clerk.service';
import { ClerkAuthGuard } from './guards/clerk-auth.guard';

@Module({
  providers: [ClerkService, ClerkAuthGuard],
  exports: [ClerkService, ClerkAuthGuard],
})
export class AuthModule {}
