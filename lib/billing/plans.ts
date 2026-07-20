// ====================================================================
// 套餐配置与用户套餐查询
// ====================================================================
// 三层结构：
// - free：平台托管 Key，每日限量 AI 调用（注册即用，无需配置）
// - basic / pro：分级付费订阅，AI 配额随等级提高
// - BYOK（用户自带 Key）：付费功能（basic/pro 专属），不限量、不计量，
//   平台零 token 成本
//
// 配额只约束"用平台 Key"的调用；用户自带 Key 不受此限（但需付费套餐，
// 见 isByokAllowed）。
// 新增套餐只改 PLANS 配置，不要在代码里硬编码等级判断。
// ====================================================================

import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";

export type Plan = "free" | "basic" | "pro";

export interface PlanPricing {
  // 美元价格；monthly 为月付价，yearly 为年付总价（按 10 个月计）
  monthly: number;
  yearly: number;
}

export interface PlanConfig {
  id: Plan;
  // 每日平台 Key AI 调用配额（全部 AI 端点合计）
  dailyAiLimit: number;
  // 定价（2026-07-18 拍板）；free 为 null
  pricing: PlanPricing | null;
}

// 套餐 → 配额与定价映射（plan 相关的判断都以这份配置为准，不要硬编码）
export const PLANS: Record<Plan, PlanConfig> = {
  free: { id: "free", dailyAiLimit: 5, pricing: null },
  basic: { id: "basic", dailyAiLimit: 20, pricing: { monthly: 19.9, yearly: 199 } },
  pro: { id: "pro", dailyAiLimit: 100, pricing: { monthly: 29.9, yearly: 299 } },
};

// 付费套餐列表（pricing 页和升级引导用）
export const PAID_PLANS: Plan[] = ["basic", "pro"];

// BYOK（自带 Key）是付费功能：仅 basic/pro 可用，free 走平台 Key 限量
export function isByokAllowed(plan: Plan): boolean {
  return plan !== "free";
}

export type BillingInterval = "monthly" | "yearly";

// 计算套餐价格（付费套餐限定）
export function getPlanPrice(plan: Plan, interval: BillingInterval): number | null {
  const pricing = PLANS[plan].pricing;
  if (!pricing) return null;
  return interval === "monthly" ? pricing.monthly : pricing.yearly;
}

function isValidPlan(value: string): value is Plan {
  return value in PLANS;
}

// 查询用户当前套餐（付费墙门控的判定入口，每次都读库保证准确）
// - 非法值按 free 处理
// - 付费套餐已过期（planExpiresAt 早于现在）自动降级为 free
// - 查询失败按 free 处理（宁可限流不可放行，平台 Key 是成本）
export async function getUserPlan(userId: string): Promise<Plan> {
  try {
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const [user] = await db
      .select({ plan: users.plan, planExpiresAt: users.planExpiresAt })
      .from(users)
      .where(eq(users.id, userId));

    if (!user || !isValidPlan(user.plan)) return "free";
    if (
      user.plan !== "free" &&
      user.planExpiresAt &&
      user.planExpiresAt.getTime() < Date.now()
    ) {
      return "free";
    }
    return user.plan;
  } catch {
    return "free";
  }
}
