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

  // 关闭自动语言探测（默认开启，会根据 NEXT_LOCALE cookie 和
  // 浏览器 Accept-Language 把 / 重定向到 /zh，导致默认语言形同虚设）
  // 关闭后：/ 永远是英文，中文用户通过语言切换器访问 /zh
  localeDetection: false,
});
