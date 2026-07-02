# WriteFit 项目交接文档

> 用于在新对话中接续工作。复制本文档内容粘贴给新的 AI 对话即可。

---

## 项目概况

- **项目名称**：WriteFit — AI 写作训练应用
- **产品定位**：每天 15 分钟，训练用户自己的写作能力（不是 AI 代写工具）
- **技术栈**：Next.js 16 + Cloudflare Workers + D1 (SQLite) + Drizzle ORM + NextAuth.js + Tailwind + shadcn/ui + next-intl
- **部署地址**：https://writefit.app
- **代码仓库**：https://github.com/StarmadeBydata/writefit
- **本地路径**：/Users/guojian/project/writefit
- **设计文档**：`writefit_prd.md`（产品需求）、`writefit_product_design.md`（产品设计）

---

## 技术架构要点

- **数据库**：Cloudflare D1（SQLite 兼容），不是 PostgreSQL。SQL 语法必须用 SQLite 方式（`cast(x as integer)` 而非 `x::int`，`date(x/1000, 'unixepoch')` 而非 `date(x)`）
- **ORM**：Drizzle ORM（不是 Prisma），schema 在 `lib/db/schema.ts`
- **认证**：NextAuth.js v5，Adapter 用 Drizzle，支持 Google 登录 + 邮箱密码注册（已移除 GitHub 登录）
- **i18n**：next-intl，英文默认无前缀，中文 `/zh` 前缀。翻译文件在 `messages/en.json` 和 `messages/zh.json`
- **AI 服务**：用户自带 API Key（支持 10 个供应商：DeepSeek/Z.ai/Kimi Code/Moonshot/OpenAI/Groq/SiliconFlow/Qwen/Ollama/自定义），存储在 D1 的 `ai_settings` 表
- **部署命令**：`npx opennextjs-cloudflare build && npx wrangler deploy --keep-vars`
- **构建注意**：不能用 `next build` 直接部署，必须用 opennextjs-cloudflare

---

## MVP 功能完成状态

### P0 核心功能（必须完成）

| 功能 | 状态 | 说明 |
|------|------|------|
| 用户注册与登录 | ✅ 已完成 | Google + 邮箱密码，NextAuth.js |
| Onboarding 写作画像设置 | ✅ 已完成 | 4 步引导：写作目标(多选)→主题(多选)→问题(多选)→训练时长(单选)，保存到 profiles + writing_goals 表，新用户注册后自动跳转 onboarding |
| Dashboard 今日训练入口 | ✅ 已完成 | 显示今日训练卡片、真实统计数据（连续天数/本周训练/字数/素材数） |
| 今日训练 5 阶段流程 | ✅ 已完成 | 题目→计时写作→AI诊断→手动修改→版本对比，PracticeFlow 组件 |
| AI 诊断反馈 | ✅ 已完成 | /api/ai/diagnose，结构化输出 3 个问题 + 最好句子 + 修改目标 |
| 用户手动修改 | ✅ 已完成 | 左右双栏对比修改 |
| 版本对比 Diff | ✅ 已完成 | DiffViewer 组件展示修改差异 |
| 训练记录保存到数据库 | ✅ 已完成 | /api/practice/sessions，自动保存原稿/修改稿/字数/时长/AI反馈 |
| 保存好句到素材库 | ✅ 已完成 | SaveIdeaButton 组件，/api/ideas |
| 训练完成状态 | ✅ 已完成 | 训练完成后自动写入 practice_sessions 表 |

### P1 重要功能

| 功能 | 状态 | 说明 |
|------|------|------|
| Draft Lab 草稿管理 | ✅ 已完成 | 完整草稿管理：列表/新建/编辑/版本保存/AI诊断/反AI腔检测/Markdown导出，6种状态 |
| Anti AI Voice Detector | ⚠️ API 已有 | /api/ai/anti-ai-voice 路由已实现，但没有前端页面入口（Sentence Gym 占位） |
| Idea Bank 素材库 | ✅ 已完成 | 完整 CRUD：列表/类型过滤/搜索/收藏/新建/编辑/删除，API 连接 D1 数据库 |
| Sentence Gym 句子训练 | ✅ 已完成 | 输入句子→AI 分析（空泛词/抽象词/节奏等）→用户手动修改→可保存到素材库 |
| Progress 进度页 | ✅ 已完成 | 统计卡片 + 训练日历热力图（12周）+ 字数趋势图（30天）+ 训练类型分布 + 训练历史列表 |
| Markdown 导出 | ✅ 已完成 | Draft Lab 中可导出草稿为 .md 文件 |
| Settings 写作画像编辑 | ✅ 已完成 | 写作目标/主题/问题/训练时长编辑 + 禁用词管理，/api/profile GET/PUT |
| 数据导出 | ✅ 已完成 | 导出用户所有数据为 JSON，/api/export |
| 删除账号 | ✅ 已完成 | 输入 DELETE 确认后永久删除账号和所有数据，/api/profile DELETE |

