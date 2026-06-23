-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SectionType" ADD VALUE 'TRENDING';
ALTER TYPE "SectionType" ADD VALUE 'ARTICLES_FEED';
ALTER TYPE "SectionType" ADD VALUE 'COMPANIES';
ALTER TYPE "SectionType" ADD VALUE 'EVENTS';
ALTER TYPE "SectionType" ADD VALUE 'REPORTS';
ALTER TYPE "SectionType" ADD VALUE 'AWARDS';
