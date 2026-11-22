export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import prisma from "@/lib/prisma";
import { getSettings } from "@/server/services/settings";

export default async function LinksPage() {
  const [links, settings] = await Promise.all([
    prisma.link.findMany({ orderBy: { sort: "asc" } }),
    getSettings()
  ]);
  const siteName = settings.site_name || "极光博客";

  return (
    <>
      <Navbar siteName={siteName} logo={settings.site_logo || undefined} />
      <main className="mx-auto max-w-4xl px-4 pb-8 pt-10">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">友情链接</h1>
          <p className="mt-2 text-sm text-muted">交换链接，一起在技术的路上成长</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          {links.map((l) => (
            <a
              key={l.id}
              href={l.url}
              target="_blank"
              rel="noreferrer noopener"
              className="glass glass-hover group flex items-center gap-4 p-5"
            >
              {l.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.avatar} alt="" className="h-12 w-12 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400/30 to-violet-500/30 text-lg font-bold text-brand-300">
                  {l.name.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="font-medium">{l.name}</div>
                {l.description && <div className="mt-0.5 truncate text-xs text-muted">{l.description}</div>}
              </div>
              <span className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-muted transition group-hover:border-brand-400/50 group-hover:text-brand-300">
                🔗 访问
              </span>
            </a>
          ))}
          {links.length === 0 && <p className="glass py-12 text-center text-muted sm:col-span-2">暂无友链</p>}
        </div>

        {/* 申请友链说明卡 */}
        <div className="glass mt-6 p-6">
          <h2 className="font-semibold">申请友链</h2>
          <ul className="mt-3 list-decimal space-y-1.5 pl-5 text-sm text-muted">
            <li>站点内容以技术为主，无违法违规内容</li>
            <li>站点可正常访问，有稳定更新</li>
            <li>请先添加本站链接后再来申请</li>
            <li>
              联系邮箱：
              <a href="mailto:me@example.com" className="text-brand-300 hover:underline">
                me@example.com
              </a>
            </li>
          </ul>
        </div>
      </main>
      <Footer siteName={siteName} description={settings.site_description} />
    </>
  );
}
