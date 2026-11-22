"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";

type Category = { id: string; name: string; slug: string; sort?: number; _count?: { posts: number } };

export default function AdminCategoriesPage() {
  const [items, setItems] = useState<Category[]>([]);
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

  const edit = (c: Category) => { setEditId(c.id); setName(c.name); setSort(c.sort ?? 0); };
  const remove = async (id: string) => {
    if (!confirm("删除后该分类下文章将变为无分类，确认？")) return;
    await fetch(`/api/categories/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">分类管理</h1>

      {/* 新增/编辑表单 */}
      <form onSubmit={submit} className="glass mb-6 flex flex-wrap items-center gap-3 p-4">
        <input placeholder="分类名称" value={name} onChange={(e) => setName(e.target.value)} required className="input-glass w-48" />
        <input type="number" placeholder="排序" value={sort} onChange={(e) => setSort(Number(e.target.value))} className="input-glass w-24" />
        <button className="btn-aurora rounded-full px-5 py-2 text-sm font-medium text-white">{editId ? "保存修改" : "+ 确认新增"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setName(""); }} className="text-sm text-muted hover:text-brand-300">取消</button>}
      </form>

      {/* 分类卡网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((c, i) => {
          const icons = ["📦", "🚀", "🎨", "🛠", "🧠", "🌌"];
          return (
            <div key={c.id} className="glass glass-hover group p-5">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-brand-400/25 to-violet-500/25 text-xl">
                    {icons[i % icons.length]}
                  </span>
                  <div>
                    <h2 className="font-semibold">{c.name}</h2>
                    <p className="text-xs text-muted">{c._count?.posts ?? 0} 篇文章 · 排序 {c.sort ?? 0}</p>
                  </div>
                </div>
                <span className="text-muted transition group-hover:text-brand-300">→</span>
              </div>
              <div className="mt-4 flex gap-3 border-t border-white/10 pt-3 text-xs">
                <button onClick={() => edit(c)} className="text-brand-300 hover:underline">编辑</button>
                <button onClick={() => remove(c.id)} className="text-rose-400 hover:underline">删除</button>
                <span className="ml-auto text-white/30">{c.slug}</span>
              </div>
            </div>
          );
        })}
        {items.length === 0 && <p className="glass py-12 text-center text-muted sm:col-span-2 lg:col-span-3">暂无分类</p>}
      </div>
    </AdminShell>
  );
}
