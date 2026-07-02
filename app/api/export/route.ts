// ====================================================================
// 数据导出 API
// ====================================================================
// 导出当前用户的所有数据为 JSON 文件
//
// GET /api/export  —— 返回包含用户所有数据的 JSON
//   包含：用户信息、画像、写作目标、训练记录、草稿+版本、素材、AI反馈
// ====================================================================

import { NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import {
  users,
  profiles,
  writingGoals,
  practiceSessions,
  drafts,
  draftVersions,
  ideas,
  aiFeedbacks,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const userId = session.user.id;

    // 查询用户所有数据
    const [user] = await db.select().from(users).where(eq(users.id, userId)).limit(1);
    const [profile] = await db.select().from(profiles).where(eq(profiles.userId, userId)).limit(1);
    const goals = await db.select().from(writingGoals).where(eq(writingGoals.userId, userId));
    const sessions = await db.select().from(practiceSessions).where(eq(practiceSessions.userId, userId));
    const userDrafts = await db.select().from(drafts).where(eq(drafts.userId, userId));
    const userIdeas = await db.select().from(ideas).where(eq(ideas.userId, userId));
    const feedbacks = await db.select().from(aiFeedbacks).where(eq(aiFeedbacks.userId, userId));

    // 查询草稿版本
    const draftIds = userDrafts.map((d) => d.id);
    let versions: typeof draftVersions.$inferSelect[] = [];
    if (draftIds.length > 0) {
      // 逐个查询版本（D1 不支持 IN 大数组，但这里数量可控）
      for (const draftId of draftIds) {
        const v = await db.select().from(draftVersions).where(eq(draftVersions.draftId, draftId));
        versions = versions.concat(v);
      }
    }

    // 组装导出数据（移除敏感字段）
    const exportData = {
      exportedAt: new Date().toISOString(),
      user: user
        ? {
            id: user.id,
            name: user.name,
            email: user.email,
            createdAt: user.createdAt,
          }
        : null,
      profile,
      writingGoals: goals,
      practiceSessions: sessions,
      drafts: userDrafts,
      draftVersions: versions,
      ideas: userIdeas,
      aiFeedbacks: feedbacks,
    };

    const json = JSON.stringify(exportData, null, 2);

    return new NextResponse(json, {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": 'attachment; filename="writefit-data-export.json"',
      },
    });
  } catch (error) {
    console.error("Export data failed:", error);
    return NextResponse.json(
      { error: "Failed to export data" },
      { status: 500 }
    );
  }
}
