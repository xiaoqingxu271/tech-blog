export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import PostCard from "@/components/PostCard";
import Pagination from "@/components/Pagination";
import Footer from "@/components/Footer";
import { listPosts } from "@/server/services/posts";
import { getSettings } from "@/server/services/settings";

export default async function HomePage({
  searchParams
}: {
  searchParams: { page?: string };
}) {
  const [data, settings] = await Promise.all([
    listPosts({ page: searchParams.page ?? 1, pageSize: 8 }),
    getSettings()
  ]);
  const siteName = settings.site_name || "极光博客";

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-6xl px-4 pb-8">
        {/* Hero 玻璃卡：标语 + 开始阅读 + 签名文案 */}
        <section className="glass mt-6 flex flex-col items-start justify-between gap-6 overflow-hidden rounded-3xl bg-gradient-to-br from-white/8 to-violet-500/8 p-8 sm:flex-row sm:items-center sm:p-10">
          <div>
            <p className="mb-3 inline-block rounded-full border border-brand-400/30 bg-brand-400/10 px-3 py-1 text-xs text-brand-300">
              ✨ 记录技术 · 分享世界
            </p>
            <h1 className="text-3xl font-bold leading-tight sm:text-4xl">
              {siteName}
              <span className="text-aurora"> 记录技术 · 分享世界</span>
            </h1>
            <p className="mt-3 max-w-xl text-sm text-muted sm:text-base">
              {settings.site_description || "记录学习、踩坑与源码解读"}
            </p>
            <Link
              href="/archive"
              className="btn-aurora mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-medium text-white"
            >
              开始阅读 →
            </Link>
          </div>
          <div className="hidden shrink-0 select-none text-right lg:block">
            <p className="text-2xl font-semibold italic text-white/85" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Code. A Brighter
            </p>
            <p className="text-aurora text-3xl font-bold italic" style={{ fontFamily: "Georgia, 'Times New Roman', serif" }}>
              Tomorrow.
            </p>
            <p className="mt-3 text-xs text-muted">共 {data.total} 篇文章</p>
          </div>
        </section>

        {data.items.length === 0 ? (
          <p className="glass mt-8 py-16 text-center text-muted">还没有已发布的文章。</p>
        ) : (
          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {data.items.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        )}

        <Pagination page={data.page} totalPages={data.totalPages} basePath="/" />
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
