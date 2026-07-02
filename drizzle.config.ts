// ====================================================================
// Drizzle Kit 配置文件
// ====================================================================
// 这个文件告诉 Drizzle Kit 怎么生成数据库迁移文件
// 本地开发时用 SQLite（和 Cloudflare D1 兼容）
// ====================================================================

import { defineConfig } from "drizzle-kit";

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle/migrations",
  dialect: "sqlite",
  // 本地开发用 better-sqlite3 驱动
  // 部署到 Cloudflare 时用 wrangler d1 migrations apply 命令
  dbCredentials: {
    url: "./local.db",
  },
  verbose: true,
  strict: true,
});
