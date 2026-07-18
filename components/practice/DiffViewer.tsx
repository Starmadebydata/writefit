"use client";

// ====================================================================
// 版本对比组件（Diff Viewer）
// ====================================================================
// 展示用户原稿和修改稿的差异
// 左侧：原稿，右侧：修改稿
// 用颜色标记变化：红色=删除，绿色=新增
//
// 词级对比：基于 LCS（最长公共子序列）算法。
// 分词规则：中文字符逐字为 token，英文按单词为 token，空白保留。
// 这样改一个词只高亮一个词，而不是整句标红标绿。
// ====================================================================

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, FileEdit } from "lucide-react";
import { useTranslations } from "next-intl";

interface DiffViewerProps {
  original: string;
  revised: string;
}

type DiffOp = "keep" | "del" | "add";
interface DiffToken {
  op: DiffOp;
  token: string;
}

// 把文本切成 token：单个中文字符 / 连续英文单词 / 空白
function tokenize(text: string): string[] {
  return text.match(/[一-龥]|[^\s一-龥]+|\s+/g) ?? [];
}

// LCS 词级对比，返回带操作标记的 token 序列
// 序列同时包含 del（原稿独有）和 add（修改稿独有）：
// 渲染原稿时用 keep+del，渲染修改稿时用 keep+add
function diffTokens(original: string, revised: string): DiffToken[] {
  const a = tokenize(original);
  const b = tokenize(revised);
  const n = a.length;
  const m = b.length;

  // 超长文本退化为整体对比，避免 O(n*m) 内存过大
  if (n * m > 1_000_000) {
    if (original === revised) return a.map((token) => ({ op: "keep" as const, token }));
    return [
      ...a.map((token) => ({ op: "del" as const, token })),
      ...b.map((token) => ({ op: "add" as const, token })),
    ];
  }

  // DP 表：dp[i][j] = a[:i] 与 b[:j] 的 LCS 长度
  const width = m + 1;
  const dp = new Int32Array((n + 1) * width);
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i * width + j] =
        a[i] === b[j]
          ? dp[(i + 1) * width + j + 1] + 1
          : Math.max(dp[(i + 1) * width + j], dp[i * width + j + 1]);
    }
  }

  // 回溯生成 diff 序列
  const ops: DiffToken[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      ops.push({ op: "keep", token: a[i] });
      i++;
      j++;
    } else if (dp[(i + 1) * width + j] >= dp[i * width + j + 1]) {
      ops.push({ op: "del", token: a[i] });
      i++;
    } else {
      ops.push({ op: "add", token: b[j] });
      j++;
    }
  }
  while (i < n) ops.push({ op: "del", token: a[i++] });
  while (j < m) ops.push({ op: "add", token: b[j++] });
  return ops;
}

export function DiffViewer({ original, revised }: DiffViewerProps) {
  const t = useTranslations("practice.diff");
  const ops = useMemo(() => diffTokens(original, revised), [original, revised]);

  const deletedCount = ops.filter((o) => o.op === "del" && o.token.trim()).length;
  const addedCount = ops.filter((o) => o.op === "add" && o.token.trim()).length;

  return (
    <div className="space-y-4">
      {/* 统计概览 */}
      <div className="flex gap-4 text-sm">
        <span className="text-destructive">
          {t("deleted", { count: deletedCount })}
        </span>
        <span className="text-primary">
          {t("added", { count: addedCount })}
        </span>
      </div>

      {/* 左右对比视图 */}
      <div className="grid md:grid-cols-2 gap-4">
        {/* 原稿：keep 正常显示，del 红色删除线 */}
        <Card className="border-destructive/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {t("original")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {ops
                .filter((o) => o.op !== "add")
                .map((o, idx) =>
                  o.op === "del" ? (
                    <mark key={idx} className="bg-destructive/10 text-destructive line-through rounded-sm px-0">
                      {o.token}
                    </mark>
                  ) : (
                    <span key={idx} className="text-muted-foreground">{o.token}</span>
                  )
                )}
            </p>
          </CardContent>
        </Card>

        {/* 修改稿：keep 正常显示，add 绿色高亮 */}
        <Card className="border-primary/20">
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-sm">
              <FileEdit className="h-4 w-4 text-primary" />
              {t("revised")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
              {ops
                .filter((o) => o.op !== "del")
                .map((o, idx) =>
                  o.op === "add" ? (
                    <mark key={idx} className="bg-primary/10 text-primary rounded-sm px-0">
                      {o.token}
                    </mark>
                  ) : (
                    <span key={idx}>{o.token}</span>
                  )
                )}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
