// ====================================================================
// 训练会话 API
// ====================================================================
// 保存和查询用户的写作训练记录
//
// POST  /api/practice/sessions —— 创建训练记录（诊断成功即落库，状态 in_progress）
// PATCH /api/practice/sessions —— 更新训练记录（提交修改稿后补全 revisedText/对比结果）
// GET   /api/practice/sessions —— 获取用户的训练历史
//
// 保存成功后返回最新的连续训练天数（streak），
// 供完成页即时展示"连续训练 X 天"。
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { practiceSessions, aiFeedbacks } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

// 保存 AI 反馈（诊断/对比）到 ai_feedbacks 表
// 同一条训练记录只保留一行反馈，多次写入时合并更新
async function upsertFeedback(
  db: ReturnType<typeof drizzle>,
  userId: string,
  sessionId: string,
  feedback: unknown,
  comparison: unknown
) {
  const existing = await db
    .select({ id: aiFeedbacks.id, feedbackJson: aiFeedbacks.feedbackJson })
    .from(aiFeedbacks)
    .where(eq(aiFeedbacks.practiceSessionId, sessionId))
    .limit(1);

  const previous =
    existing[0] && typeof existing[0].feedbackJson === "object" && existing[0].feedbackJson !== null
      ? (existing[0].feedbackJson as Record<string, unknown>)
      : {};
  const merged: Record<string, unknown> = { ...previous };
  if (feedback) merged.diagnose = feedback;
  if (comparison) merged.comparison = comparison;

  if (existing[0]) {
    await db
      .update(aiFeedbacks)
      .set({ feedbackJson: merged })
      .where(eq(aiFeedbacks.id, existing[0].id));
  } else {
    await db.insert(aiFeedbacks).values({
      id: crypto.randomUUID(),
      userId,
      targetType: "practice_session",
      targetId: sessionId,
      practiceSessionId: sessionId,
      feedbackJson: merged,
      createdAt: new Date(),
    });
  }
}

// 计算用户当前的连续训练天数（昨天练过、今天还没练时 streak 仍保留）
async function computeStreak(
  db: ReturnType<typeof drizzle>,
  userId: string
): Promise<number> {
  const rows = await db
    .select({ date: sql<string>`date(${practiceSessions.createdAt} / 1000, 'unixepoch')` })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, userId))
    .groupBy(sql`date(${practiceSessions.createdAt} / 1000, 'unixepoch')`)
    .orderBy(desc(sql`date(${practiceSessions.createdAt} / 1000, 'unixepoch')`))
    .limit(60);

  const dateList = rows.map((r) => r.date);
  const now = new Date();
  const today = now.toISOString().split("T")[0];
  const yesterday = new Date(now.getTime() - 86400000).toISOString().split("T")[0];

  if (!dateList.includes(today) && !dateList.includes(yesterday)) return 0;

  let streak = 0;
  let checkDate = dateList.includes(today) ? today : yesterday;
  while (dateList.includes(checkDate)) {
    streak++;
    const d = new Date(checkDate);
    d.setDate(d.getDate() - 1);
    checkDate = d.toISOString().split("T")[0];
  }
  return streak;
}

// POST：创建一次训练记录
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
      status,          // in_progress / completed，默认 completed（向后兼容）
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
    const isCompleted = status !== "in_progress";

    await db.insert(practiceSessions).values({
      id: sessionId,
      userId: session.user.id,
      practiceType,
      prompt,
      rawText,
      revisedText: revisedText || null,
      wordCount: wordCount || 0,
      durationSeconds: durationSeconds || null,
      status: isCompleted ? "completed" : "in_progress",
      completedAt: isCompleted ? now : null,
      createdAt: now,
      updatedAt: now,
    });

    // 如果有 AI 反馈，也保存下来
    if (feedback || comparison) {
      await upsertFeedback(db, session.user.id, sessionId, feedback, comparison);
    }

    const streak = await computeStreak(db, session.user.id);

    return NextResponse.json({
      success: true,
      sessionId,
      streak,
    });
  } catch (error) {
    console.error("Save practice session failed:", error);
    return NextResponse.json(
      { error: "Failed to save practice session" },
      { status: 500 }
    );
  }
}

// PATCH：更新已有训练记录（提交修改稿后调用）
export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const {
      sessionId,
      revisedText,
      wordCount,
      durationSeconds,
      feedback,
      comparison,
      markCompleted,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "Missing sessionId" }, { status: 400 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 只能更新自己的记录
    const [existing] = await db
      .select({ id: practiceSessions.id })
      .from(practiceSessions)
      .where(
        and(
          eq(practiceSessions.id, sessionId),
          eq(practiceSessions.userId, session.user.id)
        )
      )
      .limit(1);
    if (!existing) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    const now = new Date();
    await db
      .update(practiceSessions)
      .set({
        ...(revisedText !== undefined ? { revisedText } : {}),
        ...(wordCount !== undefined ? { wordCount } : {}),
        ...(durationSeconds !== undefined ? { durationSeconds } : {}),
        ...(markCompleted ? { status: "completed", completedAt: now } : {}),
        updatedAt: now,
      })
      .where(eq(practiceSessions.id, sessionId));

    if (feedback || comparison) {
      await upsertFeedback(db, session.user.id, sessionId, feedback, comparison);
    }

    const streak = await computeStreak(db, session.user.id);

    return NextResponse.json({ success: true, sessionId, streak });
  } catch (error) {
    console.error("Update practice session failed:", error);
    return NextResponse.json(
      { error: "Failed to update practice session" },
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