### P2 后续功能（MVP 暂不实现）

| 功能 | 状态 |
|------|------|
| Weekly Essay 周末成文 | ❌ |
| 月度报告 | ❌ |
| Stripe 订阅 | ❌ |
| 邮件提醒 | ❌ |

---

## 已完成的工作（按时间顺序）

1. **项目初始化**：Next.js 项目搭建、D1 数据库配置、Drizzle schema 设计
2. **认证系统**：NextAuth.js + Google + 邮箱密码注册
3. **SEO 基础**：metadata、sitemap、robots
4. **AI 设置功能**：用户自带 API Key，10 个供应商自动补全
5. **核心训练流程**：PracticeFlow 5 阶段完整闭环
6. **AI 诊断 + 对比**：/api/ai/diagnose、/api/ai/compare-revision、/api/ai/anti-ai-voice
7. **全站 i18n**：next-intl 中英双语，所有页面翻译完成
8. **训练记录持久化**：/api/practice/sessions，自动保存训练数据到数据库
9. **Dashboard 真实统计**：从数据库读取连续天数、本周训练、字数、素材数
10. **Progress 页面**：训练历史列表 + 统计卡片
11. **Bug 修复**：NextAuth 与 next-intl 中间件冲突、Base UI 组件嵌套错误、SQLite 语法错误
12. **Onboarding 页面**：4 步写作画像引导（目标→主题→问题→时长），保存到 profiles + writing_goals 表，新用户注册后自动跳转
13. **Idea Bank 素材库**：完整 CRUD 页面，支持类型过滤、搜索、收藏、新建、编辑、删除，API 连接 D1 数据库
14. **Sentence Gym 句子训练**：输入句子→AI 分析（空泛词/抽象词/节奏等）→用户手动修改→可保存到素材库
15. **Draft Lab 草稿实验室**：草稿列表/新建/编辑/版本保存/AI诊断/反AI腔检测/Markdown导出，6种状态管理
16. **Progress 页面增强**：训练日历热力图（12周）、字数趋势图（30天柱状图）、训练类型分布（条形图），纯 CSS/SVG 实现
17. **Settings 写作画像编辑**：在设置页编辑写作目标/主题/问题/训练时长 + 禁用词管理（添加/删除）
18. **数据导出**：导出用户所有数据（画像/目标/训练/草稿/版本/素材/反馈）为 JSON 文件
19. **删除账号**：输入 DELETE 确认后永久删除账号和所有关联数据，自动登出

---

## 待完成的工作（按优先级）

### 优先级 1：Onboarding 页面实现 ✅ 已完成
- 路径：`app/[locale]/onboarding/page.tsx`
- 已实现 4 步引导：写作目标(多选) → 主题(多选) → 问题(多选) → 训练时长(单选)
- 数据写入 `profiles` 表和 `writing_goals` 表
- 完成后跳转到 Dashboard
- API：`/api/onboarding`（GET 查询状态 / POST 保存画像）
- 组件：`components/onboarding/OnboardingFlow.tsx`
- 新用户注册后自动跳转 onboarding（RegisterForm 已更新）
- 已有画像的用户访问 onboarding 会自动跳到 Dashboard

### 优先级 2：Idea Bank 素材库页面 ✅ 已完成
- 路径：`app/[locale]/ideas/page.tsx`
- API：`/api/ideas`（GET 列表+过滤+搜索 / POST 新建）、`/api/ideas/[id]`（PATCH 编辑/收藏 / DELETE 删除）
- 组件：`components/ideas/IdeaBank.tsx`
- 功能：素材列表、7 种类型过滤、关键词搜索（debounce）、只看收藏、新建、编辑、删除、收藏切换
- 全部连接 D1 数据库，支持中英双语

### 优先级 3：Sentence Gym 句子训练页面 ✅ 已完成
- 路径：`app/[locale]/sentence-gym/page.tsx`
- API：`/api/ai/sentence-surgery`（POST 分析句子，复用 getSentenceSurgeryPrompt）
- 组件：`components/sentence-gym/SentenceGym.tsx`
- 功能：输入句子 → AI 分析（空泛词/可删除部分/抽象词/缺少细节/节奏问题/修改任务/修改方向）→ 用户手动修改 → 可保存到素材库
- 无 AI 配置时返回模拟反馈，支持中英双语

