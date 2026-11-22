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

  const pageClass = (active: boolean) =>
    `flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm transition ${
      active
        ? "btn-aurora text-white shadow-glow"
        : "glass border-white/10 text-muted hover:border-brand-400/50 hover:text-brand-300"
    }`;

  const pages: number[] = [];
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || Math.abs(p - page) <= 1) pages.push(p);
  }

  return (
    <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
      {prev ? (
        <Link href={build(prev)} className={pageClass(false)}>‹</Link>
      ) : (
        <span className="flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm text-white/20">‹</span>
      )}
      {pages.map((p, i) => (
        <span key={p} className="flex items-center gap-2">
          {i > 0 && p - pages[i - 1] > 1 && <span className="text-white/30">…</span>}
          <Link href={build(p)} className={pageClass(p === page)}>{p}</Link>
        </span>
      ))}
      {next ? (
        <Link href={build(next)} className={pageClass(false)}>›</Link>
      ) : (
        <span className="flex h-9 min-w-9 items-center justify-center rounded-full px-3 text-sm text-white/20">›</span>
      )}
    </div>
  );
}
