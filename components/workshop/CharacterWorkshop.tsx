"use client";

// ====================================================================
// 人物工坊主组件（神圣缺陷切入法）
// ====================================================================
// 五步引导：神圣缺陷 → 创伤起源 → 确认偏差 → 控制理论 → 爆点
// 每步：写作指引 + 用户写作 + AI 教练反馈（追问式，不替用户创作）
// 进度存 localStorage；完成后可把人物档案保存到素材库（type=structure）
//
// 文案双语内联（与 methodology 页同一模式），只有导航标签走 i18n。
// ====================================================================

import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAISettingsFromLocal } from "@/lib/ai/settings";
import { WORKSHOP_STEPS, type WorkshopStepDef } from "@/lib/workshop/steps";
import type { WorkshopFeedback } from "@/lib/ai/schemas";
import {
  Loader2,
  Sparkles,
  HelpCircle,
  AlertTriangle,
  ThumbsUp,
  ArrowRight,
  ArrowLeft,
  Bookmark,
  Check,
  RotateCcw,
  Flame,
} from "lucide-react";

// localStorage 键（含版本号，未来结构变化时可平滑废弃）
const STORAGE_KEY = "writefit_workshop_v1";

interface WorkshopState {
  stepIndex: number;
  answers: Record<string, string>;
}

// 从 localStorage 读取工坊进度（与 PracticeFlow 的草稿恢复同一模式）
function readWorkshopState(): WorkshopState | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const s = JSON.parse(raw) as WorkshopState;
    if (!s || typeof s.stepIndex !== "number" || !s.answers) return null;
    return {
      stepIndex: Math.min(Math.max(0, s.stepIndex), WORKSHOP_STEPS.length - 1),
      answers: s.answers,
    };
  } catch {
    return null;
  }
}

// 双语 UI 文案（步骤内容在 lib/workshop/steps.ts）
const UI = {
  zh: {
    intro:
      "用「神圣缺陷切入法」构建一个立得住的人物：先找到人物奉为神圣的错误信念，再一步步长出他的过去、生活和引爆故事的时刻。AI 只做教练——它不替你创作，只用追问逼你更具体。",
    source: "方法论来源：威尔·斯托尔《写作好故事的科学原理》",
    templates: "可用句式 / 启发问题",
    placeholder: "在这里写……",
    tooShort: (n: number) => `再写一些——这一步至少需要约 ${n} 字才能获得有效反馈`,
    getFeedback: "获取教练反馈",
    analyzing: "教练思考中……",
    whatWorks: "立得住的部分",
    genericOrMissing: "套路化 / 缺失",
    deepeningQuestions: "追问——回答它们，让内容更具体",
    nextHint: "进入下一步之前",
    readyYes: "内容足够具体，可以进入下一步",
    readyNo: "建议先按追问补充，再进入下一步",
    prev: "上一步",
    next: "下一步",
    finish: "完成工坊",
    doneTitle: "人物档案完成",
    doneDesc: "五个步骤的内容已汇总成人物档案。保存到素材库后，写故事时随时可以取用。",
    save: "保存到素材库",
    saved: "已保存",
    restart: "重新开始（清空本次内容）",
    saveError: "保存失败，请重试",
    saveSuccess: "已保存到素材库",
    aiError: "AI 反馈失败，请稍后重试",
    mockNotice: "这是示例反馈。配置 AI 服务后可获得针对你内容的真实教练反馈。",
    sheetHeader: "人物工坊档案（神圣缺陷切入法）",
  },
  en: {
    intro:
      "Build a character that holds up, using the Sacred Flaw approach: find the mistaken belief your character holds sacred, then grow their past, their life, and the moment that ignites the story. The AI is a coach only — it never invents for you; it asks questions that force specificity.",
    source: "Method: Will Storr, The Science of Storytelling",
    templates: "Templates / probes",
    placeholder: "Write here…",
    tooShort: (n: number) => `Keep going — this step needs about ${n} characters for useful feedback`,
    getFeedback: "Get coach feedback",
    analyzing: "Coach thinking…",
    whatWorks: "What holds up",
    genericOrMissing: "Generic / missing",
    deepeningQuestions: "Probes — answer them to get specific",
    nextHint: "Before the next step",
    readyYes: "Specific enough — ready for the next step",
    readyNo: "Consider answering the probes before moving on",
    prev: "Back",
    next: "Next step",
    finish: "Finish workshop",
    doneTitle: "Character sheet complete",
    doneDesc: "Your five steps are compiled into a character sheet. Save it to your Idea Bank to use whenever you write.",
    save: "Save to Idea Bank",
    saved: "Saved",
    restart: "Start over (clears this run)",
    saveError: "Save failed, please retry",
    saveSuccess: "Saved to Idea Bank",
    aiError: "AI feedback failed, please retry",
    mockNotice: "This is sample feedback. Configure an AI service to get real coaching on your content.",
    sheetHeader: "Character Workshop Sheet (Sacred Flaw approach)",
  },
};

