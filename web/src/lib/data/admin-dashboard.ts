import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AdminDashboardStats = {
  totalArticles: number;
  totalCompanies: number;
  pendingCompanies: number;
  draftArticles: number;
  pendingReviewArticles: number;
  totalEvents: number;
  totalReports: number;
  totalUsers: number;
  totalJobs: number;
  totalAds: number;
  monthArticles: number;
};

async function fetchAdminDashboardStats(): Promise<AdminDashboardStats> {
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const [row] = await prisma.$queryRaw<AdminDashboardStats[]>`
    SELECT
      (SELECT COUNT(*)::int FROM "Article" WHERE "deletedAt" IS NULL) AS "totalArticles",
      (SELECT COUNT(*)::int FROM "Company" WHERE "deletedAt" IS NULL) AS "totalCompanies",
      (SELECT COUNT(*)::int FROM "Company" WHERE "status" = 'PENDING' AND "deletedAt" IS NULL) AS "pendingCompanies",
      (SELECT COUNT(*)::int FROM "Article" WHERE "status" = 'DRAFT') AS "draftArticles",
      (SELECT COUNT(*)::int FROM "Article" WHERE "status" = 'PENDING_REVIEW') AS "pendingReviewArticles",
      (SELECT COUNT(*)::int FROM "Event") AS "totalEvents",
      (SELECT COUNT(*)::int FROM "Report") AS "totalReports",
      (SELECT COUNT(*)::int FROM "User") AS "totalUsers",
      (SELECT COUNT(*)::int FROM "Job" WHERE "status" = 'PUBLISHED') AS "totalJobs",
      (SELECT COUNT(*)::int FROM "Ad" WHERE "active" = true) AS "totalAds",
      (SELECT COUNT(*)::int FROM "Article" WHERE "publishedAt" >= ${monthStart} AND "deletedAt" IS NULL) AS "monthArticles"
  `;

  return row;
}

const getCachedAdminDashboardStats = unstable_cache(
  fetchAdminDashboardStats,
  ["admin-dashboard-stats"],
  { revalidate: 30, tags: ["admin-dashboard"] },
);

export async function getAdminDashboardStats(): Promise<AdminDashboardStats> {
  try {
    return await getCachedAdminDashboardStats();
  } catch (err) {
    console.error("[getAdminDashboardStats]", err);
    return {
      totalArticles: 0,
      totalCompanies: 0,
      pendingCompanies: 0,
      draftArticles: 0,
      pendingReviewArticles: 0,
      totalEvents: 0,
      totalReports: 0,
      totalUsers: 0,
      totalJobs: 0,
      totalAds: 0,
      monthArticles: 0,
    };
  }
}
