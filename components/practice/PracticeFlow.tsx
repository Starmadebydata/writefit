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
// 可靠性设计：
// - 写作/修改内容自动保存到 localStorage，刷新页面可恢复
// - 诊断成功即落库（in_progress），提交修改稿后 PATCH 补全
// - 保存失败有提示，完成页可手动重试
// - 时长分段统计：写作时长 + 修改时长（不含等待 AI 和读反馈的时间）
// ====================================================================

import { useState, useEffect, useRef } from "react";
import { useTranslations, useLocale } from "next-intl";
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
import { mockDiagnose, mockCompareRevision } from "@/lib/ai/mock";
import { Link } from "@/i18n/navigation";
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
  Flame,
  CalendarClock,
  Share2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { DiagnoseFeedback, CompareRevisionFeedback } from "@/lib/ai/schemas";
import { MIN_WORDS_BY_TYPE, type PracticeType } from "@/lib/practice/prompts";
import { countWords, cn } from "@/lib/utils";
import { toast } from "sonner";

// 训练阶段定义
type Stage = "intro" | "writing" | "diagnosing" | "feedback" | "revising" | "complete";

// 从 localStorage 读取未完成的草稿（仅在题目一致时恢复）
function readPracticeDraft(
  draftKey: string,
  prompt: string
): { rawText: string; revisedText: string } | null {
  if (typeof window === "undefined") return null;
  try {
    const saved = localStorage.getItem(draftKey);
    if (!saved) return null;
    const data = JSON.parse(saved);
    // 题目一致才恢复（换题说明是新的一天或新类型）
    if (data?.prompt !== prompt) return null;
    return {
      rawText: typeof data.rawText === "string" ? data.rawText : "",
      revisedText: typeof data.revisedText === "string" ? data.revisedText : "",
    };
  } catch {
    return null;
  }
}

interface PracticeFlowProps {
  practiceType: PracticeType;
  prompt: string;
  estimatedMinutes: number;
  // 是否是开发模式（不需要登录）
  isDev?: boolean;
  // 用户名（用于完成页显示）
  userName?: string;
  // 明天的训练类型（完成页预告）
  tomorrowType?: PracticeType;
  // 用户画像上下文（随诊断请求发给 AI，让反馈更贴合）
  profileContext?: string;
}

