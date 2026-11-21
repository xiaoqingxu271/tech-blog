import Navbar from "@/components/Navbar";
import Link from "next/link";

export default function NotFound() {
  return (
    <>
      <Navbar />
      <main className="mx-auto flex max-w-3xl flex-col items-center px-4 py-24 text-center">
        <h1 className="text-6xl font-bold text-brand-600">404</h1>
        <p className="mt-4 text-gray-500">你访问的页面不存在</p>
        <Link href="/" className="mt-6 rounded bg-brand-600 px-4 py-2 text-sm text-white hover:bg-brand-700">
          返回首页
        </Link>
      </main>
    </>
  );
}
