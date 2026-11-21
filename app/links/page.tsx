export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import prisma from "@/lib/prisma";

export default async function LinksPage() {
  const links = await prisma.link.findMany({ orderBy: { sort: "asc" } });
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">友情链接</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer noopener"
              className="flex items-center gap-3 rounded-lg border border-gray-200 p-4 hover:border-brand-500 dark:border-gray-800"
            >
              {l.avatar && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.avatar} alt="" className="h-10 w-10 rounded-full object-cover" />
              )}
              <div>
                <div className="font-medium">{l.name}</div>
                {l.description && <div className="text-xs text-gray-400">{l.description}</div>}
              </div>
            </a>
          ))}
          {links.length === 0 && <p className="text-gray-400">暂无友链</p>}
        </div>
      </main>
    </>
  );
}
