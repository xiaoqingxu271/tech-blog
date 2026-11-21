export const dynamic = "force-dynamic";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import { listCategories } from "@/server/services/taxonomy";

export default async function CategoriesPage() {
  const categories = await listCategories();
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-3xl px-4 py-8">
        <h1 className="mb-6 text-2xl font-bold">分类</h1>
        <div className="grid gap-3 sm:grid-cols-2">
          {categories.map((c) => (
            <Link key={c.id} href={`/categories/${c.slug}`} className="flex items-center justify-between rounded-lg border border-gray-200 p-4 hover:border-brand-500 dark:border-gray-800">
              <span className="font-medium">{c.name}</span>
              <span className="text-sm text-gray-400">{c._count.posts} 篇</span>
            </Link>
          ))}
          {categories.length === 0 && <p className="text-gray-400">暂无分类</p>}
        </div>
      </main>
    </>
  );
}
