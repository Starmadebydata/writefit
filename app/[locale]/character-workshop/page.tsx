// ====================================================================
// 人物工坊页面（神圣缺陷切入法）
// ====================================================================
// 五步引导式人物构建：神圣缺陷 → 创伤起源 → 确认偏差 → 控制理论 → 爆点
// 实际功能在 CharacterWorkshop 客户端组件中实现
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { CharacterWorkshop } from "@/components/workshop/CharacterWorkshop";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Character Workshop | WriteFit",
    zh: "人物工坊 | WriteFit",
  };

  const descriptions = {
    en: "Build a character that holds up, step by step, with the Sacred Flaw approach.",
    zh: "用神圣缺陷切入法，一步步构建立得住的人物。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/character-workshop" },
    robots: { index: false, follow: false },
  };
}

export default async function CharacterWorkshopPage({
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

  const t = await getTranslations("nav");

  return (
    <AppShell title={t("characterWorkshop")} user={session.user}>
      <CharacterWorkshop />
    </AppShell>
  );
}
