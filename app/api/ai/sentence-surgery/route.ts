// ====================================================================
// 句子手术 API
// ====================================================================
// 接收用户输入的句子或段落，返回 AI 句子级分析
//
// 工作模式（和 /api/ai/diagnose 一致）：
// - 有用户 AI 配置 → 调用真实 AI
// - 无 AI 配置 → 返回模拟反馈（开发测试用）
//
// 返回结构参考 SentenceSurgeryFeedback（lib/ai/schemas.ts）
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { getSystemRules, getSentenceSurgeryPrompt, type Locale } from "@/lib/ai/prompts";
import { mockSentenceSurgery } from "@/lib/ai/mock";
import { auth } from "@/lib/auth/auth";
import { getPlatformAIConfig } from "@/lib/ai/platform";
import { getUserPlan, isByokAllowed } from "@/lib/billing/plans";
import { checkAndRecordAiUsage } from "@/lib/billing/usage";
import type { SentenceSurgeryFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    // 检查登录状态
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { text, language = "en", aiConfig } = await req.json();

    const locale: Locale = language === "zh" ? "zh" : "en";

    // 验证输入：句子手术允许较短输入（至少 2 个字符）
    if (!text || typeof text !== "string" || text.trim().length < 2) {
      return NextResponse.json(
        {
          error:
            locale === "zh"
              ? "请输入至少 2 个字符的句子"
              : "Please enter at least 2 characters",
        },
        { status: 400 }
      );
    }

    // 决定用谁的 Key：用户自带（BYOK）> 平台托管（按套餐限量）
    let effectiveConfig: AIConfig | null =
      aiConfig?.apiKey ? (aiConfig as AIConfig) : null;

    // BYOK 是付费功能（Basic/Pro）：免费用户带 Key 也拒绝，引导升级
    if (effectiveConfig) {
      const plan = await getUserPlan(session.user.id);
      if (!isByokAllowed(plan)) {
        return NextResponse.json(
          {
            error: locale === "zh" ? "自带 Key（BYOK）是付费功能，升级 Basic 或 Pro 即可不限量使用自己的 API Key" : "Bring-your-own-key is a paid feature. Upgrade to Basic or Pro to use your own API key with unlimited AI feedback.",
            code: "BYOK_REQUIRES_PAID",
          },
          { status: 402 }
        );
      }
    }

    if (!effectiveConfig) {
      const platformConfig = getPlatformAIConfig();
      if (!platformConfig) {
        // 平台未配置 Key（本地开发）：返回模拟反馈
        const mockResult = mockSentenceSurgery(text, locale);
        return NextResponse.json({ ...mockResult, _mock: true });
      }
      // 平台 Key 路径：原子预扣 1 次并判定配额（防并发超额）
      const plan = await getUserPlan(session.user.id);
      const quota = await checkAndRecordAiUsage(session.user.id, "sentence-surgery", plan);
      if (!quota.allowed) {
        return NextResponse.json(
          {
            error: locale === "zh" ? "今日免费 AI 次数已用完，明天重置" : "You've used up today's free AI credits. They reset tomorrow.",
            code: "QUOTA_EXCEEDED",
            used: quota.used,
            limit: quota.limit,
          },
          { status: 402 }
        );
      }
      effectiveConfig = platformConfig;
    }

    // 有 AI 配置 → 调用真实 AI
    const result = await callAIJson<SentenceSurgeryFeedback>({
      config: effectiveConfig,
      systemPrompt: `${getSystemRules(locale)}\n\n${getSentenceSurgeryPrompt(locale)}`,
      messages: [
        {
          role: "user",
          content:
            locale === "zh"
              ? "请分析以下中文句子或段落：\n\n" + text
              : "Please analyze the following English sentence or paragraph:\n\n" + text,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true,
    });

    // 计量已在配额判定时预扣，此处无需再记

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sentence surgery failed:", error);
    const message =
      error instanceof Error ? error.message : "Sentence surgery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
