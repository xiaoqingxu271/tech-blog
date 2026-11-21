"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";

const nav = [
  { href: "/admin", label: "仪表盘" },
  { href: "/admin/posts", label: "文章管理" },
  { href: "/admin/categories", label: "分类" },
  { href: "/admin/tags", label: "标签" },
  { href: "/admin/comments", label: "评论" },
  { href: "/admin/links", label: "友链" },
  { href: "/admin/settings", label: "站点设置" }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  return (
    <aside className="w-52 shrink-0 border-r border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-slate-900">
      <div className="mb-6 text-lg font-bold text-brand-600">管理后台</div>
      <nav className="space-y-1">
        {nav.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`block rounded px-3 py-2 text-sm ${
                active
                  ? "bg-brand-600 text-white"
                  : "text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-slate-800"
              }`}
            >
              {n.label}
            </Link>
          );
        })}
      </nav>
      <div className="mt-8 space-y-2 border-t border-gray-200 pt-4 dark:border-gray-800">
        <Link href="/" target="_blank" className="block text-sm text-gray-500 hover:text-brand-600">
          ↗ 查看前台
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/admin/login" })}
          className="block text-sm text-red-500 hover:underline"
        >
          退出登录
        </button>
      </div>
    </aside>
  );
}
