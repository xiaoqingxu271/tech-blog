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
    <div className="flex min-h-screen items-center justify-center px-4">
      <form onSubmit={submit} className="glass w-full max-w-sm space-y-4 rounded-3xl p-8 shadow-card">
        {/* 渐变 logo */}
        <div className="flex flex-col items-center">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-400 via-violet-500 to-fuchsia-500 shadow-glow-lg">
            <svg viewBox="0 0 24 24" fill="none" className="text-white" style={{ width: 28, height: 28 }}>
              <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            </svg>
          </span>
          <h1 className="mt-4 text-xl font-bold">极光博客</h1>
          <p className="mt-1 text-xs text-muted">技术博客管理后台</p>
        </div>

        {error && <p className="rounded-lg border border-rose-400/40 bg-rose-500/10 px-3 py-2 text-sm text-rose-300">{error}</p>}

        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">👤</span>
          <input
            type="email"
            required
            placeholder="邮箱"
            className="input-glass w-full py-2.5 pl-10"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted">🔒</span>
          <input
            type="password"
            required
            placeholder="密码"
            className="input-glass w-full py-2.5 pl-10"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="btn-aurora w-full rounded-full px-4 py-2.5 text-sm font-medium text-white disabled:opacity-50"
        >
          {loading ? "登录中..." : "登  录"}
        </button>
        <p className="text-center text-xs text-muted">登录即代表同意站点管理规范</p>
      </form>
    </div>
  );
}
