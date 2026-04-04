// src/suppliers/dto/update-profile.dto.ts
import { IsString, IsOptional } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional() @IsString() companyName?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() wilaya?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() description?: string;
}
