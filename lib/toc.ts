export type TocItem = { id: string; text: string; level: number };

/** 从 Markdown 提取标题生成目录（简化版：只处理 # 级 ATX 标题） */
export function extractToc(markdown: string): TocItem[] {
  const lines = markdown.split("\n");
  const items: TocItem[] = [];
  let inCode = false;
  for (const line of lines) {
    if (/^```/.test(line.trim())) {
      inCode = !inCode;
      continue;
    }
    if (inCode) continue;
    const m = /^(#{1,4})\s+(.+)$/.exec(line);
    if (m) {
      const level = m[1].length;
      const text = m[2].trim();
      const id = text
        .toLowerCase()
        .replace(/[^\w\u4e00-\u9fa5]+/g, "-")
        .replace(/^-+|-+$/g, "");
      items.push({ id, text, level });
    }
  }
  return items;
}
