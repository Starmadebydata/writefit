// ====================================================================
// 注册页面
// ====================================================================
// 用户可以通过邮箱 + 密码注册 WriteFit 账户
// 也提供 Google 登录入口（方便已有 Google 账号的用户）
// ====================================================================

import type { Metadata } from "next";
import { auth, signIn } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";

export const metadata: Metadata = {
  title: "Sign Up | WriteFit",
  description: "Create your WriteFit account to start your daily write practice.",
  alternates: {
    canonical: "https://writefit.app/auth/register",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function RegisterPage() {
  // 如果已经登录了，直接跳转到 Dashboard
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-transparent">
      <RegisterForm signIn={signIn} />
    </div>
  );
}
