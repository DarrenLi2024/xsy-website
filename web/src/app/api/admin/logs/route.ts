import { NextRequest } from "next/server";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok } from "@/lib/admin-api";

const PAGE_SIZE = 30;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const action = url.searchParams.get("action") || "";
  const resource = url.searchParams.get("resource") || "";
  const userId = url.searchParams.get("userId") || "";
  const dateFrom = url.searchParams.get("dateFrom") || "";
  const dateTo = url.searchParams.get("dateTo") || "";

  const where: Prisma.AuditLogWhereInput = {};
  if (action) where.action = action;
  if (resource) where.resource = resource;
  if (userId) where.userId = userId;
  const createdAtFilter: Prisma.DateTimeFilter = {};
  if (dateFrom) createdAtFilter.gte = new Date(dateFrom);
  if (dateTo) createdAtFilter.lte = new Date(dateTo + "T23:59:59.999Z");
  if (dateFrom || dateTo) where.createdAt = createdAtFilter;

  const [items, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
