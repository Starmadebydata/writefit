// ====================================================================
// AI 诊断 API
// ====================================================================
// 接收用户写的原始稿 + 用户的 AI 配置，返回 AI 诊断反馈
//
// 工作模式：
// - 如果请求中带了用户的 AI 配置（api_key 等），用用户配置调用真实 AI
// - 如果没有 AI 配置，返回模拟反馈（开发测试用）
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { getSystemRules, getDiagnosePrompt, type Locale } from "@/lib/ai/prompts";
import { mockDiagnose } from "@/lib/ai/mock";
import type { DiagnoseFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const { text, language = "en", aiConfig } = await req.json();

    // 确定语言
    const locale: Locale = language === "zh" ? "zh" : "en";

    // 验证输入
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: locale === "zh" ? "文本太短，至少需要 10 个字符才能诊断" : "Text too short, at least 10 characters required for diagnosis" },
        { status: 400 }
      );
    }

    // 检查是否有用户提供的 AI 配置
    if (!aiConfig || !aiConfig.apiKey) {
      // 没有配置 AI，返回模拟反馈
      const mockResult = mockDiagnose(text, locale);
      return NextResponse.json({
        ...mockResult,
        _mock: true,
      });
    }

    // 有 AI 配置，调用真实 AI
    const result = await callAIJson<DiagnoseFeedback>({
      config: aiConfig as AIConfig,
      systemPrompt: `${getSystemRules(locale)}\n\n${getDiagnosePrompt(locale)}`,
      messages: [
        {
          role: "user",
          content: locale === "zh"
            ? `请分析以下中文写作：\n\n${text}`
            : `Please analyze the following English writing:\n\n${text}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
      jsonMode: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI diagnosis failed:", error);
    const message = error instanceof Error ? error.message : "AI diagnosis failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
