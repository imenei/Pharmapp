// src/suppliers/suppliers.service.ts
import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { CreateRatingDto } from './dto/create-rating.dto';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  // ── List approved suppliers with aggregated stats (single optimized query) ──
  async findAll(wilaya?: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;

    const where: any = {
      user: { role: 'supplier', status: 'approved', isActive: true },
    };
    if (wilaya) where.wilaya = wilaya;
    if (search) {
      where.OR = [
        { companyName: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [suppliers, total] = await Promise.all([
      this.prisma.profile.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          companyName: true,
          address: true,
          wilaya: true,
          avatarUrl: true,
          description: true,
          user: { select: { email: true, createdAt: true } },
          // Aggregated stats in one query (no N+1)
          _count: { select: { listings: true, offers: true } },
          ratingsReceived: {
            select: { score: true },
          },
          subscriptionPayments: {
            where: { status: 'approved', isActive: true },
            select: {
              subscriptionPlan: { select: { name: true, tier: true } },
              subscriptionEnd: true,
            },
            take: 1,
            orderBy: { createdAt: 'desc' },
          },
        },
        orderBy: { user: { createdAt: 'desc' } },
      }),
      this.prisma.profile.count({ where }),
    ]);

    const data = suppliers.map((s) => {
      const scores = s.ratingsReceived.map((r) => r.score);
      const avgRating = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;
      const activeSub = s.subscriptionPayments[0];
      return {
        id: s.id,
        companyName: s.companyName,
        address: s.address,
        wilaya: s.wilaya,
        avatarUrl: s.avatarUrl,
        description: s.description,
        email: s.user.email,
        memberSince: s.user.createdAt,
        listingsCount: s._count.listings,
        activeOffersCount: s._count.offers,
        rating: Math.round(avgRating * 10) / 10,
        reviewsCount: scores.length,
        subscriptionTier: activeSub?.subscriptionPlan?.tier ?? null,
        subscriptionName: activeSub?.subscriptionPlan?.name ?? null,
        hasActiveSubscription: !!activeSub && new Date(activeSub.subscriptionEnd) > new Date(),
      };
    });

    return { data, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  // ── Get single supplier profile with full details ──────────────────────────
  async findOne(id: string) {
    const profile = await this.prisma.profile.findFirst({
      where: {
        id,
        user: { role: 'supplier', status: 'approved' },
      },
      include: {
        user: { select: { email: true, createdAt: true } },
        ratingsReceived: {
          include: {
            pharmacist: { select: { companyName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
        listings: {
          orderBy: { createdAt: 'desc' },
          take: 10,
          select: { id: true, title: true, fileUrl: true, views: true, downloads: true, createdAt: true },
        },
        offers: {
          where: { expiresAt: { gte: new Date() } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        },
        subscriptionPayments: {
          where: { status: 'approved', isActive: true },
          include: { subscriptionPlan: true },
          take: 1,
          orderBy: { createdAt: 'desc' },
        },
        _count: { select: { listings: true, offers: true, ratingsReceived: true } },
      },
    });

    if (!profile) throw new NotFoundException('Fournisseur introuvable');

    const scores = profile.ratingsReceived.map((r) => r.score);
    const avgRating = scores.length ? scores.reduce((a, b) => a + b, 0) / scores.length : 0;

    return {
      ...profile,
      rating: Math.round(avgRating * 10) / 10,
      activeSubscription: profile.subscriptionPayments[0] ?? null,
    };
  }

  // ── Update supplier profile ────────────────────────────────────────────────
  async updateProfile(userId: string, dto: UpdateProfileDto, avatarUrl?: string) {
    return this.prisma.profile.update({
      where: { id: userId },
      data: {
        companyName: dto.companyName,
        address: dto.address,
        wilaya: dto.wilaya,
        phone: dto.phone,
        description: dto.description,
        ...(avatarUrl && { avatarUrl }),
      },
    });
  }

  // ── Supplier stats ─────────────────────────────────────────────────────────
  async getStats(userId: string) {
    const [listingStats, offerCount, ratingStats, subscription] = await Promise.all([
      this.prisma.listing.aggregate({
        where: { supplierId: userId },
        _sum: { views: true, downloads: true },
        _count: { id: true },
      }),
      this.prisma.offer.count({ where: { supplierId: userId, expiresAt: { gte: new Date() } } }),
      this.prisma.rating.aggregate({
        where: { supplierId: userId },
        _avg: { score: true },
        _count: { id: true },
      }),
      this.prisma.subscriptionPayment.findFirst({
        where: { userId, status: 'approved', isActive: true },
        include: { subscriptionPlan: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return {
      totalListings: listingStats._count.id,
      totalViews: listingStats._sum.views ?? 0,
      totalDownloads: listingStats._sum.downloads ?? 0,
      activeOffers: offerCount,
      averageRating: Math.round((ratingStats._avg.score ?? 0) * 10) / 10,
      totalRatings: ratingStats._count.id,
      subscription: subscription
        ? {
            plan: subscription.subscriptionPlan,
            end: subscription.subscriptionEnd,
            isActive: subscription.isActive,
          }
        : null,
    };
  }

  // ── Create rating ──────────────────────────────────────────────────────────
  async createRating(pharmacistId: string, dto: CreateRatingDto) {
    // Check supplier exists
    const supplier = await this.prisma.profile.findFirst({
      where: { id: dto.supplierId, user: { role: 'supplier' } },
    });
    if (!supplier) throw new NotFoundException('Fournisseur introuvable');

    return this.prisma.rating.upsert({
      where: { pharmacistId_supplierId: { pharmacistId, supplierId: dto.supplierId } },
      create: {
        pharmacistId,
        supplierId: dto.supplierId,
        score: dto.score,
        comment: dto.comment,
      },
      update: { score: dto.score, comment: dto.comment },
    });
  }

  // ── Gold suppliers for homepage ────────────────────────────────────────────
  async getGoldSuppliers() {
    return this.prisma.profile.findMany({
      where: {
        user: { role: 'supplier', status: 'approved', isActive: true },
        subscriptionPayments: {
          some: {
            status: 'approved',
            isActive: true,
            subscriptionPlan: { tier: 'gold' },
            subscriptionEnd: { gte: new Date() },
          },
        },
      },
      select: {
        id: true,
        companyName: true,
        wilaya: true,
        avatarUrl: true,
        description: true,
      },
      take: 6,
    });
  }

  // ── Submit subscription payment ────────────────────────────────────────────
  async submitSubscription(userId: string, planId: string, proofUrl: string) {
    return this.prisma.subscriptionPayment.create({
      data: {
        userId,
        subscriptionPlanId: planId,
        proofUrl,
        status: 'pending',
      },
    });
  }

  // ── Get subscription plans ─────────────────────────────────────────────────
  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { price: 'desc' },
    });
  }

  // ── Get current subscription ───────────────────────────────────────────────
  async getCurrentSubscription(userId: string) {
    return this.prisma.subscriptionPayment.findFirst({
      where: { userId },
      include: { subscriptionPlan: true },
      orderBy: { createdAt: 'desc' },
    });
  }
}
