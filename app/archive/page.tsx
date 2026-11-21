export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import { getArchive } from "@/server/services/posts";

export default async function ArchivePage() {
  const groups = await getArchive();
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">归档</h1>
        {groups.length === 0 && <p className="text-gray-400">暂无文章</p>}
        <div className="space-y-8">
          {groups.map((g) => (
            <section key={g.month}>
              <h2 className="mb-3 text-lg font-semibold text-brand-600">{g.month}</h2>
              <ul className="space-y-2 border-l-2 border-gray-200 pl-4 dark:border-gray-800">
                {g.items.map((p) => (
                  <li key={p.id} className="flex items-center gap-3 text-sm">
                    <time className="shrink-0 text-xs text-gray-400">
                      {format(new Date(p.publishedAt ?? new Date()), "MM-dd")}
                    </time>
                    <Link href={`/posts/${p.slug}`} className="hover:text-brand-600">
                      {p.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </main>
    </>
  );
}
