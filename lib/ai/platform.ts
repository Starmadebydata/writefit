// ====================================================================
// 平台托管 AI Key（付费墙核心：平台出 Key 的注入点）
// ====================================================================
// 免费/付费用户没有自带 Key 时，用平台统一配置的 Key 调用 AI：
// - free：每日限量（见 lib/billing/plans.ts）
// - basic / pro：配额随套餐等级提高
// - 用户自带 Key（BYOK，付费功能）时不走这里，不限量
//
// 配置方式（环境变量，生产用 wrangler secret / Dashboard 变量）：
// - PLATFORM_AI_API_KEY（必填，未配置则回退 mock 反馈，保持开发体验）
// - PLATFORM_AI_BASE_URL（可选，默认 DeepSeek）
// - PLATFORM_AI_MODEL（可选，默认 deepseek-chat）
// ====================================================================

import type { AIConfig } from "./client";
import { getServerEnv } from "@/lib/server-env";

export function getPlatformAIConfig(): AIConfig | null {
  const apiKey = getServerEnv("PLATFORM_AI_API_KEY");
  if (!apiKey) return null;
  return {
    apiBaseUrl:
      getServerEnv("PLATFORM_AI_BASE_URL") ?? "https://api.deepseek.com/v1",
    apiKey,
    model: getServerEnv("PLATFORM_AI_MODEL") ?? "deepseek-chat",
  };
}
