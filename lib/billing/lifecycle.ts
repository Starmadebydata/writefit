// ====================================================================
// 订阅生命周期事件应用（provider 无关）
// ====================================================================
// 各支付平台的 webhook 解析成统一 BillingEvent 后，都在这里落库。
// 设计要点：
// - 所有操作幂等（重复事件无害，PayPal 会重投 webhook）
// - "取消"不立即降级：取消后不再续费，planExpiresAt 到期后
//   getUserPlan() 自动降级为 free；EXPIRED 事件做最终清理
// ====================================================================

import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { users } from "@/lib/db/schema";
import type { BillingEvent, PaymentProviderId } from "./providers/types";

export async function applyBillingEvent(
  event: BillingEvent,
  providerId: PaymentProviderId
): Promise<void> {
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);
  const now = new Date();

  switch (event.type) {
    case "subscription.activated": {
      await db
        .update(users)
        .set({
          plan: event.plan,
          planExpiresAt: event.expiresAt,
          paymentProvider: providerId,
          paymentSubscriptionId: event.providerSubscriptionId,
          paymentCustomerId: event.customerId ?? null,
          updatedAt: now,
        })
        .where(eq(users.id, event.userId));
      console.log(`[billing] activated: user=${event.userId} plan=${event.plan} via=${providerId}`);
      break;
    }

    case "subscription.renewed": {
      // 续费：更新套餐和到期时间（升降级后 plan 可能变化）
      await db
        .update(users)
        .set({
          plan: event.plan,
          planExpiresAt: event.expiresAt,
          paymentProvider: providerId,
          paymentSubscriptionId: event.providerSubscriptionId,
          updatedAt: now,
        })
        .where(eq(users.id, event.userId));
      console.log(`[billing] renewed: user=${event.userId} plan=${event.plan} until=${event.expiresAt}`);
      break;
    }

    case "subscription.canceled": {
      // 取消：不立即降级，权限保留到 planExpiresAt；无操作，仅记录
      console.log(`[billing] canceled: user=${event.userId} sub=${event.providerSubscriptionId}（权限保留到周期末）`);
      break;
    }

    case "subscription.expired": {
      await db
        .update(users)
        .set({
          plan: "free",
          planExpiresAt: null,
          updatedAt: now,
        })
        .where(eq(users.id, event.userId));
      console.log(`[billing] expired: user=${event.userId} → free`);
      break;
    }

    case "subscription.payment_failed": {
      // 扣款失败：平台会重试（dunning），先记录不降级
      console.warn(`[billing] payment failed: user=${event.userId} sub=${event.providerSubscriptionId}`);
      break;
    }
  }
}
