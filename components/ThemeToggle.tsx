"use client";

import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("theme", next ? "dark" : "light");
    } catch {}
  };

  return (
    <button
      onClick={toggle}
      aria-label="切换主题"
      className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-xs transition hover:border-brand-400/60 hover:text-brand-300"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
