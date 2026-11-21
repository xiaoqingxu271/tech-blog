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
    return <div className="flex min-h-screen items-center justify-center text-gray-400">加载中...</div>;
  }
  if (status === "unauthenticated") return null;

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-slate-950">
      <AdminSidebar />
      <main className="min-w-0 flex-1 p-6">{children}</main>
    </div>
  );
}
