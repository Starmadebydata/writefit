// ====================================================================
// 注册页面
// ====================================================================
// 用户可以通过邮箱 + 密码注册 WriteFit 账户
// 也提供 Google 登录入口（方便已有 Google 账号的用户）
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";
import { RegisterForm } from "@/components/auth/RegisterForm";

// 动态 SEO 元数据（根据 locale 返回对应语言的标题和描述）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Sign Up | WriteFit",
    zh: "注册 | WriteFit",
  };

  const descriptions = {
    en: "Create your WriteFit account to start your daily write practice.",
    zh: "创建 WriteFit 账户，开始每日写作训练。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/auth/register",
    },
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function RegisterPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-transparent">
      <RegisterForm />
    </div>
  );
}
