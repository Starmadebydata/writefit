# WriteFit 产品设计与开发文档

版本：v1.0  
用途：提交给 AI Coding Agent 进行产品开发  
推荐技术栈：Next.js + Supabase + PostgreSQL + Prisma + OpenAI API + Tailwind CSS + shadcn/ui

---

## 1. 产品结构总览

WriteFit 是一个 AI Native 写作训练 Web 应用。第一版围绕一个核心闭环开发：

今日训练 → 用户原始写作 → AI 诊断 → 用户手动修改 → 版本对比 → 保存素材 → 训练完成 → 进度记录

所有页面、数据模型和 AI Prompt 都围绕这个闭环服务。

---

## 2. 信息架构

```text
/
  Landing Page

/auth
  /login
  /signup

/onboarding
  写作目标设置
  主题偏好设置
  写作问题设置
  每日训练时长设置

/dashboard
  今日训练入口
  本周进度
  最近素材
  最近草稿

/practice
  /today
  /[sessionId]

/sentence-gym
  句子训练

/drafts
  草稿列表
  /new
  /[draftId]

/ideas
  素材库

/progress
  写作进度

/settings
  用户设置
  写作偏好
  禁用词
  账号设置
```

---

## 3. 页面设计

## 3.1 Landing Page

### 目标

解释产品价值，引导用户开始训练。

### Hero 文案

```text
WriteFit

Train your writing muscles in 15 minutes a day.

WriteFit is an AI writing coach that helps you practice, revise, and develop your own voice instead of outsourcing your thinking to AI.
```

### 中文版本

```text
每天 15 分钟，重新训练你的写作肌肉。

WriteFit 是一个 AI 写作教练。它不会直接替你写文章，而是帮助你练习、修改、积累，慢慢找回自己的表达能力。
```

### 页面模块

1. Hero
2. 问题陈述
3. 产品机制
4. 核心功能
5. 用户场景
6. 价格入口
7. CTA

### CTA

Start Training

---

## 3.2 Onboarding

### 页面路径

`/onboarding`

### 步骤

#### Step 1：选择写作目标

多选：

- Recover writing ability
- Reduce AI-like writing
- Write better blog posts
- Write newsletters
- Write product essays
- Improve English writing
- Build a personal writing habit
- Build a personal brand

#### Step 2：选择主题

多选：

- AI
- Product
- Indie hacking
- SEO
- Technology
- Business
- Personal growth
- Culture
- Books and films
- Other

#### Step 3：选择当前问题

多选：

- I struggle to start
- My writing is too generic
- My structure is weak
- My sentences feel stiff
- I sound too much like AI
- I cannot write consistently
- I do not know how to revise

#### Step 4：选择训练时长

单选：

- 10 minutes
- 15 minutes
- 30 minutes

### 保存结果

写入 `profiles` 表和 `writing_goals` 表。

---

## 3.3 Dashboard

### 页面路径

`/dashboard`

### 布局

顶部：欢迎语 + 今日状态  
中部：今日训练卡片  
右侧：连续天数、本周字数、训练次数  
下方：最近素材、最近草稿

### 组件

#### TodayPracticeCard

字段：

- practice_type
- prompt
- estimated_minutes
- status
- CTA

状态：

- not_started
- in_progress
- completed

#### ProgressSummary

字段：

- current_streak
- weekly_sessions
- weekly_word_count
- saved_ideas_count

#### RecentIdeas

展示最近 5 条素材。

#### RecentDrafts

展示最近 5 个草稿。

---

## 3.4 Daily Practice

### 页面路径

`/practice/today`

### 页面阶段

#### Stage 1：任务说明

展示今日训练类型、题目、规则。

示例：

```text
Today's Practice: Free Writing

Write for 10 minutes without editing. Do not ask AI for help before you finish your first draft.
```

按钮：Start Writing

#### Stage 2：计时写作

组件：

- Timer
- Editor
- Word count
- Save draft status
- Submit button

限制：

- 写作未达到最低字数时不能提交。
- 提交前不能使用 AI。

#### Stage 3：AI 诊断

显示：

- Top 3 Issues
- Best Sentence
- Most AI-like Sentence
- Next Revision Goal

#### Stage 4：用户修改

显示左右双栏：

左侧：Original Draft  
右侧：Revision Editor

用户手动修改后点击 Save Revision。

#### Stage 5：版本对比与保存素材

显示：

- Diff view
- Save best sentence
- Save claim
- Save title idea
- Complete Practice

