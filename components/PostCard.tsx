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
    <article className="group rounded-xl border border-gray-200 p-5 transition hover:shadow-md dark:border-gray-800">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h2 className="truncate text-xl font-semibold">
            {post.isTop && (
              <span className="mr-2 rounded bg-red-100 px-1.5 py-0.5 text-xs font-normal text-red-600">置顶</span>
            )}
            <Link href={`/posts/${post.slug}`} className="hover:text-brand-600">
              {post.title}
            </Link>
          </h2>
          {post.excerpt && (
            <p className="mt-2 line-clamp-2 text-sm text-gray-500 dark:text-gray-400">
              {post.excerpt}
            </p>
          )}
        </div>
        {post.cover && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={post.cover} alt="" className="hidden h-20 w-28 shrink-0 rounded-lg object-cover sm:block" />
        )}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs text-gray-400">
        {date && <time>{format(new Date(date), "yyyy-MM-dd")}</time>}
        {post.category && (
          <Link href={`/categories/${post.category.slug}`} className="rounded bg-brand-50 px-1.5 py-0.5 text-brand-600 dark:bg-slate-800">
            {post.category.name}
          </Link>
        )}
        {post.tags?.map(({ tag }) => (
          <Link key={tag.slug} href={`/tags/${tag.slug}`} className="hover:text-brand-600">
            #{tag.name}
          </Link>
        ))}
        {typeof post.viewCount === "number" && <span>👁 {post.viewCount}</span>}
      </div>
    </article>
  );
}
