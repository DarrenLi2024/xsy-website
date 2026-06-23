import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, notFound } from "@/lib/admin-api";

const PAGE_SIZE = 50;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;

  const event = await prisma.event.findUnique({ where: { id }, select: { id: true } });
  if (!event) return notFound("Event");

  const url = new URL(req.url);
  const format = url.searchParams.get("format");

  // CSV export
  if (format === "csv") {
    const registrations = await prisma.eventRegistration.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
      include: { event: { select: { title: true } } },
    });

    const header = "姓名,邮箱,电话,公司,职位,报名时间,活动标题\n";
    const rows = registrations
      .map(
        (r) =>
          `"${r.name}","${r.email}","${r.phone || ""}","${r.company || ""}","${r.position || ""}","${r.createdAt.toISOString()}","${r.event.title}"`,
      )
      .join("\n");

    return new Response("\uFEFF" + header + rows, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="registrations-${id}.csv"`,
      },
    });
  }

  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));

  const [items, total] = await Promise.all([
    prisma.eventRegistration.findMany({
      where: { eventId: id },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.eventRegistration.count({ where: { eventId: id } }),
  ]);

  return ok({
    items,
    total,
    page,
    totalPages: Math.ceil(total / PAGE_SIZE),
  });
}