---

## 3.5 Sentence Gym

### 页面路径

`/sentence-gym`

### 功能

用户输入一句话或选择历史句子，进行专项训练。

### 训练模式

- Cut clutter
- Make it specific
- Split long sentence
- Strengthen the claim
- Remove AI-like tone

### 页面结构

左侧：输入句子  
右侧：AI 分析  
底部：用户修改区

### AI 输出

```json
{
  "empty_words": [],
  "delete_candidates": [],
  "missing_specifics": [],
  "revision_task": "",
  "example_direction": ""
}
```

---

## 3.6 Draft Lab

### 页面路径

`/drafts`

### 草稿列表字段

- title
- topic
- status
- updated_at
- word_count
- ai_like_score

### 草稿详情路径

`/drafts/[draftId]`

### 草稿详情布局

顶部：标题、状态、保存状态  
左侧：编辑器  
右侧：AI 面板  
底部：版本历史

### AI 面板功能

1. Diagnose Draft
2. Detect AI-like Writing
3. Check Structure
4. Suggest Revision Tasks
5. Pre-publish Checklist

### 草稿状态

- idea
- outline
- drafting
- revising
- ready
- published

### 导出

支持 Markdown 导出。

---

## 3.7 Idea Bank

### 页面路径

`/ideas`

### 页面功能

1. 素材列表
2. 标签过滤
3. 搜索
4. 类型过滤
5. 收藏
6. 新建素材
7. 编辑素材
8. 删除素材

### 素材类型

- observation
- sentence
- title
- claim
- example
- quote
- structure

### 列表字段

- content preview
- type
- tags
- source
- created_at
- favorite

---

## 3.8 Progress

### 页面路径

`/progress`

### MVP 组件

1. CurrentStreak
2. PracticeCalendar
3. WeeklyStats
4. WritingStats
5. ProblemStats

### 指标

- total_sessions
- current_streak
- longest_streak
- total_word_count
- total_revisions
- total_ideas
- average_ai_like_score
- average_specificity_score

---

## 3.9 Settings

### 页面路径

`/settings`

### 设置项

1. Writing goals
2. Preferred topics
3. Daily practice duration
4. Feedback strictness
5. Banned phrases
6. Language preference
7. Account settings
8. Data export
9. Delete account

---

## 4. 组件设计

## 4.1 核心 UI 组件

```text
components/
  layout/
    AppShell.tsx
    Sidebar.tsx
    TopNav.tsx

  practice/
    TodayPracticeCard.tsx
    PracticeTimer.tsx
    PracticeEditor.tsx
    FeedbackPanel.tsx
    RevisionPanel.tsx
    DiffViewer.tsx
    SaveIdeaButton.tsx

  editor/
    RichTextEditor.tsx
    MarkdownEditor.tsx
    WordCount.tsx
    AutosaveStatus.tsx

  feedback/
    IssueCard.tsx
    ScoreBadge.tsx
    FlaggedSentence.tsx
    RevisionTask.tsx

  ideas/
    IdeaCard.tsx
    IdeaFilters.tsx
    IdeaEditor.tsx

  drafts/
    DraftList.tsx
    DraftEditor.tsx
    DraftVersionHistory.tsx
    DraftAIPanel.tsx

  progress/
    StreakCard.tsx
    PracticeCalendar.tsx
    StatsCard.tsx
```

---

## 5. 数据库设计

推荐使用 PostgreSQL + Prisma。

## 5.1 Prisma Schema 建议

