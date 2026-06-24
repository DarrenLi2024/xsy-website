import { NextRequest } from "next/server";
import { z } from "zod";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, created, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "product:read"); } catch { return forbidden(); }

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const companyId = url.searchParams.get("companyId") || "";

  const where: Prisma.ProductWhereInput = {};
  if (q) {
    where.name = { contains: q, mode: "insensitive" };
  }
  if (companyId) {
    where.companyId = companyId;
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { company: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.product.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  companyId: z.string().min(1, "请选择所属企业"),
  name: z.string().min(1, "产品名称不能为空"),
  category: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  status: z.enum(["APPROVED", "PENDING", "REJECTED"]).optional().default("APPROVED"),
  sort: z.number().optional().default(0),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "product:write"); } catch { return forbidden(); }

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const company = await prisma.company.findUnique({
    where: { id: data.companyId },
  });
  if (!company || company.deletedAt) return badRequest("企业不存在");

  const product = await prisma.product.create({
    data: {
      companyId: data.companyId,
      name: data.name,
      category: data.category || null,
      description: data.description || null,
      status: data.status,
      sort: data.sort,
    },
    include: { company: { select: { id: true, name: true, slug: true } } },
  });

  return created(product);
}
