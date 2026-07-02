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
import { LoginForm } from "@/components/auth/LoginForm";

export const metadata: Metadata = {
  title: "Login | WriteFit",
  description: "Sign in to WriteFit to start your daily write practice.",
  alternates: {
    canonical: "https://writefit.app/auth/login",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-transparent">
      <LoginForm />
    </div>
  );
}
