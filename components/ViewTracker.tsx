"use client";

import { useEffect } from "react";

/** 客户端上报阅读量（cookie 去重），不在 SSR 渲染路径写库 */
export default function ViewTracker({ slug }: { slug: string }) {
  useEffect(() => {
    fetch("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ slug })
    }).catch(() => {});
  }, [slug]);
  return null;
}
