import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL || "admin@example.com";
  const password = process.env.ADMIN_PASSWORD || "admin123";
  const name = process.env.ADMIN_NAME || "Admin";

  const passwordHash = await bcrypt.hash(password, 10);
  const admin = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { name, email, passwordHash }
  });
  console.log(`✔ 管理员账号已就绪: ${admin.email}`);

  const categories = [
    { name: "前端", slug: "frontend", sort: 1 },
    { name: "后端", slug: "backend", sort: 2 },
    { name: "数据库", slug: "database", sort: 3 },
    { name: "DevOps", slug: "devops", sort: 4 }
  ];
  for (const c of categories) {
    await prisma.category.upsert({ where: { slug: c.slug }, update: {}, create: c });
  }

  const tags = [
    { name: "React", slug: "react" },
    { name: "Next.js", slug: "nextjs" },
    { name: "TypeScript", slug: "typescript" },
    { name: "Prisma", slug: "prisma" },
    { name: "性能优化", slug: "performance" }
  ];
  for (const t of tags) {
    await prisma.tag.upsert({ where: { slug: t.slug }, update: {}, create: t });
  }

  const frontendCat = await prisma.category.findUnique({ where: { slug: "frontend" } });
  const seedPost = await prisma.post.findUnique({ where: { slug: "hello-world" } });
  if (!seedPost) {
    await prisma.post.create({
      data: {
        title: "Hello World：第一篇博客",
        slug: "hello-world",
        excerpt: "这是站点的第一篇文章，用于验证发布 -> 展示的完整闭环。",
        contentMd: `# Hello World\n\n欢迎来到我的技术成长博客。\n\n## 代码高亮演示\n\n\`\`\`ts\nconst greet = (name: string) => \`Hello, \${name}!\`;\nconsole.log(greet("世界"));\n\`\`\`\n\n## 支持的特性\n\n- Markdown 渲染\n- 代码高亮\n- 目录导航\n\n> 持续记录技术成长。\n`,
        status: "PUBLISHED",
        isTop: true,
        publishedAt: new Date(),
        authorId: admin.id,
        categoryId: frontendCat?.id ?? null
      }
    });
  }

  const settings = [
    { key: "site_name", value: "技术成长博客" },
    { key: "site_description", value: "记录学习、踩坑与源码解读" },
    { key: "site_logo", value: "" },
    { key: "about", value: "# 关于我\n\n一名热爱技术的开发者。" },
    { key: "icp", value: "" }
  ];
  for (const s of settings) {
    await prisma.setting.upsert({ where: { key: s.key }, update: {}, create: s });
  }

  console.log("✔ 初始化数据完成");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
