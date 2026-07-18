// ====================================================================
// AI 用量配额（平台托管 Key 的计量与门控）
// ====================================================================
// 只记录"用平台 Key"的调用；BYOK（用户自带 Key）不计量。
// 配额按 UTC 自然日重置，所有 AI 端点共用每日总额度。
//
// 判定流程：checkAiQuota（只读）→ 调用 AI → recordAiUsage（累加）。
// 并发下可能轻微超额，对免费配额来说可以接受。
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

// 检查用户当日配额是否还有余量（只读，不计量）
export async function checkAiQuota(userId: string, plan: Plan): Promise<QuotaResult> {
  const limit = PLANS[plan].dailyAiLimit;
  const used = await getTodayUsage(userId);
  return { allowed: used < limit, used, limit };
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
