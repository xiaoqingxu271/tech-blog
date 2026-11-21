import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import prisma from "@/lib/prisma";
import { linkSchema } from "@/lib/validation";
import { revalidatePath } from "next/cache";

export async function GET() {
  const links = await prisma.link.findMany({ orderBy: { sort: "asc" } });
  return jsonOk(links);
}

export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => null);
  const parsed = linkSchema.safeParse(body);
  if (!parsed.success) return jsonError(parsed.error.issues.map((i) => i.message).join("; "));
  const link = await prisma.link.create({
    data: {
      name: parsed.data.name,
      url: parsed.data.url,
      avatar: parsed.data.avatar || null,
      description: parsed.data.description || null,
      sort: parsed.data.sort
    }
  });
  revalidatePath("/links");
  return jsonOk(link, 201);
}
