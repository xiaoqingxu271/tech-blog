import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { NextResponse } from "next/server";

export async function requireAuth() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return {
      ok: false as const,
      response: NextResponse.json({ error: "未登录" }, { status: 401 })
    };
  }
  return { ok: true as const, session };
}

export function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export function jsonOk(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}
