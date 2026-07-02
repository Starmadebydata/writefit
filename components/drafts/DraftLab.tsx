"use client";

// ====================================================================
// 草稿实验室主组件
// ====================================================================
// 管理用户的长文草稿，包含两个视图：
// 1. 列表视图：草稿列表、搜索、新建、删除
// 2. 编辑器视图：编辑内容、保存版本、AI 诊断、反 AI 腔检测、版本历史、Markdown 导出
//
// 数据通过 /api/drafts 和 /api/drafts/[id] 接口读写
// AI 诊断复用 /api/ai/diagnose，反 AI 腔复用 /api/ai/anti-ai-voice
// ====================================================================

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { getAISettingsFromLocal } from "@/lib/ai/settings";
import {
  Plus,
  Search,
  Trash2,
  Pencil,
  ArrowLeft,
  Loader2,
  Save,
  Download,
  Sparkles,
  ShieldAlert,
  FileText,
  History,
  X,
} from "lucide-react";
import type { DiagnoseFeedback, AntiAIVoiceFeedback } from "@/lib/ai/schemas";

// ---- 类型定义 ----
type DraftStatus = "idea" | "outline" | "drafting" | "revising" | "ready" | "published";

interface Draft {
  id: string;
  title: string;
  topic: string | null;
  status: DraftStatus;
  currentVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

interface DraftVersion {
  id: string;
  draftId: string;
  content: string;
  versionNumber: number;
  changeSummary: string | null;
  wordCount: number;
  createdAt: string;
}

const ALL_STATUSES: DraftStatus[] = [
  "idea",
  "outline",
  "drafting",
  "revising",
  "ready",
  "published",
];

// 状态对应的 Badge 颜色
const STATUS_COLORS: Record<DraftStatus, string> = {
  idea: "bg-muted text-muted-foreground",
  outline: "bg-blue-100 text-blue-700",
  drafting: "bg-amber-100 text-amber-700",
  revising: "bg-purple-100 text-purple-700",
  ready: "bg-green-100 text-green-700",
  published: "bg-primary/10 text-primary",
};

export function DraftLab() {
  const t = useTranslations("drafts");
  const locale = useLocale();

  // ---- 视图状态：list 或 editor ----
  const [view, setView] = useState<"list" | "editor">("list");

  // ---- 列表状态 ----
  const [drafts, setDrafts] = useState<Draft[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // ---- 新建表单状态 ----
  const [showNewForm, setShowNewForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [creating, setCreating] = useState(false);

  // ---- 编辑器状态 ----
  const [currentDraft, setCurrentDraft] = useState<Draft | null>(null);
  const [editorContent, setEditorContent] = useState("");
  const [editorTitle, setEditorTitle] = useState("");
  const [editorTopic, setEditorTopic] = useState("");
  const [editorStatus, setEditorStatus] = useState<DraftStatus>("idea");
  const [originalContent, setOriginalContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [loadingEditor, setLoadingEditor] = useState(false);

  // ---- 版本历史 ----
  const [versions, setVersions] = useState<DraftVersion[]>([]);
  const [showVersions, setShowVersions] = useState(false);

  // ---- AI 反馈 ----
  const [diagnoseFeedback, setDiagnoseFeedback] = useState<DiagnoseFeedback | null>(null);
  const [antiAiFeedback, setAntiAiFeedback] = useState<AntiAIVoiceFeedback | null>(null);
  const [diagnosing, setDiagnosing] = useState(false);
  const [isMockFeedback, setIsMockFeedback] = useState(false);

  // ---- 操作中的草稿 ID ----
  const [actionId, setActionId] = useState<string | null>(null);

  // ---- 加载草稿列表 ----
  const loadDrafts = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      const res = await fetch("/api/drafts?" + params.toString());
      setLoading(true);
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setDrafts(data.drafts || []);
    } catch {
      toast.error(t("toast.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [searchQuery, t]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadDrafts();
  }, [loadDrafts]);

  // 搜索 debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadDrafts();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ---- 新建草稿 ----
  async function handleCreate() {
    if (!newTitle.trim()) {
      toast.error(t("form.errorTitle"));
      return;
    }
    setCreating(true);
    try {
      const res = await fetch("/api/drafts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          topic: newTopic || null,
          content: "",
          status: "idea",
        }),
      });
      if (!res.ok) throw new Error("create failed");
      const data = await res.json();
      toast.success(t("toast.created"));
      setShowNewForm(false);
      setNewTitle("");
      setNewTopic("");
      void loadDrafts();
      // 直接进入编辑器
      void openEditor(data.id);
    } catch {
      toast.error(t("toast.errorCreate"));
    } finally {
      setCreating(false);
    }
  }

  // ---- 打开编辑器 ----
  async function openEditor(draftId: string) {
    setLoadingEditor(true);
    setView("editor");
    setDiagnoseFeedback(null);
    setAntiAiFeedback(null);
    try {
      const res = await fetch("/api/drafts/" + draftId);
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setCurrentDraft(data.draft);
      setEditorTitle(data.draft.title);
      setEditorTopic(data.draft.topic || "");
      setEditorStatus(data.draft.status);
      setEditorContent(data.currentVersion?.content || "");
      setOriginalContent(data.currentVersion?.content || "");
      setLastSaved(data.draft.updatedAt);
    } catch {
      toast.error(t("toast.errorLoad"));
      setView("list");
    } finally {
      setLoadingEditor(false);
    }
  }

  // ---- 保存版本 ----
  async function handleSaveVersion() {
    if (!currentDraft) return;
    if (editorContent === originalContent && editorTitle === currentDraft.title) {
      toast.success(t("editor.saved"));
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/drafts/" + currentDraft.id, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: editorTitle,
          topic: editorTopic || null,
          status: editorStatus,
          content: editorContent,
        }),
      });
      if (!res.ok) throw new Error("save failed");
      setOriginalContent(editorContent);
      setLastSaved(new Date().toISOString());
      setCurrentDraft((prev) =>
        prev ? { ...prev, title: editorTitle, topic: editorTopic || null, status: editorStatus } : prev
      );
      toast.success(t("toast.versionSaved"));
    } catch {
      toast.error(t("toast.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  // ---- 加载版本历史 ----
  async function loadVersions() {
    if (!currentDraft) return;
    setShowVersions(!showVersions);
    if (versions.length > 0) return;
    try {
      const res = await fetch("/api/drafts/" + currentDraft.id + "?versions=true");
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setVersions(data.versions || []);
    } catch {
      toast.error(t("toast.errorLoad"));
    }
  }

  // ---- 恢复某个版本 ----
  async function handleRestoreVersion(version: DraftVersion) {
    if (!currentDraft) return;
    setEditorContent(version.content);
    setOriginalContent(version.content);
    setShowVersions(false);
    toast.success(t("editor.versionLabel", { number: version.versionNumber }) + " → " + t("editor.restore"));
  }

  // ---- AI 诊断 ----
  async function handleDiagnose() {
    if (!editorContent.trim()) return;
    setDiagnosing(true);
    setDiagnoseFeedback(null);
    try {
      const aiConfig = getAISettingsFromLocal();
      const res = await fetch("/api/ai/diagnose", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorContent, language: locale, aiConfig }),
      });
      if (!res.ok) throw new Error("diagnose failed");
      const data = (await res.json()) as DiagnoseFeedback & { _mock?: boolean };
      setDiagnoseFeedback(data);
      setIsMockFeedback(!!data._mock);
    } catch {
      toast.error(t("toast.errorDiagnose"));
    } finally {
      setDiagnosing(false);
    }
  }

  // ---- 反 AI 腔检测 ----
  async function handleAntiAiVoice() {
    if (!editorContent.trim()) return;
    setDiagnosing(true);
    setAntiAiFeedback(null);
    try {
      const aiConfig = getAISettingsFromLocal();
      const res = await fetch("/api/ai/anti-ai-voice", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: editorContent, language: locale, aiConfig }),
      });
      if (!res.ok) throw new Error("detect failed");
      const data = (await res.json()) as AntiAIVoiceFeedback & { _mock?: boolean };
      setAntiAiFeedback(data);
      setIsMockFeedback(!!data._mock);
    } catch {
      toast.error(t("toast.errorDiagnose"));
    } finally {
      setDiagnosing(false);
    }
  }

  // ---- 导出 Markdown ----
  async function handleExport() {
    if (!currentDraft) return;
    try {
      const res = await fetch("/api/drafts/" + currentDraft.id + "?export=markdown");
      if (!res.ok) throw new Error("export failed");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = currentDraft.title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5_-]/g, "_") + ".md";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(t("toast.exported"));
    } catch {
      toast.error(t("toast.errorExport"));
    }
  }

  // ---- 删除草稿 ----
  async function handleDelete(draft: Draft) {
    if (!window.confirm(t("actions.confirmDelete"))) return;
    setActionId(draft.id);
    try {
      const res = await fetch("/api/drafts/" + draft.id, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast.success(t("toast.deleted"));
      void loadDrafts();
    } catch {
      toast.error(t("toast.errorDelete"));
    } finally {
      setActionId(null);
    }
  }

  // ---- 返回列表 ----
  function handleBack() {
    setView("list");
    setCurrentDraft(null);
    setEditorContent("");
    setVersions([]);
    setDiagnoseFeedback(null);
    setAntiAiFeedback(null);
    setShowVersions(false);
    void loadDrafts();
  }

  const hasUnsavedChanges = editorContent !== originalContent;
  const wordCount = editorContent.trim().length;

  // ============ 编辑器视图 ============
  if (view === "editor") {
    return (
      <div className="mx-auto max-w-4xl space-y-6">
        {/* 顶部导航 */}
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={handleBack}>
            <ArrowLeft className="h-4 w-4" />
            {t("backToList")}
          </Button>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-4 w-4" />
              {t("editor.exportMarkdown")}
            </Button>
            <Button variant="outline" size="sm" onClick={loadVersions}>
              <History className="h-4 w-4" />
              {t("editor.versions")}
            </Button>
          </div>
        </div>

        {loadingEditor ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            {/* 草稿元信息 */}
            <Card>
              <CardContent className="space-y-4 pt-6">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label>{t("form.titleLabel")}</Label>
                    <Input
                      value={editorTitle}
                      onChange={(e) => setEditorTitle(e.target.value)}
                      placeholder={t("form.titlePlaceholder")}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>{t("form.statusLabel")}</Label>
                    <Select
                      value={editorStatus}
                      onValueChange={(v) => v && setEditorStatus(v as DraftStatus)}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ALL_STATUSES.map((s) => (
                          <SelectItem key={s} value={s}>
                            {t("statuses." + s)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>{t("form.topicLabel")}</Label>
                  <Input
                    value={editorTopic}
                    onChange={(e) => setEditorTopic(e.target.value)}
                    placeholder={t("form.topicPlaceholder")}
                  />
                </div>
              </CardContent>
            </Card>

            {/* 编辑器 */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">{t("editor.title")}</CardTitle>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{t("editor.wordCount", { count: wordCount })}</span>
                    {hasUnsavedChanges ? (
                      <span className="text-amber-600">{t("editor.unsaved")}</span>
                    ) : (
                      <span className="text-green-600">✓ {t("editor.saved")}</span>
                    )}
                    {lastSaved && !hasUnsavedChanges && (
                      <span className="hidden sm:inline">
                        {t("editor.lastSaved", {
                          time: new Date(lastSaved).toLocaleString(locale === "zh" ? "zh-CN" : "en-US"),
                        })}
                      </span>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={editorContent}
                  onChange={(e) => setEditorContent(e.target.value)}
                  placeholder={t("form.contentPlaceholder")}
                  rows={16}
                  className="font-mono text-sm"
                />
                <div className="flex flex-wrap gap-2">
                  <Button onClick={handleSaveVersion} disabled={saving}>
                    {saving ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? t("editor.saving") : t("editor.saveVersion")}
                  </Button>
                  <Button variant="outline" onClick={handleDiagnose} disabled={diagnosing || !editorContent.trim()}>
                    {diagnosing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {diagnosing ? t("editor.diagnosing") : t("editor.aiDiagnose")}
                  </Button>
                  <Button variant="outline" onClick={handleAntiAiVoice} disabled={diagnosing || !editorContent.trim()}>
                    {diagnosing ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldAlert className="h-4 w-4" />}
                    {t("editor.antiAiVoice")}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* 版本历史 */}
            {showVersions && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">{t("editor.versions")}</CardTitle>
                </CardHeader>
                <CardContent>
                  {versions.length === 0 ? (
                    <p className="text-sm text-muted-foreground py-4 text-center">
                      {t("editor.noVersions")}
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {versions.map((v) => (
                        <div
                          key={v.id}
                          className="flex items-center justify-between rounded-lg border p-3"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-medium">
                                {t("editor.versionLabel", { number: v.versionNumber })}
                              </span>
                              {currentDraft?.currentVersionId === v.id && (
                                <Badge variant="outline" className="text-xs">
                                  {t("editor.currentVersion")}
                                </Badge>
                              )}
                            </div>
                            <p className="text-xs text-muted-foreground mt-1">
                              {t("editor.wordCount", { count: v.wordCount })} ·{" "}
                              {new Date(v.createdAt).toLocaleString(locale === "zh" ? "zh-CN" : "en-US")}
                            </p>
                          </div>
                          {currentDraft?.currentVersionId !== v.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRestoreVersion(v)}
                            >
                              {t("editor.restore")}
                            </Button>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* AI 诊断反馈 */}
            {diagnoseFeedback && (
              <Card className="border-primary/20">
                <CardHeader>
                  <CardTitle className="text-lg">{t("feedback.aiDiagnoseTitle")}</CardTitle>
                  {isMockFeedback && (
                    <p className="text-xs text-amber-600">{t("feedback.mockNotice")}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* 评分 */}
                  {diagnoseFeedback.scores && (
                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                      {(["clarity", "specificity", "voice", "ai_like"] as const).map((key) => {
                        const score = diagnoseFeedback.scores?.[key];
                        if (typeof score !== "number") return null;
                        return (
                          <div key={key} className="rounded-lg border p-3 text-center">
                            <p className="text-2xl font-bold">{score}</p>
                            <p className="text-xs text-muted-foreground">
                              {key === "ai_like" ? t("feedback.scores.aiLike") : t("feedback.scores." + key)}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* 主要问题 */}
                  {diagnoseFeedback.top_issues && diagnoseFeedback.top_issues.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t("feedback.topIssues")}</p>
                      {diagnoseFeedback.top_issues.map((issue, idx) => (
                        <div key={idx} className="rounded-lg bg-muted/50 p-3 text-sm">
                          <p className="font-medium">{issue.issue}</p>
                          {issue.evidence && (
                            <p className="text-muted-foreground mt-1 italic">{"\u201c"}{issue.evidence}{"\u201d"}</p>
                          )}
                          {issue.why_it_matters && (
                            <p className="text-muted-foreground mt-1">{issue.why_it_matters}</p>
                          )}
                          {issue.revision_task && (
                            <p className="text-primary mt-1">{issue.revision_task}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {/* 最好的句子 */}
                  {diagnoseFeedback.best_sentence && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3">
                      <p className="text-xs font-medium text-green-700 mb-1">{t("feedback.bestSentence")}</p>
                      <p className="text-sm">{diagnoseFeedback.best_sentence}</p>
                    </div>
                  )}
                  {/* 最像 AI 的句子 */}
                  {diagnoseFeedback.most_ai_like_sentence && (
                    <div className="rounded-lg bg-amber-50 border border-amber-200 p-3">
                      <p className="text-xs font-medium text-amber-700 mb-1">{t("feedback.mostAiLike")}</p>
                      <p className="text-sm">{diagnoseFeedback.most_ai_like_sentence}</p>
                    </div>
                  )}
                  {/* 下一步目标 */}
                  {diagnoseFeedback.next_revision_goal && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-xs font-semibold text-primary mb-1">{t("feedback.nextGoal")}</p>
                      <p className="text-sm">{diagnoseFeedback.next_revision_goal}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* 反 AI 腔反馈 */}
            {antiAiFeedback && (
              <Card className="border-amber-200">
                <CardHeader>
                  <CardTitle className="text-lg">{t("feedback.antiAiVoiceTitle")}</CardTitle>
                  {isMockFeedback && (
                    <p className="text-xs text-amber-600">{t("feedback.mockNotice")}</p>
                  )}
                </CardHeader>
                <CardContent className="space-y-4">
                  {antiAiFeedback.ai_like_score !== undefined && (
                    <div className="rounded-lg border p-3 text-center">
                      <p className="text-2xl font-bold">{antiAiFeedback.ai_like_score}</p>
                      <p className="text-xs text-muted-foreground">{t("feedback.aiVoiceScore")}</p>
                    </div>
                  )}
                  {antiAiFeedback.flagged_sentences && antiAiFeedback.flagged_sentences.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium">{t("feedback.aiVoiceIssues")}</p>
                      {antiAiFeedback.flagged_sentences.map((item, idx) => (
                        <div key={idx} className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm">
                          <p className="font-medium">{item.problem_type}</p>
                          {item.sentence && (
                            <p className="text-muted-foreground mt-1 italic">{"\u201c"}{item.sentence}{"\u201d"}</p>
                          )}
                          {item.reason && (
                            <p className="text-muted-foreground mt-1">{item.reason}</p>
                          )}
                          {item.manual_revision_instruction && (
                            <p className="text-primary mt-1">{item.manual_revision_instruction}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                  {antiAiFeedback.banned_phrases_found && antiAiFeedback.banned_phrases_found.length > 0 && (
                    <div className="flex flex-wrap gap-2">
                      {antiAiFeedback.banned_phrases_found.map((phrase, idx) => (
                        <Badge key={idx} variant="destructive" className="bg-destructive/10">
                          {phrase}
                        </Badge>
                      ))}
                    </div>
                  )}
                  {antiAiFeedback.one_revision_priority && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3">
                      <p className="text-xs font-semibold text-primary mb-1">{t("feedback.revisionTask")}</p>
                      <p className="text-sm">{antiAiFeedback.one_revision_priority}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>
    );
  }

  // ============ 列表视图 ============
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 标题区 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={() => setShowNewForm(!showNewForm)}>
          <Plus className="h-4 w-4" />
          {t("newDraft")}
        </Button>
      </div>

      {/* 新建草稿表单 */}
      {showNewForm && (
        <Card className="border-primary/30">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">{t("form.newTitle")}</h2>
              <Button variant="ghost" size="icon-sm" onClick={() => setShowNewForm(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              <Label>{t("form.titleLabel")}</Label>
              <Input
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder={t("form.titlePlaceholder")}
                onKeyDown={(e) => {
                  if (e.key === "Enter") void handleCreate();
                }}
              />
            </div>
            <div className="space-y-2">
              <Label>{t("form.topicLabel")}</Label>
              <Input
                value={newTopic}
                onChange={(e) => setNewTopic(e.target.value)}
                placeholder={t("form.topicPlaceholder")}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setShowNewForm(false)}>
                {t("form.cancel")}
              </Button>
              <Button onClick={handleCreate} disabled={creating}>
                {creating && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("form.create")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 搜索框 */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={t("search")}
          className="pl-9 max-w-sm"
        />
      </div>

      {/* 草稿数量 */}
      <div className="text-sm text-muted-foreground">
        {t("totalCount", { count: drafts.length })}
      </div>

      {/* 草稿列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : drafts.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <FileText className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {searchQuery ? t("emptyFiltered") : t("empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {drafts.map((draft) => (
            <Card
              key={draft.id}
              className="cursor-pointer transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <CardContent
                className="pt-5"
                onClick={() => openEditor(draft.id)}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-xs font-medium",
                          STATUS_COLORS[draft.status]
                        )}
                      >
                        {t("statuses." + draft.status)}
                      </span>
                      {draft.topic && (
                        <Badge variant="outline" className="text-xs">
                          {draft.topic}
                        </Badge>
                      )}
                    </div>
                    <h3 className="font-semibold truncate">{draft.title}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {new Date(draft.updatedAt).toLocaleDateString(locale === "zh" ? "zh-CN" : "en-US")}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button variant="ghost" size="icon-sm" onClick={() => openEditor(draft.id)}>
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(draft)}
                      disabled={actionId === draft.id}
                    >
                      {actionId === draft.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
