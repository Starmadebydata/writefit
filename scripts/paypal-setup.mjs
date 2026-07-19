// ====================================================================
// PayPal 订阅计划查看脚本（列出账户下全部 billing plans）
// ====================================================================
// 背景：本账户的 Catalog Products API 不可用（404），计划改在
// PayPal 后台 UI 创建（sandbox 用 sandbox.paypal.com 商户测试账户，
// live 用企业账户正式后台），本脚本用于列出已创建的计划，
// 把 plan_id 映射到环境变量。
//
// 用法：
//   PAYPAL_CLIENT_ID=xxx PAYPAL_CLIENT_SECRET=yyy PAYPAL_ENV=sandbox \
//     node scripts/paypal-setup.mjs
//
// 输出每个计划的 id / 名称 / 状态 / 周期 / 价格，
// 并给出 .env 映射建议（按名称含 Basic/Pro 与周期推断）。
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

async function main() {
  const token = await getAccessToken();
  const res = await fetch(`${API_BASE}/v1/billing/plans?page_size=20`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(`list plans failed: ${res.status} ${await res.text()}`);
  const data = await res.json();
  const plans = data.plans ?? [];

  if (plans.length === 0) {
    console.log("账户下还没有任何订阅计划。请先在 PayPal 后台 UI 创建（见操作手册）。");
    return;
  }

  const envSuggestions = [];
  for (const p of plans) {
    // 拉详情拿周期和价格
    const detailRes = await fetch(`${API_BASE}/v1/billing/plans/${p.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const detail = await detailRes.json();
    const cycle = (detail.billing_cycles ?? []).find((c) => c.tenure_type === "REGULAR");
    const unit = cycle?.frequency?.interval_unit ?? "?";
    const price = cycle?.pricing_scheme?.fixed_price?.value ?? "?";
    console.log(`${p.id}  ${p.name}  [${p.status}]  ${unit} $${price}`);

    // 按名称 + 周期推断环境变量名
    const lower = (p.name ?? "").toLowerCase();
    const tier = lower.includes("pro") && !lower.includes("product") ? "PRO" : lower.includes("basic") ? "BASIC" : null;
    const interval = unit === "MONTH" ? "MONTHLY" : unit === "YEAR" ? "YEARLY" : null;
    if (tier && interval && p.status === "ACTIVE") {
      envSuggestions.push(`PAYPAL_PLAN_${tier}_${interval}=${p.id}`);
    }
  }

  if (envSuggestions.length > 0) {
    console.log("\n.env 映射建议（检查无误后写入 .env / Cloudflare Dashboard）：\n");
    console.log(envSuggestions.join("\n"));
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
