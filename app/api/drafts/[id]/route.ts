// ====================================================================
// 草稿实验室 API —— 单条草稿操作
// ====================================================================
// GET    /api/drafts/[id]              —— 获取草稿详情 + 当前版本内容
// PATCH  /api/drafts/[id]              —— 编辑草稿元信息（title/topic/status）
//                                         当 content 变化时自动创建新版本
// DELETE /api/drafts/[id]              —— 删除草稿（级联删除所有版本）
// GET    /api/drafts/[id]/versions     —— 获取版本历史
// POST   /api/drafts/[id]/versions     —— 手动保存一个新版本
// GET    /api/drafts/[id]/export       —— 导出 Markdown
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { auth } from "@/lib/auth/auth";
import { drafts, draftVersions } from "@/lib/db/schema";
import { eq, and, desc, max } from "drizzle-orm";

const VALID_STATUSES = [
  "idea",
  "outline",
  "drafting",
  "revising",
  "ready",
  "published",
] as const;

// GET：获取草稿详情 + 当前版本内容
export async function GET(
  req: NextRequest,
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

    // 查询草稿（校验归属）
    const [draft] = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, id), eq(drafts.userId, session.user.id)))
      .limit(1);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    // 查询当前版本内容
    let currentVersion = null;
    if (draft.currentVersionId) {
      const [v] = await db
        .select()
        .from(draftVersions)
        .where(eq(draftVersions.id, draft.currentVersionId))
        .limit(1);
      currentVersion = v || null;
    }

    // 检查是否请求导出 Markdown
    const url = new URL(req.url);
    if (url.searchParams.get("export") === "markdown") {
      const content = currentVersion?.content || "";
      const markdown = "# " + draft.title + "\n\n" + content;
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown; charset=utf-8",
          "Content-Disposition":
            'attachment; filename="' +
            draft.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "_") +
            '.md"',
        },
      });
    }

    // 检查是否请求版本历史
    if (url.searchParams.get("versions") === "true") {
      const versions = await db
        .select()
        .from(draftVersions)
        .where(eq(draftVersions.draftId, id))
        .orderBy(desc(draftVersions.versionNumber));
      return NextResponse.json({ draft, versions });
    }

    return NextResponse.json({ draft, currentVersion });
  } catch (error) {
    console.error("Get draft failed:", error);
    return NextResponse.json(
      { error: "Failed to get draft" },
      { status: 500 }
    );
  }
}

// PATCH：编辑草稿
// 请求体：{ title?, topic?, status?, content?, changeSummary? }
// 当 content 提供且与当前版本不同时，自动创建新版本
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
    const { title, topic, status, content, changeSummary } = body;

    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 查询草稿（校验归属）
    const [draft] = await db
      .select()
      .from(drafts)
      .where(and(eq(drafts.id, id), eq(drafts.userId, session.user.id)))
      .limit(1);

    if (!draft) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    const now = new Date();
    const updates: Record<string, unknown> = { updatedAt: now };
    if (title !== undefined) {
      if (typeof title !== "string" || title.trim().length < 1) {
        return NextResponse.json(
          { error: "Title cannot be empty" },
          { status: 400 }
        );
      }
      updates.title = title.trim();
    }
    if (topic !== undefined) updates.topic = topic || null;
    if (status !== undefined) {
      if (!(VALID_STATUSES as readonly string[]).includes(status)) {
        return NextResponse.json(
          { error: "Invalid status" },
          { status: 400 }
        );
      }
      updates.status = status;
    }

    // 如果提供了 content，创建新版本
    let newVersionId = draft.currentVersionId;
    if (typeof content === "string") {
      // 查询当前版本内容，判断是否有变化
      let oldContent = "";
      if (draft.currentVersionId) {
        const [v] = await db
          .select()
          .from(draftVersions)
          .where(eq(draftVersions.id, draft.currentVersionId))
          .limit(1);
        oldContent = v?.content || "";
      }

      if (content !== oldContent) {
        // 查询最大版本号
        const [maxResult] = await db
          .select({ maxVer: max(draftVersions.versionNumber) })
          .from(draftVersions)
          .where(eq(draftVersions.draftId, id));
        const nextVersion = (maxResult?.maxVer || 0) + 1;
        newVersionId = crypto.randomUUID();
        const wordCount = content.trim().length;

        await db.insert(draftVersions).values({
          id: newVersionId,
          draftId: id,
          content,
          versionNumber: nextVersion,
          changeSummary: changeSummary || null,
          wordCount,
          createdAt: now,
        });

        updates.currentVersionId = newVersionId;
      }
    }

    // 更新草稿
    await db
      .update(drafts)
      .set(updates)
      .where(eq(drafts.id, id));

    return NextResponse.json({ success: true, versionId: newVersionId });
  } catch (error) {
    console.error("Update draft failed:", error);
    return NextResponse.json(
      { error: "Failed to update draft" },
      { status: 500 }
    );
  }
}

// DELETE：删除草稿（级联删除所有版本）
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

    // 删除草稿（draft_versions 通过 onDelete: cascade 自动删除）
    const result = await db
      .delete(drafts)
      .where(and(eq(drafts.id, id), eq(drafts.userId, session.user.id)));

    const meta = (result as unknown as { meta?: { changes?: number } }).meta;
    if (meta && typeof meta.changes === "number" && meta.changes === 0) {
      return NextResponse.json({ error: "Draft not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Delete draft failed:", error);
    return NextResponse.json(
      { error: "Failed to delete draft" },
      { status: 500 }
    );
  }
}
