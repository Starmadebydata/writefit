// ====================================================================
// PayPal 支付 Provider（骨架，等待 sandbox 凭证后补全实现）
// ====================================================================
// 调研结论（2026-07-18，详见 HANDOVER.md 支付调研节）：
// - 订阅走 Subscriptions API：POST /v1/billing/subscriptions 创建，
//   重定向用户到响应里的 approve 链接（REST + 重定向模式，Workers 友好）
// - webhook 验签调 POST /v1/notifications/verify-webhook-signature（一次 fetch）
// - custom_id 传内部 userId；升降级用同 product 下 plan 的 revise
// - 无 customer portal，取消走 POST /v1/billing/subscriptions/{id}/cancel；
//   买家在 PayPal 侧自行取消可能丢 webhook，账单页需轮询 GET 校对状态
// - API base：生产 https://api-m.paypal.com，sandbox https://api-m.sandbox.paypal.com
// ====================================================================

import { getServerEnv } from "@/lib/server-env";
import {
  ProviderNotConfiguredError,
  type PaymentProvider,
} from "./types";

// 凭证：PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET（sandbox 先行）
// PAYPAL_ENV=sandbox 时用测试地址，缺省视为 sandbox（安全默认）
export function isPayPalConfigured(): boolean {
  return !!(getServerEnv("PAYPAL_CLIENT_ID") && getServerEnv("PAYPAL_CLIENT_SECRET"));
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",

  async createCheckout() {
    if (!isPayPalConfigured()) {
      throw new ProviderNotConfiguredError("paypal");
    }
    // TODO(P2 凭证到位后实现)：
    // 1. POST /v1/oauth2/token 拿 access_token
    // 2. POST /v1/billing/subscriptions { plan_id, custom_id: userId, application_context: { return_url, cancel_url } }
    // 3. 从 HATEOAS links 里取 rel=approve 的 href 返回
    throw new ProviderNotConfiguredError("paypal");
  },

  async parseWebhook() {
    if (!isPayPalConfigured()) {
      throw new ProviderNotConfiguredError("paypal");
    }
    // TODO(P2)：调 verify-webhook-signature 验签，
    // 映射 BILLING.SUBSCRIPTION.ACTIVATED/CANCELLED/EXPIRED、
    // PAYMENT.SALE.COMPLETED（续费）、BILLING.SUBSCRIPTION.PAYMENT.FAILED
    throw new ProviderNotConfiguredError("paypal");
  },

  async cancelSubscription() {
    if (!isPayPalConfigured()) {
      throw new ProviderNotConfiguredError("paypal");
    }
    // TODO(P2)：POST /v1/billing/subscriptions/{id}/cancel
    throw new ProviderNotConfiguredError("paypal");
  },
};
