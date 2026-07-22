// ====================================================================
// /ai-writing-training —— SEO 落地页
// ====================================================================
// 打关键词 "ai writing training"（KD 26.8，SERP 前十全是大站顺路占位，
// 没人专门经营）。内容 + 排版模式跟 methodology/about/privacy 一致：
// 按 locale 内联双语，不走 messages.json（这几个长内容页的既有约定）。
// 核心转化点：直接嵌入 <TryItSection>，让访客不跳转就能试写。
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";
import { TryItSection } from "@/components/practice/TryItSection";
import { FaqSection, type FaqItem } from "@/components/marketing/FaqSection";
import { webPageJsonLd } from "@/lib/jsonld";
import { Brain, PenLine, Scissors, Repeat } from "lucide-react";

const PATH = "/ai-writing-training";

// 动态 SEO 元数据（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "AI Writing Training — Practice Writing Daily with an AI Coach | WriteFit",
    zh: "AI 写作训练 —— 跟 AI 教练每日练习写作 | WriteFit",
  };

  const descriptions = {
    en: "AI writing training that trains you, not a text generator. Write, get AI diagnosis on 3 specific issues, revise it yourself, compare versions. Try it free, no signup.",
    zh: "真正训练你写作能力的 AI 写作训练，不是文字生成器。写、AI 诊断 3 个具体问题、自己改、对比版本。免费试用，无需注册。",
  };

  const keywords = {
    en: [
      "ai writing training",
      "ai writing coach",
      "daily writing practice",
      "writing exercises",
      "improve writing with ai",
    ],
    zh: ["AI 写作训练", "AI 写作教练", "每日写作练习", "写作练习", "提升写作"],
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    keywords: keywords[locale as "en" | "zh"],
    alternates: {
      canonical: locale === "zh" ? `/zh${PATH}` : PATH,
      languages: {
        en: PATH,
        zh: `/zh${PATH}`,
        "x-default": PATH,
      },
    },
  };
}

const h2Class = "mt-10 mb-4 text-2xl font-semibold tracking-tight";
const pClass = "mb-4 text-muted-foreground leading-7";

export default async function AiWritingTrainingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const isZh = locale === "zh";
  const pageJsonLd = webPageJsonLd(
    PATH,
    isZh ? "AI 写作训练 | WriteFit" : "AI Writing Training | WriteFit",
    isZh
      ? "真正训练你写作能力的 AI 写作训练，不是文字生成器。"
      : "AI writing training that trains you, not a text generator."
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <PublicHeader />
      {isZh ? <ContentZh /> : <ContentEn />}
      <TryItSection variant="landing-page" />
      <FaqSection title={isZh ? "常见问题" : "Frequently Asked Questions"} items={isZh ? faqZh : faqEn} />
      <FooterCta locale={locale} />
    </>
  );
}

// ====================================================================
// 英文内容
// ====================================================================
function ContentEn() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-16">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        AI Writing Training: Practice, Get Feedback, Improve
      </h1>
      <p className="mb-10 text-lg text-muted-foreground leading-8">
        AI writing training is daily, structured writing practice where an AI
        coach diagnoses specific issues in your own drafts — clarity,
        specificity, voice, AI-likeness — and you revise the text yourself.
        It&apos;s the opposite of AI text generation: the AI never writes for
        you, it trains the person doing the writing.
      </p>

      <h2 className={h2Class}>Why AI should train you, not replace you</h2>
      <p className={pClass}>
        Most &quot;AI writing&quot; tools generate text for you. WriteFit
        does the opposite: it keeps you as the author and uses AI only for
        diagnosis. That distinction matters because skill only grows through{" "}
        <em>your own</em> revision — accepting AI output is the weakest form
        of learning. Read the full reasoning in{" "}
        <Link href="/methodology" className="underline hover:text-foreground">
          our methodology
        </Link>
        .
      </p>

      <h2 className={h2Class}>How WriteFit&apos;s training loop works</h2>
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        {[
          { icon: PenLine, title: "1. Write", desc: "A short piece, timed, no AI help." },
          { icon: Brain, title: "2. Diagnose", desc: "AI flags exactly 3 specific issues." },
          { icon: Scissors, title: "3. Revise", desc: "You fix the issues yourself." },
          { icon: Repeat, title: "4. Compare", desc: "See exactly what changed, save what works." },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-4">
            <Icon className="h-5 w-5 text-primary mb-2" />
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
        ))}
      </div>
      <p className={pClass}>
        Try one loop for yourself below — no signup required.
      </p>

      <h2 className={h2Class}>Types of AI writing training on WriteFit</h2>
      <ul className="mb-4 list-disc pl-6 space-y-2 text-muted-foreground leading-7">
        <li>
          <strong className="text-foreground">Daily Practice</strong> — a new
          prompt every day across free writing, persuasive, and narrative
          types.
        </li>
        <li>
          <strong className="text-foreground">Sentence Surgery</strong> —
          rewrite one weak sentence at a time until it lands.
        </li>
        <li>
          <strong className="text-foreground">Anti-AI Voice training</strong>{" "}
          — learn to spot and remove the tics that make writing read
          machine-generated.
        </li>
      </ul>
      <p className={pClass}>
        See the full breakdown in{" "}
        <Link href="/methodology" className="underline hover:text-foreground">
          the WriteFit method
        </Link>
        .
      </p>
    </main>
  );
}

