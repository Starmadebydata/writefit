// ====================================================================
// 草稿实验室 API —— 列表与新建
// ====================================================================
// 管理用户的长文草稿
//
// GET  /api/drafts            —— 获取草稿列表（支持状态过滤、搜索）
// POST /api/drafts            —— 新建一条草稿（同时创建第一个版本）
//
// 单条草稿操作（查看/编辑/删除/版本管理）在 /api/drafts/[id]/route.ts
//
// 草稿状态：idea / outline / drafting / revising / ready / published
// 数据存储在 D1 的 drafts 和 draft_versions 表
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { drafts, draftVersions } from "@/lib/db/schema";
import { eq, desc, and, sql } from "drizzle-orm";

// 合法的草稿状态
const VALID_STATUSES = [
  "idea",
  "outline",
  "drafting",
  "revising",
  "ready",
  "published",
] as const;

// GET：获取当前用户的草稿列表
// 查询参数：
// - status: 按状态过滤（可选）
// - q: 搜索关键词，匹配 title 或 topic（可选）
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    const url = new URL(req.url);
    const status = url.searchParams.get("status");
    const q = url.searchParams.get("q")?.trim();

    const conditions = [eq(drafts.userId, session.user.id)];
    if (status && (VALID_STATUSES as readonly string[]).includes(status)) {
      conditions.push(eq(drafts.status, status));
    }
    if (q) {
      const pattern = "%" + q + "%";
      conditions.push(
        sql`(${drafts.title} LIKE ${pattern} OR ${drafts.topic} LIKE ${pattern})`
      );
    }

    const result = await db
      .select()
      .from(drafts)
      .where(and(...conditions))
      .orderBy(desc(drafts.updatedAt));

    return NextResponse.json({ drafts: result });
  } catch (error) {
    console.error("Get drafts failed:", error);
    return NextResponse.json(
      { error: "Failed to get drafts" },
      { status: 500 }
    );
  }
}

// POST：新建一条草稿
// 请求体：{ title, topic?, content?, status? }
// 会同时创建第一个版本（version_number = 1）
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { title, topic = null, content = "", status = "idea" } = body;

    if (!title || typeof title !== "string" || title.trim().length < 1) {
      return NextResponse.json(
        { error: "Title cannot be empty" },
        { status: 400 }
      );
    }

    if (!(VALID_STATUSES as readonly string[]).includes(status)) {
      return NextResponse.json(
        { error: "Invalid status" },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const now = new Date();
    const draftId = crypto.randomUUID();
    const versionId = crypto.randomUUID();

    // 计算字数（中文按字符数，英文按单词数，这里简单用字符数）
    const wordCount = content.trim().length;

    // 创建草稿
    await db.insert(drafts).values({
      id: draftId,
      userId: session.user.id,
      title: title.trim(),
      topic: topic || null,
      status,
      currentVersionId: versionId,
      createdAt: now,
      updatedAt: now,
    });

    // 创建第一个版本
    await db.insert(draftVersions).values({
      id: versionId,
      draftId,
      content,
      versionNumber: 1,
      changeSummary: null,
      wordCount,
      createdAt: now,
    });

    return NextResponse.json({
      success: true,
      id: draftId,
      versionId,
    });
  } catch (error) {
    console.error("Create draft failed:", error);
    return NextResponse.json(
      { error: "Failed to create draft" },
      { status: 500 }
    );
  }
}
