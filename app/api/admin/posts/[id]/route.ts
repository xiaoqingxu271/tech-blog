import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

// 管理端专用：按 id 读取任意文章（含草稿），需登录。
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const post = await prisma.post
    .findUnique({
      where: { id: params.id },
      include: { category: true, tags: { include: { tag: true } }, author: true }
    })
    .catch(() => null);

  if (!post) return jsonError("文章不存在", 404);
  return jsonOk(post);
}
