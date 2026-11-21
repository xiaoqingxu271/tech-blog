export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { listTags } from "@/server/services/taxonomy";

export default async function TagsPage() {
  const tags = await listTags();
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">标签云</h1>
        <div className="flex flex-wrap gap-3">
          {tags.map((t) => (
            <Link
              key={t.id}
              href={`/tags/${t.slug}`}
              className="rounded-full border border-gray-200 px-4 py-2 text-sm hover:border-brand-500 hover:text-brand-600 dark:border-gray-800"
            >
              #{t.name} <span className="text-gray-400">({t._count.posts})</span>
            </Link>
          ))}
          {tags.length === 0 && <p className="text-gray-400">暂无标签</p>}
        </div>
      </main>
    </>
  );
}
