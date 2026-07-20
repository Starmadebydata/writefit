// ====================================================================
// RSS feed（/feed.xml）
// ====================================================================
// 输出 BLOG_POSTS 的标题/摘要/链接/日期（英文版为准）。
// ====================================================================

import { BLOG_POSTS } from "@/lib/blog/posts";
import { SITE_URL } from "@/lib/jsonld";

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function GET() {
  const items = BLOG_POSTS.map(
    (post) => `    <item>
      <title>${escapeXml(post.titles.en)}</title>
      <link>${SITE_URL}/blog/${post.slug}</link>
      <guid isPermaLink="true">${SITE_URL}/blog/${post.slug}</guid>
      <description>${escapeXml(post.descriptions.en)}</description>
      <pubDate>${new Date(`${post.date}T00:00:00Z`).toUTCString()}</pubDate>
    </item>`
  ).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>WriteFit Blog</title>
    <link>${SITE_URL}/blog</link>
    <description>Essays on writing craft, personal voice, and training your writing with AI.</description>
    <language>en</language>
${items}
  </channel>
</rss>
`;

  return new Response(xml, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
