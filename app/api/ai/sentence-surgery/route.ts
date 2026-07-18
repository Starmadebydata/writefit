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

    // 没有 AI 配置 → 返回模拟反馈
    if (!aiConfig || !aiConfig.apiKey) {
      const mockResult = mockSentenceSurgery(text, locale);
      return NextResponse.json({ ...mockResult, _mock: true });
    }

    // 有 AI 配置 → 调用真实 AI
    const result = await callAIJson<SentenceSurgeryFeedback>({
      config: aiConfig as AIConfig,
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

    return NextResponse.json(result);
  } catch (error) {
    console.error("Sentence surgery failed:", error);
    const message =
      error instanceof Error ? error.message : "Sentence surgery failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
