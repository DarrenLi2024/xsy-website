import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

const getCachedAwardYears = unstable_cache(
  async (): Promise<number[]> => {
    const rows = await prisma.awardCampaign.findMany({
      select: { year: true },
      distinct: ["year"],
      orderBy: { year: "desc" },
    });
    return rows.map((r) => r.year);
  },
  ["admin-award-years"],
  { revalidate: 300 },
);

export async function getAdminAwardYears(): Promise<number[]> {
  try {
    return await getCachedAwardYears();
  } catch (err) {
    console.error("[getAdminAwardYears]", err);
    return [];
  }
}
