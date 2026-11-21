"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);
    if (res?.error) {
      setError("邮箱或密码错误");
    } else {
      router.push("/admin");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 dark:bg-slate-950">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl bg-white p-8 shadow-sm dark:bg-slate-900">
        <h1 className="text-xl font-bold">后台登录</h1>
        <p className="text-xs text-gray-400">技术成长博客 · 管理端</p>
        {error && <p className="rounded bg-red-50 px-3 py-2 text-sm text-red-500">{error}</p>}
        <input
          type="email"
          required
          placeholder="邮箱"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          required
          placeholder="密码"
          className="w-full rounded border border-gray-300 px-3 py-2 text-sm dark:border-gray-700 dark:bg-slate-800"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {loading ? "登录中..." : "登录"}
        </button>
      </form>
    </div>
  );
}
