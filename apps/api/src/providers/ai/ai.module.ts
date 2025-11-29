import { Module } from '@nestjs/common';
import { MockAIProvider } from './mock-ai.provider';

// AI_PROVIDER token for dependency injection
export const AI_PROVIDER = 'AI_PROVIDER';

@Module({
  providers: [
    MockAIProvider,
    {
      provide: AI_PROVIDER,
      useExisting: MockAIProvider,
    },
  ],
  exports: [AI_PROVIDER, MockAIProvider],
})
export class AIModule {}
