"use client";

import AdminShell from "@/components/AdminShell";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import MarkdownRenderer from "@/components/MarkdownRenderer";

type Category = { id: string; name: string };
type Tag = { id: string; name: string };

type PostForm = {
  id?: string;
  title: string;
  slug: string;
  contentMd: string;
  excerpt: string;
  cover: string;
  status: "DRAFT" | "PUBLISHED";
  isTop: boolean;
  categoryId: string;
  tagIds: string[];
};

const empty: PostForm = {
  title: "",
  slug: "",
  contentMd: "",
  excerpt: "",
  cover: "",
  status: "DRAFT",
  isTop: false,
  categoryId: "",
  tagIds: []
};

export default function PostEditor({ postId }: { postId?: string }) {
  const router = useRouter();
  const [form, setForm] = useState<PostForm>(empty);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [preview, setPreview] = useState(false);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    fetch("/api/categories").then((r) => r.json()).then(setCategories).catch(() => {});
    fetch("/api/tags").then((r) => r.json()).then(setTags).catch(() => {});
  }, []);

  useEffect(() => {
    if (!postId) return;
    fetch(`/api/admin/posts/${postId}`).then((r) => r.json()).then((p) => {
      setForm({
        id: p.id,
        title: p.title,
        slug: p.slug,
        contentMd: p.contentMd,
        excerpt: p.excerpt ?? "",
        cover: p.cover ?? "",
        status: p.status,
        isTop: p.isTop,
        categoryId: p.category?.id ?? p.categoryId ?? "",
        tagIds: (p.tags ?? []).map((t: { tag: { id: string } }) => t.tag.id)
      });
    });
  }, [postId]);

  const upload = async (file: File) => {
    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (res.ok) {
      const d = await res.json();
      setForm((f) => ({ ...f, cover: d.url }));
    }
  };

  const save = async (status?: "DRAFT" | "PUBLISHED") => {
    setSaving(true);
    setMsg("");
    const payload = {
      title: form.title,
      slug: form.slug || undefined,
      contentMd: form.contentMd,
      excerpt: form.excerpt || null,
      cover: form.cover || null,
      status: status ?? form.status,
      isTop: form.isTop,
      categoryId: form.categoryId || null,
      tagIds: form.tagIds
    };
    const url = form.id ? `/api/posts/${form.id}` : "/api/posts";
    const method = form.id ? "PUT" : "POST";
    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    setSaving(false);
    if (res.ok) {
      setMsg("保存成功 ✅");
      router.push("/admin/posts");
      router.refresh();
    } else {
      setMsg(data.error || "保存失败");
    }
  };

  return (
    <AdminShell>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-bold">{postId ? "编辑文章" : "新建文章"}</h1>
        <div className="flex gap-3">
          <button onClick={() => save("DRAFT")} disabled={saving} className="glass rounded-full px-5 py-2 text-sm text-muted hover:text-brand-300">
            存草稿
          </button>
          <button onClick={() => save("PUBLISHED")} disabled={saving} className="btn-aurora rounded-full px-6 py-2 text-sm font-medium text-white">
            发布
          </button>
        </div>
      </div>
      {msg && <p className="glass mb-4 border-brand-400/40 px-4 py-2.5 text-sm text-brand-300">{msg}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        {/* 编辑区 */}
        <div className="space-y-3 lg:col-span-2">
          <input
            placeholder="输入文章标题…"
            className="glass w-full rounded-2xl px-5 py-4 text-xl font-bold outline-none transition focus:border-brand-400/60"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="slug（留空自动生成）"
            className="input-glass w-full"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              <button
                onClick={() => setPreview(false)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${!preview ? "btn-aurora text-white" : "glass border-white/10 text-muted"}`}
              >
                编辑
              </button>
              <button
                onClick={() => setPreview(true)}
                className={`rounded-full px-4 py-1.5 text-sm transition ${preview ? "btn-aurora text-white" : "glass border-white/10 text-muted"}`}
              >
                预览
              </button>
            </div>
            <span className="text-xs text-muted">{form.contentMd.length} 字符</span>
          </div>
          {preview ? (
            <div className="glass min-h-[460px] p-5">
              <MarkdownRenderer content={form.contentMd} />
            </div>
          ) : (
            <textarea
              placeholder="在这里写 Markdown..."
              className="glass h-[460px] w-full rounded-2xl p-4 font-mono text-sm outline-none transition focus:border-brand-400/60"
              value={form.contentMd}
              onChange={(e) => setForm({ ...form, contentMd: e.target.value })}
            />
          )}
        </div>

        {/* 右侧属性栏 */}
        <div className="glass h-fit space-y-5 rounded-2xl p-5">
          <div>
            <label className="text-xs text-muted">摘要</label>
            <textarea
              rows={3}
              className="input-glass mt-1.5 w-full"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-muted">封面图</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              className="mt-1.5 block w-full text-xs text-muted file:mr-3 file:rounded-full file:border-0 file:bg-brand-400/15 file:px-3 file:py-1.5 file:text-xs file:text-brand-300"
            />
            {form.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.cover} alt="" className="mt-2 h-28 w-full rounded-xl object-cover" />
            )}
          </div>
          <div>
            <label className="text-xs text-muted">分类</label>
            <select
              className="input-glass mt-1.5 w-full"
              value={form.categoryId}
              onChange={(e) => setForm({ ...form, categoryId: e.target.value })}
            >
              <option value="">无分类</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-muted">标签</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {tags.map((t) => {
                const checked = form.tagIds.includes(t.id);
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() =>
                      setForm({
                        ...form,
                        tagIds: checked
                          ? form.tagIds.filter((id) => id !== t.id)
                          : [...form.tagIds, t.id]
                      })
                    }
                    className={`rounded-full border px-3 py-0.5 text-xs transition ${
                      checked
                        ? "border-brand-400/60 bg-brand-400/15 text-brand-300"
                        : "border-white/10 bg-white/5 text-muted hover:border-violet-400/50 hover:text-violet-300"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2.5 text-sm">
            <input
              type="checkbox"
              checked={form.isTop}
              onChange={(e) => setForm({ ...form, isTop: e.target.checked })}
              className="h-4 w-4 accent-cyan-400"
            />
            置顶文章
          </label>
          <div>
            <label className="text-xs text-muted">发布状态</label>
            <select
              className="input-glass mt-1.5 w-full"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value as "DRAFT" | "PUBLISHED" })}
            >
              <option value="DRAFT">草稿</option>
              <option value="PUBLISHED">已发布</option>
            </select>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
