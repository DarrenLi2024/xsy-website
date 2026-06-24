/**
 * 将中文/英文名称转换为 URL 友好的 slug。
 * 保留中文汉字、字母数字和连字符。
 */
export function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^\w一-鿿]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