```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  name      String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  profile          Profile?
  writingGoals     WritingGoal[]
  practiceSessions PracticeSession[]
  drafts           Draft[]
  ideas            Idea[]
  feedback         AIFeedback[]
  progressMetrics  ProgressMetric[]
}

model Profile {
  id                    String   @id @default(cuid())
  userId                String   @unique
  user                  User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  dailyPracticeMinutes  Int      @default(10)
  languagePreference    String   @default("en")
  feedbackStrictness    String   @default("medium")
  preferredTopics       String[]
  writingProblems       String[]
  bannedPhrases         String[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}

model WritingGoal {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  goal      String
  createdAt DateTime @default(now())
}

model PracticeSession {
  id              String   @id @default(cuid())
  userId          String
  user            User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  practiceType    String
  prompt          String
  rawText         String
  revisedText     String?
  durationSeconds Int?
  wordCount       Int      @default(0)
  status          String   @default("in_progress")
  completedAt     DateTime?
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt

  feedback        AIFeedback[]
  ideas           Idea[]
}

model Draft {
  id               String   @id @default(cuid())
  userId           String
  user             User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  title            String
  topic            String?
  status           String   @default("drafting")
  currentVersionId String?
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt

  versions         DraftVersion[]
  feedback         AIFeedback[]
}

model DraftVersion {
  id            String   @id @default(cuid())
  draftId       String
  draft         Draft    @relation(fields: [draftId], references: [id], onDelete: Cascade)
  content       String
  versionNumber Int
  changeSummary String?
  wordCount     Int      @default(0)
  createdAt     DateTime @default(now())
}

model AIFeedback {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  targetType        String
  targetId          String
  practiceSessionId String?
  practiceSession   PracticeSession? @relation(fields: [practiceSessionId], references: [id], onDelete: Cascade)
  draftId           String?
  draft             Draft? @relation(fields: [draftId], references: [id], onDelete: Cascade)

  clarityScore      Int?
  specificityScore  Int?
  voiceScore        Int?
  aiLikeScore       Int?
  feedbackJson      Json
  createdAt         DateTime @default(now())
}

model Idea {
  id                String   @id @default(cuid())
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  practiceSessionId String?
  practiceSession   PracticeSession? @relation(fields: [practiceSessionId], references: [id], onDelete: SetNull)
  type              String
  content           String
  tags              String[]
  isFavorite        Boolean  @default(false)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model ProgressMetric {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  date      DateTime
  metricKey String
  value     Int
  createdAt DateTime @default(now())
}
```

---

## 6. API 路由设计

## 6.1 Auth

使用 Supabase Auth。应用层通过 middleware 保护私有路由。

---

## 6.2 Profile API

```text
GET    /api/profile
POST   /api/profile
PATCH  /api/profile
```

---

## 6.3 Practice API

```text
GET    /api/practice/today
POST   /api/practice/start
GET    /api/practice/:id
PATCH  /api/practice/:id
POST   /api/practice/:id/complete
```

### POST /api/practice/start

请求：

```json
{
  "practiceType": "free_writing"
}
```

响应：

```json
{
  "id": "session_id",
  "practiceType": "free_writing",
  "prompt": "Today’s writing prompt",
  "status": "in_progress"
}
```

---

## 6.4 AI API

```text
POST /api/ai/diagnose
POST /api/ai/anti-ai-voice
POST /api/ai/sentence-surgery
POST /api/ai/draft-check
POST /api/ai/compare-revision
```

### POST /api/ai/diagnose

请求：

```json
{
  "sessionId": "session_id",
  "text": "user raw text",
  "language": "zh"
}
```

响应：

```json
{
  "top_issues": [],
  "best_sentence": "",
  "most_ai_like_sentence": "",
  "next_revision_goal": "",
  "scores": {
    "clarity": 0,
    "specificity": 0,
    "voice": 0,
    "ai_like": 0
  }
}
```

---

## 6.5 Ideas API

```text
GET    /api/ideas
POST   /api/ideas
GET    /api/ideas/:id
PATCH  /api/ideas/:id
DELETE /api/ideas/:id
```

---

## 6.6 Drafts API

```text
GET    /api/drafts
POST   /api/drafts
GET    /api/drafts/:id
PATCH  /api/drafts/:id
DELETE /api/drafts/:id
POST   /api/drafts/:id/versions
GET    /api/drafts/:id/versions
POST   /api/drafts/:id/export
```

---

## 6.7 Progress API

```text
GET /api/progress/summary
GET /api/progress/calendar
GET /api/progress/stats
```

---

## 7. AI Prompt 设计

## 7.1 总系统规则

```text
You are WriteFit, an AI writing coach.

Your job is to improve the user's writing ability, not to replace the user's writing.

Rules:
1. Do not write the full draft for the user unless explicitly asked inside Draft Lab.
2. Focus on diagnosis, revision tasks, and skill training.
3. Always quote specific text from the user's writing when giving feedback.
4. Avoid generic praise.
5. Give no more than 3 major issues at a time.
6. Prefer concrete revision tasks over abstract advice.
7. Detect generic, AI-like, over-polished, vague, or empty writing.
8. Help the user build their own voice.
```

---

## 7.2 Diagnose Practice Prompt

