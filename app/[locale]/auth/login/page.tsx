// ====================================================================
// 登录页面
// ====================================================================
// 用户点击"开始训练"后跳转到这个页面
// 登录方式：
// 1. Google 登录（重点推荐，放在最上方）
// 2. 邮箱 + 密码登录
// 也提供注册页面链接
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";
import { LoginForm } from "@/components/auth/LoginForm";

// 动态 SEO 元数据（根据 locale 返回对应语言的标题和描述）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Login | WriteFit",
    zh: "登录 | WriteFit",
  };

  const descriptions = {
    en: "Sign in to WriteFit to start your daily write practice.",
    zh: "登录 WriteFit 开始每日写作训练。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/auth/login",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function LoginPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-transparent">
      <LoginForm />
    </div>
  );
}
