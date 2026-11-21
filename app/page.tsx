export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import { listPosts } from "@/server/services/posts";

export default async function HomePage({
  searchParams
}: {
  searchParams: { page?: string };
}) {
  const data = await listPosts({ page: searchParams.page ?? 1, pageSize: 8 });

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-brand-600 to-brand-500 p-8 text-white">
          <h1 className="text-2xl font-bold">技术成长博客</h1>
          <p className="mt-2 text-sm text-white/90">记录学习、踩坑与源码解读，持续沉淀技术品牌。</p>
        </section>

        {data.items.length === 0 ? (
          <p className="py-16 text-center text-gray-400">还没有已发布的文章。</p>
        ) : (
          <div className="space-y-4">
            {data.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}

        <Pagination page={data.page} totalPages={data.totalPages} basePath="/" />
      </main>
      <footer className="mt-16 border-t border-gray-200 py-8 text-center text-xs text-gray-400 dark:border-gray-800">
        © {new Date().getFullYear()} 技术成长博客 · Powered by Next.js
      </footer>
    </>
  );
}
