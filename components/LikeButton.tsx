"use client";

import { useEffect, useState } from "react";

export default function LikeButton({ postId, initialCount }: { postId: string; initialCount: number }) {
  const [count, setCount] = useState(initialCount);
  const [liked, setLiked] = useState(false);

  useEffect(() => {
    // 服务端 cookie 判定是否已赞，前端不再持有/伪造 visitorId
    fetch(`/api/likes?postId=${postId}`, { credentials: "same-origin" })
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.count === "number") setCount(d.count);
        setLiked(!!d.liked);
      })
      .catch(() => {});
  }, [postId]);

  const toggle = async () => {
    if (!liked) {
      const res = await fetch("/api/likes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ postId })
      });
      const d = await res.json();
      if (res.ok) {
        setCount(d.count);
        setLiked(true);
      }
    } else {
      const res = await fetch(`/api/likes?postId=${postId}`, {
        method: "DELETE",
        credentials: "same-origin"
      });
      const d = await res.json();
      if (res.ok) {
        setCount(d.count);
        setLiked(false);
      }
    }
  };

  return (
    <button
      onClick={toggle}
      className={`rounded-full border px-4 py-2 text-sm transition ${
        liked
          ? "border-red-300 bg-red-50 text-red-500 dark:bg-red-950/30"
          : "border-gray-300 hover:border-red-300 hover:text-red-500 dark:border-gray-700"
      }`}
    >
      ❤ {liked ? "已赞" : "点赞"} ({count})
    </button>
  );
}
