import Link from "next/link";

export default function Pagination({
  page,
  totalPages,
  basePath
}: {
  page: number;
  totalPages: number;
  basePath: string;
}) {
  if (totalPages <= 1) return null;
  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;
  const build = (p: number) => {
    const sep = basePath.includes("?") ? "&" : "?";
    return `${basePath}${sep}page=${p}`;
  };

  return (
    <div className="mt-8 flex items-center justify-center gap-4 text-sm">
      {prev ? (
        <Link href={build(prev)} className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-slate-800">
          上一页
        </Link>
      ) : (
        <span className="rounded border border-gray-200 px-3 py-1.5 text-gray-300 dark:border-gray-800">上一页</span>
      )}
      <span className="text-gray-500">
        第 {page} / {totalPages} 页
      </span>
      {next ? (
        <Link href={build(next)} className="rounded border border-gray-300 px-3 py-1.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-slate-800">
          下一页
        </Link>
      ) : (
        <span className="rounded border border-gray-200 px-3 py-1.5 text-gray-300 dark:border-gray-800">下一页</span>
      )}
    </div>
  );
}
