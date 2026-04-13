// src/auth/auth.service.ts
import {
  Injectable, UnauthorizedException, ConflictException, NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwt: JwtService,
    private config: ConfigService,
  ) {}

  // ── Validate credentials (used by LocalStrategy) ──────────────────────────
  async validateUser(email: string, password: string) {
    const user = await this.prisma.user.findUnique({ where: { email } });
    if (!user) throw new UnauthorizedException('Email ou mot de passe incorrect');
    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new UnauthorizedException('Email ou mot de passe incorrect');
    if (!user.isActive) throw new UnauthorizedException('Compte désactivé');
    return user;
  }

  // ── Login — returns tokens + user info ────────────────────────────────────
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

  // ── Register — creates user + profile with optional registerUrl ───────────
  async register(dto: RegisterDto) {
    // Check email uniqueness
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('Cet email est déjà utilisé');

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
            registerUrl: dto.registerUrl ?? null, // ← registre de commerce
          },
        },
      },
    });

    return {
      message: 'Compte créé avec succès. En attente de vérification par un administrateur.',
      userId: user.id,
    };
  }

  // ── Refresh tokens ────────────────────────────────────────────────────────
  async refreshTokens(token: string) {
    const record = await this.prisma.refreshToken.findUnique({ where: { token } });
    if (!record || record.expiresAt < new Date()) {
      throw new UnauthorizedException('Token de rafraîchissement invalide');
    }
    const user = await this.prisma.user.findUnique({ where: { id: record.userId } });
    if (!user) throw new UnauthorizedException('Utilisateur introuvable');

    await this.prisma.refreshToken.delete({ where: { token } });
    return this.login(user);
  }

  // ── Logout ────────────────────────────────────────────────────────────────
  async logout(token: string) {
    await this.prisma.refreshToken.deleteMany({ where: { token } });
    return { message: 'Déconnecté avec succès' };
  }

  // ── Get current user profile ──────────────────────────────────────────────
  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true, email: true, role: true, status: true, isActive: true,
        profile: {
          select: {
            companyName: true, wilaya: true, phone: true, address: true,
            avatarUrl: true, description: true, registerUrl: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('Utilisateur introuvable');
    return user;
  }
}
