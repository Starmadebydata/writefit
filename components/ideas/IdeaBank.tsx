"use client";

// ====================================================================
// 素材库主组件
// ====================================================================
// 展示用户保存的所有写作素材，支持：
// 1. 按类型过滤（全部 / 观察 / 句子 / 标题 / 判断 / 例子 / 引用 / 结构）
// 2. 搜索（匹配内容）
// 3. 只看收藏
// 4. 新建素材
// 5. 编辑素材
// 6. 删除素材
// 7. 收藏 / 取消收藏
//
// 数据通过 /api/ideas 和 /api/ideas/[id] 接口读写
// ====================================================================

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  Plus,
  Search,
  Star,
  Pencil,
  Trash2,
  X,
  Loader2,
  Lightbulb,
} from "lucide-react";

// ---- 类型定义 ----
type IdeaType =
  | "observation"
  | "sentence"
  | "title"
  | "claim"
  | "example"
  | "quote"
  | "structure";

interface Idea {
  id: string;
  type: IdeaType;
  content: string;
  tags: string[] | null;
  isFavorite: boolean;
  createdAt: string;
}

// 所有素材类型（用于过滤和新建表单）
const ALL_TYPES: IdeaType[] = [
  "observation",
  "sentence",
  "title",
  "claim",
  "example",
  "quote",
  "structure",
];

