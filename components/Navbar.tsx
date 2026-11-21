import Link from "next/link";
import ThemeToggle from "./ThemeToggle";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-gray-200/60 bg-white/80 backdrop-blur dark:border-gray-800 dark:bg-slate-900/80">
      <nav className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="text-lg font-bold text-brand-600 dark:text-brand-100">
          技术成长博客
        </Link>
        <div className="flex items-center gap-4 text-sm">
          <Link href="/" className="hover:text-brand-600">首页</Link>
          <Link href="/categories" className="hover:text-brand-600">分类</Link>
          <Link href="/tags" className="hover:text-brand-600">标签</Link>
          <Link href="/archive" className="hover:text-brand-600">归档</Link>
          <Link href="/about" className="hover:text-brand-600">关于</Link>
          <Link href="/search" className="hover:text-brand-600">搜索</Link>
          <ThemeToggle />
        </div>
      </nav>
    </header>
  );
}
