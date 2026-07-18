// ====================================================================
// 邮件发送工具（Cloudflare Email Service 优先，Resend 兜底）
// ====================================================================
// 供应商链：
// 1. Cloudflare Email Service（env.EMAIL binding，Workers Paid + 域名绑定，
//    生产环境首选，无外部 API 调用）
// 2. Resend REST API（RESEND_API_KEY 配置时，作为备用/过渡）
// 3. 都不可用 → 静默跳过，不影响主流程
//
// 配置方式：
// - wrangler.jsonc 的 send_email binding（已配置，生产自动生效）
// - RESEND_API_KEY（可选，兜底）
// - EMAIL_FROM（可选；CF 默认 noreply@writefit.app，Resend 默认测试地址）
//
// 用途：欢迎邮件（已接入）、训练提醒（P3）、周报（P2/P3）、
// 支付收据（P2，也可用支付平台自带邮件）。
// ====================================================================

import { getCloudflareContext } from "@opennextjs/cloudflare";
import { getServerEnv } from "./server-env";

interface SendEmailOptions {
  to: string;
  subject: string;
  html: string;
  text: string;
}

// 通过 Cloudflare Email Service 发送；binding 不存在（本地 dev）返回 null
async function sendViaCloudflare({ to, subject, html, text }: SendEmailOptions): Promise<boolean | null> {
  try {
    const { env } = getCloudflareContext();
    if (!env.EMAIL) return null;
    await env.EMAIL.send({
      from: getServerEnv("EMAIL_FROM") ?? "noreply@writefit.app",
      to,
      subject,
      html,
      text,
    });
    return true;
  } catch (error) {
    console.error("[email] cloudflare send error:", error);
    return false;
  }
}

// 通过 Resend 发送；未配置 Key 返回 null
async function sendViaResend({ to, subject, html, text }: SendEmailOptions): Promise<boolean | null> {
  const apiKey = getServerEnv("RESEND_API_KEY");
  if (!apiKey) return null;

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
        text,
      }),
    });
    if (!res.ok) {
      console.error("[email] resend send failed:", res.status, await res.text());
      return false;
    }
    return true;
  } catch (error) {
    console.error("[email] resend send error:", error);
    return false;
  }
}

// 发送邮件。返回是否成功；无可用供应商或发送失败都返回 false，不抛异常。
export async function sendEmail(options: SendEmailOptions): Promise<boolean> {
  // 1. Cloudflare Email Service（生产首选）
  const cf = await sendViaCloudflare(options);
  if (cf === true) return true;

  // 2. Resend 兜底（binding 不存在或发送失败时）
  const resend = await sendViaResend(options);
  return resend === true;
}

// 欢迎邮件（注册成功后发送）
export async function sendWelcomeEmail(
  email: string,
  name: string | null | undefined,
  locale: "en" | "zh" = "en"
): Promise<boolean> {
  const displayName = name?.trim() || (locale === "zh" ? "写作者" : "writer");

  const { subject, html, text } =
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
          text: `欢迎，${displayName}！

你刚加入了 WriteFit —— 一个不替你写、只教你写的 AI 写作教练。

开始的方式很简单：
1. 完成写作画像（1 分钟），让教练了解你的目标
2. 开始今日训练：15 分钟，先自己写
3. 获得 AI 诊断，然后自己动手修改

开始第一次训练：https://writefit.app/zh/onboarding

每天 15 分钟，训练你自己的写作能力。
—— WriteFit 团队`,
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
          text: `Welcome, ${displayName}!

You just joined WriteFit — an AI writing coach that doesn't write for you, but trains you to write better.

Getting started is simple:
1. Set up your writing profile (1 minute) so your coach knows your goals
2. Start today's practice: 15 minutes, you write first
3. Get an AI diagnosis, then revise with your own hands

Start your first practice: https://writefit.app/onboarding

15 minutes a day. Train your own writing ability.
— The WriteFit Team`,
        };

  return sendEmail({ to: email, subject, html, text });
}
