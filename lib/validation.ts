import { z } from "zod";

// 仅允许 http/https，阻断 javascript:/data: 等存储型 XSS
const httpUrl = z
  .string()
  .url()
  .refine((u) => /^https?:\/\//i.test(u), "仅允许 http/https 协议");

export const postCreateSchema = z.object({
  title: z.string().min(1, "标题不能为空").max(200),
  slug: z.string().min(1).max(200).optional(),
  contentMd: z.string().min(1, "正文不能为空"),
  excerpt: z.string().max(500).optional().nullable(),
  cover: httpUrl.optional().nullable().or(z.literal("")),
  status: z.enum(["DRAFT", "PUBLISHED"]).default("DRAFT"),
  isTop: z.boolean().default(false),
  categoryId: z.string().uuid().optional().nullable(),
  tagIds: z.array(z.string().uuid()).optional().default([])
});

export const postUpdateSchema = postCreateSchema.partial();

export const categorySchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).optional(),
  sort: z.number().int().default(0)
});

export const tagSchema = z.object({
  name: z.string().min(1).max(50),
  slug: z.string().min(1).max(50).optional()
});

export const commentCreateSchema = z.object({
  postId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable(),
  authorName: z.string().min(1).max(50),
  email: z.string().email().optional().nullable().or(z.literal("")),
  website: httpUrl.optional().nullable().or(z.literal("")),
  content: z.string().min(1).max(2000)
});

export const linkSchema = z.object({
  name: z.string().min(1).max(50),
  url: httpUrl,
  avatar: httpUrl.optional().nullable().or(z.literal("")),
  description: z.string().max(200).optional().nullable(),
  sort: z.number().int().default(0)
});

export type PostCreateInput = z.infer<typeof postCreateSchema>;
export type PostUpdateInput = z.infer<typeof postUpdateSchema>;
