"use client";

// ====================================================================
// 登录表单组件
// ====================================================================
// 包含：
// 1. Google 登录按钮（放在最上方，重点推荐）
// 2. 邮箱 + 密码登录表单
// 3. 注册页面链接
//
// 使用 next-auth/react 的 signIn，这是客户端专用的登录方法
// ====================================================================

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  // Google 登录
  async function handleGoogleLogin() {
    setGoogleLoading(true);
    try {
      await signIn("google", { callbackUrl: "/dashboard" });
    } catch {
      toast.error("Google 登录失败");
      setGoogleLoading(false);
    }
  }

  // 邮箱密码登录
  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
        callbackUrl: "/dashboard",
      });

      if (result?.error) {
        toast.error("邮箱或密码错误");
      } else {
        toast.success("登录成功！");
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      toast.error("登录失败，请稍后重试");
    } finally {
      setLoading(false);
    }
  }

  return (
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
      <CardContent className="space-y-4">
        {/* Google 登录 —— 放在最上方，重点推荐 */}
        <Button
          type="button"
          variant="outline"
          className="w-full"
          onClick={handleGoogleLogin}
          disabled={googleLoading}
        >
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
          {googleLoading ? "正在跳转..." : "用 Google 登录"}
        </Button>

        {/* 分隔线 */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">或者用邮箱登录</span>
          </div>
        </div>

        {/* 邮箱密码登录表单 */}
        <form onSubmit={handleLogin} className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="email">邮箱</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">密码</Label>
            <Input
              id="password"
              type="password"
              placeholder="你的密码"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "正在登录..." : "登录"}
          </Button>
        </form>

        {/* 注册链接 */}
        <div className="pt-2 text-center">
          <p className="text-sm text-muted-foreground">
            还没有账户？{" "}
            <Link href="/auth/register" className="text-primary hover:underline font-medium">
              免费注册
            </Link>
          </p>
        </div>

        <div className="pt-2 text-center">
          <p className="text-xs text-muted-foreground">
            登录即表示你同意 WriteFit 帮助你训练写作能力，
            <br />
            而不是替你写文章。
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
