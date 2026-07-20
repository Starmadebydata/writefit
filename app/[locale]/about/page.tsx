// ====================================================================
// About 页面（公开，无需登录）
// ====================================================================
// 创始人故事 + 产品信念 + 信任信息。
// 内容按 locale 双语内联（与 privacy/terms 同一模式），不进 messages。
// 注意：不出现公司名称；创始人对外用 Jason Guo。
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { PublicHeader } from "@/components/layout/PublicHeader";

// 动态 SEO 元数据（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "About | WriteFit",
    zh: "关于 | WriteFit",
  };

  const descriptions = {
    en: "Why WriteFit exists: an AI writing coach that refuses to write for you. Founded by Jason Guo.",
    zh: "WriteFit 为什么存在：一个拒绝替你写作的 AI 写作教练。创始人 Jason Guo。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: {
      canonical: locale === "zh" ? "/zh/about" : "/about",
      languages: {
        en: "/about",
        zh: "/zh/about",
        "x-default": "/about",
      },
    },
  };
}

// 创始人 Person schema（E-E-A-T 实体归属）
const founderJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": "https://writefit.app/about#founder",
  name: "Jason Guo",
  jobTitle: "Founder",
  worksFor: { "@id": "https://writefit.app/#organization" },
};

// 共享的排版类名（与 privacy/terms 一致，手写 prose 风格）
const h2Class = "mt-10 mb-4 text-2xl font-semibold tracking-tight";
const pClass = "mb-4 text-muted-foreground leading-7";
const ulClass = "mb-4 list-disc pl-6 space-y-2 text-muted-foreground leading-7";

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PublicHeader />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(founderJsonLd) }}
      />
      {locale === "zh" ? <AboutZh /> : <AboutEn />}
    </>
  );
}

function AboutEn() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">About WriteFit</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        An AI writing coach that refuses to write for you.
      </p>

      <h2 className={h2Class}>Why WriteFit exists</h2>
      <p className={pClass}>
        I&apos;m Jason Guo, the founder of WriteFit.
      </p>
      <p className={pClass}>
        I built WriteFit because of an uncomfortable realization: the better AI
        got at writing, the worse I got at it.
      </p>
      <p className={pClass}>
        When AI could produce a decent draft in ten seconds, I stopped
        wrestling with blank pages. My output went up. But my sentences
        started sounding like everyone else&apos;s — smooth, correct, and
        strangely hollow. The reps that actually make you a better writer —
        staring at a bad sentence and fixing it yourself — had quietly
        disappeared from my days.
      </p>
      <p className={pClass}>
        WriteFit is the tool I wanted and couldn&apos;t find: an AI that
        refuses to write for you. It reads your draft like an editor, points
        at three specific problems, and then steps aside. You do the fixing.
        That&apos;s the whole point.
      </p>

      <h2 className={h2Class}>What we believe</h2>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">Writing is a skill, not a talent.</strong>{" "}
          Skills are built by repetitions with feedback — not by reading
          outputs someone (or something) else produced.
        </li>
        <li>
          <strong className="text-foreground">AI should be a coach, not a ghostwriter.</strong>{" "}
          A coach makes you stronger every session. A ghostwriter makes you
          more dependent every session.
        </li>
        <li>
          <strong className="text-foreground">Your voice is the asset.</strong>{" "}
          When everyone can generate &quot;fine&quot; text instantly, sounding
          like yourself is the only moat left.
        </li>
      </ul>

      <h2 className={h2Class}>How WriteFit treats your work</h2>
      <ul className={ulClass}>
        <li>
          Your writing is yours. You own everything you write here, and you
          can export or delete it anytime.
        </li>
        <li>
          Bring-your-own-key (BYOK) is available on paid plans: your API key
          is stored only in your browser, never on our servers.
        </li>
        <li>
          Details live in our <Link href="/privacy" className="underline hover:text-foreground">Privacy Policy</Link> and{" "}
          <Link href="/terms" className="underline hover:text-foreground">Terms of Service</Link>.
        </li>
      </ul>

      <h2 className={h2Class}>Contact</h2>
      <p className={pClass}>
        Questions, feedback, or partnership ideas:{" "}
        <a
          href="mailto:support@writefit.app"
          className="underline hover:text-foreground"
        >
          support@writefit.app
        </a>
      </p>
      <p className={pClass}>
        WriteFit is designed and built by Jason Guo.
      </p>
    </main>
  );
}

function AboutZh() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">关于 WriteFit</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        一个拒绝替你写作的 AI 写作教练。
      </p>

      <h2 className={h2Class}>WriteFit 为什么存在</h2>
      <p className={pClass}>我是 Jason Guo，WriteFit 的创始人。</p>
      <p className={pClass}>
        做 WriteFit 源于一个不太舒服的发现：AI 越会写，我越不会写。
      </p>
      <p className={pClass}>
        当 AI 十秒就能给出一篇像样的初稿，我就不再和空白页面较劲了。产量是上去了，
        但我的句子开始和所有人的一个味道——顺滑、正确、莫名的空洞。那些真正让你
        写得更好的练习——盯着一句烂句子、亲手把它改好——悄悄从我的日常里消失了。
      </p>
      <p className={pClass}>
        WriteFit 就是我一直想要却找不到的工具：一个拒绝替你写的 AI。它像编辑一样
        读你的稿子，指出三个具体问题，然后退到一边。动手改的人是你。这就是全部
        意义所在。
      </p>

      <h2 className={h2Class}>我们相信什么</h2>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">写作是技能，不是天赋。</strong>
          技能靠「练习 + 反馈」的重复打磨出来，而不是靠阅读别人（或别的什么）
          产出的成品。
        </li>
        <li>
          <strong className="text-foreground">AI 应该当教练，而不是枪手。</strong>
          教练让你每次训练后更强；枪手让你每次使用后更依赖。
        </li>
        <li>
          <strong className="text-foreground">你的声音才是资产。</strong>
          当所有人都能瞬间生成「还不错」的文字，「像你自己」成了仅剩的护城河。
        </li>
      </ul>

      <h2 className={h2Class}>WriteFit 如何对待你的作品</h2>
      <ul className={ulClass}>
        <li>
          你的写作归你所有。你在这里写的一切都属于你，随时可以导出或删除。
        </li>
        <li>
          付费套餐支持自带 Key（BYOK）：你的 API Key 只存在你自己的浏览器里，
          永远不会传到我们的服务器。
        </li>
        <li>
          详见 <Link href="/privacy" className="underline hover:text-foreground">隐私政策</Link> 和{" "}
          <Link href="/terms" className="underline hover:text-foreground">服务条款</Link>。
        </li>
      </ul>

      <h2 className={h2Class}>联系方式</h2>
      <p className={pClass}>
        问题、反馈或合作想法：{" "}
        <a
          href="mailto:support@writefit.app"
          className="underline hover:text-foreground"
        >
          support@writefit.app
        </a>
      </p>
      <p className={pClass}>WriteFit 由 Jason Guo 设计并开发。</p>
    </main>
  );
}
