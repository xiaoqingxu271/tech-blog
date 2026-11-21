import { requireAuth, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const [postCount, publishedCount, commentCount, pendingComments, totalViews] =
    await Promise.all([
      prisma.post.count(),
      prisma.post.count({ where: { status: "PUBLISHED" } }),
      prisma.comment.count(),
      prisma.comment.count({ where: { status: "PENDING" } }),
      prisma.post.aggregate({ _sum: { viewCount: true } })
    ]);

  const topPosts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { viewCount: "desc" },
    take: 5,
    select: { title: true, slug: true, viewCount: true }
  });

  return jsonOk({
    postCount,
    publishedCount,
    commentCount,
    pendingComments,
    totalViews: totalViews._sum.viewCount ?? 0,
    topPosts
  });
}
