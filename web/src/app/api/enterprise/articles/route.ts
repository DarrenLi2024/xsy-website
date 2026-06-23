import { NextRequest } from "next/server";
import { getEnterpriseFromRequest, unauthorized, ok } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));

  const where = { companyId: user.companyId, deletedAt: null as Date | null };

  const [items, total] = await Promise.all([
    prisma.article.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        title: true,
        slug: true,
        category: true,
        status: true,
        author: true,
        viewCount: true,
        publishedAt: true,
        createdAt: true,
      },
    }),
    prisma.article.count({ where }),
  ]);

  return ok({ items, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}
