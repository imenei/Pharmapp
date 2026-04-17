// src/suppliers/suppliers.controller.ts
import {
  Controller, Get, Post, Patch, Param, Query, Body,
  UseGuards, UseInterceptors, UploadedFile, ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateRatingDto } from './dto/create-rating.dto';
import { SubscriptionDto } from './dto/subscription.dto';
import { Public } from '../common/decorators/public.decorator';
import { getUploadDir } from '../common/uploads';

@Controller('suppliers')
export class SuppliersController {
  constructor(private service: SuppliersService) {}

  // ── Route PUBLIQUE — pas de guard ──────────────────────────────────────
  @Get('gold')
  @Public()

  getGold() {
    return this.service.getGoldSuppliers();
  }

  // ── Routes protégées ───────────────────────────────────────────────────
  @Get()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pharmacist', 'admin', 'supplier')
  findAll(
    @Query('wilaya') wilaya?: string,
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.service.findAll(wilaya, search, page, limit);
  }

  @Get('plans')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier', 'admin')
  getPlans() {
    return this.service.getPlans();
  }

  @Get('me/stats')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  getMyStats(@CurrentUser('id') userId: string) {
    return this.service.getStats(userId);
  }

  @Get('me/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  getMySubscription(@CurrentUser('id') userId: string) {
    return this.service.getCurrentSubscription(userId);
  }

  @Patch('me/profile')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: getUploadDir(),
        filename: (req, file, cb) =>
          cb(null, `avatar-${Date.now()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 5 * 1024 * 1024 },
    }),
  )
  updateProfile(
    @CurrentUser('id') userId: string,
    @Body() dto: UpdateProfileDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const avatarUrl = file ? `/uploads/${file.filename}` : undefined;
    return this.service.updateProfile(userId, dto, avatarUrl);
  }

  @Post('me/subscription')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('supplier')
  @UseInterceptors(
    FileInterceptor('proof', {
      storage: diskStorage({
        destination: getUploadDir(),
        filename: (req, file, cb) =>
          cb(null, `proof-${Date.now()}${extname(file.originalname)}`),
      }),
      limits: { fileSize: 10 * 1024 * 1024 },
    }),
  )
  submitSubscription(
    @CurrentUser('id') userId: string,
    @Body() dto: SubscriptionDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const proofUrl = `/uploads/${file.filename}`;
    return this.service.submitSubscription(userId, dto.planId, proofUrl);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pharmacist', 'admin', 'supplier')
  findOne(@Param('id') id: string) {
    return this.service.findOne(id);
  }

  @Post('ratings')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('pharmacist')
  createRating(@CurrentUser('id') userId: string, @Body() dto: CreateRatingDto) {
    return this.service.createRating(userId, dto);
  }
}