### 优先级 4：Draft Lab 草稿实验室 ✅ 已完成
- 路径：`app/[locale]/drafts/page.tsx`
- API：`/api/drafts`（GET 列表+搜索 / POST 新建）、`/api/drafts/[id]`（GET 详情+版本+导出 / PATCH 编辑+自动版本 / DELETE 删除）
- 组件：`components/drafts/DraftLab.tsx`
- 功能：草稿列表、搜索、新建、编辑、自动版本保存、版本历史与恢复、AI 诊断（复用 /api/ai/diagnose）、反 AI 腔检测（复用 /api/ai/anti-ai-voice）、Markdown 导出、6 种状态管理
- 参考 PRD 8.10 节

### 优先级 5：Progress 页面增强 ✅ 已完成
- 路径：`app/[locale]/progress/page.tsx`
- 功能：
  - 训练日历热力图（最近 12 周，4 级颜色，hover 显示当日训练次数）
  - 字数趋势图（最近 30 天每日字数，纯 CSS 柱状图，hover 显示日期和字数）
  - 训练类型分布（各类型占比，纯 CSS 条形图）
  - 保留原有统计卡片和训练历史列表
- 所有可视化用纯 CSS/SVG 实现，不引入额外图表库
- 参考 PRD 8.11 节

### 优先级 6：Settings 页面完善 ✅ 已完成
- 路径：`app/[locale]/settings/page.tsx`
- 新增组件：
  - `components/settings/ProfileSettings.tsx`：写作画像编辑（目标/主题/问题/训练时长多选切换 + 禁用词管理）
  - `components/settings/DataManagement.tsx`：数据导出（下载 JSON）+ 删除账号（输入 DELETE 确认）
- 新增 API：
  - `/api/profile`（GET 获取画像 / PUT 更新画像 / DELETE 删除账号）
  - `/api/export`（GET 导出用户所有数据为 JSON）

---

## 关键文件索引

```
项目配置：
  wrangler.jsonc          — Cloudflare Workers 配置
  package.json            — 依赖和脚本
  drizzle.config.ts       — Drizzle ORM 配置
  middleware.ts           — NextAuth + next-intl 中间件

数据库：
  lib/db/schema.ts        — 所有表定义（users, profiles, practice_sessions, drafts, draft_versions, ai_feedbacks, ideas, ai_settings 等）
  drizzle/migrations/     — SQL 迁移文件

认证：
  lib/auth/auth.ts        — NextAuth 配置（Google + Credentials）
  app/api/auth/           — 认证 API 路由

AI 功能：
  lib/ai/settings.ts      — AI 供应商配置（10 个供应商 + 自动补全）
  lib/ai/prompts.ts       — AI Prompt 模板（中英双语）
  lib/ai/schemas.ts       — AI 返回数据的 TypeScript 类型
  lib/ai/mock.ts          — Mock 数据（无 API Key 时用）
  app/api/ai/diagnose/    — AI 诊断 API
  app/api/ai/anti-ai-voice/ — 反 AI 腔检测 API
  app/api/ai/compare-revision/ — 版本对比 API

训练：
  lib/practice/prompts.ts — 训练题库（6 种训练类型，中英双语）
  lib/practice/scheduler.ts — 每日训练调度
  components/practice/PracticeFlow.tsx — 核心 5 阶段训练组件
  app/api/practice/sessions/ — 训练记录保存 API

Onboarding：
  app/[locale]/onboarding/page.tsx   — Onboarding 页面（4 步引导）
  components/onboarding/OnboardingFlow.tsx — 引导流程客户端组件
  app/api/onboarding/route.ts        — 画像保存 API（GET 状态 / POST 保存）

素材库：
  app/[locale]/ideas/page.tsx        — 素材库页面
  components/ideas/IdeaBank.tsx      — 素材库主组件（列表/过滤/搜索/CRUD）
  app/api/ideas/route.ts             — 素材列表 + 新建 API
  app/api/ideas/[id]/route.ts        — 单条素材编辑/删除/收藏 API

句子训练：
  app/[locale]/sentence-gym/page.tsx — 句子训练页面
  components/sentence-gym/SentenceGym.tsx — 句子训练主组件（输入→分析→修改）
  app/api/ai/sentence-surgery/route.ts — 句子手术 API（复用 getSentenceSurgeryPrompt）

草稿实验室：
  app/[locale]/drafts/page.tsx        — 草稿实验室页面
  components/drafts/DraftLab.tsx      — 草稿实验室主组件（列表+编辑器+版本+AI诊断+导出）
  app/api/drafts/route.ts             — 草稿列表 + 新建 API
  app/api/drafts/[id]/route.ts        — 单条草稿详情/编辑/删除/版本/导出 API

设置（增强）：
  app/[locale]/settings/page.tsx      — 设置页面（AI配置 + 写作画像 + 数据管理）
  components/settings/AISettingsForm.tsx — AI 服务配置表单
  components/settings/ProfileSettings.tsx — 写作画像编辑（目标/主题/问题/时长/禁用词）
  components/settings/DataManagement.tsx — 数据导出 + 删除账号
  app/api/profile/route.ts            — 画像 GET/PUT + 账号 DELETE API
  app/api/export/route.ts             — 数据导出 API（JSON）

i18n：
  i18n/routing.ts         — 路由配置
  i18n/request.ts         — 请求配置
  messages/en.json        — 英文翻译
  messages/zh.json        — 中文翻译
  components/layout/LanguageSwitcher.tsx — 语言切换器

页面：
  app/[locale]/page.tsx              — Landing Page
  app/[locale]/dashboard/page.tsx    — Dashboard（真实数据）
  app/[locale]/practice/today/       — 今日训练
  app/[locale]/practice/dev/         — 开发测试训练（无需登录）
  app/[locale]/progress/page.tsx     — 进度页（✅ 已增强：热力图+趋势图+类型分布）
  app/[locale]/settings/page.tsx     — 设置页（✅ AI配置+写作画像+数据管理）
  app/[locale]/onboarding/page.tsx   — Onboarding（✅ 已实现）
  app/[locale]/sentence-gym/page.tsx — 句子训练（✅ 已实现）
  app/[locale]/drafts/page.tsx       — 草稿实验室（✅ 已实现）
  app/[locale]/ideas/page.tsx        — 素材库（✅ 已实现）
```

