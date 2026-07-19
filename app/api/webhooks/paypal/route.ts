// ====================================================================
// PayPal Webhook 接收端点
// ====================================================================
// POST /api/webhooks/paypal —— 接收 PayPal 订阅事件
// 流程：provider 验签 + 解析 → applyBillingEvent 落库
// 注意：验签失败返回 400（PayPal 会重投）；解析后返回 200
// 不在 middleware 保护范围（matcher 已排除 api 路由），PayPal 直接调用
// ====================================================================

import { NextRequest, NextResponse } from "next/server";
import { paypalProvider } from "@/lib/billing/providers/paypal";
import { applyBillingEvent } from "@/lib/billing/lifecycle";

export async function POST(req: NextRequest) {
  try {
    const event = await paypalProvider.parseWebhook(req);
    if (event) {
      await applyBillingEvent(event, paypalProvider.id);
    }
    // 不认识的事件也返回 200，避免 PayPal 无谓重投
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[webhook/paypal] failed:", error);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 400 });
  }
}
