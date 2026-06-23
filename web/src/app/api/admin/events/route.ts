import { NextRequest } from "next/server";
import { z } from "zod";
import { EventStatus, EventType, type Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, created, badRequest } from "@/lib/admin-api";

const PAGE_SIZE = 20;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const q = url.searchParams.get("q") || "";
  const type = url.searchParams.get("type") || "";
  const status = url.searchParams.get("status") || "";

  const where: Prisma.EventWhereInput = {};
  if (type && (Object.values(EventType) as string[]).includes(type)) {
    where.type = type as EventType;
  }
  if (status && (Object.values(EventStatus) as string[]).includes(status)) {
    where.status = status as EventStatus;
  }
  if (q) {
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { description: { contains: q, mode: "insensitive" } },
    ];
  }

  const [items, total] = await Promise.all([
    prisma.event.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
      include: { company: { select: { id: true, name: true, slug: true } } },
    }),
    prisma.event.count({ where }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}

const createSchema = z.object({
  title: z.string().min(1, "标题不能为空"),
  description: z.string().optional().default(""),
  type: z.enum(["EXHIBITION", "CONFERENCE", "WEBINAR", "SALON", "WORKSHOP"]),
  startDate: z.string().min(1, "开始时间不能为空").refine((v) => !isNaN(Date.parse(v)), "无效的日期格式"),
  endDate: z.string().min(1, "结束时间不能为空").refine((v) => !isNaN(Date.parse(v)), "无效的日期格式"),
  location: z.string().optional().default(""),
  coverImage: z.string().optional().default(""),
  capacity: z.number().int().optional().nullable().default(null),
  registrationDeadline: z.string().optional().nullable().default(null),
  status: z.enum(["UPCOMING", "ONGOING", "COMPLETED", "CANCELLED"]).optional().default("UPCOMING"),
  isFeatured: z.boolean().optional().default(false),
  companyId: z.string().optional().nullable().default(null),
});

export async function POST(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const event = await prisma.event.create({
    data: {
      title: data.title,
      description: data.description || null,
      type: data.type,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
      location: data.location || null,
      coverImage: data.coverImage || null,
      capacity: data.capacity ?? null,
      registrationDeadline: data.registrationDeadline ? new Date(data.registrationDeadline) : null,
      status: data.status,
      isFeatured: data.isFeatured,
      companyId: data.companyId || null,
    },
  });

  return created(event);
}
