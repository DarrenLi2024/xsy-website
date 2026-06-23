import { NextResponse } from "next/server";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";
import type { AdminRole } from "@prisma/client";

export type AdminApiUser = {
  id: string;
  email: string;
  role: "ADMIN";
  adminRole: AdminRole | null;
};

export async function getAdminFromRequest(req: Request): Promise<AdminApiUser | null> {
  const cookieHeader = req.headers.get("cookie") || "";
  const match = cookieHeader.match(new RegExp(`(?:^|;\\s*)${SESSION_COOKIE_NAME}=([^;]*)`));
  if (!match) return null;
  const token = match[1];
  const session = await verifySessionToken(token);
  if (!session || session.role !== "ADMIN") return null;
  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: { id: true, email: true, role: true, adminRole: true },
  });
  if (!user || user.role !== "ADMIN") return null;
  return user as AdminApiUser;
}

export function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

export function forbidden() {
  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}

export function notFound(entity = "Resource") {
  return NextResponse.json({ error: `${entity} not found` }, { status: 404 });
}

export function badRequest(message = "Bad request") {
  return NextResponse.json({ error: message }, { status: 400 });
}

export function serverError(message = "Internal server error") {
  return NextResponse.json({ error: message }, { status: 500 });
}

export function ok<T>(data: T) {
  return NextResponse.json(data);
}

export function created<T>(data: T) {
  return NextResponse.json(data, { status: 201 });
}
