"use client";

// ====================================================================
// Onboarding 引导流程组件
// ====================================================================
// 新用户首次进入产品时，通过 4 步引导收集写作画像：
// 1. 写作目标（多选）
// 2. 写作主题（多选）
// 3. 写作问题（多选）
// 4. 每日训练时长（单选）
//
// 完成后调用 /api/onboarding 保存到数据库，然后跳转到 Dashboard
// ====================================================================

import { useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Target,
  BookOpen,
  AlertCircle,
  Clock,
  Check,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ---- 选项数据：和 PRD 8.1 节一致 ----
// 这些 key 与 i18n 翻译文件里的 onboarding.goals / topics / problems 对应
const GOAL_OPTIONS = [
  "restore_writing",
  "reduce_ai_voice",
  "write_blog",
  "write_newsletter",
  "write_tech",
  "write_product",
  "improve_english",
  "build_brand",
] as const;

const TOPIC_OPTIONS = [
  "ai",
  "product",
  "indie_hacking",
  "operations",
  "tech",
  "business",
  "personal_growth",
  "reviews",
  "other",
] as const;

const PROBLEM_OPTIONS = [
  "hard_to_start",
  "vague_content",
  "messy_structure",
  "stiff_sentences",
  "no_voice",
  "ai_dependent",
  "inconsistent",
] as const;

// 训练时长选项：value 是分钟数，对应 i18n 的 onboarding.duration.{value}
const DURATION_OPTIONS = [
  { value: 10, descKey: "lightDesc" },
  { value: 15, descKey: "balancedDesc" },
  { value: 30, descKey: "deepDesc" },
] as const;

// 每一步的图标和标题翻译 key
const STEPS = [
  { icon: Target, stepKey: "goals" },
  { icon: BookOpen, stepKey: "topics" },
  { icon: AlertCircle, stepKey: "problems" },
  { icon: Clock, stepKey: "duration" },
] as const;

export function OnboardingFlow() {
  const t = useTranslations("onboarding");
  const router = useRouter();

  // ---- 当前步骤（0-3） ----
  const [step, setStep] = useState(0);
  // ---- 用户选择 ----
  const [goals, setGoals] = useState<string[]>([]);
  const [topics, setTopics] = useState<string[]>([]);
  const [problems, setProblems] = useState<string[]>([]);
  const [duration, setDuration] = useState<number | null>(null);
  // ---- 提交状态 ----
  const [isSaving, setIsSaving] = useState(false);

  const total = STEPS.length;
  const current = STEPS[step];

  // ---- 多选切换工具函数 ----
  function toggleSelection(list: string[], value: string): string[] {
    return list.includes(value)
      ? list.filter((v) => v !== value)
      : [...list, value];
  }

  // ---- 判断当前步骤是否已选择 ----
  function isStepValid(): boolean {
    if (step === 0) return goals.length > 0;
    if (step === 1) return topics.length > 0;
    if (step === 2) return problems.length > 0;
    if (step === 3) return duration !== null;
    return false;
  }

  // ---- 下一步 ----
  function handleNext() {
    if (!isStepValid()) {
      // 多选步骤提示"至少选一个"，单选步骤提示"请选一个"
      toast.error(step === 3 ? t("selectOne") : t("selectAtLeastOne"));
      return;
    }
    if (step < total - 1) {
      setStep(step + 1);
    } else {
      void handleSubmit();
    }
  }

  // ---- 上一步 ----
  function handleBack() {
    if (step > 0) setStep(step - 1);
  }

  // ---- 提交保存 ----
  async function handleSubmit() {
    if (duration === null) {
      toast.error(t("selectOne"));
      return;
    }
    setIsSaving(true);
    try {
      const res = await fetch("/api/onboarding", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals,
          topics,
          problems,
          dailyPracticeMinutes: duration,
        }),
      });
      if (!res.ok) {
        throw new Error("Save failed");
      }
      router.push("/dashboard");
    } catch {
      toast.error(t("saveError"));
    } finally {
      setIsSaving(false);
    }
  }

  // ---- 渲染多选选项卡片网格 ----
  // prefix 是翻译命名空间（goals / topics / problems）
  function renderMultiSelect(
    options: readonly string[],
    selected: string[],
    onSelect: (value: string) => void,
    prefix: "goals" | "topics" | "problems"
  ) {
    return (
      <div className="grid gap-3 sm:grid-cols-2">
        {options.map((option) => {
          const isSelected = selected.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => onSelect(option)}
              className={cn(
                "flex items-center justify-between rounded-lg border p-4 text-left transition-all hover:bg-muted/50",
                isSelected
                  ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                  : "border-border"
              )}
            >
              <span className="text-sm font-medium">{t(`${prefix}.${option}`)}</span>
              {isSelected && <Check className="h-4 w-4 text-primary" />}
            </button>
          );
        })}
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl">
      {/* 标题区 */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-2 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* 进度条 */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>{t("step", { current: step + 1, total })}</span>
          <span>{Math.round(((step + 1) / total) * 100)}%</span>
        </div>
        <div className="h-2 overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${((step + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      {/* 步骤内容卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <current.icon className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">
                {t(`steps.${current.stepKey}.title`)}
              </CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                {t(`steps.${current.stepKey}.desc`)}
              </p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {/* 步骤 1：写作目标（多选） */}
          {step === 0 &&
            renderMultiSelect(GOAL_OPTIONS, goals, (v) =>
              setGoals((prev) => toggleSelection(prev, v))
            , "goals")}

          {/* 步骤 2：写作主题（多选） */}
          {step === 1 &&
            renderMultiSelect(TOPIC_OPTIONS, topics, (v) =>
              setTopics((prev) => toggleSelection(prev, v))
            , "topics")}

          {/* 步骤 3：写作问题（多选） */}
          {step === 2 &&
            renderMultiSelect(PROBLEM_OPTIONS, problems, (v) =>
              setProblems((prev) => toggleSelection(prev, v))
            , "problems")}

          {/* 步骤 4：训练时长（单选） */}
          {step === 3 && (
            <div className="grid gap-3 sm:grid-cols-3">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = duration === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setDuration(opt.value)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-lg border p-6 transition-all hover:bg-muted/50",
                      isSelected
                        ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                        : "border-border"
                    )}
                  >
                    <Clock
                      className={cn(
                        "h-6 w-6",
                        isSelected ? "text-primary" : "text-muted-foreground"
                      )}
                    />
                    <span className="text-base font-semibold">
                      {t(`duration.${opt.value}`)}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {t(`duration.${opt.descKey}`)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 导航按钮 */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="lg"
          onClick={handleBack}
          disabled={step === 0 || isSaving}
        >
          <ChevronLeft className="h-4 w-4" />
          {t("back")}
        </Button>

        <Button size="lg" onClick={handleNext} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {t("saving")}
            </>
          ) : step === total - 1 ? (
            <>
              {t("finish")}
              <ChevronRight className="h-4 w-4" />
            </>
          ) : (
            <>
              {t("next")}
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}
