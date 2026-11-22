"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";

const nav = [
  { href: "/admin", label: "仪表盘", icon: "📊" },
  { href: "/admin/posts", label: "文章管理", icon: "📝" },
  { href: "/admin/categories", label: "分类", icon: "📦" },
  { href: "/admin/tags", label: "标签", icon: "🏷" },
  { href: "/admin/comments", label: "评论", icon: "💬" },
  { href: "/admin/links", label: "友链", icon: "🔗" },
  { href: "/admin/settings", label: "站点设置", icon: "⚙️" }
];

export default function AdminSidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const displayName = session?.user?.name || session?.user?.email?.split("@")[0] || "Admin";

  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-56 shrink-0 flex-col border-r border-white/10 bg-[#0b0920]/90 backdrop-blur-xl md:flex">
      {/* logo */}
      <div className="flex items-center gap-2.5 px-5 py-5">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-violet-500 to-fuchsia-500 shadow-glow">
          <svg viewBox="0 0 24 24" fill="none" className="text-white" style={{ width: 18, height: 18 }}>
            <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
            <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
          </svg>
        </span>
        <div>
          <div className="text-sm font-bold text-white">极光博客</div>
          <div className="text-xs text-white/40">管理后台</div>
        </div>
      </div>

      <nav className="mt-2 flex-1 space-y-1 px-3">
        {nav.map((n) => {
          const active = n.href === "/admin" ? pathname === "/admin" : pathname.startsWith(n.href);
          return (
            <Link
              key={n.href}
              href={n.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm transition ${
                active
                  ? "border-l-2 border-brand-400 bg-brand-400/10 text-brand-300"
                  : "border-l-2 border-transparent text-white/60 hover:bg-white/5 hover:text-white"
              }`}
            >
              <span className="text-base">{n.icon}</span>
              {n.label}
            </Link>
          );
        })}
      </nav>

      {/* 底部：查看前台 + 用户 */}
      <div className="border-t border-white/10 p-4">
        <Link href="/" target="_blank" className="flex items-center gap-2 text-xs text-white/50 transition hover:text-brand-300">
          ↗ 查看前台
        </Link>
        <div className="mt-3 flex items-center gap-2.5">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-brand-400 to-violet-500 text-xs font-bold text-white">
            {displayName.slice(0, 1).toUpperCase()}
          </span>
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-medium text-white/80">{displayName}</div>
            <button onClick={() => signOut({ callbackUrl: "/admin/login" })} className="text-xs text-rose-400/80 hover:text-rose-300">
              退出登录
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
