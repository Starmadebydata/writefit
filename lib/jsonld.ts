// ====================================================================
// JSON-LD 结构化数据（schema.org）
// ====================================================================
// 单一数据源：全站的结构化数据都从这里取。
// 通过 @id 互链（Organization ↔ WebSite ↔ SoftwareApplication），
// 让 AI 系统/搜索引擎把三个块解析为同一实体图。
//
// 使用方式：在 server component 的 JSX 里注入
//   <script type="application/ld+json"
//     dangerouslySetInnerHTML={{ __html: JSON.stringify(xxxJsonLd) }} />
// ====================================================================

export const SITE_URL = "https://writefit.app";

export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/#organization`,
  name: "WriteFit",
  url: SITE_URL,
  logo: `${SITE_URL}/logo.png`,
  description:
    "AI writing coach that trains your writing ability instead of replacing it",
  founder: {
    "@type": "Person",
    name: "Jason Guo",
  },
  // 待有真实社交账号后填入：https://x.com/... 等
  sameAs: [],
};

export const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_URL}/#website`,
  name: "WriteFit",
  url: SITE_URL,
  publisher: { "@id": `${SITE_URL}/#organization` },
  inLanguage: ["en", "zh"],
};

export const softwareApplicationJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": `${SITE_URL}/#app`,
  name: "WriteFit",
  url: SITE_URL,
  description:
    "AI writing coach that trains your writing ability instead of replacing it",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web",
  inLanguage: ["en", "zh"],
  provider: { "@id": `${SITE_URL}/#organization` },
  offers: [
    {
      "@type": "Offer",
      name: "Free",
      price: "0",
      priceCurrency: "USD",
      description: "5 AI coaching sessions per day",
    },
    {
      "@type": "Offer",
      name: "Basic",
      description:
        "20 AI coaching sessions per day, unlimited with your own API key (BYOK)",
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: "19.90",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
        {
          "@type": "UnitPriceSpecification",
          price: "199.00",
          priceCurrency: "USD",
          unitText: "YEAR",
        },
      ],
    },
    {
      "@type": "Offer",
      name: "Pro",
      description:
        "100 AI coaching sessions per day, unlimited with your own API key (BYOK), priority support",
      priceSpecification: [
        {
          "@type": "UnitPriceSpecification",
          price: "29.90",
          priceCurrency: "USD",
          unitText: "MONTH",
        },
        {
          "@type": "UnitPriceSpecification",
          price: "299.00",
          priceCurrency: "USD",
          unitText: "YEAR",
        },
      ],
    },
  ],
};

// ====================================================================
// WebPage schema（SEO 落地页用，如 /ai-writing-training）
// ====================================================================
// 挂进全站实体图：isPartOf → WebSite，about → SoftwareApplication
export function webPageJsonLd(path: string, name: string, description: string) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}${path}#webpage`,
    url: `${SITE_URL}${path}`,
    name,
    description,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    about: { "@id": `${SITE_URL}/#app` },
  };
}

// ====================================================================
// Blog 文章 Article schema
// ====================================================================

export interface BlogPostMeta {
  slug: string;
  /** ISO 日期，如 "2026-07-20" */
  date: string;
  titles: { en: string; zh: string };
  descriptions: { en: string; zh: string };
}

export function articleJsonLd(post: BlogPostMeta, locale: string) {
  const lang = locale === "zh" ? "zh" : "en";
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "@id": `${SITE_URL}/blog/${post.slug}#article`,
    headline: post.titles[lang],
    description: post.descriptions[lang],
    datePublished: post.date,
    inLanguage: lang,
    mainEntityOfPage:
      lang === "zh"
        ? `${SITE_URL}/zh/blog/${post.slug}`
        : `${SITE_URL}/blog/${post.slug}`,
    author: { "@id": `${SITE_URL}/about#founder` },
    publisher: { "@id": `${SITE_URL}/#organization` },
  };
}
