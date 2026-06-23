-- CreateEnum
CREATE TYPE "SoftArticleStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'APPROVED', 'REJECTED', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "MediaChannelType" AS ENUM ('WECHAT_MP', 'TOUTIAO', 'ZHIHU', 'WEIBO', 'LINKEDIN', 'BILIBILI', 'WEBSITE', 'OTHER');

-- CreateTable
CREATE TABLE "MediaChannel" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "MediaChannelType" NOT NULL DEFAULT 'OTHER',
    "url" TEXT,
    "description" TEXT,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MediaChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftArticle" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "summary" TEXT,
    "coverImage" TEXT,
    "author" TEXT,
    "seoKeywords" TEXT,
    "status" "SoftArticleStatus" NOT NULL DEFAULT 'DRAFT',
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftArticle_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftArticleChannel" (
    "id" TEXT NOT NULL,
    "softArticleId" TEXT NOT NULL,
    "channelId" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SoftArticleChannel_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SoftArticleMetric" (
    "id" TEXT NOT NULL,
    "softArticleId" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "views" INTEGER NOT NULL DEFAULT 0,
    "shares" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SoftArticleMetric_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SoftArticle_companyId_status_idx" ON "SoftArticle"("companyId", "status");

-- CreateIndex
CREATE INDEX "SoftArticle_status_publishedAt_idx" ON "SoftArticle"("status", "publishedAt");

-- CreateIndex
CREATE INDEX "SoftArticleChannel_channelId_idx" ON "SoftArticleChannel"("channelId");

-- CreateIndex
CREATE UNIQUE INDEX "SoftArticleChannel_softArticleId_channelId_key" ON "SoftArticleChannel"("softArticleId", "channelId");

-- CreateIndex
CREATE INDEX "SoftArticleMetric_softArticleId_idx" ON "SoftArticleMetric"("softArticleId");

-- CreateIndex
CREATE UNIQUE INDEX "SoftArticleMetric_softArticleId_channel_date_key" ON "SoftArticleMetric"("softArticleId", "channel", "date");

-- AddForeignKey
ALTER TABLE "SoftArticle" ADD CONSTRAINT "SoftArticle_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftArticleChannel" ADD CONSTRAINT "SoftArticleChannel_softArticleId_fkey" FOREIGN KEY ("softArticleId") REFERENCES "SoftArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftArticleChannel" ADD CONSTRAINT "SoftArticleChannel_channelId_fkey" FOREIGN KEY ("channelId") REFERENCES "MediaChannel"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SoftArticleMetric" ADD CONSTRAINT "SoftArticleMetric_softArticleId_fkey" FOREIGN KEY ("softArticleId") REFERENCES "SoftArticle"("id") ON DELETE CASCADE ON UPDATE CASCADE;
