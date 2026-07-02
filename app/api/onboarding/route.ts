// ====================================================================
// Onboarding 写作画像设置 API
// ====================================================================
// 保存新用户在引导流程中填写的写作偏好
//
// GET  /api/onboarding  —— 查询当前用户是否已完成引导（是否有 profile）
// POST /api/onboarding  —— 保存写作画像（写作目标 + 主题 + 问题 + 训练时长）
//
// 数据写入两张表：
// - profiles：每日训练时长、偏好主题、写作问题（一个用户只有一条）
// - writing_goals：写作目标（一个用户可以有多条，保存前先清空旧的）
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { profiles, writingGoals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET：查询当前用户是否已完成 onboarding
// 返回 { completed: true } 表示已有 profile，前端可据此跳过引导
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 查询用户是否已有画像记录
    const [profile] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    return NextResponse.json({ completed: Boolean(profile) });
  } catch (error) {
    console.error("Get onboarding status failed:", error);
    return NextResponse.json(
      { error: "Failed to check onboarding status" },
      { status: 500 }
    );
  }
}

// POST：保存用户的写作画像
// 请求体：{ goals: string[], topics: string[], problems: string[], dailyPracticeMinutes: number }
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { goals, topics, problems, dailyPracticeMinutes } = body;

    // 验证必填字段：至少选一个目标、一个主题、一个问题，并选择训练时长
    if (!Array.isArray(goals) || goals.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one writing goal" },
        { status: 400 }
      );
    }
    if (!Array.isArray(topics) || topics.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one topic" },
        { status: 400 }
      );
    }
    if (!Array.isArray(problems) || problems.length === 0) {
      return NextResponse.json(
        { error: "Please select at least one writing problem" },
        { status: 400 }
      );
    }
    if (![10, 15, 30].includes(dailyPracticeMinutes)) {
      return NextResponse.json(
        { error: "Please select a valid practice duration" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const now = new Date();
    const profileId = crypto.randomUUID();

    // 先查是否已存在 profile（避免重复创建）
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    if (existing) {
      // 已有画像：更新现有记录
      await db
        .update(profiles)
        .set({
          dailyPracticeMinutes,
          preferredTopics: topics,
          writingProblems: problems,
          updatedAt: now,
        })
        .where(eq(profiles.id, existing.id));

      // 写作目标采用"全量替换"策略：先删旧目标，再插新目标
      await db.delete(writingGoals).where(eq(writingGoals.userId, session.user.id));
    } else {
      // 没有画像：新建一条
      await db.insert(profiles).values({
        id: profileId,
        userId: session.user.id,
        dailyPracticeMinutes,
        preferredTopics: topics,
        writingProblems: problems,
        updatedAt: now,
      });
    }

    // 批量插入写作目标（每个目标一条记录）
    if (goals.length > 0) {
      await db.insert(writingGoals).values(
        goals.map((goal: string) => ({
          id: crypto.randomUUID(),
          userId: session.user.id,
          goal,
          createdAt: now,
        }))
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Save onboarding failed:", error);
    return NextResponse.json(
      { error: "Failed to save onboarding" },
      { status: 500 }
    );
  }
}
