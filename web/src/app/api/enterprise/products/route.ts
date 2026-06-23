import { NextRequest } from "next/server";
import { z } from "zod";
import { getEnterpriseFromRequest, unauthorized, ok, created, badRequest } from "@/lib/enterprise-api";
import { prisma } from "@/lib/prisma";

const PAGE_SIZE = 20;

const createProductSchema = z.object({
  name: z.string().min(1, "产品名称不能为空").max(200),
  category: z.string().max(100).optional().nullable(),
  description: z.string().max(5000).optional().nullable(),
  parameters: z.any().optional().nullable(),
  images: z.array(z.string()).optional().nullable(),
  datasheetUrl: z.string().url("数据手册链接格式不正确").optional().nullable().or(z.literal("")),
  sort: z.number().int().min(0).optional().default(0),
});

export async function GET(req: NextRequest) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";

  const where: Record<string, unknown> = { companyId: user.companyId };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { category: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      orderBy: [{ sort: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.product.count({ where }),
  ]);

  return ok({ items, total, page, totalPages: Math.ceil(total / PAGE_SIZE) });
}

export async function POST(req: Request) {
  const user = await getEnterpriseFromRequest(req);
  if (!user || !user.companyId) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createProductSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.issues[0]?.message ?? "Invalid data");

  const product = await prisma.product.create({
    data: {
      companyId: user.companyId,
      name: parsed.data.name,
      category: parsed.data.category || null,
      description: parsed.data.description || null,
      parameters: parsed.data.parameters || null,
      images: parsed.data.images ?? undefined,
      datasheetUrl: parsed.data.datasheetUrl || null,
      sort: parsed.data.sort ?? 0,
    },
  });

  return created(product);
}
