import { revalidateTag } from "next/cache";

const IMMEDIATE = { expire: 0 } as const;

/** 首页内容变更后调用 */
export function invalidateHomeCache() {
  revalidateTag("home", IMMEDIATE);
}

/** 导航/页脚等布局区块变更后调用 */
export function invalidateLayoutCache() {
  revalidateTag("layout", IMMEDIATE);
}

/** 文章、企业、活动等前台可见内容变更 */
export function invalidatePublicContentCaches() {
  revalidateTag("home", IMMEDIATE);
  revalidateTag("layout", IMMEDIATE);
}
