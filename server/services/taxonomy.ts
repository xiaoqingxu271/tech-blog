import prisma from "@/lib/prisma";
import type { z } from "zod";
import type { categorySchema, tagSchema } from "@/lib/validation";
import slugify from "@/lib/slugify";

type CategoryInput = z.infer<typeof categorySchema>;
type TagInput = z.infer<typeof tagSchema>;

// ---- Categories ----
export async function listCategories() {
  return prisma.category.findMany({
    orderBy: { sort: "asc" },
    include: { _count: { select: { posts: true } } }
  });
}

export async function createCategory(input: CategoryInput) {
  return prisma.category.create({
    data: { name: input.name, slug: input.slug || slugify(input.name), sort: input.sort }
  });
}

export async function updateCategory(id: string, input: Partial<CategoryInput>) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.slug !== undefined) data.slug = input.slug;
  if (input.sort !== undefined) data.sort = input.sort;
  return prisma.category.update({ where: { id }, data });
}

export async function deleteCategory(id: string) {
  return prisma.category.delete({ where: { id } }).catch(() => null);
}

// ---- Tags ----
export async function listTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } }
  });
}

export async function createTag(input: TagInput) {
  return prisma.tag.create({
    data: { name: input.name, slug: input.slug || slugify(input.name) }
  });
}

export async function updateTag(id: string, input: Partial<TagInput>) {
  const data: Record<string, unknown> = {};
  if (input.name !== undefined) data.name = input.name;
  if (input.slug !== undefined) data.slug = input.slug;
  return prisma.tag.update({ where: { id }, data });
}

export async function deleteTag(id: string) {
  return prisma.tag.delete({ where: { id } }).catch(() => null);
}
