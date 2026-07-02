// ====================================================================
// Onboarding 写作画像引导页面
// ====================================================================
// 新用户首次进入产品时，引导其完成 4 步写作画像设置
//
// 逻辑：
// 1. 未登录 → 跳转到登录页
// 2. 已登录但已有画像 → 跳转到 Dashboard（避免重复引导）
// 3. 已登录且无画像 → 显示 OnboardingFlow 引导组件
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { OnboardingFlow } from "@/components/onboarding/OnboardingFlow";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { profiles } from "@/lib/db/schema";
import { eq } from "drizzle-orm";

// 页面 SEO（根据语言切换，不收录）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Welcome to WriteFit | Set Up Your Writing Practice",
    zh: "欢迎使用 WriteFit | 设置你的写作训练",
  };

  const descriptions = {
    en: "Set your writing goals and start your daily write practice with WriteFit.",
    zh: "设置你的写作目标，开始每日写作训练。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/onboarding" },
    robots: { index: false, follow: false },
  };
}

export default async function OnboardingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 检查登录状态
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  // 查询用户是否已完成画像（已有 profile 记录则跳过引导）
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB);
  const [existing] = await db
    .select({ id: profiles.id })
    .from(profiles)
    .where(eq(profiles.userId, session.user.id))
    .limit(1);

  if (existing) {
    redirect("/dashboard");
  }

  const t = await getTranslations("onboarding");

  return (
    <AppShell title={t("title")} user={session.user}>
      <OnboardingFlow />
    </AppShell>
  );
}
