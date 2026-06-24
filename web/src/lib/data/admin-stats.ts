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
    await Promise.allSettled([
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

  function settle<T>(result: PromiseSettledResult<T>, fallback: T): T {
    return result.status === "fulfilled" ? result.value : fallback;
  }

  return {
    articleTrend: fillTrend(labels, settle(articleRows, [] as { month: string; count: number }[])),
    companyTrend: fillTrend(labels, settle(companyRows, [] as { month: string; count: number }[])),
    eventTrend: fillTrend(labels, settle(eventRows, [] as { month: string; count: number }[])),
    industries: settle(industries, []).map((i: { industry: string | null; _count: { id: number } }) => ({ name: i.industry || "未分类", count: i._count.id })),
    articleStatuses: settle(articleStatuses, []).map((s: { status: string; _count: { id: number } }) => ({ status: s.status, count: s._count.id })),
    companyStatuses: settle(companyStatuses, []).map((s: { status: string; _count: { id: number } }) => ({ status: s.status, count: s._count.id })),
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