export function CharacterWorkshop() {
  const locale = (useLocale() === "zh" ? "zh" : "en") as "en" | "zh";
  const ui = UI[locale];

  const [stepIndex, setStepIndex] = useState(() => readWorkshopState()?.stepIndex ?? 0);
  const [answers, setAnswers] = useState<Record<string, string>>(
    () => readWorkshopState()?.answers ?? {}
  );
  const [feedback, setFeedback] = useState<WorkshopFeedback | null>(null);
  const [isMock, setIsMock] = useState(false);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // 持久化进度
  useEffect(() => {
    try {
      const state: WorkshopState = { stepIndex, answers };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // 存储失败不阻断使用
    }
  }, [stepIndex, answers]);

  const step: WorkshopStepDef = WORKSHOP_STEPS[stepIndex];
  const answer = answers[step.id] ?? "";
  const prompts = locale === "zh" ? step.promptsZh : step.promptsEn;
  const canRequestFeedback = answer.trim().length >= step.minChars;

  // 汇总人物档案（完成页 + 保存素材库用）
  const sheet = useMemo(() => {
    const lines: string[] = [ui.sheetHeader, ""];
    for (const s of WORKSHOP_STEPS) {
      const a = (answers[s.id] ?? "").trim();
      if (!a) continue;
      lines.push(`## ${locale === "zh" ? s.titleZh : s.titleEn}`);
      lines.push(a, "");
    }
    return lines.join("\n");
  }, [answers, locale, ui.sheetHeader]);

  // ---- 请求教练反馈 ----
  async function handleFeedback() {
    if (!canRequestFeedback || loading) return;
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch("/api/ai/workshop", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: answer,
          step: step.id,
          language: locale,
          aiConfig: getAISettingsFromLocal(),
        }),
      });
      const data = (await res.json()) as (WorkshopFeedback & { _mock?: boolean }) & {
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error || ui.aiError);
        return;
      }
      setIsMock(!!data._mock);
      setFeedback(data);
    } catch {
      toast.error(ui.aiError);
    } finally {
      setLoading(false);
    }
  }

  // ---- 步骤切换 ----
  function goTo(index: number) {
    setStepIndex(index);
    setFeedback(null);
    setIsMock(false);
  }

  function handleNext() {
    if (stepIndex < WORKSHOP_STEPS.length - 1) {
      goTo(stepIndex + 1);
    } else {
      setFinished(true);
    }
  }

  // ---- 保存到素材库 ----
  async function handleSave() {
    if (saving || saved) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "structure", content: sheet, tags: ["character-workshop"] }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaved(true);
      toast.success(ui.saveSuccess);
    } catch {
      toast.error(ui.saveError);
    } finally {
      setSaving(false);
    }
  }

  // ---- 重新开始 ----
  function handleRestart() {
    setAnswers({});
    setFeedback(null);
    setFinished(false);
    setSaved(false);
    goTo(0);
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // 忽略
    }
  }

  // ================= 完成页 =================
  if (finished) {
    return (
      <div className="max-w-3xl mx-auto space-y-4">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-primary" />
              {ui.doneTitle}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">{ui.doneDesc}</p>
            <pre className="whitespace-pre-wrap rounded-md bg-muted p-4 text-sm leading-relaxed max-h-96 overflow-y-auto">
              {sheet}
            </pre>
            <div className="flex flex-wrap gap-2">
              <Button onClick={handleSave} disabled={saving || saved}>
                {saved ? <Check className="h-4 w-4" /> : <Bookmark className="h-4 w-4" />}
                {saved ? ui.saved : ui.save}
              </Button>
              <Button variant="outline" onClick={() => setFinished(false)}>
                <ArrowLeft className="h-4 w-4" />
                {ui.prev}
              </Button>
              <Button variant="ghost" onClick={handleRestart}>
                <RotateCcw className="h-4 w-4" />
                {ui.restart}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ================= 步骤页 =================
  return (
    <div className="max-w-3xl mx-auto space-y-4">
      {/* 简介 + 进度 */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">{ui.intro}</p>
        <p className="text-xs text-muted-foreground">{ui.source}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          {WORKSHOP_STEPS.map((s, i) => (
            <button
              key={s.id}
              type="button"
              onClick={() => i <= stepIndex && goTo(i)}
              className={cn(
                "h-2.5 rounded-full transition-all",
                i === stepIndex
                  ? "w-8 bg-primary"
                  : i < stepIndex
                    ? "w-2.5 bg-primary/50 cursor-pointer"
                    : "w-2.5 bg-muted"
              )}
              aria-label={locale === "zh" ? s.titleZh : s.titleEn}
            />
          ))}
        </div>
      </div>

      {/* 当前步骤 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {locale === "zh" ? step.titleZh : step.titleEn}
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            {locale === "zh" ? step.goalZh : step.goalEn}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm">{locale === "zh" ? step.instructionZh : step.instructionEn}</p>

          {/* 句式模板 / 启发问题 */}
          <div className="rounded-md bg-muted/60 p-3 space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground">{ui.templates}</p>
            {prompts.map((p, i) => (
              <p key={i} className="text-sm text-muted-foreground">
                · {p}
              </p>
            ))}
          </div>

          <Textarea
            value={answer}
            onChange={(e) =>
              setAnswers((prev) => ({ ...prev, [step.id]: e.target.value }))
            }
            placeholder={ui.placeholder}
            className="min-h-48"
          />

          <div className="flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-muted-foreground">
              {!canRequestFeedback && ui.tooShort(step.minChars)}
            </p>
            <div className="flex gap-2">
              {stepIndex > 0 && (
                <Button variant="outline" onClick={() => goTo(stepIndex - 1)}>
                  <ArrowLeft className="h-4 w-4" />
                  {ui.prev}
                </Button>
              )}
              <Button
                variant="secondary"
                onClick={handleFeedback}
                disabled={!canRequestFeedback || loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
                {loading ? ui.analyzing : ui.getFeedback}
              </Button>
              <Button onClick={handleNext} disabled={!canRequestFeedback}>
                {stepIndex === WORKSHOP_STEPS.length - 1 ? ui.finish : ui.next}
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 教练反馈 */}
      {feedback && (
        <div className="space-y-3">
          {isMock && (
            <div className="rounded-lg bg-amber-50 border border-amber-200 px-4 py-3 text-sm text-amber-800">
              {ui.mockNotice}
            </div>
          )}

          {feedback.what_works && (
            <Card className="border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <ThumbsUp className="h-4 w-4 text-primary" />
                  {ui.whatWorks}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{feedback.what_works}</p>
              </CardContent>
            </Card>
          )}

          {feedback.what_is_generic_or_missing.length > 0 && (
            <Card className="border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <AlertTriangle className="h-4 w-4 text-destructive" />
                  {ui.genericOrMissing}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-1.5">
                {feedback.what_is_generic_or_missing.map((item, i) => (
                  <p key={i} className="text-sm text-muted-foreground">
                    · {item}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          {feedback.deepening_questions.length > 0 && (
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <HelpCircle className="h-4 w-4 text-primary" />
                  {ui.deepeningQuestions}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {feedback.deepening_questions.map((q, i) => (
                  <p key={i} className="text-sm">
                    {i + 1}. {q}
                  </p>
                ))}
              </CardContent>
            </Card>
          )}

          <div className="flex items-center gap-2 text-sm">
            <Badge variant={feedback.ready_to_continue ? "secondary" : "outline"}>
              {feedback.ready_to_continue ? ui.readyYes : ui.readyNo}
            </Badge>
          </div>
          {feedback.next_step_hint && (
            <p className="text-sm text-muted-foreground">
              <span className="font-medium">{ui.nextHint}：</span>
              {feedback.next_step_hint}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
