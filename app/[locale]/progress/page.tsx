// ====================================================================
// 写作进度页面（增强版）
// ====================================================================
// 展示用户的训练历史记录和统计数据，包含：
// 1. 统计卡片（连续天数/总训练/总字数/平均字数）
// 2. 训练日历热力图（最近 12 周）
// 3. 字数趋势图（最近 30 天每日字数，纯 CSS 柱状图）
// 4. 训练类型分布（各类型占比，纯 CSS 条形图）
// 5. 训练历史列表
//
// 从数据库读取 practice_sessions 表的数据
// 所有可视化用纯 CSS/SVG 实现，不引入额外图表库
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenLine, Flame, TrendingUp, Clock, FileText, Calendar, BarChart3 } from "lucide-react";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { practiceSessions } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Link } from "@/i18n/navigation";
import { cn } from "@/lib/utils";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Writing Progress | WriteFit",
    zh: "写作进度 | WriteFit",
  };

  const descriptions = {
    en: "Track your write practice progress over time.",
    zh: "跟踪你的写作训练进度。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/progress" },
    robots: { index: false, follow: false },
  };
}

// 格式化日期
function formatDate(date: Date, locale: string) {
  return new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

// 格式化时长（秒 → 可读格式）
function formatDuration(seconds: number | null) {
  if (!seconds) return "—";
  if (seconds < 60) return seconds + "s";
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return min + "m " + sec + "s";
}

// 获取某天的星期几标签（用于日历列头）
function getWeekdayLabels(locale: string) {
  if (locale === "zh") return ["一", "二", "三", "四", "五", "六", "日"];
  return ["Mon", "Wed", "Fri"];
}

export default async function ProgressPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  const t = await getTranslations("progress");
  const tPractice = await getTranslations("practice");

  // 从数据库读取训练记录
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);

  // 获取总统计数据
  const [stats] = await db
    .select({
      totalSessions: sql<number>`cast(count(*) as integer)`,
      totalWords: sql<number>`coalesce(cast(sum(${practiceSessions.wordCount}) as integer), 0)`,
      avgWords: sql<number>`coalesce(cast(avg(${practiceSessions.wordCount}) as integer), 0)`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id));

  // 获取最近 30 天每日训练数据（用于日历热力图和趋势图）
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 84); // 12 周 = 84 天
  thirtyDaysAgo.setHours(0, 0, 0, 0);

  const dailyData = await db
    .select({
      date: sql<string>`date(${practiceSessions.createdAt} / 1000, 'unixepoch')`,
      sessionCount: sql<number>`cast(count(*) as integer)`,
      wordSum: sql<number>`coalesce(cast(sum(${practiceSessions.wordCount}) as integer), 0)`,
    })
    .from(practiceSessions)
    .where(sql`${practiceSessions.userId} = ${session.user.id} AND ${practiceSessions.createdAt} >= ${thirtyDaysAgo.getTime()}`)
    .groupBy(sql`date(${practiceSessions.createdAt} / 1000, 'unixepoch')`)
    .orderBy(sql`date(${practiceSessions.createdAt} / 1000, 'unixepoch')`);

  // 构建日期 → 数据的映射
  const dailyMap = new Map<string, { count: number; words: number }>();
  for (const d of dailyData) {
    dailyMap.set(d.date, { count: d.sessionCount, words: d.wordSum });
  }

  // 计算连续训练天数
  let streak = 0;
  const nowDate = new Date();
  const today = nowDate.toISOString().split("T")[0];
  const yesterdayDate = new Date(nowDate.getTime() - 86400000);
  const yesterday = yesterdayDate.toISOString().split("T")[0];
  const practiceDates = dailyData.map((s) => s.date);

  if (practiceDates.includes(today) || practiceDates.includes(yesterday)) {
    let checkDate = practiceDates.includes(today) ? today : yesterday;
    while (practiceDates.includes(checkDate)) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }
  }

  // 构建日历热力图数据（12 周 × 7 天）
  // 从今天往前推 12 周
  const calendarWeeks: { date: string; count: number; words: number; isToday: boolean }[][] = [];
  const todayDate = new Date();
  todayDate.setHours(0, 0, 0, 0);
  // 找到本周的周日（日历从周日开始）
  const dayOfWeek = todayDate.getDay(); // 0=Sunday
  const endOfWeek = new Date(todayDate);
  endOfWeek.setDate(todayDate.getDate() + (6 - dayOfWeek));

  for (let week = 11; week >= 0; week--) {
    const weekDays: { date: string; count: number; words: number; isToday: boolean }[] = [];
    for (let day = 0; day < 7; day++) {
      const d = new Date(endOfWeek);
      d.setDate(endOfWeek.getDate() - week * 7 - (6 - day));
      const dateStr = d.toISOString().split("T")[0];
      const data = dailyMap.get(dateStr);
      weekDays.push({
        date: dateStr,
        count: data?.count || 0,
        words: data?.words || 0,
        isToday: dateStr === today,
      });
    }
    calendarWeeks.push(weekDays);
  }

  // 构建字数趋势图数据（最近 30 天）
  const trendData: { date: string; words: number; label: string }[] = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date(todayDate);
    d.setDate(todayDate.getDate() - i);
    const dateStr = d.toISOString().split("T")[0];
    const data = dailyMap.get(dateStr);
    trendData.push({
      date: dateStr,
      words: data?.words || 0,
      label: new Intl.DateTimeFormat(locale === "zh" ? "zh-CN" : "en-US", {
        month: "numeric",
        day: "numeric",
      }).format(d),
    });
  }
  const maxTrendWords = Math.max(...trendData.map((d) => d.words), 1);

  // 获取训练类型分布
  const typeDistribution = await db
    .select({
      type: practiceSessions.practiceType,
      count: sql<number>`cast(count(*) as integer)`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id))
    .groupBy(practiceSessions.practiceType)
    .orderBy(desc(sql`cast(count(*) as integer)`));

  const totalTypeCount = typeDistribution.reduce((sum, t) => sum + t.count, 0);

  // 获取最近的训练记录（最多 20 条）
  const sessions = await db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id))
    .orderBy(desc(practiceSessions.createdAt))
    .limit(20);

  // 日历热力图颜色等级
  function getHeatLevel(count: number): string {
    if (count === 0) return "bg-muted/40";
    if (count === 1) return "bg-primary/30";
    if (count === 2) return "bg-primary/50";
    if (count <= 4) return "bg-primary/70";
    return "bg-primary";
  }

  const weekdayLabels = getWeekdayLabels(locale);

  return (
    <AppShell title={t("title")} user={session.user}>
      {/* 统计卡片 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Flame className="h-8 w-8 text-orange-500" />
            <div>
              <p className="text-2xl font-bold">{streak}</p>
              <p className="text-xs text-muted-foreground">{t("streakDays")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <PenLine className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalSessions || 0}</p>
              <p className="text-xs text-muted-foreground">{t("totalSessions")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <TrendingUp className="h-8 w-8 text-primary" />
            <div>
              <p className="text-2xl font-bold">{stats?.totalWords || 0}</p>
              <p className="text-xs text-muted-foreground">{t("totalWords")}</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <FileText className="h-8 w-8 text-amber-500" />
            <div>
              <p className="text-2xl font-bold">{Math.round(stats?.avgWords || 0)}</p>
              <p className="text-xs text-muted-foreground">{t("avgWords")}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 训练日历热力图 + 字数趋势图 */}
      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {/* 训练日历热力图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Calendar className="h-5 w-5" />
              {t("calendar.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("calendar.subtitle")}</p>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <div className="inline-flex flex-col gap-1">
                {/* 星期标签 */}
                <div className="flex gap-1 pl-0">
                  <div className="w-3" />
                  {calendarWeeks.map((_, weekIdx) => (
                    <div key={weekIdx} className="w-3" />
                  ))}
                </div>
                {/* 日历格子：按行排列（7 行 × 12 列） */}
                <div className="flex gap-1">
                  {/* 星期标签列 */}
                  <div className="flex flex-col gap-1 justify-around text-[10px] text-muted-foreground pr-1">
                    {weekdayLabels.map((label) => (
                      <span key={label} className="h-3 leading-3">{label}</span>
                    ))}
                  </div>
                  {/* 每周的列 */}
                  {calendarWeeks.map((week, weekIdx) => (
                    <div key={weekIdx} className="flex flex-col gap-1">
                      {week.map((day) => (
                        <div
                          key={day.date}
                          className={cn(
                            "h-3 w-3 rounded-sm transition-colors",
                            getHeatLevel(day.count),
                            day.isToday && "ring-1 ring-primary ring-offset-1"
                          )}
                          title={
                            day.count > 0
                              ? day.date + ": " + t("calendar.practiced", { count: day.count })
                              : day.date + ": " + t("calendar.noPractice")
                          }
                        />
                      ))}
                    </div>
                  ))}
                </div>
                {/* 图例 */}
                <div className="flex items-center gap-2 mt-2 text-[10px] text-muted-foreground">
                  <span>{t("calendar.less")}</span>
                  <div className="h-3 w-3 rounded-sm bg-muted/40" />
                  <div className="h-3 w-3 rounded-sm bg-primary/30" />
                  <div className="h-3 w-3 rounded-sm bg-primary/50" />
                  <div className="h-3 w-3 rounded-sm bg-primary/70" />
                  <div className="h-3 w-3 rounded-sm bg-primary" />
                  <span>{t("calendar.more")}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 字数趋势图 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              {t("trend.title")}
            </CardTitle>
            <p className="text-sm text-muted-foreground">{t("trend.subtitle")}</p>
          </CardHeader>
          <CardContent>
            {maxTrendWords === 1 && trendData.every((d) => d.words === 0) ? (
              <p className="text-sm text-muted-foreground py-12 text-center">
                {t("trend.noData")}
              </p>
            ) : (
              <div className="flex items-end gap-[2px] h-32">
                {trendData.map((d, idx) => {
                  const heightPercent = d.words > 0 ? Math.max((d.words / maxTrendWords) * 100, 4) : 0;
                  return (
                    <div
                      key={idx}
                      className="flex-1 min-w-0 group relative"
                      title={d.label + ": " + d.words + " " + t("trend.words")}
                    >
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all",
                          d.words > 0 ? "bg-primary/60 hover:bg-primary" : "bg-muted/30"
                        )}
                        style={{ height: heightPercent + "%" }}
                      />
                    </div>
                  );
                })}
              </div>
            )}
            {/* X 轴标签（每 5 天显示一个） */}
            <div className="flex gap-[2px] mt-2 text-[10px] text-muted-foreground">
              {trendData.map((d, idx) => (
                <div key={idx} className="flex-1 text-center min-w-0">
                  {idx % 5 === 0 ? d.label : ""}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 训练类型分布 */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <BarChart3 className="h-5 w-5" />
            {t("distribution.title")}
          </CardTitle>
          <p className="text-sm text-muted-foreground">{t("distribution.subtitle")}</p>
        </CardHeader>
        <CardContent>
          {totalTypeCount === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              {t("distribution.noData")}
            </p>
          ) : (
            <div className="space-y-3">
              {typeDistribution.map((item) => {
                const percent = totalTypeCount > 0 ? Math.round((item.count / totalTypeCount) * 100) : 0;
                return (
                  <div key={item.type} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{tPractice("types." + item.type)}</span>
                      <span className="text-muted-foreground">
                        {item.count} ({percent}%)
                      </span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{ width: percent + "%" }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 训练历史 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            {t("history")}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sessions.length === 0 ? (
            <div className="text-center py-12">
              <PenLine className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">{t("noSessions")}</p>
              <Link
                href="/practice/today"
                className="inline-flex items-center gap-2 mt-4 text-primary hover:underline"
              >
                {t("startFirst")}
                <PenLine className="h-4 w-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 rounded-lg border border-border p-4 hover:bg-muted/30 transition-colors"
                >
                  {/* 训练类型标签 */}
                  <Badge variant="secondary" className="shrink-0 mt-0.5">
                    {tPractice("types." + s.practiceType)}
                  </Badge>

                  {/* 训练内容摘要 */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium line-clamp-1">{s.prompt}</p>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {s.revisedText || s.rawText}
                    </p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                      <span>{formatDate(s.createdAt, locale)}</span>
                      <span>{s.wordCount} {t("words")}</span>
                      {s.durationSeconds && (
                        <span>{formatDuration(s.durationSeconds)}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </AppShell>
  );
}
