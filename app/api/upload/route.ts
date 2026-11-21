import { NextRequest } from "next/server";
import { requireAuth, jsonError, jsonOk } from "@/lib/auth-guard";
import path from "path";
import { randomUUID } from "crypto";

const ALLOWED_EXT = [".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif"];

// 上传策略：
// - 生产（Vercel）：使用 @vercel/blob，文件存对象存储，DB 只存返回 URL。Serverless 文件系统只读。
// - 本地：无 BLOB_READ_WRITE_TOKEN 时回退到 public/uploads（仅本地开发用）。
export async function POST(req: NextRequest) {
  const auth = await requireAuth();
  if (!auth.ok) return auth.response;

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return jsonError("缺少文件");

  // 限制大小与类型
  const MAX = 5 * 1024 * 1024;
  if (file.size > MAX) return jsonError("文件超过 5MB");
  if (!file.type.startsWith("image/")) return jsonError("仅允许上传图片");

  // 净化文件名：只取扩展名并白名单，杜绝 ../、超长、非法字符进 key
  const ext = path.extname(file.name).toLowerCase();
  if (!ALLOWED_EXT.includes(ext)) return jsonError("不支持的图片格式");
  const name = `${Date.now()}-${randomUUID().slice(0, 8)}${ext}`;

  const token = process.env.BLOB_READ_WRITE_TOKEN;

  if (token) {
    // 生产：Vercel Blob
    const { put } = await import("@vercel/blob");
    const blob = await put(name, file, { access: "public", token });
    return jsonOk({ url: blob.url }, 201);
  }

  // 本地开发回退：写 public/uploads
  const { writeFile, mkdir } = await import("fs/promises");
  const bytes = Buffer.from(await file.arrayBuffer());
  const dir = path.join(process.cwd(), "public", "uploads");
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);
  return jsonOk({ url: `/uploads/${name}` }, 201);
}
