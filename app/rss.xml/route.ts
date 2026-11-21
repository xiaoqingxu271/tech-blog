export const dynamic = "force-dynamic";

import { listPosts } from "@/server/services/posts";
import { getSettings } from "@/server/services/settings";

export async function GET() {
  const { items } = await listPosts({ pageSize: 20 });
  const settings = await getSettings();
  const site = process.env.NEXTAUTH_URL || "http://localhost:3000";

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>${escapeXml(settings.site_name)}</title>
    <link>${site}</link>
    <description>${escapeXml(settings.site_description)}</description>
    <language>zh-CN</language>
${items
  .map(
    (p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${site}/posts/${p.slug}</link>
      <guid>${site}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt ?? p.createdAt).toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt ?? "")}</description>
    </item>`
  )
  .join("\n")}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" }
  });
}

function escapeXml(s: string): string {
  return (s ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
