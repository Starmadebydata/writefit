// ====================================================================
// 开发测试页面（不需要登录）
// ====================================================================
// 这个页面让用户在配置登录环境变量之前就能体验完整的训练流程
// 等上线配置好 AUTH_SECRET 和 OAuth 后，这个页面可以删除
// 或者保留作为产品演示入口
// ====================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { PracticeFlow } from "@/components/practice/PracticeFlow";
import { generateTodayPractice } from "@/lib/practice/scheduler";
import { ArrowLeft, Info, Settings } from "lucide-react";

// 开发测试页面 SEO（上线后可保留作为产品演示）
export const metadata: Metadata = {
  title: "Try Write Practice Online | WriteFit Demo",
  description:
    "Try WriteFit's write practice demo online. Experience a daily writing exercise with AI feedback — no login required.",
  keywords: [
    "write practice online",
    "writing practice demo",
    "try writing practice",
    "online writing exercise",
    "AI writing coach",
  ],
  alternates: {
    canonical: "https://writefit.app/practice/dev",
  },
};

export default function PracticeDevPage() {
  // 生成今日训练任务
  const todayPractice = generateTodayPractice(10, "zh");

  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航（简化版，不需要登录） */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            W
          </div>
          <span className="font-semibold">WriteFit</span>
          <span className="text-xs text-muted-foreground ml-2">开发测试</span>
        </Link>
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" render={<Link href="/ai-setup" />}>
            <Settings className="mr-1 h-3.5 w-3.5" />
            AI 设置
          </Button>
          <Button variant="ghost" size="sm" render={<Link href="/" />}>
            <ArrowLeft className="mr-1 h-3.5 w-3.5" />
            返回首页
          </Button>
        </div>
      </header>

      <main className="p-6">
        {/* 说明卡片 */}
        <Card className="max-w-3xl mx-auto mb-6 border-amber-200 bg-amber-50">
          <CardContent className="flex items-start gap-3 pt-6">
            <Info className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-semibold mb-1">这是开发测试模式</p>
              <p>
                你可以在这里体验完整的 5 阶段训练流程，不需要登录。
                没有配置 AI 时使用模拟反馈，
                <Link href="/ai-setup" className="underline font-medium">点击这里配置你的 AI 服务</Link>
                后即可获得真实 AI 诊断。训练数据不会保存到数据库。
              </p>
            </div>
          </CardContent>
        </Card>

        <PracticeFlow
          practiceType={todayPractice.practiceType}
          prompt={todayPractice.prompt}
          estimatedMinutes={todayPractice.estimatedMinutes}
          isDev={true}
        />
      </main>
    </div>
  );
}
