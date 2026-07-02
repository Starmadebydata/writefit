# WriteFit

> 一个训练你自己写作能力的 AI 写作教练。
>
> An AI writing coach that trains your writing ability instead of replacing it.
>
> 🌐 线上地址：https://writefit.app

## 这是什么？

WriteFit 是一个 AI Native 写作训练 Web 应用。它**不是** AI 代写工具，也**不是**传统写作课程网站。

核心机制：**用户先写，AI 后反馈。**

每天 15 分钟，通过每日短练习、AI 诊断、用户自主修改、版本对比、素材沉淀和周期复盘，帮助用户长期恢复和提升写作能力。

## 技术栈

| 项目 | 技术选型 | 说明 |
|------|----------|------|
| 前端框架 | Next.js 16 (App Router) | React 19 + TypeScript |
| UI 组件 | shadcn/ui + Tailwind CSS v4 | 清爽克制的墨绿主题 |
| 登录系统 | Auth.js v5 (NextAuth) | GitHub / Google 第三方登录 |
| 数据库 | Cloudflare D1 (SQLite) | 边缘节点数据库 |
| ORM | Drizzle ORM | 类型安全的数据库操作 |
| AI 服务 | DeepSeek API | 中文能力强的 AI 写作教练 |
| 部署平台 | Cloudflare Pages | 边缘部署，全球加速 |

## 项目结构

```
writefit/
├── app/                        # Next.js App Router 页面
│   ├── page.tsx                # Landing Page 首页
│   ├── layout.tsx              # 全局布局
│   ├── globals.css             # 全局样式 + 主题色
│   ├── auth/login/             # 登录页面
│   ├── dashboard/              # 仪表盘
│   ├── practice/today/         # 今日训练
│   ├── sentence-gym/           # 句子训练
│   ├── drafts/                 # 草稿实验室
│   ├── ideas/                  # 素材库
│   ├── progress/               # 进度页
│   ├── settings/               # 设置页
│   ├── onboarding/             # 新用户引导
│   └── api/auth/               # Auth.js API 路由
│
├── components/                 # React 组件
│   ├── layout/                 # 布局组件（AppShell、Sidebar、TopNav）
│   ├── practice/               # 训练相关组件
│   ├── editor/                 # 编辑器组件
│   ├── feedback/               # AI 反馈展示组件
│   ├── ideas/                  # 素材库组件
│   ├── drafts/                 # 草稿组件
│   ├── progress/               # 进度组件
│   └── ui/                     # shadcn/ui 基础组件
│
├── lib/                        # 工具库
│   ├── ai/                     # AI 相关
│   │   ├── client.ts           # DeepSeek API 客户端
│   │   ├── prompts.ts          # AI Prompt 集中管理
│   │   └── schemas.ts          # AI 反馈数据类型
│   ├── auth/                   # 登录系统
│   │   ├── auth.ts             # Auth.js 配置
│   │   └── types.ts            # 类型扩展
│   ├── db/                     # 数据库
│   │   ├── schema.ts           # 数据库表结构定义
│   │   └── index.ts            # 数据库连接工具
│   ├── practice/               # 训练逻辑
│   │   ├── prompts.ts          # 训练题库
│   │   └── scheduler.ts        # 今日任务生成
│   └── utils.ts                # 通用工具函数
│
├── drizzle/                    # 数据库迁移文件
│   └── migrations/
│
├── wrangler.jsonc              # Cloudflare Workers 配置
├── open-next.config.ts         # OpenNext 配置（Cloudflare 适配）
├── drizzle.config.ts           # Drizzle Kit 配置
├── middleware.ts               # 路由保护中间件
└── .env.example                # 环境变量模板
```

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
```

在 `.env` 文件中填入以下值：

| 变量名 | 获取方式 |
|--------|----------|
| `AUTH_SECRET` | 运行 `openssl rand -base64 32` 生成 |
| `AUTH_GITHUB_ID` | [GitHub OAuth 应用](https://github.com/settings/developers) |
| `AUTH_GITHUB_SECRET` | 同上 |
| `AUTH_GOOGLE_ID` | [Google OAuth 应用](https://console.cloud.google.com/apis/credentials) |
| `AUTH_GOOGLE_SECRET` | 同上 |
| `DEEPSEEK_API_KEY` | [DeepSeek 平台](https://platform.deepseek.com/) |

### 3. 生成数据库迁移

```bash
npm run db:generate    # 根据表结构生成迁移文件
npm run db:migrate     # 在本地 D1 数据库执行迁移
```

### 4. 启动开发服务器

```bash
npm run dev
```

打开 [http://localhost:3000](http://localhost:3000) 即可看到首页。

## 常用命令

| 命令 | 作用 |
|------|------|
| `npm run dev` | 启动本地开发服务器 |
| `npm run build` | 构建生产版本 |
| `npm run lint` | 运行代码检查 |
| `npm run db:generate` | 生成数据库迁移文件 |
| `npm run db:migrate` | 执行本地数据库迁移 |
| `npm run db:studio` | 打开 Drizzle Studio 可视化数据库 |
| `npm run preview` | 用 Cloudflare 本地环境预览 |
| `npm run deploy` | 部署到 Cloudflare |

## 数据库表结构

| 表名 | 用途 |
|------|------|
| `users` | 用户基本信息 |
| `accounts` | 第三方登录账号关联 |
| `sessions` | 登录会话 |
| `profiles` | 用户写作画像（Onboarding 设置） |
| `writing_goals` | 写作目标 |
| `practice_sessions` | 训练会话记录 |
| `drafts` | 草稿 |
| `draft_versions` | 草稿版本历史 |
| `ai_feedbacks` | AI 反馈记录 |
| `ideas` | 素材库 |
| `progress_metrics` | 进度指标 |

## 开发进度

### 已完成（项目框架搭建）

- [x] Next.js 16 + TypeScript + Tailwind CSS v4 项目初始化
- [x] shadcn/ui 组件库配置
- [x] Cloudflare 部署配置（OpenNext + Wrangler）
- [x] Drizzle ORM + D1 数据库表结构设计
- [x] Auth.js v5 第三方登录（GitHub / Google）
- [x] DeepSeek API 客户端 + AI Prompt 设计
- [x] 基础布局组件（AppShell、Sidebar、TopNav）
- [x] Landing Page 首页
- [x] Dashboard 仪表盘基础版
- [x] 路由保护中间件
- [x] 训练题库 + 调度器

### 待开发（按优先级）

- [ ] Onboarding 新用户引导流程
- [ ] 今日训练完整 5 阶段流程
- [ ] AI 诊断 API 接口
- [ ] 用户修改 + 版本对比（Diff Viewer）
- [ ] 素材库完整功能
- [ ] 草稿实验室
- [ ] 反 AI 腔检测
- [ ] 进度页可视化
- [ ] 设置页

## 设计文档

- [产品需求文档 PRD](./writefit_prd.md) —— 产品要做成什么样
- [产品设计与开发文档](./writefit_product_design.md) —— 产品具体怎么建

## 产品原则

1. **用户必须先写** —— AI 不允许在用户没有输入原始稿前直接生成完整内容
2. **每次只练一个动作** —— 写作训练拆分为具体可训练的小动作
3. **反馈必须具体** —— AI 反馈必须引用用户原文，指出具体问题
4. **修改比生成重要** —— 核心价值来自 revision，记录修改过程和进步轨迹
5. **长期积累形成资产** —— 每天的句子、标题、观察都进入个人写作数据库
