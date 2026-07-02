"use client";

// ====================================================================
// 保存素材按钮组件
// ====================================================================
// 在 AI 反馈的好句、标题、判断旁边显示"保存"按钮
// 点击后保存到素材库
// ====================================================================

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bookmark, Check } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

interface SaveIdeaButtonProps {
  // 素材内容
  content: string;
  // 素材类型：sentence / title / claim / observation / example
  type: "sentence" | "title" | "claim" | "observation" | "example";
  // 按钮大小
  size?: "sm" | "default";
}

export function SaveIdeaButton({ content, type, size = "sm" }: SaveIdeaButtonProps) {
  const t = useTranslations("practice.saveIdea");
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSave() {
    if (saved || !content) return;

    setLoading(true);
    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, content, tags: [] }),
      });

      if (!res.ok) throw new Error(t("saveError"));

      setSaved(true);
      toast.success(t("savedSuccess"));
    } catch {
      toast.error(t("saveErrorRetry"));
    } finally {
      setLoading(false);
    }
  }

  if (saved) {
    return (
      <Button size={size} variant="ghost" disabled className="text-primary">
        <Check className="h-3.5 w-3.5" />
        {t("saved")}
      </Button>
    );
  }

  return (
    <Button
      size={size}
      variant="ghost"
      onClick={handleSave}
      disabled={loading || !content}
      className="text-muted-foreground hover:text-primary"
    >
      <Bookmark className="h-3.5 w-3.5" />
      {loading ? t("saving") : t("save")}
    </Button>
  );
}
