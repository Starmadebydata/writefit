"use client";

// ====================================================================
// 首页 / 落地页轻量试用区块
// ====================================================================
// 不复用 918 行的 PracticeFlow 全流程组件——营销页不需要计时器、
// 落库、streak、草稿恢复 toast 这些。这里只做 3 步：写 → AI 诊断 → 反馈。
//
// 诊断走 /api/ai/diagnose 的匿名路径（每 IP 每天 2 次真实 AI，
// 见 lib/billing/anonUsage.ts）；超额时不报错，展示注册引导卡。
//
// 题目用 generateTodayPractice 是纯函数（依赖当前日期），此组件所在的
// 页面是 SSG 静态页——若在渲染期直接算，题目会被冻结在构建当天。
// 因此题目延迟到 mounted 后才在客户端计算，挂载前渲染骨架。
// ====================================================================

import { useEffect, useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { FeedbackPanel } from "./FeedbackPanel";
import { Link } from "@/i18n/navigation";
import { generateTodayPractice, type TodayPractice } from "@/lib/practice/scheduler";
import { countWords } from "@/lib/utils";
import type { DiagnoseFeedback } from "@/lib/ai/schemas";
import { ArrowRight, Loader2, PenLine } from "lucide-react";
import { toast } from "sonner";

const MIN_WORDS = 30;

interface TryItSectionProps {
  // 埋点/文案区分来源：首页 vs 独立落地页
  variant?: "home" | "landing-page";
}

type Step = "writing" | "diagnosing" | "feedback" | "quota-exceeded";

export function TryItSection({ variant = "home" }: TryItSectionProps) {
  const t = useTranslations("landing.tryIt");
  const locale = useLocale() as "en" | "zh";

  const [mounted, setMounted] = useState(false);
  const [practice, setPractice] = useState<TodayPractice | null>(null);
  const [step, setStep] = useState<Step>("writing");
  const [text, setText] = useState("");
  const [feedback, setFeedback] = useState<DiagnoseFeedback | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [remaining, setRemaining] = useState<number | null>(null);

  // 挂载后才在客户端计算今日题目，避免 SSG 把"今日"冻结在构建日
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    setPractice(generateTodayPractice(10, locale, `home-${variant}`));
  }, [locale, variant]);

  const wordCount = countWords(text);
  const canSubmit = wordCount >= MIN_WORDS;

  async function handleDiagnose() {
    if (!canSubmit) {
      toast.error(t("errorMinWords", { minWords: MIN_WORDS }));
      return;
    }
    setStep("diagnosing");
    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, language: locale }),
      });

      if (!res.ok) {
        if (res.status === 402) {
          setStep("quota-exceeded");
          return;
        }
        throw new Error("diagnose failed");
      }

      const data = await res.json();
      setFeedback(data);
      setIsMock(!!data._mock);
      setRemaining(typeof data._anonRemaining === "number" ? data._anonRemaining : null);
      setStep("feedback");
    } catch {
      toast.error(t("errorFailed"));
      setStep("writing");
    }
  }

  function reset() {
    setStep("writing");
    setText("");
    setFeedback(null);
    setIsMock(false);
  }

  return (
    <section id="try-it" className="mx-auto max-w-3xl px-6 py-20">
      <div className="text-center mb-8">
        <Badge variant="secondary" className="mb-3">
          {t("badge")}
        </Badge>
        <h2 className="text-3xl font-bold mb-3">{t("title")}</h2>
        <p className="text-muted-foreground max-w-xl mx-auto">{t("subtitle")}</p>
      </div>

      {!mounted || !practice ? (
        <Card>
          <CardContent className="py-16 flex items-center justify-center text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin mr-2" />
            {t("loading")}
          </CardContent>
        </Card>
      ) : (
        <>
          {step === "writing" && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <PenLine className="h-4 w-4 text-primary" />
                  {t("promptLabel")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md bg-muted/50 px-4 py-3 text-sm italic">
                  {practice.prompt}
                </div>
                <Textarea
                  value={text}
                  onChange={(e) => setText(e.target.value)}
                  placeholder={t("placeholder")}
                  className="min-h-[160px] resize-none"
                />
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">
                    {t("wordCount", { count: wordCount, min: MIN_WORDS })}
                  </span>
                  <Button onClick={handleDiagnose} disabled={!canSubmit}>
                    {t("submit")}
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {step === "diagnosing" && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-16">
                <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
                <p className="font-semibold">{t("diagnosing")}</p>
              </CardContent>
            </Card>
          )}

          {step === "feedback" && feedback && (
            <div className="space-y-4">
              <FeedbackPanel feedback={feedback} isMock={isMock} isDev />
              {remaining !== null && (
                <p className="text-center text-xs text-muted-foreground">
                  {t("remainingToday", { count: remaining })}
                </p>
              )}
              <Card className="border-primary/30 bg-primary/5">
                <CardContent className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-6">
                  <p className="text-sm">{t("continueCta")}</p>
                  <div className="flex gap-2 shrink-0">
                    <Button variant="ghost" size="sm" onClick={reset}>
                      {t("tryAnother")}
                    </Button>
                    <Button size="sm" render={<Link href="/auth/register" />}>
                      {t("registerCta")}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {step === "quota-exceeded" && (
            <Card className="border-primary/30 bg-primary/5">
              <CardContent className="flex flex-col items-center text-center gap-3 py-10">
                <p className="font-semibold">{t("quotaExceededTitle")}</p>
                <p className="text-sm text-muted-foreground max-w-sm">
                  {t("quotaExceededDesc")}
                </p>
                <Button render={<Link href="/auth/register" />}>
                  {t("registerCta")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          )}

          <p className="mt-4 text-center text-xs text-muted-foreground">
            {t("noLoginNeeded")}
          </p>
        </>
      )}
    </section>
  );
}
