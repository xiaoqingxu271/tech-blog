/** 轻量 slug 生成：英文/数字保留，中文转拼音成本高，此处用去掉非法字符 + 后缀兜底 */
export default function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
