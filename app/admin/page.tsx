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
    { label: "文章总数", value: stats?.postCount ?? "-" },
    { label: "已发布", value: stats?.publishedCount ?? "-" },
    { label: "评论数", value: stats?.commentCount ?? "-" },
    { label: "待审评论", value: stats?.pendingComments ?? "-" },
    { label: "总阅读量", value: stats?.totalViews ?? "-" }
  ];

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">仪表盘</h1>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c) => (
          <div key={c.label} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
            <div className="text-xs text-gray-400">{c.label}</div>
            <div className="mt-1 text-2xl font-bold text-brand-600">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-800 dark:bg-slate-900">
        <h2 className="mb-3 font-semibold">最热文章</h2>
        <ul className="space-y-2 text-sm">
          {stats?.topPosts?.length ? (
            stats.topPosts.map((p) => (
              <li key={p.slug} className="flex justify-between">
                <Link href={`/posts/${p.slug}`} target="_blank" className="hover:text-brand-600">
                  {p.title}
                </Link>
                <span className="text-gray-400">👁 {p.viewCount}</span>
              </li>
            ))
          ) : (
            <li className="text-gray-400">暂无数据</li>
          )}
        </ul>
      </div>
    </AdminShell>
  );
}
