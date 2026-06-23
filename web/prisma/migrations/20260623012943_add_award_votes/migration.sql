-- CreateTable
CREATE TABLE "AwardVote" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "companyId" TEXT,
    "ipHash" TEXT NOT NULL,
    "fingerprint" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AwardVote_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AwardVote_campaignId_idx" ON "AwardVote"("campaignId");

-- CreateIndex
CREATE UNIQUE INDEX "AwardVote_campaignId_ipHash_key" ON "AwardVote"("campaignId", "ipHash");

-- AddForeignKey
ALTER TABLE "AwardVote" ADD CONSTRAINT "AwardVote_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "AwardCampaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AwardVote" ADD CONSTRAINT "AwardVote_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "Company"("id") ON DELETE SET NULL ON UPDATE CASCADE;
