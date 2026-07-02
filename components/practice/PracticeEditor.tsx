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
  placeholder = "开始写吧。不要修改，不要追求完美，先把脑子里的东西倒出来。",
}: PracticeEditorProps) {
  const wordCount = countWords(value);
  const meetsMinimum = wordCount >= minWords;

  return (
    <div className="flex flex-col gap-2 h-full">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        placeholder={placeholder}
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
          {wordCount} 字
          {!meetsMinimum && ` （至少 ${minWords} 字）`}
        </span>
        {meetsMinimum ? (
          <span className="text-primary">✓ 已达到最低字数</span>
        ) : (
          <span className="text-muted-foreground">
            还差 {minWords - wordCount} 字
          </span>
        )}
      </div>
    </div>
  );
}
