import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private service: UsersService) {}

  @Get('me')
  getProfile(@CurrentUser('id') userId: string) {
    return this.service.getProfile(userId);
  }

  @Post('change-password')
  changePassword(
    @CurrentUser('id') userId: string,
    @Body() body: ChangePasswordDto,
  ) {
    return this.service.changePassword(userId, body.currentPassword, body.newPassword);
  }
}
