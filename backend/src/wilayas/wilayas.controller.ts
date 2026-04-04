// src/wilayas/wilayas.controller.ts
import { Controller, Get } from '@nestjs/common';
import { WilayasService } from './wilayas.service';
import { Public } from '../common/decorators/public.decorator';

@Controller('wilayas')
export class WilayasController {
  constructor(private readonly wilayasService: WilayasService) {}

  @Public()
  @Get()
  async findAll() {
    return await this.wilayasService.findAll();
  }
}