import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { HealthModule } from './modules/health/health.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { AnalysesModule } from './modules/analyses/analyses.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PlansModule } from './modules/plans/plans.module';
import { WebhooksModule } from './modules/webhooks/webhooks.module';
import { PrismaModule } from './prisma/prisma.module';
import configuration from './config/configuration';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    AnalysesModule,
    DashboardModule,
    PlansModule,
    WebhooksModule,
    HealthModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
