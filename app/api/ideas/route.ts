// ====================================================================
// 素材库 API —— 列表与新建
// ====================================================================
// 管理用户保存的可复用写作素材
//
// GET  /api/ideas            —— 获取素材列表（支持类型过滤、搜索、收藏过滤）
// POST /api/ideas            —— 新建一条素材
//
// 单条操作（编辑/删除/收藏切换）在 /api/ideas/[id]/route.ts
//
// 素材类型：observation / sentence / title / claim / example / quote / structure
// 数据存储在 D1 的 ideas 表
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { ideas } from "@/lib/db/schema";
import { eq, desc, sql, and } from "drizzle-orm";

// 合法的素材类型
const VALID_TYPES = [
  "observation",
  "sentence",
  "title",
  "claim",
  "example",
  "quote",
  "structure",
] as const;

// GET：获取当前用户的素材列表
// 查询参数：
// - type: 按类型过滤（可选）
// - q: 搜索关键词，匹配 content（可选）
// - favorite: "true" 时只返回收藏的素材（可选）
// - limit / offset: 分页（默认 100 / 0）
export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    const url = new URL(req.url);
    const type = url.searchParams.get("type");
    const q = url.searchParams.get("q")?.trim();
    const favoriteOnly = url.searchParams.get("favorite") === "true";
    const limit = Math.min(parseInt(url.searchParams.get("limit") || "100"), 200);
    const offset = parseInt(url.searchParams.get("offset") || "0");

    // 组合查询条件
    const conditions = [eq(ideas.userId, session.user.id)];
    if (type && (VALID_TYPES as readonly string[]).includes(type)) {
      conditions.push(eq(ideas.type, type));
    }
    if (q) {
      // SQLite 的 LIKE 搜索 content 字段
      const pattern = "%" + q + "%";
      conditions.push(sql`${ideas.content} LIKE ${pattern}`);
    }
    if (favoriteOnly) {
      conditions.push(eq(ideas.isFavorite, true));
    }

    const result = await db
      .select()
      .from(ideas)
      .where(and(...conditions))
      .orderBy(desc(ideas.createdAt))
      .limit(limit)
      .offset(offset);

    return NextResponse.json({ ideas: result });
  } catch (error) {
    console.error("Get ideas failed:", error);
    return NextResponse.json(
      { error: "Failed to get ideas" },
      { status: 500 }
    );
  }
}

// POST：新建一条素材
// 请求体：{ type, content, tags?: string[], isFavorite?: boolean }
export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { type, content, tags = [], isFavorite = false } = body;

    // 验证 content
    if (!content || typeof content !== "string" || content.trim().length < 2) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }

    // 验证 type
    if (!(VALID_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json(
        { error: "Type must be one of: " + VALID_TYPES.join(", ") },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const id = crypto.randomUUID();
    const now = new Date();

    await db.insert(ideas).values({
      id,
      userId: session.user.id,
      type,
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      isFavorite: Boolean(isFavorite),
      createdAt: now,
      updatedAt: now,
    });

    return NextResponse.json({
      success: true,
      id,
      type,
      content: content.trim(),
      tags: Array.isArray(tags) ? tags : [],
      isFavorite: Boolean(isFavorite),
      createdAt: now.toISOString(),
    });
  } catch (error) {
    console.error("Save idea failed:", error);
    return NextResponse.json(
      { error: "Save failed, please try again" },
      { status: 500 }
    );
  }
}
