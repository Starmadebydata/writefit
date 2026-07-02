// ====================================================================
// next-intl 路由配置
// ====================================================================
// 定义支持的语言列表和默认语言
// localePrefix: 'as-needed' 表示默认语言不带前缀（/dashboard），
// 非默认语言带前缀（/zh/dashboard）
// ====================================================================

import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 支持的语言列表
  locales: ["en", "zh"],

  // 默认语言（英文优先，面向英语写作用户）
  defaultLocale: "en",

  // 默认语言不带前缀，其他语言带前缀
  // /dashboard = 英文，/zh/dashboard = 中文
  localePrefix: "as-needed",
});
