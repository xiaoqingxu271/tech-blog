"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";

type Item = { id: string; name: string; slug: string; sort?: number; _count?: { posts: number } };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [sort, setSort] = useState(0);
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => setItems(await (await fetch("/api/categories")).json());
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/categories/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sort })
      });
    } else {
      await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, sort })
      });
    }
    setName(""); setSort(0); setEditId(null); load();
  };

  const edit = (c: Item) => { setEditId(c.id); setName(c.name); setSort(c.sort ?? 0); };
  const remove = async (id: string) => {
    if (!confirm("删除后该分类下文章将变为无分类，确认？")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">分类管理</h1>
      <form onSubmit={submit} className="mb-4 flex flex-wrap gap-2">
        <input placeholder="分类名称" value={name} onChange={(e) => setName(e.target.value)} required className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <input type="number" placeholder="排序" value={sort} onChange={(e) => setSort(Number(e.target.value))} className="w-24 rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <button className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">{editId ? "保存" : "新增"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setName(""); }} className="text-sm text-gray-500">取消</button>}
      </form>
      <div className="rounded-xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-slate-900">
        <table className="w-full text-sm">
          <thead className="border-b text-left text-gray-500 dark:border-gray-800">
            <tr><th className="p-3">名称</th><th className="p-3">slug</th><th className="p-3">文章数</th><th className="p-3">操作</th></tr>
          </thead>
          <tbody>
            {items.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 dark:border-gray-800">
                <td className="p-3">{c.name}</td>
                <td className="p-3 text-gray-400">{c.slug}</td>
                <td className="p-3 text-gray-500">{c._count?.posts ?? 0}</td>
                <td className="p-3">
                  <div className="flex gap-3 text-xs">
                    <button onClick={() => edit(c)} className="text-brand-600 hover:underline">编辑</button>
                    <button onClick={() => remove(c.id)} className="text-red-500 hover:underline">删除</button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && <tr><td colSpan={4} className="p-6 text-center text-gray-400">暂无分类</td></tr>}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}
