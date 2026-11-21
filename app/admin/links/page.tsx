"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";

type Link = { id: string; name: string; url: string; avatar?: string; description?: string; sort: number };

export default function AdminLinksPage() {
  const [links, setLinks] = useState<Link[]>([]);
  const [form, setForm] = useState({ name: "", url: "", avatar: "", description: "", sort: 0 });
  const [editId, setEditId] = useState<string | null>(null);

  const load = async () => setLinks(await (await fetch("/api/links")).json());
  useEffect(() => { load(); }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const payload = { ...form, avatar: form.avatar || null, description: form.description || null };
    if (editId) {
      await fetch(`/api/links/${editId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    } else {
      await fetch("/api/links", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
    }
    setForm({ name: "", url: "", avatar: "", description: "", sort: 0 });
    setEditId(null);
    load();
  };

  const edit = (l: Link) => {
    setEditId(l.id);
    setForm({ name: l.name, url: l.url, avatar: l.avatar ?? "", description: l.description ?? "", sort: l.sort });
  };
  const remove = async (id: string) => {
    if (!confirm("确认删除该友链？")) return;
    await fetch(`/api/links/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">友链管理</h1>
      <form onSubmit={submit} className="mb-6 grid gap-2 rounded-xl border border-gray-200 bg-white p-4 sm:grid-cols-2 dark:border-gray-800 dark:bg-slate-900">
        <input placeholder="名称*" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <input placeholder="URL*" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <input placeholder="头像 URL" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <input placeholder="描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        <div className="flex gap-2">
          <button className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">{editId ? "保存" : "新增"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: "", url: "", avatar: "", description: "", sort: 0 }); }} className="text-sm text-gray-500">取消</button>}
        </div>
      </form>
      <div className="space-y-2">
        {links.map((l) => (
          <div key={l.id} className="flex items-center justify-between rounded-xl border border-gray-200 bg-white p-3 text-sm dark:border-gray-800 dark:bg-slate-900">
            <div>
              <div className="font-medium">{l.name}</div>
              <div className="text-xs text-gray-400">{l.url}</div>
            </div>
            <div className="flex gap-3 text-xs">
              <button onClick={() => edit(l)} className="text-brand-600 hover:underline">编辑</button>
              <button onClick={() => remove(l.id)} className="text-red-500 hover:underline">删除</button>
            </div>
          </div>
        ))}
        {links.length === 0 && <p className="text-gray-400">暂无友链</p>}
      </div>
    </AdminShell>
  );
}
