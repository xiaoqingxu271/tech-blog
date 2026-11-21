import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { commentCreateSchema } from "@/lib/validation";
import { rateLimit, clientIp } from "@/lib/rate-limit";

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId");
  if (!postId) return jsonError("缺少 postId");
  const comments = await prisma.comment.findMany({
    where: { postId, status: "APPROVED", parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      replies: {
        where: { status: "APPROVED" },
        orderBy: { createdAt: "asc" }
      }
    }
  });
  return jsonOk(comments);
}

export async function POST(req: NextRequest) {
  // 限流：每 IP 每分钟最多 10 条评论
  if (rateLimit(`comment:${clientIp(req)}`, 10, 60 * 1000)) {
    return jsonError("评论过于频繁，请稍后再试", 429);
  }

  const body = await req.json().catch(() => null);
  const parsed = commentCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const c = parsed.data;

  // 校验目标文章存在且已发布，避免外键错 500
  const post = await prisma.post.findUnique({
    where: { id: c.postId },
    select: { status: true }
  });
  if (!post || post.status !== "PUBLISHED") {
    return jsonError("文章不存在或不可评论", 404);
  }
  // 若回复，校验父评论存在且属于同一文章
  if (c.parentId) {
    const parent = await prisma.comment.findUnique({
      where: { id: c.parentId },
      select: { postId: true }
    });
    if (!parent || parent.postId !== c.postId) {
      return jsonError("被回复的评论不存在");
    }
  }

  const comment = await prisma.comment.create({
    data: {
      postId: c.postId,
      parentId: c.parentId || null,
      authorName: c.authorName,
      email: c.email || null,
      website: c.website || null,
      content: c.content,
      status: "PENDING"
    }
  });
  return jsonOk({ id: comment.id, message: "评论已提交，待审核" }, 201);
}

export async function DELETE() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  return jsonError("不支持的批量删除", 405);
}
