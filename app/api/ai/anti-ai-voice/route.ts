// ====================================================================
// 反 AI 腔检测 API
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { SYSTEM_RULES, ANTI_AI_VOICE_PROMPT } from "@/lib/ai/prompts";
import { mockAntiAIVoice } from "@/lib/ai/mock";
import type { AntiAIVoiceFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const { text, aiConfig } = await req.json();

    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "文本太短，至少需要 10 个字符才能检测" },
        { status: 400 }
      );
    }

    if (!aiConfig || !aiConfig.apiKey) {
      const mockResult = mockAntiAIVoice(text);
      return NextResponse.json({ ...mockResult, _mock: true });
    }

    const result = await callAIJson<AntiAIVoiceFeedback>({
      config: aiConfig as AIConfig,
      systemPrompt: `${SYSTEM_RULES}\n\n${ANTI_AI_VOICE_PROMPT}`,
      messages: [
        { role: "user", content: `请检测以下文本的 AI 腔：\n\n${text}` },
      ],
      temperature: 0.3,
      maxTokens: 2000,
      jsonMode: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("反 AI 腔检测失败:", error);
    const message = error instanceof Error ? error.message : "检测失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
