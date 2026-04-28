import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';
import { sendPasswordResetEmail } from '../admin/mail.service';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });

    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Compte desactive');
    }

    return user;
  }

  async login(user: any) {
    const payload = { sub: user.id, email: user.email, role: user.role };

    const accessToken = this.jwt.sign(payload);
    const refreshToken = this.jwt.sign(payload, {
      secret: this.config.get('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_EXPIRES_IN', '7d'),
    });

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await this.prisma.refreshToken.create({
      data: { userId: user.id, token: refreshToken, expiresAt },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(dto: RegisterDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) {
      throw new ConflictException('Cet email est deja utilise');
    }

    const hash = await bcrypt.hash(dto.password, 10);

    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash: hash,
        role: dto.role,
        status: 'pending',
        profile: {
          create: {
            companyName: dto.companyName,
            wilaya: dto.wilaya,
            phone: dto.phone,
            address: dto.address,
            registerUrl: dto.registerUrl ?? null,
          },
        },
      },
    });

    return {
      message: 'Compte cree avec succes. En attente de verification par un administrateur.',
      userId: user.id,
    };
  }

  async refreshTokens(token: string) {
    const record = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de rafraichissement invalide');
    }

    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) {
      throw new UnauthorizedException('Utilisateur introuvable');
    }

    await this.prisma.refreshToken.delete({ where: { token } });
    return this.login(user);
  }

  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    return { message: 'Deconnecte avec succes' };
  }

  async forgotPassword(email: string) {
    const user = await this.prisma.user.findUnique({
      where: { email },
      include: { profile: true },
    });

    const genericMessage =
      'Si un compte correspondant existe, un lien de reinitialisation a ete envoye.';

    if (!user || !user.isActive) {
      return { message: genericMessage };
    }

    const token = this.jwt.sign(
      { sub: user.id, email: user.email, type: 'password-reset' },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('PASSWORD_RESET_EXPIRES_IN', '30m'),
      },
    );

    const frontendUrl = (this.config.get('FRONTEND_URL') || 'http://localhost:3000').replace(/\/$/, '');
    const resetUrl = `${frontendUrl}/auth/reset-password?token=${encodeURIComponent(token)}`;

    await sendPasswordResetEmail(user.email, resetUrl, user.profile?.companyName ?? undefined);

    return { message: genericMessage };
  }

  async resetPassword(token: string, newPassword: string) {
    let payload: { sub?: string; type?: string };

    try {
      payload = this.jwt.verify(token, {
        secret: this.config.get('JWT_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Lien de reinitialisation invalide ou expire');
    }

    if (!payload.sub || payload.type !== 'password-reset') {
      throw new UnauthorizedException('Lien de reinitialisation invalide ou expire');
    }

    const user = await this.prisma.user.findUnique({ where: { id: payload.sub } });
    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash: hash },
      }),
      this.prisma.refreshToken.deleteMany({
        where: { userId: payload.sub },
      }),
    ]);

    return { message: 'Mot de passe reinitialise avec succes' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        role: true,
        status: true,
        isActive: true,
        profile: {
          select: {
            companyName: true,
            wilaya: true,
            phone: true,
            address: true,
            avatarUrl: true,
            description: true,
            registerUrl: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Utilisateur introuvable');
    }

    return user;
  }
}
