// ====================================================================
// 登录页面
// ====================================================================
// 用户点击"开始训练"后跳转到这个页面
// 提供 GitHub 和 Google 第三方登录按钮
// ====================================================================

import type { Metadata } from "next";
import { auth, signIn } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Github } from "lucide-react";

// 登录页面 SEO
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

export default async function LoginPage() {
  // 如果已经登录了，直接跳转到 Dashboard
  const session = await auth();
  if (session) {
    redirect("/dashboard");
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-6 bg-gradient-to-b from-primary/5 to-transparent">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-lg">
            W
          </div>
          <CardTitle className="text-2xl">登录 WriteFit</CardTitle>
          <p className="text-sm text-muted-foreground mt-2">
            每天 15 分钟，训练你自己的写作能力
          </p>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* GitHub 登录 */}
          <form
            action={async () => {
              "use server";
              await signIn("github", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              <Github className="mr-2 h-4 w-4" />
              用 GitHub 登录
            </Button>
          </form>

          {/* Google 登录 */}
          <form
            action={async () => {
              "use server";
              await signIn("google", { redirectTo: "/dashboard" });
            }}
          >
            <Button type="submit" variant="outline" className="w-full">
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              用 Google 登录
            </Button>
          </form>

          <div className="pt-4 text-center">
            <p className="text-xs text-muted-foreground">
              登录即表示你同意 WriteFit 帮助你训练写作能力，
              <br />
              而不是替你写文章。
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
