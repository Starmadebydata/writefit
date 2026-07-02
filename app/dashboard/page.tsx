// ====================================================================
// Dashboard 仪表盘页面
// ====================================================================
// 用户登录后看到的主页面
// MVP 阶段先做一个基础版本，后续迭代完善
// ====================================================================

import type { Metadata } from "next";
import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PenLine, Lightbulb, TrendingUp, Flame } from "lucide-react";
import Link from "next/link";

// Dashboard 页面 SEO
export const metadata: Metadata = {
  title: "My Writing Practice Dashboard | WriteFit",
  description:
    "Track your write practice streak, weekly progress, saved ideas, and drafts in your WriteFit dashboard.",
  keywords: [
    "writing practice dashboard",
    "track writing progress",
    "my write practice",
    "writing streak",
  ],
  alternates: {
    canonical: "https://writefit.app/dashboard",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default async function DashboardPage() {
  // 获取当前登录用户
  const session = await auth();
  if (!session?.user) {
    redirect("/auth/login");
  }

  return (
    <AppShell title="Dashboard" user={session.user}>
      {/* 欢迎语 */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold">
          欢迎回来，{session.user.name ?? "写作者"}
        </h2>
        <p className="text-muted-foreground mt-1">
          今天是你写作训练的第 1 天。开始今天的练习吧。
        </p>
      </div>

      {/* 今日训练卡片 —— 最显眼的位置 */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-1">今日训练</p>
              <CardTitle className="text-xl">自由写作 · Free Writing</CardTitle>
              <p className="text-sm text-muted-foreground mt-2">
                今天有没有一个时刻，你脑子里很清楚，但写出来很模糊？
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PenLine className="h-6 w-6" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Button render={<Link href="/practice/today" />}>
              开始训练
              <PenLine className="ml-2 h-4 w-4" />
          </Button>
        </CardContent>
      </Card>

      {/* 本周进度统计 */}
      <div className="grid gap-4 md:grid-cols-4 mb-6">
        {[
          { icon: Flame, label: "连续训练", value: "0 天", color: "text-orange-500" },
          { icon: PenLine, label: "本周训练", value: "0 次", color: "text-primary" },
          { icon: TrendingUp, label: "本周字数", value: "0 字", color: "text-primary" },
          { icon: Lightbulb, label: "保存素材", value: "0 条", color: "text-amber-500" },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.label}>
              <CardContent className="flex items-center gap-3 pt-6">
                <Icon className={`h-8 w-8 ${stat.color}`} />
                <div>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* 最近素材和草稿 */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">最近素材</CardTitle>
              <Link href="/ideas" className="text-sm text-primary hover:underline">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-8 text-center">
              还没有保存素材。
              <br />
              完成训练后可以保存好句和观点到这里。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">最近草稿</CardTitle>
              <Link href="/drafts" className="text-sm text-primary hover:underline">
                查看全部
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground py-8 text-center">
              还没有草稿。
              <br />
              <Link href="/drafts" className="text-primary hover:underline">
                创建第一个草稿
              </Link>
            </p>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
