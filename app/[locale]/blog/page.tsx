// ====================================================================
// Blog 索引页（公开，无需登录）
// ====================================================================
// 列出全部文章（按日期倒序），数据来自 lib/blog/posts.ts 注册表。
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale, getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { BLOG_POSTS } from "@/lib/blog/posts";
import { PublicHeader } from "@/components/layout/PublicHeader";

// 动态 SEO 元数据（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const t = await getTranslations("blog");

  return {
    title: t("title"),
    description: t("metaDesc"),
    alternates: {
      canonical: locale === "zh" ? "/zh/blog" : "/blog",
      languages: {
        en: "/blog",
        zh: "/zh/blog",
        "x-default": "/blog",
      },
    },
  };
}

export default async function BlogIndexPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("blog");
  const lang = locale === "zh" ? "zh" : "en";

  return (
    <>
      <PublicHeader />
      <main className="mx-auto max-w-3xl px-6 py-16">
        <h1 className="mb-2 text-4xl font-bold tracking-tight">
          {t("heading")}
        </h1>
      <p className="mb-12 text-muted-foreground leading-7">{t("desc")}</p>

      <div className="space-y-8">
        {BLOG_POSTS.map((post) => (
          <article key={post.slug} className="border-b border-border pb-8">
            <p className="text-sm text-muted-foreground mb-2">{post.date}</p>
            <h2 className="text-2xl font-semibold tracking-tight mb-2">
              <Link
                href={`/blog/${post.slug}`}
                className="hover:text-primary"
              >
                {post.titles[lang]}
              </Link>
            </h2>
            <p className="text-muted-foreground leading-7 mb-3">
              {post.descriptions[lang]}
            </p>
            <Link
              href={`/blog/${post.slug}`}
              className="text-sm font-medium text-primary hover:underline"
            >
              {t("readMore")} →
            </Link>
          </article>
        ))}
      </div>
    </main>
    </>
  );
}
