import { NextRequest } from "next/server";
import { z } from "zod";
import { AdminRole, UserRole, type Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, created, badRequest } from "@/lib/admin-api";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const role = url.searchParams.get("role") || "";
  const adminRole = url.searchParams.get("adminRole") || "";

  const where: Prisma.UserWhereInput = {};
  if (role && (Object.values(UserRole) as string[]).includes(role)) {
    where.role = role as UserRole;
  }
  if (adminRole && (Object.values(AdminRole) as string[]).includes(adminRole)) {
    where.adminRole = adminRole as AdminRole;
  }
  if (q) {
    where.OR = [
      { email: { contains: q, mode: "insensitive" } },
      { name: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        adminRole: true,
        companyId: true,
        createdAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  email: z.string().email(),
  name: z.string().optional().default(""),
  password: z.string().min(6),
  role: z.enum(["USER", "ADMIN", "ENTERPRISE"]).optional().default("USER"),
  adminRole: z.enum(["SUPER_ADMIN", "CONTENT_EDITOR", "BUSINESS_OPS", "REVIEWER"]).optional().nullable().default(null),
  companyId: z.string().optional().nullable().default(null),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const existing = await prisma.user.findUnique({ where: { email: parsed.data.email } });
  if (existing) return badRequest("Email already exists");

  const passwordHash = await bcrypt.hash(parsed.data.password, 10);

  const user = await prisma.user.create({
    data: {
      email: parsed.data.email,
      name: parsed.data.name || null,
      passwordHash,
      role: parsed.data.role,
      adminRole: parsed.data.adminRole,
      companyId: parsed.data.companyId,
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      adminRole: true,
      companyId: true,
      createdAt: true,
    },
  });

  return created(user);
}
