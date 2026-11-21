export const dynamic = "force-dynamic";

import { listPosts } from "@/server/services/posts";
import type { MetadataRoute } from "next";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const site = process.env.NEXTAUTH_URL || "http://localhost:3000";
  const { items } = await listPosts({ pageSize: 500 });
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
