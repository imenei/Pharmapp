// src/listings/listings.controller.ts
import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseInterceptors, UploadedFile, ParseIntPipe, DefaultValuePipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { ListingsService } from './listings.service';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { Public } from '../common/decorators/public.decorator';

// Ensure upload dir exists at startup
const getUploadDir = () => {
  const dir = process.env.UPLOAD_DIR || join(process.cwd(), 'uploads');
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
  return dir;
};

@Controller('listings')
export class ListingsController {
  constructor(private service: ListingsService) {}

  // ── Supplier: upload PDF listing ────────────────────────────────────────────
  @Post()
  @Roles('supplier')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (_req, _file, cb) => cb(null, getUploadDir()),
        filename: (_req, file, cb) => {
          const unique = `listing-${Date.now()}-${Math.round(Math.random() * 1e6)}`;
          cb(null, `${unique}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (_req, file, cb) => {
        if (
          file.mimetype === 'application/pdf' ||
          file.originalname.toLowerCase().endsWith('.pdf')
        ) {
          cb(null, true);
        } else {
          cb(new BadRequestException('Seuls les fichiers PDF sont acceptés'), false);
        }
      },
      limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB
    }),
  )
  create(
    @CurrentUser('id') userId: string,
    @Body('title') title: string,
    @Body('description') description: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('Fichier PDF manquant');
    return this.service.create(userId, title, description, file);
  }

  // ── Pharmacist: search listings by product names ───────────────────────────
  @Post('search')
  @Roles('pharmacist', 'admin')
  search(
    @Body('products') products: string[],
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.service.searchByProducts(products, page, limit);
  }

  // ── Supplier: get own listings ─────────────────────────────────────────────
  @Get('my')
  @Roles('supplier')
  getMy(@CurrentUser('id') userId: string) {
    return this.service.findBySupplierId(userId);
  }

  // ── Track view ─────────────────────────────────────────────────────────────
  @Post(':id/view')
  @Roles('pharmacist', 'admin', 'supplier')
  view(@Param('id') id: string) {
    return this.service.incrementView(id);
  }

  // ── Download ───────────────────────────────────────────────────────────────
  @Post(':id/download')
  @Roles('pharmacist', 'admin', 'supplier')
  download(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.download(id, userId);
  }

  // ── Delete listing ─────────────────────────────────────────────────────────
  @Delete(':id')
  @Roles('supplier')
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.delete(id, userId);
  }
}
