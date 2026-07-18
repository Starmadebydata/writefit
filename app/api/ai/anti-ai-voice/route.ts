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
import { getUserPlan } from "@/lib/billing/plans";
import { checkAiQuota, recordAiUsage } from "@/lib/billing/usage";
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

    // 决定用谁的 Key：用户自带（BYOK，不限量）> 平台托管（按套餐限量）
    let effectiveConfig: AIConfig | null =
      aiConfig?.apiKey ? (aiConfig as AIConfig) : null;
    let usingPlatformKey = false;

    if (!effectiveConfig) {
      const platformConfig = getPlatformAIConfig();
      if (!platformConfig) {
        // 平台未配置 Key（本地开发）：返回模拟反馈
        const mockResult = mockAntiAIVoice(text, locale);
        return NextResponse.json({ ...mockResult, _mock: true });
      }
      // 平台 Key 路径：检查套餐配额（只读，成功调用后才计量）
      const plan = await getUserPlan(session.user.id);
      const quota = await checkAiQuota(session.user.id, plan);
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
      usingPlatformKey = true;
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

    // 平台 Key 调用成功才计量
    if (usingPlatformKey) {
      await recordAiUsage(session.user.id, "anti-ai-voice", 1);
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Anti-AI voice detection failed:", error);
    const message = error instanceof Error ? error.message : "Detection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
