import { NextRequest } from "next/server";
import { getEnterpriseFromRequest, unauthorized, ok } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const companyId = user.companyId;

  const [products, jobs, articles, events] = await Promise.all([
    prisma.product.count({ where: { companyId } }),
    prisma.job.count({ where: { companyId, status: "PUBLISHED" } }),
    prisma.article.count({ where: { companyId, deletedAt: null } }),
    prisma.event.count({ where: { companyId } }),
  ]);

  return ok({ products, jobs, articles, events });
}
