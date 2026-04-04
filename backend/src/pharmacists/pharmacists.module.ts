// src/pharmacists/pharmacists.module.ts
import { Module } from '@nestjs/common';
import { PharmacistsController } from './pharmacists.controller';
import { PharmacistsService } from './pharmacists.service';
@Module({ controllers: [PharmacistsController], providers: [PharmacistsService] })
export class PharmacistsModule {}
