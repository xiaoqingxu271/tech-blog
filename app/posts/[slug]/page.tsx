export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import ViewTracker from "@/components/ViewTracker";
import { getPostBySlug, getAdjacentPosts } from "@/server/services/posts";
import { getSettings } from "@/server/services/settings";
import { extractToc } from "@/lib/toc";

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const [post, settings] = await Promise.all([
    getPostBySlug(params.slug),
    getSettings()
  ]);
  if (!post) notFound();
  const siteName = settings.site_name || "极光博客";

  const publishedAt = post.publishedAt ?? post.createdAt;
  const { prev, next } = await getAdjacentPosts(post.slug, new Date(publishedAt), post.id);
  const toc = extractToc(post.contentMd);
  const wordCount = post.contentMd.replace(/\s/g, "").length;

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto flex max-w-6xl gap-6 px-4 pb-8 pt-8">
        <article className="min-w-0 flex-1">
          {/* 封面图 */}
          {post.cover && (
            <div className="glass mb-6 overflow-hidden rounded-2xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={post.cover} alt="" className="max-h-96 w-full object-cover" />
            </div>
          )}

          {/* 正文玻璃卡 */}
          <div className="glass p-6 sm:p-8">
            <h1 className="text-3xl font-bold leading-tight">{post.title}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3 border-b border-white/10 pb-4 text-xs text-muted">
              <span className="inline-flex items-center gap-1.5">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-500 text-[10px] font-bold text-white">
                  {(post.author?.name ?? siteName).slice(0, 1)}
                </span>
                {post.author?.name ?? siteName}
              </span>
              <time>{format(new Date(publishedAt), "yyyy-MM-dd")}</time>
              <span>👁 {post.viewCount}</span>
              <span>{wordCount} 字</span>
              {post.category && (
                <Link
                  href={`/categories/${post.category.slug}`}
                  className="rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-brand-300 transition hover:border-brand-400/60"
                >
                  {post.category.name}
                </Link>
              )}
            </div>

            <div className="mt-6">
              <MarkdownRenderer content={post.contentMd} />
            </div>

            {/* 标签 + 点赞互动条 */}
            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6">
              <div className="flex flex-wrap gap-2">
                {post.tags.map(({ tag }) => (
                  <Link
                    key={tag.slug}
                    href={`/tags/${tag.slug}`}
                    className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted transition hover:border-violet-400/50 hover:text-violet-300"
                  >
                    #{tag.name}
                  </Link>
                ))}
              </div>
              <LikeButton postId={post.id} initialCount={0} />
            </div>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted">
              本文版权归 {post.author?.name ?? siteName} 所有，转载请注明出处。
            </div>
          </div>

          {/* 上一篇 / 下一篇 */}
          <nav className="mt-6 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/posts/${prev.slug}`} className="glass glass-hover p-4 text-sm">
                <span className="text-xs text-muted">← 上一篇</span>
                <p className="mt-1 line-clamp-1 font-medium">{prev.title}</p>
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/posts/${next.slug}`} className="glass glass-hover p-4 text-right text-sm">
                <span className="text-xs text-muted">下一篇 →</span>
                <p className="mt-1 line-clamp-1 font-medium">{next.title}</p>
              </Link>
            ) : <span />}
          </nav>

          <div className="mt-6">
            <CommentSection postId={post.id} />
          </div>
          <ViewTracker slug={post.slug} />
        </article>

        {/* 右栏目录 */}
        {toc.length > 0 && (
          <aside className="hidden w-60 shrink-0 lg:block">
            <div className="glass sticky top-28 p-5">
              <h3 className="mb-3 text-sm font-semibold">目录</h3>
              <ul className="space-y-1.5 text-sm">
                {toc.map((t, i) => (
                  <li key={i} style={{ paddingLeft: (t.level - 1) * 14 }}>
                    <a
                      href={`#${t.id}`}
                      className="block border-l-2 border-transparent py-0.5 pl-2 text-muted transition hover:border-brand-400 hover:text-brand-300"
                    >
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
