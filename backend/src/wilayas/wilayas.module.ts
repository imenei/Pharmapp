// src/wilayas/wilayas.module.ts
import { Module } from '@nestjs/common';
import { WilayasController } from './wilayas.controller';
import { WilayasService } from './wilayas.service';
@Module({ controllers: [WilayasController], providers: [WilayasService] })
export class WilayasModule {}
