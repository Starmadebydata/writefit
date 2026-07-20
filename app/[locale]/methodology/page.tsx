// ====================================================================
// Methodology 方法论页面（公开，无需登录）
// ====================================================================
// 把首页的 5 步训练闭环正式命名为 "The WriteFit Loop"，展开讲解：
// 1. 训练闭环 5 步  2. AI 诊断的 4 个维度  3. 背后的学习科学
// 4. 我们刻意不做的功能
// 这是 E-E-A-T 资产页：证明"懂教写作"，而非仅"声称是教练"。
// 内容按 locale 双语内联（与 privacy/terms/about 同一模式）。
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";

// 动态 SEO 元数据（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "The WriteFit Method | WriteFit",
    zh: "WriteFit 方法论 | WriteFit",
  };

  const descriptions = {
    en: "The WriteFit Loop: write first, AI diagnoses 3 issues, you revise, compare versions, keep what works. Grounded in deliberate practice and learning science.",
    zh: "WriteFit 训练闭环：你先写、AI 诊断 3 个问题、你自己改、版本对比、留存好句。基于刻意练习与学习科学。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: {
      canonical: locale === "zh" ? "/zh/methodology" : "/methodology",
      languages: {
        en: "/methodology",
        zh: "/zh/methodology",
        "x-default": "/methodology",
      },
    },
  };
}

// 共享的排版类名（与 privacy/terms/about 一致，手写 prose 风格）
const h2Class = "mt-10 mb-4 text-2xl font-semibold tracking-tight";
const h3Class = "mt-6 mb-2 text-lg font-semibold tracking-tight";
const pClass = "mb-4 text-muted-foreground leading-7";
const olClass = "mb-4 list-decimal pl-6 space-y-3 text-muted-foreground leading-7";
const ulClass = "mb-4 list-disc pl-6 space-y-2 text-muted-foreground leading-7";

export default async function MethodologyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PublicHeader />
      {locale === "zh" ? <MethodologyZh /> : <MethodologyEn />}
    </>
  );
}

function MethodologyEn() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">
        The WriteFit Method
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        A training loop for your writing — not a text generator.
      </p>

      <h2 className={h2Class}>The WriteFit Loop</h2>
      <p className={pClass}>
        Every WriteFit session runs the same five-step loop, in about 15
        minutes. The order matters: AI never touches your text before you do.
      </p>
      <ol className={olClass}>
        <li>
          <strong className="text-foreground">Write.</strong> A short piece,
          15 minutes, no AI help. The blank-page struggle is not a bug — it is
          the stimulus that training works on.
        </li>
        <li>
          <strong className="text-foreground">Diagnose.</strong> The AI reads
          your draft like an editor and flags exactly three issues. Not
          thirty — three. The constraint forces prioritization, so you always
          know what to work on next.
        </li>
        <li>
          <strong className="text-foreground">Revise.</strong> You fix the
          issues yourself. The AI explains and points; it never rewrites.
          Revision is where the learning happens, so we keep it in your hands.
        </li>
        <li>
          <strong className="text-foreground">Compare.</strong> A version diff
          shows exactly what changed between your original and your revision.
          Progress you can see is progress you repeat.
        </li>
        <li>
          <strong className="text-foreground">Keep.</strong> Save your best
          sentences and ideas to your personal library. Over time it becomes
          an index of your voice — written by you, not generated for you.
        </li>
      </ol>

      <h2 className={h2Class}>What the AI looks for</h2>
      <p className={pClass}>
        Diagnosis runs on four dimensions. They were chosen because they are
        the four places drafts most often go wrong — and the four that
        AI-polished text flattens first.
      </p>

      <h3 className={h3Class}>1. Clarity</h3>
      <p className={pClass}>
        Can a reader parse every sentence on the first try? We flag nested
        clauses, vague references, buried verbs, and sentences that carry two
        ideas where one would do.
      </p>

      <h3 className={h3Class}>2. Specificity</h3>
      <p className={pClass}>
        &quot;Nice weather&quot; tells the reader nothing; &quot;26°C, wind
        off the sea&quot; does. We push abstract claims toward concrete
        detail, numbers, and scenes.
      </p>

      <h3 className={h3Class}>3. Personal voice</h3>
      <p className={pClass}>
        Does this read like you, or like everyone? We flag hedging habits,
        overused safe phrases, and passages where your rhythm disappears into
        generic competence.
      </p>

      <h3 className={h3Class}>4. AI-likeness</h3>
      <p className={pClass}>
        Text that reads machine-generated: uniform sentence lengths,
        rule-of-three overuse, empty transitions, and stock phrases like
        &quot;delve into&quot;. Even human writers pick these up now — the
        goal is to make you sound human again.
      </p>

      <h2 className={h2Class}>The science behind it</h2>
      <p className={pClass}>
        The method is grounded in established learning science, not invented
        on a whiteboard:
      </p>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">Deliberate practice</strong>{" "}
          (Anders Ericsson): skill grows through targeted work on specific
          weaknesses with immediate feedback — not through more undirected
          volume. That is why diagnosis returns three issues, not a wall of
          comments.
        </li>
        <li>
          <strong className="text-foreground">The feedback–revision loop</strong>:
          writing-research consensus is that revision is where skill
          consolidates. Producing more first drafts does not make you better;
          revising them does.
        </li>
        <li>
          <strong className="text-foreground">The generation effect</strong>:
          people remember and learn from what they produce themselves far
          better than from what they merely read — including text an AI wrote
          for them. Accepting AI output is, quite literally, the weak form of
          learning.
        </li>
      </ul>

      <h2 className={h2Class}>What we deliberately don&apos;t build</h2>
      <ul className={ulClass}>
        <li>No &quot;generate article&quot; button. There never will be.</li>
        <li>No autocomplete. Suggestions are diagnosis, not ghost text.</li>
        <li>
          No &quot;humanize my AI draft&quot; mode. WriteFit trains the human,
          not the output.
        </li>
      </ul>

      <h2 className={h2Class}>Try it</h2>
      <p className={pClass}>
        The fastest way to understand the method is to run one loop.{" "}
        <Link href="/practice/dev" className="underline hover:text-foreground">
          Try a session without an account
        </Link>
        , or{" "}
        <Link href="/auth/register" className="underline hover:text-foreground">
          start free
        </Link>{" "}
        — five AI coaching sessions a day, no card required.
      </p>
    </main>
  );
}

