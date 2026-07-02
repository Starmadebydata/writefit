// ====================================================================
// 素材库 API —— 单条操作
// ====================================================================
// 对单条素材进行编辑、删除、收藏切换
//
// PATCH /api/ideas/[id]  —— 编辑素材内容/类型/标签，或切换收藏
// DELETE /api/ideas/[id] —— 删除一条素材
//
// 请求体（PATCH）：
//   - 编辑内容：{ content?, type?, tags? }
//   - 切换收藏：{ isFavorite: boolean }
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { ideas } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const VALID_TYPES = [
  "observation",
  "sentence",
  "title",
  "claim",
  "example",
  "quote",
  "structure",
] as const;

// PATCH：编辑素材或切换收藏
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, type, tags, isFavorite } = body;

    // 至少要有一个可更新字段
    if (content === undefined && type === undefined && tags === undefined && isFavorite === undefined) {
      return NextResponse.json(
        { error: "Nothing to update" },
        { status: 400 }
      );
    }

    // 验证字段
    if (content !== undefined && (typeof content !== "string" || content.trim().length < 2)) {
      return NextResponse.json(
        { error: "Content cannot be empty" },
        { status: 400 }
      );
    }
    if (type !== undefined && !(VALID_TYPES as readonly string[]).includes(type)) {
      return NextResponse.json(
        { error: "Type must be one of: " + VALID_TYPES.join(", ") },
        { status: 400 }
      );
    }

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 构造更新对象（只更新提供的字段）
    const updates: Record<string, unknown> = { updatedAt: new Date() };
    if (content !== undefined) updates.content = content.trim();
    if (type !== undefined) updates.type = type;
    if (tags !== undefined) updates.tags = Array.isArray(tags) ? tags : [];
    if (isFavorite !== undefined) updates.isFavorite = Boolean(isFavorite);

    // 更新数据库（同时校验素材属于当前用户，防止越权）
    const result = await db
      .update(ideas)
      .set(updates)
      .where(and(eq(ideas.id, id), eq(ideas.userId, session.user.id)));

    // D1 的 update 不返回行数，用 RETURNING 不可靠，这里通过 affected rows 判断
    // 如果没有匹配的行，meta.changes 应为 0
    const meta = (result as unknown as { meta?: { changes?: number } }).meta;
    if (meta && typeof meta.changes === "number" && meta.changes === 0) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update idea failed:", error);
    return NextResponse.json(
      { error: "Update failed, please try again" },
      { status: 500 }
    );
  }
}

// DELETE：删除一条素材
export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const { id } = await params;
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 删除（同时校验归属，防止越权删除别人的素材）
    const result = await db
      .delete(ideas)
      .where(and(eq(ideas.id, id), eq(ideas.userId, session.user.id)));

    const meta = (result as unknown as { meta?: { changes?: number } }).meta;
    if (meta && typeof meta.changes === "number" && meta.changes === 0) {
      return NextResponse.json(
        { error: "Idea not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete idea failed:", error);
    return NextResponse.json(
      { error: "Delete failed, please try again" },
      { status: 500 }
    );
  }
}
