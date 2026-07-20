// ====================================================================
// 支付平台 Provider 抽象（付费墙核心接口）
// ====================================================================
// 所有支付平台（PayPal / Creem / 未来的 Stripe）都实现这个接口。
// 业务代码（API 路由、webhook 处理）只面向接口编程，
// 新增平台时实现接口 + 注册进 index.ts，业务代码零改动。
// ====================================================================

import type { Plan, BillingInterval } from "../plans";

export type PaymentProviderId = "paypal" | "creem" | "stripe";

export type PaidPlan = Exclude<Plan, "free">;

export interface CheckoutOptions {
  userId: string; // 内部用户 ID（透传到支付平台 metadata/custom_id，webhook 回传对账）
  userEmail: string; // 预填邮箱
  plan: PaidPlan;
  interval: BillingInterval;
  successUrl: string; // 支付成功回跳地址
  cancelUrl: string; // 取消支付回跳地址
  locale: "en" | "zh";
}

export interface CheckoutResult {
  url: string; // 支付平台收银台地址，前端重定向过去
}

// 支付平台 webhook 验签后解析出的统一事件
// 各 provider 把自己的事件模型映射成这几种，业务层只认这个
// providerEventId：平台事件 ID（PayPal 的 "WH-..."），用于 billing_events 幂等去重
export type BillingEvent =
  | {
      type: "subscription.activated"; // 首次订阅成功（开通套餐）
      providerEventId: string;
      userId: string;
      providerSubscriptionId: string;
      customerId?: string;
      plan: PaidPlan;
      interval: BillingInterval | null; // 账单周期（null = 平台无法判断）
      expiresAt: Date; // 下一计费日（平台不提供时 provider 层给兜底值，付费套餐不允许 null）
    }
  | {
      type: "subscription.renewed"; // 续费成功（延长到期时间）
      providerEventId: string;
      userId: string;
      providerSubscriptionId: string;
      plan: PaidPlan;
      interval: BillingInterval | null;
      expiresAt: Date;
    }
  | {
      type: "subscription.canceled"; // 用户取消（到期降级，不是立即）
      providerEventId: string;
      userId: string;
      providerSubscriptionId: string;
      endsAt: Date | null; // 取消生效日（null = 平台不提供，按当前到期时间）
    }
  | {
      type: "subscription.expired"; // 订阅到期结束（降级为 free）
      providerEventId: string;
      userId: string;
      providerSubscriptionId: string;
    }
  | {
      type: "subscription.payment_failed"; // 扣款失败（先标记，不立即降级）
      providerEventId: string;
      userId: string;
      providerSubscriptionId: string;
    };

export interface PaymentProvider {
  id: PaymentProviderId;
  // 创建支付会话，返回收银台地址
  createCheckout(opts: CheckoutOptions): Promise<CheckoutResult>;
  // 验签 + 解析 webhook 请求；返回 null 表示"不认识的事件，忽略即可"
  // 验签失败必须抛错（路由返回 400）
  parseWebhook(req: Request): Promise<BillingEvent | null>;
  // 取消订阅（设置页"取消订阅"按钮用）
  cancelSubscription(providerSubscriptionId: string): Promise<boolean>;
}

// 平台凭证未配置时抛出（路由捕获后返回 503）
export class ProviderNotConfiguredError extends Error {
  constructor(providerId: string) {
    super(`Payment provider "${providerId}" is not configured yet`);
    this.name = "ProviderNotConfiguredError";
  }
}
