-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('offer_received', 'offer_accepted', 'offer_declined', 'offer_countered', 'offer_expired', 'message_received', 'review_received', 'trade_completed', 'new_listing_match', 'daily_encouragement');

-- CreateEnum
CREATE TYPE "InterestDelivery" AS ENUM ('immediate', 'daily_digest');

-- CreateEnum
CREATE TYPE "QuoteCategory" AS ENUM ('motivation', 'swap_tip', 'community');

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "body" VARCHAR(1000) NOT NULL,
    "metadata" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "expires_at" TIMESTAMP(3),
    "deliver_at" TIMESTAMP(3),
    "related_offer_id" TEXT,
    "related_listing_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notification_settings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "global_enabled" BOOLEAN NOT NULL DEFAULT true,
    "offer_received" BOOLEAN NOT NULL DEFAULT true,
    "offer_accepted" BOOLEAN NOT NULL DEFAULT true,
    "offer_declined" BOOLEAN NOT NULL DEFAULT true,
    "offer_countered" BOOLEAN NOT NULL DEFAULT true,
    "offer_expired" BOOLEAN NOT NULL DEFAULT true,
    "message_received" BOOLEAN NOT NULL DEFAULT true,
    "review_received" BOOLEAN NOT NULL DEFAULT true,
    "trade_completed" BOOLEAN NOT NULL DEFAULT true,
    "new_listing_match" BOOLEAN NOT NULL DEFAULT true,
    "interest_delivery" "InterestDelivery" NOT NULL DEFAULT 'immediate',
    "daily_encouragement" BOOLEAN NOT NULL DEFAULT true,
    "quiet_hours" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_interests" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "ListingCategory" NOT NULL,
    "keywords" TEXT[],
    "radius_miles" DECIMAL(4,1),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_interests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_quotes" (
    "id" TEXT NOT NULL,
    "content" VARCHAR(500) NOT NULL,
    "author" VARCHAR(100),
    "category" "QuoteCategory" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "used_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_quotes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pending_interest_matches" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "listing_id" TEXT NOT NULL,
    "category" "ListingCategory" NOT NULL,
    "processed" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "pending_interest_matches_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_created_at_idx" ON "notifications"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "notifications_expires_at_idx" ON "notifications"("expires_at");

-- CreateIndex
CREATE INDEX "notifications_deliver_at_idx" ON "notifications"("deliver_at");

-- CreateIndex
CREATE UNIQUE INDEX "notification_settings_user_id_key" ON "notification_settings"("user_id");

-- CreateIndex
CREATE INDEX "user_interests_category_idx" ON "user_interests"("category");

-- CreateIndex
CREATE UNIQUE INDEX "user_interests_user_id_category_key" ON "user_interests"("user_id", "category");

-- CreateIndex
CREATE INDEX "daily_quotes_is_active_used_at_idx" ON "daily_quotes"("is_active", "used_at");

-- CreateIndex
CREATE INDEX "daily_quotes_category_idx" ON "daily_quotes"("category");

-- CreateIndex
CREATE INDEX "pending_interest_matches_user_id_processed_idx" ON "pending_interest_matches"("user_id", "processed");

-- CreateIndex
CREATE INDEX "pending_interest_matches_created_at_idx" ON "pending_interest_matches"("created_at");

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notification_settings" ADD CONSTRAINT "notification_settings_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_interests" ADD CONSTRAINT "user_interests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_interest_matches" ADD CONSTRAINT "pending_interest_matches_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "pending_interest_matches" ADD CONSTRAINT "pending_interest_matches_listing_id_fkey" FOREIGN KEY ("listing_id") REFERENCES "listings"("id") ON DELETE CASCADE ON UPDATE CASCADE;
