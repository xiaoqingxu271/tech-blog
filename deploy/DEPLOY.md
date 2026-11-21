# tech-blog 部署方案

主方案：**Vercel + Vercel Postgres**（零运维，免费额度够单人博客用）。
备选：**Docker Compose 自托管**（需要一台 1C2G VPS，数据完全自持）。

---

## 一、主方案：Vercel + Vercel Postgres

### 1. 前置：Git 仓库

```powershell
cd D:\Code\tech-blog
git init
git add .
git commit -m "chore: initial commit"
# 推到 GitHub 私有仓库后，在 Vercel 导入该仓库
```

`.gitignore` 已排除 `.env`，确认真实密钥永不进仓库。

### 2. 创建数据库（Vercel Storage → Postgres，基于 Neon）

1. Vercel 项目 → **Storage** → Create Database → Postgres。
2. 创建后 Vercel 自动注入 `POSTGRES_URL`、`POSTGRES_URL_NON_POOLING` 等环境变量。
3. 再加一条自定义变量：`DATABASE_URL`，值填 `$POSTGRES_URL`（引用语法，Prisma 读它）。

### 3. 其余环境变量（Settings → Environment Variables）

| 变量 | Production | Preview/Dev | 说明 |
|---|---|---|---|
| `DATABASE_URL` | `$POSTGRES_URL` | 同左 | 见上 |
| `NEXTAUTH_SECRET` | `openssl rand -base64 32` 生成 | 各自独立 | 必填 |
| `NEXTAUTH_URL` | `https://正式域名` | 留空 | Vercel 上可留空自动推断 |
| `BLOB_READ_WRITE_TOKEN` | 创建 Blob Store 后自动注入 | 本地开发从控制台复制 | 图片上传用（见 3.1） |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 首次 seed 时加 | — | **seed 完成后删掉** |

模板见 `.env.vercel.example`。

### 3.1 图片上传：必须走 Vercel Blob

Vercel Serverless 文件系统只读，写 `public/uploads` 部署即丢。方案：

1. 项目 → Storage → Create Blob Store，Vercel 自动注入 `BLOB_READ_WRITE_TOKEN`。
2. `@vercel/blob` 的 `put()` 返回公网 URL，DB 只存该 URL。
3. `next.config.js` 的 `images.remotePatterns` 加 `*.public.blob.vercel-storage.com`。
4. 自托管备选仍可用本地卷（`docker-compose.yml` 已挂 `uploads:/app/public/uploads`），两套按 `BLOB_READ_WRITE_TOKEN` 是否存在切换即可。

### 4. Prisma 迁移策略（关键）

> **✅ 现状（2026-11-20）**：`prisma/migrations/0_init` 已生成并提交（与 schema 核对一致：2 enum、9 表、12 索引、7 外键）。
> 后续每次改 `schema.prisma` 必须本地 `npm run db:migrate` 生成新迁移并一起提交，
> 生产只跑 `db:deploy`，**禁止在生产用 `db push`**（会与 migrations 历史脱节）。
> 注意：`0_init` 由 `migrate diff --from-empty` 生成，目标库必须是**空库**；
> 若库里已有 db push 建的表，`migrate deploy` 会报 table already exists，此时用
> `npx prisma migrate resolve --applied 0_init` 做基线标记，不要手工改表。

- 开发期在本地跑 `npm run db:migrate` 生成迁移文件，**提交 `prisma/migrations/` 进 git**。
- 生产库执行迁移用 **direct 连接**（`POSTGRES_URL_NON_POOLING`），不要用 PgBouncer 池连接跑 DDL，会报 prepared statement 错误：

```powershell
# 本地一次性把已提交的迁移应用到生产库
$env:DATABASE_URL = "<POSTGRES_URL_NON_POOLING 的值>"
npm run db:deploy     # 即 npx prisma migrate deploy，脚本已在 package.json 加好
```

- 首次上线顺序（migrations 必须**先存在于仓库**，不能指望首次部署生成；Vercel 部署不会自动建表）：
  1. 导入仓库 + Storage 建 Postgres（得到 `POSTGRES_URL*`），配齐环境变量；
  2. 本地对 direct 连接跑 `npm run db:deploy` —— 表结构由**仓库里已提交的迁移**建出；
  3. 本地跑 seed 建管理员；
  4. 删除 `ADMIN_*` 变量；
  5. push main 正式部署。
  任一步失败都不进下一步；第 2 步报 `No migrations found` = 前置校验没过，退回生成迁移。
- seed（建初始管理员 + 示例数据）：

```powershell
npx tsx prisma/seed.ts
```

