import slugify from "./slugify";

export { slugify };

/** 生成唯一 slug 的辅助：基础 slug + 可选后缀 */
export function uniqueSlug(base: string): string {
  const s = slugify(base);
  return s || `post-${Date.now()}`;
}
