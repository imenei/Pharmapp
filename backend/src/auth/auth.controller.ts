// src/auth/auth.controller.ts
import {
  Controller, Post, Get, Body, UseGuards, Request,
  HttpCode, UseInterceptors, UploadedFile, BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { RefreshDto } from './dto/refresh.dto';
import { Public } from '../common/decorators/public.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { getUploadDir } from '../common/uploads';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ── Register — accepts multipart/form-data with optional file ─────────────
  @Public()
  @Post('register')
  @UseInterceptors(
    FileInterceptor('registerFile', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, getUploadDir()),
        filename: (_req, file, cb) =>
          cb(null, `register-${Date.now()}${extname(file.originalname)}`),
      }),
      fileFilter: (_req, file, cb) => {
        const allowed = ['.jpg', '.jpeg', '.png', '.pdf'];
        const ext = extname(file.originalname).toLowerCase();
        if (allowed.includes(ext)) cb(null, true);
        else cb(new BadRequestException('Format non accepté (JPG, PNG, PDF uniquement)'), false);
      },
      limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
    }),
  )
  register(
    @Body() dto: RegisterDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    // If a file was uploaded, set its URL in the DTO
    if (file) {
      dto.registerUrl = `/uploads/${file.filename}`;
    }
    return this.authService.register(dto);
  }

  // ── Login ─────────────────────────────────────────────────────────────────
  @Public()
  @UseGuards(AuthGuard('local'))
  @Post('login')
  @HttpCode(200)
  login(@Request() req: any) {
    return this.authService.login(req.user);
  }

  // ── Refresh token ─────────────────────────────────────────────────────────
  @Public()
  @Post('refresh')
  @HttpCode(200)
  refresh(@Body() dto: RefreshDto) {
    return this.authService.refreshTokens(dto.refreshToken);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  @Post('logout')
  @HttpCode(200)
  logout(@Body() dto: RefreshDto) {
    return this.authService.logout(dto.refreshToken);
  }

  // ── Get current user ──────────────────────────────────────────────────────
  @Get('me')
  getMe(@CurrentUser('id') userId: string) {
    return this.authService.getMe(userId);
  }
}
