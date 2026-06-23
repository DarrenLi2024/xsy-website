import { NextRequest } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { getAdminFromRequest, unauthorized, ok, badRequest } from "@/lib/admin-api";
import type { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const settings = await prisma.setting.findMany();
  const map: Record<string, unknown> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return ok(map);
}

const upsertSchema = z.record(z.string(), z.unknown());

export async function PUT(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const json = await req.json().catch(() => null);
  if (!json) return badRequest("Invalid JSON");

  const parsed = upsertSchema.safeParse(json);
  if (!parsed.success) return badRequest(parsed.error.message);

  const keys = Object.keys(parsed.data);

  await prisma.$transaction(
    keys.map((key) =>
      prisma.setting.upsert({
        where: { key },
        create: { key, value: parsed.data[key] as Prisma.InputJsonValue },
        update: { value: parsed.data[key] as Prisma.InputJsonValue },
      })
    )
  );

  const settings = await prisma.setting.findMany();
  const map: Record<string, unknown> = {};
  for (const s of settings) {
    map[s.key] = s.value;
  }

  return ok(map);
}
