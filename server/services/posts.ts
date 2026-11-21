import prisma from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import type { PostCreateInput, PostUpdateInput } from "@/lib/validation";
import { uniqueSlug } from "@/lib/slug";

export type PostListQuery = {
  page?: number | string;
  pageSize?: number | string;
  category?: string;
  tag?: string;
  keyword?: string;
  includeDrafts?: boolean;
};

/** 安全解析正整数分页参数，非法值（NaN/负数/0/非数字）回退默认值 */
function toPositiveInt(v: unknown, fallback: number): number {
  const n = Number.parseInt(String(v ?? ""), 10);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

async function ensureUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = uniqueSlug(base);
  let slug = root;
  let i = 1;
  // 预检查（缩小竞态窗口，最终仍靠 P2002 兜底）
  let exists = await prisma.post.findUnique({ where: { slug } });
  while (exists && exists.id !== excludeId) {
    slug = `${root}-${i++}`;
    exists = await prisma.post.findUnique({ where: { slug } });
  }
  return slug;
}

export async function listPosts(query: PostListQuery) {
  const page = toPositiveInt(query.page, 1);
  const pageSize = Math.min(50, toPositiveInt(query.pageSize, 10));
  const where: Prisma.PostWhereInput = {};

  if (!query.includeDrafts) {
    where.status = "PUBLISHED";
  }
  if (query.category) where.category = { slug: query.category };
  if (query.tag) where.tags = { some: { tag: { slug: query.tag } } };
  if (query.keyword) {
    // SQLite 不支持 mode:"insensitive"；Postgres 支持。按 provider 适配，保证两端一致。
    const isSqlite = (process.env.DATABASE_URL ?? "").startsWith("file:");
    const kw = query.keyword;
    where.OR = isSqlite
      ? [
          { title: { contains: kw } },
          { contentMd: { contains: kw } }
        ]
      : [
          { title: { contains: kw, mode: "insensitive" } },
          { contentMd: { contains: kw, mode: "insensitive" } }
        ];
  }

  const [total, items] = await Promise.all([
    prisma.post.count({ where }),
    prisma.post.findMany({
      where,
      orderBy: [{ isTop: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      include: { category: true, tags: { include: { tag: true } } }
    })
  ]);

  return {
    items,
    page,
    pageSize,
    total,
    totalPages: Math.ceil(total / pageSize)
  };
}

export async function getPostBySlug(slug: string, includeDrafts = false) {
  const post = await prisma.post.findUnique({
    where: { slug },
    include: { category: true, tags: { include: { tag: true } }, author: true }
  });
  if (!post) return null;
  if (!includeDrafts && post.status !== "PUBLISHED") return null;
  return post;
}

/**
 * 上下篇：用 (publishedAt, id) 复合序避免同时间戳漏项。
 * slug 参数保留用于日志/扩展，当前以 publishedAt+id 定位。
 */
export async function getAdjacentPosts(slug: string, publishedAt: Date, currentId?: string) {
  void slug;
  const ltWhere = currentId
    ? {
        status: "PUBLISHED" as const,
        OR: [
          { publishedAt: { lt: publishedAt } },
          { publishedAt, id: { lt: currentId } }
        ]
      }
    : { status: "PUBLISHED" as const, publishedAt: { lt: publishedAt } };
  const gtWhere = currentId
    ? {
        status: "PUBLISHED" as const,
        OR: [
          { publishedAt: { gt: publishedAt } },
          { publishedAt, id: { gt: currentId } }
        ]
      }
    : { status: "PUBLISHED" as const, publishedAt: { gt: publishedAt } };

  const [prev, next] = await Promise.all([
    prisma.post.findFirst({
      where: ltWhere,
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      select: { title: true, slug: true }
    }),
    prisma.post.findFirst({
      where: gtWhere,
      orderBy: [{ publishedAt: "asc" }, { id: "asc" }],
      select: { title: true, slug: true }
    })
  ]);
  return { prev: prev ?? null, next: next ?? null };
}

export async function createPost(input: PostCreateInput, authorId: string) {
  const publishedAt = input.status === "PUBLISHED" ? new Date() : null;
  const data = {
    title: input.title,
    contentMd: input.contentMd,
    excerpt: input.excerpt ?? null,
    cover: input.cover || null,
    status: input.status,
    isTop: input.isTop,
    categoryId: input.categoryId ?? null,
    authorId,
    publishedAt,
    tags: {
      create: (input.tagIds ?? []).map((tagId) => ({ tagId }))
    }
  };

  // 撞唯一约束(P2002)时换后缀重试一次，兜住 ensureUniqueSlug 的 TOCTOU 竞态
  let slug = await ensureUniqueSlug(input.slug || input.title);
  try {
    return await prisma.post.create({
      data: { ...data, slug },
      include: { category: true, tags: { include: { tag: true } } }
    });
  } catch (e: any) {
    if (e?.code === "P2002") {
      slug = `${slug}-${Date.now().toString(36)}`;
      return prisma.post.create({
        data: { ...data, slug },
        include: { category: true, tags: { include: { tag: true } } }
      });
    }
    throw e;
  }
}

export async function updatePost(id: string, input: PostUpdateInput) {
  const existing = await prisma.post.findUnique({ where: { id } });
  if (!existing) return null;

  const data: Prisma.PostUpdateInput = {};
  if (input.title !== undefined) data.title = input.title;
  if (input.contentMd !== undefined) data.contentMd = input.contentMd;
  if (input.excerpt !== undefined) data.excerpt = input.excerpt ?? null;
  if (input.cover !== undefined) data.cover = input.cover || null;
  if (input.isTop !== undefined) data.isTop = input.isTop;
  if (input.categoryId !== undefined) {
    data.category = input.categoryId
      ? { connect: { id: input.categoryId } }
      : { disconnect: true };
  }
  if (input.slug !== undefined && input.slug !== existing.slug) {
    data.slug = await ensureUniqueSlug(input.slug, id);
  }
  if (input.status !== undefined && input.status !== existing.status) {
    data.status = input.status;
    if (input.status === "PUBLISHED" && !existing.publishedAt) {
      data.publishedAt = new Date();
    }
  }
  if (input.tagIds !== undefined) {
    data.tags = {
      deleteMany: {},
      create: input.tagIds.map((tagId) => ({ tagId }))
    };
  }

  return prisma.post
    .update({
      where: { id },
      data,
      include: { category: true, tags: { include: { tag: true } } }
    })
    .catch((e) => {
      if (e?.code === "P2025") return null;
      if (e?.code === "P2002") {
        // slug 并发撞车：抛出带标记的错误，API 层转 400
        const err = new Error("slug 已被占用");
        (err as any).code = "SLUG_TAKEN";
        throw err;
      }
      throw e;
    });
}

export async function deletePost(id: string) {
  return prisma.post.delete({ where: { id } }).catch((e) => {
    if (e?.code === "P2025") return null;
    throw e;
  });
}

/** 归档：按年月分组统计 */
export async function getArchive() {
  const posts = await prisma.post.findMany({
    where: { status: "PUBLISHED" },
    orderBy: { publishedAt: "desc" },
    select: { id: true, title: true, slug: true, publishedAt: true }
  });
  const groups = new Map<string, typeof posts>();
  for (const p of posts) {
    const d = p.publishedAt ?? new Date();
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(p);
  }
  return Array.from(groups.entries()).map(([month, items]) => ({ month, items }));
}
