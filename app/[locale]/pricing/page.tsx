// ====================================================================
// Pricing 定价页（公开页面）
// ====================================================================
// 展示 Free / Basic / Pro 三档套餐
// 是 402 配额提示、设置页升级入口、Landing 价格入口的落地页
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/layout/LanguageSwitcher";
import { PricingCards } from "@/components/pricing/PricingCards";
import { PLANS, type Plan } from "@/lib/billing/plans";
import { getUserPlan } from "@/lib/billing/plans";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { softwareApplicationJsonLd } from "@/lib/jsonld";

// Pricing 页 SEO（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Pricing | WriteFit",
    zh: "定价 | WriteFit",
  };

  const descriptions = {
    en: "WriteFit pricing: start free with 5 AI coaching sessions a day, upgrade to Basic or Pro for more daily AI feedback on your writing.",
    zh: "WriteFit 定价：免费版每天 5 次 AI 写作反馈，升级 Basic 或 Pro 获得更多每日 AI 教练次数。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: {
      canonical: locale === "zh" ? "/zh/pricing" : "/pricing",
      languages: {
        en: "/pricing",
        zh: "/zh/pricing",
        "x-default": "/pricing",
      },
    },
  };
}

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("pricing");

  // 登录用户显示"当前套餐"；未登录按未登录渲染
  const session = await auth();
  let currentPlan: Plan | null = null;
  if (session?.user?.id) {
    currentPlan = await getUserPlan(session.user.id);
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* JSON-LD：SoftwareApplication（含三档定价，AI 取数来源） */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(softwareApplicationJsonLd),
        }}
      />
      {/* 顶部导航（与 Landing 一致的简化版） */}
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-3">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
              W
            </div>
            <span className="font-semibold">WriteFit</span>
          </Link>
          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/methodology" />}
            >
              {t("footer.methodology")}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="hidden sm:inline-flex"
              render={<Link href="/blog" />}
            >
              {t("footer.blog")}
            </Button>
            {session?.user ? (
              <Button variant="ghost" size="sm" render={<Link href="/dashboard" />}>
                Dashboard
              </Button>
            ) : (
              <Button variant="ghost" size="sm" render={<Link href="/auth/login" />}>
                {t("login")}
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-6 py-16">
          {/* 页头 */}
          <div className="text-center mb-12">
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">
              {t("title")}
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t("desc")}
            </p>
          </div>

          <PricingCards
            isLoggedIn={!!session?.user}
            currentPlan={currentPlan}
            prices={{
              basic: { monthly: PLANS.basic.pricing!.monthly, yearly: PLANS.basic.pricing!.yearly },
              pro: { monthly: PLANS.pro.pricing!.monthly, yearly: PLANS.pro.pricing!.yearly },
            }}
          />

          {/* SSR 静态对比表：月付价直接进首包 HTML（不藏在 JS toggle 后），
              供搜索引擎与 AI 系统直接抽取 */}
          <section className="mt-16">
            <h2 className="text-2xl font-bold text-center mb-4">
              {t("comparison.title")}
            </h2>
            <p className="text-muted-foreground text-center max-w-3xl mx-auto mb-8 leading-7">
              {t("comparison.summary", {
                freeLimit: PLANS.free.dailyAiLimit,
                basicMonthly: PLANS.basic.pricing!.monthly,
                basicYearly: PLANS.basic.pricing!.yearly,
                basicLimit: PLANS.basic.dailyAiLimit,
                proMonthly: PLANS.pro.pricing!.monthly,
                proYearly: PLANS.pro.pricing!.yearly,
                proLimit: PLANS.pro.dailyAiLimit,
              })}
            </p>
            <div className="overflow-x-auto max-w-3xl mx-auto">
              <table className="w-full border-collapse text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="py-3 pr-4 font-semibold">{t("comparison.planCol")}</th>
                    <th className="py-3 pr-4 font-semibold">{t("comparison.monthlyCol")}</th>
                    <th className="py-3 pr-4 font-semibold">{t("comparison.yearlyCol")}</th>
                    <th className="py-3 font-semibold">{t("comparison.limitCol")}</th>
                  </tr>
                </thead>
                <tbody>
                  {(["free", "basic", "pro"] as Plan[]).map((plan) => {
                    const pricing = PLANS[plan].pricing;
                    return (
                      <tr key={plan} className="border-b border-border">
                        <td className="py-3 pr-4 font-medium">
                          {t(`plans.${plan}.name`)}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {pricing ? `$${pricing.monthly}` : t("comparison.freePrice")}
                        </td>
                        <td className="py-3 pr-4 text-muted-foreground">
                          {pricing ? `$${pricing.yearly}` : t("comparison.freePrice")}
                        </td>
                        <td className="py-3 text-muted-foreground">
                          {PLANS[plan].dailyAiLimit} {t("comparison.sessionsPerDay")}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <p className="text-sm text-muted-foreground text-center max-w-3xl mx-auto mt-4">
              {t("comparison.byokNote")}
            </p>
          </section>
        </div>
      </main>

      {/* 页脚（与 Landing 一致） */}
      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 px-6 py-6 text-sm text-muted-foreground sm:flex-row">
          <p>© {new Date().getFullYear()} WriteFit</p>
          <nav className="flex items-center gap-4">
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
          </nav>
        </div>
      </footer>
    </div>
  );
}
