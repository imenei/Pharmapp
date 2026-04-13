// src/listings/listings.service.ts
import {
  Injectable, NotFoundException, ForbiddenException,
  BadRequestException, Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ListingsService {
  private readonly logger = new Logger(ListingsService.name);
  constructor(private prisma: PrismaService) {}

  private async ensureSupplierSubscriptionApproved(supplierId: string) {
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

  // ── Upload PDF + extract products ──────────────────────────────────────────
  async create(supplierId: string, title: string, description: string, file: Express.Multer.File) {
    await this.ensureSupplierSubscriptionApproved(supplierId);
    if (!file) throw new BadRequestException('Fichier PDF requis');
    if (!title?.trim()) throw new BadRequestException('Titre requis');

    const fileUrl = `/uploads/${file.filename}`;
    let products: { productName: string; price?: number; quantity?: number }[] = [];
    let extractedText = '';

    try {
      // Use require() not import() - avoids ESM issues with pdf-parse
      const pdfParse = require('pdf-parse');
      const buffer = fs.readFileSync(file.path);
      const data = await pdfParse(buffer, { max: 0 });
      extractedText = data.text || '';
      this.logger.log(`PDF parsed: ${data.numpages} pages, ${extractedText.length} chars`);
      products = this.extractProducts(extractedText);
      this.logger.log(`Products extracted: ${products.length}`);
    } catch (e) {
      this.logger.error(`PDF extraction failed: ${e.message}`);
      // Continue - save listing without products
    }

    const listing = await this.prisma.$transaction(async (tx) => {
      const l = await tx.listing.create({
        data: {
          supplierId,
          title: title.trim(),
          description: description?.trim() || null,
          fileUrl,
          extractedText: extractedText || null,
        },
      });
      if (products.length > 0) {
        await tx.listingProduct.createMany({
          data: products.map((p) => ({
            listingId: l.id,
            productName: p.productName,
            price: p.price ?? null,
            quantity: p.quantity ?? null,
          })),
          skipDuplicates: true,
        });
      }
      return l;
    });

    return {
      id: listing.id,
      title: listing.title,
      fileUrl: listing.fileUrl,
      productsExtracted: products.length,
      message: products.length > 0
        ? `✅ ${products.length} produits extraits`
        : '⚠️ Aucun produit extrait — listing visible quand même',
    };
  }

  // ── Smart extraction for Algerian pharma PDFs ──────────────────────────────
  private extractProducts(text: string): { productName: string; price?: number; quantity?: number }[] {
    if (!text || text.trim().length < 10) return [];

    const products: { productName: string; price?: number; quantity?: number }[] = [];
    const seen = new Set<string>();

    const lines = text
      .replace(/\r/g, '')
      .split('\n')
      .map((l) => l.replace(/\s+/g, ' ').trim())
      .filter((l) => l.length >= 3);

    // Lines to skip (headers, footers, metadata)
    const SKIP = /^(page\s*\d|total|sous-total|tva|ttc|remise|réduction|date|fax|tél|tel\b|email|adresse|www\.|http|©|ref\s*:|n°|bon\s*de|facture|commande|livraison|devis|catalogue|liste\s*de|fournisseur|pharmacie\s*centrale|client|société|sarl|eurl|wilaya|siret|nif\b|nis\b|^rc\b|article\s*n°|designation|désignation|description|quantité|prix\s*unit|montant|total\s*ht|observations?)/i;

    const PRICE_RE = /\b(\d{2,7}[.,]\d{2})\s*(da|dzd|dz)?\s*$/i;
    const DOSAGE_RE = /\d+\s*(mg|mcg|µg|g\b|ml\b|ui\b|iu\b|%|cp|cpr)/i;
    const NAME_RE = /^[A-ZÀ-Ÿa-zà-ÿ][A-ZÀ-Ÿa-zà-ÿ0-9\s\-\/\(\)\.\+\%\']{1,79}$/;
    const QTY_RE = /\b(\d+)\s*(boîte|boite|unité|unite|comprimé|gélule|ampoule|sachet|tube|flacon)/i;

    for (const line of lines) {
      if (SKIP.test(line)) continue;
      if (/^\d+$/.test(line)) continue;           // pure number
      if (/^[\d\s\.,\-]+$/.test(line)) continue;  // pure numbers/punctuation
      if (line.length > 120) continue;             // too long = paragraph text

      // Extract price
      let price: number | undefined;
      const pm = line.match(PRICE_RE);
      if (pm) {
        const v = parseFloat(pm[1].replace(',', '.'));
        if (v > 0 && v < 9_999_999) price = v;
      }

      // Extract quantity
      let quantity: number | undefined;
      const qm = line.match(QTY_RE);
      if (qm) quantity = parseInt(qm[1], 10);

      // Clean line to get product name
      let name = line
        .replace(PRICE_RE, '')
        .replace(/\b\d{5,}\b/g, '')  // strip long codes
        .replace(/[:\-\|;]+$/, '')
        .replace(/\s{2,}/g, ' ')
        .trim();

      if (name.length < 3 || name.length > 100) continue;

      // Must be valid name OR have dosage info
      if (!NAME_RE.test(name) && !DOSAGE_RE.test(name)) continue;

      // Skip ALL-CAPS section headers (> 30 chars)
      if (name === name.toUpperCase() && name.length > 30 && !/\d/.test(name)) continue;

      const key = name.toLowerCase().trim();
      if (seen.has(key)) continue;
      seen.add(key);

      products.push({ productName: name, price, quantity });
      if (products.length >= 1000) break;
    }

    return products;
  }

  // ── Search by product names ────────────────────────────────────────────────
  async searchByProducts(productNames: string[], page = 1, limit = 20) {
    const valid = (productNames || []).map((n) => n?.trim()).filter((n) => n && n.length >= 2);
    if (!valid.length) return { data: [], total: 0, page, limit, totalPages: 0 };

    const skip = (page - 1) * limit;

    const matched = await this.prisma.listingProduct.findMany({
      where: { OR: valid.map((name) => ({ productName: { contains: name, mode: 'insensitive' as const } })) },
      select: { listingId: true },
      distinct: ['listingId'],
    });

    const ids = matched.map((m) => m.listingId);
    if (!ids.length) return { data: [], total: 0, page, limit, totalPages: 0 };

    const listings = await this.prisma.listing.findMany({
      where: { id: { in: ids } },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        supplier: {
          select: {
            id: true, companyName: true, wilaya: true, avatarUrl: true,
            subscriptionPayments: {
              where: { status: 'approved', isActive: true },
              select: { subscriptionPlan: { select: { tier: true } } },
              take: 1, orderBy: { createdAt: 'desc' },
            },
          },
        },
        products: {
          where: { OR: valid.map((name) => ({ productName: { contains: name, mode: 'insensitive' as const } })) },
          select: { productName: true, price: true, quantity: true },
          take: 50,
        },
        _count: { select: { products: true } },
      },
    });

    return {
      data: listings.map((l) => ({
        id: l.id, title: l.title, fileUrl: l.fileUrl,
        views: l.views, downloads: l.downloads, createdAt: l.createdAt,
        supplier: {
          id: l.supplier.id, name: l.supplier.companyName,
          wilaya: l.supplier.wilaya, avatarUrl: l.supplier.avatarUrl,
          tier: l.supplier.subscriptionPayments[0]?.subscriptionPlan?.tier ?? null,
        },
        matchingProducts: l.products.map((p) => ({
          productName: p.productName,
          price: p.price ? Number(p.price) : null,
          quantity: p.quantity,
        })),
        matchingCount: l.products.length,
        totalProducts: l._count.products,
      })),
      total: ids.length,
      page,
      limit,
      totalPages: Math.ceil(ids.length / limit),
    };
  }

  async findBySupplierId(supplierId: string) {
    return this.prisma.listing.findMany({
      where: { supplierId },
      include: { _count: { select: { products: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async incrementView(id: string) {
    return this.prisma.listing.update({ where: { id }, data: { views: { increment: 1 } } });
  }

  async download(id: string, _userId: string) {
    const l = await this.prisma.listing.findUnique({ where: { id } });
    if (!l) throw new NotFoundException('Listing introuvable');
    await this.prisma.listing.update({ where: { id }, data: { downloads: { increment: 1 } } });
    return { fileUrl: l.fileUrl };
  }

  async delete(id: string, supplierId: string) {
    await this.ensureSupplierSubscriptionApproved(supplierId);
    const l = await this.prisma.listing.findUnique({ where: { id } });
    if (!l) throw new NotFoundException('Listing introuvable');
    if (l.supplierId !== supplierId) throw new ForbiddenException('Non autorisé');
    await this.prisma.listing.delete({ where: { id } });
    try {
      const fp = path.join(process.env.UPLOAD_DIR || './uploads', path.basename(l.fileUrl));
      if (fs.existsSync(fp)) fs.unlinkSync(fp);
    } catch {}
    return { message: 'Listing supprimé' };
  }
}
