// ====================================================================
// 草稿实验室页面
// ====================================================================
// 用户管理长文草稿，支持版本保存、AI 诊断、反 AI 腔检测、Markdown 导出
// 实际功能在 DraftLab 客户端组件中实现
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { DraftLab } from "@/components/drafts/DraftLab";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "My Drafts | WriteFit",
    zh: "我的草稿 | WriteFit",
  };

  const descriptions = {
    en: "Manage your writing drafts and revisions.",
    zh: "管理你的写作草稿和修改版本。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: { canonical: "https://writefit.app/drafts" },
    robots: { index: false, follow: false },
  };
}

export default async function DraftsPage({
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

  const t = await getTranslations("drafts");

  return (
    <AppShell title={t("title")} user={session.user}>
      <DraftLab />
    </AppShell>
  );
}
