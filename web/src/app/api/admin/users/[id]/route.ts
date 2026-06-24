import { NextRequest } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, forbidden, ok, notFound, badRequest } from "@/lib/admin-api";
import { checkPermitOrDeny } from "@/lib/admin-auth";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "user:read"); } catch { return forbidden(); }

  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
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
  if (!user) return notFound("User");

  return ok(user);
}

const updateSchema = z.object({
  email: z.string().email().optional(),
  name: z.string().optional().nullable(),
  password: z.string().min(6).optional(),
  role: z.enum(["USER", "ADMIN", "ENTERPRISE"]).optional(),
  adminRole: z.enum(["SUPER_ADMIN", "CONTENT_EDITOR", "BUSINESS_OPS", "REVIEWER"]).optional().nullable(),
  companyId: z.string().optional().nullable(),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "user:write"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound("User");

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = updateSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  if (parsed.data.email && parsed.data.email !== existing.email) {
    const duplicate = await prisma.user.findUnique({ where: { email: parsed.data.email } });
    if (duplicate) return badRequest("Email already exists");
  }

  const data: Record<string, unknown> = {};
  if (parsed.data.email !== undefined) data.email = parsed.data.email;
  if (parsed.data.name !== undefined) data.name = parsed.data.name;
  if (parsed.data.password !== undefined) data.passwordHash = await bcrypt.hash(parsed.data.password, 10);
  if (parsed.data.role !== undefined) data.role = parsed.data.role;
  if (parsed.data.adminRole !== undefined) data.adminRole = parsed.data.adminRole;
  if (parsed.data.companyId !== undefined) data.companyId = parsed.data.companyId;

  const user = await prisma.user.update({
    where: { id },
    data,
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

  return ok(user);
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();
  try { checkPermitOrDeny(admin, "user:write"); } catch { return forbidden(); }

  const { id } = await params;
  const existing = await prisma.user.findUnique({ where: { id } });
  if (!existing) return notFound("User");

  // Deactivate user by clearing password (preventing login) rather than actual deletion
  await prisma.user.update({
    where: { id },
    data: { passwordHash: "" },
  });

  return ok({ deleted: true });
}
