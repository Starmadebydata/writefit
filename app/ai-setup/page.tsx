// ====================================================================
// AI 设置页面（不需要登录）
// ====================================================================
// 这个页面让用户在配置登录环境变量之前就能设置自己的 AI 服务
// 开发阶段用 localStorage 存储，生产环境用数据库
// ====================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { AISettingsForm } from "@/components/settings/AISettingsForm";
import { ArrowLeft } from "lucide-react";

// AI 设置页面 SEO
export const metadata: Metadata = {
  title: "Configure Your AI Writing Coach | WriteFit",
  description:
    "Set up your own AI writing coach for write practice. Connect DeepSeek, OpenAI, or any OpenAI-compatible API to get personalized writing feedback.",
  keywords: [
    "AI writing coach setup",
    "configure AI writing",
    "writing feedback API",
    "DeepSeek writing coach",
    "OpenAI writing assistant",
  ],
  alternates: {
    canonical: "https://writefit.app/ai-setup",
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AISetupPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* 顶部导航 */}
      <header className="border-b border-border px-6 py-3 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            W
          </div>
          <span className="font-semibold">WriteFit</span>
        </Link>
        <Button variant="ghost" size="sm" render={<Link href="/practice/dev" />}>
          <ArrowLeft className="mr-1 h-3.5 w-3.5" />
          返回训练
        </Button>
      </header>

      <main className="p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div>
            <h1 className="text-2xl font-bold mb-2">配置你的 AI 写作教练</h1>
            <p className="text-muted-foreground">
              WriteFit 支持任何兼容 OpenAI 接口格式的 AI 服务。
              配置好你的 API Key 后，AI 就能为你提供真实的写作诊断和反馈。
            </p>
          </div>

          <AISettingsForm />
        </div>
      </main>
    </div>
  );
}
