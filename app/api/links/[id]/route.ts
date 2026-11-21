import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { linkSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const body = await req.json().catch(() => null);
  const parsed = linkSchema.partial().safeParse(body);
  if (!parsed.success) {
    return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  }
  const d = parsed.data;
  const data: Record<string, unknown> = {};
  if (d.name !== undefined) data.name = d.name;
  if (d.url !== undefined) data.url = d.url;
  if (d.avatar !== undefined) data.avatar = d.avatar || null;
  if (d.description !== undefined) data.description = d.description ?? null;
  if (d.sort !== undefined) data.sort = d.sort;

  const link = await prisma.link
    .update({ where: { id: params.id }, data })
    .catch((e) => {
      if (e?.code === "P2025") return null;
      throw e;
    });
  if (!link) return jsonError("友链不存在", 404);
  revalidatePath("/links");
  return jsonOk(link);
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const r = await prisma.link.delete({ where: { id: params.id } }).catch(() => null);
  if (!r) return jsonError("友链不存在", 404);
  revalidatePath("/links");
  return jsonOk({ ok: true });
}
