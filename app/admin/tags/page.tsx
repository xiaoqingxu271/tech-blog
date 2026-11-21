"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";

type Item = { id: string; name: string; slug: string; _count?: { posts: number } };

export default function AdminTagsPage() {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

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

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">标签管理</h1>
      <form onSubmit={submit} className="mb-4 flex flex-wrap gap-2">
        <input placeholder="标签名称" value={name} onChange={(e) => setName(e.target.value)} required className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <button className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">{editId ? "保存" : "新增"}</button>
        {editId && <button type="button" onClick={() => { setEditId(null); setName(""); }} className="text-sm text-gray-500">取消</button>}
      </form>
      <div className="flex flex-wrap gap-2">
        {items.map((t) => (
          <div key={t.id} className="flex items-center gap-2 rounded-full border border-gray-200 px-3 py-1 text-sm dark:border-gray-800">
            <span>#{t.name}</span>
            <span className="text-xs text-gray-400">({t._count?.posts ?? 0})</span>
            <button onClick={() => edit(t)} className="text-xs text-brand-600">编辑</button>
            <button onClick={() => remove(t.id)} className="text-xs text-red-500">删除</button>
          </div>
        ))}
        {items.length === 0 && <p className="text-gray-400">暂无标签</p>}
      </div>
    </AdminShell>
  );
}
