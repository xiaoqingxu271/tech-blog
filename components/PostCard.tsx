import Link from "next/link";
import { format } from "date-fns";

type PostCardData = {
  title: string;
  slug: string;
  excerpt?: string | null;
  cover?: string | null;
  publishedAt?: Date | string | null;
  createdAt?: Date | string | null;
  viewCount?: number;
  isTop?: boolean;
  category?: { name: string; slug: string } | null;
  tags?: { tag: { name: string; slug: string } }[];
};

export default function PostCard({ post }: { post: PostCardData }) {
  const date = post.publishedAt ?? post.createdAt;
  return (
    <article className="glass glass-hover group overflow-hidden">
      {post.cover && (
        <Link href={`/posts/${post.slug}`} className="block">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={post.cover} alt="" className="h-44 w-full object-cover transition duration-300 group-hover:scale-[1.03]" />
        </Link>
      )}
      <div className="p-5">
        <div className="flex flex-wrap items-center gap-2">
          {post.isTop && (
            <span className="rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-2 py-0.5 text-xs font-medium text-white">
              置顶
            </span>
          )}
          {post.category && (
            <Link
              href={`/categories/${post.category.slug}`}
              className="rounded-full border border-brand-400/30 bg-brand-400/10 px-2.5 py-0.5 text-xs text-brand-300 transition hover:border-brand-400/60"
            >
              {post.category.name}
            </Link>
          )}
          {post.tags?.slice(0, 3).map(({ tag }) => (
            <Link
              key={tag.slug}
              href={`/tags/${tag.slug}`}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted transition hover:border-violet-400/50 hover:text-violet-300"
            >
              #{tag.name}
            </Link>
          ))}
        </div>
        <h2 className="mt-3 text-lg font-semibold leading-snug">
          <Link href={`/posts/${post.slug}`} className="transition hover:text-brand-300">
            {post.title}
          </Link>
        </h2>
        {post.excerpt && (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{post.excerpt}</p>
        )}
        <div className="mt-4 flex items-center gap-4 text-xs text-muted">
          {date && <time>{format(new Date(date), "yyyy-MM-dd")}</time>}
          {typeof post.viewCount === "number" && <span>👁 {post.viewCount}</span>}
        </div>
      </div>
    </article>
  );
}
