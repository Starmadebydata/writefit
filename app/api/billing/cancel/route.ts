// ====================================================================
// 取消订阅 API
// ====================================================================
// POST /api/billing/cancel —— 取消当前用户的订阅
// 取消后权限保留到 planExpiresAt（周期末），不立即降级
// ====================================================================

import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { auth } from "@/lib/auth/auth";
import { users } from "@/lib/db/schema";
import { getPaymentProvider } from "@/lib/billing/providers";
import { ProviderNotConfiguredError } from "@/lib/billing/providers/types";

export async function POST() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // 读取用户的支付平台和订阅 ID
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const [user] = await db
      .select({
        plan: users.plan,
        paymentProvider: users.paymentProvider,
        paymentSubscriptionId: users.paymentSubscriptionId,
      })
      .from(users)
      .where(eq(users.id, session.user.id));

    if (!user || user.plan === "free" || !user.paymentProvider || !user.paymentSubscriptionId) {
      return NextResponse.json({ error: "No active subscription" }, { status: 400 });
    }

    const provider = getPaymentProvider(user.paymentProvider);
    let ok: boolean;
    try {
      ok = await provider.cancelSubscription(user.paymentSubscriptionId);
    } catch (error) {
      if (error instanceof ProviderNotConfiguredError) throw error;
      // 支付平台侧错误（网络/5xx 等）：区分于我们自身的 500
      console.error("Cancel subscription provider error:", error);
      return NextResponse.json(
        { error: "Payment provider error, please try again later", code: "PROVIDER_ERROR" },
        { status: 502 }
      );
    }
    if (!ok) {
      return NextResponse.json({ error: "Cancellation failed, please try again" }, { status: 500 });
    }

    // 不立即降级：权限保留到周期末（webhook 的 EXPIRED 事件做最终清理）
    return NextResponse.json({ success: true });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json(
        { error: "Payment is not available yet", code: "PAYMENT_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    console.error("Cancel subscription failed:", error);
    return NextResponse.json({ error: "Cancellation failed" }, { status: 500 });
  }
}
