"use client";

import { useEffect, useState } from "react";
import { format } from "date-fns";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
};

export default function CommentSection({ postId }: { postId: string }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [form, setForm] = useState({ authorName: "", email: "", website: "", content: "" });
  const [msg, setMsg] = useState("");
  const [replyTo, setReplyTo] = useState<string | null>(null);

  const load = async () => {
    const res = await fetch(`/api/comments?postId=${postId}`);
    if (res.ok) setComments(await res.json());
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [postId]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg("");
    const res = await fetch("/api/comments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, postId, parentId: replyTo })
    });
    const data = await res.json();
    if (res.ok) {
      setMsg("评论已提交，待审核通过后展示 ✅");
      setForm({ authorName: "", email: "", website: "", content: "" });
      setReplyTo(null);
    } else {
      setMsg(data.error || "提交失败");
    }
  };

  return (
    <section className="mt-12 border-t border-gray-200 pt-8 dark:border-gray-800">
      <h3 className="text-lg font-semibold">评论 ({comments.length})</h3>

      <div className="mt-4 space-y-4">
        {comments.length === 0 && <p className="text-sm text-gray-400">还没有评论，来抢沙发吧~</p>}
        {comments.map((c) => (
          <div key={c.id} className="rounded-lg border border-gray-200 p-4 dark:border-gray-800">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{c.authorName}</span>
              <time className="text-xs text-gray-400">{format(new Date(c.createdAt), "yyyy-MM-dd HH:mm")}</time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
            <button
              className="mt-2 text-xs text-brand-600 hover:underline"
              onClick={() => setReplyTo(c.id)}
            >
              回复
            </button>
            {c.replies && c.replies.length > 0 && (
              <div className="mt-3 space-y-2 border-l-2 border-gray-200 pl-4 dark:border-gray-700">
                {c.replies.map((r) => (
                  <div key={r.id} className="text-sm">
                    <span className="font-medium">{r.authorName}：</span>
                    <span>{r.content}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="mt-6 space-y-3 rounded-lg bg-gray-50 p-4 dark:bg-slate-800/50">
        <h4 className="font-medium">{replyTo ? "回复评论" : "发表评论"}</h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            required
            placeholder="昵称*"
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-900"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
          <input
            type="email"
            placeholder="邮箱"
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-900"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="网站"
            className="rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-900"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <textarea
          required
          rows={4}
          placeholder="评论内容*"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-900"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
            提交
          </button>
          {replyTo && (
            <button type="button" className="text-sm text-gray-500" onClick={() => setReplyTo(null)}>
              取消回复
            </button>
          )}
          {msg && <span className="text-sm text-brand-600">{msg}</span>}
        </div>
      </form>
    </section>
  );
}