```text
You are a strict writing coach.

Analyze the user's text. Do not rewrite the full text.

Evaluate:
1. Clarity
2. Specificity
3. Personal voice
4. Strength of claim
5. AI-like tone
6. Empty phrases
7. Reader resistance

Return JSON only:

{
  "top_issues": [
    {
      "issue": "",
      "evidence": "quote from user's text",
      "why_it_matters": "",
      "revision_task": ""
    }
  ],
  "best_sentence": "",
  "most_ai_like_sentence": "",
  "next_revision_goal": "",
  "scores": {
    "clarity": 0,
    "specificity": 0,
    "voice": 0,
    "ai_like": 0
  }
}

Constraints:
- Return exactly 3 top issues unless the text is too short.
- The evidence field must quote the user's text.
- Do not flatter the user.
- Do not rewrite the full passage.
```

---

## 7.3 Anti AI Voice Prompt

```text
You are an anti-AI-writing editor.

Detect generic, template-like, over-smoothed, vague, or AI-like writing.

Look for:
1. Big claims without evidence
2. Sentences without a clear human subject
3. Symmetrical cliché structures
4. Generic transition phrases
5. Abstract noun stacks
6. Conclusions without personal experience
7. Smooth but empty paragraphs
8. Overused AI phrasing

Return JSON only:

{
  "ai_like_score": 0,
  "flagged_sentences": [
    {
      "sentence": "",
      "problem_type": "",
      "reason": "",
      "manual_revision_instruction": ""
    }
  ],
  "banned_phrases_found": [],
  "one_revision_priority": ""
}

Do not rewrite the full text.
```

---

## 7.4 Sentence Surgery Prompt

```text
You are a sentence-level writing coach.

Analyze the user's sentence or paragraph.
Do not provide a polished final version unless requested.

Return JSON only:

{
  "empty_words": [],
  "delete_candidates": [],
  "abstract_words": [],
  "missing_specifics": [],
  "rhythm_problem": "",
  "revision_task": "",
  "example_direction": ""
}
```

---

## 7.5 Compare Revision Prompt

```text
You are a revision coach.

Compare the user's original text and revised text.
Judge whether the revision improved the writing.

Return JSON only:

{
  "improved": true,
  "summary": "",
  "what_improved": [],
  "what_got_worse": [],
  "specificity_change": "",
  "voice_change": "",
  "ai_like_change": "",
  "next_revision_task": ""
}
```

---

## 8. Scoring 设计

## 8.1 分数范围

所有评分使用 0 到 100。

### clarity_score

文本是否清楚，读者是否能快速理解。

### specificity_score

是否有具体场景、动作、例子、细节。

### voice_score

是否有个人判断、个人经验和独特表达。

### ai_like_score

是否像 AI 生成，分数越高越像 AI。

---

## 8.2 评分解释

```text
0-20: Very weak
21-40: Weak
41-60: Average
61-80: Strong
81-100: Excellent
```

ai_like_score 反向解释：

```text
0-20: Human and specific
21-40: Slightly generic
41-60: Noticeably polished or generic
61-80: Strong AI-like tone
81-100: Very AI-like
```

---

## 9. 训练任务生成

## 9.1 Practice Types

```ts
export const PRACTICE_TYPES = [
  'free_writing',
  'sentence_surgery',
  'specificity_drill',
  'anti_ai_voice',
  'title_drill',
  'opening_drill'
] as const
```

## 9.2 今日任务选择逻辑

MVP 可以使用简单轮换：

周一：free_writing  
周二：sentence_surgery  
周三：specificity_drill  
周四：anti_ai_voice  
周五：title_drill  
周六：free_writing  
周日：weekly_reflection

后续可根据用户弱点动态分配。

---

## 10. 开发目录建议

```text
writefit/
  app/
    page.tsx
    auth/
    onboarding/
    dashboard/
    practice/
    sentence-gym/
    drafts/
    ideas/
    progress/
    settings/
    api/
      ai/
      practice/
      drafts/
      ideas/
      progress/
      profile/

  components/
    layout/
    practice/
    editor/
    feedback/
    ideas/
    drafts/
    progress/
    ui/

  lib/
    ai/
      client.ts
      prompts.ts
      schemas.ts
      scoring.ts
    db/
      prisma.ts
    auth/
      server.ts
      client.ts
    practice/
      prompts.ts
      scheduler.ts
    utils/

  prisma/
    schema.prisma
    migrations/

  public/
  styles/
```

---

## 11. 前端状态管理

MVP 可使用：

- React Server Components 获取初始数据
- useState 管理局部编辑状态
- TanStack Query 管理客户端请求
- Zustand 可选，用于编辑器状态

