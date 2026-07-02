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

// 今日训练页面 SEO
export const metadata: Metadata = {
  title: "Daily Write Practice | WriteFit",
  description:
    "Start today's write practice. Get a daily writing exercise, write your draft, and receive AI feedback to improve your writing.",
  keywords: [
    "daily write practice",
    "writing exercise today",
    "daily writing practice",
    "writing practice",
    "AI writing feedback",
  ],
  alternates: {
    canonical: "https://writefit.app/practice/today",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function PracticeTodayPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // 生成今日训练任务
  const todayPractice = generateTodayPractice(10, "zh");

  return (
    <AppShell title="今日训练" user={session.user}>
      <PracticeFlow
        practiceType={todayPractice.practiceType}
        prompt={todayPractice.prompt}
        estimatedMinutes={todayPractice.estimatedMinutes}
      />
    </AppShell>
  );
}
