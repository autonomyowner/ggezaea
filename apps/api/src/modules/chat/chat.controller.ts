import {
  Controller,
  Get,
  Post,
  Delete,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { Throttle } from '@nestjs/throttler';
import { ChatService } from './chat.service';
import { EmdrService } from './emdr.service';
import { ClerkAuthGuard, AuthenticatedUser } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { sendMessageSchema, createConversationSchema } from './dto/chat.dto';
import {
  sendEmdrMessageSchema,
  updateEmdrPhaseSchema,
  completeEmdrSessionSchema,
} from './dto/emdr.dto';
import { z } from 'zod';

@Controller('chat')
@UseGuards(ClerkAuthGuard)
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly emdrService: EmdrService,
  ) {}

  @Post('conversations')
  async createConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = createConversationSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.chatService.createConversation(user.id, result.data);
  }

  @Get('conversations')
  async getConversations(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || '20', 10)));
    return this.chatService.getConversations(user.id, pageNum, limitNum);
  }

  @Get('usage')
  async getUsage(@CurrentUser() user: AuthenticatedUser) {
    const remaining = await this.chatService.getRemainingMessages(user.id, user.tier);
    return {
      tier: user.tier,
      messagesRemaining: remaining,
      limit: user.tier === 'FREE' ? 50 : null,
    };
  }

  @Get('conversations/:id')
  async getConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.chatService.getConversation(user.id, id);
  }

  @Delete('conversations/:id')
  async deleteConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.chatService.deleteConversation(user.id, id);
  }

  @Patch('conversations/:id')
  async updateConversation(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() body: unknown,
  ) {
    const schema = z.object({ title: z.string().max(200) });
    const result = schema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.chatService.updateConversationTitle(user.id, id, result.data.title);
  }

  @Post('send')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 messages per minute max
  async sendMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = sendMessageSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.chatService.sendMessage(user.id, user.tier, result.data);
  }

  @Post('send/stream')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 messages per minute max
  async sendMessageStream(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
    @Res() res: Response,
  ) {
    const result = sendMessageSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    // Set up SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no');
    res.status(HttpStatus.OK);

    try {
      await this.chatService.sendMessageStream(
        user.id,
        user.tier,
        result.data,
        (chunk: string) => {
          res.write(`data: ${JSON.stringify({ type: 'chunk', content: chunk })}\n\n`);
        },
        (finalData: any) => {
          res.write(`data: ${JSON.stringify({ type: 'done', ...finalData })}\n\n`);
          res.end();
        },
      );
    } catch (error) {
      res.write(`data: ${JSON.stringify({ type: 'error', message: error.message })}\n\n`);
      res.end();
    }
  }

  // ==================== EMDR Flash Technique Endpoints ====================

  @Post('emdr/start')
  @Throttle({ default: { limit: 5, ttl: 60000 } }) // 5 sessions per minute max
  async startEmdrSession(@CurrentUser() user: AuthenticatedUser) {
    return this.emdrService.startSession(user.id, user.tier);
  }

  @Post('emdr/send')
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 messages per minute max
  async sendEmdrMessage(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = sendEmdrMessageSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.emdrService.sendMessage(user.id, user.tier, result.data);
  }

  @Get('emdr/:conversationId')
  async getEmdrSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
  ) {
    return this.emdrService.getSession(user.id, conversationId);
  }

  @Patch('emdr/:conversationId/phase')
  async updateEmdrPhase(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
    @Body() body: unknown,
  ) {
    const result = updateEmdrPhaseSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.emdrService.updatePhase(user.id, conversationId, result.data);
  }

  @Post('emdr/:conversationId/complete')
  async completeEmdrSession(
    @CurrentUser() user: AuthenticatedUser,
    @Param('conversationId') conversationId: string,
    @Body() body: unknown,
  ) {
    const result = completeEmdrSessionSchema.safeParse(body);
    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }
    return this.emdrService.completeSession(user.id, conversationId, result.data);
  }
}
