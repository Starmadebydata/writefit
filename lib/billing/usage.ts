// ====================================================================
// AI 用量配额（平台托管 Key 的计量与门控）
// ====================================================================
// 只记录"用平台 Key"的调用；BYOK（用户自带 Key）不计量。
// 配额按 UTC 自然日重置，所有 AI 端点共用每日总额度。
//
// 判定流程：checkAndRecordAiUsage（原子预扣 1 次并判定）→ 调用 AI
// → 重试时 recordAiUsage 补记差额。
// 预扣是 D1 upsert 原子自增，避免旧版"先查后记"的并发超额；
// 并发临界时可能把恰好还有余量的请求一并拒掉（误差 ≤ 并发数），可接受。
// 被拒请求的预扣不回滚（按 UTC 日重置自愈）。
// ====================================================================

import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, sql } from "drizzle-orm";
import { usageRecords } from "@/lib/db/schema";
import { PLANS, type Plan } from "./plans";

function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB);
}

// 当日日期串（UTC，YYYY-MM-DD）
function todayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

// 查询用户当日已用量（全部端点合计）
async function getTodayUsage(userId: string): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({
      total: sql<number>`coalesce(cast(sum(${usageRecords.count}) as integer), 0)`,
    })
    .from(usageRecords)
    .where(and(eq(usageRecords.userId, userId), eq(usageRecords.date, todayUtc())));
  return row?.total ?? 0;
}

export interface QuotaResult {
  allowed: boolean;
  used: number;
  limit: number;
}

// 原子预扣 1 次并判定配额：先 upsert 自增（D1 层原子），再读当日总量。
// allowed=false 时本次调用不应发起 AI 请求（预扣不回滚，见文件头注释）
export async function checkAndRecordAiUsage(
  userId: string,
  endpoint: string,
  plan: Plan
): Promise<QuotaResult> {
  const limit = PLANS[plan].dailyAiLimit;
  const db = getDb();
  const now = new Date();
  await db
    .insert(usageRecords)
    .values({
      id: crypto.randomUUID(),
      userId,
      date: todayUtc(),
      endpoint,
      count: 1,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [usageRecords.userId, usageRecords.date, usageRecords.endpoint],
      set: { count: sql`${usageRecords.count} + 1`, updatedAt: now },
    });
  const used = await getTodayUsage(userId);
  return { allowed: used <= limit, used, limit };
}

// 查询用户当日用量摘要（设置页展示用；失败时返回零用量，不阻断页面）
export async function getUsageSummary(userId: string, plan: Plan): Promise<QuotaResult> {
  try {
    const limit = PLANS[plan].dailyAiLimit;
    const used = await getTodayUsage(userId);
    return { allowed: used < limit, used, limit };
  } catch {
    return { allowed: true, used: 0, limit: PLANS[plan].dailyAiLimit };
  }
}

// 记录一次平台 Key 调用（upsert 累加；失败静默，不因计量故障阻断用户）
export async function recordAiUsage(
  userId: string,
  endpoint: string,
  count: number = 1
): Promise<void> {
  try {
    const db = getDb();
    const now = new Date();
    await db
      .insert(usageRecords)
      .values({
        id: crypto.randomUUID(),
        userId,
        date: todayUtc(),
        endpoint,
        count,
        createdAt: now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: [usageRecords.userId, usageRecords.date, usageRecords.endpoint],
        set: { count: sql`${usageRecords.count} + ${count}`, updatedAt: now },
      });
  } catch (error) {
    console.error("[usage] record failed:", error);
  }
}
