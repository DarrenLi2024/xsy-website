import { NextRequest } from "next/server";
import { getAdminFromRequest, unauthorized, ok } from "@/lib/admin-api";
import { getAdminChartStats } from "@/lib/data/admin-stats";

export const revalidate = 60;

export async function GET(req: NextRequest) {
  const admin = await getAdminFromRequest(req);
  if (!admin) return unauthorized();

  const stats = await getAdminChartStats();
  return ok(stats);
}
