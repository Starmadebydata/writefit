// ====================================================================
// 公开演示页（有意免登录，SEO 转化入口）
// ====================================================================
// 首页/博客/methodology 都把这里作为"免注册体验"入口链接。
// 匿名用户按 IP 每天可用 2 次真实 AI 诊断（见 lib/billing/anonUsage.ts）；
// 超额或平台未配置 Key 时才回退客户端 mock 反馈（见 PracticeFlow isDev 分支）。
// 训练数据不落库。
// ====================================================================

import type { Metadata } from "next";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeFlow } from "@/components/practice/PracticeFlow";
import { generateTodayPractice } from "@/lib/practice/scheduler";
import { ArrowLeft, Info } from "lucide-react";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";

// 开发测试页面 SEO（上线后可保留作为产品演示）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Try Write Practice Online | WriteFit Demo",
    zh: "在线体验写作训练 | WriteFit 演示",
  };

  const descriptions = {
    en: "Try WriteFit's write practice demo online. Experience a daily writing exercise with AI feedback — no login required.",
    zh: "在线体验 WriteFit 写作训练演示。体验每日写作练习和 AI 反馈——无需登录。",
  };

  const keywords = {
    en: [
      "write practice online",
      "writing practice demo",
      "try writing practice",
      "online writing exercise",
      "AI writing coach",
    ],
    zh: ["在线写作训练", "写作训练演示", "体验写作训练", "在线写作练习", "AI 写作教练"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: locale === "zh" ? "/zh/practice/dev" : "/practice/dev",
      languages: {
        en: "/practice/dev",
        zh: "/zh/practice/dev",
        "x-default": "/practice/dev",
      },
    },
  };
}

export default async function PracticeDevPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  // 获取翻译
  const t = await getTranslations("dev");

  // 生成今日训练任务（根据语言选择对应题库）
  // 传固定 seed：同一天内题目稳定，刷新后 localStorage 草稿才能恢复
  const todayPractice = generateTodayPractice(10, locale as "en" | "zh", "dev");

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航（简化版，不需要登录） */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            W
          </div>
          <span className="font-semibold">WriteFit</span>
          <span className="text-xs text-muted-foreground ml-2">{t("title")}</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            {t("backHome")}
          </Button>
        </div>
      </header>

      <main className="p-6">
        {/* 说明卡片 */}
        <Card className="max-w-3xl mx-auto mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">{t("devMode")}</p>
              <p>
                {t("desc")}{" "}
                <Link href="/auth/register" className="underline font-medium">
                  {t("registerCta")}
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>

        <PracticeFlow
          practiceType={todayPractice.practiceType}
          prompt={todayPractice.prompt}
          estimatedMinutes={todayPractice.estimatedMinutes}
          isDev={true}
        />
      </main>
    </div>
  );
}
