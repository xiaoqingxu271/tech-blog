export default function Footer({ siteName, description }: { siteName: string; description: string }) {
  return (
    <footer className="mt-16 px-4 pb-8">
      <div className="mx-auto max-w-6xl">
        <div className="glass rounded-2xl px-6 py-5 text-center text-sm text-muted">
          <p className="font-medium">{siteName}</p>
          {description && <p className="mt-1 text-xs">{description}</p>}
          <p className="mt-2 text-xs">
            Powered by Next.js · Made with <span className="text-rose-400">❤</span>
          </p>
        </div>
      </div>
    </footer>
  );
}
