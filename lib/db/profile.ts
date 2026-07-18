// ====================================================================
// 用户画像读取工具
// ====================================================================
// 从 profiles 表读取与 AI 反馈相关的用户配置
// 目前只有自定义禁用词，后续可扩展（反馈严格度等）
// ====================================================================

import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import { eq } from "drizzle-orm";
import { profiles } from "./schema";

// 读取用户的自定义禁用词（注入 AI 诊断/反 AI 腔 prompt 用）
// 读取失败返回空数组，不阻断主流程
export async function getUserBannedPhrases(userId: string): Promise<string[]> {
  try {
    const { env } = getCloudflareContext();
    const db = drizzle(env.DB);
    const [profile] = await db
      .select({ bannedPhrases: profiles.bannedPhrases })
      .from(profiles)
      .where(eq(profiles.userId, userId));

    const raw = profile?.bannedPhrases;
    if (!Array.isArray(raw)) return [];
    // 限长限量，防止异常数据撑爆 prompt
    return raw
      .filter((p): p is string => typeof p === "string")
      .slice(0, 50)
      .map((p) => p.slice(0, 100));
  } catch {
    return [];
  }
}
