import { NextRequest } from "next/server";
import { updateTag, deleteTag } from "@/server/services/taxonomy";
import { tagSchema } from "@/lib/validation";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const parsed = tagSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  try {
    return jsonOk(await updateTag(params.id, parsed.data));
  } catch {
    return jsonError("标签不存在或名称冲突", 404);
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const r = await deleteTag(params.id);
  if (!r) return jsonError("标签不存在", 404);
  return jsonOk({ ok: true });
}
