#!/usr/bin/env node
// ====================================================================
// IndexNow URL 提交脚本（Bing / Yandex / Naver / Seznam 共享协议）
// ====================================================================
// 用法：node scripts/indexnow-submit.mjs [url1 url2 ...]
//   无参数：抓取 sitemap.xml，提交全部 URL
//   有参数：只提交指定 URL（内容变更后使用）
//
// 协议：https://www.indexnow.org/documentation
// key 文件：public/c243ea861cde8aadfaed7856ebb45fc9.txt（须可公开访问）
// ====================================================================

const HOST = "writefit.app";
const KEY = "c243ea861cde8aadfaed7856ebb45fc9";
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;
const ENDPOINT = "https://api.indexnow.org/indexnow";

async function getSitemapUrls() {
  const res = await fetch(`https://${HOST}/sitemap.xml`);
  if (!res.ok) throw new Error(`sitemap fetch failed: ${res.status}`);
  const xml = await res.text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  // sitemap 里 en/zh 是同一 <url> 的 hreflang 注解，loc 只有 en 版；补上 zh 版
  const zhUrls = [
    ...xml.matchAll(/hreflang="zh" href="([^"]+)"/g),
  ].map((m) => m[1]);
  return [...new Set([...urls, ...zhUrls])];
}

async function main() {
  const urls = process.argv.length > 2 ? process.argv.slice(2) : await getSitemapUrls();
  console.log(`Submitting ${urls.length} URLs to IndexNow...`);

  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls,
    }),
  });

  // 200 = 已接收；202 = 已接收待验证 key；4xx 见协议文档
  console.log(`IndexNow response: ${res.status} ${res.statusText}`);
  urls.forEach((u) => console.log(`  ${u}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
