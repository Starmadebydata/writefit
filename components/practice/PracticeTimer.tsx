"use client";

// ====================================================================
// 计时器组件
// ====================================================================
// 在写作阶段显示倒计时，时间到了自动提醒
// 就像考试时的计时钟
// ====================================================================

import { useEffect, useState, useCallback, useRef } from "react";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

interface PracticeTimerProps {
  // 总时长（分钟）
  minutes: number;
  // 时间到了的回调
  onTimeUp?: () => void;
  // 是否正在运行
  isRunning: boolean;
}

export function PracticeTimer({ minutes, onTimeUp, isRunning }: PracticeTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(minutes * 60);

  // 总时长变化时在渲染期间重置倒计时（React 推荐的 derived-state 重置模式）
  const [prevMinutes, setPrevMinutes] = useState(minutes);
  if (prevMinutes !== minutes) {
    setPrevMinutes(minutes);
    setSecondsLeft(minutes * 60);
  }

  // 用 ref 持有最新的 onTimeUp 回调。
  // 否则父组件每次渲染（用户每敲一个字）都会传入新函数引用，
  // 导致下面的 effect 反复重建 interval —— 打字越投入，计时器停得越死。
  const onTimeUpRef = useRef(onTimeUp);
  useEffect(() => {
    onTimeUpRef.current = onTimeUp;
  }, [onTimeUp]);

  // 倒计时逻辑
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          onTimeUpRef.current?.();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning]);

  // 格式化时间为 MM:SS
  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  }, []);

  // 计算进度百分比
  const totalSeconds = minutes * 60;
  const progress = ((totalSeconds - secondsLeft) / totalSeconds) * 100;
  const isUrgent = secondsLeft <= 60; // 最后 1 分钟变红

  return (
    <div className="flex items-center gap-3">
      <div
        className={cn(
          "flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-lg font-semibold tabular-nums",
          isUrgent
            ? "bg-destructive/10 text-destructive"
            : "bg-muted text-foreground"
        )}
      >
        <Clock className="h-4 w-4" />
        {formatTime(secondsLeft)}
      </div>

      {/* 进度条 */}
      <div className="hidden sm:block flex-1 max-w-32 h-2 rounded-full bg-muted overflow-hidden">
        <div
          className={cn(
            "h-full transition-all duration-1000 ease-linear",
            isUrgent ? "bg-destructive" : "bg-primary"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  );
}
