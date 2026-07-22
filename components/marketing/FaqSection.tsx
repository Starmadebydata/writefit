// ====================================================================
// FAQ 区块（营销页共享）
// ====================================================================
// 可见问答与 FAQPage JSON-LD 同源（同一份 items），保证 schema 内容
// 与页面文字一致，供搜索引擎/AI 抽取。首页与 SEO 落地页共用。
// ====================================================================

export interface FaqItem {
  q: string;
  a: string;
}

interface FaqSectionProps {
  title: string;
  items: FaqItem[];
}

export function FaqSection({ title, items }: FaqSectionProps) {
  const faqJsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };

  return (
    <section className="mx-auto max-w-3xl px-6 py-20">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      <h2 className="text-3xl font-bold text-center mb-10">{title}</h2>
      <div className="space-y-6">
        {items.map((item, i) => (
          <div key={i} className="rounded-lg border border-border bg-card p-5">
            <h3 className="font-semibold mb-2">{item.q}</h3>
            <p className="text-sm text-muted-foreground leading-7">{item.a}</p>
          </div>
        ))}
      </div>
    </section>
  );
}