不建议第一版引入复杂全局状态。

---

## 12. 编辑器选择

推荐：TipTap。

原因：

1. 支持富文本
2. 可扩展 highlight
3. 可做评论和标注
4. 支持 Markdown 转换
5. 适合后续做句子级反馈

MVP 可先用 textarea 或轻量 Markdown editor，降低开发难度。

建议开发策略：

第一版用 textarea + Markdown。  
第二版替换为 TipTap。

---

## 13. 核心交互细节

## 13.1 写作中禁用 AI

在 Free Writing 阶段，AI 按钮不显示。用户必须完成原始稿后，才能请求 AI 反馈。

## 13.2 AI 反馈只显示 3 个问题

不要把所有问题都列出来。反馈过多会降低行动概率。

## 13.3 用户修改必须手动输入

AI 只给 revision task，不直接把文本替换掉。

## 13.4 保存素材要低摩擦

AI 诊断结果里的 best_sentence、claim、title idea 旁边都有 Save 按钮。

## 13.5 训练完成要有即时反馈

完成页显示：

- 今日字数
- 修改次数
- 保存素材数
- 今日最好的句子
- 明天建议训练方向

---

## 14. 视觉设计方向

### 风格

清爽、克制、专注、带训练感。

### 色彩

主色：深蓝或墨绿色  
辅助色：浅灰、米白  
强调色：琥珀色或绿色

### UI 感觉

接近：

- Linear 的清晰
- Grammarly 的文字工具感
- Duolingo 的连续训练感
- Notion 的内容管理感

### 避免

1. 过度游戏化
2. 复杂仪表盘
3. 炫技动画
4. AI 聊天机器人感

---

## 15. Landing Page SEO 结构

## 15.1 Title

```text
WriteFit | AI Writing Coach for Daily Writing Practice
```

## 15.2 Meta Description

```text
WriteFit is an AI writing coach that helps you practice, revise, and build your own writing voice in 15 minutes a day.
```

## 15.3 H1

```text
Train your writing muscles in 15 minutes a day
```

## 15.4 H2 模块

1. Stop outsourcing your voice to AI
2. Practice one writing skill at a time
3. Get specific feedback, not generic advice
4. Turn daily fragments into weekly essays
5. Build your personal writing database

---

## 16. 测试用例

## 16.1 Onboarding

1. 用户可以选择多个写作目标。
2. 用户可以选择每日训练时长。
3. 提交后创建 profile。
4. 完成后跳转 Dashboard。

## 16.2 Daily Practice

1. 用户可以开始今日训练。
2. 计时器正常运行。
3. 低于最低字数不能提交。
4. 提交后生成 AI 反馈。
5. AI 反馈被保存到数据库。
6. 用户可以修改文本。
7. 原稿和修改稿都被保存。
8. 完成后 session 状态变为 completed。

## 16.3 Idea Bank

1. 用户可以保存句子到素材库。
2. 用户可以按标签过滤。
3. 用户可以搜索素材。
4. 用户只能看到自己的素材。

## 16.4 Draft Lab

1. 用户可以创建草稿。
2. 用户可以保存草稿版本。
3. 用户可以运行 AI 诊断。
4. 用户可以导出 Markdown。

## 16.5 Security

1. 未登录用户不能访问 dashboard。
2. 用户不能访问其他用户的 session。
3. 用户不能访问其他用户的 draft。
4. API 必须校验 userId。

---

## 17. 开发里程碑

## Week 1：项目基础

任务：

1. 初始化 Next.js 项目
2. 配置 Tailwind CSS 和 shadcn/ui
3. 配置 Supabase Auth
4. 配置 Prisma 和 PostgreSQL
5. 建立基础 layout
6. 实现 Landing Page
7. 实现登录注册
8. 实现 Onboarding

交付：

用户可以注册、登录并完成写作偏好设置。

---

## Week 2：训练闭环

任务：

1. 实现 Dashboard
2. 实现今日训练生成
3. 实现 Practice Session 创建
4. 实现计时写作页面
5. 实现原稿保存
6. 接入 OpenAI API
7. 实现 AI 诊断
8. 保存 feedback

交付：

用户可以完成第一次自由写作并获得 AI 诊断。

---

## Week 3：修改与素材库

任务：

1. 实现用户修改界面
2. 实现 diff viewer
3. 实现 compare revision API
4. 实现保存素材
5. 实现 Idea Bank 列表
6. 实现素材搜索和标签
7. 实现训练完成页

交付：

