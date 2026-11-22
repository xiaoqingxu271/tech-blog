"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";

type Item = { id: string; name: string; slug: string; _count?: { posts: number } };

export default function AdminTagsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [q, setQ] = useState("");

  const load = async () => setItems(await (await fetch("/api/tags")).json());
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (editId) {
      await fetch(`/api/tags/${editId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
    } else {
      await fetch("/api/tags", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name })
      });
    }
    setName(""); setEditId(null); load();
  };

  const edit = (t: Item) => { setEditId(t.id); setName(t.name); };
  const remove = async (id: string) => {
    if (!confirm("确认删除该标签？")) return;
    await fetch(`/api/tags/${id}`, { method: "DELETE" });
    load();
  };

  const sorted = [...items].sort((a, b) => (b._count?.posts ?? 0) - (a._count?.posts ?? 0));
  const shown = sorted.filter((t) => !q || t.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">标签管理</h1>

      <form onSubmit={submit} className="glass mb-6 flex flex-wrap items-center gap-3 p-4">
        <input placeholder={editId ? "编辑标签名称" : "新建标签名称"} value={name} onChange={(e) => setName(e.target.value)} required className="input-glass w-48" />
        <button className="btn-aurora rounded-full px-5 py-2 text-sm font-medium text-white">{editId ? "保存修改" : "+ 新建标签"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setName(""); }} className="text-sm text-muted hover:text-brand-300">取消</button>}
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="搜索标签…"
          className="input-glass ml-auto w-48"
        />
      </form>

      {/* 标签卡网格，按使用量排序 */}
      <div className="flex flex-wrap gap-3">
        {shown.map((t, i) => {
          const colors = ["border-cyan-400/40 text-cyan-300", "border-violet-400/40 text-violet-300", "border-pink-400/40 text-pink-300", "border-emerald-400/40 text-emerald-300", "border-amber-400/40 text-amber-300"];
          return (
            <div
              key={t.id}
              className={`flex items-center gap-2 rounded-full border bg-white/5 px-4 py-1.5 text-sm transition hover:bg-white/10 ${colors[i % colors.length]}`}
            >
              <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
              #{t.name}
              <span className="text-xs opacity-60">({t._count?.posts ?? 0})</span>
              <button onClick={() => edit(t)} className="text-xs text-muted hover:text-brand-300">编辑</button>
              <button onClick={() => remove(t.id)} className="text-xs text-rose-400/80 hover:text-rose-300">删除</button>
            </div>
          );
        })}
        {shown.length === 0 && <p className="text-muted">暂无标签</p>}
      </div>
    </AdminShell>
  );
}
