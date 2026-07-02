// ====================================================================
// AI 设置 API 路由
// ====================================================================
// 管理用户的 AI 服务配置
//
// GET  /api/ai-settings  —— 读取当前用户的 AI 设置
// POST /api/ai-settings  —— 保存 AI 设置
//
// 开发阶段：设置存在浏览器 localStorage，这个 API 返回空
// 生产环境：设置加密存储在 D1 数据库的 ai_settings 表
// ====================================================================

import { NextRequest, NextResponse } from "next/server";

// GET：读取用户的 AI 设置
// 开发阶段返回空（前端会回退到 localStorage）
export async function GET() {
  // TODO: 生产环境从数据库读取
  // const session = await auth();
  // if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  // const db = getDb();
  // const [setting] = await db.select().from(aiSettings).where(eq(aiSettings.userId, session.user.id));
  // if (!setting) return NextResponse.json({ ... null settings ... });
  // return NextResponse.json({ ...setting, apiKey: decrypt(setting.apiKey) });

  return NextResponse.json({ notConfigured: true });
}

// POST：保存用户的 AI 设置
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { provider, apiBaseUrl, apiKey, model, temperature, maxTokens } = body;

    // 验证必填字段
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "请填写 API 地址" }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: "请填写 API Key" }, { status: 400 });
    }
    if (!model) {
      return NextResponse.json({ error: "请选择模型" }, { status: 400 });
    }

    // TODO: 生产环境保存到数据库
    // const session = await auth();
    // if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
    // const db = getDb();
    // await db.insert(aiSettings).values({
    //   id: crypto.randomUUID(),
    //   userId: session.user.id,
    //   provider,
    //   apiBaseUrl,
    //   apiKey: encrypt(apiKey),
    //   model,
    //   temperature: Math.round(temperature * 10),
    //   maxTokens,
    // }).onConflictDoUpdate({
    //   target: aiSettings.userId,
    //   set: { provider, apiBaseUrl, apiKey: encrypt(apiKey), model, temperature: Math.round(temperature * 10), maxTokens, updatedAt: new Date() },
    // });

    // 开发阶段：直接返回成功（前端会同时保存到 localStorage）
    return NextResponse.json({
      success: true,
      provider,
      apiBaseUrl,
      model,
      temperature,
      maxTokens,
      // 不返回 apiKey，安全考虑
    });
  } catch (error) {
    console.error("保存 AI 设置失败:", error);
    return NextResponse.json({ error: "保存失败" }, { status: 500 });
  }
}

// DELETE：删除用户的 AI 设置
export async function DELETE() {
  // TODO: 生产环境从数据库删除
  // const session = await auth();
  // if (!session?.user?.id) return NextResponse.json({ error: "未登录" }, { status: 401 });
  // const db = getDb();
  // await db.delete(aiSettings).where(eq(aiSettings.userId, session.user.id));

  return NextResponse.json({ success: true });
}
