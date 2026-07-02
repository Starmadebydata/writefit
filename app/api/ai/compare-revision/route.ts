// ====================================================================
// 版本对比 API
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { callAIJson, type AIConfig } from "@/lib/ai/client";
import { SYSTEM_RULES, COMPARE_REVISION_PROMPT } from "@/lib/ai/prompts";
import { mockCompareRevision } from "@/lib/ai/mock";
import type { CompareRevisionFeedback } from "@/lib/ai/schemas";

export async function POST(req: NextRequest) {
  try {
    const { original, revised, aiConfig } = await req.json();

    if (!original || !revised) {
      return NextResponse.json(
        { error: "需要提供原稿和修改稿" },
        { status: 400 }
      );
    }

    if (!aiConfig || !aiConfig.apiKey) {
      const mockResult = mockCompareRevision(original, revised);
      return NextResponse.json({ ...mockResult, _mock: true });
    }

    const result = await callAIJson<CompareRevisionFeedback>({
      config: aiConfig as AIConfig,
      systemPrompt: `${SYSTEM_RULES}\n\n${COMPARE_REVISION_PROMPT}`,
      messages: [
        {
          role: "user",
          content: `原稿：\n${original}\n\n修改稿：\n${revised}\n\n请对比评价修改效果。`,
        },
      ],
      temperature: 0.3,
      maxTokens: 1500,
      jsonMode: true,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("版本对比失败:", error);
    const message = error instanceof Error ? error.message : "对比失败";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
