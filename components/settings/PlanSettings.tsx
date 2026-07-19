"use client";

// ====================================================================
// 订阅套餐卡片（设置页）
// ====================================================================
// 显示：当前套餐、今日 AI 用量（配额进度条）、到期时间（付费用户）
// 免费用户显示升级入口；付费用户显示管理入口（取消功能随支付通道上线）
// ====================================================================

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, ArrowUpRight } from "lucide-react";

interface BillingStatus {
  plan: "free" | "basic" | "pro";
  used: number;
  limit: number;
  planExpiresAt: string | null;
  paymentProvider: string | null;
}

export function PlanSettings() {
  const t = useTranslations("settings.plan");
  const [status, setStatus] = useState<BillingStatus | null>(null);

  useEffect(() => {
    fetch("/api/billing/status")
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => data && setStatus(data))
      .catch(() => {
        // 加载失败静默处理：卡片显示骨架外的空态即可
      });
  }, []);

  const isPaid = status && status.plan !== "free";
  const usagePercent = status ? Math.min(100, Math.round((status.used / status.limit) * 100)) : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Crown className="h-5 w-5 text-primary" />
          {t("title")}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {!status ? (
          <p className="text-sm text-muted-foreground">{t("loading")}</p>
        ) : (
          <>
            {/* 当前套餐 */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant={isPaid ? "default" : "secondary"} className="text-sm px-3 py-1">
                  {t(`tiers.${status.plan}`)}
                </Badge>
                {status.planExpiresAt && (
                  <span className="text-xs text-muted-foreground">
                    {t("expiresAt", {
                      date: new Date(status.planExpiresAt).toLocaleDateString(),
                    })}
                  </span>
                )}
              </div>
              {!isPaid && (
                <Button size="sm" render={<Link href="/pricing" />}>
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  {t("upgrade")}
                </Button>
              )}
            </div>

            {/* 今日 AI 用量 */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <span className="flex items-center gap-1.5 text-muted-foreground">
                  <Zap className="h-3.5 w-3.5" />
                  {t("dailyUsage")}
                </span>
                <span className="font-medium">
                  {status.used} / {status.limit}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full bg-primary transition-all"
                  style={{ width: `${usagePercent}%` }}
                />
              </div>
              <p className="text-xs text-muted-foreground">{t("usageHint")}</p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
