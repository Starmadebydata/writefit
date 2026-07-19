"use client";

// ====================================================================
// 定价卡片组件
// ====================================================================
// Pricing 页的核心交互：
// - 月付/年付切换（年付按 10 个月价，标"省两个月"）
// - 免费档 CTA 去注册；付费档 CTA 调 /api/billing/checkout 跳收银台
// - 支付未配置时（503）友好提示"即将开放"，不报错
// ====================================================================

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter, Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type PlanId = "free" | "basic" | "pro";
type Interval = "monthly" | "yearly";

interface PricingCardsProps {
  isLoggedIn: boolean;
  currentPlan: PlanId | null;
  prices: {
    basic: { monthly: number; yearly: number };
    pro: { monthly: number; yearly: number };
  };
}

export function PricingCards({ isLoggedIn, currentPlan, prices }: PricingCardsProps) {
  const t = useTranslations("pricing");
  const locale = useLocale();
  const router = useRouter();
  const [interval, setInterval] = useState<Interval>("yearly");
  const [loadingPlan, setLoadingPlan] = useState<PlanId | null>(null);

  // 发起支付：调 billing/checkout 拿收银台地址并跳转
  async function handleUpgrade(plan: PlanId) {
    if (!isLoggedIn) {
      router.push("/auth/register");
      return;
    }
    setLoadingPlan(plan);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, interval, locale }),
      });
      if (res.status === 401) {
        router.push("/auth/login");
        return;
      }
      if (res.status === 503) {
        // 支付通道尚未开放
        toast.info(t("notConfigured"));
        return;
      }
      if (!res.ok) throw new Error("checkout failed");
      const { url } = await res.json();
      // 整页跳转到支付平台收银台
      window.location.assign(url);
    } catch {
      toast.error(t("checkoutError"));
    } finally {
      setLoadingPlan(null);
    }
  }

  const plans: PlanId[] = ["free", "basic", "pro"];

  return (
    <div className="space-y-8">
      {/* 月付/年付切换 */}
      <div className="flex items-center justify-center gap-2">
        <Button
          variant={interval === "monthly" ? "default" : "outline"}
          size="sm"
          onClick={() => setInterval("monthly")}
        >
          {t("monthly")}
        </Button>
        <Button
          variant={interval === "yearly" ? "default" : "outline"}
          size="sm"
          onClick={() => setInterval("yearly")}
        >
          {t("yearly")}
          <Badge variant="secondary" className="ml-2">{t("yearlyBadge")}</Badge>
        </Button>
      </div>

      {/* 套餐卡片 */}
      <div className="grid gap-6 md:grid-cols-3">
        {plans.map((id) => {
          const isCurrent = currentPlan === id;
          const isPro = id === "pro";
          const isFree = id === "free";
          const price = isFree
            ? 0
            : interval === "monthly"
              ? prices[id as "basic" | "pro"].monthly
              : prices[id as "basic" | "pro"].yearly;
          const features = t.raw(`plans.${id}.features`) as string[];

          return (
            <Card
              key={id}
              className={cn(
                "relative flex flex-col",
                isPro && "border-primary shadow-lg"
              )}
            >
              {isPro && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Sparkles className="h-3 w-3 mr-1" />
                  {t("recommended")}
                </Badge>
              )}
              <CardHeader>
                <CardTitle className="text-xl">{t(`plans.${id}.name`)}</CardTitle>
                <p className="text-sm text-muted-foreground">{t(`plans.${id}.desc`)}</p>
              </CardHeader>
              <CardContent className="flex flex-1 flex-col gap-5">
                {/* 价格 */}
                <div>
                  <span className="text-4xl font-bold">${price}</span>
                  <span className="text-muted-foreground">
                    {isFree ? "" : interval === "monthly" ? t("perMonth") : t("perYear")}
                  </span>
                  {!isFree && interval === "yearly" && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {t("yearlyEquivalent", {
                        price: (prices[id as "basic" | "pro"].yearly / 12).toFixed(1),
                      })}
                    </p>
                  )}
                </div>

                {/* 功能列表 */}
                <ul className="space-y-2 text-sm flex-1">
                  {features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <Check className="h-4 w-4 shrink-0 text-primary mt-0.5" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Pro 定价锚点 */}
                {isPro && (
                  <p className="text-xs text-muted-foreground border-t border-border pt-3">
                    {t("coachAnchor")}
                  </p>
                )}

                {/* CTA */}
                {isCurrent ? (
                  <Button variant="outline" disabled>
                    {t("currentPlan")}
                  </Button>
                ) : isFree ? (
                  isLoggedIn ? null : (
                    <Button variant="outline" render={<Link href="/auth/register" />}>
                      {t("plans.free.cta")}
                    </Button>
                  )
                ) : (
                  <Button
                    variant={isPro ? "default" : "outline"}
                    disabled={loadingPlan !== null}
                    onClick={() => handleUpgrade(id)}
                  >
                    {loadingPlan === id && <Loader2 className="h-4 w-4 animate-spin" />}
                    {t(`plans.${id}.cta`)}
                  </Button>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
