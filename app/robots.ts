// ====================================================================
// robots.txt 生成（应用层接管）
// ====================================================================
// 背景：站点默认被 Cloudflare 托管 robots.txt 接管，屏蔽了 GPTBot /
// ClaudeBot / CCBot / Google-Extended 等 AI 爬虫。本文件让 origin
// 自己输出 robots.txt，放行所有爬虫（含 AI 训练爬虫）。
//
// 注意：若部署后 Cloudflare 仍覆盖此文件，需在 Cloudflare Dashboard
// 关闭 AI Crawl Control / Block AI Bots 相关开关。
// ====================================================================

import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // 仅屏蔽 API 路由；需登录的页面由 auth 重定向处理，无需在此屏蔽
      disallow: ["/api/"],
    },
    sitemap: "https://writefit.app/sitemap.xml",
  };
}
