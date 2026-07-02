// ====================================================================
// AI 设置页面（不需要登录）
// ====================================================================
// 这个页面让用户在配置登录环境变量之前就能设置自己的 AI 服务
// 开发阶段用 localStorage 存储，生产环境用数据库
// ====================================================================

import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { AISettingsForm } from "@/components/settings/AISettingsForm";
import { ArrowLeft } from "lucide-react";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

// AI 设置页面 SEO（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Configure Your AI Writing Coach | WriteFit",
    zh: "配置你的 AI 写作教练 | WriteFit",
  };

  const descriptions = {
    en: "Set up your own AI writing coach for write practice. Connect DeepSeek, OpenAI, or any OpenAI-compatible API to get personalized writing feedback.",
    zh: "设置你自己的 AI 写作教练进行写作训练。连接 DeepSeek、OpenAI 或任何兼容 OpenAI 接口格式的 AI 服务，获得个性化写作反馈。",
  };

  const keywords = {
    en: [
      "AI writing coach setup",
      "configure AI writing",
      "writing feedback API",
      "DeepSeek writing coach",
      "OpenAI writing assistant",
    ],
    zh: ["AI 写作教练设置", "配置 AI 写作", "写作反馈 API", "DeepSeek 写作教练", "OpenAI 写作助手"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/ai-setup",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function AISetupPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 获取翻译
  const t = await getTranslations("aiSetup");

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            W
          </div>
          <span className="font-semibold">WriteFit</span>
        </Link>
        <Button variant="ghost" size="sm" render={<Link href="/practice/dev" />}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          {t("backToPractice")}
        </Button>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">{t("title")}</h1>
            <p className="text-muted-foreground">{t("desc")}</p>
          </div>

          <AISettingsForm />
        </div>
      </main>
    </div>
  );
}
