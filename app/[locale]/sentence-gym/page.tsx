// ====================================================================
// 句子训练页面
// ====================================================================
// 用户对单个句子或段落进行专项训练
// 实际功能在 SentenceGym 客户端组件中实现
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { SentenceGym } from "@/components/sentence-gym/SentenceGym";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Sentence Gym | WriteFit",
    zh: "句子训练 | WriteFit",
  };

  const descriptions = {
    en: "Train your sentences with targeted writing exercises.",
    zh: "通过针对性写作练习训练你的句子。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/sentence-gym" },
    robots: { index: false, follow: false },
  };
}

export default async function SentenceGymPage({
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

  const t = await getTranslations("sentenceGym");

  return (
    <AppShell title={t("title")} user={session.user}>
      <SentenceGym />
    </AppShell>
  );
}
