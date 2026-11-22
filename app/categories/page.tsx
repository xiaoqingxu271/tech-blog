export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { listCategories } from "@/server/services/taxonomy";
import { getSettings } from "@/server/services/settings";

// 分类卡片的彩色图标块（近似原型的多彩图标）
const cardColors = [
  { icon: "📦", bg: "from-cyan-400/30 to-blue-500/30", text: "text-cyan-300" },
  { icon: "🚀", bg: "from-violet-400/30 to-purple-500/30", text: "text-violet-300" },
  { icon: "🎨", bg: "from-pink-400/30 to-rose-500/30", text: "text-pink-300" },
  { icon: "🛠", bg: "from-amber-400/30 to-orange-500/30", text: "text-amber-300" },
  { icon: "🧠", bg: "from-emerald-400/30 to-teal-500/30", text: "text-emerald-300" },
  { icon: "🌌", bg: "from-indigo-400/30 to-blue-500/30", text: "text-indigo-300" }
];

export default async function CategoriesPage() {
  const [categories, settings] = await Promise.all([listCategories(), getSettings()]);
  const siteName = settings.site_name || "极光博客";

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-6xl px-4 pb-8 pt-10">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-bold">文章分类</h1>
            <p className="mt-2 text-sm text-muted">按分类浏览文章，发现更多技术内容</p>
          </div>
          <span className="hidden text-sm text-muted sm:block">记录技术 · 分享世界</span>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {categories.map((c, i) => {
            const color = cardColors[i % cardColors.length];
            return (
              <Link key={c.id} href={`/categories/${c.slug}`} className="glass glass-hover group flex items-start gap-4 p-5">
                <span
                  className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${color.bg} text-2xl`}
                >
                  {color.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h2 className={`font-semibold ${color.text}`}>{c.name}</h2>
                    {c._count.posts >= 5 && (
                      <span className="rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500 px-2 py-0.5 text-xs text-white">热门</span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-muted">{c._count.posts} 篇文章</p>
                </div>
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-sm transition group-hover:border-brand-400/50 group-hover:text-brand-300">
                  →
                </span>
              </Link>
            );
          })}
          {categories.length === 0 && <p className="glass py-12 text-center text-muted sm:col-span-2 lg:col-span-3">暂无分类</p>}
        </div>
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
