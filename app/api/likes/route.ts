import { NextRequest } from "next/server";
import { jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { randomUUID } from "crypto";
import { rateLimit, clientIp } from "@/lib/rate-limit";

function getOrSetVisitorId(): string | null {
  const store = cookies();
  return store.get("visitor_id")?.value ?? null;
}

function ensureVisitorCookie(): string {
  const store = cookies();
  return store.get("visitor_id")?.value ?? randomUUID();
}

export async function POST(req: NextRequest) {
  if (rateLimit(`like:${clientIp(req)}`, 30, 60 * 1000)) {
    return jsonError("操作过于频繁，请稍后再试", 429);
  }

  const body = await req.json().catch(() => ({}));
  const postId = body.postId as string | undefined;
  if (!postId) return jsonError("缺少 postId");

  const visitorId = ensureVisitorCookie();

  // 幂等：已点赞则直接返回当前计数
  await prisma.like
    .create({ data: { postId, visitorId } })
    .catch(() => undefined);

  const count = await prisma.like.count({ where: { postId } });
  const res = jsonOk({ count, liked: true });
  res.cookies.set("visitor_id", visitorId, {
    maxAge: 60 * 60 * 24 * 365,
    httpOnly: true,
    sameSite: "lax",
    path: "/"
  });
  return res;
}

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return jsonError("缺少 postId");
  const visitorId = getOrSetVisitorId();
  const [count, mine] = await Promise.all([
    prisma.like.count({ where: { postId } }),
    visitorId
      ? prisma.like.findUnique({ where: { postId_visitorId: { postId, visitorId } } })
      : Promise.resolve(null)
  ]);
  return jsonOk({ count, liked: !!mine });
}

export async function DELETE(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return jsonError("缺少 postId");
  const visitorId = getOrSetVisitorId();
  if (visitorId) {
    await prisma.like.deleteMany({ where: { postId, visitorId } });
  }
  const count = await prisma.like.count({ where: { postId } });
  return jsonOk({ count, liked: false });
}
