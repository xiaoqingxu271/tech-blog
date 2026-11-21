import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";

export async function GET() {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const comments = await prisma.comment.findMany({
    orderBy: { createdAt: "desc" },
    include: { post: { select: { title: true, slug: true } } }
  });
  return jsonOk(comments);
}
