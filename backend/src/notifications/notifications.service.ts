// src/notifications/notifications.service.ts
import { Injectable } from '@nestjs/common';
import { NotificationType } from '@prisma/client'; // ← ajouter cet import
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NotificationsService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string, limit = 20, unreadOnly = false) {
    const where: any = { userId };
    if (unreadOnly) where.isRead = false;
    const [notifications, unreadCount] = await Promise.all([
      this.prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
      }),
      this.prisma.notification.count({ where: { userId, isRead: false } }),
    ]);
    return { notifications, unreadCount, total: notifications.length };
  }

  async markRead(id: string, userId: string) {
    return this.prisma.notification.updateMany({
      where: { id, userId },
      data: { isRead: true },
    });
  }

  async markAllRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  }

  async delete(id: string, userId: string) {
    await this.prisma.notification.deleteMany({ where: { id, userId } });
    return { message: 'Notification supprimée' };
  }

  async create(userId: string, title: string, message: string, type: NotificationType = NotificationType.info) {
    return this.prisma.notification.create({
      data: { userId, title, message, type },
    });
  }

  async createBulk(userIds: string[], title: string, message: string, type: NotificationType = NotificationType.info) {
    return this.prisma.notification.createMany({
      data: userIds.map((userId) => ({ userId, title, message, type })),
    });
  }

  async notifyAllPharmacists(
    title: string,
    message: string,
    type: NotificationType = NotificationType.info,
  ): Promise<void> {
    const pharmacists = await this.prisma.user.findMany({ // ← this.prisma, pas le paramètre
      where: {
        role: 'pharmacist',
        status: 'approved',
        isActive: true,
      },
      select: { id: true },
    });

    if (pharmacists.length === 0) return;

    await this.prisma.notification.createMany({
      data: pharmacists.map((p) => ({
        userId: p.id,
        title,
        message,
        type,
      })),
    });
  }
}