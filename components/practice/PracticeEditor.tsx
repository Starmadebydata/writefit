"use client";

// ====================================================================
// 写作编辑器组件
// ====================================================================
// 用户在这个编辑器里写原始稿
// MVP 阶段用 textarea，简单可靠
// 后续可以升级为 TipTap 富文本编辑器
// ====================================================================

import { Textarea } from "@/components/ui/textarea";
import { countWords } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

interface PracticeEditorProps {
  // 编辑器内容
  value: string;
  // 内容变化回调
  onChange: (value: string) => void;
  // 最低字数要求
  minWords: number;
  // 是否禁用（比如提交后不能再编辑）
  disabled?: boolean;
  // 占位符
  placeholder?: string;
}

export function PracticeEditor({
  value,
  onChange,
  minWords,
  disabled = false,
  placeholder,
}: PracticeEditorProps) {
  const t = useTranslations("practice.editor");
  const wordCount = countWords(value);
  const meetsMinimum = wordCount >= minWords;
  const effectivePlaceholder = placeholder ?? t("placeholder");

  return (
    <div className="flex flex-col gap-2 h-full">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={effectivePlaceholder}
        className={cn(
          "flex-1 min-h-[300px] resize-none text-base leading-relaxed p-4",
          disabled && "bg-muted/50"
        )}
      />

      {/* 底部状态栏：字数统计 */}
      <div className="flex items-center justify-between text-sm">
        <span
          className={cn(
            "tabular-nums",
            meetsMinimum ? "text-primary" : "text-muted-foreground"
          )}
        >
          {t("wordCount", { count: wordCount })}
          {!meetsMinimum && t("minWords", { min: minWords })}
        </span>
        {meetsMinimum ? (
          <span className="text-primary">{t("reachedMin")}</span>
        ) : (
          <span className="text-muted-foreground">
            {t("needMore", { remaining: minWords - wordCount })}
          </span>
        )}
      </div>
    </div>
  );
}
