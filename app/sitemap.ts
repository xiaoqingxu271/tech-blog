export const dynamic = "force-dynamic";

import prisma from "@/lib/prisma";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXTAUTH_URL || "http://localhost:3000";
  // 直接查全部已发布文章，不走分页接口（避免被 pageSize 上限截断）
  const items = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true, updatedAt: true }
  });
  const staticRoutes = ["", "/categories", "/tags", "/archive", "/about", "/links", "/search"].map(
    (p) => ({
      url: `${site}${p}`,
      lastModified: new Date()
    })
  );
  const postRoutes = items.map((p) => ({
    url: `${site}/posts/${p.slug}`,
    lastModified: new Date(p.updatedAt)
  }));
  return [...staticRoutes, ...postRoutes];
}
