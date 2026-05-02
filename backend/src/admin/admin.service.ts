import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { NotificationsService } from '../notifications/notifications.service';
import { sendApprovalEmail } from './mail.service';
import { getTrialDaysForDate, isLaunchPromoActive } from '../common/subscription-access';

@Injectable()
export class AdminService {
  constructor(
    private prisma: PrismaService,
    private notifications: NotificationsService,
  ) {}

  async getDashboardStats() {
    const [
      totalPharmacists,
      totalSuppliers,
      pendingUsers,
      pendingPayments,
      newMessages,
      activeSubscriptions,
    ] = await Promise.all([
      this.prisma.user.count({ where: { role: 'pharmacist', status: 'approved' } }),
      this.prisma.user.count({ where: { role: 'supplier', status: 'approved' } }),
      this.prisma.user.count({ where: { status: 'pending' } }),
      this.prisma.subscriptionPayment.count({ where: { status: 'pending' } }),
      this.prisma.contactMessage.count({ where: { status: 'new' } }),
      this.prisma.subscriptionPayment.count({
        where: { status: 'approved', isActive: true, subscriptionEnd: { gte: new Date() } },
      }),
    ]);

    return {
      totalPharmacists,
      totalSuppliers,
      pendingUsers,
      pendingPayments,
      newMessages,
      activeSubscriptions,
    };
  }

  async getUsers(role?: string, status?: string, search?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (role) where.role = role;
    if (status) where.status = status;
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { profile: { companyName: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [users, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          role: true,
          status: true,
          isActive: true,
          createdAt: true,
          profile: {
            select: {
              companyName: true,
              wilaya: true,
              phone: true,
              avatarUrl: true,
              registerUrl: true,
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
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return { data: users, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approveUser(userId: string) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: { status: 'approved' },
      select: {
        email: true,
        role: true,
        profile: { select: { companyName: true } },
      },
    });

    await this.notifications.create(
      userId,
      'Compte approuvé',
      'Votre compte a été approuvé. Vous pouvez maintenant vous connecter.',
      'success',
    );

    void sendApprovalEmail(user.email, user.profile?.companyName ?? undefined).catch((err) => {
      console.error('Erreur envoi email approbation:', err);
    });

    return { message: 'Utilisateur approuve avec succes.', user };
  }

  async rejectUser(userId: string, reason?: string) {
    await this.prisma.user.update({ where: { id: userId }, data: { status: 'rejected' } });
    await this.notifications.create(
      userId,
      'Compte refuse',
      reason || "Votre demande d'inscription a ete refusee.",
      'error',
    );
    return { message: 'Utilisateur refuse' };
  }

  async toggleUserActive(userId: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('Utilisateur introuvable');

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: { isActive: !user.isActive },
    });

    return { isActive: updated.isActive };
  }

  async deleteUser(userId: string) {
    await this.prisma.user.delete({ where: { id: userId } });
    return { message: 'Utilisateur supprime' };
  }

  async getPayments(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [payments, total] = await Promise.all([
      this.prisma.subscriptionPayment.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          profile: { select: { companyName: true, user: { select: { email: true } } } },
          subscriptionPlan: { select: { name: true, tier: true, price: true, durationDays: true } },
        },
      }),
      this.prisma.subscriptionPayment.count({ where }),
    ]);

    return { data: payments, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async approvePayment(paymentId: string) {
    const payment = await this.prisma.subscriptionPayment.findUnique({
      where: { id: paymentId },
      include: { subscriptionPlan: true },
    });
    if (!payment) throw new NotFoundException('Paiement introuvable');

    const start = new Date();
    const previousApprovedCount = await this.prisma.subscriptionPayment.count({
      where: {
        userId: payment.userId,
        status: 'approved',
      },
    });
    const welcomeTrialDays =
      previousApprovedCount === 0 && !isLaunchPromoActive(start) ? getTrialDaysForDate(start) : 0;

    const end = new Date(start);
    end.setDate(end.getDate() + payment.subscriptionPlan.durationDays + welcomeTrialDays);

    await this.prisma.subscriptionPayment.updateMany({
      where: { userId: payment.userId, isActive: true },
      data: { isActive: false },
    });

    const updated = await this.prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        status: 'approved',
        isActive: true,
        subscriptionStart: start,
        subscriptionEnd: end,
      },
    });

    await this.notifications.create(
      payment.userId,
      'Abonnement active',
      `Votre abonnement ${payment.subscriptionPlan.name} est actif jusqu'au ${end.toLocaleDateString('fr-DZ')}.${welcomeTrialDays ? ` Offre de bienvenue incluse : ${welcomeTrialDays} jours offerts.` : ''}`,
      'success',
    );

    return {
      ...updated,
      message: welcomeTrialDays
        ? `Paiement approuve. ${welcomeTrialDays} jours offerts ont ete ajoutes a ce premier abonnement.`
        : 'Paiement approuve avec succes.',
    };
  }

  async rejectPayment(paymentId: string, reason?: string) {
    const payment = await this.prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: { status: 'rejected' },
    });

    await this.notifications.create(
      payment.userId,
      'Paiement refuse',
      reason || "Votre preuve de paiement a ete refusee. Veuillez recontacter l'administrateur.",
      'error',
    );

    return payment;
  }

  async getMessages(status?: string, page = 1, limit = 20) {
    const skip = (page - 1) * limit;
    const where: any = {};
    if (status) where.status = status;

    const [messages, total] = await Promise.all([
      this.prisma.contactMessage.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.contactMessage.count({ where }),
    ]);

    return { data: messages, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async markMessageRead(id: string) {
    return this.prisma.contactMessage.update({ where: { id }, data: { status: 'read' } });
  }

  async deleteMessage(id: string) {
    await this.prisma.contactMessage.delete({ where: { id } });
    return { message: 'Message supprime' };
  }

  async getPlans() {
    return this.prisma.subscriptionPlan.findMany({ orderBy: { price: 'desc' } });
  }

  async updatePlan(id: string, data: any) {
    return this.prisma.subscriptionPlan.update({ where: { id }, data });
  }

  async updateSubscriptionDates(paymentId: string, startDate: string, endDate: string) {
    return this.prisma.subscriptionPayment.update({
      where: { id: paymentId },
      data: {
        subscriptionStart: new Date(startDate),
        subscriptionEnd: new Date(endDate),
      },
    });
  }
}
