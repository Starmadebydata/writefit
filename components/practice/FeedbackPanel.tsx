"use client";

// ====================================================================
// AI 反馈展示组件
// ====================================================================
// 展示 AI 对用户写作的诊断结果
// 包括：3 个主要问题、最好的句子、最像 AI 的句子、下一步目标
// ====================================================================

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { AlertCircle, ThumbsUp, Bot, Target } from "lucide-react";
import type { DiagnoseFeedback } from "@/lib/ai/schemas";
import { scoreLabel } from "@/lib/ai/schemas";

interface FeedbackPanelProps {
  feedback: DiagnoseFeedback;
  // 是否是模拟数据
  isMock?: boolean;
}

export function FeedbackPanel({ feedback, isMock }: FeedbackPanelProps) {
  return (
    <div className="space-y-4">
      {/* 模拟数据提示 */}
      {isMock && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
          ⚠ 这是模拟反馈。配置 DEEPSEEK_API_KEY 后将获得真实 AI 诊断。
        </div>
      )}

      {/* 评分卡片 */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <ScoreCard label="清晰度" score={feedback.scores.clarity} />
        <ScoreCard label="具体性" score={feedback.scores.specificity} />
        <ScoreCard label="个人声音" score={feedback.scores.voice} />
        <ScoreCard label="AI 腔" score={feedback.scores.ai_like} reverse />
      </div>

      {/* 3 个主要问题 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <AlertCircle className="h-5 w-5 text-destructive" />
            3 个需要改进的问题
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
                  <span className="font-semibold text-primary">修改任务：</span>
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
              今天最好的句子
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
              最像 AI 的句子
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
              <p className="font-semibold text-sm mb-1">下一轮修改目标</p>
              <p className="text-sm text-muted-foreground">
                {feedback.next_revision_goal}
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// 评分小卡片
function ScoreCard({
  label,
  score,
  reverse = false,
}: {
  label: string;
  score: number;
  reverse?: boolean;
}) {
  const label_text = scoreLabel(score, reverse);
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
