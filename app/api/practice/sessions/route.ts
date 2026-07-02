// ====================================================================
// 训练会话 API
// ====================================================================
// 保存和查询用户的写作训练记录
//
// POST /api/practice/sessions  —— 保存一次训练记录
// GET  /api/practice/sessions  —— 获取用户的训练历史
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { practiceSessions, aiFeedbacks } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

// POST：保存一次训练记录
export async function POST(req: NextRequest) {
  try {
    // 检查登录状态
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      practiceType,
      prompt,
      rawText,
      revisedText,
      wordCount,
      durationSeconds,
      feedback,        // AI 诊断反馈（可选）
      comparison,      // AI 修改对比（可选）
    } = body;

    // 验证必填字段
    if (!practiceType || !prompt || !rawText) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 创建训练记录
    const sessionId = crypto.randomUUID();
    const now = new Date();

    await db.insert(practiceSessions).values({
      id: sessionId,
      userId: session.user.id,
      practiceType,
      prompt,
      rawText,
      revisedText: revisedText || null,
      wordCount: wordCount || 0,
      durationSeconds: durationSeconds || null,
      status: "completed",
      completedAt: now,
      createdAt: now,
      updatedAt: now,
    });

    // 如果有 AI 反馈，也保存下来
    if (feedback || comparison) {
      const feedbackId = crypto.randomUUID();
      const feedbackData: Record<string, unknown> = {};
      if (feedback) feedbackData.diagnose = feedback;
      if (comparison) feedbackData.comparison = comparison;

      await db.insert(aiFeedbacks).values({
        id: feedbackId,
        userId: session.user.id,
        targetType: "practice_session",
        targetId: sessionId,
        practiceSessionId: sessionId,
        feedbackJson: feedbackData,
        createdAt: now,
      });
    }

    return NextResponse.json({
      success: true,
      sessionId,
    });
  } catch (error) {
    console.error("Save practice session failed:", error);
    return NextResponse.json(
      { error: "Failed to save practice session" },
      { status: 500 }
    );
  }
}

// GET：获取用户的训练历史
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 从 URL 参数获取分页信息
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get("limit") || "20");
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // 查询用户的训练记录，按时间倒序
    const sessions = await db
      .select()
      .from(practiceSessions)
      .where(eq(practiceSessions.userId, session.user.id))
      .orderBy(desc(practiceSessions.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ sessions });
  } catch (error) {
    console.error("Get practice sessions failed:", error);
    return NextResponse.json(
      { error: "Failed to get practice sessions" },
      { status: 500 }
    );
  }
}
