// src/suppliers/dto/create-rating.dto.ts
import { IsString, IsInt, Min, Max, IsOptional } from 'class-validator';

export class CreateRatingDto {
  @IsString() supplierId: string;
  @IsInt() @Min(1) @Max(5) score: number;
  @IsOptional() @IsString() comment?: string;
}
