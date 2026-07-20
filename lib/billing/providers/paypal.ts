// ====================================================================
// PayPal 支付 Provider（REST Subscriptions API）
// ====================================================================
// 接入方式（2026-07-18 调研结论）：
// - 订阅：POST /v1/billing/subscriptions 创建，重定向到 approve 链接
// - webhook：POST /v1/notifications/verify-webhook-signature 验签
// - custom_id 传内部 userId；plan_id ↔ 套餐映射走环境变量
// - 取消：POST /v1/billing/subscriptions/{id}/cancel
//
// 环境变量：
// - PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET（sandbox 或 live）
// - PAYPAL_ENV=sandbox 时用测试地址，其余（含缺省）用生产地址
// - PAYPAL_WEBHOOK_ID（后台注册 webhook 后获得）
// - PAYPAL_PLAN_BASIC_MONTHLY / PAYPAL_PLAN_BASIC_YEARLY /
//   PAYPAL_PLAN_PRO_MONTHLY / PAYPAL_PLAN_PRO_YEARLY（setup 脚本产出）
// ====================================================================

import { getServerEnv } from "@/lib/server-env";
import type { BillingInterval } from "../plans";
import type { PaidPlan } from "./types";
import {
  ProviderNotConfiguredError,
  type BillingEvent,
  type CheckoutOptions,
  type CheckoutResult,
  type PaymentProvider,
} from "./types";

function apiBase(): string {
  return getServerEnv("PAYPAL_ENV") === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";
}

export function isPayPalConfigured(): boolean {
  return !!(getServerEnv("PAYPAL_CLIENT_ID") && getServerEnv("PAYPAL_CLIENT_SECRET"));
}

