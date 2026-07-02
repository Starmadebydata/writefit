// ====================================================================
// 数据库连接工具
// ====================================================================
// 这个文件负责创建和数据库的连接
// 在 Cloudflare 上运行时，通过 getCloudflareContext() 获取 D1 数据库绑定
// 在本地开发时，通过 wrangler 的本地 D1 模拟环境运行
// ====================================================================

import { drizzle } from "drizzle-orm/d1";
import { getCloudflareContext } from "@opennextjs/cloudflare";
import * as schema from "./schema";

// 获取数据库连接实例
// 每次调用时从 Cloudflare 运行时获取 D1 绑定，然后创建 Drizzle 实例
export async function getDb() {
  const { env } = getCloudflareContext();
  const db = drizzle(env.DB, { schema });
  return db;
}

// 导出数据库 schema 中的所有表和类型
export { schema };