### 5. 构建与部署

- `vercel.json` 已配好：`prisma generate && next build`、安全响应头、静态资源缓存。
- 推送 main 分支即自动部署；PR 自动出 Preview。
- 构建失败先本地复现：`npm run build`。

### 6. 域名与 HTTPS

1. 域名（如 `blog.yourdomain.com`）在 DNS 服务商处添加 CNAME → `cname.vercel-dns.com`（Vercel 会给出确切值）。
2. 项目 → Settings → Domains → Add，验证通过后 **TLS 证书自动签发续期，无需 certbot**。
3. 国内备案域名解析到 Vercel 不稳定，建议域名不备案走海外节点，或直接用 `*.vercel.app`。

### 7. 回滚预案

- **应用回滚**：Vercel Deployments 列表 → 选上一个成功部署 → Promote to Production，秒级切换。
- **数据库回滚**：迁移只加表/加列、不做破坏性删除（规范写进 PRD），出问题回滚应用即可，旧版代码兼容新 schema。确需回滚 schema 时用 Neon 控制台的时间点还原。
- **数据备份**：每周一次 `pg_dump`（用 direct URL）存档：
  ```powershell
  pg_dump "$env:DATABASE_URL" -F c -f "backup-$((Get-Date -Format yyyyMMdd)).dump"
  ```

---

## 二、备选方案：Docker 自托管（Ubuntu 22.04 VPS）

配置已就绪：`Dockerfile`（多阶段 + standalone）、`docker-compose.yml`（app + Postgres + 健康检查）、`deploy/nginx/tech-blog.conf`（HTTPS 反代）、`deploy/compose/.env.example`。

```bash
# 1. 装 Docker
curl -fsSL https://get.docker.com | sh

# 2. 拉代码、配环境变量（前提：仓库里已有 prisma/migrations/，否则容器 CMD 的 migrate deploy 会失败重启循环）
git clone <repo> && cd tech-blog
test -d prisma/migrations && ls prisma/migrations || echo "FATAL: 缺少 migrations，禁止继续"
cp deploy/compose/.env.example deploy/compose/.env && vim deploy/compose/.env

# 3. 起服务（db 健康后 app 自动启动并执行 migrate deploy）
docker compose --env-file deploy/compose/.env up -d --build

# 4. Nginx + 证书
apt install -y nginx certbot python3-certbot-nginx
cp deploy/nginx/tech-blog.conf /etc/nginx/sites-available/ && ln -s /etc/nginx/sites-available/tech-blog /etc/nginx/sites-enabled/
sed -i 's/blog.yourdomain.com/你的域名/g' /etc/nginx/sites-enabled/tech-blog
nginx -t && systemctl reload nginx
certbot --nginx -d 你的域名          # 自动签发 + 续期

# 5. 防火墙
ufw allow 80,443 && ufw deny 3000 && ufw enable
```

- 3000 端口只绑 `127.0.0.1`，公网必须走 Nginx。
- 升级：`git pull && docker compose up -d --build`；回滚：`docker compose down && git checkout <上个 tag> && up -d --build`。
- 备份：`docker exec blog-pg pg_dump -U blog techblog > backup.sql`（加 cron 每日）。

---

## 三、上线检查清单

- [ ] `npm run build` 本地通过
- [ ] `prisma/migrations/` 已提交（0_init 已就位）；生产库为空库或已 resolve 基线
- [ ] 生产 `migrate deploy` 成功、seed 后已删除 `ADMIN_*` 变量
- [ ] 登录后台发布一篇测试文章，前台可见
- [ ] HTTPS 生效、http 301 到 https
- [ ] `/_next/static/*` 命中 immutable 缓存
- [ ] 404 / RSS / 移动端自适应抽查
- [ ] 备份任务已配置

## 四、常见故障速查

| 现象 | 定位 | 根因/修复 |
|---|---|---|
| 构建报 `Can't reach database server` | Vercel build log | `prisma generate` 不需要连库；确认 build 命令没混入 `migrate` |
| 登录跳转循环 | 浏览器 Network + `NEXTAUTH_URL` | URL 与访问域名不一致（含 http/https、www） |
| 迁移报 `prepared statement` | 连接串 | 用了 pool 连接跑 DDL，换 `POSTGRES_URL_NON_POOLING` |
| 502（自托管） | `docker logs blog-app` / `nginx error.log` | app 未起或端口不通；先 `curl 127.0.0.1:3000` 分段定位 |
| 证书续期失败 | `certbot renew --dry-run` | 80 端口被占 / DNS 未指向本机 |
