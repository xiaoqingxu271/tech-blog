import { NextRequest } from "next/server";
import { updatePost, deletePost, getPostBySlug } from "@/server/services/posts";
import { postUpdateSchema } from "@/lib/validation";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";

// 公开读取：只返回已发布文章（includeDrafts=false），避免草稿泄漏。
// 管理端编辑所需的草稿全文走 /api/admin/posts/[id]（带鉴权）。
export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const post = await getPostBySlug(params.id, false);
  if (!post) return jsonError("文章不存在", 404);
  return jsonOk(post);
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = postUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  let post;
  try {
    post = await updatePost(params.id, parsed.data);
  } catch (e: any) {
    if (e?.code === "SLUG_TAKEN" || e?.code === "P2002") {
      return jsonError("slug 已被占用", 400);
    }
    throw e;
  }
  if (!post) return jsonError("文章不存在", 404);
  return jsonOk(post);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const post = await deletePost(params.id);
  if (!post) return jsonError("文章不存在", 404);
  return jsonOk({ ok: true });
}
