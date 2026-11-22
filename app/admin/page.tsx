"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import Link from "next/link";

type Stats = {
  postCount: number;
  publishedCount: number;
  commentCount: number;
  pendingComments: number;
  totalViews: number;
  topPosts: { title: string; slug: string; viewCount: number }[];
};

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats").then((r) => r.json()).then(setStats).catch(() => {});
  }, []);

  const cards = [
    { label: "文章总数", value: stats?.postCount ?? "-", icon: "📝", color: "from-cyan-400/25 to-blue-500/25 text-cyan-300" },
    { label: "已发布", value: stats?.publishedCount ?? "-", icon: "✅", color: "from-emerald-400/25 to-teal-500/25 text-emerald-300" },
    { label: "评论数", value: stats?.commentCount ?? "-", icon: "💬", color: "from-violet-400/25 to-purple-500/25 text-violet-300" },
    { label: "待审评论", value: stats?.pendingComments ?? "-", icon: "⏳", color: "from-amber-400/25 to-orange-500/25 text-amber-300" },
    { label: "总阅读量", value: stats?.totalViews ?? "-", icon: "👁", color: "from-pink-400/25 to-rose-500/25 text-pink-300" }
  ];

  const quickActions = [
    { href: "/admin/posts/new", label: "写文章", icon: "✍️" },
    { href: "/admin/posts", label: "管理文章", icon: "📋" },
    { href: "/admin/tags", label: "管理标签", icon: "🏷" },
    { href: "/admin/comments", label: "管理评论", icon: "💬" },
    { href: "/admin/links", label: "友链管理", icon: "🔗" },
    { href: "/admin/settings", label: "系统设置", icon: "⚙️" }
  ];

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">仪表盘</h1>

      {/* 统计卡 */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="glass glass-hover p-4">
            <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${c.color}`}>
              {c.icon}
            </div>
            <div className="mt-3 text-xs text-muted">{c.label}</div>
            <div className="mt-1 text-2xl font-bold">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        {/* 最热文章 */}
        <div className="glass p-5">
          <h2 className="mb-3 font-semibold">🔥 最热文章 Top 5</h2>
          <ul className="space-y-2.5 text-sm">
            {stats?.topPosts?.length ? (
              stats.topPosts.map((p, i) => (
                <li key={p.slug} className="flex items-center gap-3">
                  <span
                    className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                      i === 0
                        ? "bg-gradient-to-br from-amber-300 to-yellow-500 text-white"
                        : i === 1
                        ? "bg-gradient-to-br from-slate-300 to-slate-500 text-white"
                        : i === 2
                        ? "bg-gradient-to-br from-orange-300 to-amber-600 text-white"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <Link href={`/posts/${p.slug}`} target="_blank" className="min-w-0 flex-1 truncate transition hover:text-brand-300">
                    {p.title}
                  </Link>
                  <span className="shrink-0 text-xs text-muted">👁 {p.viewCount}</span>
                </li>
              ))
            ) : (
              <li className="text-muted">暂无数据</li>
            )}
          </ul>
        </div>

        {/* 快捷操作 */}
        <div className="glass p-5">
          <h2 className="mb-3 font-semibold">⚡ 快捷操作</h2>
          <div className="grid grid-cols-3 gap-3">
            {quickActions.map((a) => (
              <Link
                key={a.href}
                href={a.href}
                className="flex flex-col items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-4 text-xs text-muted transition hover:border-brand-400/50 hover:text-brand-300"
              >
                <span className="text-xl">{a.icon}</span>
                {a.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
