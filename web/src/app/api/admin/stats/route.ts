import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok } from "@/lib/admin-api";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const now = new Date();
  const months: { start: Date; end: Date; label: string }[] = [];
  for (let i = 11; i >= 0; i--) {
    const y = now.getFullYear();
    const m = now.getMonth() - i;
    const dt = new Date(y, m, 1);
    months.push({
      start: dt,
      end: new Date(y, m + 1, 0, 23, 59, 59),
      label: `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}`,
    });
  }

  type TrendItem = { label: string; count: number };
  const articleTrend: TrendItem[] = [];
  const companyTrend: TrendItem[] = [];
  const eventTrend: TrendItem[] = [];

  for (const m of months) {
    const [ac, cc, ec] = await Promise.all([
      prisma.article.count({
        where: { publishedAt: { gte: m.start, lte: m.end }, deletedAt: null },
      }),
      prisma.company.count({
        where: { createdAt: { gte: m.start, lte: m.end }, deletedAt: null },
      }),
      prisma.event.count({
        where: { startDate: { gte: m.start, lte: m.end } },
      }),
    ]);
    articleTrend.push({ label: m.label, count: ac });
    companyTrend.push({ label: m.label, count: cc });
    eventTrend.push({ label: m.label, count: ec });
  }

  // Industry distribution
  const industries = await prisma.company.groupBy({
    by: ["industry"],
    where: { deletedAt: null, industry: { not: null } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 8,
  });

  // Article status distribution
  const articleStatuses = await prisma.article.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { id: true },
  });

  // Company status distribution
  const companyStatuses = await prisma.company.groupBy({
    by: ["status"],
    where: { deletedAt: null },
    _count: { id: true },
  });

  return ok({
    articleTrend,
    companyTrend,
    eventTrend,
    industries: industries.map((i) => ({ name: i.industry || "未分类", count: i._count.id })),
    articleStatuses: articleStatuses.map((s) => ({ status: s.status, count: s._count.id })),
    companyStatuses: companyStatuses.map((s) => ({ status: s.status, count: s._count.id })),
  });
}
