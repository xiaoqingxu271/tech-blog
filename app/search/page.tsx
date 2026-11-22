export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Pagination from "@/components/Pagination";
import { listPosts } from "@/server/services/posts";
import { getSettings } from "@/server/services/settings";

// 热门搜索胶囊（静态展示，帮助用户快速发起搜索）
const hotKeywords = ["Vue", "React", "TypeScript", "Docker", "Next.js"];

export default async function SearchPage({
  searchParams
}: {
  searchParams: { q?: string; page?: string };
}) {
  const [q, settings] = await Promise.all([
    (searchParams.q ?? "").trim(),
    getSettings()
  ]);
  const siteName = settings.site_name || "极光博客";
  const page = searchParams.page ?? 1;
  const data = q ? await listPosts({ keyword: q, page, pageSize: 8 }) : null;

  // 标题/摘要里的关键词高亮（青色），直接用 HTML 注入需要转义
  const escape = (s: string) =>
    s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const highlight = (s: string) =>
    q
      ? escape(s).replace(new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "gi"), (m) => `<mark class="bg-transparent text-brand-300 font-semibold">${m}</mark>`)
      : escape(s);

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-4xl px-4 pb-8 pt-12">
        {/* 居中大搜索框 */}
        <form action="/search" method="get" className="relative mx-auto mb-5 max-w-2xl">
          <input
            name="q"
            defaultValue={q}
            placeholder="搜索文章…"
            className="glass w-full rounded-full py-4 pl-6 pr-28 text-base outline-none transition focus:border-brand-400/60 focus:shadow-glow"
          />
          <button
            type="submit"
            className="btn-aurora absolute right-2 top-1/2 -translate-y-1/2 rounded-full px-5 py-2 text-sm font-medium text-white"
          >
            搜索
          </button>
        </form>

        {!q && (
          <div className="mb-8 flex flex-wrap items-center justify-center gap-2">
            <span className="text-xs text-muted">热门搜索：</span>
            {hotKeywords.map((k) => (
              <Link
                key={k}
                href={`/search?q=${encodeURIComponent(k)}`}
                className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs text-muted transition hover:border-brand-400/50 hover:text-brand-300"
              >
                {k}
              </Link>
            ))}
          </div>
        )}

        {q && data && (
          <>
            <p className="mb-4 text-sm text-muted">
              找到 {data.total} 篇与「<span className="text-brand-300">{q}</span>」相关的文章
            </p>
            <div className="space-y-4">
              {data.items.map((p) => (
                <div key={p.id} className="glass glass-hover p-5">
                  <Link href={`/posts/${p.slug}`} className="text-lg font-semibold transition hover:text-brand-300">
                    {/* 关键词高亮：标题 */}
                    <span dangerouslySetInnerHTML={{ __html: highlight(p.title) }} />
                  </Link>
                  {p.excerpt && (
                    <p className="mt-1.5 line-clamp-2 text-sm text-muted">
                      <span dangerouslySetInnerHTML={{ __html: highlight(p.excerpt) }} />
                    </p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-xs text-muted">
                    <div className="flex flex-wrap gap-2">
                      {p.category && (
                        <Link
                          href={`/categories/${p.category.slug}`}
                          className="rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-brand-300"
                        >
                          {p.category.name}
                        </Link>
                      )}
                      {p.tags?.slice(0, 3).map(({ tag }) => (
                        <Link
                          key={tag.slug}
                          href={`/tags/${tag.slug}`}
                          className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 transition hover:border-violet-400/50 hover:text-violet-300"
                        >
                          #{tag.name}
                        </Link>
                      ))}
                    </div>
                    <time>{format(new Date(p.publishedAt ?? p.createdAt ?? new Date()), "yyyy-MM-dd")}</time>
                  </div>
                </div>
              ))}
              {data.items.length === 0 && (
                <p className="glass py-12 text-center text-muted">没有匹配的文章，换个关键词试试？</p>
              )}
            </div>
            <Pagination page={data.page} totalPages={data.totalPages} basePath={`/search?q=${encodeURIComponent(q)}`} />
          </>
        )}
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
