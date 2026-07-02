"use client";

// ====================================================================
// 版本对比组件（Diff Viewer）
// ====================================================================
// 展示用户原稿和修改稿的差异
// 左侧：原稿，右侧：修改稿
// 用颜色标记变化：红色=删除，绿色=新增
// ====================================================================

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileEdit } from "lucide-react";

interface DiffViewerProps {
  original: string;
  revised: string;
}

// 简单的逐行对比算法
// 把文本按句子分割，找出新增和删除的句子
function diffSentences(original: string, revised: string) {
  // 按句子分割（中文句号、英文句号、换行）
  const splitSentences = (text: string) =>
    text
      .split(/([。.！!？?\n]+)/)
      .filter((s) => s.trim().length > 0)
      .map((s) => s.trim());

  const originalSentences = splitSentences(original);
  const revisedSentences = splitSentences(revised);

  // 找出被删除的句子（原稿有，修改稿没有）
  const deleted = originalSentences.filter(
    (s) => !revisedSentences.includes(s)
  );

  // 找出新增的句子（修改稿有，原稿没有）
  const added = revisedSentences.filter(
    (s) => !originalSentences.includes(s)
  );

  // 保留的句子
  const kept = revisedSentences.filter((s) => originalSentences.includes(s));

  return { deleted, added, kept, originalSentences, revisedSentences };
}

export function DiffViewer({ original, revised }: DiffViewerProps) {
  const diff = useMemo(() => diffSentences(original, revised), [original, revised]);

  return (
    <div className="space-y-4">
      {/* 统计概览 */}
      <div className="flex gap-4 text-sm">
        <span className="text-destructive">
          删除 {diff.deleted.length} 句
        </span>
        <span className="text-primary">
          新增 {diff.added.length} 句
        </span>
        <span className="text-muted-foreground">
          保留 {diff.kept.length} 句
        </span>
      </div>

      {/* 左右对比视图 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 原稿 */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              原稿
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm leading-relaxed">
              {diff.originalSentences.map((sentence, i) => {
                const isDeleted = diff.deleted.includes(sentence);
                return (
                  <p
                    key={i}
                    className={
                      isDeleted
                        ? "bg-destructive/10 text-destructive line-through rounded px-1"
                        : "text-muted-foreground"
                    }
                  >
                    {sentence}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* 修改稿 */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileEdit className="h-4 w-4 text-primary" />
              修改稿
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm leading-relaxed">
              {diff.revisedSentences.map((sentence, i) => {
                const isAdded = diff.added.includes(sentence);
                return (
                  <p
                    key={i}
                    className={
                      isAdded
                        ? "bg-primary/10 text-primary rounded px-1"
                        : ""
                    }
                  >
                    {sentence}
                  </p>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
