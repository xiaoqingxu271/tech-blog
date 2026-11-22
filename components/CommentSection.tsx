"use client";

import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  createdAt: string;
  replies?: Comment[];
};

function avatarGradient(name: string) {
  const palettes = [
    "from-cyan-400 to-blue-500",
    "from-violet-400 to-fuchsia-500",
    "from-rose-400 to-orange-400",
    "from-emerald-400 to-teal-500",
    "from-amber-400 to-pink-500"
  ];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return palettes[hash % palettes.length];
}

function CommentItem({
  c,
  onReply
}: {
  c: Comment;
  onReply: (id: string) => void;
}) {
  return (
    <div className="glass p-4">
      <div className="flex items-center gap-3">
        <span
          className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(c.authorName)} text-sm font-bold text-white`}
        >
          {c.authorName.slice(0, 1).toUpperCase()}
        </span>
        <div className="min-w-0">
          <div className="text-sm font-medium">{c.authorName}</div>
          <time className="text-xs text-muted">
            {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: zhCN })}
          </time>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm">{c.content}</p>
      <button
        className="mt-2 inline-flex items-center gap-1 text-xs text-muted transition hover:text-brand-300"
        onClick={() => onReply(c.id)}
      >
        ↩ 回复
      </button>
      {c.replies && c.replies.length > 0 && (
        <div className="mt-3 space-y-3 border-l-2 border-brand-400/30 pl-4">
          {c.replies.map((r) => (
            <div key={r.id} className="flex items-start gap-2 text-sm">
              <span className="font-medium text-brand-300">{r.authorName}：</span>
              <span className="min-w-0">{r.content}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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
    <section className="mt-10">
      <h3 className="text-lg font-semibold">评论 ({comments.length})</h3>

      <div className="mt-4 space-y-4">
        {comments.length === 0 && <p className="glass p-5 text-sm text-muted">还没有评论，来抢沙发吧~</p>}
        {comments.map((c) => (
          <CommentItem key={c.id} c={c} onReply={setReplyTo} />
        ))}
      </div>

      <form onSubmit={submit} className="glass mt-6 space-y-3 p-5">
        <h4 className="font-medium">
          {replyTo ? "回复评论" : "发表评论"}
          {replyTo && (
            <button type="button" className="ml-3 text-xs text-muted hover:text-brand-300" onClick={() => setReplyTo(null)}>
              取消回复
            </button>
          )}
        </h4>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <input
            required
            placeholder="昵称*"
            className="input-glass"
            value={form.authorName}
            onChange={(e) => setForm({ ...form, authorName: e.target.value })}
          />
          <input
            type="email"
            placeholder="邮箱"
            className="input-glass"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            placeholder="网站"
            className="input-glass"
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
          />
        </div>
        <textarea
          required
          rows={4}
          placeholder="评论内容*"
          className="input-glass w-full"
          value={form.content}
          onChange={(e) => setForm({ ...form, content: e.target.value })}
        />
        <div className="flex items-center gap-3">
          <button type="submit" className="btn-aurora rounded-full px-6 py-2 text-sm font-medium text-white">
            提交评论
          </button>
          {msg && <span className="text-sm text-brand-300">{msg}</span>}
        </div>
      </form>
    </section>
  );
}
