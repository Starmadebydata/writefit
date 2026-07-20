// ====================================================================
// AI 设置 API 路由（当前为桩，P1 平台 Key 时实现服务端存储）
// ====================================================================
// 管理用户的 AI 服务配置
//
// GET  /api/ai-settings  —— 读取当前用户的 AI 设置
// POST /api/ai-settings  —— 保存 AI 设置
//
// 现状：设置只存在浏览器 localStorage，这个 API 不做持久化
// （GET 返回 notConfigured，POST/DELETE 直接返回成功）。
// ai_settings 表已存在但未被读写，等 P1 付费墙改造时再接。
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";

// GET：读取用户的 AI 设置
// 开发阶段返回空（前端会回退到 localStorage）
export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ notConfigured: true });
}

// POST：保存用户的 AI 设置
export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const body = await req.json();
    const { provider, apiBaseUrl, apiKey, model, temperature, maxTokens } = body;

    // 验证必填字段
    if (!apiBaseUrl) {
      return NextResponse.json({ error: "Please enter API URL" }, { status: 400 });
    }
    if (!apiKey) {
      return NextResponse.json({ error: "Please enter API Key" }, { status: 400 });
    }
    if (!model) {
      return NextResponse.json({ error: "Please select a model" }, { status: 400 });
    }

    // 开发阶段：直接返回成功（前端同时保存到 localStorage，服务端暂不落库）
    return NextResponse.json({
      success: true,
      provider,
      apiBaseUrl,
      model,
      temperature,
      maxTokens,
    });
  } catch (error) {
    console.error("Save AI settings failed:", error);
    return NextResponse.json({ error: "Save failed" }, { status: 500 });
  }
}

// DELETE：删除用户的 AI 设置
export async function DELETE() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json({ success: true });
}
