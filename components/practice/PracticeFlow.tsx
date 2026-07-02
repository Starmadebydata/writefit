"use client";

// ====================================================================
// 今日训练完整流程组件
// ====================================================================
// 这是 WriteFit 的核心组件，包含完整的 5 阶段训练流程：
//
// Stage 1: 看题目 —— 展示今日训练类型、题目、规则
// Stage 2: 计时写作 —— 用户在限定时间内写原始稿，AI 不介入
// Stage 3: AI 诊断 —— AI 分析原稿，给出 3 个具体问题
// Stage 4: 手动修改 —— 左右双栏，用户根据反馈修改
// Stage 5: 版本对比 + 保存素材 —— 看到改了什么，保存好句
//
// 状态管理：用 useState 管理当前阶段和各阶段的数据
// ====================================================================

import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { PracticeTimer } from "./PracticeTimer";
import { PracticeEditor } from "./PracticeEditor";
import { FeedbackPanel } from "./FeedbackPanel";
import { DiffViewer } from "./DiffViewer";
import { SaveIdeaButton } from "./SaveIdeaButton";
import { getAISettingsFromLocal, type AISettings } from "@/lib/ai/settings";
import {
  PenLine,
  Brain,
  Scissors,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { DiagnoseFeedback, CompareRevisionFeedback } from "@/lib/ai/schemas";
import { PRACTICE_TYPE_LABELS, type PracticeType } from "@/lib/practice/prompts";
import { countWords } from "@/lib/utils";
import { toast } from "sonner";

// 训练阶段定义
type Stage = "intro" | "writing" | "diagnosing" | "feedback" | "revising" | "complete";

interface PracticeFlowProps {
  practiceType: PracticeType;
  prompt: string;
  estimatedMinutes: number;
  // 是否是开发模式（不需要登录）
  isDev?: boolean;
  // 用户名（用于完成页显示）
  userName?: string;
}

export function PracticeFlow({
  practiceType,
  prompt,
  estimatedMinutes,
  isDev = false,
}: PracticeFlowProps) {
  // ---- 状态管理 ----
  const [stage, setStage] = useState<Stage>("intro");
  const [rawText, setRawText] = useState(""); // 原始稿
  const [revisedText, setRevisedText] = useState(""); // 修改稿
  const [feedback, setFeedback] = useState<DiagnoseFeedback | null>(null);
  const [isMockFeedback, setIsMockFeedback] = useState(false);
  const [comparison, setComparison] = useState<CompareRevisionFeedback | null>(null);
  const [loading, setLoading] = useState(false);

  // 最低字数要求
  const minWords = 50;

  // ---- 阶段 1 → 阶段 2：开始写作 ----
  const startWriting = () => setStage("writing");

  // ---- 获取用户的 AI 配置 ----
  function getAIConfig(): AISettings | null {
    return getAISettingsFromLocal();
  }

  // ---- 阶段 2 → 阶段 3：提交原始稿，请求 AI 诊断 ----
  const submitDraft = useCallback(async () => {
    if (countWords(rawText) < minWords) {
      toast.error(`至少需要 ${minWords} 字才能提交`);
      return;
    }

    setStage("diagnosing");
    setLoading(true);

    try {
      // 获取用户的 AI 配置
      const aiConfig = getAIConfig();

      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: rawText, language: "zh", aiConfig }),
      });

      if (!res.ok) throw new Error("诊断失败");

      const data = await res.json();
      setFeedback(data);
      setIsMockFeedback(!!data._mock);
      setStage("feedback");
    } catch {
      toast.error("AI 诊断失败，请重试");
      setStage("writing");
    } finally {
      setLoading(false);
    }
  }, [rawText]);

  // ---- 阶段 3 → 阶段 4：进入修改阶段 ----
  const startRevising = () => {
    // 把原稿复制到修改稿，用户在此基础上修改
    setRevisedText(rawText);
    setStage("revising");
  };

  // ---- 阶段 4 → 阶段 5：提交修改稿，查看对比 ----
  const submitRevision = useCallback(async () => {
    if (revisedText.trim() === rawText.trim()) {
      toast.error("你还没有修改任何内容");
      return;
    }

    setLoading(true);
    setStage("complete");

    try {
      const aiConfig = getAIConfig();
      const res = await fetch("/api/ai/compare-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ original: rawText, revised: revisedText, aiConfig }),
      });

      if (!res.ok) throw new Error("对比失败");

      const data = await res.json();
      setComparison(data);
    } catch {
      // 即使对比失败，也展示 diff
      toast.error("版本对比失败，但你可以查看差异");
    } finally {
      setLoading(false);
    }
  }, [rawText, revisedText]);

  // ---- 重新开始 ----
  const restart = () => {
    setStage("intro");
    setRawText("");
    setRevisedText("");
    setFeedback(null);
    setComparison(null);
  };

  // ---- 渲染各阶段 ----

  // 阶段进度指示器
  const stages: { key: Stage; label: string; icon: typeof PenLine }[] = [
    { key: "intro", label: "题目", icon: PenLine },
    { key: "writing", label: "写作", icon: PenLine },
    { key: "feedback", label: "诊断", icon: Brain },
    { key: "revising", label: "修改", icon: Scissors },
    { key: "complete", label: "完成", icon: CheckCircle2 },
  ];
  const currentStageIndex = stages.findIndex(
    (s) => s.key === stage || (stage === "diagnosing" && s.key === "feedback")
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 开发模式提示 */}
      {isDev && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          🔧 开发测试模式 —— 不需要登录，训练数据不会保存到数据库
        </div>
      )}

      {/* 阶段进度条 */}
      <div className="flex items-center justify-between gap-2">
        {stages.map((s, i) => {
          const Icon = s.icon;
          const isDone = i < currentStageIndex;
          const isCurrent = i === currentStageIndex;
          return (
            <div key={s.key} className="flex items-center gap-2 flex-1">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold shrink-0 ${
                  isDone
                    ? "bg-primary text-primary-foreground"
                    : isCurrent
                      ? "bg-primary text-primary-foreground ring-4 ring-primary/20"
                      : "bg-muted text-muted-foreground"
                }`}
              >
                {isDone ? <CheckCircle2 className="h-4 w-4" /> : <Icon className="h-4 w-4" />}
              </div>
              <span className={`text-xs hidden sm:inline ${isCurrent ? "font-semibold" : "text-muted-foreground"}`}>
                {s.label}
              </span>
              {i < stages.length - 1 && (
                <div className={`flex-1 h-0.5 ${isDone ? "bg-primary" : "bg-border"}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* ====== Stage 1: 任务说明 ====== */}
      {stage === "intro" && (
        <Card>
          <CardHeader>
            <Badge variant="secondary" className="w-fit mb-2">
              {PRACTICE_TYPE_LABELS[practiceType]}
            </Badge>
            <CardTitle className="text-2xl">今日题目</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-6">
              <p className="text-lg leading-relaxed font-medium">{prompt}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                写作时长：约 {estimatedMinutes} 分钟
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                规则：先写完原始稿，AI 才会给你反馈
              </p>
              <p className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                AI 不会替你写，只做你的教练和批评者
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={startWriting}>
              开始写作
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* ====== Stage 2: 计时写作 ====== */}
      {stage === "writing" && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">写下你的原始稿</CardTitle>
              <PracticeTimer
                minutes={estimatedMinutes}
                isRunning={stage === "writing"}
                onTimeUp={() => toast.info("时间到了！你可以继续写完当前句子，然后提交。")}
              />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 题目提醒 */}
            <div className="rounded-md bg-muted/50 px-4 py-2 text-sm text-muted-foreground italic">
              {prompt}
            </div>

            <PracticeEditor
              value={rawText}
              onChange={setRawText}
              minWords={minWords}
            />

            <div className="flex justify-between items-center">
              <Button variant="ghost" onClick={() => setStage("intro")}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                返回
              </Button>
              <Button
                onClick={submitDraft}
                disabled={countWords(rawText) < minWords}
              >
                提交并获取 AI 反馈
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ====== Stage 2.5: AI 诊断中 ====== */}
      {stage === "diagnosing" && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
            <p className="text-lg font-semibold">AI 正在分析你的写作...</p>
            <p className="text-sm text-muted-foreground mt-2">
              AI 会引用你的原文，找出 3 个具体问题
            </p>
          </CardContent>
        </Card>
      )}

      {/* ====== Stage 3: AI 诊断反馈 ====== */}
      {stage === "feedback" && feedback && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">AI 诊断反馈</h2>
            <Button onClick={startRevising}>
              根据反馈修改
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <FeedbackPanel feedback={feedback} isMock={isMockFeedback} />
        </div>
      )}

      {/* ====== Stage 4: 手动修改 ====== */}
      {stage === "revising" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">根据反馈修改</h2>
            <Button onClick={submitRevision} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  对比中...
                </>
              ) : (
                <>
                  提交修改稿
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* AI 反馈提醒（折叠版） */}
          {feedback && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold mb-2">修改目标：</p>
                <p className="text-sm text-muted-foreground">{feedback.next_revision_goal}</p>
                <div className="mt-3 space-y-1">
                  {feedback.top_issues.map((issue, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {i + 1}. {issue.issue} → {issue.revision_task}
                    </p>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* 左右双栏：原稿 vs 修改区 */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">原稿（只读）</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={rawText}
                  readOnly
                  className="min-h-[300px] resize-none bg-muted/30 text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            <Card className="border-primary/30">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-primary">你的修改稿</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={revisedText}
                  onChange={(e) => setRevisedText(e.target.value)}
                  className="min-h-[300px] resize-none text-sm leading-relaxed focus-visible:ring-primary/50"
                  placeholder="在这里修改你的文字..."
                />
              </CardContent>
            </Card>
          </div>

          <Button variant="ghost" onClick={() => setStage("feedback")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            返回查看反馈
          </Button>
        </div>
      )}

      {/* ====== Stage 5: 版本对比 + 保存素材 + 完成 ====== */}
      {stage === "complete" && (
        <div className="space-y-6">
          <div className="text-center">
            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 mb-3">
              <Trophy className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-2xl font-bold">训练完成！</h2>
            <p className="text-muted-foreground mt-1">
              你完成了今天的 {PRACTICE_TYPE_LABELS[practiceType]} 训练
            </p>
          </div>

          {/* 今日数据统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{countWords(rawText)}</p>
              <p className="text-xs text-muted-foreground mt-1">原稿字数</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{countWords(revisedText)}</p>
              <p className="text-xs text-muted-foreground mt-1">修改稿字数</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {countWords(revisedText) - countWords(rawText) > 0 ? "+" : ""}
                {countWords(revisedText) - countWords(rawText)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">字数变化</p>
            </div>
          </div>

          {/* 版本对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">版本对比</CardTitle>
            </CardHeader>
            <CardContent>
              <DiffViewer original={rawText} revised={revisedText} />
            </CardContent>
          </Card>

          {/* AI 对修改的评价 */}
          {comparison && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Brain className="h-4 w-4 text-primary" />
                  AI 对你修改的评价
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{comparison.summary}</p>
                {comparison.what_improved.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">改善的方面：</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {comparison.what_improved.map((item, i) => (
                        <li key={i}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparison.what_got_worse.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">需要注意：</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {comparison.what_got_worse.map((item, i) => (
                        <li key={i}>⚠ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparison.next_revision_task && (
                  <div className="rounded-md bg-background p-3 text-sm">
                    <span className="font-semibold">下一步建议：</span>
                    {comparison.next_revision_task}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 保存素材区域 */}
          {feedback && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">保存今日素材</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* 保存最好的句子 */}
                {feedback.best_sentence && (
                  <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">最好的句子</p>
                      <p className="text-sm">{feedback.best_sentence}</p>
                    </div>
                    <SaveIdeaButton content={feedback.best_sentence} type="sentence" />
                  </div>
                )}

                {/* 保存修改目标作为判断 */}
                {feedback.next_revision_goal && (
                  <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-3">
                    <div>
                      <p className="text-xs text-muted-foreground mb-1">修改目标</p>
                      <p className="text-sm">{feedback.next_revision_goal}</p>
                    </div>
                    <SaveIdeaButton content={feedback.next_revision_goal} type="claim" />
                  </div>
                )}

                {/* 保存题目作为观察 */}
                <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-3">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">今日题目</p>
                    <p className="text-sm">{prompt}</p>
                  </div>
                  <SaveIdeaButton content={prompt} type="observation" />
                </div>
              </CardContent>
            </Card>
          )}

          {/* 重新开始 */}
          <div className="flex justify-center">
            <Button variant="outline" onClick={restart}>
              再练一次
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
