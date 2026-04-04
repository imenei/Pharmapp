// src/pharmacists/pharmacists.service.ts
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PharmacistsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const [offersCount, suppliersCount, recentOffers, notifCount] = await Promise.all([
      this.prisma.offer.count({ where: { expiresAt: { gte: new Date() } } }),
      this.prisma.user.count({ where: { role: 'supplier', status: 'approved', isActive: true } }),
      this.prisma.offer.findMany({
        where: { expiresAt: { gte: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 5,
        include: {
          supplier: { select: { companyName: true, avatarUrl: true, wilaya: true } },
        },
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { offersCount, suppliersCount, recentOffers, unreadNotifications: notifCount };
  }

  async updateProfile(userId: string, dto: any) {
    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        companyName: dto.companyName,
        address: dto.address,
        wilaya: dto.wilaya,
        phone: dto.phone,
        description: dto.description,
      },
    });
  }
}
