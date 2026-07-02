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
import { SYSTEM_RULES, DIAGNOSE_PROMPT } from "@/lib/ai/prompts";
import { mockDiagnose } from "@/lib/ai/mock";
import type { DiagnoseFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const { text, language = "zh", aiConfig } = await req.json();

    // 验证输入
    if (!text || typeof text !== "string" || text.trim().length < 10) {
      return NextResponse.json(
        { error: "文本太短，至少需要 10 个字符才能诊断" },
        { status: 400 }
      );
    }

    // 检查是否有用户提供的 AI 配置
    if (!aiConfig || !aiConfig.apiKey) {
      // 没有配置 AI，返回模拟反馈
      const mockResult = mockDiagnose(text);
      return NextResponse.json({
        ...mockResult,
        _mock: true,
      });
    }

    // 有 AI 配置，调用真实 AI
    const result = await callAIJson<DiagnoseFeedback>({
      config: aiConfig as AIConfig,
      systemPrompt: `${SYSTEM_RULES}\n\n${DIAGNOSE_PROMPT}`,
      messages: [
        {
          role: "user",
          content: `请分析以下${language === "zh" ? "中文" : "英文"}写作：\n\n${text}`,
        },
      ],
      temperature: 0.3,
      maxTokens: 2000,
      jsonMode: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("AI 诊断失败:", error);
    const message = error instanceof Error ? error.message : "AI 诊断失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
