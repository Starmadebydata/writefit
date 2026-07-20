// ====================================================================
// WriteFit 数据库表结构定义
// ====================================================================
// 这个文件定义了数据库里所有的"表"（就像 Excel 的表格）
// 每个表存放一类数据，表之间通过 ID 互相关联
//
// 技术说明：
// - 使用 Drizzle ORM 的 SQLite 语法（和 Cloudflare D1 兼容）
// - SQLite 没有专门的 JSON 类型，JSON 数据用 text 存储
// - SQLite 没有专门的 timestamp 类型，时间用 integer（Unix 时间戳）存储
// - ID 使用 text 类型，应用层生成 cuid 或 UUID
// ====================================================================

import { sqliteTable, text, integer, uniqueIndex } from "drizzle-orm/sqlite-core";
import { relations } from "drizzle-orm";

// ------------------------------------------------------------------
// Auth.js 需要的表（用户登录系统用）
// ------------------------------------------------------------------

// 用户表 —— 存储所有注册用户的基本信息
export const users = sqliteTable("users", {
  id: text("id").primaryKey(), // 用户唯一 ID
  name: text("name"), // 用户昵称
  email: text("email").notNull().unique(), // 邮箱（登录用）
  emailVerified: integer("email_verified", { mode: "timestamp" }), // 邮箱验证时间
  image: text("image"), // 头像 URL（来自 GitHub/Google）
  passwordHash: text("password_hash"), // 密码哈希（仅邮箱注册的用户有值，OAuth 用户为 null）
  // ---- 付费订阅（P1 付费墙地基） ----
  plan: text("plan").notNull().default("free"), // 套餐：free / basic / pro
  planExpiresAt: integer("plan_expires_at", { mode: "timestamp" }), // 套餐到期时间（null = 免费用户或永不到期）
  paymentCustomerId: text("payment_customer_id"), // 支付平台客户 ID（PayPal/Creem/Stripe 通用）
  paymentProvider: text("payment_provider"), // 支付平台标识：paypal / creem / stripe
  paymentSubscriptionId: text("payment_subscription_id"), // 支付平台订阅 ID（取消/校对状态用）
  planInterval: text("plan_interval"), // 账单周期：monthly / yearly（null = 免费用户或历史数据）
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 账号表 —— 存储第三方登录信息（GitHub、Google 等）
export const accounts = sqliteTable("accounts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  type: text("type").notNull(), // 账号类型（oauth 等）
  provider: text("provider").notNull(), // 服务商（github、google）
  providerAccountId: text("provider_account_id").notNull(), // 服务商那边的用户 ID
  refresh_token: text("refresh_token"),
  access_token: text("access_token"),
  expires_at: integer("expires_at"),
  token_type: text("token_type"),
  scope: text("scope"),
  id_token: text("id_token"),
  session_state: text("session_state"),
});

// 会话表 —— 存储用户登录会话
export const sessions = sqliteTable("sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  sessionToken: text("session_token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// 验证令牌表 —— 用于邮箱验证等流程
export const verificationTokens = sqliteTable("verification_tokens", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  token: text("token").notNull().unique(),
  expires: integer("expires", { mode: "timestamp" }).notNull(),
});

// ------------------------------------------------------------------
// WriteFit 业务表
// ------------------------------------------------------------------

// 用户画像表 —— 存储用户在 Onboarding 阶段填写的写作偏好
export const profiles = sqliteTable("profiles", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  dailyPracticeMinutes: integer("daily_practice_minutes").notNull().default(10), // 每日训练时长（分钟）
  languagePreference: text("language_preference").notNull().default("zh"), // 语言偏好
  feedbackStrictness: text("feedback_strictness").notNull().default("medium"), // 反馈严格度
  preferredTopics: text("preferred_topics", { mode: "json" }).notNull().default([]), // 偏好主题（JSON 数组）
  writingProblems: text("writing_problems", { mode: "json" }).notNull().default([]), // 写作问题（JSON 数组）
  bannedPhrases: text("banned_phrases", { mode: "json" }).notNull().default([]), // 禁用词列表（JSON 数组）
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 写作目标表 —— 存储用户选择的写作目标（一个用户可以有多个目标）
export const writingGoals = sqliteTable("writing_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  goal: text("goal").notNull(), // 目标内容
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 训练会话表 —— 每次写作训练的完整记录
export const practiceSessions = sqliteTable("practice_sessions", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  practiceType: text("practice_type").notNull(), // 训练类型（free_writing、sentence_surgery 等）
  prompt: text("prompt").notNull(), // 今日题目
  rawText: text("raw_text").notNull(), // 用户原始稿
  revisedText: text("revised_text"), // 用户修改稿
  durationSeconds: integer("duration_seconds"), // 实际写作时长（秒）
  wordCount: integer("word_count").notNull().default(0), // 字数
  status: text("status").notNull().default("in_progress"), // 状态：in_progress / completed
  completedAt: integer("completed_at", { mode: "timestamp" }), // 完成时间
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 草稿表 —— 用户在 Draft Lab 中管理的长文草稿
export const drafts = sqliteTable("drafts", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(), // 草稿标题
  topic: text("topic"), // 主题
  status: text("status").notNull().default("idea"), // 状态：idea / outline / drafting / revising / ready / published
  currentVersionId: text("current_version_id"), // 当前版本 ID
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 草稿版本表 —— 每次保存草稿时生成一个版本，记录修改历史
export const draftVersions = sqliteTable("draft_versions", {
  id: text("id").primaryKey(),
  draftId: text("draft_id")
    .notNull()
    .references(() => drafts.id, { onDelete: "cascade" }),
  content: text("content").notNull(), // 草稿内容
  versionNumber: integer("version_number").notNull(), // 版本号
  changeSummary: text("change_summary"), // 修改说明
  wordCount: integer("word_count").notNull().default(0), // 字数
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// AI 反馈表 —— 存储 AI 对用户写作的所有诊断反馈
export const aiFeedbacks = sqliteTable("ai_feedbacks", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  targetType: text("target_type").notNull(), // 反馈对象类型：practice_session / draft
  targetId: text("target_id").notNull(), // 反馈对象 ID
  practiceSessionId: text("practice_session_id").references(() => practiceSessions.id, {
    onDelete: "cascade",
  }),
  draftId: text("draft_id").references(() => drafts.id, { onDelete: "cascade" }),

  // 评分（0-100）
  clarityScore: integer("clarity_score"), // 清晰度
  specificityScore: integer("specificity_score"), // 具体性
  voiceScore: integer("voice_score"), // 个人声音
  aiLikeScore: integer("ai_like_score"), // AI 腔程度

  // 完整反馈数据（JSON 格式）
  feedbackJson: text("feedback_json", { mode: "json" }).notNull(),
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 素材库表 —— 用户保存的所有可复用写作素材
export const ideas = sqliteTable("ideas", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  practiceSessionId: text("practice_session_id").references(() => practiceSessions.id, {
    onDelete: "set null",
  }),
  type: text("type").notNull(), // 素材类型：observation / sentence / title / claim / example / quote / structure
  content: text("content").notNull(), // 素材内容
  tags: text("tags", { mode: "json" }).notNull().default([]), // 标签（JSON 数组）
  isFavorite: integer("is_favorite", { mode: "boolean" }).notNull().default(false), // 是否收藏
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// 进度指标表 —— 记录用户每日训练进度数据
export const progressMetrics = sqliteTable("progress_metrics", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  date: integer("date", { mode: "timestamp" }).notNull(), // 记录日期
  metricKey: text("metric_key").notNull(), // 指标名称
  value: integer("value").notNull(), // 指标值
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// AI 设置表 —— 存储用户自定义的 AI 服务配置
// 支持 OpenAI 兼容格式：用户可以填 DeepSeek、Moonshot、本地 Ollama 等
export const aiSettings = sqliteTable("ai_settings", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: "cascade" }),
  provider: text("provider").notNull().default("deepseek"), // 服务商标识（deepseek/openai/custom）
  apiBaseUrl: text("api_base_url").notNull().default("https://api.deepseek.com/v1"), // API 地址
  apiKey: text("api_key").notNull(), // API Key（加密存储）
  model: text("model").notNull().default("deepseek-chat"), // 模型名称
  temperature: integer("temperature").notNull().default(30), // 温度（存整数，使用时除以 10，30 = 0.3）
  maxTokens: integer("max_tokens").notNull().default(2000), // 最大输出 token 数
  createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
});

// AI 用量记录表 —— 记录每个用户每天的 AI 调用次数
// 用于平台托管 Key 的按套餐配额控制（BYOK 不计量）
// 唯一索引 (user_id, date, endpoint)，累加用 upsert
export const usageRecords = sqliteTable(
  "usage_records",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    date: text("date").notNull(), // 日期（YYYY-MM-DD，UTC）
    endpoint: text("endpoint").notNull(), // AI 端点名（diagnose / compare-revision / sentence-surgery / anti-ai-voice）
    count: integer("count").notNull().default(0), // 当日累计调用次数
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().$defaultFn(() => new Date()),
  },
  (table) => [uniqueIndex("usage_user_date_endpoint").on(table.userId, table.date, table.endpoint)]
);

// 账单 webhook 事件表 —— 记录已处理的支付平台事件 ID，用于幂等去重
// （PayPal 会重投 webhook；主键冲突 = 重复事件，跳过处理）
export const billingEvents = sqliteTable("billing_events", {
  id: text("id").primaryKey(), // 支付平台事件 ID（PayPal webhook event.id，"WH-..."）
  provider: text("provider").notNull(), // 支付平台标识：paypal / creem / stripe
  eventType: text("event_type").notNull(), // 统一事件类型（subscription.activated 等）
  userId: text("user_id"), // 关联用户（可空：事件可能解析不出用户）
  processedAt: integer("processed_at", { mode: "timestamp" }).notNull(), // 处理时间
});

// ------------------------------------------------------------------
// 表关系定义（告诉数据库表和表之间怎么关联）
// ------------------------------------------------------------------

export const usersRelations = relations(users, ({ many, one }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  profile: one(profiles),
  writingGoals: many(writingGoals),
  practiceSessions: many(practiceSessions),
  drafts: many(drafts),
  ideas: many(ideas),
  aiFeedbacks: many(aiFeedbacks),
  progressMetrics: many(progressMetrics),
  aiSetting: one(aiSettings),
  usageRecords: many(usageRecords),
}));

export const profilesRelations = relations(profiles, ({ one }) => ({
  user: one(users, { fields: [profiles.userId], references: [users.id] }),
}));

export const writingGoalsRelations = relations(writingGoals, ({ one }) => ({
  user: one(users, { fields: [writingGoals.userId], references: [users.id] }),
}));

export const practiceSessionsRelations = relations(practiceSessions, ({ one, many }) => ({
  user: one(users, { fields: [practiceSessions.userId], references: [users.id] }),
  feedback: many(aiFeedbacks),
  ideas: many(ideas),
}));

export const draftsRelations = relations(drafts, ({ one, many }) => ({
  user: one(users, { fields: [drafts.userId], references: [users.id] }),
  versions: many(draftVersions),
  feedback: many(aiFeedbacks),
}));

export const draftVersionsRelations = relations(draftVersions, ({ one }) => ({
  draft: one(drafts, { fields: [draftVersions.draftId], references: [drafts.id] }),
}));

export const aiFeedbacksRelations = relations(aiFeedbacks, ({ one }) => ({
  user: one(users, { fields: [aiFeedbacks.userId], references: [users.id] }),
  practiceSession: one(practiceSessions, {
    fields: [aiFeedbacks.practiceSessionId],
    references: [practiceSessions.id],
  }),
  draft: one(drafts, { fields: [aiFeedbacks.draftId], references: [drafts.id] }),
}));

export const ideasRelations = relations(ideas, ({ one }) => ({
  user: one(users, { fields: [ideas.userId], references: [users.id] }),
  practiceSession: one(practiceSessions, {
    fields: [ideas.practiceSessionId],
    references: [practiceSessions.id],
  }),
}));

export const progressMetricsRelations = relations(progressMetrics, ({ one }) => ({
  user: one(users, { fields: [progressMetrics.userId], references: [users.id] }),
}));

export const aiSettingsRelations = relations(aiSettings, ({ one }) => ({
  user: one(users, { fields: [aiSettings.userId], references: [users.id] }),
}));

export const usageRecordsRelations = relations(usageRecords, ({ one }) => ({
  user: one(users, { fields: [usageRecords.userId], references: [users.id] }),
}));

// ------------------------------------------------------------------
// 类型导出（供其他文件使用）
// ------------------------------------------------------------------
export type User = typeof users.$inferSelect;
export type Profile = typeof profiles.$inferSelect;
export type WritingGoal = typeof writingGoals.$inferSelect;
export type PracticeSession = typeof practiceSessions.$inferSelect;
export type Draft = typeof drafts.$inferSelect;
export type DraftVersion = typeof draftVersions.$inferSelect;
export type AIFeedback = typeof aiFeedbacks.$inferSelect;
export type Idea = typeof ideas.$inferSelect;
export type ProgressMetric = typeof progressMetrics.$inferSelect;
export type AISetting = typeof aiSettings.$inferSelect;
export type UsageRecord = typeof usageRecords.$inferSelect;
