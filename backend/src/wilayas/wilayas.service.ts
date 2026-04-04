// src/wilayas/wilayas.service.ts
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class WilayasService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    try {
      return await this.prisma.wilaya.findMany({
        orderBy: { nom: 'asc' },
        select: { code: true, nom: true }, // renvoyer uniquement code et nom
      });
    } catch (err) {
      console.error('Erreur lors de la récupération des wilayas:', err);
      throw new InternalServerErrorException('Impossible de récupérer les wilayas');
    }
  }
}