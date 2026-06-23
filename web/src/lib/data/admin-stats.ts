import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AdminChartStats = {
  articleTrend: { label: string; count: number }[];
  companyTrend: { label: string; count: number }[];
  eventTrend: { label: string; count: number }[];
  industries: { name: string; count: number }[];
  articleStatuses: { status: string; count: number }[];
  companyStatuses: { status: string; count: number }[];
};

function monthLabels(): string[] {
  const now = new Date();
  const labels: string[] = [];
  for (let i = 11; i >= 0; i--) {
    const dt = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`);
  }
  return labels;
}

function fillTrend(
  labels: string[],
  rows: { month: string; count: number }[],
): { label: string; count: number }[] {
  const map = new Map(rows.map((r) => [r.month, r.count]));
  return labels.map((label) => ({ label, count: map.get(label) ?? 0 }));
}

async function fetchAdminChartStats(): Promise<AdminChartStats> {
  const labels = monthLabels();
  const rangeStart = new Date();
  rangeStart.setMonth(rangeStart.getMonth() - 11, 1);
  rangeStart.setHours(0, 0, 0, 0);

  const [articleRows, companyRows, eventRows, industries, articleStatuses, companyStatuses] =
    await Promise.all([
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT to_char(date_trunc('month', "publishedAt"), 'YYYY-MM') AS month,
               COUNT(*)::int AS count
        FROM "Article"
        WHERE "deletedAt" IS NULL
          AND "publishedAt" IS NOT NULL
          AND "publishedAt" >= ${rangeStart}
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT to_char(date_trunc('month', "createdAt"), 'YYYY-MM') AS month,
               COUNT(*)::int AS count
        FROM "Company"
        WHERE "deletedAt" IS NULL
          AND "createdAt" >= ${rangeStart}
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.$queryRaw<{ month: string; count: number }[]>`
        SELECT to_char(date_trunc('month', "startDate"), 'YYYY-MM') AS month,
               COUNT(*)::int AS count
        FROM "Event"
        WHERE "startDate" >= ${rangeStart}
        GROUP BY 1
        ORDER BY 1
      `,
      prisma.company.groupBy({
        by: ["industry"],
        where: { deletedAt: null, industry: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 8,
      }),
      prisma.article.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
      prisma.company.groupBy({
        by: ["status"],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

  return {
    articleTrend: fillTrend(labels, articleRows),
    companyTrend: fillTrend(labels, companyRows),
    eventTrend: fillTrend(labels, eventRows),
    industries: industries.map((i) => ({ name: i.industry || "未分类", count: i._count.id })),
    articleStatuses: articleStatuses.map((s) => ({ status: s.status, count: s._count.id })),
    companyStatuses: companyStatuses.map((s) => ({ status: s.status, count: s._count.id })),
  };
}

const getCachedAdminChartStats = unstable_cache(
  fetchAdminChartStats,
  ["admin-chart-stats"],
  { revalidate: 60, tags: ["admin-stats"] },
);

export async function getAdminChartStats(): Promise<AdminChartStats> {
  try {
    return await getCachedAdminChartStats();
  } catch (err) {
    console.error("[getAdminChartStats]", err);
    const empty = monthLabels().map((label) => ({ label, count: 0 }));
    return {
      articleTrend: empty,
      companyTrend: empty,
      eventTrend: empty,
      industries: [],
      articleStatuses: [],
      companyStatuses: [],
    };
  }
}
