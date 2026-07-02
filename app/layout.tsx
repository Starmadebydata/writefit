import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// 网站的 SEO 元数据
// 主关键词：write practice / writing practice / AI writing coach
// 基于 Ahrefs 数据分析：write practice 月搜索量 80（美国），关键词难度 1（Easy），是核心目标词
export const metadata: Metadata = {
  title: "WriteFit | AI Writing Coach for Daily Writing Practice",
  description:
    "WriteFit is an AI writing coach that helps you practice, revise, and build your own writing voice. Start a daily write practice and improve with AI feedback.",
  keywords: [
    "write practice",
    "writing practice",
    "writing exercises",
    "practice writing",
    "AI writing coach",
    "daily writing practice",
    "improve writing",
    "writing training",
    "anti AI writing",
  ],
  authors: [{ name: "WriteFit" }],
  creator: "WriteFit",
  metadataBase: new URL("https://writefit.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://writefit.app",
    siteName: "WriteFit",
    title: "WriteFit | AI Writing Coach for Daily Writing Practice",
    description:
      "WriteFit is an AI writing coach that helps you practice, revise, and build your own writing voice.",
  },
  twitter: {
    card: "summary_large_image",
    title: "WriteFit | AI Writing Coach for Daily Writing Practice",
    description:
      "WriteFit is an AI writing coach that helps you practice, revise, and build your own writing voice.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        {/* 全局消息提示组件 */}
        <Toaster />
      </body>
    </html>
  );
}
