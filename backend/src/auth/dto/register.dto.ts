// src/auth/dto/register.dto.ts
import { IsEmail, IsString, MinLength, IsEnum, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalide' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  password: string;

  @IsEnum(['pharmacist', 'supplier'], { message: 'Rôle invalide' })
  role: 'pharmacist' | 'supplier';

  @IsString()
  companyName: string;

  @IsString()
  wilaya: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  address?: string;

  // URL du fichier registre de commerce uploadé via multer
  @IsOptional()
  @IsString()
  registerUrl?: string;
}
