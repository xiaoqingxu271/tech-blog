import { NextRequest } from "next/server";
import { listCategories, createCategory } from "@/server/services/taxonomy";
import { categorySchema } from "@/lib/validation";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";

export async function GET() {
  return jsonOk(await listCategories());
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const parsed = categorySchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  try {
    return jsonOk(await createCategory(parsed.data), 201);
  } catch {
    return jsonError("分类名称或 slug 已存在", 409);
  }
}
