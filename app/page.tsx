// ====================================================================
// WriteFit Landing Page（首页）
// ====================================================================
// 这是用户第一次访问 WriteFit 看到的页面
// 作用：解释产品价值，引导用户开始训练
//
// 页面结构：
// 1. Hero —— 核心标语 + 开始按钮
// 2. 问题陈述 —— 你是否也有这些写作问题？
// 3. 产品机制 —— WriteFit 怎么帮你
// 4. 核心功能 —— 主要功能介绍
// 5. 用户场景 —— 谁适合用 WriteFit
// 6. CTA —— 最终行动号召
// ====================================================================

import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// 首页 SEO：聚焦主关键词 write practice / writing practice
export const metadata: Metadata = {
  title: "WriteFit | Start Your Daily Write Practice with an AI Coach",
  description:
    "Looking for a write practice that actually works? WriteFit is an AI writing coach that gives you daily writing exercises, instant feedback, and a clear path to improve your writing.",
  keywords: [
    "write practice",
    "writing practice",
    "daily writing practice",
    "writing exercises",
    "AI writing coach",
  ],
  alternates: {
    canonical: "https://writefit.app",
  },
};

import {
  PenLine,
  Brain,
  Scissors,
  FileText,
  Lightbulb,
  TrendingUp,
  Shield,
  ArrowRight,
} from "lucide-react";

