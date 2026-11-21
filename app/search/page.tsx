export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import { listPosts } from "@/server/services/posts";

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const q = (searchParams.q ?? "").trim();
  const page = searchParams.page ?? 1;
  const data = q ? await listPosts({ keyword: q, page, pageSize: 8 }) : null;

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-4 text-2xl font-bold">搜索</h1>
        <form action="/search" method="get" className="mb-6 flex gap-2">
          <input
            name="q"
            defaultValue={q}
            placeholder="输入关键词..."
            className="flex-1 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-900"
          />
          <button type="submit" className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
            搜索
          </button>
        </form>

        {q && data && (
          <>
            <p className="mb-4 text-sm text-gray-500">
              找到 {data.total} 条与「{q}」相关的结果
            </p>
            <div className="space-y-4">
              {data.items.map((p) => (
                <PostCard key={p.id} post={p} />
              ))}
              {data.items.length === 0 && <p className="text-gray-400">没有匹配的文章</p>}
            </div>
          </>
        )}
      </main>
    </>
  );
}
