import { NextRequest } from "next/server";
import { listTags, createTag } from "@/server/services/taxonomy";
import { tagSchema } from "@/lib/validation";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";

export async function GET() {
  return jsonOk(await listTags());
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const parsed = tagSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  try {
    return jsonOk(await createTag(parsed.data), 201);
  } catch {
    return jsonError("标签名称或 slug 已存在", 409);
  }
}
