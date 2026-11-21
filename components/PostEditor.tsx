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
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">{postId ? "编辑文章" : "新建文章"}</h1>
        <div className="flex gap-2">
          <button onClick={() => save("DRAFT")} disabled={saving} className="rounded border border-gray-300 px-4 py-2 text-sm dark:border-gray-700">
            存草稿
          </button>
          <button onClick={() => save("PUBLISHED")} disabled={saving} className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
            发布
          </button>
        </div>
      </div>
      {msg && <p className="mb-4 rounded bg-brand-50 px-3 py-2 text-sm text-brand-700">{msg}</p>}

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <input
            placeholder="文章标题"
            className="w-full rounded border border-gray-300 px-3 py-2 text-lg font-semibold dark:border-gray-700 dark:bg-slate-800"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <input
            placeholder="slug（留空自动生成）"
            className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-500">正文（Markdown）</span>
            <button onClick={() => setPreview(!preview)} className="text-sm text-brand-600">
              {preview ? "编辑" : "预览"}
            </button>
          </div>
          {preview ? (
            <div className="min-h-[400px] rounded border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
              <MarkdownRenderer content={form.contentMd} />
            </div>
          ) : (
            <textarea
              placeholder="在这里写 Markdown..."
              className="h-[400px] w-full rounded border border-gray-300 p-3 font-mono text-sm dark:border-gray-700 dark:bg-slate-800"
              value={form.contentMd}
              onChange={(e) => setForm({ ...form, contentMd: e.target.value })}
            />
          )}
        </div>

        <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
          <div>
            <label className="text-xs text-gray-500">摘要</label>
            <textarea
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-slate-800"
              value={form.excerpt}
              onChange={(e) => setForm({ ...form, excerpt: e.target.value })}
            />
          </div>
          <div>
            <label className="text-xs text-gray-500">封面图</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => e.target.files?.[0] && upload(e.target.files[0])}
              className="mt-1 block w-full text-xs"
            />
            {form.cover && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={form.cover} alt="" className="mt-2 h-24 w-full rounded object-cover" />
            )}
          </div>
          <div>
            <label className="text-xs text-gray-500">分类</label>
            <select
              className="mt-1 w-full rounded border border-gray-300 px-2 py-1 text-sm dark:border-gray-700 dark:bg-slate-800"
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
            <label className="text-xs text-gray-500">标签</label>
            <div className="mt-1 flex flex-wrap gap-2">
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
                    className={`rounded-full px-2 py-0.5 text-xs ${
                      checked ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-gray-300"
                    }`}
                  >
                    #{t.name}
                  </button>
                );
              })}
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.isTop} onChange={(e) => setForm({ ...form, isTop: e.target.checked })} />
            置顶
          </label>
        </div>
      </div>
    </AdminShell>
  );
}
