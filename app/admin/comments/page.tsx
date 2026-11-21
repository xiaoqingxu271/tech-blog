"use client";

import AdminShell from "@/components/AdminShell";
import { useEffect, useState } from "react";
import { format } from "date-fns";

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

  return (
    <AdminShell>
      <h1 className="mb-6 text-2xl font-bold">评论管理</h1>
      <div className="mb-4 flex gap-2 text-sm">
        {["ALL", "PENDING", "APPROVED", "SPAM"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded px-3 py-1 ${filter === f ? "bg-brand-600 text-white" : "border border-gray-300 dark:border-gray-700"}`}
          >
            {f === "ALL" ? "全部" : statusLabel[f]}
          </button>
        ))}
      </div>
      <div className="space-y-3">
        {shown.map((c) => (
          <div key={c.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{c.authorName} · <span className="text-gray-400">{c.post?.title}</span></span>
              <time className="text-xs text-gray-400">{format(new Date(c.createdAt), "yyyy-MM-dd HH:mm")}</time>
            </div>
            <p className="mt-2 whitespace-pre-wrap text-sm">{c.content}</p>
            <div className="mt-3 flex items-center gap-3 text-xs">
              <span className={`rounded px-2 py-0.5 ${c.status === "APPROVED" ? "bg-green-100 text-green-600" : c.status === "PENDING" ? "bg-yellow-100 text-yellow-700" : "bg-gray-100 text-gray-500"}`}>
                {statusLabel[c.status]}
              </span>
              {c.status !== "APPROVED" && <button onClick={() => setStatus(c.id, "APPROVED")} className="text-green-600 hover:underline">通过</button>}
              {c.status !== "SPAM" && <button onClick={() => setStatus(c.id, "SPAM")} className="text-gray-500 hover:underline">标为垃圾</button>}
              <button onClick={() => remove(c.id)} className="text-red-500 hover:underline">删除</button>
            </div>
          </div>
        ))}
        {shown.length === 0 && <p className="text-gray-400">暂无评论</p>}
      </div>
    </AdminShell>
  );
}
