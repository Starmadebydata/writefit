// ====================================================================
// 素材保存 API
// ====================================================================
// 保存好句、标题、观点等素材到素材库
// 开发阶段：保存到本地 JSON 文件（不需要数据库）
// 生产环境：保存到 Cloudflare D1 数据库
// ====================================================================

import { NextRequest, NextResponse } from "next/server";

// 素材类型
const VALID_TYPES = [
  "observation", // 观察
  "sentence",    // 句子
  "title",       // 标题
  "claim",       // 判断
  "example",     // 例子
  "quote",       // 引用
  "structure",   // 结构
];

export async function POST(req: NextRequest) {
  try {
    const { type, content, tags = [] } = await req.json();

    // 验证
    if (!content || typeof content !== "string" || content.trim().length < 2) {
      return NextResponse.json(
        { error: "素材内容不能为空" },
        { status: 400 }
      );
    }

    if (!VALID_TYPES.includes(type)) {
      return NextResponse.json(
        { error: `素材类型必须是: ${VALID_TYPES.join(", ")}` },
        { status: 400 }
      );
    }

    // 开发阶段：直接返回成功（生产环境会保存到数据库）
    // 等数据库配置好后，这里会接入真实的数据库存储
    return NextResponse.json({
      success: true,
      id: crypto.randomUUID(),
      type,
      content: content.trim(),
      tags,
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("保存素材失败:", error);
    return NextResponse.json(
      { error: "保存失败，请稍后重试" },
      { status: 500 }
    );
  }
}

// 获取素材列表（开发阶段返回空数组）
export async function GET() {
  return NextResponse.json({ ideas: [] });
}
