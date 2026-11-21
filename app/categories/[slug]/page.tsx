export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { listPosts } from "@/server/services/posts";
import { notFound } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function CategoryDetailPage({
  params,
  searchParams
}: {
  params: { slug: string };
  searchParams: { page?: string };
}) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  if (!category) notFound();

  const page = searchParams.page ?? 1;
  const data = await listPosts({ category: params.slug, page, pageSize: 8 });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">分类：{category.name}</h1>
        <div className="space-y-4">
          {data.items.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
          {data.items.length === 0 && <p className="text-gray-400">该分类下暂无文章</p>}
        </div>
        <Pagination page={data.page} totalPages={data.totalPages} basePath={`/categories/${params.slug}`} />
      </main>
    </>
  );
}
