// ====================================================================
// Dashboard 仪表盘页面
// ====================================================================
// 用户登录后看到的主页面
// MVP 阶段先做一个基础版本，后续迭代完善
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Lightbulb, TrendingUp, Flame } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

// Dashboard 页面 SEO（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Dashboard | WriteFit",
    zh: "仪表盘 | WriteFit",
  };

  const descriptions = {
    en: "Track your write practice streak, weekly progress, saved ideas, and drafts in your WriteFit dashboard.",
    zh: "在 WriteFit 仪表盘中跟踪你的写作训练连续天数、本周进度、保存的素材和草稿。",
  };

  const keywords = {
    en: [
      "writing practice dashboard",
      "track writing progress",
      "my write practice",
      "writing streak",
    ],
    zh: ["写作训练仪表盘", "跟踪写作进度", "我的写作训练", "写作连续天数"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/dashboard",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 获取当前登录用户
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // 获取翻译
  const t = await getTranslations("dashboard");
  const tPractice = await getTranslations("practice");

  // 统计数据
  const stats = [
    { icon: Flame, label: t("stats.streak"), value: `0 ${t("stats.days")}`, color: "text-orange-500" },
    { icon: PenLine, label: t("stats.thisWeek"), value: `0 ${t("stats.sessions")}`, color: "text-primary" },
    { icon: TrendingUp, label: t("stats.wordsThisWeek"), value: `0 ${t("stats.words")}`, color: "text-primary" },
    { icon: Lightbulb, label: t("stats.savedIdeas"), value: `0 ${t("stats.items")}`, color: "text-amber-500" },
  ];

  return (
    <AppShell title="Dashboard" user={session.user}>
      {/* 欢迎语 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          {t("welcome", { name: session.user.name ?? t("defaultName") })}
        </h2>
        <p className="text-muted-foreground mt-1">{t("dayOne")}</p>
      </div>

      {/* 今日训练卡片 —— 最显眼的位置 */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">{t("todaysPractice")}</p>
              <CardTitle className="text-xl">{tPractice("types.free_writing")}</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                今天有没有一个时刻，你脑子里很清楚，但写出来很模糊？
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PenLine className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/practice/today" />}>
            {t("startPractice")}
            <PenLine className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* 本周进度统计 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 pt-6">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近素材和草稿 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("recentIdeas")}</CardTitle>
              <Link href="/ideas" className="text-sm text-primary hover:underline">
                {t("viewAll")}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-8 text-center">
              {t("noIdeas")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">{t("recentDrafts")}</CardTitle>
              <Link href="/drafts" className="text-sm text-primary hover:underline">
                {t("viewAll")}
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-8 text-center">
              {t("noDrafts")}
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
