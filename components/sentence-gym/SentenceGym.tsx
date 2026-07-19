"use client";

// ====================================================================
// 句子训练主组件
// ====================================================================
// 用户输入一个句子或段落，AI 分析出问题（空泛词、抽象词、节奏等），
// 然后用户根据反馈手动修改。AI 不直接给改写稿。
//
// 流程：输入句子 → AI 分析 → 查看反馈 → 用户修改 → 可保存到素材库
// ====================================================================

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAISettingsFromLocal } from "@/lib/ai/settings";
import { useRouter } from "@/i18n/navigation";
import {
  Scissors,
  Loader2,
  RotateCcw,
  Bookmark,
  Check,
  Sparkles,
} from "lucide-react";
import type { SentenceSurgeryFeedback } from "@/lib/ai/schemas";

export function SentenceGym() {
  const t = useTranslations("sentenceGym");
  const tCommon = useTranslations("common");
  const locale = useLocale();
  const router = useRouter();

  // ---- 输入状态 ----
  const [input, setInput] = useState("");
  const [revision, setRevision] = useState("");

  // ---- 分析状态 ----
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<SentenceSurgeryFeedback | null>(null);
  const [isMock, setIsMock] = useState(false);

  // ---- 保存状态 ----
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // ---- 提交分析 ----
  async function handleAnalyze() {
    if (!input.trim()) return;
    setLoading(true);
    setFeedback(null);
    setRevision("");
    setSaved(false);
    try {
      const aiConfig = getAISettingsFromLocal();
      const res = await fetch("/api/ai/sentence-surgery", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: input, language: locale, aiConfig }),
      });
      if (!res.ok) {
        // 平台 Key 配额耗尽：明确提示并给升级入口
        if (res.status === 402) {
          toast.error(tCommon("errorQuotaExceeded"), {
            action: { label: tCommon("viewPlans"), onClick: () => router.push("/pricing") },
          });
          return;
        }
        throw new Error("analyze failed");
      }
      const data = (await res.json()) as SentenceSurgeryFeedback & { _mock?: boolean };
      setFeedback(data);
      setIsMock(!!data._mock);
    } catch {
      toast.error(t("toast.errorAnalyze"));
    } finally {
      setLoading(false);
    }
  }

  // ---- 重置 ----
  function handleReset() {
    setInput("");
    setRevision("");
    setFeedback(null);
    setSaved(false);
  }

  // ---- 保存修改后的句子到素材库 ----
  async function handleSaveIdea() {
    if (!revision.trim() || saved) return;
    setSaving(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: "sentence", content: revision.trim(), tags: [] }),
      });
      if (!res.ok) throw new Error("save failed");
      setSaved(true);
      toast.success(t("toast.saved"));
    } catch {
      toast.error(t("toast.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  // ---- 判断反馈是否有内容 ----
  const hasFeedback =
    feedback &&
    (feedback.empty_words.length > 0 ||
      feedback.delete_candidates.length > 0 ||
      feedback.abstract_words.length > 0 ||
      feedback.missing_specifics.length > 0 ||
      feedback.rhythm_problem ||
      feedback.revision_task);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* 标题区 */}
      <div>
        <h1 className="text-2xl font-bold">{t("title")}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
      </div>

      {/* 输入区 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Scissors className="h-5 w-5 text-primary" />
            {t("inputLabel")}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={t("inputPlaceholder")}
            rows={3}
            disabled={loading}
          />
          <div className="flex gap-2">
            <Button onClick={handleAnalyze} disabled={loading || !input.trim()}>
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {t("analyzing")}
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  {t("analyze")}
                </>
              )}
            </Button>
            {feedback && (
              <Button variant="outline" onClick={handleReset} disabled={loading}>
                <RotateCcw className="h-4 w-4" />
                {t("reset")}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* 空状态提示 */}
      {!feedback && !loading && (
        <div className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <Scissors className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">{t("empty")}</p>
        </div>
      )}

      {/* 加载中 */}
      {loading && (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      )}

      {/* AI 分析反馈 */}
      {feedback && hasFeedback && (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle className="text-lg">{t("feedback.title")}</CardTitle>
            {isMock && (
              <p className="text-xs text-amber-600">{t("mockNotice")}</p>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {/* 空泛词 */}
            {feedback.empty_words.length > 0 && (
              <FeedbackSection
                label={t("feedback.emptyWords")}
                items={feedback.empty_words}
                variant="destructive"
              />
            )}

            {/* 可删除部分 */}
            {feedback.delete_candidates.length > 0 && (
              <FeedbackSection
                label={t("feedback.deleteCandidates")}
                items={feedback.delete_candidates}
                variant="destructive"
              />
            )}

            {/* 抽象词 */}
            {feedback.abstract_words.length > 0 && (
              <FeedbackSection
                label={t("feedback.abstractWords")}
                items={feedback.abstract_words}
                variant="secondary"
              />
            )}

            {/* 缺少的具体细节 */}
            {feedback.missing_specifics.length > 0 && (
              <FeedbackSection
                label={t("feedback.missingSpecifics")}
                items={feedback.missing_specifics}
                variant="outline"
              />
            )}

            {/* 句子节奏问题 */}
            {feedback.rhythm_problem && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("feedback.rhythmProblem")}
                </p>
                <p className="text-sm">{feedback.rhythm_problem}</p>
              </div>
            )}

            {/* 修改任务 */}
            {feedback.revision_task && (
              <div className="rounded-lg bg-primary/5 border border-primary/20 p-4">
                <p className="text-sm font-semibold text-primary mb-1">
                  {t("feedback.revisionTask")}
                </p>
                <p className="text-sm">{feedback.revision_task}</p>
              </div>
            )}

            {/* 修改方向示例 */}
            {feedback.example_direction && (
              <div className="space-y-1">
                <p className="text-sm font-medium text-muted-foreground">
                  {t("feedback.exampleDirection")}
                </p>
                <p className="text-sm italic text-muted-foreground">
                  {feedback.example_direction}
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 无问题提示 */}
      {feedback && !hasFeedback && (
        <Card>
          <CardContent className="flex items-center gap-3 pt-6">
            <Check className="h-5 w-5 text-primary" />
            <p className="text-sm text-muted-foreground">
              {t("feedback.noIssues")}
            </p>
          </CardContent>
        </Card>
      )}

      {/* 修改区 */}
      {feedback && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t("revisionLabel")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={revision}
              onChange={(e) => {
                setRevision(e.target.value);
                setSaved(false);
              }}
              placeholder={t("revisionPlaceholder")}
              rows={3}
            />
            <div className="flex gap-2">
              <Button
                onClick={handleSaveIdea}
                disabled={saving || !revision.trim() || saved}
                variant="outline"
              >
                {saved ? (
                  <>
                    <Check className="h-4 w-4" />
                    {t("saveIdea")}
                  </>
                ) : (
                  <>
                    <Bookmark className="h-4 w-4" />
                    {t("saveIdea")}
                  </>
                )}
              </Button>
              <Button variant="ghost" onClick={handleReset}>
                {t("tryAnother")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ---- 反馈子组件：展示一组标签 ----
function FeedbackSection({
  label,
  items,
  variant,
}: {
  label: string;
  items: string[];
  variant: "destructive" | "secondary" | "outline";
}) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium text-muted-foreground">{label}</p>
      <div className="flex flex-wrap gap-2">
        {items.map((item, idx) => (
          <Badge
            key={item + "_" + idx}
            variant={variant}
            className={cn(
              variant === "destructive" &&
                "bg-destructive/10 text-destructive border-destructive/20"
            )}
          >
            {item}
          </Badge>
        ))}
      </div>
    </div>
  );
}
