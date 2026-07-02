// ====================================================================
// 通用工具函数
// ====================================================================

import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

// shadcn/ui 需要的 className 合并工具
// 把多个 Tailwind 类名合并，并自动处理冲突
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// 计算中文字数（中文字符按 1 个字算，英文单词按 1 个字算）
export function countWords(text: string): number {
  if (!text) return 0;
  // 中文字符数
  const chineseChars = (text.match(/[\u4e00-\u9fa5]/g) || []).length;
  // 英文单词数（去掉中文字符后按空格分词）
  const textWithoutChinese = text.replace(/[\u4e00-\u9fa5]/g, " ");
  const englishWords = textWithoutChinese
    .trim()
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  return chineseChars + englishWords;
}

// 格式化日期为 YYYY-MM-DD
export function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

// 获取本周一到今天的日期范围
export function getThisWeekRange(): { start: Date; end: Date } {
  const now = new Date();
  const dayOfWeek = now.getDay() || 7; // 周日转为 7
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayOfWeek + 1);
  monday.setHours(0, 0, 0, 0);
  return { start: monday, end: now };
}

// 计算连续训练天数
// 传入训练日期数组（按日期排序，从最近到最远）
export function calculateStreak(practiceDates: Date[]): number {
  if (practiceDates.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = today;

  for (const practiceDate of practiceDates) {
    const d = new Date(practiceDate);
    d.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (currentDate.getTime() - d.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays === 0) {
      // 当天有训练
      streak++;
      currentDate = new Date(d);
      currentDate.setDate(currentDate.getDate() - 1);
    } else if (diffDays === 1 && streak > 0) {
      // 昨天有训练，继续连续
      streak++;
      currentDate = new Date(d);
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // 中断了
      break;
    }
  }

  return streak;
}
