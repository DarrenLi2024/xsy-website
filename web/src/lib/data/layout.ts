import { unstable_cache } from "next/cache";
import { getPublicPageSection } from "./page-sections";

async function fetchLayoutData() {
  const [navSection, footerSection] = await Promise.all([
    getPublicPageSection("main-nav"),
    getPublicPageSection("footer"),
  ]);

  return {
    navItems: navSection?.items ?? [],
    footerColumns: footerSection?.items ?? [],
  };
}

const getCachedLayoutData = unstable_cache(
  async () => {
    const data = await fetchLayoutData();
    if (data.navItems.length === 0 && data.footerColumns.length === 0) {
      throw new Error("Layout data empty — skip cache");
    }
    return data;
  },
  ["layout-data-v2"],
  { revalidate: 120, tags: ["layout"] },
);

export async function getLayoutData() {
  return getCachedLayoutData();
}

export type LayoutPayload = Awaited<ReturnType<typeof fetchLayoutData>>;

export const emptyLayoutPayload: LayoutPayload = {
  navItems: [],
  footerColumns: [],
};

export async function getLayoutDataSafe(): Promise<LayoutPayload> {
  try {
    return await getCachedLayoutData();
  } catch (err) {
    console.error("[getLayoutDataSafe:cache]", err);
  }

  try {
    return await fetchLayoutData();
  } catch (err) {
    console.error("[getLayoutDataSafe:fresh]", err);
    return emptyLayoutPayload;
  }
}
