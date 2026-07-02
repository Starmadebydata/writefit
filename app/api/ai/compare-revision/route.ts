// ====================================================================
// 版本对比 API
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { getSystemRules, getCompareRevisionPrompt, type Locale } from "@/lib/ai/prompts";
import { mockCompareRevision } from "@/lib/ai/mock";
import type { CompareRevisionFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const { original, revised, language = "en", aiConfig } = await req.json();

    // 确定语言
    const locale: Locale = language === "zh" ? "zh" : "en";

    if (!original || !revised) {
      return NextResponse.json(
        { error: locale === "zh" ? "需要提供原稿和修改稿" : "Both original and revised texts are required" },
        { status: 400 }
      );
    }

    if (!aiConfig || !aiConfig.apiKey) {
      const mockResult = mockCompareRevision(original, revised, locale);
      return NextResponse.json({ ...mockResult, _mock: true });
    }

    const result = await callAIJson<CompareRevisionFeedback>({
      config: aiConfig as AIConfig,
      systemPrompt: `${getSystemRules(locale)}\n\n${getCompareRevisionPrompt(locale)}`,
      messages: [
        {
          role: "user",
          content: locale === "zh"
            ? `原稿：\n${original}\n\n修改稿：\n${revised}\n\n请对比评价修改效果。`
            : `Original:\n${original}\n\nRevised:\n${revised}\n\nPlease compare and evaluate the revision.`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Revision comparison failed:", error);
    const message = error instanceof Error ? error.message : "Comparison failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
