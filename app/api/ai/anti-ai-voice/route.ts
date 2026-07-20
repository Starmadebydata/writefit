// ====================================================================
// 反 AI 腔检测 API
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { getSystemRules, getAntiAiVoicePrompt, type Locale } from "@/lib/ai/prompts";
import { mockAntiAIVoice } from "@/lib/ai/mock";
import { auth } from "@/lib/auth/auth";
import { getUserBannedPhrases } from "@/lib/db/profile";
import { getPlatformAIConfig } from "@/lib/ai/platform";
import { getUserPlan, isByokAllowed } from "@/lib/billing/plans";
import { checkAndRecordAiUsage } from "@/lib/billing/usage";
import type { AntiAIVoiceFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    // 检查登录状态
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { text, language = "en", aiConfig } = await req.json();

    // 确定语言
    const locale: Locale = language === "zh" ? "zh" : "en";

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: locale === "zh" ? "文本太短，至少需要 10 个字符才能检测" : "Text too short, at least 10 characters required for detection" },
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
        const mockResult = mockAntiAIVoice(text, locale);
        return NextResponse.json({ ...mockResult, _mock: true });
      }
      // 平台 Key 路径：原子预扣 1 次并判定配额（防并发超额）
      const plan = await getUserPlan(session.user.id);
      const quota = await checkAndRecordAiUsage(session.user.id, "anti-ai-voice", plan);
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

    // 读取用户在设置里配置的自定义禁用词，注入 prompt
    const bannedPhrases = await getUserBannedPhrases(session.user.id);

    const result = await callAIJson<AntiAIVoiceFeedback>({
      config: effectiveConfig,
      systemPrompt: `${getSystemRules(locale)}\n\n${getAntiAiVoicePrompt(locale, bannedPhrases)}`,
      messages: [
        {
          role: "user",
          content: locale === "zh"
            ? `请检测以下文本的 AI 腔：\n\n${text}`
            : `Please detect AI-like tone in the following text:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
      jsonMode: true,
    });

    // 计量已在配额判定时预扣，此处无需再记

    return NextResponse.json(result);
  } catch (error) {
    console.error("Anti-AI voice detection failed:", error);
    const message = error instanceof Error ? error.message : "Detection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