// ---- OAuth：client_credentials 换 access_token ----
async function getAccessToken(): Promise<string> {
  const clientId = getServerEnv("PAYPAL_CLIENT_ID")!;
  const secret = getServerEnv("PAYPAL_CLIENT_SECRET")!;
  const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${secret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) {
    throw new Error(`PayPal OAuth failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

// ---- plan_id ↔ 内部套餐 映射 ----
function planIdFor(plan: PaidPlan, interval: "monthly" | "yearly"): string {
  const envKey = `PAYPAL_PLAN_${plan.toUpperCase()}_${interval.toUpperCase()}`;
  const planId = getServerEnv(envKey);
  if (!planId) {
    throw new Error(`Missing env ${envKey} (run scripts/paypal-setup.mjs)`);
  }
  return planId;
}

function planFromPlanId(
  planId: string
): { plan: PaidPlan; interval: BillingInterval } | null {
  const map: [string, PaidPlan, BillingInterval][] = [
    ["PAYPAL_PLAN_BASIC_MONTHLY", "basic", "monthly"],
    ["PAYPAL_PLAN_BASIC_YEARLY", "basic", "yearly"],
    ["PAYPAL_PLAN_PRO_MONTHLY", "pro", "monthly"],
    ["PAYPAL_PLAN_PRO_YEARLY", "pro", "yearly"],
  ];
  for (const [envKey, plan, interval] of map) {
    if (getServerEnv(envKey) === planId) return { plan, interval };
  }
  return null;
}

// 付费套餐到期时间兜底：PayPal 偶尔不返回 next_billing_time，
// 此时给 35 天而不是 null——付费套餐绝不能无限期有效，
// 丢失 EXPIRED webhook 时 getUserPlan() 到期自动降级，系统自愈
function expiresAtOrFallback(iso: string | undefined): Date {
  return toDate(iso) ?? new Date(Date.now() + 35 * 24 * 3600 * 1000);
}

// ---- PayPal API 类型（只取用到的字段） ----
interface PayPalLink {
  href: string;
  rel: string;
}

interface PayPalSubscription {
  id: string;
  status: string;
  custom_id?: string;
  plan_id: string;
  billing_info?: {
    next_billing_time?: string;
  };
  links?: PayPalLink[];
}

interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource: {
    id?: string;
    custom_id?: string;
    plan_id?: string;
    status?: string;
    billing_agreement_id?: string; // PAYMENT.SALE.* 里的订阅 ID
    billing_info?: { next_billing_time?: string };
  };
}

async function paypalFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  if (!res.ok) {
    throw new Error(`PayPal ${path} failed: ${res.status} ${await res.text()}`);
  }
  // 204 No Content（cancel 等）直接返回空
  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

async function getSubscription(id: string): Promise<PayPalSubscription> {
  return paypalFetch<PayPalSubscription>(`/v1/billing/subscriptions/${id}`);
}

// ---- webhook 验签（调 PayPal 验证接口，Workers 一次 fetch 搞定） ----
async function verifyWebhookSignature(req: Request, rawBody: string): Promise<boolean> {
  const webhookId = getServerEnv("PAYPAL_WEBHOOK_ID");
  if (!webhookId) throw new Error("Missing env PAYPAL_WEBHOOK_ID");

  const token = await getAccessToken();
  const res = await fetch(`${apiBase()}/v1/notifications/verify-webhook-signature`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      auth_algo: req.headers.get("paypal-auth-algo"),
      cert_url: req.headers.get("paypal-cert-url"),
      transmission_id: req.headers.get("paypal-transmission-id"),
      transmission_sig: req.headers.get("paypal-transmission-sig"),
      transmission_time: req.headers.get("paypal-transmission-time"),
      webhook_id: webhookId,
      webhook_event: JSON.parse(rawBody),
    }),
  });
  if (!res.ok) return false;
  const data = (await res.json()) as { verification_status: string };
  return data.verification_status === "SUCCESS";
}

function toDate(iso: string | undefined): Date | null {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? null : d;
}

export const paypalProvider: PaymentProvider = {
  id: "paypal",

  async createCheckout(opts: CheckoutOptions): Promise<CheckoutResult> {
    if (!isPayPalConfigured()) {
      throw new ProviderNotConfiguredError("paypal");
    }

    const subscription = await paypalFetch<PayPalSubscription>(
      "/v1/billing/subscriptions",
      {
        method: "POST",
        body: JSON.stringify({
          plan_id: planIdFor(opts.plan, opts.interval),
          custom_id: opts.userId, // webhook 回传，对账到内部用户
          subscriber: { email_address: opts.userEmail },
          application_context: {
            brand_name: "WriteFit",
            locale: opts.locale === "zh" ? "zh-CN" : "en-US",
            user_action: "SUBSCRIBE_NOW",
            return_url: opts.successUrl,
            cancel_url: opts.cancelUrl,
          },
        }),
      }
    );

    const approve = subscription.links?.find((l) => l.rel === "approve");
    if (!approve) {
      throw new Error("PayPal did not return an approve link");
    }
    return { url: approve.href };
  },

  async parseWebhook(req: Request): Promise<BillingEvent | null> {
    if (!isPayPalConfigured()) {
      throw new ProviderNotConfiguredError("paypal");
    }

    const rawBody = await req.text();
    const verified = await verifyWebhookSignature(req, rawBody);
    if (!verified) {
      throw new Error("PayPal webhook signature verification failed");
    }

    const event = JSON.parse(rawBody) as PayPalWebhookEvent;
    const { event_type, resource } = event;

    switch (event_type) {
      case "BILLING.SUBSCRIPTION.ACTIVATED": {
        // 以回查的订阅详情为准：事件 resource 里的 custom_id 和
        // next_billing_time 都可能缺失
        if (!resource.id) return null;
        const sub = await getSubscription(resource.id);
        // 乱序防护：迟到/重投的 ACTIVATED 到达时订阅可能已被取消/过期，
        // 以 PayPal 权威的当前状态为准，非 ACTIVE 不赋予权限
        if (sub.status !== "ACTIVE") {
          console.log(`[paypal] ACTIVATED ignored: sub ${sub.id} status=${sub.status}`);
          return null;
        }
        const userId = sub.custom_id;
        const mapped = planFromPlanId(sub.plan_id);
        if (!userId || !mapped) return null;
        return {
          type: "subscription.activated",
          providerEventId: event.id,
          userId,
          providerSubscriptionId: sub.id,
          plan: mapped.plan,
          interval: mapped.interval,
          expiresAt: expiresAtOrFallback(sub.billing_info?.next_billing_time),
        };
      }

      case "PAYMENT.SALE.COMPLETED": {
        // 每次扣款成功（含首购和续费）。事件本身不带 userId/plan，
        // 回查订阅拿 custom_id 和下一计费日；首购与 ACTIVATED 幂等重叠，无害
        const subscriptionId = resource.billing_agreement_id;
        if (!subscriptionId) return null;
        const sub = await getSubscription(subscriptionId);
        // 乱序防护：同 ACTIVATED，取消后迟到的扣款事件不延长权限
        if (sub.status !== "ACTIVE") {
          console.log(`[paypal] SALE.COMPLETED ignored: sub ${sub.id} status=${sub.status}`);
          return null;
        }
        const userId = sub.custom_id;
        const mapped = planFromPlanId(sub.plan_id);
        if (!userId || !mapped) return null;
        return {
          type: "subscription.renewed",
          providerEventId: event.id,
          userId,
          providerSubscriptionId: subscriptionId,
          plan: mapped.plan,
          interval: mapped.interval,
          expiresAt: expiresAtOrFallback(sub.billing_info?.next_billing_time),
        };
      }

      case "BILLING.SUBSCRIPTION.CANCELLED": {
        // custom_id 可能缺失，缺失时回查订阅
        if (!resource.id) return null;
        const userId =
          resource.custom_id ?? (await getSubscription(resource.id)).custom_id;
        if (!userId) return null;
        return {
          type: "subscription.canceled",
          providerEventId: event.id,
          userId,
          providerSubscriptionId: resource.id,
          endsAt: null, // PayPal 取消后权限保留到周期末，由 EXPIRED 事件做最终降级
        };
      }

      case "BILLING.SUBSCRIPTION.EXPIRED": {
        if (!resource.id) return null;
        const userId =
          resource.custom_id ?? (await getSubscription(resource.id)).custom_id;
        if (!userId) return null;
        return {
          type: "subscription.expired",
          providerEventId: event.id,
          userId,
          providerSubscriptionId: resource.id,
        };
      }

      case "BILLING.SUBSCRIPTION.PAYMENT.FAILED": {
        if (!resource.id) return null;
        const userId =
          resource.custom_id ?? (await getSubscription(resource.id)).custom_id;
        if (!userId) return null;
        return {
          type: "subscription.payment_failed",
          providerEventId: event.id,
          userId,
          providerSubscriptionId: resource.id,
        };
      }

      default:
        // 其他事件（CREATED、UPDATED、SUSPENDED 等）不关心，忽略
        return null;
    }
  },

  async cancelSubscription(providerSubscriptionId: string): Promise<boolean> {
    if (!isPayPalConfigured()) {
      throw new ProviderNotConfiguredError("paypal");
    }
    try {
      await paypalFetch(`/v1/billing/subscriptions/${providerSubscriptionId}/cancel`, {
        method: "POST",
        body: JSON.stringify({ reason: "User requested cancellation from WriteFit settings" }),
      });
      return true;
    } catch (error) {
      // 已取消/已过期的订阅再取消：PayPal 返回 422 SUBSCRIPTION_STATUS_INVALID。
      // 对用户来说取消是幂等的，视为成功；其他错误抛给路由层区分处理
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes("422") && message.includes("SUBSCRIPTION_STATUS_INVALID")) {
        console.log("[paypal] subscription already canceled/expired, treating as success");
        return true;
      }
      console.error("[paypal] cancel subscription failed:", error);
      throw error;
    }
  },
};
