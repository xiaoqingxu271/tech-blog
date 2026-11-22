import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

const links = [
  { href: "/", label: "首页" },
  { href: "/categories", label: "分类" },
  { href: "/tags", label: "标签" },
  { href: "/archive", label: "归档" },
  { href: "/about", label: "关于" },
  { href: "/links", label: "友链" }
];

export default function Navbar({ siteName = "极光博客", logo }: { siteName?: string; logo?: string }) {
  return (
    <header className="sticky top-0 z-40 px-4 pt-4">
      <nav className="glass mx-auto flex max-w-6xl items-center justify-between rounded-2xl px-5 py-3">
        <Link href="/" className="flex items-center gap-2.5">
          {logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logo} alt="logo" className="h-8 w-8 rounded-lg object-cover" />
          ) : (
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-400 via-violet-500 to-fuchsia-500 shadow-glow">
              {/* 立方体 logo 近似原型 */}
              <svg viewBox="0 0 24 24" fill="none" className="h-4.5 w-4.5 text-white" style={{ width: 18, height: 18 }}>
                <path d="M12 2 3 7v10l9 5 9-5V7l-9-5z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
              </svg>
            </span>
          )}
          <span className="text-lg font-bold tracking-wide">{siteName}</span>
        </Link>
        <div className="flex items-center gap-1 text-sm sm:gap-4">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="rounded-lg px-2 py-1 text-muted transition hover:text-brand-400 sm:px-3">
              {l.label}
            </Link>
          ))}
          <Link href="/search" aria-label="搜索" className="rounded-lg px-2 py-1 transition hover:text-brand-400 sm:px-3">
            🔍
          </Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
