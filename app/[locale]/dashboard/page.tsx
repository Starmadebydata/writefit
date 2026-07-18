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
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { practiceSessions, ideas, profiles } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

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

  // 从数据库读取真实统计数据
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);

  // 未完成 onboarding 画像的新用户（如 Google 登录直达）→ 先补画像
  const [profile] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id));
  if (!profile) {
    redirect("/onboarding");
  }

  // 本周训练数和总字数
  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [weekStats] = await db
    .select({
      weekSessions: sql<number>`cast(count(*) as integer)`,
      weekWords: sql<number>`coalesce(cast(sum(${practiceSessions.wordCount}) as integer), 0)`,
    })
    .from(practiceSessions)
    .where(sql`${practiceSessions.userId} = ${session.user.id} AND ${practiceSessions.createdAt} >= ${weekStart.getTime()}`);

  // 连续训练天数
  const practiceDates = await db
    .select({ date: sql<string>`date(${practiceSessions.createdAt} / 1000, 'unixepoch')` })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id))
    .groupBy(sql`date(${practiceSessions.createdAt} / 1000, 'unixepoch')`)
    .limit(30);

  let streak = 0;
  const nowDate = new Date();
  const today = nowDate.toISOString().split("T")[0];
  const yesterdayDate = new Date(nowDate.getTime() - 86400000);
  const yesterday = yesterdayDate.toISOString().split("T")[0];
  const dateList = practiceDates.map((s) => s.date);

  if (dateList.includes(today) || dateList.includes(yesterday)) {
    let checkDate = dateList.includes(today) ? today : yesterday;
    while (dateList.includes(checkDate)) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }
  }

  // 保存的素材数
  const [ideaCount] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(ideas)
    .where(eq(ideas.userId, session.user.id));

  // 统计数据
  const stats = [
    { icon: Flame, label: t("stats.streak"), value: `${streak} ${t("stats.days")}`, color: "text-orange-500" },
    { icon: PenLine, label: t("stats.thisWeek"), value: `${weekStats?.weekSessions || 0} ${t("stats.sessions")}`, color: "text-primary" },
    { icon: TrendingUp, label: t("stats.wordsThisWeek"), value: `${weekStats?.weekWords || 0} ${t("stats.words")}`, color: "text-primary" },
    { icon: Lightbulb, label: t("stats.savedIdeas"), value: `${ideaCount?.count || 0} ${t("stats.items")}`, color: "text-amber-500" },
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
                {tPractice("promptPreview")}
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
