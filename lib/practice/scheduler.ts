// ====================================================================
// 训练调度器
// ====================================================================
// 负责为用户生成今日训练任务
// MVP 阶段使用简单的按星期轮换策略
// ====================================================================

import {
  getPracticeTypeByDate,
  getRandomPrompt,
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
  language: "zh" | "en" = "zh"
): TodayPractice {
  const today = new Date();
  const practiceType = getPracticeTypeByDate(today);
  const prompt = getRandomPrompt(practiceType, language);

  return {
    practiceType,
    prompt,
    estimatedMinutes: dailyMinutes,
  };
}
