"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { zhCN } from "date-fns/locale";

type Comment = {
  id: string;
  authorName: string;
  content: string;
  status: "PENDING" | "APPROVED" | "SPAM";
  createdAt: string;
  post?: { title: string; slug: string };
};

const statusLabel: Record<string, string> = {
  PENDING: "待审核",
  APPROVED: "已通过",
  SPAM: "垃圾"
};

const statusBadge: Record<string, string> = {
  PENDING: "border border-amber-400/40 bg-amber-400/10 text-amber-300",
  APPROVED: "border border-emerald-400/40 bg-emerald-400/10 text-emerald-300",
  SPAM: "border border-violet-400/40 bg-violet-400/10 text-violet-300"
};

function avatarGradient(name: string) {
  const palettes = [
    "from-cyan-400 to-blue-500",
    "from-violet-400 to-fuchsia-500",
    "from-rose-400 to-orange-400",
    "from-emerald-400 to-teal-500"
  ];
  let hash = 0;
  for (const ch of name) hash = (hash * 31 + ch.charCodeAt(0)) % 997;
  return palettes[hash % palettes.length];
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<Comment[]>([]);
  const [filter, setFilter] = useState<string>("ALL");

  const load = async () => setComments(await (await fetch("/api/admin/comments")).json());
  useEffect(() => { load(); }, []);

  const setStatus = async (id: string, status: string) => {
    await fetch(`/api/comments/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("确认删除该评论？")) return;
    await fetch(`/api/comments/${id}`, { method: "DELETE" });
    load();
  };

  const shown = filter === "ALL" ? comments : comments.filter((c) => c.status === filter);
  const countOf = (s: string) => comments.filter((c) => c.status === s).length;
  const pending = countOf("PENDING");

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">评论管理</h1>

      {/* 状态 Tab，待审核带红点 */}
      <div className="mb-4 flex flex-wrap gap-2 text-sm">
        {["ALL", "PENDING", "APPROVED", "SPAM"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`relative rounded-full px-4 py-1.5 transition ${
              filter === f ? "btn-aurora text-white" : "glass border-white/10 text-muted hover:text-brand-300"
            }`}
          >
            {f === "ALL" ? `全部 ${comments.length}` : `${statusLabel[f]} ${countOf(f)}`}
            {f === "PENDING" && pending > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
                {pending}
              </span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {shown.map((c) => (
          <div key={c.id} className="glass p-4">
            <div className="flex items-center gap-3">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br ${avatarGradient(c.authorName)} text-sm font-bold text-white`}>
                {c.authorName.slice(0, 1).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm">
                  <span className="font-medium">{c.authorName}</span>
                  {c.post && <span className="text-muted"> · 评论于《{c.post.title}》</span>}
                </div>
                <time className="text-xs text-muted">
                  {formatDistanceToNow(new Date(c.createdAt), { addSuffix: true, locale: zhCN })}
                </time>
              </div>
              <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs ${statusBadge[c.status]}`}>
                {statusLabel[c.status]}
              </span>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm">{c.content}</p>
            <div className="mt-3 flex items-center gap-4 border-t border-white/10 pt-3 text-xs">
              {c.status !== "APPROVED" && (
                <button onClick={() => setStatus(c.id, "APPROVED")} className="text-emerald-300 hover:underline">✓ 通过</button>
              )}
              {c.status !== "SPAM" && (
                <button onClick={() => setStatus(c.id, "SPAM")} className="text-muted hover:text-violet-300">标为垃圾</button>
              )}
              <button onClick={() => remove(c.id)} className="text-rose-400 hover:underline">删除</button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="glass py-12 text-center text-muted">暂无评论</p>}
      </div>
    </AdminShell>
  );
}
