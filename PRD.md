# 技术成长博客（程序员向）— 产品需求文档（PRD）

> 版本：v1.0　|　作者：李四（产品 & 架构负责人）　|　定位：个人技术博客，记录学习、踩坑、源码解读，建立个人技术品牌。

---

## 1. 项目概述

- **项目名称**：技术成长博客（程序员向）
- **项目定位**：面向同行的技术分享站，记录学习、踩坑、源码解读，建立个人技术品牌。
- **核心价值**：内容输出 + 个人品牌沉淀，技术圈内传播。
- **开发形态**：单人快速开发，单体同仓，前后端一体。

---

## 2. 完整功能清单

### 2.1 前台功能（访客侧）

| 模块 | 功能点 |
|---|---|
| 首页/文章列表 | 文章卡片列表（标题、摘要、封面、分类、标签、时间、阅读量）、分页加载、置顶展示、按分类/标签/关键词筛选 |
| 文章详情 | Markdown 渲染 + 代码高亮、目录（TOC）、作者/时间/阅读量/字数、上一篇/下一篇、评论、点赞、收藏、版权声明 |
| 分类页 | 分类列表 + 各分类文章数 |
| 标签页 | 标签云 |
| 归档页 | 按年月分组时间线 |
| 搜索 | 站内标题/全文搜索，关键词高亮 |
| 关于页 | 自我介绍、联系方式 |
| 友链页 | 友情链接列表 |
| 其他 | RSS 订阅、404 页、移动端自适应 |

### 2.2 后台功能（管理员侧）

| 模块 | 功能点 |
|---|---|
| 文章管理 | 新建/编辑/删除、草稿/发布/置顶、分类标签绑定、封面上传 |
| 分类管理 | 增删改查、排序 |
| 标签管理 | 增删改查 |
| 媒体管理 | 图片上传、引用 |
| 评论管理 | 审核、回复、删除、垃圾过滤 |
| 友链管理 | 增删改查 |
| 关于页管理 | 富文本编辑 |
| 站点设置 | 站点名、描述、Logo、SEO、备案、主题 |
| 数据统计 | 访问量、阅读量、评论数、最热文章 |
| 账号权限 | 管理员登录、密码修改（单管理员） |

---

## 3. 用户使用流程

### 3.1 访客浏览路径

```
首页 → 点击文章 → 阅读详情（目录/代码/评论）
                 ↘ 点赞 / 收藏 / 评论
首页 → 分类/标签 → 筛选列表 → 阅读
首页 → 归档 → 按时间找文章 → 阅读
首页 → 搜索 → 结果列表 → 阅读
任意页 → 关于 / 友链 / RSS 订阅
```

### 3.2 管理员发布路径

```
登录后台 → 新建文章 → 写 Markdown → 选分类/标签 → 传封面
        → 存草稿 / 直接发布 → 前台可见 → 可编辑/置顶/删除
登录后台 → 评论管理 → 审核/回复
登录后台 → 站点设置 → 改站点信息/主题
```

---

## 4. 技术架构设计

### 4.1 技术选型

| 层 | 选型 | 说明 |
|---|---|---|
| 前端框架 | Next.js 14（App Router）+ React + TypeScript | SEO 友好，SSR/SSG |
| 样式 | Tailwind CSS | 快速、一致 |
| 内容渲染 | react-markdown + rehype/shiki | 代码高亮 |
| 后端 | Next.js API Routes（同仓） | 单人好维护 |
| 数据库 | PostgreSQL + Prisma ORM | 类型安全、迁移方便 |
| 认证 | NextAuth（Credentials/GitHub） | 单管理员 |
| 部署 | Vercel + Vercel Postgres | 零运维 |

### 4.2 项目分层

```
app/                # 页面（App Router 路由）
  (site)/           # 前台页面
  admin/            # 后台页面
components/         # UI 组件
lib/                # 工具、常量
server/             # 服务端逻辑
  db/               # Prisma client、schema
  services/         # 业务函数
  auth/             # 认证
prisma/             # schema + migrations
public/             # 静态资源
```

### 4.3 目录结构

```
blog/
├─ app/
│  ├─ page.tsx            # 首页
│  ├─ posts/[slug]/       # 文章详情
│  ├─ categories/ tags/ archive/ search/ about/ links/
│  ├─ admin/              # 后台
│  └─ api/                # 接口
├─ components/
├─ lib/
├─ server/
│  ├─ db/
│  ├─ services/
│  └─ auth/
├─ prisma/schema.prisma
└─ public/
```

---

## 5. 数据库设计

### 5.1 表结构

**users（管理员）**
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| name | text | |
| email | text unique | |
| password_hash | text | |

**posts（文章）**
| 字段 | 类型 | 说明 |
|---|---|---|
| id | uuid PK | |
| title | text | |
| slug | text unique | 唯一 URL |
| content_md | text | Markdown 原文 |
| content_html | text | 渲染后 HTML（缓存） |
| excerpt | text | 摘要 |
| cover | text? | 封面 URL |
| status | enum | draft / published |
| is_top | bool | 置顶 |
| view_count | int | 阅读量 |
| category_id | uuid FK → categories | |
| author_id | uuid FK → users | |
| created_at / updated_at / published_at | timestamptz | |

**categories（分类）**
| id, name, slug, sort, created_at |

**tags（标签）**
| id, name, slug |

**post_tags（文章-标签多对多）**
| post_id FK, tag_id FK |

**comments（评论）**
| id, post_id FK, parent_id FK(可空), author_name, email, content, status, created_at |

**links（友链）**
| id, name, url, avatar, description, sort |

**settings（站点设置 KV）**
| key, value |

**likes / favorites（点赞收藏）**
| post_id FK, ip/visitor_id, created_at |

### 5.2 关联关系

```
users 1 ─ n posts
categories 1 ─ n posts
posts n ─ n tags  (post_tags)
posts 1 ─ n comments (自关联 parent_id 支持回复)
```

---

## 6. 开发优先级（分阶段）

| 阶段 | 内容 | 工期 |
|---|---|---|
| 阶段 0 · 脚手架 | 初始化 Next.js + TS + Tailwind + Prisma + 数据库 | 1 天 |
| 阶段 1 · MVP | 建表、首页列表 + 文章详情（Markdown+高亮）、登录 + 文章增删改发 + 分类/标签管理 | 3–5 天 |
| 阶段 2 · 前台体验 | 分类/标签/归档/搜索/TOC/上下篇/RSS/关于/友链 | 2–3 天 |
| 阶段 3 · 互动增强 | 评论、点赞收藏、访问统计、置顶、封面/媒体管理 | 2–3 天 |
| 阶段 4 · 打磨上线 | SEO、主题、响应式、站点设置、性能优化、部署 | 1–2 天 |

> 关键：阶段 1 跑通「发布→展示」闭环即可上线，后续功能增量迭代，风险最低。
