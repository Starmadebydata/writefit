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
import { generateTodayPractice } from "@/lib/practice/scheduler";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

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

  // 生成今日训练任务（根据语言选择对应题库）
  const todayPractice = generateTodayPractice(10, locale as "en" | "zh");

  return (
    <AppShell title={t("todaysPractice")} user={session.user}>
      <PracticeFlow
        practiceType={todayPractice.practiceType}
        prompt={todayPractice.prompt}
        estimatedMinutes={todayPractice.estimatedMinutes}
      />
    </AppShell>
  );
}
