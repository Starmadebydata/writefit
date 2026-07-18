// ====================================================================
// AI 反馈数据类型定义
// ====================================================================
// 这里定义 AI 返回数据的 TypeScript 类型
// 让代码在编译时就能检查数据格式是否正确
// ====================================================================

// 单个问题反馈
export interface TopIssue {
  issue: string; // 问题名称
  evidence: string; // 引用用户原文
  why_it_matters: string; // 为什么影响表达
  revision_task: string; // 修改任务
}

// 诊断反馈的完整结构
export interface DiagnoseFeedback {
  top_issues: TopIssue[]; // 最重要的 3 个问题
  best_sentence: string; // 最好的句子
  most_ai_like_sentence: string; // 最像 AI 的句子
  next_revision_goal: string; // 下一轮修改目标
  scores: {
    clarity: number; // 清晰度 0-100
    specificity: number; // 具体性 0-100
    voice: number; // 个人声音 0-100
    ai_like: number; // AI 腔程度 0-100
  };
}

// 反 AI 腔检测中被标记的句子
export interface FlaggedSentence {
  sentence: string; // 被标记的句子
  problem_type: string; // 问题类型
  reason: string; // 原因
  manual_revision_instruction: string; // 修改任务
}

// 反 AI 腔检测的完整结果
export interface AntiAIVoiceFeedback {
  ai_like_score: number; // AI 腔总分 0-100
  flagged_sentences: FlaggedSentence[]; // 被标记的句子列表
  banned_phrases_found: string[]; // 发现的禁用词
  one_revision_priority: string; // 本轮最重要修改方向
}

// 句子手术的完整结果
export interface SentenceSurgeryFeedback {
  empty_words: string[]; // 空泛词
  delete_candidates: string[]; // 可删除部分
  abstract_words: string[]; // 抽象词
  missing_specifics: string[]; // 缺少的具体细节
  rhythm_problem: string; // 句子节奏问题
  revision_task: string; // 修改任务
  example_direction: string; // 修改方向示例
}

// 版本对比的完整结果
export interface CompareRevisionFeedback {
  improved: boolean; // 是否改善了
  summary: string; // 总体评价
  what_improved: string[]; // 改善的方面
  what_got_worse: string[]; // 变差的方面
  specificity_change: string; // 具体性变化
  voice_change: string; // 个人声音变化
  ai_like_change: string; // AI 腔变化
  next_revision_task: string; // 下一步修改建议
}

// 评分解释工具函数
export function scoreLabel(
  score: number,
  isReverse = false,
  locale: "en" | "zh" = "en"
): string {
  const zh = {
    reverse: ["人话，具体", "略泛", "明显模板化", "AI 腔重", "非常像 AI"],
    normal: ["很弱", "较弱", "一般", "不错", "优秀"],
  };
  const en = {
    reverse: ["Human & specific", "Slightly vague", "Template-like", "Heavy AI tone", "Very AI-like"],
    normal: ["Very weak", "Weak", "Average", "Good", "Excellent"],
  };
  const labels = locale === "zh" ? zh : en;
  const set = isReverse ? labels.reverse : labels.normal;
  if (score <= 20) return set[0];
  if (score <= 40) return set[1];
  if (score <= 60) return set[2];
  if (score <= 80) return set[3];
  return set[4];
}

// --------------------------------------------------------------------
// AI 输出的运行时校验与清洗
// --------------------------------------------------------------------
// BYOK 模式下用户可能接入能力较弱的模型，返回的 JSON 结构不完整：
// 缺字段、分数越界、字符串数字、top_issues 数量不对等。
// 这些函数把任意输入清洗成前端可以安全渲染的结构。

function asString(v: unknown): string {
  return typeof v === "string" ? v : v == null ? "" : String(v);
}

function asStringArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map(asString).filter((s) => s.trim().length > 0);
}

// 分数清洗：非数字给中性默认 50，越界截断到 0-100
function clampScore(v: unknown): number {
  const n = typeof v === "string" ? parseFloat(v) : typeof v === "number" ? v : NaN;
  if (!Number.isFinite(n)) return 50;
  return Math.max(0, Math.min(100, Math.round(n)));
}

// 检查诊断结果是否"基本可用"（决定是否需要重试）
export function isUsableDiagnose(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return (
    Array.isArray(r.top_issues) &&
    r.top_issues.length > 0 &&
    r.top_issues.some(
      (it) => it && typeof it === "object" && asString((it as Record<string, unknown>).issue).trim().length > 0
    )
  );
}

// 清洗诊断反馈：保证前端渲染所需的全部字段存在
export function sanitizeDiagnoseFeedback(raw: unknown): DiagnoseFeedback {
  const r = (raw ?? {}) as Record<string, unknown>;
  const rawIssues = Array.isArray(r.top_issues) ? r.top_issues : [];
  const top_issues: TopIssue[] = rawIssues.slice(0, 3).map((it) => {
    const o = (it ?? {}) as Record<string, unknown>;
    return {
      issue: asString(o.issue) || "—",
      evidence: asString(o.evidence),
      why_it_matters: asString(o.why_it_matters),
      revision_task: asString(o.revision_task),
    };
  });
  const scores = (r.scores ?? {}) as Record<string, unknown>;
  return {
    top_issues,
    best_sentence: asString(r.best_sentence),
    most_ai_like_sentence: asString(r.most_ai_like_sentence),
    next_revision_goal: asString(r.next_revision_goal),
    scores: {
      clarity: clampScore(scores.clarity),
      specificity: clampScore(scores.specificity),
      voice: clampScore(scores.voice),
      ai_like: clampScore(scores.ai_like),
    },
  };
}

// 检查版本对比结果是否可用
export function isUsableCompareRevision(raw: unknown): boolean {
  if (!raw || typeof raw !== "object") return false;
  const r = raw as Record<string, unknown>;
  return asString(r.summary).trim().length > 0;
}

// 清洗版本对比反馈
export function sanitizeCompareRevisionFeedback(raw: unknown): CompareRevisionFeedback {
  const r = (raw ?? {}) as Record<string, unknown>;
  return {
    improved: typeof r.improved === "boolean" ? r.improved : true,
    summary: asString(r.summary),
    what_improved: asStringArray(r.what_improved),
    what_got_worse: asStringArray(r.what_got_worse),
    specificity_change: asString(r.specificity_change),
    voice_change: asString(r.voice_change),
    ai_like_change: asString(r.ai_like_change),
    next_revision_task: asString(r.next_revision_task),
  };
}
