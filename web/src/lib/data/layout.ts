import { unstable_cache } from "next/cache";
import { getPublicPageSection } from "./page-sections";

const fetchLayoutData = unstable_cache(
  async () => {
    const [navSection, footerSection] = await Promise.all([
      getPublicPageSection("main-nav"),
      getPublicPageSection("footer"),
    ]);

    return {
      navItems: navSection?.items ?? [],
      footerColumns: footerSection?.items ?? [],
    };
  },
  ["layout-data"],
  { revalidate: 120, tags: ["layout"] },
);

export async function getLayoutData() {
  return fetchLayoutData();
}

export type LayoutPayload = Awaited<ReturnType<typeof getLayoutData>>;

export const emptyLayoutPayload: LayoutPayload = {
  navItems: [],
  footerColumns: [],
};

export async function getLayoutDataSafe(): Promise<LayoutPayload> {
  try {
    return await getLayoutData();
  } catch (err) {
    console.error("[getLayoutData]", err);
    return emptyLayoutPayload;
  }
}
