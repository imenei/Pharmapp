// src/offers/offers.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { NotificationType } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { isSupplierFreeAccessActive } from '../common/subscription-access';

@Injectable()
export class OffersService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  private async ensureSupplierSubscriptionApproved(supplierId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: supplierId },
      select: {
        role: true,
        status: true,
        profile: {
          select: {
            subscriptionPayments: {
              select: { createdAt: true },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    if (
      user?.role === 'supplier' &&
      user.status === 'approved' &&
      isSupplierFreeAccessActive(user.profile?.subscriptionPayments[0]?.createdAt)
    ) {
      return;
    }

    const activeSubscription = await this.prisma.subscriptionPayment.findFirst({
      where: {
        userId: supplierId,
        status: 'approved',
        isActive: true,
        subscriptionEnd: { gte: new Date() },
      },
      select: { id: true },
    });

    if (!activeSubscription) {
      throw new ForbiddenException(
        "Action non autorisee. Votre paiement d'abonnement doit etre approuve avant de publier ou modifier du contenu.",
      );
    }
  }

  private async hasActiveGoldSubscription(supplierId: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { id: supplierId },
      select: {
        role: true,
        status: true,
        profile: {
          select: {
            subscriptionPayments: {
              select: { createdAt: true },
              orderBy: { createdAt: 'asc' },
              take: 1,
            },
          },
        },
      },
    });

    if (
      user?.role === 'supplier' &&
      user.status === 'approved' &&
      isSupplierFreeAccessActive(user.profile?.subscriptionPayments[0]?.createdAt)
    ) {
      return true;
    }

    const payment = await this.prisma.subscriptionPayment.findFirst({
      where: {
        userId: supplierId,
        status: 'approved',
        isActive: true,
        subscriptionStart: { lte: new Date() },
        subscriptionEnd: { gte: new Date() },
        subscriptionPlan: { tier: 'gold' },
      },
    });
    return !!payment;
  }

  async findAll(search?: string, wilaya?: string, page = 1, limit = 20) {
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
    if (wilaya) {
      where.supplier.wilaya = wilaya;
    }

    const [offers, total] = await Promise.all([
      this.prisma.offer.findMany({
        where,
        skip,
        take: limit,
        orderBy: [
          { supplier: { subscriptionPayments: { _count: 'desc' } } },
          { createdAt: 'desc' },
        ],
        include: {
          supplier: {
            select: {
              id: true,
              companyName: true,
              address: true,
              wilaya: true,
              phone: true,
              avatarUrl: true,
              description: true,
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
        address: o.supplier.address,
        wilaya: o.supplier.wilaya,
        phone: o.supplier.phone,
        avatarUrl: o.supplier.avatarUrl,
        description: o.supplier.description,
        email: o.supplier.user.email,
        tier: o.supplier.subscriptionPayments[0]?.subscriptionPlan?.tier ?? 'bronze',
      },
    }));

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findBySupplierId(supplierId: string) {
    return this.prisma.offer.findMany({
      where: { supplierId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(supplierId: string, dto: CreateOfferDto, imageUrl?: string, fileUrl?: string) {
    await this.ensureSupplierSubscriptionApproved(supplierId);

    const offer = await this.prisma.offer.create({
      data: {
        supplierId,
        title: dto.title,
        description: dto.description,
        imageUrl,
        fileUrl,
        expiresAt: new Date(dto.expiresAt),
      },
    });

    // 🔔 Notifier tous les pharmaciens si le fournisseur est Gold
    const isGold = await this.hasActiveGoldSubscription(supplierId);
    if (isGold) {
      const profile = await this.prisma.profile.findUnique({
        where: { id: supplierId },
        select: { companyName: true },
      });
      const supplierName = profile?.companyName ?? 'Un fournisseur';

      await this.notificationsService.notifyAllPharmacists(
        ' Nouvelle offre disponible',
        `${supplierName} vient de publier une nouvelle offre : "${offer.title}"`,
        NotificationType.offer,
      );
    }

    return offer;
  }

  async incrementView(id: string) {
    return this.prisma.offer.update({
      where: { id },
      data: { views: { increment: 1 } },
    });
  }

  async delete(id: string, supplierId: string) {
    await this.ensureSupplierSubscriptionApproved(supplierId);
    const offer = await this.prisma.offer.findUnique({ where: { id } });
    if (!offer) throw new NotFoundException('Offre introuvable');
    if (offer.supplierId !== supplierId) throw new ForbiddenException('Non autorisé');
    await this.prisma.offer.delete({ where: { id } });
    return { message: 'Offre supprimée' };
  }
}
