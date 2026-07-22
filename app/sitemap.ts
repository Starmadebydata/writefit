// ====================================================================
// sitemap.xml 生成
// ====================================================================
// 仅收录公开且可索引的页面（auth/login、auth/register 已 noindex，
// 不收录；需登录的应用页不收录）。
// 每个 URL 带 hreflang 注解：en（无前缀）↔ zh（/zh 前缀）。
// ====================================================================

import type { MetadataRoute } from "next";
import { BLOG_POSTS } from "@/lib/blog/posts";

const BASE = "https://writefit.app";

// path 为英文版路径（无 locale 前缀），zh 版自动加 /zh 前缀
const PUBLIC_PAGES: Array<{ path: string; priority: number }> = [
  { path: "", priority: 1 },
  { path: "/pricing", priority: 0.8 },
  { path: "/practice/dev", priority: 0.8 },
  { path: "/ai-writing-training", priority: 0.8 },
  { path: "/blog", priority: 0.7 },
  { path: "/about", priority: 0.6 },
  { path: "/methodology", priority: 0.6 },
  { path: "/privacy", priority: 0.3 },
  { path: "/terms", priority: 0.3 },
];

export default function sitemap(): MetadataRoute.Sitemap {
  const pages = [
    ...PUBLIC_PAGES,
    // Blog 文章页（注册表驱动，新文章自动收录）
    ...BLOG_POSTS.map((post) => ({
      path: `/blog/${post.slug}`,
      priority: 0.6,
      lastModified: new Date(`${post.date}T00:00:00Z`),
    })),
  ];

  return pages.map(({ path, priority, ...rest }) => ({
    url: `${BASE}${path || "/"}`,
    changeFrequency: "weekly",
    priority,
    ...rest,
    alternates: {
      languages: {
        en: `${BASE}${path || "/"}`,
        zh: `${BASE}/zh${path}`,
      },
    },
  }));
}
