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

      {/* 新增/编辑表单 */}
      <form onSubmit={submit} className="glass mb-6 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-4">
        <input placeholder="站点名称*" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input-glass" />
        <input placeholder="网址 URL*" required value={form.url} onChange={(e) => setForm({ ...form, url: e.target.value })} className="input-glass" />
        <input placeholder="Logo 地址" value={form.avatar} onChange={(e) => setForm({ ...form, avatar: e.target.value })} className="input-glass" />
        <input type="number" placeholder="排序" value={form.sort} onChange={(e) => setForm({ ...form, sort: Number(e.target.value) })} className="input-glass" />
        <input placeholder="站点描述" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="input-glass sm:col-span-2 lg:col-span-3" />
        <div className="flex items-center gap-3">
          <button className="btn-aurora rounded-full px-5 py-2 text-sm font-medium text-white">{editId ? "保存修改" : "+ 确认新增"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm({ name: "", url: "", avatar: "", description: "", sort: 0 }); }} className="text-sm text-muted hover:text-brand-300">取消</button>}
        </div>
      </form>

      {/* 友链卡网格 */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {links.map((l) => (
          <div key={l.id} className="glass glass-hover group p-5">
            <div className="flex items-center gap-3">
              {l.avatar ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={l.avatar} alt="" className="h-11 w-11 shrink-0 rounded-full object-cover" />
              ) : (
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand-400/30 to-violet-500/30 font-bold text-brand-300">
                  {l.name.slice(0, 1)}
                </span>
              )}
              <div className="min-w-0 flex-1">
                <div className="truncate font-medium">{l.name}</div>
                <div className="truncate text-xs text-muted">{l.description || l.url}</div>
              </div>
            </div>
            <div className="mt-4 flex items-center gap-3 border-t border-white/10 pt-3 text-xs">
              <a href={l.url} target="_blank" rel="noreferrer noopener" className="text-brand-300 hover:underline">点击访问 ↗</a>
              <button onClick={() => edit(l)} className="text-muted hover:text-brand-300">编辑</button>
              <button onClick={() => remove(l.id)} className="text-rose-400 hover:underline">删除</button>
              <span className="ml-auto text-white/30">排序：{l.sort}</span>
            </div>
          </div>
        ))}
        {links.length === 0 && <p className="glass py-12 text-center text-muted sm:col-span-2 lg:col-span-3">暂无友链</p>}
      </div>
    </AdminShell>
  );
}
