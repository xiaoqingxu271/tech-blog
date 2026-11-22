"use client";

import AdminShell from "@/components/AdminShell";
import Link from "next/link";
import { useEffect, useState } from "react";
import { format } from "date-fns";

type Post = {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED";
  isTop: boolean;
  viewCount: number;
  updatedAt: string;
  category?: { name: string } | null;
};

export default function AdminPostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [q, setQ] = useState("");

  const load = async () => {
    // 管理端需要看到全部文章（含草稿），走 admin 专用查询
    const res = await fetch("/api/admin/posts");
    if (res.ok) setPosts(await res.json());
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id: string) => {
    if (!confirm("确认删除这篇文章？")) return;
    const res = await fetch(`/api/posts/${id}`, { method: "DELETE" });
    if (res.ok) setPosts((p) => p.filter((x) => x.id !== id));
  };

  const toggleTop = async (p: Post) => {
    const res = await fetch(`/api/posts/${p.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isTop: !p.isTop })
    });
    if (res.ok) load();
  };

  const shown = posts.filter(
    (p) =>
      (filter === "ALL" || p.status === filter) &&
      (!q || p.title.toLowerCase().includes(q.toLowerCase()))
  );
  const count = (s: "PUBLISHED" | "DRAFT") => posts.filter((p) => p.status === s).length;

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/admin/posts/new" className="btn-aurora rounded-full px-5 py-2 text-sm font-medium text-white">
          + 新建文章
        </Link>
      </div>

      {/* 状态筛选 + 搜索 */}
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="flex gap-2">
          {(["ALL", "PUBLISHED", "DRAFT"] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`rounded-full px-3.5 py-1.5 text-sm transition ${
                filter === f
                  ? "btn-aurora text-white"
                  : "glass border-white/10 text-muted hover:text-brand-300"
              }`}
            >
              {f === "ALL" ? `全部 ${posts.length}` : f === "PUBLISHED" ? `已发布 ${count("PUBLISHED")}` : `草稿 ${count("DRAFT")}`}
            </button>
          ))}
        </div>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索文章标题…"
          className="input-glass ml-auto w-56"
        />
      </div>

      <div className="glass overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-b border-white/10 text-left text-xs text-muted">
            <tr>
              <th className="p-3.5 font-medium">标题</th>
              <th className="p-3.5 font-medium">状态</th>
              <th className="p-3.5 font-medium">分类</th>
              <th className="p-3.5 font-medium">阅读</th>
              <th className="p-3.5 font-medium">更新时间</th>
              <th className="p-3.5 font-medium">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">加载中...</td></tr>
            )}
            {!loading && shown.length === 0 && (
              <tr><td colSpan={6} className="p-8 text-center text-muted">暂无文章</td></tr>
            )}
            {shown.map((p) => (
              <tr key={p.id} className="border-b border-white/5 transition last:border-0 hover:bg-white/5">
                <td className="p-3.5">
                  {p.isTop && <span className="mr-1.5 rounded-full bg-gradient-to-r from-rose-500 to-fuchsia-500 px-1.5 py-0.5 text-xs text-white">置顶</span>}
                  {p.title}
                </td>
                <td className="p-3.5">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      p.status === "PUBLISHED"
                        ? "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300"
                        : "border border-white/20 bg-white/5 text-muted"
                    }`}
                  >
                    {p.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="p-3.5 text-muted">{p.category?.name ?? "-"}</td>
                <td className="p-3.5 text-muted">{p.viewCount}</td>
                <td className="p-3.5 text-muted">{format(new Date(p.updatedAt), "yyyy-MM-dd HH:mm")}</td>
                <td className="p-3.5">
                  <div className="flex gap-3 text-xs">
                    <Link href={`/admin/posts/${p.id}`} className="text-brand-300 hover:underline">编辑</Link>
                    <button onClick={() => toggleTop(p)} className="text-muted hover:text-brand-300">
                      {p.isTop ? "取消置顶" : "置顶"}
                    </button>
                    <button onClick={() => remove(p.id)} className="text-rose-400 hover:underline">删除</button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
