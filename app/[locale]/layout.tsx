// ====================================================================
// 语言布局（包含 html/body 和 i18n Provider）
// ====================================================================
// 每个语言版本都有自己的 html lang 属性
// NextIntlClientProvider 让所有组件都能使用 useTranslations
// ====================================================================

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { Toaster } from "@/components/ui/sonner";
import { PostHogProvider } from "@/components/analytics/PostHogProvider";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { organizationJsonLd, websiteJsonLd } from "@/lib/jsonld";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 为每个语言生成静态页面
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

// 动态 SEO 元数据（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "WriteFit | AI Writing Coach for Daily Writing Practice",
    zh: "WriteFit | AI 写作教练 - 每日写作训练",
  };

  const descriptions = {
    en: "WriteFit is an AI writing coach that helps you practice, revise, and build your own writing voice. Start a daily write practice and improve with AI feedback.",
    zh: "WriteFit 是一个 AI 写作教练，帮助你练习、修改、建立自己的写作声音。每天 15 分钟，通过 AI 反馈提升写作能力。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    metadataBase: new URL("https://writefit.app"),
    alternates: {
      // 各语言页 canonical 自引用（否则 zh 页会被当作 en 页的复制品不予索引）
      canonical: locale === "zh" ? "/zh" : "/",
      languages: {
        en: "/",
        zh: "/zh",
        "x-default": "/",
      },
    },
    openGraph: {
      type: "website",
      locale: locale === "zh" ? "zh_CN" : "en_US",
      url: "https://writefit.app",
      siteName: "WriteFit",
      title: titles[locale as "en" | "zh"],
      description: descriptions[locale as "en" | "zh"],
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: "WriteFit — AI Writing Coach",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: titles[locale as "en" | "zh"],
      description: descriptions[locale as "en" | "zh"],
      images: ["/og-image.png"],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  // 验证 locale 是否在支持列表中
  if (!routing.locales.includes(locale as "en" | "zh")) {
    notFound();
  }

  // 启用静态渲染
  setRequestLocale(locale);

  // 获取翻译消息
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* JSON-LD 结构化数据：Organization + WebSite（全站实体锚点） */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
        <NextIntlClientProvider messages={messages}>
          <PostHogProvider>{children}</PostHogProvider>
          <Toaster />
        </NextIntlClientProvider>
        <GoogleAnalytics />
      </body>
    </html>
  );
}
