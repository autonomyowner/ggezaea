import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  Query,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { AnalysesService } from './analyses.service';
import { ClerkAuthGuard, AuthenticatedUser } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { createAnalysisSchema } from './dto/create-analysis.dto';

@Controller('analyses')
@UseGuards(ClerkAuthGuard)
export class AnalysesController {
  constructor(private readonly analysesService: AnalysesService) {}

  @Post()
  async create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = createAnalysisSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    return this.analysesService.create(user.id, result.data);
  }

  @Get()
  async findAll(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const pageNum = Math.max(1, parseInt(page || '1', 10));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit || '10', 10)));

    return this.analysesService.findAll(user.id, pageNum, limitNum);
  }

  @Get(':id')
  async findOne(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
  ) {
    return this.analysesService.findOne(user.id, id);
  }
}
