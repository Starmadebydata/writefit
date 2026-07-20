"use client";

// ====================================================================
// AI 反馈展示组件
// ====================================================================
// 展示 AI 对用户写作的诊断结果
// 包括：3 个主要问题、最好的句子、最像 AI 的句子、下一步目标
// ====================================================================

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertCircle, ThumbsUp, Bot, Target, Settings, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import type { DiagnoseFeedback, StoryScores, StoryGrade } from "@/lib/ai/schemas";
import { scoreLabel, storyDimensionLabel, storyGradeLabel } from "@/lib/ai/schemas";

interface FeedbackPanelProps {
  feedback: DiagnoseFeedback;
  // 是否是模拟数据
  isMock?: boolean;
  // 是否是 dev 演示模式（未登录）：模拟反馈的 CTA 引导注册而不是去设置页
  isDev?: boolean;
}

export function FeedbackPanel({ feedback, isMock, isDev }: FeedbackPanelProps) {
  const t = useTranslations("practice.feedback");
  const locale = useLocale() as "en" | "zh";
  return (
    <div className="space-y-4">
      {/* 模拟数据提示 + 配置引导（首次体验的关键转化点） */}
      {isMock && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800 flex items-center justify-between gap-3 flex-wrap">
          <span>{isDev ? t("mockNoticeDev") : t("mockNotice")}</span>
          <Button size="sm" variant="outline" className="border-amber-300 bg-white/60" render={<Link href={isDev ? "/auth/register" : "/settings"} />}>
            <Settings className="h-3.5 w-3.5" />
            {isDev ? t("mockCtaRegister") : t("mockCta")}
          </Button>
        </div>
      )}

      {/* 评分卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreCard label={t("scores.clarity")} score={feedback.scores.clarity} locale={locale} />
        <ScoreCard label={t("scores.specificity")} score={feedback.scores.specificity} locale={locale} />
        <ScoreCard label={t("scores.voice")} score={feedback.scores.voice} locale={locale} />
        <ScoreCard label={t("scores.aiLike")} score={feedback.scores.ai_like} reverse locale={locale} />
      </div>

      {/* 叙事五项评级（大泽讲评式，仅叙事类练习返回） */}
      {feedback.story_scores && (
        <StoryScoreRow scores={feedback.story_scores} locale={locale} />
      )}

      {/* 3 个主要问题 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            {t("topIssues")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {feedback.top_issues.map((issue, i) => (
            <div
              key={i}
              className="border-l-2 border-destructive/30 pl-4 space-y-2"
            >
              <div className="flex items-start gap-2">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-xs font-bold">
                  {i + 1}
                </span>
                <h4 className="font-semibold text-sm">{issue.issue}</h4>
              </div>

              {/* 引用原文 */}
              <div className="rounded-md bg-muted px-3 py-2 text-sm italic text-muted-foreground">
                &ldquo;{issue.evidence}&rdquo;
              </div>

              {/* 为什么重要 */}
              <p className="text-sm text-muted-foreground">
                {issue.why_it_matters}
              </p>

              {/* 修改任务 */}
              <div className="rounded-md bg-primary/5 border border-primary/20 px-3 py-2">
                <p className="text-sm">
                  <span className="font-semibold text-primary">{t("revisionTask")}</span>
                  {issue.revision_task}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* 最好的句子 */}
      {feedback.best_sentence && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ThumbsUp className="h-4 w-4 text-primary" />
              {t("bestSentence")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed">
              &ldquo;{feedback.best_sentence}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      {/* 最像 AI 的句子 */}
      {feedback.most_ai_like_sentence && (
        <Card className="border-destructive/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Bot className="h-4 w-4 text-destructive" />
              {t("mostAiLike")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-base leading-relaxed text-muted-foreground">
              &ldquo;{feedback.most_ai_like_sentence}&rdquo;
            </p>
          </CardContent>
        </Card>
      )}

      {/* 下一步目标 */}
      {feedback.next_revision_goal && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-start gap-3 pt-6">
            <Target className="h-5 w-5 text-primary shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-sm mb-1">{t("nextGoal")}</p>
              <p className="text-sm text-muted-foreground">
                {feedback.next_revision_goal}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI 示范修改（默认折叠，只读参考——不替用户写） */}
      {feedback.example_revision && (
        <ExampleRevisionCard text={feedback.example_revision} />
      )}
    </div>
  );
}

// AI 示范修改卡片：只读参考，默认折叠
function ExampleRevisionCard({ text }: { text: string }) {
  const t = useTranslations("practice.feedback");
  const [open, setOpen] = useState(false);
  return (
    <Card className="border-dashed">
      <CardHeader className="pb-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-2 text-left"
        >
          <CardTitle className="flex items-center gap-2 text-base">
            <Sparkles className="h-4 w-4 text-primary" />
            {t("exampleRevision")}
          </CardTitle>
          {open ? (
            <ChevronUp className="h-4 w-4 shrink-0 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground" />
          )}
        </button>
      </CardHeader>
      {open && (
        <CardContent className="space-y-2">
          <p className="text-sm leading-relaxed whitespace-pre-wrap">{text}</p>
          <p className="text-xs text-muted-foreground">{t("exampleRevisionHint")}</p>
        </CardContent>
      )}
    </Card>
  );
}

// 叙事五项评级行（情节/角色/文笔/对话/立意，三档分级）
function StoryScoreRow({ scores, locale }: { scores: StoryScores; locale: "en" | "zh" }) {
  const keys: (keyof StoryScores)[] = ["plot", "character", "prose", "dialogue", "concept"];
  const gradeColor = (g: StoryGrade) =>
    g === "excellent"
      ? "text-primary"
      : g === "pass"
        ? "text-amber-600"
        : g === "weak"
          ? "text-destructive"
          : "text-muted-foreground";
  return (
    <div className="rounded-lg border border-border bg-card px-4 py-3">
      <p className="text-xs text-muted-foreground mb-2">
        {locale === "zh" ? "叙事五项评级" : "Story craft grades"}
      </p>
      <div className="grid grid-cols-5 gap-2 text-center">
        {keys.map((k) => (
          <div key={k}>
            <p className="text-xs text-muted-foreground">{storyDimensionLabel(k, locale)}</p>
            <p className={`text-sm font-semibold ${gradeColor(scores[k])}`}>
              {storyGradeLabel(scores[k], locale)}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

// 评分小卡片
function ScoreCard({
  label,
  score,
  reverse = false,
  locale,
}: {
  label: string;
  score: number;
  reverse?: boolean;
  locale: "en" | "zh";
}) {
  const label_text = scoreLabel(score, reverse, locale);
  const color = reverse
    ? score <= 40
      ? "text-primary"
      : score <= 60
        ? "text-amber-600"
        : "text-destructive"
    : score >= 61
      ? "text-primary"
      : score >= 41
        ? "text-amber-600"
        : "text-destructive";

  return (
    <div className="rounded-lg border border-border bg-card p-3 text-center">
      <p className="text-xs text-muted-foreground mb-1">{label}</p>
      <p className={`text-2xl font-bold tabular-nums ${color}`}>{score}</p>
      <Badge variant="secondary" className="mt-1 text-xs">
        {label_text}
      </Badge>
    </div>
  );
}
