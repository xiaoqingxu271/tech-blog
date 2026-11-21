import { NextRequest } from "next/server";
import { updateCategory, deleteCategory } from "@/server/services/taxonomy";
import { categorySchema } from "@/lib/validation";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  try {
    return jsonOk(await updateCategory(params.id, parsed.data));
  } catch {
    return jsonError("分类不存在或名称冲突", 404);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const r = await deleteCategory(params.id);
  if (!r) return jsonError("分类不存在", 404);
  return jsonOk({ ok: true });
}
