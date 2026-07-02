// ====================================================================
// 写作进度页面
// ====================================================================
// 展示用户的训练历史记录和统计数据
// 从数据库读取 practice_sessions 表的数据
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PenLine, Flame, TrendingUp, Clock, FileText } from "lucide-react";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { practiceSessions } from "@/lib/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { Link } from "@/i18n/navigation";

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
  if (seconds < 60) return `${seconds}s`;
  const min = Math.floor(seconds / 60);
  const sec = seconds % 60;
  return `${min}m ${sec}s`;
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

  // 获取统计数据
  const [stats] = await db
    .select({
      totalSessions: sql<number>`count(*)::int`,
      totalWords: sql<number>`coalesce(sum(${practiceSessions.wordCount}), 0)::int`,
      avgWords: sql<number>`coalesce(avg(${practiceSessions.wordCount}), 0)::int`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id));

  // 获取最近 7 天的连续训练天数
  const recentSessions = await db
    .select({
      date: sql<string>`date(${practiceSessions.createdAt})`,
    })
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id))
    .groupBy(sql`date(${practiceSessions.createdAt})`)
    .orderBy(desc(sql`date(${practiceSessions.createdAt})`))
    .limit(30);

  // 计算连续训练天数
  let streak = 0;
  const nowDate = new Date();
  const today = nowDate.toISOString().split("T")[0];
  const yesterdayDate = new Date(nowDate.getTime() - 86400000);
  const yesterday = yesterdayDate.toISOString().split("T")[0];
  const practiceDates = recentSessions.map((s) => s.date);

  if (practiceDates.includes(today) || practiceDates.includes(yesterday)) {
    let checkDate = practiceDates.includes(today) ? today : yesterday;
    while (practiceDates.includes(checkDate)) {
      streak++;
      const d = new Date(checkDate);
      d.setDate(d.getDate() - 1);
      checkDate = d.toISOString().split("T")[0];
    }
  }

  // 获取最近的训练记录（最多 20 条）
  const sessions = await db
    .select()
    .from(practiceSessions)
    .where(eq(practiceSessions.userId, session.user.id))
    .orderBy(desc(practiceSessions.createdAt))
    .limit(20);

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
                    {tPractice(`types.${s.practiceType}`)}
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
