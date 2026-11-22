export const dynamic = "force-dynamic";

import Link from "next/link";
import { format } from "date-fns";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getArchive } from "@/server/services/posts";
import { getSettings } from "@/server/services/settings";

export default async function ArchivePage() {
  const [groups, settings] = await Promise.all([getArchive(), getSettings()]);
  const siteName = settings.site_name || "极光博客";

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-4xl px-4 pb-8 pt-10">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">文章归档</h1>
          <p className="mt-2 text-sm text-muted">按时间归档，记录成长的每一步</p>
        </div>

        {/* 左侧竖向渐变时间线 + 按月分组玻璃卡 */}
        <div className="relative pl-8">
          {/* 时间线主轴：青 → 紫渐变 */}
          <div
            className="absolute bottom-2 left-[9px] top-2 w-0.5 rounded"
            style={{ background: "linear-gradient(180deg, #22d3ee, #7c3aed)" }}
          />

          {groups.length === 0 && <p className="glass p-8 text-center text-muted">暂无文章</p>}
          <div className="space-y-10">
            {groups.map((g) => (
              <section key={g.month} className="relative">
                {/* 时间线节点圆点 */}
                <span className="absolute -left-8 top-2 flex h-[19px] w-[19px] items-center justify-center">
                  <span className="h-2.5 w-2.5 rounded-full bg-brand-400 shadow-glow" />
                </span>
                <div className="glass p-6">
                  <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">
                      {g.month.replace("-", " 年 ")} 月
                    </h2>
                    <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs text-muted">
                      {g.items.length} 篇
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {g.items.map((p) => (
                      <li key={p.id}>
                        <Link
                          href={`/posts/${p.slug}`}
                          className="group flex items-center gap-3 rounded-lg px-2 py-2 text-sm transition hover:bg-white/5"
                        >
                          <time className="shrink-0 text-xs text-muted">
                            {format(new Date(p.publishedAt ?? new Date()), "MM-dd")}
                          </time>
                          <span className="text-xs text-muted transition group-hover:text-brand-300">📄</span>
                          <span className="min-w-0 truncate transition group-hover:text-brand-300">{p.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </section>
            ))}
          </div>
        </div>
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
