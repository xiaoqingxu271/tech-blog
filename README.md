# 技术成长博客（Tech Blog）

面向程序员的技术分享博客，基于 **Next.js 14（App Router）+ TypeScript + Tailwind CSS + Prisma + PostgreSQL** 的单仓全栈项目。

## 技术栈

| 层 | 选型 |
|---|---|
| 前端 | Next.js 14 App Router、React 18、TypeScript |
| 样式 | Tailwind CSS（内置深色模式） |
| 内容渲染 | react-markdown + remark-gfm + rehype-highlight + rehype-slug |
| 后端 | Next.js Route Handlers（同仓 API） |
| 数据库 | PostgreSQL + Prisma ORM |
| 认证 | NextAuth（Credentials，单管理员） |

## 目录结构

```
tech-blog/
├─ app/
│  ├─ page.tsx                # 首页（文章列表 + 分页）
│  ├─ posts/[slug]/           # 文章详情（Markdown/代码高亮/TOC/评论/点赞）
│  ├─ categories/ tags/       # 分类 / 标签
│  ├─ archive/ search/        # 归档 / 搜索
│  ├─ about/ links/           # 关于 / 友链
│  ├─ rss.xml/ sitemap.ts robots.ts
│  ├─ admin/                  # 后台（仪表盘/文章/分类/标签/评论/友链/设置）
│  └─ api/                    # REST 接口
├─ components/                # 可复用 UI 组件
├─ lib/                       # prisma、校验、工具
├─ server/
│  ├─ auth/                   # NextAuth 配置
│  └─ services/               # 业务函数（posts/taxonomy/settings）
├─ prisma/
│  ├─ schema.prisma           # 数据模型
│  └─ seed.ts                 # 初始化管理员/分类/标签/示例文章
└─ public/uploads/            # 本地上传目录
```

## 本地启动

```bash
# 1. 安装依赖
npm install

# 2. 准备环境变量
cp .env.example .env
#   修改 DATABASE_URL / NEXTAUTH_SECRET 等

# 3. 准备数据库（任选其一）
#    - 本机 PostgreSQL
#    - Docker:
docker run -d --name blog-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=techblog -p 5432:5432 postgres:16

# 4. 建表 + 初始化数据
npm run db:push
npm run db:seed

# 5. 启动开发服务
npm run dev
# 前台 http://localhost:3000
# 后台 http://localhost:3000/admin （默认 admin@example.com / admin123）
```

## 数据模型（核心）

- `User` 管理员
- `Category` / `Tag` 分类与标签，`PostTag` 多对多
- `Post` 文章（Markdown 原文、状态、置顶、阅读量、发布/更新时间）
- `Comment` 评论（支持 `parentId` 楼中楼，审核状态）
- `Link` 友链、`Setting` 站点配置（KV）
- `Like` 点赞（按 visitorId 去重）

## 主要接口

| 方法 | 路径 | 说明 | 鉴权 |
|---|---|---|---|
| GET | /api/posts | 文章列表（分页/筛选/搜索） | 否 |
| POST | /api/posts | 新建文章 | 是 |
| GET/PUT/DELETE | /api/posts/:id | 文章详情/更新/删除 | 部分 |
| GET/POST | /api/categories | 分类列表/新增 | POST 需鉴权 |
| PUT/DELETE | /api/categories/:id | 分类更新/删除 | 是 |
| GET/POST | /api/tags | 标签列表/新增 | POST 需鉴权 |
| PUT/DELETE | /api/tags/:id | 标签更新/删除 | 是 |
| GET/POST | /api/comments | 评论列表/提交 | POST 免登录 |
| PATCH/DELETE | /api/comments/:id | 审核/删除评论 | 是 |
| GET/POST | /api/links | 友链 | POST 需鉴权 |
| PUT/DELETE | /api/links/:id | 友链更新/删除 | 是 |
| GET/PUT | /api/settings | 站点设置 | PUT 需鉴权 |
| GET | /api/admin/stats | 仪表盘统计 | 是 |
| POST | /api/upload | 图片上传 | 是 |
| GET/POST/DELETE | /api/likes | 点赞 | 否 |

## 开发与校验

> ⚠️ 类型检查前务必先 `npx prisma generate`，否则可能因旧 client 残留误报（如 `mode` 字段不存在）。
> 若用 SQLite 做过本地自测，收尾务必重新 `npx prisma generate`（按 `prisma/schema.prisma`）复原 Postgres client，避免 `tsc`/构建误报。

```bash
npx prisma generate     # 生成 Prisma client（类型检查/构建前置）
npx tsc --noEmit        # 类型检查
npm run build           # 生产构建
npm run lint            # ESLint
```

## 数据库迁移（生产必读）

已提交初始迁移到 `prisma/migrations/`。**首次部署**流程：

```bash
# 生产环境不要用 db push，用 migrate deploy 走版本化迁移
npm run db:deploy        # = prisma migrate deploy
npm run db:seed          # 初始化管理员/分类/标签/示例（可选）
```

若新增/修改了 schema，本地用 `npx prisma migrate dev --name xxx` 生成迁移文件并提交。

## 构建

```bash
npm run build
npm run start
```

## 上传策略（重要）

- **Vercel（生产）**：设置 `BLOB_READ_WRITE_TOKEN`（Vercel 控制台建 Blob Store 后自动注入），上传走 `@vercel/blob`，DB 只存返回的 URL。`next.config.js` 的 `images.remotePatterns` 已包含 `*.public.blob.vercel-storage.com`。
- **Docker / 本地自托管**：不设 `BLOB_READ_WRITE_TOKEN` 时回退写 `public/uploads`，需挂载持久卷 `uploads:/app/public/uploads` 并保证容器内属主为运行用户，否则会 EACCES。
- ⚠️ **迁移提醒**：Vercel 上 `public/uploads` 目录里的旧文件在部署后**不存在**（构建产物不含运行时写入）。若切换前本地/旧环境已上传过图片，需重新上传（迁移到 Blob）后再上线，否则历史文章封面会 404。
