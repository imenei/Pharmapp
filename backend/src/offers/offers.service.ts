// src/offers/offers.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateOfferDto } from './dto/create-offer.dto';

@Injectable()
export class OffersService {
  constructor(private prisma: PrismaService) {}

  // All active offers for pharmacists (single JOIN query, no N+1)
  async findAll(search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const now = new Date();

    const where: any = {
      expiresAt: { gte: now },
      supplier: { user: { status: 'approved', isActive: true } },
    };
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          // Gold suppliers first
          { supplier: { subscriptionPayments: { _count: 'desc' } } },
          { createdAt: 'desc' },
        ],
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              wilaya: true,
              avatarUrl: true,
              user: { select: { email: true } },
              subscriptionPayments: {
                where: { status: 'approved', isActive: true },
                select: { subscriptionPlan: { select: { tier: true } } },
                take: 1,
                orderBy: { createdAt: 'desc' },
              },
            },
          },
        },
      }),
      this.prisma.offer.count({ where }),
    ]);

    const data = offers.map((o) => ({
      id: o.id,
      title: o.title,
      description: o.description,
      imageUrl: o.imageUrl,
      fileUrl: o.fileUrl,
      views: o.views,
      createdAt: o.createdAt,
      expiresAt: o.expiresAt,
      supplier: {
        id: o.supplier.id,
        name: o.supplier.companyName,
        wilaya: o.supplier.wilaya,
        avatarUrl: o.supplier.avatarUrl,
        email: o.supplier.user.email,
        tier: o.supplier.subscriptionPayments[0]?.subscriptionPlan?.tier ?? 'bronze',
      },
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // Supplier's own offers
  async findBySupplierId(supplierId: string) {
    return this.prisma.offer.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(supplierId: string, dto: CreateOfferDto, imageUrl?: string, fileUrl?: string) {
    return this.prisma.offer.create({
      data: {
        supplierId,
        title: dto.title,
        description: dto.description,
        imageUrl,
        fileUrl,
        expiresAt: new Date(dto.expiresAt),
      },
    });
  }

  async incrementView(id: string) {
    return this.prisma.offer.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async delete(id: string, supplierId: string) {
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.supplierId !== supplierId) throw new ForbiddenException('Non autorisé');
    await this.prisma.offer.delete({ where: { id } });
    return { message: 'Offre supprimée' };
  }
}
