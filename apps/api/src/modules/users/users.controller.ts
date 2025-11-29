import {
  Controller,
  Get,
  Patch,
  Body,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { ClerkAuthGuard, AuthenticatedUser } from '../auth/guards/clerk-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { updateUserSchema, UpdateUserDto } from './dto/update-user.dto';

@Controller('users')
@UseGuards(ClerkAuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@CurrentUser() user: AuthenticatedUser) {
    return this.usersService.findById(user.id);
  }

  @Patch('me')
  async updateMe(
    @CurrentUser() user: AuthenticatedUser,
    @Body() body: unknown,
  ) {
    const result = updateUserSchema.safeParse(body);

    if (!result.success) {
      throw new BadRequestException(result.error.format());
    }

    return this.usersService.update(user.id, result.data);
  }
}
