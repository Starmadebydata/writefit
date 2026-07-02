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
export function scoreLabel(score: number, isReverse = false): string {
  if (isReverse) {
    // ai_like_score 反向解释：分数越低越好
    if (score <= 20) return "人话，具体";
    if (score <= 40) return "略泛";
    if (score <= 60) return "明显模板化";
    if (score <= 80) return "AI 腔重";
    return "非常像 AI";
  }
  if (score <= 20) return "很弱";
  if (score <= 40) return "较弱";
  if (score <= 60) return "一般";
  if (score <= 80) return "不错";
  return "优秀";
}
