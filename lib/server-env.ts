// ====================================================================
// 服务端环境变量读取工具
// ====================================================================
// Cloudflare Workers 里环境变量要通过 getCloudflareContext().env 读，
// 本地开发（next dev）则走 process.env（.env 文件）。
// 这里统一封装，调用方不用关心运行环境。
// ====================================================================

import { getCloudflareContext } from "@opennextjs/cloudflare";

export function getServerEnv(name: string): string | undefined {
  // 优先读 Cloudflare 绑定/变量（生产环境）
  try {
    const { env } = getCloudflareContext();
    const value = (env as unknown as Record<string, unknown>)[name];
    if (typeof value === "string" && value) return value;
  } catch {
    // 非 Cloudflare 上下文（如构建期），落到 process.env
  }
  const value = process.env[name];
  return value && value.length > 0 ? value : undefined;
}