用户可以完成完整训练闭环，并保存素材。

---

## Week 4：Draft Lab 与反 AI 腔

任务：

1. 实现 Draft 列表
2. 实现 Draft 编辑器
3. 实现 Draft 版本保存
4. 实现 Anti AI Voice API
5. 实现 flagged sentences UI
6. 实现 Markdown 导出

交付：

用户可以管理草稿并检测 AI 腔。

---

## Week 5：Progress 与打磨

任务：

1. 实现训练日历
2. 实现连续天数
3. 实现基础统计
4. 实现 Settings
5. 实现 banned phrases 自定义
6. 错误处理
7. Loading 状态
8. 空状态优化

交付：

MVP 可进行真实用户测试。

---

## Week 6：上线准备

任务：

1. 完成 SEO metadata
2. 配置 Sentry
3. 配置 PostHog 或 Plausible
4. 配置基础邮件
5. 部署 Vercel
6. 准备演示数据
7. 修复核心 bug
8. 准备 Product Hunt / Beta 发布页面

交付：

MVP 可公开上线。

---

## 18. 环境变量

```env
DATABASE_URL=""
NEXT_PUBLIC_SUPABASE_URL=""
NEXT_PUBLIC_SUPABASE_ANON_KEY=""
SUPABASE_SERVICE_ROLE_KEY=""
OPENAI_API_KEY=""
ANTHROPIC_API_KEY=""
NEXT_PUBLIC_APP_URL=""
POSTHOG_KEY=""
SENTRY_DSN=""
```

---

## 19. 推荐初始实践题库

```ts
export const FREE_WRITING_PROMPTS = [
  "What was one moment today when your thinking felt clearer than your writing?",
  "Describe one product detail that annoyed you recently.",
  "What is one belief about AI that you are starting to doubt?",
  "What is one mistake indie developers repeatedly make?",
  "When did your writing start to sound too generic?",
  "Describe one moment when AI helped you move faster but think less.",
  "What is one topic you keep avoiding because it feels hard to write?",
  "What is one sentence you wish you could write more honestly?"
]
```

中文题库：

```ts
export const FREE_WRITING_PROMPTS_ZH = [
  "今天有没有一个时刻，你脑子里很清楚，但写出来很模糊？",
  "最近一个让你不舒服的产品细节是什么？",
  "你现在开始怀疑的一个 AI 行业共识是什么？",
  "独立开发者最容易重复犯的一个错误是什么？",
  "你什么时候意识到自己的文字开始变得像 AI？",
  "描述一次 AI 让你更快，但也让你想得更少的经历。",
  "你一直回避写哪个主题？为什么？",
  "你最近最想写诚实的一句话是什么？"
]
```

---

## 20. MVP 验收清单

```text
[ ] 用户可以注册登录
[ ] 用户可以完成 onboarding
[ ] 用户可以进入 dashboard
[ ] 系统可以生成今日训练
[ ] 用户可以开始计时写作
[ ] 用户提交前不能调用 AI
[ ] 用户可以提交原始稿
[ ] AI 可以返回结构化诊断
[ ] 诊断结果可以保存
[ ] 用户可以手动修改文本
[ ] 系统可以保存修改稿
[ ] 系统可以展示版本差异
[ ] 用户可以保存句子到素材库
[ ] 用户可以查看素材库
[ ] 用户可以创建草稿
[ ] 用户可以保存草稿版本
[ ] 用户可以运行反 AI 腔检测
[ ] 用户可以查看训练日历
[ ] 用户数据隔离正常
[ ] 所有私有路由需要登录
[ ] 核心 API 有错误处理
[ ] 项目可以部署到 Vercel
```

---

## 21. 第一版开发指令摘要

给 AI Coding Agent 的最短任务描述：

```text
Build an MVP web app called WriteFit.

WriteFit is an AI-native writing training app. Users must write first, then receive AI feedback, then revise manually. The core loop is: daily writing practice, AI diagnosis, manual revision, revision diff, save ideas, track progress.

Use Next.js, TypeScript, Tailwind CSS, shadcn/ui, Supabase Auth, PostgreSQL, Prisma, and OpenAI API.

Implement:
1. Auth
2. Onboarding
3. Dashboard
4. Daily Practice
5. AI diagnosis API
6. Manual revision and diff
7. Idea Bank
8. Draft Lab
9. Anti AI Voice Detector
10. Progress page

Do not build community features, browser extension, mobile app, or complex payment system in MVP.
```

