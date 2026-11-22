export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { listTags } from "@/server/services/taxonomy";
import { getSettings } from "@/server/services/settings";

// 标签字号/颜色随文章数变化，近似原型标签云
const tagColors = [
  "border-cyan-400/40 text-cyan-300 hover:bg-cyan-400/15",
  "border-violet-400/40 text-violet-300 hover:bg-violet-400/15",
  "border-pink-400/40 text-pink-300 hover:bg-pink-400/15",
  "border-emerald-400/40 text-emerald-300 hover:bg-emerald-400/15",
  "border-amber-400/40 text-amber-300 hover:bg-amber-400/15"
];

function tagSize(count: number, max: number) {
  if (max <= 1) return "text-sm";
  const ratio = count / max;
  if (ratio > 0.75) return "text-xl font-semibold";
  if (ratio > 0.5) return "text-lg font-medium";
  if (ratio > 0.25) return "text-base";
  return "text-sm";
}

export default async function TagsPage() {
  const [tags, settings] = await Promise.all([listTags(), getSettings()]);
  const siteName = settings.site_name || "极光博客";
  const sorted = [...tags].sort((a, b) => b._count.posts - a._count.posts);
  const maxCount = sorted[0]?._count.posts ?? 0;
  const alphabetical = [...tags].sort((a, b) => a.name.localeCompare(b.name, "zh"));

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">标签云</h1>
            <p className="mt-2 text-sm text-muted">标签越大，文章越多</p>
          </div>
          <span className="hidden text-sm text-muted sm:block">记录技术 · 分享世界</span>
        </div>

        {/* 标签云大卡 */}
        <div className="glass flex flex-wrap items-baseline gap-x-5 gap-y-3 p-8">
          {sorted.map((t, i) => (
            <Link
              key={t.id}
              href={`/tags/${t.slug}`}
              className={`rounded-full border px-4 py-1.5 transition ${tagColors[i % tagColors.length]} ${tagSize(t._count.posts, maxCount)}`}
            >
              #{t.name}
              <span className="ml-1.5 text-xs opacity-60">({t._count.posts})</span>
            </Link>
          ))}
          {tags.length === 0 && <p className="text-muted">暂无标签</p>}
        </div>

        {/* 按字母/拼音排序 */}
        {alphabetical.length > 0 && (
          <div className="glass mt-6 p-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold">按字母排序</h2>
              <span className="text-xs text-muted">总数：{tags.length}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-sm sm:grid-cols-3 lg:grid-cols-4">
              {alphabetical.map((t) => (
                <Link key={t.id} href={`/tags/${t.slug}`} className="flex items-center justify-between rounded px-2 py-1 text-muted transition hover:text-brand-300">
                  <span className="truncate">{t.name}</span>
                  <span className="text-xs opacity-60">{t._count.posts}</span>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
