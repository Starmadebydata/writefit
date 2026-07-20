// ====================================================================
// Blog 内容注册表
// ====================================================================
// 新文章流程：创建 content/blog/<slug>.tsx（导出 meta + PostEn + PostZh）
// → 在下方注册。索引/sitemap/RSS/schema 全部自动生效。
// ====================================================================

import type { ComponentType } from "react";
import * as aiVoiceAnatomy from "./ai-voice-anatomy";
import * as whyWriteInAiAge from "./why-write-in-ai-age";
import * as fifteenMinuteWorkout from "./15-minute-writing-workout";

export interface BlogContent {
  PostEn: ComponentType;
  PostZh: ComponentType;
}

export const BLOG_CONTENT: Record<string, BlogContent> = {
  [aiVoiceAnatomy.meta.slug]: {
    PostEn: aiVoiceAnatomy.PostEn,
    PostZh: aiVoiceAnatomy.PostZh,
  },
  [whyWriteInAiAge.meta.slug]: {
    PostEn: whyWriteInAiAge.PostEn,
    PostZh: whyWriteInAiAge.PostZh,
  },
  [fifteenMinuteWorkout.meta.slug]: {
    PostEn: fifteenMinuteWorkout.PostEn,
    PostZh: fifteenMinuteWorkout.PostZh,
  },
};
