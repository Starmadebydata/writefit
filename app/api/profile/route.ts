// ====================================================================
// 用户画像 API
// ====================================================================
// 管理用户的写作画像（在 Onboarding 中设置的，可在 Settings 中修改）
//
// GET  /api/profile   —— 获取当前用户的画像
// PUT  /api/profile   —— 更新画像（写作目标/主题/问题/训练时长/禁用词）
//
// 数据存储在 profiles 表和 writing_goals 表
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { profiles, writingGoals, users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// GET：获取用户画像 + 写作目标
export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    const [profile] = await db
      .select()
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    const goals = await db
      .select()
      .from(writingGoals)
      .where(eq(writingGoals.userId, session.user.id));

    return NextResponse.json({ profile: profile || null, goals });
  } catch (error) {
    console.error("Get profile failed:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
      { status: 500 }
    );
  }
}

// PUT：更新用户画像
// 请求体：{ goals?, topics?, problems?, dailyPracticeMinutes?, bannedPhrases? }
export async function PUT(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { goals, topics, problems, dailyPracticeMinutes, bannedPhrases } = body;

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const now = new Date();

    // 查询是否已有画像
    const [existing] = await db
      .select({ id: profiles.id })
      .from(profiles)
      .where(eq(profiles.userId, session.user.id))
      .limit(1);

    // 构造更新字段
    const updates: Record<string, unknown> = { updatedAt: now };
    if (Array.isArray(topics)) updates.preferredTopics = topics;
    if (Array.isArray(problems)) updates.writingProblems = problems;
    if (Array.isArray(bannedPhrases)) updates.bannedPhrases = bannedPhrases;
    if (typeof dailyPracticeMinutes === "number" && [10, 15, 30].includes(dailyPracticeMinutes)) {
      updates.dailyPracticeMinutes = dailyPracticeMinutes;
    }

    if (existing) {
      // 更新现有画像
      await db
        .update(profiles)
        .set(updates)
        .where(eq(profiles.id, existing.id));
    } else {
      // 没有画像则新建（用默认值填充未提供的字段）
      await db.insert(profiles).values({
        id: crypto.randomUUID(),
        userId: session.user.id,
        dailyPracticeMinutes: typeof dailyPracticeMinutes === "number" ? dailyPracticeMinutes : 10,
        preferredTopics: Array.isArray(topics) ? topics : [],
        writingProblems: Array.isArray(problems) ? problems : [],
        bannedPhrases: Array.isArray(bannedPhrases) ? bannedPhrases : [],
        updatedAt: now,
      });
    }

    // 如果提供了 goals，全量替换写作目标
    if (Array.isArray(goals)) {
      await db.delete(writingGoals).where(eq(writingGoals.userId, session.user.id));
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
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update profile failed:", error);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}

// DELETE：删除用户账号及所有数据
// 这会级联删除 profiles、writing_goals、practice_sessions、drafts、ideas、ai_settings 等
export async function DELETE() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 删除用户记录（所有关联表通过 onDelete: cascade 自动删除）
    await db.delete(users).where(eq(users.id, session.user.id));

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete account failed:", error);
    return NextResponse.json(
      { error: "Failed to delete account" },
      { status: 500 }
    );
  }
}
