import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getEnterpriseFromRequest, enterpriseUnauthorized, ok, notFound } from "@/lib/enterprise-api";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return enterpriseUnauthorized();

  const { id } = await params;
  const article = await prisma.softArticle.findFirst({
    where: { id, companyId: user.companyId },
    include: {
      channels: { include: { channel: true } },
      metrics: { orderBy: { date: "desc" }, take: 30 },
    },
  });
  if (!article) return notFound("SoftArticle");
  return ok(article);
}
