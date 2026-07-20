// ====================================================================
// Blog 文章页（公开，无需登录，SSG）
// ====================================================================
// 路由 /blog/<slug>，按 locale 渲染对应语言的文章组件。
// 元数据/JSON-LD 均来自文章的 meta 导出（单一数据源）。
// ====================================================================

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { BLOG_POSTS, getPost } from "@/lib/blog/posts";
import { BLOG_CONTENT } from "@/content/blog";
import { articleJsonLd } from "@/lib/jsonld";
import { PublicHeader } from "@/components/layout/PublicHeader";

// 为全部文章 × 全部语言生成静态页面
export function generateStaticParams() {
  return BLOG_POSTS.flatMap((post) =>
    routing.locales.map((locale) => ({ locale, slug: post.slug }))
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const post = getPost(slug);
  if (!post) return {};

  const lang = locale === "zh" ? "zh" : "en";
  const canonical =
    locale === "zh" ? `/zh/blog/${slug}` : `/blog/${slug}`;

  return {
    title: `${post.titles[lang]} | WriteFit Blog`,
    description: post.descriptions[lang],
    alternates: {
      canonical,
      languages: {
        en: `/blog/${slug}`,
        zh: `/zh/blog/${slug}`,
        "x-default": `/blog/${slug}`,
      },
    },
    openGraph: {
      type: "article",
      title: post.titles[lang],
      description: post.descriptions[lang],
      publishedTime: post.date,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPost(slug);
  const content = BLOG_CONTENT[slug];
  if (!post || !content) notFound();

  setRequestLocale(locale);
  const t = await getTranslations("blog");

  const Content = locale === "zh" ? content.PostZh : content.PostEn;

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd(post, locale)),
        }}
      />

      <Link
        href="/blog"
        className="text-sm text-muted-foreground hover:text-foreground"
      >
        ← {t("backToBlog")}
      </Link>

      <header className="mt-6 mb-10">
        <h1 className="mb-3 text-4xl font-bold tracking-tight">
          {post.titles[locale === "zh" ? "zh" : "en"]}
        </h1>
        <p className="text-sm text-muted-foreground">
          {post.date} · {t("byAuthor")}
        </p>
      </header>

      <div className="prose-wf">
        <Content />
      </div>
    </main>
    </>
  );
}
