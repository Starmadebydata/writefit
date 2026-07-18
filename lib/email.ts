// ====================================================================
// 邮件发送工具（Resend）
// ====================================================================
// 通过 Resend 的 REST API 发邮件，fetch 直连，无 SDK 依赖，
// 兼容 Cloudflare Workers 运行时。
//
// 配置方式（环境变量，生产用 wrangler secret / Dashboard 变量）：
// - RESEND_API_KEY（必填，未配置时所有发送静默跳过，不影响主流程）
// - EMAIL_FROM（可选，默认 Resend 测试地址；域名验证后改为 noreply@writefit.app）
//
// 用途：欢迎邮件（已接入）、训练提醒（P3）、周报（P2/P3）、
// 支付收据（P2，也可用支付平台自带邮件）。
// ====================================================================

import { getServerEnv } from "./server-env";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
}

// 发送邮件。返回是否成功；未配置 Key 或发送失败都返回 false，不抛异常。
export async function sendEmail({ to, subject, html }: SendEmailOptions): Promise<boolean> {
  const apiKey = getServerEnv("RESEND_API_KEY");
  if (!apiKey) return false;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: getServerEnv("EMAIL_FROM") ?? "WriteFit <onboarding@resend.dev>",
        to,
        subject,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[email] send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] send error:", error);
    return false;
  }
}

// 欢迎邮件（注册成功后发送）
export async function sendWelcomeEmail(
  email: string,
  name: string | null | undefined,
  locale: "en" | "zh" = "en"
): Promise<boolean> {
  const displayName = name?.trim() || (locale === "zh" ? "写作者" : "writer");

  const { subject, html } =
    locale === "zh"
      ? {
          subject: "欢迎来到 WriteFit —— 你的第一次训练在等你",
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
              <h1 style="font-size: 22px;">欢迎，${displayName}！</h1>
              <p>你刚加入了 WriteFit —— 一个不替你写、只教你写的 AI 写作教练。</p>
              <p><strong>开始的方式很简单：</strong></p>
              <ol>
                <li>完成写作画像（1 分钟），让教练了解你的目标</li>
                <li>开始今日训练：15 分钟，先自己写</li>
                <li>获得 AI 诊断，然后自己动手修改</li>
              </ol>
              <p>
                <a href="https://writefit.app/zh/onboarding" style="display: inline-block; background: #0f172a; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">开始第一次训练 →</a>
              </p>
              <p style="color: #666; font-size: 13px; margin-top: 32px;">
                每天 15 分钟，训练你自己的写作能力。<br/>—— WriteFit 团队
              </p>
            </div>
          `,
        }
      : {
          subject: "Welcome to WriteFit — your first practice is waiting",
          html: `
            <div style="font-family: sans-serif; max-width: 560px; margin: 0 auto; color: #1a1a1a;">
              <h1 style="font-size: 22px;">Welcome, ${displayName}!</h1>
              <p>You just joined WriteFit — an AI writing coach that doesn't write for you, but trains you to write better.</p>
              <p><strong>Getting started is simple:</strong></p>
              <ol>
                <li>Set up your writing profile (1 minute) so your coach knows your goals</li>
                <li>Start today's practice: 15 minutes, you write first</li>
                <li>Get an AI diagnosis, then revise with your own hands</li>
              </ol>
              <p>
                <a href="https://writefit.app/onboarding" style="display: inline-block; background: #0f172a; color: #fff; padding: 10px 20px; border-radius: 8px; text-decoration: none;">Start your first practice →</a>
              </p>
              <p style="color: #666; font-size: 13px; margin-top: 32px;">
                15 minutes a day. Train your own writing ability.<br/>— The WriteFit Team
              </p>
            </div>
          `,
        };

  return sendEmail({ to: email, subject, html });
}
