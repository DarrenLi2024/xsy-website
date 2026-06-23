import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, created, notFound, badRequest } from "@/lib/admin-api";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const section = await prisma.pageSection.findUnique({ where: { id } });
  if (!section) return notFound("PageSection");

  const items = await prisma.pageSectionItem.findMany({
    where: { sectionId: id },
    orderBy: { sort: "asc" },
  });

  return ok(items);
}

const createSchema = z.object({
  title: z.string().optional().default(""),
  subtitle: z.string().optional().default(""),
  description: z.string().optional().default(""),
  image: z.string().optional().default(""),
  link: z.string().optional().default(""),
  linkText: z.string().optional().default(""),
  sort: z.number().int().optional().default(0),
  active: z.boolean().optional().default(true),
  startDate: z.string().optional().nullable().default(null),
  endDate: z.string().optional().nullable().default(null),
  extra: z.any().optional(),
});

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const { id } = await params;
  const section = await prisma.pageSection.findUnique({ where: { id } });
  if (!section) return notFound("PageSection");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = createSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const data = parsed.data;
  const item = await prisma.pageSectionItem.create({
    data: {
      sectionId: id,
      title: data.title || null,
      subtitle: data.subtitle || null,
      description: data.description || null,
      image: data.image || null,
      link: data.link || null,
      linkText: data.linkText || null,
      sort: data.sort,
      active: data.active,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
      extra: data.extra ?? undefined,
    },
  });

  return created(item);
}