---

## 已知问题和注意事项

1. **SQLite 语法**：D1 是 SQLite，写 SQL 时不能用 PostgreSQL 语法。用 `cast(x as integer)` 而非 `x::int`，用 `date(x/1000, 'unixepoch')` 处理时间戳
2. **Date 对象传参**：给 SQL 查询传日期参数时，用 `.getTime()` 转成时间戳数字，不要直接传 Date 对象
3. **React 纯函数规则**：在 Server Component 中不要用 `Date.now()`，用 `new Date()` 代替（lint 会报错）
4. **部署后生效**：代码改完需要 `npx opennextjs-cloudflare build && npx wrangler deploy --keep-vars` 才会生效
5. **环境变量**：`AUTH_SECRET`、`AUTH_GOOGLE_ID`、`AUTH_GOOGLE_SECRET` 需要在 Cloudflare Dashboard 设置，`--keep-vars` 确保部署不覆盖
6. **Base UI 组件**：DropdownMenuLabel 必须包在 DropdownMenuGroup 里，否则会报 "MenuGroupContext is missing" 错误

---

## 当前 Phase 总结

按 PRD 的开发优先级划分：

- **P0 核心闭环**：✅ 已完成（登录→Onboarding→训练→AI诊断→修改→保存→统计）
- **P1 重要功能**：✅ 已完成（Progress、Idea Bank、Sentence Gym、Draft Lab 全部完成，Markdown 导出已完成）
- **P2 后续功能**：❌ 未开始

**总体进度**：MVP 核心闭环已完成约 98%。所有 P0、P1 功能及增强项（优先级 1-6）均已实现，包括 Onboarding、素材库、句子训练、草稿实验室、Progress 增强（热力图/趋势图/类型分布）、Settings 完善（画像编辑/禁用词/数据导出/删除账号）。剩余 P2 后续功能（周末成文、月度报告、Stripe 订阅、邮件提醒）暂不实现。

**下一步建议**：所有 MVP 功能已全部完成，可考虑以下方向：
1. **部署上线**：运行 `npx opennextjs-cloudflare build && npx wrangler deploy --keep-vars` 部署到生产环境
2. **用户测试**：邀请目标用户试用，收集反馈
3. **P2 功能**：根据用户反馈决定优先级（周末成文、月度报告、Stripe 订阅、邮件提醒）
4. **性能优化**：添加加载骨架屏、错误边界、API 缓存等
5. **SEO 优化**：Landing Page 内容优化、sitemap.xml、robots.txt
