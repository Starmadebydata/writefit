// ====================================================================
// PayPal 订阅计划修复脚本（total_cycles: 1 → 0）
// ====================================================================
// 背景：UI 创建的计划默认 total_cycles=1（扣款一次即到期），
// 而 billing_cycles 不可 PATCH。本脚本读取旧计划的 product_id，
// 用 API 重建 total_cycles=0（无限期）的同名计划，并停用旧计划。
//
// 用法：
//   PAYPAL_CLIENT_ID=xxx PAYPAL_CLIENT_SECRET=yyy PAYPAL_ENV=sandbox \
//     node scripts/paypal-fix-plans.mjs
//
// 输出新的 4 个 plan_id，写入 .env / Cloudflare secrets 后生效。
// ====================================================================

const CLIENT_ID = process.env.PAYPAL_CLIENT_ID;
const CLIENT_SECRET = process.env.PAYPAL_CLIENT_SECRET;
const API_BASE =
  process.env.PAYPAL_ENV === "sandbox"
    ? "https://api-m.sandbox.paypal.com"
    : "https://api-m.paypal.com";

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error("Missing PAYPAL_CLIENT_ID / PAYPAL_CLIENT_SECRET");
  process.exit(1);
}

// 旧计划 → 环境变量名 映射
const OLD_PLANS = [
  { envKey: "PAYPAL_PLAN_BASIC_MONTHLY", id: "P-2SD854186B7268307NJOJOSY" },
  { envKey: "PAYPAL_PLAN_BASIC_YEARLY", id: "P-7BN45834BY5577435NJOJ4KA" },
  { envKey: "PAYPAL_PLAN_PRO_MONTHLY", id: "P-7HS58521WL1717809NJOJROQ" },
  { envKey: "PAYPAL_PLAN_PRO_YEARLY", id: "P-0RE29572MV1232029NJOJ4XA" },
];

async function getAccessToken() {
  const res = await fetch(`${API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });
  if (!res.ok) throw new Error(`OAuth failed: ${res.status} ${await res.text()}`);
  return (await res.json()).access_token;
}

let token;
async function api(path, method = "GET", body) {
  token ??= await getAccessToken();
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  if (!res.ok) throw new Error(`${method} ${path} failed: ${res.status} ${await res.text()}`);
  return res.status === 204 ? null : res.json();
}

async function main() {
  const output = [];

  for (const { envKey, id } of OLD_PLANS) {
    // 1. 读旧计划（拿 product_id / 名称 / 周期 / 价格）
    const old = await api(`/v1/billing/plans/${id}`);
    const cycle = (old.billing_cycles ?? []).find((c) => c.tenure_type === "REGULAR");
    if (!cycle) throw new Error(`${old.name}: no REGULAR cycle`);

    // 2. 用同一 product_id 重建 total_cycles=0 的计划
    const created = await api("/v1/billing/plans", "POST", {
      product_id: old.product_id,
      name: old.name,
      billing_cycles: [
        {
          frequency: cycle.frequency,
          tenure_type: "REGULAR",
          sequence: 1,
          total_cycles: 0, // 0 = 无限期订阅
          pricing_scheme: cycle.pricing_scheme,
        },
      ],
      payment_preferences: old.payment_preferences ?? {
        auto_bill_outstanding: true,
        payment_failure_threshold: 3,
      },
    });
    console.log(`✅ 重建 ${old.name}: ${created.id}（total_cycles=0）`);
    output.push(`${envKey}=${created.id}`);

    // 3. 停用旧计划
    await api(`/v1/billing/plans/${id}/deactivate`, "POST");
    console.log(`   旧计划 ${id} 已停用`);
  }

  console.log("\n新的环境变量（写入 .env 并更新 Cloudflare secrets）：\n");
  console.log(output.join("\n"));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
