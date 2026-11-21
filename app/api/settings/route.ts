import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import { getSettings, setSetting } from "@/server/services/settings";
import { revalidatePath } from "next/cache";

export async function GET() {
  return jsonOk(await getSettings());
}

export async function PUT(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;
  const body = await req.json().catch(() => ({}));
  const allowed = ["site_name", "site_description", "site_logo", "about", "icp"];
  for (const key of allowed) {
    if (body[key] !== undefined) await setSetting(key, String(body[key]));
  }
  revalidatePath("/", "layout");
  return jsonOk(await getSettings());
}
