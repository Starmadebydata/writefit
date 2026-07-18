// ====================================================================
// 训练调度器
// ====================================================================
// 负责为用户生成今日训练任务
// MVP 阶段使用简单的按星期轮换策略
//
// 选题策略：
// - 传了 seed（用户 ID）时用确定性选题 —— 同一用户同一天始终是同一道题
// - 不传 seed（开发演示）时随机选题
// ====================================================================

import {
  getPracticeTypeByDate,
  getRandomPrompt,
  getDailyPrompt,
  type PracticeType,
} from "./prompts";

// 今日训练任务结构
export interface TodayPractice {
  practiceType: PracticeType;
  prompt: string;
  estimatedMinutes: number;
}

// 生成今日训练任务
export function generateTodayPractice(
  dailyMinutes: number = 10,
  language: "zh" | "en" = "en",
  seed?: string
): TodayPractice {
  const today = new Date();
  const practiceType = getPracticeTypeByDate(today);
  // 用 UTC 日期作为 seed 的一部分，保证同一天内选题稳定
  const dateKey = today.toISOString().split("T")[0];
  const prompt = seed
    ? getDailyPrompt(practiceType, language, `${seed}:${dateKey}`)
    : getRandomPrompt(practiceType, language);

  return {
    practiceType,
    prompt,
    estimatedMinutes: dailyMinutes,
  };
}

// 获取明天的训练类型（用于完成页预告，管理用户预期）
export function getTomorrowPracticeType(): PracticeType {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return getPracticeTypeByDate(tomorrow);
}
