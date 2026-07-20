# GEO Audit Report: WriteFit

**Audit Date:** 2026-07-20
**URL:** https://writefit.app
**Business Type:** SaaS（AI 写作教练，双语 EN/ZH）
**Pages Analyzed:** 8（/, /zh, /pricing, /zh/pricing, /privacy, /terms, /auth/login, /auth/register）

---

## Executive Summary

**Overall GEO Score: 34/100 (Critical)**

技术底座（SSR、hreflang、协议栈）扎实，落地页文案本身有可引用性，但三大硬伤让站点对 AI 系统近乎隐形：Cloudflare 托管 robots.txt 一刀切屏蔽了 GPTBot/ClaudeBot/CCBot/Google-Extended 等主流 AI 爬虫；全网除官网外零第三方提及，AI 模型没有任何建立 "WriteFit" 实体认知的外部语料；全站 0 条结构化数据，AI 无法把站点解析为带价格、类别的结构化实体。

### Score Breakdown

| Category | Score | Weight | Weighted Score |
|---|---|---|---|
| AI Citability | 48/100 | 25% | 12.0 |
| Brand Authority | 5/100 | 20% | 1.0 |
| Content E-E-A-T | 38/100 | 20% | 7.6 |
| Technical GEO | 70/100 | 15% | 10.5 |
| Schema & Structured Data | 8/100 | 10% | 0.8 |
| Platform Optimization | 18/100 | 10% | 1.8 |
| **Overall GEO Score** | | | **34/100** |

---

## Critical Issues (Fix Immediately)

1. **Cloudflare 托管 robots.txt 屏蔽主流 AI 爬虫**（全站）：`Disallow: /` 了 GPTBot、ClaudeBot、Google-Extended、CCBot、Bytespider、Amazonbot、Applebot-Extended、meta-externalagent，且声明 `Content-Signal: ai-train=no`。CCBot（Common Crawl）是多数模型的训练语料来源，断它 = 长期"模型内知识"为零。注意检索型爬虫（PerplexityBot、OAI-SearchBot、ChatGPT-User）未被误伤，属不幸中的万幸。**修复**：Cloudflare 控制台关闭 Block AI Bots，或新增 `app/robots.ts` 在应用层接管 robots.txt。
2. **全网零第三方足迹**：Reddit/YouTube/X/LinkedIn/Product Hunt/HN/知乎/V2EX/AI 工具目录均未发现任何提及（HN 经 Algolia API 确认 0 条，Wikidata 查询为空）。AI 模型无共现语料可建立实体认知。
3. **全站 0 条 JSON-LD 结构化数据**（8 页实测 `ld+json` = 0）：无 Organization / SoftwareApplication / WebSite / FAQPage。
4. **`sitemap.xml` 返回 HTTP 500**（路由不存在）：爬虫无法获得页面清单，GSC 会持续报警（500 比 404 更糟）。
5. **Bing 未收录**（`site:writefit.app` 零结果）：直接影响 Copilot 和 ChatGPT 联网搜索的 grounding。
6. **全站无人物/团队/公司身份**：零署名、零社会证明，AI 无法建立实体归属。法人主体"四川奇胜科技有限公司"连 Terms/Privacy 里都未出现。

## High Priority Issues

- **`llms.txt` 返回 HTTP 500**（路由不存在）——对 GEO 这是最直接的"给 AI 看的站点说明"
- **zh 页面 canonical 指向 EN 页**（`/zh` → `https://writefit.app`，`/zh/pricing` → `/pricing`），与自身 hreflang 声明矛盾：hreflang 说"两个版本平行"，canonical 却说"中文版是英文版复制品" → zh 页不会被索引，中文 AI 引擎拿不到中文内容。修复：`app/[locale]/layout.tsx` 的 `generateMetadata` 给 zh 页自引用 canonical
- **无 FAQ 区块**（首页/定价页）：Q&A 对天然适配 LLM 的 RAG 切片，是 citability 性价比最高的内容形态
- **无 About/方法论页**："声称自己是教练"和"证明自己会教写作"之间有本质差距，目前只有前者
- **定价 SSR 呈现缺陷**：卡片式无对比表，默认展示年付价，月付 $19.9/$29.9 藏在 JS toggle 后（SSR HTML 仅出现 1 次），AI 容易引错价格
- **联系方式为个人 Gmail**（aifeefee70@gmail.com），无域名邮箱，信任信号弱

