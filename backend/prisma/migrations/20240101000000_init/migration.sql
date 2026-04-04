-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('admin', 'pharmacist', 'supplier');
CREATE TYPE "UserStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "PaymentStatus" AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE "SubscriptionTier" AS ENUM ('bronze', 'silver', 'gold');
CREATE TYPE "NotificationType" AS ENUM ('info', 'warning', 'success', 'error', 'payment', 'subscription', 'listing', 'offer');

-- CreateTable users
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "status" "UserStatus" NOT NULL DEFAULT 'pending',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateTable profiles
CREATE TABLE "profiles" (
    "id" TEXT NOT NULL,
    "company_name" TEXT,
    "address" TEXT,
    "wilaya" TEXT,
    "phone" TEXT,
    "description" TEXT,
    "avatar_url" TEXT,
    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "profiles_id_fkey" FOREIGN KEY ("id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable supplier_data
CREATE TABLE "supplier_data" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "total_views" INTEGER NOT NULL DEFAULT 0,
    "total_downloads" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "supplier_data_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "supplier_data_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "supplier_data_profile_id_key" ON "supplier_data"("profile_id");

-- CreateTable pharmacist_data
CREATE TABLE "pharmacist_data" (
    "id" TEXT NOT NULL,
    "profile_id" TEXT NOT NULL,
    "license_number" TEXT,
    CONSTRAINT "pharmacist_data_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "pharmacist_data_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "pharmacist_data_profile_id_key" ON "pharmacist_data"("profile_id");

-- CreateTable wilayas
CREATE TABLE "wilayas" (
    "code" INTEGER NOT NULL,
    "nom" TEXT NOT NULL,
    CONSTRAINT "wilayas_pkey" PRIMARY KEY ("code")
);

-- CreateTable subscription_plans
CREATE TABLE "subscription_plans" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tier" "SubscriptionTier" NOT NULL,
    "price" INTEGER NOT NULL,
    "yearly_price" INTEGER NOT NULL,
    "duration_days" INTEGER NOT NULL,
    "features" TEXT[],
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_plans_pkey" PRIMARY KEY ("id")
);

-- CreateTable subscription_payments
CREATE TABLE "subscription_payments" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "subscription_plan_id" TEXT NOT NULL,
    "proof_url" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL DEFAULT 'pending',
    "subscription_start" TIMESTAMP(3),
    "subscription_end" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "subscription_payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "subscription_payments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "subscription_payments_subscription_plan_id_fkey" FOREIGN KEY ("subscription_plan_id") REFERENCES "subscription_plans"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
CREATE INDEX "subscription_payments_user_id_idx" ON "subscription_payments"("user_id");
CREATE INDEX "subscription_payments_status_idx" ON "subscription_payments"("status");

-- CreateTable listings
CREATE TABLE "listings" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "file_url" TEXT NOT NULL,
    "extracted_text" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "downloads" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "listings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "listings_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "listings_supplier_id_idx" ON "listings"("supplier_id");
CREATE INDEX "listings_created_at_idx" ON "listings"("created_at");

-- CreateTable listing_products
CREATE TABLE "listing_products" (
    "id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "product_name" TEXT NOT NULL,
    "quantity" INTEGER,
    "price" DECIMAL(10,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "listing_products_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "listing_products_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "listing_products_listing_id_idx" ON "listing_products"("listing_id");
CREATE INDEX "listing_products_product_name_idx" ON "listing_products"("product_name");

-- CreateTable offers
CREATE TABLE "offers" (
    "id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT,
    "file_url" TEXT,
    "views" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expires_at" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "offers_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "offers_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "offers_supplier_id_idx" ON "offers"("supplier_id");
CREATE INDEX "offers_expires_at_idx" ON "offers"("expires_at");

-- CreateTable ratings
CREATE TABLE "ratings" (
    "id" TEXT NOT NULL,
    "pharmacist_id" TEXT NOT NULL,
    "supplier_id" TEXT NOT NULL,
    "score" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "ratings_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "ratings_pharmacist_id_fkey" FOREIGN KEY ("pharmacist_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "ratings_supplier_id_fkey" FOREIGN KEY ("supplier_id") REFERENCES "profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "ratings_pharmacist_id_supplier_id_key" ON "ratings"("pharmacist_id", "supplier_id");
CREATE INDEX "ratings_supplier_id_idx" ON "ratings"("supplier_id");

-- CreateTable notifications
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL DEFAULT 'info',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");
CREATE INDEX "notifications_created_at_idx" ON "notifications"("created_at");

-- CreateTable contact_messages
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'new',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "contact_messages_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable refresh_tokens
CREATE TABLE "refresh_tokens" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "refresh_tokens_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "refresh_tokens_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "refresh_tokens_token_key" ON "refresh_tokens"("token");
CREATE INDEX "refresh_tokens_user_id_idx" ON "refresh_tokens"("user_id");
