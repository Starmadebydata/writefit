// ====================================================================
// 创建支付会话 API
// ====================================================================
// POST /api/billing/checkout —— 创建支付平台的收银台会话
// 请求：{ plan: "basic" | "pro", interval: "monthly" | "yearly", locale?: "en" | "zh" }
// 响应：{ url } —— 前端重定向到支付平台收银台
// 支付平台未配置时返回 503（PAYMENT_NOT_CONFIGURED），前端提示"即将开放"
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPaymentProvider } from "@/lib/billing/providers";
import { ProviderNotConfiguredError } from "@/lib/billing/providers/types";
import { PAID_PLANS, type BillingInterval } from "@/lib/billing/plans";
import { getServerEnv } from "@/lib/server-env";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await req.json();
    const { plan, interval = "monthly", locale = "en" } = body;

    // 校验套餐和计费周期
    if (!PAID_PLANS.includes(plan)) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }
    if (interval !== "monthly" && interval !== "yearly") {
      return NextResponse.json({ error: "Invalid interval" }, { status: 400 });
    }
    const safeLocale = locale === "zh" ? "zh" : "en";

    // 回跳地址：成功回设置页（带标识），取消回定价页
    const baseUrl = getServerEnv("NEXTAUTH_URL") ?? "https://writefit.app";
    const prefix = safeLocale === "zh" ? "/zh" : "";

    const provider = getPaymentProvider();
    const checkout = await provider.createCheckout({
      userId: session.user.id,
      userEmail: session.user.email,
      plan,
      interval: interval as BillingInterval,
      successUrl: `${baseUrl}${prefix}/settings?checkout=success`,
      cancelUrl: `${baseUrl}${prefix}/pricing?checkout=canceled`,
      locale: safeLocale,
    });

    return NextResponse.json({ url: checkout.url });
  } catch (error) {
    if (error instanceof ProviderNotConfiguredError) {
      return NextResponse.json(
        { error: "Payment is not available yet", code: "PAYMENT_NOT_CONFIGURED" },
        { status: 503 }
      );
    }
    console.error("Create checkout failed:", error);
    return NextResponse.json({ error: "Failed to create checkout" }, { status: 500 });
  }
}
