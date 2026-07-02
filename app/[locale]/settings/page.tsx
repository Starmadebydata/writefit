// ====================================================================
// 设置页面
// ====================================================================
// 用户可以在这里配置自己的 AI 服务
// 目前包含：AI 服务配置
// 后续会加入：个人资料、通知设置等
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { AISettingsForm } from "@/components/settings/AISettingsForm";
import { ProfileSettings } from "@/components/settings/ProfileSettings";
import { DataManagement } from "@/components/settings/DataManagement";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

// 设置页面 SEO（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Settings | WriteFit",
    zh: "设置 | WriteFit",
  };

  const descriptions = {
    en: "Manage your WriteFit account and AI writing coach settings.",
    zh: "管理你的 WriteFit 账户和 AI 写作教练设置。",
  };

  const keywords = {
    en: ["WriteFit settings", "AI writing coach settings"],
    zh: ["WriteFit 设置", "AI 写作教练设置"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/settings",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function SettingsPage({
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
  const t = await getTranslations("settings");

  return (
    <AppShell title={t("title")} user={session.user}>
      <div className="max-w-2xl mx-auto space-y-6">
        {/* AI 设置 */}
        <AISettingsForm />

        {/* 写作画像设置 */}
        <ProfileSettings />

        {/* 数据管理（导出/删除账号） */}
        <DataManagement />
      </div>
    </AppShell>
  );
}
