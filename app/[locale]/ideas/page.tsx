// ====================================================================
// 素材库页面
// ====================================================================
// 展示用户保存的所有可复用写作素材
// 支持类型过滤、搜索、收藏、新建、编辑、删除
// 实际功能在 IdeaBank 客户端组件中实现
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { IdeaBank } from "@/components/ideas/IdeaBank";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "My Writing Ideas | WriteFit",
    zh: "我的写作素材 | WriteFit",
  };

  const descriptions = {
    en: "Save and organize your best writing ideas, sentences, and observations.",
    zh: "保存和整理你最好的写作灵感、句子和观察。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/ideas" },
    robots: { index: false, follow: false },
  };
}

export default async function IdeasPage({
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

  const t = await getTranslations("ideas");

  return (
    <AppShell title={t("title")} user={session.user}>
      <IdeaBank />
    </AppShell>
  );
}
