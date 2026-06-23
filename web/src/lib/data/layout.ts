import { getPublicPageSection } from "./page-sections";

export async function getLayoutData() {
  const [navSection, footerSection] = await Promise.all([
    getPublicPageSection("main-nav"),
    getPublicPageSection("footer"),
  ]);

  return {
    navItems: navSection?.items ?? [],
    footerColumns: footerSection?.items ?? [],
  };
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
