// ====================================================================
// 支付平台注册表
// ====================================================================
// 已实现的 provider 注册在这里。默认平台用环境变量 PAYMENT_PROVIDER
// 切换（默认 paypal）。未注册/未配置的 platform 抛
// ProviderNotConfiguredError，路由层捕获后返回 503。
// ====================================================================

import { getServerEnv } from "@/lib/server-env";
import { paypalProvider } from "./paypal";
import {
  ProviderNotConfiguredError,
  type PaymentProvider,
  type PaymentProviderId,
} from "./types";

const providers = new Map<PaymentProviderId, PaymentProvider>([
  [paypalProvider.id, paypalProvider],
  // creem: 审核通过后实现（见 HANDOVER.md 支付调研结论）
  // stripe: 港卡开通后实现
]);

export function getPaymentProvider(id?: string): PaymentProvider {
  const providerId = (id ??
    getServerEnv("PAYMENT_PROVIDER") ??
    "paypal") as PaymentProviderId;
  const provider = providers.get(providerId);
  if (!provider) {
    throw new ProviderNotConfiguredError(providerId);
  }
  return provider;
}
