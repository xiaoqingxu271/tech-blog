export const dynamic = "force-dynamic";

import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import MarkdownRenderer from "@/components/MarkdownRenderer";
import CommentSection from "@/components/CommentSection";
import LikeButton from "@/components/LikeButton";
import ViewTracker from "@/components/ViewTracker";
import { getPostBySlug, getAdjacentPosts } from "@/server/services/posts";
import { extractToc } from "@/lib/toc";

export default async function PostDetailPage({ params }: { params: { slug: string } }) {
  const post = await getPostBySlug(params.slug);
  if (!post) notFound();

  const publishedAt = post.publishedAt ?? post.createdAt;
  const { prev, next } = await getAdjacentPosts(post.slug, new Date(publishedAt), post.id);
  const toc = extractToc(post.contentMd);
  const wordCount = post.contentMd.replace(/\s/g, "").length;

  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-5xl gap-8 px-4 py-8">
        <article className="min-w-0 flex-1">
          <h1 className="text-3xl font-bold">{post.title}</h1>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
            <time>{format(new Date(publishedAt), "yyyy-MM-dd")}</time>
            <span>👁 {post.viewCount}</span>
            <span>{wordCount} 字</span>
            {post.category && (
              <Link href={`/categories/${post.category.slug}`} className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-600 dark:bg-slate-800">
                {post.category.name}
              </Link>
            )}
          </div>

          <div className="mt-6">
            <MarkdownRenderer content={post.contentMd} />
          </div>

          <div className="mt-8 flex items-center justify-between">
            <div className="flex flex-wrap gap-2">
              {post.tags.map(({ tag }) => (
                <Link key={tag.slug} href={`/tags/${tag.slug}`} className="rounded-full bg-gray-100 px-3 py-1 text-xs text-gray-600 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-300">
                  #{tag.name}
                </Link>
              ))}
            </div>
            <LikeButton postId={post.id} initialCount={0} />
          </div>

          <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4 text-xs text-gray-500 dark:border-gray-800 dark:bg-slate-800/50">
            本文版权归作者所有，转载请注明出处。
          </div>

          <nav className="mt-8 grid gap-3 sm:grid-cols-2">
            {prev ? (
              <Link href={`/posts/${prev.slug}`} className="rounded-lg border border-gray-200 p-3 text-sm hover:border-brand-500 dark:border-gray-800">
                ← 上一篇：{prev.title}
              </Link>
            ) : <span />}
            {next ? (
              <Link href={`/posts/${next.slug}`} className="rounded-lg border border-gray-200 p-3 text-right text-sm hover:border-brand-500 dark:border-gray-800">
                下一篇：{next.title} →
              </Link>
            ) : <span />}
          </nav>

          <CommentSection postId={post.id} />
          <ViewTracker slug={post.slug} />
        </article>

        {toc.length > 0 && (
          <aside className="hidden w-56 shrink-0 lg:block">
            <div className="sticky top-20">
              <h3 className="mb-2 text-sm font-semibold text-gray-500">目录</h3>
              <ul className="space-y-1 text-sm">
                {toc.map((t, i) => (
                  <li key={i} style={{ paddingLeft: (t.level - 1) * 12 }}>
                    <a href={`#${t.id}`} className="text-gray-500 hover:text-brand-600">
                      {t.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>
        )}
      </main>
    </>
  );
}
