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
      <form onSubmit={save} className="max-w-2xl space-y-5">
        {msg && <p className="glass border-brand-400/40 px-4 py-2.5 text-sm text-brand-300">{msg}</p>}
        <div className="glass space-y-5 p-6">
          <h2 className="font-semibold">基本信息</h2>
          <div>
            <label className="text-xs text-muted">站点名称</label>
            <input value={form.site_name} onChange={(e) => setForm({ ...form, site_name: e.target.value })} className="input-glass mt-1.5 w-full" />
          </div>
          <div>
            <label className="text-xs text-muted">站点描述（SEO）</label>
            <textarea rows={3} value={form.site_description} onChange={(e) => setForm({ ...form, site_description: e.target.value })} className="input-glass mt-1.5 w-full" />
          </div>
          <div>
            <label className="text-xs text-muted">站点 Logo URL</label>
            <input value={form.site_logo} onChange={(e) => setForm({ ...form, site_logo: e.target.value })} placeholder="留空使用默认立方体 logo" className="input-glass mt-1.5 w-full" />
          </div>
        </div>

        <div className="glass space-y-5 p-6">
          <h2 className="font-semibold">关于页 · 备案</h2>
          <div>
            <label className="text-xs text-muted">关于页内容（Markdown）</label>
            <textarea rows={6} value={form.about} onChange={(e) => setForm({ ...form, about: e.target.value })} className="input-glass mt-1.5 w-full font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted">备案号</label>
            <input value={form.icp} onChange={(e) => setForm({ ...form, icp: e.target.value })} className="input-glass mt-1.5 w-full" />
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={() => setMsg("")} className="glass rounded-full px-5 py-2 text-sm text-muted hover:text-brand-300">
            重置提示
          </button>
          <button type="submit" className="btn-aurora rounded-full px-6 py-2 text-sm font-medium text-white">
            保存设置
          </button>
        </div>
      </form>
    </AdminShell>
  );
}