export function IdeaBank() {
  const t = useTranslations("ideas");

  // ---- 数据状态 ----
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loading, setLoading] = useState(true);

  // ---- 过滤状态 ----
  const [typeFilter, setTypeFilter] = useState<IdeaType | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [favoriteOnly, setFavoriteOnly] = useState(false);

  // ---- 新建/编辑表单状态 ----
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formType, setFormType] = useState<IdeaType>("sentence");
  const [formContent, setFormContent] = useState("");
  const [formTags, setFormTags] = useState("");
  const [saving, setSaving] = useState(false);

  // ---- 操作中的素材 ID（用于按钮 loading） ----
  const [actionId, setActionId] = useState<string | null>(null);

  // ---- 加载素材列表 ----
  // 注意：setLoading 放在 await 之后，避免在 effect 中同步调用 setState
  const loadIdeas = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (typeFilter !== "all") params.set("type", typeFilter);
      if (searchQuery.trim()) params.set("q", searchQuery.trim());
      if (favoriteOnly) params.set("favorite", "true");

      const res = await fetch("/api/ideas?" + params.toString());
      setLoading(true);
      if (!res.ok) throw new Error("load failed");
      const data = await res.json();
      setIdeas(data.ideas || []);
    } catch {
      toast.error(t("toast.errorLoad"));
    } finally {
      setLoading(false);
    }
  }, [typeFilter, searchQuery, favoriteOnly, t]);

  // 过滤条件变化时重新加载
  // 数据获取是 effect 的合法用途，setState 在 async 回调中调用
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadIdeas();
  }, [loadIdeas]);

  // 搜索 debounce：输入停止 300ms 后才查询
  useEffect(() => {
    const timer = setTimeout(() => {
      void loadIdeas();
    }, 300);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // ---- 打开新建表单 ----
  function handleNew() {
    setEditingId(null);
    setFormType("sentence");
    setFormContent("");
    setFormTags("");
    setShowForm(true);
  }

  // ---- 打开编辑表单 ----
  function handleEdit(idea: Idea) {
    setEditingId(idea.id);
    setFormType(idea.type);
    setFormContent(idea.content);
    setFormTags((idea.tags || []).join(", "));
    setShowForm(true);
  }

  // ---- 关闭表单 ----
  function handleCloseForm() {
    setShowForm(false);
    setEditingId(null);
    setFormContent("");
    setFormTags("");
  }

  // ---- 保存（新建或编辑） ----
  async function handleSave() {
    if (!formContent.trim()) {
      toast.error(t("form.errorContent"));
      return;
    }
    setSaving(true);
    try {
      const tags = formTags
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean);

      if (editingId) {
        // 编辑现有素材
        const res = await fetch(`/api/ideas/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: formType, content: formContent, tags }),
        });
        if (!res.ok) throw new Error("update failed");
        toast.success(t("toast.updated"));
      } else {
        // 新建素材
        const res = await fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ type: formType, content: formContent, tags }),
        });
        if (!res.ok) throw new Error("save failed");
        toast.success(t("toast.saved"));
      }
      handleCloseForm();
      void loadIdeas();
    } catch {
      toast.error(editingId ? t("toast.errorUpdate") : t("toast.errorSave"));
    } finally {
      setSaving(false);
    }
  }

  // ---- 切换收藏 ----
  async function handleToggleFavorite(idea: Idea) {
    setActionId(idea.id);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isFavorite: !idea.isFavorite }),
      });
      if (!res.ok) throw new Error("favorite failed");
      toast.success(idea.isFavorite ? t("toast.unfavorited") : t("toast.favorited"));
      void loadIdeas();
    } catch {
      toast.error(t("toast.errorUpdate"));
    } finally {
      setActionId(null);
    }
  }

  // ---- 删除素材 ----
  async function handleDelete(idea: Idea) {
    if (!window.confirm(t("actions.confirmDelete"))) return;
    setActionId(idea.id);
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("delete failed");
      toast.success(t("toast.deleted"));
      void loadIdeas();
    } catch {
      toast.error(t("toast.errorDelete"));
    } finally {
      setActionId(null);
    }
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* 标题区 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">{t("title")}</h1>
          <p className="mt-1 text-sm text-muted-foreground">{t("subtitle")}</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="h-4 w-4" />
          {t("newIdea")}
        </Button>
      </div>

      {/* 新建/编辑表单 */}
      {showForm && (
        <Card className="border-primary/30">
          <CardContent className="space-y-4 pt-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {editingId ? t("form.editTitle") : t("form.newTitle")}
              </h2>
              <Button variant="ghost" size="icon-sm" onClick={handleCloseForm}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* 类型选择 */}
            <div className="space-y-2">
              <Label>{t("form.type")}</Label>
              <Select
                value={formType}
                onValueChange={(v) => v && setFormType(v as IdeaType)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {ALL_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {t(`types.${type}`)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 内容输入 */}
            <div className="space-y-2">
              <Label>{t("form.content")}</Label>
              <Textarea
                value={formContent}
                onChange={(e) => setFormContent(e.target.value)}
                placeholder={t("form.contentPlaceholder")}
                rows={4}
              />
            </div>

            {/* 标签输入 */}
            <div className="space-y-2">
              <Label>{t("form.tags")}</Label>
              <Input
                value={formTags}
                onChange={(e) => setFormTags(e.target.value)}
                placeholder={t("form.tagsPlaceholder")}
              />
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleCloseForm}>
                {t("form.cancel")}
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 animate-spin" />}
                {t("form.save")}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 过滤工具栏 */}
      <div className="flex flex-wrap items-center gap-3">
        {/* 类型过滤 */}
        <Select
          value={typeFilter}
          onValueChange={(v) => v && setTypeFilter(v as IdeaType | "all")}
        >
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{t("filterAll")}</SelectItem>
            {ALL_TYPES.map((type) => (
              <SelectItem key={type} value={type}>
                {t(`types.${type}`)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {/* 收藏过滤 */}
        <Button
          variant={favoriteOnly ? "default" : "outline"}
          size="sm"
          onClick={() => setFavoriteOnly(!favoriteOnly)}
        >
          <Star className={cn("h-4 w-4", favoriteOnly && "fill-current")} />
          {t("filterFavorite")}
        </Button>

        {/* 搜索框 */}
        <div className="relative ml-auto flex-1 min-w-[200px] max-w-xs">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t("search")}
            className="pl-9"
          />
        </div>
      </div>

      {/* 素材数量 */}
      <div className="text-sm text-muted-foreground">
        {t("totalCount", { count: ideas.length })}
      </div>

      {/* 素材列表 */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : ideas.length === 0 ? (
        <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
          <Lightbulb className="h-10 w-10 text-muted-foreground/50" />
          <p className="text-sm text-muted-foreground">
            {searchQuery || typeFilter !== "all" || favoriteOnly
              ? t("emptyFiltered")
              : t("empty")}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {ideas.map((idea) => (
            <Card key={idea.id}>
              <CardContent className="pt-5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    {/* 类型标签 */}
                    <div className="mb-2 flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">
                        {t(`types.${idea.type}`)}
                      </Badge>
                      {(idea.tags || []).map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    {/* 内容 */}
                    <p className="whitespace-pre-wrap break-words text-sm">
                      {idea.content}
                    </p>
                  </div>

                  {/* 操作按钮 */}
                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleToggleFavorite(idea)}
                      disabled={actionId === idea.id}
                      title={idea.isFavorite ? t("actions.unfavorite") : t("actions.favorite")}
                    >
                      {actionId === idea.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star
                          className={cn(
                            "h-4 w-4",
                            idea.isFavorite
                              ? "fill-amber-400 text-amber-400"
                              : "text-muted-foreground"
                          )}
                        />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleEdit(idea)}
                      title={t("actions.edit")}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={() => handleDelete(idea)}
                      disabled={actionId === idea.id}
                      title={t("actions.delete")}
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
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