## Medium Priority Issues

- H1 是口号 "15 minutes a day..."，不含 "AI writing coach" 关键词；定义句在 `<p>` 里权重低
- 无对比型内容（"WriteFit vs ChatGPT 代写"是该品类最可能被 AI 引用的问题形态）
- 全部安全响应头缺失（HSTS/CSP/X-Frame-Options/X-Content-Type-Options/Referrer-Policy）
- HTML head 的 hreflang 缺 `x-default`（HTTP Link 头有，HTML 只有 en/zh 两条）
- 核心功能区只有卡片短句，缺一段连贯的"产品是什么/解决什么"段落式陈述
- `og:image` 完全缺失，`twitter:card` 是 `summary` 而非 `summary_large_image`
- **实体撞名风险**：writefit.net 同为 AI 工具（疑似 AI 建站），writefit.com 为健身文案服务，搜索结果被 3-4 个同名/近名实体包围 —— 所有外部资料须统一用 "WriteFit (writefit.app), AI writing coach" 完整表述消歧
- 无 Changelog/博客，新鲜度信号仅靠法律页日期

## Low Priority Issues

- 无社交账号链接（schema `sameAs` 无从填起）
- `meta keywords` 已过时（无妨）
- 法律页 "Last updated: July 2026" 日期已有，但缺站点级新鲜度机制
- `/practice/dev` 演示页 `index, follow` —— 实测标题为 "Try Write Practice Online | WriteFit Demo"，是有意的 SEO 漏斗页，**不是泄漏**，建议保留并纳入 sitemap

---

## Category Deep Dives

### AI Citability (48/100)

**优势**：定位句高度可引用（"WriteFit is an AI writing coach. It doesn't write for you — it helps you practice, revise, and build your own voice over time."）；5 步流程（写→诊断→改→对比→存）是天然 how-to 结构；疑问式 H2（"Does this sound familiar?"）符合问答抽取偏好；标题层级规范；定价三档（5/20/100 次每日）SSR 可读。

**改写示例**：

1. 首页定义句升级为紧跟 H1 的独立定义块：
   > "**WriteFit 是一款 AI 写作教练（AI writing coach）**。与 ChatGPT 等代写工具不同，它不替你写任何文字，而是每天用 15 分钟带你完成「写作 → AI 诊断 → 自己修改 → 版本对比」的训练闭环，帮助你提升并保留自己的写作风格。"
2. 定价改为静态 SSR 对比表 + 自包含总结句：
   > "WriteFit 提供三档：免费版（每天 5 次 AI 反馈，自带 API key 可无限使用）、Basic 版 $19.9/月（每天 20 次反馈）、Pro 版 $29.9/月（每天 100 次反馈 + 优先支持）。"
3. 流程区 H2 改完整问句："How do you train your writing with AI instead of letting AI write for you?" + 首句直答，页尾加 FAQ 块（"WriteFit 会替我写文章吗？""和直接用 ChatGPT 润色有什么区别？""免费版够用吗？"）配 FAQPage JSON-LD。

### Brand Authority (5/100)

平台提及地图（全部实测）：Google 仅官网收录（2026-07-05 抓取）；Reddit/YouTube/X/LinkedIn/Product Hunt/Quora/Medium/知乎/V2EX/少数派/TAAFT/Futurepedia/Toolify 全部零提及；HN Algolia API 0 条；Wikidata 无实体；Bing 零收录。

**正确建权威顺序**（不要跳步）：先积累 3-5 个第三方来源（PH 发布、AI 目录收录、媒体报道）→ 再建 Wikidata 条目 → Wikipedia 留到有媒体覆盖之后（新品牌不满足 notability，创建会被秒删且留负面记录）。

### Content E-E-A-T (38/100)

**已具备**：隐私政策有实质内容（BYOK key 只存 localStorage、数据明细、导出删除权）；条款有实质（内容所有权归用户、退款条款、责任上限）；定价透明有诚意信号；`/practice/dev` 免登录体验是少有的"可验证体验"信号；双语文案对等非机翻腔。

**缺失**：About 页、人物署名、公司身份、社会证明、示例反馈报告、方法论阐释、博客/更新、社交链接。

