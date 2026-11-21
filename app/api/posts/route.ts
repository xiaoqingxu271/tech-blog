import { NextRequest } from "next/server";
import { listPosts, createPost } from "@/server/services/posts";
import { postCreateSchema } from "@/lib/validation";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const data = await listPosts({
    page: sp.get("page") ?? 1,
    pageSize: sp.get("pageSize") ?? 10,
    category: sp.get("category") ?? undefined,
    tag: sp.get("tag") ?? undefined,
    keyword: sp.get("keyword") ?? undefined
  });
  return jsonOk(data);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = postCreateSchema.safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const post = await createPost(parsed.data, auth.session.user!.id as string);
  return jsonOk(post, 201);
}
