<div align="center">

# 💊 Pharma Flow

### Plateforme B2B — Pharmaciens & Fournisseurs Pharmaceutiques · Algérie 🇩🇿

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-10-E0234E?style=for-the-badge&logo=nestjs)](https://nestjs.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)](https://prisma.io/)
[![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://typescriptlang.org/)

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)]()
[![Made in Algeria](https://img.shields.io/badge/Made%20in-Algeria%20🇩🇿-green?style=flat-square)]()

</div>

---

## 📋 Table des matières

- [Aperçu](#-aperçu)
- [Fonctionnalités](#-fonctionnalités)
- [Architecture](#-architecture)
- [Stack technique](#-stack-technique)
- [Démarrage rapide](#-démarrage-rapide)
- [Développement local](#-développement-local)
- [API Reference](#-api-reference)
- [Structure du projet](#-structure-du-projet)
- [Variables d'environnement](#-variables-denvironnement)
- [Déploiement](#-déploiement)
- [Performance](#-performance)

---

## 🔭 Aperçu

**Pharma Flow** connecte les **pharmaciens** et les **fournisseurs pharmaceutiques** à travers toute l'Algérie. Les fournisseurs publient leurs catalogues PDF — les produits sont extraits automatiquement — et les pharmaciens cherchent des médicaments précis en temps réel.

```
Fournisseur  →  Upload catalogue PDF  →  Extraction automatique des produits
Pharmacien   →  Recherche "Amoxicilline 500mg"  →  Tous les catalogues correspondants
```

---

## ✨ Fonctionnalités

### 🔐 Authentification & Rôles
- Inscription avec sélection de rôle (**Pharmacien** / **Fournisseur**)
- Validation manuelle par l'administrateur avant accès
- JWT Access Token (15 min) + Refresh Token (7 jours) avec rotation automatique
- Redirection automatique selon le rôle

### 👑 Espace Administrateur
- Dashboard temps réel : statistiques globales
- Gestion des utilisateurs : approuver / refuser / désactiver / supprimer
- Validation des paiements avec visualisation des reçus scannés
- Gestion des messages de contact
- Édition des plans d'abonnement

### 🏭 Espace Fournisseur
- Upload catalogues PDF avec **extraction automatique** des médicaments, prix et quantités
- Offres promotionnelles avec image et date d'expiration
- Profil entreprise avec logo
- Abonnement Bronze / Argent / Or (paiement par preuve de virement)
- Dashboard : vues totales, téléchargements, note moyenne

### 🏥 Espace Pharmacien
- **Recherche multi-produits** : jusqu'à 5 médicaments en simultané cross tous fournisseurs
- Filtrage des fournisseurs par wilaya et nom
- Fiche fournisseur : listings, offres actives, avis clients
- Téléchargement direct des catalogues PDF
- Notation des fournisseurs (1-5 étoiles + commentaire)
- Notifications système

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────┐
│                        Docker Compose                         │
│                                                              │
│  ┌──────────────┐    ┌───────────────┐    ┌──────────────┐  │
│  │   Next.js    │───▶│    NestJS     │───▶│  PostgreSQL  │  │
│  │  :3000       │    │   :4000       │    │   :5432      │  │
│  │              │    │               │    │              │  │
│  │ App Router   │    │ REST API      │    │  Prisma ORM  │  │
│  │ React Query  │    │ JWT Guards    │    │  16 tables   │  │
│  │ Tailwind CSS │    │ Multer/PDF    │    │  Indexes     │  │
│  └──────────────┘    └───────────────┘    └──────────────┘  │
│         │                    │                               │
│         └────────────────────┼── /uploads (Volume Docker)   │
└──────────────────────────────┼───────────────────────────────┘
                               │
                    JWT stateless auth
                    (aucun appel DB en middleware)
```

---

## 🛠️ Stack technique

| Couche | Technologie | Pourquoi |
|--------|------------|---------|
| **Frontend** | Next.js 14 App Router | SSR, Server Components, routing optimisé |
| **UI** | Tailwind CSS | Zero runtime, utility-first |
| **State / Cache** | TanStack React Query v5 | Cache intelligent, deduplication automatique |
| **Backend** | NestJS 10 | Architecture modulaire, DI, décorateurs |
| **ORM** | Prisma 5 | Type-safe, migrations versionnées, relations |
| **Base de données** | PostgreSQL 16 | ACID, indexes, full-text search |
| **Auth** | JWT + bcryptjs | Stateless, rotation refresh tokens |
| **Upload PDF** | Multer + pdf-parse | Extraction texte côté serveur |
| **DevOps** | Docker + Compose | Reproductible en un `docker-compose up` |

---

## 🚀 Démarrage rapide

### Prérequis

- [Docker](https://docs.docker.com/get-docker/) ≥ 24
- [Docker Compose](https://docs.docker.com/compose/) ≥ 2.20

### 3 commandes pour démarrer

```bash
git clone https://github.com/votre-org/el-saidalya.git
cd el-saidalya
cp .env.example .env
docker-compose up --build
```

> La première fois : ~3-4 minutes (build images + migrations + seed)

### Accès

| Service | URL |
|---------|-----|
| 🌐 Application | http://localhost:3000 |
| ⚡ API | http://localhost:4000/api |
| ❤️ Health | http://localhost:4000/api/health |

### Compte admin par défaut

```
Email    : admin@elsaidalya.dz
Password : Admin@123456
```

---

## 💻 Développement local

### Backend

```bash
cd backend
npm install

# Démarrer une DB locale
docker run -d --name pharma-db \
  -e POSTGRES_USER=pharma \
  -e POSTGRES_PASSWORD=pharmapass123 \
  -e POSTGRES_DB=pharmadb \
  -p 5432:5432 postgres:16-alpine

# Configurer .env
cp .env.example .env
# Modifier DATABASE_URL → postgresql://pharma:pharmapass123@localhost:5432/pharmadb

# Migrer + seeder
npx prisma migrate dev --name init
npx prisma db seed

# Démarrer (hot-reload)
npm run start:dev
```

### Frontend

```bash
cd frontend
npm install
echo "NEXT_PUBLIC_API_URL=http://localhost:4000/api" > .env.local
npm run dev
```

### Prisma Studio

```bash
cd backend && npx prisma studio
# → http://localhost:5555
```

---

## 📡 API Reference

### Auth

| Méthode | Endpoint | Description | Auth requis |
|---------|----------|-------------|:-----------:|
| `POST` | `/api/auth/register` | Créer un compte | ❌ |
| `POST` | `/api/auth/login` | Se connecter | ❌ |
| `POST` | `/api/auth/refresh` | Rafraîchir les tokens | ❌ |
| `POST` | `/api/auth/logout` | Se déconnecter | ✅ |
| `GET` | `/api/auth/me` | Profil connecté | ✅ |

### Fournisseurs

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| `GET` | `/api/suppliers?wilaya=Alger&search=xyz&page=1` | Liste filtrée paginée | pharmacist |
| `GET` | `/api/suppliers/gold` | Fournisseurs Or | tous |
| `GET` | `/api/suppliers/:id` | Détail + listings + avis | pharmacist |
| `PATCH` | `/api/suppliers/me/profile` | Modifier profil (multipart) | supplier |
| `GET` | `/api/suppliers/me/stats` | Statistiques activité | supplier |
| `POST` | `/api/suppliers/ratings` | Donner un avis | pharmacist |
| `GET` | `/api/suppliers/plans` | Plans d'abonnement | supplier |
| `POST` | `/api/suppliers/me/subscription` | Soumettre abonnement | supplier |

### Listings (Catalogues PDF)

| Méthode | Endpoint | Description | Rôle |
|---------|----------|-------------|------|
| `POST` | `/api/listings` | Upload PDF (multipart) | supplier |
| `GET` | `/api/listings/my` | Mes catalogues | supplier |
| `POST` | `/api/listings/search` | `{ products: ["Amox", "Ibuprofène"] }` | pharmacist |
| `POST` | `/api/listings/:id/download` | Télécharger (incr. compteur) | pharmacist |
| `DELETE` | `/api/listings/:id` | Supprimer | supplier |

### Admin

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/api/admin/stats` | Stats dashboard |
| `GET` | `/api/admin/users?status=pending&page=1` | Utilisateurs filtrés |
| `PATCH` | `/api/admin/users/:id/approve` | Approuver |
| `PATCH` | `/api/admin/users/:id/reject` | Refuser |
| `PATCH` | `/api/admin/users/:id/toggle-active` | Activer/Désactiver |
| `DELETE` | `/api/admin/users/:id` | Supprimer |
| `GET` | `/api/admin/payments?status=pending` | Paiements |
| `PATCH` | `/api/admin/payments/:id/approve` | Valider paiement |
| `PATCH` | `/api/admin/payments/:id/reject` | Rejeter paiement |
| `GET` | `/api/admin/messages` | Messages contact |

---

## 📁 Structure du projet

```
el-saidalya/
│
├── 📁 backend/                       # API NestJS
│   ├── 📁 src/
│   │   ├── 📁 auth/                  # JWT, login, register, refresh tokens
│   │   ├── 📁 admin/                 # Gestion admin complète
│   │   ├── 📁 suppliers/             # Profil, stats, abonnement, ratings
│   │   ├── 📁 pharmacists/           # Dashboard, profil pharmacien
│   │   ├── 📁 listings/              # Upload PDF, extraction produits, recherche
│   │   ├── 📁 offers/                # Offres promotionnelles
│   │   ├── 📁 notifications/         # Système de notifications
│   │   ├── 📁 wilayas/               # 58 wilayas algériennes
│   │   ├── 📁 users/                 # Profil, mot de passe
│   │   ├── 📁 prisma/                # Service Prisma global (@Global)
│   │   └── 📁 common/
│   │       ├── 📁 guards/            # JwtAuthGuard, RolesGuard
│   │       └── 📁 decorators/        # @Public, @Roles, @CurrentUser
│   ├── 📁 prisma/
│   │   ├── schema.prisma             # 12 modèles, indexes optimisés
│   │   ├── seed.ts                   # Seed TypeScript (dev)
│   │   ├── seed-prod.js              # Seed JavaScript (prod, sans ts-node)
│   │   └── 📁 migrations/            # SQL versionnés
│   └── Dockerfile
│
├── 📁 frontend/                      # App Next.js 14
│   └── 📁 src/
│       ├── 📁 app/
│       │   ├── 📁 auth/              # signin, signup, signup-success
│       │   ├── 📁 admin/             # Dashboard (users + payments + messages)
│       │   ├── 📁 pharmacist/        # Dashboard, fournisseurs, recherche, offres...
│       │   └── 📁 supplier/          # Dashboard, listings, offres, abonnement...
│       ├── 📁 components/ui/         # Spinner, Modal, Avatar, StatCard, Pagination...
│       ├── 📁 hooks/useApi.ts        # TOUS les appels API centralisés (React Query)
│       ├── 📁 lib/
│       │   ├── api.ts                # Axios + intercepteur auto-refresh
│       │   ├── auth.ts               # login / logout / register helpers
│       │   └── providers.tsx         # QueryClient + AuthContext
│       └── 📁 types/index.ts         # Types TypeScript partagés
│
├── docker-compose.yml
├── .env.example
├── .gitignore
└── README.md
```

---

## 🔒 Variables d'environnement

```env
# ── Base de données
POSTGRES_USER=pharma
POSTGRES_PASSWORD=CHANGEZ_EN_PRODUCTION
POSTGRES_DB=pharmadb

# ── Backend
DATABASE_URL=postgresql://pharma:CHANGEZ@db:5432/pharmadb
JWT_SECRET=CHAINE_ALEATOIRE_LONGUE_AU_MOINS_64_CHARS
JWT_REFRESH_SECRET=AUTRE_CHAINE_DIFFERENTE_DE_LA_PREMIERE
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
UPLOAD_DIR=/app/uploads

# ── Frontend
NEXT_PUBLIC_API_URL=http://localhost:4000/api
FRONTEND_URL=http://localhost:3000
```

> 💡 **Générer des secrets sécurisés :**
> ```bash
> node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
> ```

---

## 🚢 Déploiement

### VPS / Serveur Ubuntu

```bash
# Installer Docker
curl -fsSL https://get.docker.com | sh

# Cloner et configurer
 git remote add origin https://github.com/imenei/Pharmapp.git
 cd Pharmapp
cp .env.example .env
nano .env  # ← Modifier tous les secrets !

# Démarrer en production
docker-compose up --build -d

# Vérifier
docker-compose ps
docker-compose logs -f backend
```

### Nginx reverse proxy

```nginx
server {
    listen 80;
    server_name elsaidalya.dz;

    # Frontend
    location / {
        proxy_pass http://localhost:3000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    # API + fichiers uploadés
    location ~ ^/(api|uploads)/ {
        proxy_pass http://localhost:4000;
        proxy_set_header Host $host;
        client_max_body_size 25M;
    }
}
```

### Commandes utiles

```bash
# Arrêter les services
docker-compose down

# Arrêter + supprimer les données (ATTENTION)
docker-compose down -v

# Logs en temps réel
docker-compose logs -f

# Redémarrer un service
docker-compose restart backend

# Shell dans le backend
docker exec -it pharma_backend sh

# Backup de la base de données
docker exec pharma_db pg_dump -U pharma pharmadb > backup.sql
```

---



### Index clés

```sql
-- Recherche produits (requête la plus fréquente)
CREATE INDEX listing_products_product_name_idx ON listing_products(product_name);

-- Offres actives
CREATE INDEX offers_expires_at_idx ON offers(expires_at);

-- Notifications non lues
CREATE INDEX notifications_user_id_is_read_idx ON notifications(user_id, is_read);
```

---

## 📄 Licence

 © 2026 Pharma Flow

---

<div align="center">

**Fait avec ❤️ pour la communauté pharmaceutique algérienne 🇩🇿**

[🐛 Signaler un bug](../../issues) · [💡 Proposer une fonctionnalité](../../issues/new) · [📧 Contact](mailto:contact@elsaidalya.dz)

</div>