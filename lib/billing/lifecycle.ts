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
import { and, eq, isNull, or } from "drizzle-orm";
import { billingEvents, users } from "@/lib/db/schema";
import type { BillingEvent, PaymentProviderId } from "./providers/types";

export async function applyBillingEvent(
  event: BillingEvent,
  providerId: PaymentProviderId
): Promise<void> {
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);
  const now = new Date();

  // ---- 幂等去重：同一平台事件 ID 只处理一次 ----
  // 先占位再处理：极端情况下（占位成功后处理中崩溃）该事件不会被重放，
  // 可接受——各分支的更新本身幂等，且续费事件/状态回查会自愈
  const inserted = await db
    .insert(billingEvents)
    .values({
      id: event.providerEventId,
      provider: providerId,
      eventType: event.type,
      userId: event.userId,
      processedAt: now,
    })
    .onConflictDoNothing()
    .returning({ id: billingEvents.id });
  if (inserted.length === 0) {
    console.log(`[billing] duplicate event ${event.providerEventId}, skipping`);
    return;
  }

  switch (event.type) {
    case "subscription.activated": {
      await db
        .update(users)
        .set({
          plan: event.plan,
          planInterval: event.interval,
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
      // 续费：更新套餐和到期时间（升降级后 plan 可能变化）。
      // 防护：仅当事件的订阅 ID 与用户当前订阅一致（或用户还没有订阅）时更新，
      // 防止旧订阅的迟到扣款事件覆盖用户新开的订阅
      await db
        .update(users)
        .set({
          plan: event.plan,
          planInterval: event.interval,
          planExpiresAt: event.expiresAt,
          paymentProvider: providerId,
          paymentSubscriptionId: event.providerSubscriptionId,
          updatedAt: now,
        })
        .where(
          and(
            eq(users.id, event.userId),
            or(
              isNull(users.paymentSubscriptionId),
              eq(users.paymentSubscriptionId, event.providerSubscriptionId)
            )
          )
        );
      console.log(`[billing] renewed: user=${event.userId} plan=${event.plan} until=${event.expiresAt}`);
      break;
    }

    case "subscription.canceled": {
      // 取消：不立即降级，权限保留到 planExpiresAt；无操作，仅记录
      console.log(`[billing] canceled: user=${event.userId} sub=${event.providerSubscriptionId}（权限保留到周期末）`);
      break;
    }

    case "subscription.expired": {
      // 防护：仅当过期的正是用户当前记录的订阅时才降级，
      // 防止旧订阅的 EXPIRED 事件误杀用户新开的订阅
      await db
        .update(users)
        .set({
          plan: "free",
          planInterval: null,
          planExpiresAt: null,
          updatedAt: now,
        })
        .where(
          and(
            eq(users.id, event.userId),
            or(
              isNull(users.paymentSubscriptionId),
              eq(users.paymentSubscriptionId, event.providerSubscriptionId)
            )
          )
        );
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
