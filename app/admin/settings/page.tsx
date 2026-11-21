"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";

type Settings = {
  site_name: string;
  site_description: string;
  site_logo: string;
  about: string;
  icp: string;
};

export default function AdminSettingsPage() {
  const [form, setForm] = useState<Settings>({
    site_name: "",
    site_description: "",
    site_logo: "",
    about: "",
    icp: ""
  });
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/settings").then((r) => r.json()).then((d) => setForm({ ...form, ...d })).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form)
    });
    setMsg(res.ok ? "保存成功 ✅" : "保存失败");
  };

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">站点设置</h1>
      <form onSubmit={save} className="max-w-2xl space-y-4 rounded-xl border border-gray-200 bg-white p-6 dark:border-gray-800 dark:bg-slate-900">
        {msg && <p className="rounded bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</p>}
        <div>
          <label className="text-xs text-gray-500">站点名称</label>
          <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        </div>
        <div>
          <label className="text-xs text-gray-500">站点描述（SEO）</label>
          <input value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        </div>
        <div>
          <label className="text-xs text-gray-500">Logo URL</label>
          <input value={form.site_logo} onChange={(e) => setForm({ ...form, site_logo: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        </div>
        <div>
          <label className="text-xs text-gray-500">关于页内容（Markdown）</label>
          <textarea rows={6} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 font-mono text-sm dark:border-gray-700 dark:bg-slate-800" />
        </div>
        <div>
          <label className="text-xs text-gray-500">备案号</label>
          <input value={form.icp} onChange={(e) => setForm({ ...form, icp: e.target.value })} className="mt-1 w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800" />
        </div>
        <button className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">保存设置</button>
      </form>
    </AdminShell>
  );
}
