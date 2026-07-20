// ====================================================================
// WriteFit Landing Page（首页）
// ====================================================================
// 这是用户第一次访问 WriteFit 看到的页面
// 作用：解释产品价值，引导用户开始训练
//
// 页面结构：
// 1. Hero —— 核心标语 + 开始按钮
// 2. 问题陈述 —— 你是否也有这些写作问题？
// 3. 产品机制 —— WriteFit 怎么帮你
// 4. 核心功能 —— 主要功能介绍
// 5. 用户场景 —— 谁适合用 WriteFit
// 6. CTA —— 最终行动号召
// ====================================================================

import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { softwareApplicationJsonLd } from "@/lib/jsonld";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import {
  PenLine,
  Brain,
  Scissors,
  FileText,
  Lightbulb,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";

// 动态 SEO 元数据
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "WriteFit | Start Your Daily Write Practice with an AI Coach",
    zh: "WriteFit | AI 写作教练 - 每日写作训练",
  };

  const descriptions = {
    en: "Looking for a write practice that actually works? WriteFit is an AI writing coach that gives you daily writing exercises, instant feedback, and a clear path to improve your writing.",
    zh: "寻找真正有效的写作训练？WriteFit 是 AI 写作教练，提供每日写作练习、即时反馈和清晰的提升路径。",
  };

  const keywords = {
    en: ["write practice", "writing practice", "daily writing practice", "writing exercises", "AI writing coach"],
    zh: ["写作训练", "写作练习", "每日写作", "AI 写作教练", "提升写作"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: locale === "zh" ? "/zh" : "/",
      languages: {
        en: "/",
        zh: "/zh",
        "x-default": "/",
      },
    },
  };
}

export default async function LandingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      {/* JSON-LD：SoftwareApplication（含三档定价，AI 取数来源） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      <LandingContent />
    </>
  );
}

function LandingContent() {
  const t = useTranslations("landing");
  const tCommon = useTranslations("common");

  return (
    <div className="flex flex-col">
      {/* ================================================================
          0. 顶部导航 —— 登录入口 + 语言切换
      ================================================================ */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              W
            </div>
            <span className="font-semibold">WriteFit</span>
          </div>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Button variant="ghost" size="sm" render={<Link href="/pricing" />}>
              {t("nav.pricing")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/methodology" />}
            >
              {t("nav.methodology")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/blog" />}
            >
              {t("nav.blog")}
            </Button>
            <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
              {t("nav.login")}
            </Button>
            <Button size="sm" render={<Link href="/auth/register" />}>
              {t("startTraining")}
            </Button>
          </div>
        </div>
      </header>

      {/* ================================================================
          1. Hero 区域 —— 核心标语
      ================================================================ */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              W
            </div>
            <span className="text-2xl font-bold">WriteFit</span>
          </div>

          <Badge variant="secondary" className="mb-6">
            {t("heroBadge")}
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6 whitespace-pre-line">
            {t("heroTitle")}
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto whitespace-pre-line">
            {t("heroDesc")}
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" render={<Link href="/auth/register" />}>
              {t("startTraining")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#how-it-works" />}>
              {t("learnMore")}
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            {tCommon("tagline")}
          </p>

          {/* 开发测试入口 */}
          <p className="mt-4 text-xs">
            <Link href="/practice/dev" className="text-primary hover:underline">
              {t("tryDemo")}
            </Link>
          </p>
        </div>
      </section>

      {/* ================================================================
          2. 问题陈述 —— 你是否也有这些问题？
      ================================================================ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          {t("problems.title")}
        </h2>

        <div className="grid gap-4 md:grid-cols-2">
          {t.raw("problems.items").map((problem: string, i: number) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                {i + 1}
              </span>
              <p className="text-sm">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          3. 产品机制 —— WriteFit 怎么帮你
      ================================================================ */}
      <section id="how-it-works" className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("mechanism.title")}
          </h2>

          <div className="grid gap-6 md:grid-cols-5">
            {t.raw("mechanism.steps").map((step: { title: string; desc: string }, i: number) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {i + 1}
                </div>
                <h3 className="font-semibold mb-1">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          4. 核心功能
      ================================================================ */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">{t("features.title")}</h2>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            { icon: PenLine, key: 0 },
            { icon: Brain, key: 1 },
            { icon: Scissors, key: 2 },
            { icon: Shield, key: 3 },
            { icon: FileText, key: 4 },
            { icon: Lightbulb, key: 5 },
          ].map(({ icon: Icon, key }) => (
            <Card key={key}>
              <CardHeader>
                <Icon className="h-8 w-8 text-primary mb-2" />
                <CardTitle>{t(`features.items.${key}.title`)}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {t(`features.items.${key}.desc`)}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ================================================================
          5. 用户场景 —— 谁适合用 WriteFit
      ================================================================ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4">
            {t("scenarios.title")}
          </h2>

          <div className="grid gap-4 md:grid-cols-2 mt-8">
            {t.raw("scenarios.items").map((scenario: string, i: number) => (
              <div key={i} className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card">
                <TrendingUp className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                <p className="text-sm">{scenario}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          5.5 FAQ —— 常见问题（同时输出 FAQPage JSON-LD，供 AI/搜索抽取）
      ================================================================ */}
      <FaqSection t={t} />

      {/* ================================================================
          6. CTA —— 最终行动号召
      ================================================================ */}
      <section className="mx-auto max-w-4xl px-6 py-20 text-center">
        <h2 className="text-3xl font-bold mb-4">{t("cta.title")}</h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          {t("cta.desc")}
        </p>
        <Button size="lg" render={<Link href="/auth/register" />}>
          {t("cta.button")}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      {/* ================================================================
          7. 页脚 —— 合规与导航链接
      ================================================================ */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} WriteFit</p>
          <nav className="flex items-center gap-4">
            <Link href="/pricing" className="hover:text-foreground">
              {t("nav.pricing")}
            </Link>
            <Link href="/about" className="hover:text-foreground">
              {t("footer.about")}
            </Link>
            <Link href="/methodology" className="hover:text-foreground">
              {t("footer.methodology")}
            </Link>
            <Link href="/blog" className="hover:text-foreground">
              {t("footer.blog")}
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              {t("footer.privacy")}
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              {t("footer.terms")}
            </Link>
            <Link href="/auth/login" className="hover:text-foreground">
              {t("nav.login")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}


// ====================================================================
// FAQ 区块（Landing 专用）
// 可见问答与 FAQPage JSON-LD 同源（同一份翻译文案），
// 保证 schema 内容与页面文字一致，供搜索引擎/AI 抽取。
// ====================================================================
function FaqSection({ t }: { t: ReturnType<typeof useTranslations> }) {
  const items = t.raw("faq.items") as Array<{ q: string; a: string }>;

  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="text-3xl font-bold text-center mb-10">
        {t("faq.title")}
      </h2>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div
            key={i}
            className="rounded-lg border border-border bg-card p-5"
          >
            <h3 className="font-semibold mb-2">{item.q}</h3>
            <p className="text-sm text-muted-foreground leading-7">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
