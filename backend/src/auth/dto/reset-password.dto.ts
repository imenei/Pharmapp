import { IsString, MinLength } from 'class-validator';

export class ResetPasswordDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caracteres' })
  newPassword: string;
}
