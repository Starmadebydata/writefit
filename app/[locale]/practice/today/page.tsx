// ====================================================================
// 今日训练页面（需要登录）
// ====================================================================
// 用户登录后从这个页面进入今日训练
// 从训练调度器获取今日题目，传给 PracticeFlow 组件
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PracticeFlow } from "@/components/practice/PracticeFlow";
import { generateTodayPractice, getTomorrowPracticeType } from "@/lib/practice/scheduler";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { profiles, writingGoals } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 今日训练页面 SEO（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Daily Write Practice | WriteFit",
    zh: "今日写作训练 | WriteFit",
  };

  const descriptions = {
    en: "Start today's write practice. Get a daily writing exercise, write your draft, and receive AI feedback to improve your writing.",
    zh: "开始今天的写作训练。获取每日写作练习，写下你的草稿，并获得 AI 反馈来提升写作。",
  };

  const keywords = {
    en: [
      "daily write practice",
      "writing exercise today",
      "daily writing practice",
      "writing practice",
      "AI writing feedback",
    ],
    zh: ["每日写作训练", "今日写作练习", "每日写作", "写作训练", "AI 写作反馈"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/practice/today",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function PracticeTodayPage({
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

  // 获取翻译
  const t = await getTranslations("practice");
  const tOnboarding = await getTranslations("onboarding");

  // 读取用户画像（每日时长、目标、主题、写作问题）
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);
  const [profile] = await db
    .select()
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);
  const goals = await db
    .select({ goal: writingGoals.goal })
    .from(writingGoals)
    .where(eq(writingGoals.userId, session.user.id));

  // 生成今日训练任务：
  // - 时长用画像里的 dailyPracticeMinutes（onboarding 第 4 步收集）
  // - 选题用用户 ID 做确定性 seed，同一天刷新/换设备题目不变
  const dailyMinutes = profile?.dailyPracticeMinutes ?? 10;
  const todayPractice = generateTodayPractice(
    dailyMinutes,
    locale as "en" | "zh",
    session.user.id
  );

  // 组装画像上下文（翻译 onboarding 的 key 为自然语言，随诊断请求发给 AI）
  const isZh = locale === "zh";
  const profileParts: string[] = [];
  if (goals.length > 0) {
    const labels = goals.map((g) => tOnboarding(`goals.${g.goal}` as never)).filter(Boolean);
    if (labels.length > 0) profileParts.push(`${isZh ? "写作目标" : "Writing goals"}: ${labels.join(", ")}`);
  }
  const topics = (profile?.preferredTopics as string[] | undefined) ?? [];
  if (topics.length > 0) {
    const labels = topics.map((k) => tOnboarding(`topics.${k}` as never)).filter(Boolean);
    if (labels.length > 0) profileParts.push(`${isZh ? "关注主题" : "Topics of interest"}: ${labels.join(", ")}`);
  }
  const problems = (profile?.writingProblems as string[] | undefined) ?? [];
  if (problems.length > 0) {
    const labels = problems.map((k) => tOnboarding(`problems.${k}` as never)).filter(Boolean);
    if (labels.length > 0) profileParts.push(`${isZh ? "想改进的问题" : "Problems to improve"}: ${labels.join(", ")}`);
  }
  const profileContext = profileParts.length > 0 ? profileParts.join("\n") : undefined;

  return (
    <AppShell title={t("todaysPractice")} user={session.user}>
      <PracticeFlow
        practiceType={todayPractice.practiceType}
        prompt={todayPractice.prompt}
        estimatedMinutes={todayPractice.estimatedMinutes}
        userName={session.user.name ?? undefined}
        tomorrowType={getTomorrowPracticeType()}
        profileContext={profileContext}
      />
    </AppShell>
  );
}
