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

  return (
    <AdminShell>
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">文章管理</h1>
        <Link href="/admin/posts/new" className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
          + 新建文章
        </Link>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="border-b border-gray-200 text-left text-gray-500 dark:border-gray-800">
            <tr>
              <th className="p-3">标题</th>
              <th className="p-3">状态</th>
              <th className="p-3">分类</th>
              <th className="p-3">阅读</th>
              <th className="p-3">更新时间</th>
              <th className="p-3">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">加载中...</td></tr>
            )}
            {!loading && posts.length === 0 && (
              <tr><td colSpan={6} className="p-6 text-center text-gray-400">暂无文章</td></tr>
            )}
            {posts.map((p) => (
              <tr key={p.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="p-3">
                  {p.isTop && <span className="mr-1 rounded bg-red-100 px-1 text-xs text-red-600">置顶</span>}
                  {p.title}
                </td>
                <td className="p-3">
                  <span className={p.status === "PUBLISHED" ? "text-green-600" : "text-gray-400"}>
                    {p.status === "PUBLISHED" ? "已发布" : "草稿"}
                  </span>
                </td>
                <td className="p-3 text-gray-500">{p.category?.name ?? "-"}</td>
                <td className="p-3 text-gray-500">{p.viewCount}</td>
                <td className="p-3 text-gray-400">{format(new Date(p.updatedAt), "yyyy-MM-dd HH:mm")}</td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <Link href={`/admin/posts/${p.id}`} className="text-brand-600 hover:underline">编辑</Link>
                    <button onClick={() => toggleTop(p)} className="text-gray-500 hover:underline">
                      {p.isTop ? "取消置顶" : "置顶"}
                    </button>
                    <button onClick={() => remove(p.id)} className="text-red-500 hover:underline">删除</button>
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
