// src/suppliers/dto/subscription.dto.ts
import { IsString } from 'class-validator';
export class SubscriptionDto {
  @IsString() planId: string;
}
