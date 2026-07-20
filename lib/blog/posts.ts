// ====================================================================
// Blog 元数据注册表（索引页、sitemap、RSS 共用）
// ====================================================================
// meta 聚合自 content/blog/ 下各文章的 meta 导出，按日期倒序。
// ====================================================================

import type { BlogPostMeta } from "@/lib/jsonld";
import { meta as aiVoiceAnatomy } from "../../content/blog/ai-voice-anatomy";
import { meta as whyWriteInAiAge } from "../../content/blog/why-write-in-ai-age";
import { meta as fifteenMinuteWorkout } from "../../content/blog/15-minute-writing-workout";

export type { BlogPostMeta };

// 全部文章（新文章加到此数组即可），始终按日期倒序
export const BLOG_POSTS: BlogPostMeta[] = [
  aiVoiceAnatomy,
  whyWriteInAiAge,
  fifteenMinuteWorkout,
].sort((a, b) => b.date.localeCompare(a.date));

export function getPost(slug: string): BlogPostMeta | undefined {
  return BLOG_POSTS.find((p) => p.slug === slug);
}
