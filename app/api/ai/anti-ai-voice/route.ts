// ====================================================================
// 反 AI 腔检测 API
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { getSystemRules, getAntiAiVoicePrompt, type Locale } from "@/lib/ai/prompts";
import { mockAntiAIVoice } from "@/lib/ai/mock";
import type { AntiAIVoiceFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const { text, language = "en", aiConfig } = await req.json();

    // 确定语言
    const locale: Locale = language === "zh" ? "zh" : "en";

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: locale === "zh" ? "文本太短，至少需要 10 个字符才能检测" : "Text too short, at least 10 characters required for detection" },
        { status: 400 }
      );
    }

    if (!aiConfig || !aiConfig.apiKey) {
      const mockResult = mockAntiAIVoice(text, locale);
      return NextResponse.json({ ...mockResult, _mock: true });
    }

    const result = await callAIJson<AntiAIVoiceFeedback>({
      config: aiConfig as AIConfig,
      systemPrompt: `${getSystemRules(locale)}\n\n${getAntiAiVoicePrompt(locale)}`,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Anti-AI voice detection failed:", error);
    const message = error instanceof Error ? error.message : "Detection failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
