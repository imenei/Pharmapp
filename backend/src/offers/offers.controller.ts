// src/offers/offers.controller.ts
import {
  Controller, Get, Post, Delete, Body, Param, Query,
  UseGuards, UseInterceptors, UploadedFiles,
  ParseIntPipe, DefaultValuePipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { OffersService } from './offers.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { RolesGuard } from '../common/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { CreateOfferDto } from './dto/create-offer.dto';
import { getUploadDir } from '../common/uploads';

const storage = diskStorage({
  destination: getUploadDir(),
  filename: (req, file, cb) => cb(null, `offer-${Date.now()}${extname(file.originalname)}`),
});

@Controller('offers')
@UseGuards(JwtAuthGuard, RolesGuard)
export class OffersController {
  constructor(private service: OffersService) {}

  @Get()
  @Roles('pharmacist', 'admin', 'supplier')
  findAll(
    @Query('search') search?: string,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page = 1,
    @Query('limit', new DefaultValuePipe(20), ParseIntPipe) limit = 20,
  ) {
    return this.service.findAll(search, page, limit);
  }

  @Get('my')
  @Roles('supplier')
  getMy(@CurrentUser('id') userId: string) {
    return this.service.findBySupplierId(userId);
  }

  @Post()
  @Roles('supplier')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'image', maxCount: 1 }, { name: 'file', maxCount: 1 }],
      { storage, limits: { fileSize: 20 * 1024 * 1024 } },
    ),
  )
  create(
    @CurrentUser('id') userId: string,
    @Body() dto: CreateOfferDto,
    @UploadedFiles() files: { image?: Express.Multer.File[]; file?: Express.Multer.File[] },
  ) {
    const imageUrl = files.image?.[0] ? `/uploads/${files.image[0].filename}` : undefined;
    const fileUrl = files.file?.[0] ? `/uploads/${files.file[0].filename}` : undefined;
    return this.service.create(userId, dto, imageUrl, fileUrl);
  }

  @Post(':id/view')
  @Roles('pharmacist', 'admin')
  view(@Param('id') id: string) {
    return this.service.incrementView(id);
  }

  @Delete(':id')
  @Roles('supplier')
  delete(@Param('id') id: string, @CurrentUser('id') userId: string) {
    return this.service.delete(id, userId);
  }
}
