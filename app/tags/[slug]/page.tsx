export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { listPosts } from "@/server/services/posts";
import { getSettings } from "@/server/services/settings";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function TagDetailPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const tag = await prisma.tag.findUnique({ where: { slug: params.slug } });
  if (!tag) notFound();

  const [page, settings] = await Promise.all([
    searchParams.page ?? 1,
    getSettings()
  ]);
  const siteName = settings.site_name || "极光博客";
  const data = await listPosts({ tag: params.slug, page, pageSize: 8 });

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-5xl px-4 pb-8 pt-10">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-widest text-brand-300">Tag</p>
          <h1 className="mt-1 text-3xl font-bold">#{tag.name}</h1>
          <p className="mt-2 text-sm text-muted">共 {data.total} 篇文章</p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          {data.items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {data.items.length === 0 && <p className="glass py-12 text-center text-muted sm:col-span-2">该标签下暂无文章</p>}
        </div>
        <Pagination page={data.page} totalPages={data.totalPages} basePath={`/tags/${params.slug}`} />
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