const faqEn: FaqItem[] = [
  {
    q: "Is AI writing training actually effective?",
    a: "It's grounded in deliberate practice and the feedback-revision loop from learning science: skill grows from targeted work on specific weaknesses with immediate feedback, not from producing more text. WriteFit's AI diagnoses 3 concrete issues per draft so you always know exactly what to work on next.",
  },
  {
    q: "How is this different from ChatGPT or other AI writers?",
    a: "Tools like ChatGPT generate text for you. WriteFit's AI never writes your draft — it only diagnoses issues in what you wrote and lets you revise it yourself. The training happens in your revision, not in the AI's output.",
  },
  {
    q: "How long does a session take?",
    a: "About 15 minutes: a few minutes of timed writing, instant AI diagnosis, then a few minutes revising based on the feedback.",
  },
  {
    q: "Is it free?",
    a: "Yes. Try it above with no signup (2 free AI diagnoses a day). Create a free account for 5 AI diagnoses a day and saved training history.",
  },
  {
    q: "Do I need writing experience to start?",
    a: "No. The training scales to free writing, persuasive, and narrative prompts, and the diagnosis adapts to whatever level you're at.",
  },
];

// ====================================================================
// 中文内容
// ====================================================================
function ContentZh() {
  return (
    <main className="mx-auto max-w-3xl px-6 pt-16">
      <h1 className="mb-4 text-4xl font-bold tracking-tight">
        AI 写作训练：练习、获得反馈、持续提升
      </h1>
      <p className="mb-10 text-lg text-muted-foreground leading-8">
        AI 写作训练是一种每日、结构化的写作练习：AI 教练针对你自己写的稿子，
        诊断具体问题——清晰度、具体度、个人声音、AI 味——然后由你自己动手修改。
        这和「AI 生成文字」正好相反：AI 从不替你写，它训练的是写作的人。
      </p>

      <h2 className={h2Class}>为什么应该是 AI 训练你，而不是替代你</h2>
      <p className={pClass}>
        大多数「AI 写作」工具是替你生成文字。WriteFit 反过来：你始终是作者，
        AI 只负责诊断。这个区别很重要——技能只能靠你<em>自己</em>动手修改才能
        增长，直接接受 AI 的成品是最弱的学习方式。完整推理见{" "}
        <Link href="/methodology" className="underline hover:text-foreground">
          我们的方法论
        </Link>
        。
      </p>

      <h2 className={h2Class}>WriteFit 的训练闭环怎么运作</h2>
      <div className="grid gap-4 sm:grid-cols-2 mb-6">
        {[
          { icon: PenLine, title: "1. 写", desc: "限时写一小段，不用 AI 帮忙。" },
          { icon: Brain, title: "2. 诊断", desc: "AI 只指出 3 个具体问题。" },
          { icon: Scissors, title: "3. 改", desc: "问题由你自己动手修改。" },
          { icon: Repeat, title: "4. 对比", desc: "清楚看到改了什么，存下好句。" },
        ].map(({ icon: Icon, title, desc }) => (
          <div key={title} className="rounded-lg border border-border bg-card p-4">
            <Icon className="h-5 w-5 text-primary mb-2" />
            <p className="font-semibold text-sm">{title}</p>
            <p className="text-sm text-muted-foreground mt-1">{desc}</p>
          </div>
        ))}
      </div>
      <p className={pClass}>在下面亲自跑一轮试试——无需注册。</p>

      <h2 className={h2Class}>WriteFit 上的 AI 写作训练类型</h2>
      <ul className="mb-4 list-disc pl-6 space-y-2 text-muted-foreground leading-7">
        <li>
          <strong className="text-foreground">每日训练</strong> ——
          每天不同题目，涵盖自由写作、说服性写作、叙事写作。
        </li>
        <li>
          <strong className="text-foreground">句子手术</strong> ——
          每次专攻一个弱句，反复打磨到位。
        </li>
        <li>
          <strong className="text-foreground">去 AI 味训练</strong> ——
          学会识别并去掉让文字读起来像机器生成的习惯性表达。
        </li>
      </ul>
      <p className={pClass}>
        完整拆解见{" "}
        <Link href="/methodology" className="underline hover:text-foreground">
          WriteFit 方法论
        </Link>
        。
      </p>
    </main>
  );
}

const faqZh: FaqItem[] = [
  {
    q: "AI 写作训练真的有效吗？",
    a: "它基于学习科学中的刻意练习和反馈—修改闭环：技能增长来自针对具体弱点、带即时反馈的定向训练，而不是产出更多文字。WriteFit 的 AI 每次只诊断 3 个具体问题，让你始终清楚下一步该练什么。",
  },
  {
    q: "这和 ChatGPT 之类的 AI 写作工具有什么不同？",
    a: "ChatGPT 这类工具是替你生成文字。WriteFit 的 AI 从不替你写稿——它只诊断你自己写的内容里的问题，修改由你自己完成。训练发生在你的修改过程里，不是 AI 的产出里。",
  },
  {
    q: "一次训练要多久？",
    a: "大约 15 分钟：几分钟限时写作、即时 AI 诊断，再花几分钟根据反馈修改。",
  },
  {
    q: "免费吗？",
    a: "免费。上面无需注册即可试用（每天 2 次免费 AI 诊断）。注册账号后每天可用 5 次 AI 诊断，并保存训练历史。",
  },
  {
    q: "没有写作基础可以开始吗？",
    a: "可以。训练题目覆盖自由写作、说服性写作、叙事写作等不同难度，诊断也会适配你当前的水平。",
  },
];

// 底部 CTA
function FooterCta({ locale }: { locale: string }) {
  const isZh = locale === "zh";
  return (
    <section className="mx-auto max-w-3xl px-6 pb-20 text-center">
      <Link
        href="/auth/register"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90"
      >
        {isZh ? "免费开始 AI 写作训练" : "Start AI writing training free"}
      </Link>
    </section>
  );
}