function MethodologyZh() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">
        WriteFit 方法论
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        一套写作训练闭环——不是文字生成器。
      </p>

      <h2 className={h2Class}>WriteFit 训练闭环</h2>
      <p className={pClass}>
        每次训练都走同一个五步闭环，大约 15 分钟。顺序很关键：在你动笔之前，
        AI 绝不碰你的文字。
      </p>
      <ol className={olClass}>
        <li>
          <strong className="text-foreground">写。</strong>
          15 分钟一篇短文，不许用 AI。和空白页面较劲不是缺陷——那正是训练
          起作用的刺激源。
        </li>
        <li>
          <strong className="text-foreground">诊断。</strong>
          AI 像编辑一样读完你的稿子，只指出三个问题。不是三十个——三个。
          这个约束逼出优先级，让你永远知道下一步练什么。
        </li>
        <li>
          <strong className="text-foreground">改。</strong>
          问题由你亲手改。AI 只解释、只指方向，绝不重写。修改正是学习发生
          的地方，所以我们把它留在你手里。
        </li>
        <li>
          <strong className="text-foreground">对比。</strong>
          版本对比清楚展示初稿和修改稿之间的每一处变化。看得见的进步，
          才是会重复的进步。
        </li>
        <li>
          <strong className="text-foreground">存。</strong>
          把最好的句子和点子存进你的个人素材库。日积月累，它会成为你写作
          声音的索引——你亲手写的，不是机器生成的。
        </li>
      </ol>

      <h2 className={h2Class}>AI 诊断什么</h2>
      <p className={pClass}>
        诊断围绕四个维度展开。选这四个，是因为它们是稿子最容易出问题的地方，
        也是被 AI 润色最先磨平的地方。
      </p>

      <h3 className={h3Class}>1. 清晰度</h3>
      <p className={pClass}>
        读者能不能一遍读懂每个句子？我们标记嵌套从句、指代不明、被埋住的
        动词，以及一个句子硬塞两个想法的地方。
      </p>

      <h3 className={h3Class}>2. 具体度</h3>
      <p className={pClass}>
        「天气不错」什么都没说；「26°C，风从海上来」才是在写东西。我们把
        空泛的断言推向具体的细节、数字和场景。
      </p>

      <h3 className={h3Class}>3. 个人声音</h3>
      <p className={pClass}>
        这段读起来像你，还是像所有人？我们标记过度对冲的表达、用滥的安全
        套话，以及你的节奏消失在平庸正确里的段落。
      </p>

      <h3 className={h3Class}>4. AI 味</h3>
      <p className={pClass}>
        读起来像机器生成的文字：整齐划一的句长、对三段式的滥用、空洞的
        过渡词、随处可见的「赋能」「抓手」。现在连人类写手都染上了这些
        毛病——目标是让你重新写得像人。
      </p>

      <h2 className={h2Class}>背后的学习科学</h2>
      <p className={pClass}>
        这套方法不是拍脑袋想出来的，它立在成熟的学习科学研究之上：
      </p>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">刻意练习</strong>
          （安德斯·艾利克森）：技能增长来自针对具体弱点、带即时反馈的定向
          训练，而不是更多的盲目练习量。这就是为什么诊断只给三个问题，而
          不是一墙批注。
        </li>
        <li>
          <strong className="text-foreground">反馈—修改闭环</strong>：
          写作研究的共识是，技能在修改中固化。写更多初稿不会让你变好，
          修改初稿才会。
        </li>
        <li>
          <strong className="text-foreground">生成效应</strong>：
          人对亲手产出内容的记忆和学习效果，远好于仅仅阅读的内容——包括
          AI 替你写的内容。接受 AI 的成品，从字面上说就是学习的最弱形式。
        </li>
      </ul>

      <h2 className={h2Class}>我们刻意不做的功能</h2>
      <ul className={ulClass}>
        <li>没有「生成文章」按钮。永远不会有。</li>
        <li>没有自动补全。给的是诊断，不是代写文字。</li>
        <li>没有「把我的 AI 稿洗成人味」模式。WriteFit 训练的是人，不是稿子。</li>
      </ul>

      <h2 className={h2Class}>亲自试试</h2>
      <p className={pClass}>
        理解这套方法最快的方式是跑一轮闭环。可以{" "}
        <Link href="/practice/dev" className="underline hover:text-foreground">
          不注册直接体验一次训练
        </Link>
        ，或者{" "}
        <Link href="/auth/register" className="underline hover:text-foreground">
          免费开始
        </Link>
        ——每天 5 次 AI 教练反馈，不需要信用卡。
      </p>
    </main>
  );
}
