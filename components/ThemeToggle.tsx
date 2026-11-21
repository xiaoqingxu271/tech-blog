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
      className="rounded-md border border-gray-300 px-2 py-1 text-xs hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-slate-800"
    >
      {dark ? "🌙" : "☀️"}
    </button>
  );
}
