import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const status = body.status;
  if (!["PENDING", "APPROVED", "SPAM"].includes(status)) {
    return jsonError("无效状态");
  }
  const c = await prisma.comment
    .update({ where: { id: params.id }, data: { status } })
    .catch(() => null);
  if (!c) return jsonError("评论不存在", 404);
  return jsonOk(c);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const c = await prisma.comment.delete({ where: { id: params.id } }).catch(() => null);
  if (!c) return jsonError("评论不存在", 404);
  return jsonOk({ ok: true });
}
