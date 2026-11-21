import { requireAuth, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const posts = await prisma.post.findMany({
    orderBy: [{ updatedAt: "desc" }],
    select: {
      id: true,
      title: true,
      slug: true,
      status: true,
      isTop: true,
      viewCount: true,
      updatedAt: true,
      category: { select: { name: true } }
    }
  });
  return jsonOk(posts);
}
