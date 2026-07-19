// ====================================================================
// 订阅状态 API
// ====================================================================
// GET /api/billing/status —— 返回当前用户的套餐、当日 AI 用量、支付信息
// 设置页"订阅"卡片和前端各处需要套餐信息时调用
// ====================================================================

import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { users } from "@/lib/db/schema";
import { getUserPlan } from "@/lib/billing/plans";
import { getUsageSummary } from "@/lib/billing/usage";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const plan = await getUserPlan(session.user.id);
    const usage = await getUsageSummary(session.user.id, plan);

    // 支付信息（设置页展示用；免费用户为 null）
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const [user] = await db
      .select({
        planExpiresAt: users.planExpiresAt,
        paymentProvider: users.paymentProvider,
      })
      .from(users)
      .where(eq(users.id, session.user.id));

    return NextResponse.json({
      plan,
      used: usage.used,
      limit: usage.limit,
      planExpiresAt: user?.planExpiresAt ?? null,
      paymentProvider: user?.paymentProvider ?? null,
    });
  } catch (error) {
    console.error("Billing status failed:", error);
    return NextResponse.json({ error: "Failed to load billing status" }, { status: 500 });
  }
}
