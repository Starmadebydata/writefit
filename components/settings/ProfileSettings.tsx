"use client";

// ====================================================================
// 写作画像设置组件
// ====================================================================
// 用户可在 Settings 页面编辑自己的写作画像：
// - 写作目标（多选）
// - 偏好主题（多选）
// - 写作问题（多选）
// - 每日训练时长（单选）
// - 禁用词管理（添加/删除）
//
// 通过 /api/profile GET/PUT 读写数据
// ====================================================================

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Loader2, Save, X, Plus } from "lucide-react";

// 选项常量（和 OnboardingFlow 保持一致）
const GOAL_OPTIONS = [
  "restore_writing",
  "reduce_ai_voice",
  "write_blog",
  "write_newsletter",
  "write_tech",
  "write_product",
  "improve_english",
  "build_brand",
];

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
];

const PROBLEM_OPTIONS = [
  "hard_to_start",
  "vague_content",
  "messy_structure",
  "stiff_sentences",
  "no_voice",
  "ai_dependent",
  "inconsistent",
];

const DURATION_OPTIONS = [10, 15, 30];

interface ProfileData {
  goals: string[];
  topics: string[];
  problems: string[];
  dailyPracticeMinutes: number;
  bannedPhrases: string[];
}

export function ProfileSettings() {
  const t = useTranslations("settings.profile");
  const tOnboarding = useTranslations("onboarding");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [data, setData] = useState<ProfileData>({
    goals: [],
    topics: [],
    problems: [],
    dailyPracticeMinutes: 10,
    bannedPhrases: [],
  });
  const [newPhrase, setNewPhrase] = useState("");

  // ---- 加载画像数据 ----
  const loadProfile = useCallback(async () => {
    try {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("load failed");
      const result = await res.json();
      setData({
        goals: (result.goals || []).map((g: { goal: string }) => g.goal),
        topics: result.profile?.preferredTopics || [],
        problems: result.profile?.writingProblems || [],
        dailyPracticeMinutes: result.profile?.dailyPracticeMinutes || 10,
        bannedPhrases: result.profile?.bannedPhrases || [],
      });
    } catch {
      toast.error(t("loadError"));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadProfile();
  }, [loadProfile]);

  // ---- 切换多选项 ----
  function toggleArray(field: keyof Pick<ProfileData, "goals" | "topics" | "problems">, value: string) {
    setData((prev) => {
      const arr = prev[field];
      return {
        ...prev,
        [field]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      };
    });
  }

  // ---- 添加禁用词 ----
  function addPhrase() {
    const phrase = newPhrase.trim();
    if (!phrase) return;
    if (data.bannedPhrases.includes(phrase)) {
      setNewPhrase("");
      return;
    }
    setData((prev) => ({ ...prev, bannedPhrases: [...prev.bannedPhrases, phrase] }));
    setNewPhrase("");
  }

  // ---- 删除禁用词 ----
  function removePhrase(phrase: string) {
    setData((prev) => ({
      ...prev,
      bannedPhrases: prev.bannedPhrases.filter((p) => p !== phrase),
    }));
  }

  // ---- 保存 ----
  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: data.goals,
          topics: data.topics,
          problems: data.problems,
          dailyPracticeMinutes: data.dailyPracticeMinutes,
          bannedPhrases: data.bannedPhrases,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      toast.success(t("saved"));
    } catch {
      toast.error(t("saveError"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{t("title")}</CardTitle>
        <p className="text-sm text-muted-foreground">{t("subtitle")}</p>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* 写作目标 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t("goalsLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {GOAL_OPTIONS.map((goal) => (
              <button
                key={goal}
                type="button"
                onClick={() => toggleArray("goals", goal)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  data.goals.includes(goal)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted/50"
                )}
              >
                {tOnboarding("goals." + goal)}
              </button>
            ))}
          </div>
        </div>

        {/* 偏好主题 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t("topicsLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {TOPIC_OPTIONS.map((topic) => (
              <button
                key={topic}
                type="button"
                onClick={() => toggleArray("topics", topic)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  data.topics.includes(topic)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted/50"
                )}
              >
                {tOnboarding("topics." + topic)}
              </button>
            ))}
          </div>
        </div>

        {/* 写作问题 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t("problemsLabel")}</Label>
          <div className="flex flex-wrap gap-2">
            {PROBLEM_OPTIONS.map((problem) => (
              <button
                key={problem}
                type="button"
                onClick={() => toggleArray("problems", problem)}
                className={cn(
                  "rounded-full border px-3 py-1.5 text-sm transition-colors",
                  data.problems.includes(problem)
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted/50"
                )}
              >
                {tOnboarding("problems." + problem)}
              </button>
            ))}
          </div>
        </div>

        {/* 每日训练时长 */}
        <div className="space-y-3">
          <Label className="text-sm font-semibold">{t("durationLabel")}</Label>
          <div className="flex gap-2">
            {DURATION_OPTIONS.map((min) => (
              <button
                key={min}
                type="button"
                onClick={() => setData((prev) => ({ ...prev, dailyPracticeMinutes: min }))}
                className={cn(
                  "rounded-lg border px-4 py-2 text-sm transition-colors",
                  data.dailyPracticeMinutes === min
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-background hover:bg-muted/50"
                )}
              >
                {t("duration" + min)}
              </button>
            ))}
          </div>
        </div>

        {/* 禁用词管理 */}
        <div className="space-y-3">
          <div>
            <Label className="text-sm font-semibold">{t("bannedLabel")}</Label>
            <p className="text-xs text-muted-foreground mt-1">{t("bannedDesc")}</p>
          </div>
          {/* 已添加的禁用词 */}
          {data.bannedPhrases.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {data.bannedPhrases.map((phrase) => (
                <Badge
                  key={phrase}
                  variant="destructive"
                  className="bg-destructive/10 text-destructive border-destructive/20 gap-1"
                >
                  {phrase}
                  <button
                    type="button"
                    onClick={() => removePhrase(phrase)}
                    className="ml-1 hover:bg-destructive/20 rounded-full p-0.5"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          )}
          {/* 添加新禁用词 */}
          <div className="flex gap-2">
            <Input
              value={newPhrase}
              onChange={(e) => setNewPhrase(e.target.value)}
              placeholder={t("bannedPlaceholder")}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPhrase();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addPhrase} disabled={!newPhrase.trim()}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* 保存按钮 */}
        <div className="flex justify-end pt-2">
          <Button onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            {saving ? t("saving") : t("save")}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
