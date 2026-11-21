import { NextRequest } from "next/server";
import { jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { rateLimit, clientIp } from "@/lib/rate-limit";

// 阅读量计数：客户端 beacon 调用，不在 SSR 渲染路径写库。
// 去重：同一 visitor cookie 对同一文章 30 分钟内只计一次（cookie 里记录已计过的 slug+时间戳）。
// 另加 IP 限流：60 次/分钟，防止清 cookie 刷量。
const DEDUP_TTL = 30 * 60 * 1000; // 30 分钟

export async function POST(req: NextRequest) {
  // IP 限流：超限直接返回，不写库
  if (rateLimit(`view:${clientIp(req)}`, 60, 60 * 1000)) {
    return jsonOk({ ok: false, counted: false });
  }

  const body = await req.json().catch(() => ({}));
  const slug = body.slug as string | undefined;
  if (!slug) return jsonOk({ ok: false });

  const cookieStore = cookies();
  const raw = cookieStore.get("viewed_posts")?.value;
  let viewed: Record<string, number> = {};
  try {
    viewed = raw ? JSON.parse(raw) : {};
  } catch {
    viewed = {};
  }

  const now = Date.now();
  const last = viewed[slug] ?? 0;
  const shouldCount = now - last > DEDUP_TTL;

  // 清理过期项，控制 cookie 体积
  const cleaned: Record<string, number> = {};
  for (const [k, v] of Object.entries(viewed)) {
    if (now - v < DEDUP_TTL) cleaned[k] = v;
  }

  if (shouldCount) {
    await prisma.post
      .update({ where: { slug }, data: { viewCount: { increment: 1 } } })
      .catch(() => undefined);
    cleaned[slug] = now;
  }

  const res = jsonOk({ ok: true, counted: shouldCount });
  res.cookies.set("viewed_posts", JSON.stringify(cleaned), {
    maxAge: 60 * 60 * 24 * 7,
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return res;
}