**三件套最短路径**（38 → 60+）：① About 页（创始人故事 + 为什么做"AI 不代写"的反向定位 + 写作资历 + 公司法定名称）；② 方法论页（把 5 步闭环命名为正式方法如 "The WriteFit Loop"，展开诊断 4 维度 clarity/specificity/personal voice/AI-like tone 的判定标准，援引刻意练习等学习科学）；③ 2-3 个真实"原稿→AI 诊断→修改稿"完整样例 —— 写作能力的产品，示例即资历。

### Technical GEO (70/100)

**做得好**：完整 SSR 无 JS 依赖（首包即含全部主内容，102KB→18.4KB Brotli）；TLS 1.3 + HTTP/2 + HTTP/3 通告；hreflang 双通道（HTTP Link 头 + HTML head）格式规范；404 行为正确；检索型 AI 爬虫未被误伤；`/` 响应 0.70s。

**待修**（见 Critical/High）：sitemap 500、llms.txt 500、zh canonical 冲突、AI 爬虫策略、安全头缺失。修完前三项评分可至 85+。

### Schema & Structured Data (8/100)

现状：0 个 JSON-LD；OG 基础标签齐全但无 `og:image`；`twitter:card=summary`；`/pricing` 的 OG 继承 layout 通用文案。

**推荐 schema 栈**（`@id` 互链合并为同一实体图，`applicationCategory` 选 `EducationalApplication` —— coach/trainer 模式属学习类产品）：

```json
{
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": "https://writefit.app/#organization",
  "name": "WriteFit",
  "url": "https://writefit.app",
  "logo": "https://writefit.app/logo.png",
  "description": "AI writing coach that trains your writing ability instead of replacing it",
  "sameAs": []
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": "https://writefit.app/#website",
  "name": "WriteFit",
  "url": "https://writefit.app",
  "publisher": { "@id": "https://writefit.app/#organization" },
  "inLanguage": ["en", "zh"]
}
```

```json
{
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": "https://writefit.app/#app",
  "name": "WriteFit",
  "url": "https://writefit.app",
  "description": "AI writing coach that trains your writing ability instead of replacing it",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "Web",
  "inLanguage": ["en", "zh"],
  "provider": { "@id": "https://writefit.app/#organization" },
  "offers": [
    { "@type": "Offer", "name": "Free", "price": "0", "priceCurrency": "USD", "description": "5 AI coaching sessions per day" },
    { "@type": "Offer", "name": "Basic", "priceSpecification": [
      { "@type": "UnitPriceSpecification", "price": "19.90", "priceCurrency": "USD", "unitText": "MONTH" },
      { "@type": "UnitPriceSpecification", "price": "199.00", "priceCurrency": "USD", "unitText": "YEAR" } ] },
    { "@type": "Offer", "name": "Pro", "priceSpecification": [
      { "@type": "UnitPriceSpecification", "price": "29.90", "priceCurrency": "USD", "unitText": "MONTH" },
      { "@type": "UnitPriceSpecification", "price": "299.00", "priceCurrency": "USD", "unitText": "YEAR" } ] }
  ]
}
```

注意：`public/` 下目前无 `logo.png`（只有 svg），需先产出；`sameAs` 待有真实社交账号后填入；`WebSite` **不加 SearchAction**（站内无公开搜索，Google 已于 2024.10 弃用 sitelinks searchbox）；`aggregateRating` 绝不虚构。实现：抽 `lib/jsonld.ts` 单一数据源，Organization+WebSite 放 layout，SoftwareApplication 放首页/pricing，上线前过 Google Rich Results Test。

### Platform Optimization (18/100)

**优先级行动**：① Cloudflare 放开 AI 爬虫（当天，零成本收益最大）；② Bing Webmaster Tools 提交 + IndexNow（第 1 周）；③ 注册 X/LinkedIn/YouTube/Reddit 回填 schema sameAs（第 1-2 周）；④ Product Hunt 正式发布 + AI 目录提交（第 2-4 周，PH 页面被 Perplexity/ChatGPT 高频引用）；⑤ Reddit r/writing 真实练习心得 + YouTube 演示短视频（持续，Perplexity 引用权重最高的两个来源）；⑥ 中文侧：V2EX 独立开发贴、少数派、知乎"如何练习写作"回答（服务 Gemini/豆包/文心中文语料）。

---

## Quick Wins (Implement This Week)

