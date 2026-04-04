// src/offers/dto/create-offer.dto.ts
import { IsString, IsDateString } from 'class-validator';
export class CreateOfferDto {
  @IsString() title: string;
  @IsString() description: string;
  @IsDateString() expiresAt: string;
}
