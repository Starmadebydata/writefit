// ====================================================================
// 匿名 AI 用量配额（未登录用户的平台 Key 计量与门控）
// ====================================================================
// 给未登录访客开小额真实 AI 体验（首页试用区 / /practice/dev 演示页）。
// 按 IP hash 计量：SHA-256(IP + 盐 + UTC 日期)，含日期即每日自动轮换，
// 无法跨天关联同一访客，不落原始 IP。
//
// 预扣模式与 lib/billing/usage.ts 完全同构（upsert 原子自增 → 读总量），
// 被拒请求的预扣不回滚（按 UTC 日重置自愈）。
// 盐 ANON_QUOTA_SALT 缺失时调用方应回退 mock，绝不能用空盐。
// ====================================================================

import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { and, eq, sql } from "drizzle-orm";
import { anonUsageRecords } from "@/lib/db/schema";
import { getServerEnv } from "@/lib/server-env";
import type { QuotaResult } from "./usage";

// 匿名每日限额（按端点分开计，体验完整一轮"诊断→修改对比"）
export const ANON_DAILY_LIMITS = {
  diagnose: 2,
  "compare-revision": 2,
} as const;

export type AnonEndpoint = keyof typeof ANON_DAILY_LIMITS;

function getDb() {
  const { env } = getCloudflareContext();
  return drizzle(env.DB);
}

function todayUtc(): string {
  return new Date().toISOString().split("T")[0];
}

// 从请求头取客户端 IP：Cloudflare 生产环境用 CF-Connecting-IP，
// 其他代理环境回退 X-Forwarded-For 首段，本地开发兜底固定值
export function getClientIp(headers: Headers): string {
  return (
    headers.get("cf-connecting-ip") ??
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "local-dev"
  );
}

// 读取匿名配额盐；未配置返回 null（调用方回退 mock）
export function getAnonQuotaSalt(): string | null {
  return getServerEnv("ANON_QUOTA_SALT") ?? null;
}

// 计算匿名访客当日标识：SHA-256(ip:盐:UTC日期)
// Workers 环境只有 Web Crypto（crypto.subtle），不能用 node:crypto
export async function hashAnonId(ip: string, salt: string): Promise<string> {
  const data = new TextEncoder().encode(`${ip}:${salt}:${todayUtc()}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// 匿名访客当日某端点已用量
async function getTodayAnonUsage(ipHash: string, endpoint: AnonEndpoint): Promise<number> {
  const db = getDb();
  const [row] = await db
    .select({
      total: sql<number>`coalesce(cast(sum(${anonUsageRecords.count}) as integer), 0)`,
    })
    .from(anonUsageRecords)
    .where(
      and(
        eq(anonUsageRecords.ipHash, ipHash),
        eq(anonUsageRecords.date, todayUtc()),
        eq(anonUsageRecords.endpoint, endpoint)
      )
    );
  return row?.total ?? 0;
}

// 原子预扣 1 次并判定匿名配额（同 checkAndRecordAiUsage 的并发语义）
export async function checkAndRecordAnonUsage(
  ipHash: string,
  endpoint: AnonEndpoint
): Promise<QuotaResult> {
  const limit = ANON_DAILY_LIMITS[endpoint];
  const db = getDb();
  const now = new Date();
  await db
    .insert(anonUsageRecords)
    .values({
      id: crypto.randomUUID(),
      ipHash,
      date: todayUtc(),
      endpoint,
      count: 1,
      createdAt: now,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: [anonUsageRecords.ipHash, anonUsageRecords.date, anonUsageRecords.endpoint],
      set: { count: sql`${anonUsageRecords.count} + 1`, updatedAt: now },
    });
  const used = await getTodayAnonUsage(ipHash, endpoint);
  return { allowed: used <= limit, used, limit };
}
