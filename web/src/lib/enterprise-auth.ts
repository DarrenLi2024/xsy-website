import { cache } from "react";
import { cookies } from "next/headers";
import { verifySessionToken, SESSION_COOKIE_NAME } from "@/lib/auth/session";
import { prisma } from "@/lib/prisma";

export type EnterpriseUser = {
  id: string;
  email: string;
  name: string | null;
  role: "ENTERPRISE";
  companyId: string | null;
  company: {
    id: string;
    name: string;
    slug: string;
    logo: string | null;
    description: string | null;
    website: string | null;
    industry: string | null;
    scale: string | null;
    city: string | null;
    status: string;
    socialLinks: unknown | null;
  } | null;
};

export const getEnterpriseUser = cache(async (): Promise<EnterpriseUser | null> => {
  const token = (await cookies()).get(SESSION_COOKIE_NAME)?.value;
  if (!token) return null;
  const session = await verifySessionToken(token);
  if (!session || (session.role !== "ENTERPRISE" && session.role !== "ADMIN")) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.sub },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      companyId: true,
      company: {
        select: {
          id: true,
          name: true,
          slug: true,
          logo: true,
          description: true,
          website: true,
          industry: true,
          scale: true,
          city: true,
          status: true,
          socialLinks: true,
        },
      },
    },
  });
  if (!user) return null;
  return user as unknown as EnterpriseUser;
});

export async function requireEnterprise(): Promise<EnterpriseUser> {
  const user = await getEnterpriseUser();
  if (!user) {
    throw new Error("Unauthorized - redirect to /enterprise/login");
  }
  return user;
}