export default function LandingPage() {
  return (
    <div className="flex flex-col">
      {/* ================================================================
          1. Hero 区域 —— 核心标语
      ================================================================ */}
      <section className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center">
          {/* Logo */}
          <div className="mb-6 flex items-center justify-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold">
              W
            </div>
            <span className="text-2xl font-bold">WriteFit</span>
          </div>

          <Badge variant="secondary" className="mb-6">
            AI Native 写作训练
          </Badge>

          <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
            每天 15 分钟，
            <br />
            重新训练你的写作肌肉
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            WriteFit 是一个 AI 写作教练。它不会直接替你写文章，
            而是帮助你练习、修改、积累，慢慢找回自己的表达能力。
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button size="lg" render={<Link href="/auth/login" />}>
                开始训练
                <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" render={<Link href="#how-it-works" />}>
              了解原理
            </Button>
          </div>

          <p className="mt-6 text-sm text-muted-foreground">
            An AI writing coach that trains your writing ability instead of replacing it.
          </p>

          {/* 开发测试入口 */}
          <p className="mt-4 text-xs">
            <Link href="/practice/dev" className="text-primary hover:underline">
              体验训练流程（无需登录）→
            </Link>
          </p>
        </div>
      </section>

      {/* ================================================================
          2. 问题陈述 —— 你是否也有这些问题？
      ================================================================ */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">
          AI 让你写得更快了，但你自己还会写吗？
        </h2>
        <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
          很多知识工作者发现：AI 用得越多，自己的写作能力反而越弱。
        </p>

        <div className="grid gap-4 md:grid-cols-2">
          {[
            "长期写工作文档和 Prompt，表达变得僵硬",
            "想写博客、Newsletter，但下笔困难",
            "写出来的内容空泛、模板化、缺少个人经验",
            "AI 生成内容越用越多，自己的声音越来越弱",
            "没有持续训练机制，无法靠碎片时间提升",
            "缺少有效反馈，不知道自己的文字哪里有问题",
          ].map((problem, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-4 rounded-lg border border-border bg-card"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive text-sm font-medium">
                {i + 1}
              </span>
              <p className="text-sm">{problem}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ================================================================
          3. 产品机制 —— WriteFit 怎么帮你
      ================================================================ */}
      <section id="how-it-works" className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4">
            用户先写，AI 后反馈
          </h2>
          <p className="text-center text-muted-foreground mb-12 max-w-2xl mx-auto">
            WriteFit 的核心机制：你先写，AI 再做教练、编辑和批评者。
          </p>

          <div className="grid gap-6 md:grid-cols-5">
            {[
              { step: "1", title: "你先写", desc: "每天围绕一个题目写 10-15 分钟原始稿" },
              { step: "2", title: "AI 诊断", desc: "AI 引用你的原文，指出 3 个具体问题" },
              { step: "3", title: "你修改", desc: "根据反馈手动修改，不是 AI 替你改" },
              { step: "4", title: "版本对比", desc: "看到自己具体改了什么，进步在哪" },
              { step: "5", title: "积累素材", desc: "好句、观点、标题进入个人素材库" },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {item.step}
                </div>
                <h3 className="font-semibold mb-1">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          4. 核心功能
      ================================================================ */}
      <section className="mx-auto max-w-5xl px-6 py-20">
        <h2 className="text-3xl font-bold text-center mb-4">核心功能</h2>
        <p className="text-center text-muted-foreground mb-12">
          每次只练一个动作，反馈必须具体，修改比生成重要。
        </p>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[
            {
              icon: PenLine,
              title: "每日训练",
              desc: "自由写作、句子手术、具体化训练、反 AI 腔训练，每天一个动作。",
            },
            {
              icon: Brain,
              title: "AI 诊断",
              desc: "AI 引用你的原文，给出 3 个具体问题和修改任务，不泛泛评价。",
            },
            {
              icon: Scissors,
              title: "句子训练",
              desc: "对单个句子进行专项训练：删废话、抽象改具体、长句拆短句。",
            },
            {
              icon: Shield,
              title: "反 AI 腔检测",
              desc: "识别文本中的模板腔、空泛表达和 AI 常用词，帮你找回自己的声音。",
            },
            {
              icon: Lightbulb,
              title: "素材库",
              desc: "保存好句、标题、观点、例子，长期积累形成个人写作数据库。",
            },
            {
              icon: FileText,
              title: "草稿实验室",
              desc: "管理长文草稿，AI 诊断、版本历史、Markdown 导出。",
            },
            {
              icon: TrendingUp,
              title: "进度追踪",
              desc: "训练日历、连续天数、字数趋势、AI 腔变化，看见自己的进步。",
            },
          ].map((feature) => {
            const Icon = feature.icon;
            return (
              <Card key={feature.title}>
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="h-5 w-5" />
                  </div>
                  <CardTitle>{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{feature.desc}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* ================================================================
          5. 用户场景
      ================================================================ */}
      <section className="bg-muted/30 border-y border-border">
        <div className="mx-auto max-w-4xl px-6 py-20">
          <h2 className="text-3xl font-bold text-center mb-4">谁适合用 WriteFit</h2>
          <div className="grid gap-6 md:grid-cols-2 mt-12">
            {[
              {
                title: "AI 工具重度使用者",
                desc: "独立开发者、产品经理、运营人员。有大量判断，但写成文章时变成报告腔。",
              },
              {
                title: "内容创作者",
                desc: "公众号、Substack、Newsletter 作者。有表达欲，但写作不稳定，容易依赖 AI。",
              },
              {
                title: "写作退化的知识工作者",
                desc: "顾问、研究员、教师、投资人。读得多想得多，但写出来不清楚、不自然。",
              },
              {
                title: "英文写作学习者",
                desc: "出海创业者、独立开发者。想写英文博客，但缺少写作训练路径。",
              },
            ].map((persona) => (
              <div key={persona.title} className="p-6 rounded-lg bg-card border border-border">
                <h3 className="font-semibold mb-2">{persona.title}</h3>
                <p className="text-sm text-muted-foreground">{persona.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================================================================
          6. 最终 CTA
      ================================================================ */}
      <section className="mx-auto max-w-4xl px-6 py-24 text-center">
        <h2 className="text-3xl font-bold mb-4">
          停止把你的声音外包给 AI
        </h2>
        <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
          每天 15 分钟，一次只练一个动作。
          长期积累，重新拥有自己的表达能力。
        </p>
        <Button size="lg" render={<Link href="/auth/login" />}>
          开始你的第一次训练
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </section>

      {/* ================================================================
          页脚
      ================================================================ */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-4xl px-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded bg-primary text-primary-foreground text-xs font-bold">
              W
            </div>
            <span className="font-medium">WriteFit</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Train your writing muscles, not your AI prompting skills.
          </p>
        </div>
      </footer>
    </div>
  );
}
