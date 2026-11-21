import NextAuth from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/server/auth";
import { rateLimit, clientIp } from "@/lib/rate-limit";

const handler = NextAuth(authOptions);

// 登录防爆破：对 POST（含 credentials 回调）按 IP 限流 5 次/分钟。
// 超限直接 429，不进入 NextAuth，阻断无限撞密码。
// 注意：必须透传 context（含 params.nextauth），否则 NextAuth 路由解析失败。
export async function POST(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  if (rateLimit(`login:${clientIp(req)}`, 5, 60 * 1000)) {
    return NextResponse.json({ error: "尝试过于频繁，请稍后再试" }, { status: 429 });
  }
  return handler(req, ctx);
}

export async function GET(
  req: NextRequest,
  ctx: { params: { nextauth: string[] } }
) {
  return handler(req, ctx);
}
