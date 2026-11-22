"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import AdminSidebar from "@/components/AdminSidebar";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const { status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") router.replace("/admin/login");
  }, [status, router]);

  if (status === "loading") {
    return <div className="flex min-h-screen items-center justify-center text-white/40">加载中...</div>;
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="min-h-screen md:pl-56">
      <AdminSidebar />
      {/* 移动端顶部条 */}
      <div className="glass sticky top-0 z-20 mx-4 mt-4 flex items-center justify-between rounded-xl px-4 py-2.5 md:hidden">
        <span className="text-sm font-bold">极光博客 · 管理后台</span>
        <a href="/" target="_blank" className="text-xs text-muted hover:text-brand-300">
          ↗ 前台
        </a>
      </div>
      <main className="min-w-0 p-4 md:p-8">{children}</main>
    </div>
  );
}
