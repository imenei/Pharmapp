// src/pharmacists/pharmacists.controller.ts
import { Controller, Get, Patch, Body, UseGuards } from '@nestjs/common';
import { PharmacistsService } from './pharmacists.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('pharmacists')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('pharmacist')
export class PharmacistsController {
  constructor(private service: PharmacistsService) {}

  @Get('dashboard')
  getDashboard(@CurrentUser('id') userId: string) {
    return this.service.getDashboardStats(userId);
  }

  @Patch('profile')
  updateProfile(@CurrentUser('id') userId: string, @Body() body: any) {
    return this.service.updateProfile(userId, body);
  }
}
