import { NextRequest } from "next/server";
import { getEnterpriseFromRequest, unauthorized, ok } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const job = await prisma.job.findFirst({
    where: { id, companyId: user.companyId },
  });
  if (!job) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const PAGE_SIZE = 20;

  const [items, total] = await Promise.all([
    prisma.jobApplication.findMany({
      where: { jobId: id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.jobApplication.count({ where: { jobId: id } }),
  ]);

  return ok({ items, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}