export function PracticeFlow({
  practiceType,
  prompt,
  estimatedMinutes,
  isDev = false,
  userName,
  tomorrowType,
  profileContext,
}: PracticeFlowProps) {
  // 最低字数要求（按训练类型）
  const minWords = MIN_WORDS_BY_TYPE[practiceType] ?? 50;

  // 草稿自动保存的 key：按天 + 训练类型区分
  const draftKey = `writefit_practice_draft:${new Date().toISOString().split("T")[0]}:${practiceType}`;

  // ---- 状态管理 ----
  const t = useTranslations("practice.flow");
  const tPractice = useTranslations("practice");
  const locale = useLocale();
  const [stage, setStage] = useState<Stage>("intro");
  // 原始稿 / 修改稿：惰性初始化时恢复上次未完成的草稿
  const [rawText, setRawText] = useState(() => readPracticeDraft(draftKey, prompt)?.rawText ?? "");
  const [revisedText, setRevisedText] = useState(() => readPracticeDraft(draftKey, prompt)?.revisedText ?? "");
  const [restoredDraft] = useState(() => !!readPracticeDraft(draftKey, prompt)?.rawText.trim());
  const [feedback, setFeedback] = useState<DiagnoseFeedback | null>(null);
  const [isMockFeedback, setIsMockFeedback] = useState(false);
  const [comparison, setComparison] = useState<CompareRevisionFeedback | null>(null);
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null); // 已落库的训练记录 ID
  const [saveFailed, setSaveFailed] = useState(false); // 落库失败（完成页可重试）
  const [streak, setStreak] = useState<number | null>(null); // 保存成功后返回的连续天数
  const [mobilePane, setMobilePane] = useState<"original" | "revised">("revised"); // 移动端修改阶段显示哪一栏
  const [showExample, setShowExample] = useState(false); // 修改阶段是否展开 AI 示范修改

  // 分段计时：写作时长 + 修改时长（不含等 AI、读反馈的时间）
  const writingStartRef = useRef<number | null>(null);
  const writingMsRef = useRef(0);
  const revisionStartRef = useRef<number | null>(null);
  // 诊断后后台落库的 Promise，提交修改稿时 await 它拿到 sessionId
  const savePromiseRef = useRef<Promise<string | null> | null>(null);

  // ---- 草稿恢复成功时提示一次 ----
  useEffect(() => {
    if (restoredDraft) toast.info(t("draftRestored"));
    // 仅在挂载时执行一次
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- 写作/修改内容自动保存（防抖 500ms） ----
  useEffect(() => {
    if (stage !== "writing" && stage !== "revising") return;
    if (!rawText.trim()) return;
    const timer = setTimeout(() => {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ prompt, rawText, revisedText }));
      } catch {
        // 存储满或不可用时静默跳过
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [rawText, revisedText, stage, draftKey, prompt]);

  // ---- 清除草稿 ----
  const clearDraft = () => {
    try {
      localStorage.removeItem(draftKey);
    } catch {
      // 忽略
    }
  };

  // ---- 阶段 1 → 阶段 2：开始写作 ----
  const startWriting = () => {
    writingStartRef.current = Date.now();
    setStage("writing");
  };

  // ---- 获取用户的 AI 配置 ----
  function getAIConfig(): AISettings | null {
    return getAISettingsFromLocal();
  }

  // ---- 阶段 2 → 阶段 3：提交原始稿，请求 AI 诊断 ----
  const submitDraft = async () => {
    if (countWords(rawText) < minWords) {
      toast.error(t("errorMinWords", { minWords }));
      return;
    }

    // 记录写作阶段用时
    if (writingStartRef.current) {
      writingMsRef.current = Date.now() - writingStartRef.current;
    }

    setStage("diagnosing");
    setLoading(true);

    try {
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: rawText,
          language: locale,
          aiConfig: getAIConfig(),
          practiceType,
          profileContext,
        }),
      });

      if (!res.ok) {
        // AI 路由需要登录：dev 演示模式（未登录）回退到本地模拟反馈
        if (isDev && res.status === 401) {
          setFeedback(mockDiagnose(rawText, locale === "zh" ? "zh" : "en"));
          setIsMockFeedback(true);
          setStage("feedback");
          setLoading(false);
          return;
        }
        throw new Error("诊断失败");
      }

      const data = await res.json();
      setFeedback(data);
      setIsMockFeedback(!!data._mock);
      setStage("feedback");

      // ---- 诊断成功即落库（in_progress），后台进行不阻塞用户读反馈 ----
      if (!isDev) {
        savePromiseRef.current = (async () => {
          try {
            const saveRes = await fetch("/api/practice/sessions", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                practiceType,
                prompt,
                rawText,
                wordCount: countWords(rawText),
                durationSeconds: Math.round(writingMsRef.current / 1000),
                feedback: data,
                status: "in_progress",
              }),
            });
            if (!saveRes.ok) return null;
            const saved = await saveRes.json();
            return (saved.sessionId as string) ?? null;
          } catch {
            return null;
          }
        })();
        savePromiseRef.current.then((id) => {
          if (id) {
            setSessionId(id);
            setSaveFailed(false);
          } else {
            // 保存失败：提交修改稿时会整体重试
            setSaveFailed(true);
          }
        });
      }
    } catch {
      toast.error(t("errorAiDiagnosis"));
      setStage("writing");
    } finally {
      setLoading(false);
    }
  };

  // ---- 阶段 3 → 阶段 4：进入修改阶段 ----
  const startRevising = () => {
    // 把原稿复制到修改稿，用户在此基础上修改
    setRevisedText(rawText);
    revisionStartRef.current = Date.now();
    setStage("revising");
  };

  // ---- 保存最终训练记录（PATCH 更新或 POST 新建），返回是否成功 ----
  const persistFinalSession = async (
    comparisonData: CompareRevisionFeedback | null,
    durationSeconds: number | null
  ): Promise<boolean> => {
    if (isDev) return true;
    try {
      // 优先用已有的 sessionId；没有则等后台落库的结果
      const existingId = sessionId ?? (savePromiseRef.current ? await savePromiseRef.current : null);

      const res = existingId
        ? await fetch("/api/practice/sessions", {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              sessionId: existingId,
              revisedText,
              wordCount: countWords(revisedText),
              durationSeconds,
              comparison: comparisonData ?? undefined,
              markCompleted: true,
            }),
          })
        : await fetch("/api/practice/sessions", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              practiceType,
              prompt,
              rawText,
              revisedText,
              wordCount: countWords(revisedText),
              durationSeconds,
              feedback,
              comparison: comparisonData ?? undefined,
              status: "completed",
            }),
          });

      if (!res.ok) throw new Error("save failed");
      const saved = await res.json();
      if (saved.sessionId) setSessionId(saved.sessionId);
      if (typeof saved.streak === "number") setStreak(saved.streak);
      setSaveFailed(false);
      return true;
    } catch {
      setSaveFailed(true);
      return false;
    }
  };

  // ---- 阶段 4 → 阶段 5：提交修改稿，查看对比 ----
  const submitRevision = async () => {
    if (revisedText.trim() === rawText.trim()) {
      toast.error(t("errorNoRevision"));
      return;
    }

    setLoading(true);
    setStage("complete");

    // 计算训练总时长（秒）：写作时长 + 修改时长
    const revisionMs = revisionStartRef.current ? Date.now() - revisionStartRef.current : 0;
    const totalMs = writingMsRef.current + revisionMs;
    const durationSeconds = totalMs > 0 ? Math.round(totalMs / 1000) : null;

    let comparisonData: CompareRevisionFeedback | null = null;
    try {
      const res = await fetch("/api/ai/compare-revision", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          original: rawText,
          revised: revisedText,
          language: locale,
          aiConfig: getAIConfig(),
        }),
      });

      if (!res.ok) {
        // AI 路由需要登录：dev 演示模式（未登录）回退到本地模拟对比
        if (isDev && res.status === 401) {
          comparisonData = mockCompareRevision(rawText, revisedText, locale === "zh" ? "zh" : "en");
          setComparison(comparisonData);
        } else {
          throw new Error("对比失败");
        }
      } else {
        comparisonData = await res.json();
        setComparison(comparisonData);
      }
    } catch {
      // 即使对比失败，也展示 diff
      toast.error(t("errorCompareFailed"));
    }

    const saved = await persistFinalSession(comparisonData, durationSeconds);
    if (saved && !isDev) {
      clearDraft();
    } else if (!saved) {
      toast.error(t("errorSaveSession"));
    }
    setLoading(false);
  };

  // ---- 完成页手动重试保存 ----
  const retrySave = async () => {
    const revisionMs = 0; // 重试不再累计时间
    const totalMs = writingMsRef.current + revisionMs;
    setLoading(true);
    const saved = await persistFinalSession(comparison, totalMs > 0 ? Math.round(totalMs / 1000) : null);
    if (saved) {
      clearDraft();
      toast.success(t("saveSucceeded"));
    } else {
      toast.error(t("errorSaveSession"));
    }
    setLoading(false);
  };

  // ---- 分享成果（复制到剪贴板） ----
  const shareResult = async () => {
    const shareText = t("shareText", {
      words: countWords(revisedText),
      streak: streak ?? 1,
    });
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success(t("shareCopied"));
    } catch {
      toast.error(t("errorShareFailed"));
    }
  };

  // ---- 重新开始 ----
  const restart = () => {
    clearDraft();
    setStage("intro");
    setRawText("");
    setRevisedText("");
    setFeedback(null);
    setComparison(null);
    setSessionId(null);
    setSaveFailed(false);
    setStreak(null);
    writingStartRef.current = null;
    writingMsRef.current = 0;
    revisionStartRef.current = null;
    savePromiseRef.current = null;
  };

  // ---- 渲染各阶段 ----

  // 阶段进度指示器
  const stages: { key: Stage; label: string; icon: typeof PenLine }[] = [
    { key: "intro", label: t("stages.prompt"), icon: PenLine },
    { key: "writing", label: t("stages.writing"), icon: PenLine },
    { key: "feedback", label: t("stages.diagnosis"), icon: Brain },
    { key: "revising", label: t("stages.revision"), icon: Scissors },
    { key: "complete", label: t("stages.complete"), icon: CheckCircle2 },
  ];
  const currentStageIndex = stages.findIndex(
    (s) => s.key === stage || (stage === "diagnosing" && s.key === "feedback")
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* 开发模式提示 */}
      {isDev && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-2 text-sm text-amber-800">
          {t("devMode")}
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
              {tPractice(`types.${practiceType}`)}
            </Badge>
            <CardTitle className="text-2xl">{t("todaysPrompt")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-muted/50 p-6">
              <p className="text-lg leading-relaxed font-medium">{prompt}</p>
            </div>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p className="flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                {t("introDuration", { minutes: estimatedMinutes })}
              </p>
              <p className="flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                {t("introRule1")}
              </p>
              <p className="flex items-center gap-2">
                <Brain className="h-4 w-4" />
                {t("introRule2")}
              </p>
            </div>

            <Button size="lg" className="w-full" onClick={startWriting}>
              {t("startWriting")}
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
              <CardTitle className="text-lg">{t("writingTitle")}</CardTitle>
              <PracticeTimer
                minutes={estimatedMinutes}
                isRunning={stage === "writing"}
                onTimeUp={() => toast.info(t("timeUp"))}
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
                {t("back")}
              </Button>
              <Button
                onClick={submitDraft}
                disabled={countWords(rawText) < minWords}
              >
                {t("submitDraft")}
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
            <p className="text-lg font-semibold">{t("aiAnalyzing")}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t("aiAnalyzingSub")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ====== Stage 3: AI 诊断反馈 ====== */}
      {stage === "feedback" && feedback && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t("feedbackTitle")}</h2>
            <Button onClick={startRevising}>
              {t("startRevision")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <FeedbackPanel feedback={feedback} isMock={isMockFeedback} isDev={isDev} />
        </div>
      )}

      {/* ====== Stage 4: 手动修改 ====== */}
      {stage === "revising" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold">{t("revisionInstructions")}</h2>
            <Button onClick={submitRevision} disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t("comparing")}
                </>
              ) : (
                <>
                  {t("submitRevision")}
                  <ArrowRight className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>

          {/* AI 反馈提醒（折叠版） */}
          {feedback && (
            <Card className="bg-muted/30">
              <CardContent className="pt-4">
                <p className="text-sm font-semibold mb-2">{t("revisionGoalLabel")}</p>
                <p className="text-sm text-muted-foreground">{feedback.next_revision_goal}</p>
                <div className="mt-3 space-y-1">
                  {feedback.top_issues.map((issue, i) => (
                    <p key={i} className="text-xs text-muted-foreground">
                      {i + 1}. {issue.issue} → {issue.revision_task}
                    </p>
                  ))}
                </div>

                {/* AI 示范修改（折叠，供修改时参考） */}
                {feedback.example_revision && (
                  <div className="mt-3">
                    <button
                      type="button"
                      onClick={() => setShowExample((v) => !v)}
                      className="flex items-center gap-1 text-xs font-semibold text-primary"
                    >
                      {showExample ? (
                        <ChevronUp className="h-3.5 w-3.5" />
                      ) : (
                        <ChevronDown className="h-3.5 w-3.5" />
                      )}
                      {tPractice("feedback.exampleRevision")}
                    </button>
                    {showExample && (
                      <div className="mt-2 rounded-md bg-background p-3">
                        <p className="text-sm leading-relaxed whitespace-pre-wrap">
                          {feedback.example_revision}
                        </p>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {tPractice("feedback.exampleRevisionHint")}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          )}

          {/* 移动端：原稿/修改稿切换（小屏幕上下堆叠对照困难） */}
          <div className="md:hidden flex gap-2">
            <Button
              size="sm"
              variant={mobilePane === "original" ? "default" : "outline"}
              onClick={() => setMobilePane("original")}
            >
              {tPractice("diff.original")}
            </Button>
            <Button
              size="sm"
              variant={mobilePane === "revised" ? "default" : "outline"}
              onClick={() => setMobilePane("revised")}
            >
              {tPractice("diff.revised")}
            </Button>
          </div>

          {/* 左右双栏：原稿 vs 修改区 */}
          <div className="grid md:grid-cols-2 gap-4">
            <Card className={cn(mobilePane === "original" ? "" : "hidden md:block")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-muted-foreground">{t("originalReadonly")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={rawText}
                  readOnly
                  className="min-h-[300px] resize-none bg-muted/30 text-sm leading-relaxed"
                />
              </CardContent>
            </Card>

            <Card className={cn("border-primary/30", mobilePane === "revised" ? "" : "hidden md:block")}>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm text-primary">{t("yourRevision")}</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={revisedText}
                  onChange={(e) => setRevisedText(e.target.value)}
                  className="min-h-[300px] resize-none text-sm leading-relaxed focus-visible:ring-primary/50"
                  placeholder={t("revisePlaceholder")}
                />
              </CardContent>
            </Card>
          </div>

          <Button variant="ghost" onClick={() => setStage("feedback")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("backToFeedback")}
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
            <h2 className="text-2xl font-bold">
              {userName ? t("practiceCompleteNamed", { name: userName }) : t("practiceComplete")}
            </h2>
            <p className="text-muted-foreground mt-1">
              {t("completeMessage")}
            </p>

            {/* 连续训练天数（核心留存钩子，保存成功后即时反馈） */}
            {streak !== null && streak > 0 && (
              <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-orange-500/10 text-orange-600 px-3 py-1 text-sm font-semibold">
                <Flame className="h-4 w-4" />
                {t("streakDays", { count: streak })}
              </div>
            )}

            {/* 保存失败：提供手动重试 */}
            {saveFailed && !isDev && (
              <div className="mt-3">
                <Button variant="outline" size="sm" onClick={retrySave} disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                  {t("retrySave")}
                </Button>
              </div>
            )}
          </div>

          {/* 今日数据统计 */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{countWords(rawText)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("statRawWords")}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">{countWords(revisedText)}</p>
              <p className="text-xs text-muted-foreground mt-1">{t("statRevisedWords")}</p>
            </div>
            <div className="rounded-lg border border-border bg-card p-4 text-center">
              <p className="text-2xl font-bold tabular-nums">
                {countWords(revisedText) - countWords(rawText) > 0 ? "+" : ""}
                {countWords(revisedText) - countWords(rawText)}
              </p>
              <p className="text-xs text-muted-foreground mt-1">{t("statWordsDelta")}</p>
            </div>
          </div>

          {/* 版本对比 */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">{t("diffTitle")}</CardTitle>
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
                  {t("aiReviewTitle")}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm">{comparison.summary}</p>

                {/* 三个维度的变化 */}
                {(comparison.specificity_change || comparison.voice_change || comparison.ai_like_change) && (
                  <div className="grid sm:grid-cols-3 gap-2">
                    {comparison.specificity_change && (
                      <div className="rounded-md bg-background p-2.5">
                        <p className="text-xs font-semibold text-muted-foreground mb-0.5">{t("changeSpecificity")}</p>
                        <p className="text-xs">{comparison.specificity_change}</p>
                      </div>
                    )}
                    {comparison.voice_change && (
                      <div className="rounded-md bg-background p-2.5">
                        <p className="text-xs font-semibold text-muted-foreground mb-0.5">{t("changeVoice")}</p>
                        <p className="text-xs">{comparison.voice_change}</p>
                      </div>
                    )}
                    {comparison.ai_like_change && (
                      <div className="rounded-md bg-background p-2.5">
                        <p className="text-xs font-semibold text-muted-foreground mb-0.5">{t("changeAiLike")}</p>
                        <p className="text-xs">{comparison.ai_like_change}</p>
                      </div>
                    )}
                  </div>
                )}

                {comparison.what_improved.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-primary mb-1">{t("improvedLabel")}</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {comparison.what_improved.map((item, i) => (
                        <li key={i}>✓ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparison.what_got_worse.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-destructive mb-1">{t("worseLabel")}</p>
                    <ul className="text-sm text-muted-foreground space-y-0.5">
                      {comparison.what_got_worse.map((item, i) => (
                        <li key={i}>⚠ {item}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {comparison.next_revision_task && (
                  <div className="rounded-md bg-background p-3 text-sm">
                    <span className="font-semibold">{t("nextStepLabel")}</span>
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
                <CardTitle className="text-lg">{t("saveIdeasTitle")}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {isDev ? (
                  // dev 演示模式未登录，保存素材需要账号：引导注册
                  <p className="text-sm text-muted-foreground">
                    {t("saveIdeaLoginHint")}{" "}
                    <Link href="/auth/register" className="text-primary underline">
                      {t("saveIdeaLoginCta")}
                    </Link>
                  </p>
                ) : (
                  <>
                    {/* 保存最好的句子 */}
                    {feedback.best_sentence && (
                      <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("bestSentenceLabel")}</p>
                          <p className="text-sm">{feedback.best_sentence}</p>
                        </div>
                        <SaveIdeaButton content={feedback.best_sentence} type="sentence" />
                      </div>
                    )}

                    {/* 保存修改目标作为判断 */}
                    {feedback.next_revision_goal && (
                      <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-3">
                        <div>
                          <p className="text-xs text-muted-foreground mb-1">{t("revisionGoalIdeaLabel")}</p>
                          <p className="text-sm">{feedback.next_revision_goal}</p>
                        </div>
                        <SaveIdeaButton content={feedback.next_revision_goal} type="claim" />
                      </div>
                    )}

                    {/* 保存题目作为观察 */}
                    <div className="flex items-start justify-between gap-3 rounded-md bg-muted/50 p-3">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">{t("todaysPromptIdeaLabel")}</p>
                        <p className="text-sm">{prompt}</p>
                      </div>
                      <SaveIdeaButton content={prompt} type="observation" />
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          )}

          {/* 明日预告 + 分享 + 重新开始 */}
          <div className="flex flex-col items-center gap-3">
            {tomorrowType && (
              <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarClock className="h-4 w-4" />
                {t("tomorrowPreview", { type: tPractice(`types.${tomorrowType}`) })}
              </p>
            )}
            <div className="flex gap-3">
              <Button variant="outline" onClick={shareResult}>
                <Share2 className="mr-2 h-4 w-4" />
                {t("shareButton")}
              </Button>
              <Button variant="outline" onClick={restart}>
                {t("tryAgain")}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
