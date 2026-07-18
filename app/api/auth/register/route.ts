// ====================================================================
// 用户注册 API
// ====================================================================
// 接收邮箱和密码，创建新用户
// 密码用 bcrypt 哈希后存储，不存明文
// 支持中英文错误消息（通过 locale 参数切换）
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { users } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import bcrypt from "bcryptjs";
import { sendWelcomeEmail } from "@/lib/email";

// 中英文错误消息
const messages = {
  en: {
    fillAll: "Please fill in email and password",
    emailFormat: "Invalid email format",
    passwordShort: "Password must be at least 6 characters",
    emailExists: "This email is already registered, please log in",
    success: "Registration successful, please log in",
    error: "Registration failed, please try again",
  },
  zh: {
    fillAll: "请填写邮箱和密码",
    emailFormat: "邮箱格式不正确",
    passwordShort: "密码至少 6 个字符",
    emailExists: "该邮箱已注册，请直接登录",
    success: "注册成功，请登录",
    error: "注册失败，请稍后重试",
  },
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password, name, locale = "en" } = body;

    // 选择语言
    const msg = messages[locale === "zh" ? "zh" : "en"];

    // 验证输入
    if (!email || !password) {
      return NextResponse.json(
        { error: msg.fillAll },
        { status: 400 }
      );
    }

    // 验证邮箱格式
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: msg.emailFormat },
        { status: 400 }
      );
    }

    // 验证密码长度
    if (password.length < 6) {
      return NextResponse.json(
        { error: msg.passwordShort },
        { status: 400 }
      );
    }

    // 获取数据库连接
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);

    // 检查邮箱是否已注册
    const [existingUser] = await db
      .select()
      .from(users)
      .where(eq(users.email, email));

    if (existingUser) {
      return NextResponse.json(
        { error: msg.emailExists },
        { status: 409 }
      );
    }

    // 哈希密码（bcrypt 加盐哈希，10 轮）
    const passwordHash = await bcrypt.hash(password, 10);

    // 创建用户
    const id = crypto.randomUUID();
    await db.insert(users).values({
      id,
      name: name || email.split("@")[0],
      email,
      passwordHash,
    });

    // 发送欢迎邮件（后台进行，失败不影响注册；未配置 RESEND_API_KEY 时静默跳过）
    const welcomeEmail = sendWelcomeEmail(email, name, locale === "zh" ? "zh" : "en");
    try {
      const { ctx } = getCloudflareContext();
      if (ctx?.waitUntil) {
        ctx.waitUntil(welcomeEmail);
      } else {
        await welcomeEmail;
      }
    } catch {
      await welcomeEmail;
    }

    return NextResponse.json({
      success: true,
      message: msg.success,
    });
  } catch (error) {
    console.error("Registration failed:", error);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}
