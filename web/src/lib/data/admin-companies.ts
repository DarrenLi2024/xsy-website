import { unstable_cache } from "next/cache";
import { prisma } from "@/lib/prisma";

export type AdminCompanyOption = {
  id: string;
  name: string;
  slug: string;
};

const getCachedCompanyOptions = unstable_cache(
  async (): Promise<AdminCompanyOption[]> =>
    prisma.company.findMany({
      where: { deletedAt: null },
      select: { id: true, name: true, slug: true },
      orderBy: { name: "asc" },
      take: 300,
    }),
  ["admin-company-options"],
  { revalidate: 120, tags: ["admin-companies"] },
);

export async function getAdminCompanyOptions(): Promise<AdminCompanyOption[]> {
  try {
    return await getCachedCompanyOptions();
  } catch (err) {
    console.error("[getAdminCompanyOptions]", err);
    return [];
  }
}