1. **Cloudflare 控制台关闭 Block AI Bots**（或加 `app/robots.ts` 接管）—— 零代码、当天、收益最大
2. **新增 `app/sitemap.ts`**（8+ URL 含 zh 变体与 hreflang 注解）+ **`app/robots.ts`** —— 修掉 sitemap 500，顺带解决 GSC 提交 sitemap 的需求
3. **修 zh canonical 自引用**（`app/[locale]/layout.tsx` 一行 metadata 改动）—— 释放中文内容被索引/引用的可能
4. **首页 + pricing 注入 Organization/WebSite/SoftwareApplication JSON-LD**（`lib/jsonld.ts`，上方代码可直接用）
5. **首页加 FAQ 区块 + FAQPage schema**（中英各 3-5 条：会替我写吗 / 和 ChatGPT 润色的区别 / 免费版够用吗 / BYOK 是什么 / 能取消吗）
6. **新增 `public/llms.txt` 或 `app/llms.txt/route.ts`** —— 产品定位 + 关键页面 Markdown 链接
7. **Bing Webmaster Tools 提交站点 + 开 IndexNow**

## 30-Day Action Plan

### Week 1: 技术止血（预期 34 → 55+）
- [ ] 关闭 Cloudflare Block AI Bots / `app/robots.ts` 精细放行（GPTBot、ClaudeBot、Google-Extended、CCBot、PerplexityBot）
- [ ] `app/sitemap.ts` + `app/robots.ts`，GSC/Bing 各提交一次
- [ ] zh canonical 自引用 + hreflang 补 x-default
- [ ] JSON-LD 三件套（Organization/WebSite/SoftwareApplication）+ `og:image` 1200×630 + `twitter:card=summary_large_image`
- [ ] `llms.txt` 上线

### Week 2: 内容与 E-E-A-T 地基
- [ ] About 页（创始人故事 + 公司法定名称 + 联系方式，页脚加入口）
- [ ] 方法论页（命名训练闭环，展开 4 维度诊断标准 + 学习科学依据）
- [ ] 首页 FAQ 区块（中英）+ FAQPage schema
- [ ] 定价页静态 SSR 对比表（月付价进首包 HTML）
- [ ] Terms/Privacy 署名法人实体 + 注册 support@writefit.app 域名邮箱

### Week 3: 第三方足迹启动
- [ ] 注册 X / LinkedIn 公司页 / YouTube / Reddit，回填 schema sameAs
- [ ] Product Hunt 发布筹备（素材、首评、发布时间）
- [ ] 提交 TAAFT / Futurepedia / Toolify / aitools.fyi 等 AI 目录
- [ ] 2-3 个真实"原稿→诊断→修改稿"样例上首页

### Week 4: 放大与验证
- [ ] Product Hunt 正式发布
- [ ] Reddit r/writing 真实心得帖（非广告）+ 首条 YouTube 演示短视频
- [ ] 中文侧：V2EX / 少数派 / 知乎各一篇
- [ ] 复测：用 ChatGPT/Perplexity/Gemini 实际提问 "WriteFit 是什么""AI writing coach 推荐"，记录引用情况，做 GEO 对比基线

---

## Appendix: Pages Analyzed

| URL | Title | GEO Issues |
|---|---|---|
| / | WriteFit \| Start Your Daily Write Practice with an AI Coach | 无 schema、无 FAQ、H1 无关键词、无社会证明 |
| /zh | WriteFit \| AI 写作教练 - 每日写作训练 | 同上 + canonical 指向 EN 页 |
| /pricing | Pricing \| WriteFit | 无 schema、月付价不在首包、无对比表、无 FAQ |
| /zh/pricing | 定价 \| WriteFit | 同上 + canonical 指向 EN 页 |
| /privacy | Privacy Policy \| WriteFit | 内容良好；缺公司实体署名、Gmail 联系方式 |
| /terms | Terms of Service \| WriteFit | 内容良好；缺公司实体署名 |
| /auth/login | Login \| WriteFit | 正常（无需 GEO 优化） |
| /auth/register | Sign Up \| WriteFit | 正常（无需 GEO 优化） |

**抓取失败记录**：`/sitemap.xml`（HTTP 500）、`/llms.txt`（HTTP 500）—— 路由不存在，见 Critical Issues。
**补充观察**：`/practice/dev` 演示页是现成的 GEO 资产（SSR、独立标题、"no login required" 漏斗），建议纳入 sitemap。
