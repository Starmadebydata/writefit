// ====================================================================
// 隐私政策页面（公开，无需登录）
// ====================================================================
// 内容按 locale 双语内联：英文为主，中文翻译
// 法律文本不放进 messages/*.json，保持简单
// ====================================================================

import type { Metadata } from "next";
import { setRequestLocale, getLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";

// 动态 SEO 元数据（根据语言切换）
export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();

  const titles = {
    en: "Privacy Policy | WriteFit",
    zh: "隐私政策 | WriteFit",
  };

  const descriptions = {
    en: "Learn how WriteFit collects, uses, and protects your data, including your writing, account information, and AI configuration.",
    zh: "了解 WriteFit 如何收集、使用和保护你的数据，包括你的写作内容、账户信息和 AI 配置。",
  };

  return {
    title: titles[locale as "en" | "zh"],
    description: descriptions[locale as "en" | "zh"],
    alternates: {
      canonical: "https://writefit.app/privacy",
      languages: {
        en: "https://writefit.app/privacy",
        zh: "https://writefit.app/zh/privacy",
      },
    },
  };
}

export default async function PrivacyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return locale === "zh" ? <PrivacyZh /> : <PrivacyEn />;
}

// 共享的排版类名（项目没有 @tailwindcss/typography，手写 prose 风格）
const h2Class = "mt-10 mb-4 text-2xl font-semibold tracking-tight";
const pClass = "mb-4 text-muted-foreground leading-7";
const ulClass = "mb-4 list-disc pl-6 space-y-2 text-muted-foreground leading-7";

function PrivacyEn() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Last updated: July 18, 2026
      </p>

      <p className={pClass}>
        WriteFit (&quot;we&quot;, &quot;our&quot;) is an AI writing coach that
        helps you build a daily writing practice. This Privacy Policy explains
        what data we collect, why we collect it, and the rights you have over
        your information.
      </p>

      <h2 className={h2Class}>1. Data We Collect</h2>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">Account information.</strong>{" "}
          When you sign in with Google, we receive your email address, name,
          and profile picture from Google. If you register with email and
          password, we store your email address and a hashed password.
        </li>
        <li>
          <strong className="text-foreground">Writing content.</strong> The
          exercises, drafts, sentences, and ideas you write in WriteFit are
          stored so you can review and continue your practice.
        </li>
        <li>
          <strong className="text-foreground">Training records.</strong> Your
          practice history, streaks, progress statistics, and AI feedback
          results.
        </li>
        <li>
          <strong className="text-foreground">AI configuration.</strong> Your
          AI provider settings (such as API keys, model choices, and custom
          endpoints) are stored only in your browser&apos;s localStorage. They
          are never sent to or stored on our servers.
        </li>
      </ul>

      <h2 className={h2Class}>2. How We Use Your Data</h2>
      <ul className={ulClass}>
        <li>To provide and maintain the writing training service.</li>
        <li>To show your practice history, progress, and streaks.</li>
        <li>To generate AI feedback on your writing, using the AI provider you configure.</li>
        <li>To understand how the product is used so we can improve it.</li>
      </ul>

      <h2 className={h2Class}>3. Third-Party Services</h2>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">Cloudflare.</strong> WriteFit is
          hosted on Cloudflare Workers, and your account and writing data are
          stored in a Cloudflare D1 database.
        </li>
        <li>
          <strong className="text-foreground">Google OAuth.</strong> Used for
          sign-in. Google provides us your basic profile information (email,
          name, avatar).
        </li>
        <li>
          <strong className="text-foreground">
            Third-party AI APIs (BYOK).
          </strong>{" "}
          WriteFit is &quot;bring your own key&quot;: you configure your own AI
          provider (for example OpenAI or Anthropic) with your own API key.
          When you request AI feedback, the relevant text you wrote is sent
          from your browser directly to the AI provider you configured. That
          transmission is governed by your own agreement with that provider;
          we do not operate or control these AI services.
        </li>
        <li>
          <strong className="text-foreground">PostHog.</strong> We use PostHog
          for product analytics (page views and feature usage) to improve
          WriteFit.
        </li>
      </ul>

      <h2 className={h2Class}>4. Cookies</h2>
      <p className={pClass}>
        We only use cookies that are strictly necessary to keep you signed in
        (a session cookie) and to remember your language preference. We do not
        use advertising or cross-site tracking cookies.
      </p>

      <h2 className={h2Class}>5. Your Rights: Export and Deletion</h2>
      <p className={pClass}>
        You can export all of your data at any time from the Settings page.
        You can also permanently delete your account from Settings, which
        removes your account information, writing content, and training
        records from our database. Deleting your account is irreversible.
      </p>

      <h2 className={h2Class}>6. Data Retention</h2>
      <p className={pClass}>
        We keep your data for as long as your account is active. If you delete
        your account, your personal data and writing content are removed from
        our active database. Residual copies may persist in backups for a
        limited period before being overwritten.
      </p>

      <h2 className={h2Class}>7. Changes to This Policy</h2>
      <p className={pClass}>
        We may update this Privacy Policy from time to time. When we do, we
        will revise the &quot;Last updated&quot; date above. Continued use of
        WriteFit after a change means you accept the updated policy.
      </p>

      <h2 className={h2Class}>8. Contact</h2>
      <p className={pClass}>
        If you have any questions about this Privacy Policy or your data,
        contact us at{" "}
        <a
          href="mailto:aifeefee70@gmail.com"
          className="text-primary hover:underline"
        >
          aifeefee70@gmail.com
        </a>
        .
      </p>

      <p className="mt-12 border-t border-border pt-6 text-sm">
        <Link href="/" className="text-primary hover:underline">
          &larr; Back to home
        </Link>
      </p>
    </main>
  );
}

function PrivacyZh() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <h1 className="mb-2 text-4xl font-bold tracking-tight">隐私政策</h1>
      <p className="mb-10 text-sm text-muted-foreground">
        最后更新：2026 年 7 月 18 日
      </p>

      <p className={pClass}>
        WriteFit（下称“我们”）是一个 AI 写作教练，帮助你建立每日写作习惯。本隐私政策说明我们收集哪些数据、为何收集，以及你对自己的信息拥有哪些权利。
      </p>

      <h2 className={h2Class}>1. 我们收集的数据</h2>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">账户信息。</strong>
          当你使用 Google 登录时，我们会从 Google 获取你的邮箱地址、姓名和头像。如果你使用邮箱和密码注册，我们会存储你的邮箱地址和加密后的密码。
        </li>
        <li>
          <strong className="text-foreground">写作内容。</strong>
          你在 WriteFit 中撰写的练习、草稿、句子和灵感会被保存，以便你回顾和继续训练。
        </li>
        <li>
          <strong className="text-foreground">训练记录。</strong>
          你的练习历史、连续天数、进度统计和 AI 反馈结果。
        </li>
        <li>
          <strong className="text-foreground">AI 配置。</strong>
          你的 AI 服务商设置（例如 API 密钥、模型选择和自定义端点）仅存储在你浏览器的
          localStorage 中，绝不会发送或存储到我们的服务器。
        </li>
      </ul>

      <h2 className={h2Class}>2. 我们如何使用你的数据</h2>
      <ul className={ulClass}>
        <li>提供并维护写作训练服务。</li>
        <li>展示你的练习历史、进度和连续天数。</li>
        <li>通过你配置的 AI 服务商为你的写作生成反馈。</li>
        <li>了解产品的使用情况，以便改进产品。</li>
      </ul>

      <h2 className={h2Class}>3. 第三方服务</h2>
      <ul className={ulClass}>
        <li>
          <strong className="text-foreground">Cloudflare。</strong>
          WriteFit 托管在 Cloudflare Workers 上，你的账户和写作数据存储在
          Cloudflare D1 数据库中。
        </li>
        <li>
          <strong className="text-foreground">Google OAuth。</strong>
          用于登录。Google 会向我们提供你的基本资料信息（邮箱、姓名、头像）。
        </li>
        <li>
          <strong className="text-foreground">
            第三方 AI API（BYOK，自带密钥）。
          </strong>
          WriteFit 采用“自带密钥”模式：你使用自己的 API
          密钥配置自己的 AI 服务商（例如 OpenAI 或
          Anthropic）。当你请求 AI 反馈时，你撰写的相关文本会直接从你的浏览器发送到你配置的
          AI 服务商。该传输受你与该服务商之间的协议约束，我们不运营也不控制这些 AI
          服务。
        </li>
        <li>
          <strong className="text-foreground">PostHog。</strong>
          我们使用 PostHog 进行产品分析（页面浏览和功能使用情况），以改进
          WriteFit。
        </li>
      </ul>

      <h2 className={h2Class}>4. Cookie</h2>
      <p className={pClass}>
        我们仅使用保持登录状态所必需的 Cookie（会话
        Cookie）以及记住你的语言偏好的
        Cookie。我们不使用广告或跨站追踪 Cookie。
      </p>

      <h2 className={h2Class}>5. 你的权利：导出与删除</h2>
      <p className={pClass}>
        你可以随时在设置页面导出你的全部数据，也可以在设置页面永久删除账户。删除账户会从我们的数据库中移除你的账户信息、写作内容和训练记录。删除操作不可逆。
      </p>

      <h2 className={h2Class}>6. 数据保留</h2>
      <p className={pClass}>
        只要你的账户处于激活状态，我们就会保留你的数据。如果你删除账户，你的个人数据和写作内容会从我们的在线数据库中移除。备份中的残留副本可能会保留有限的一段时间，之后会被覆盖。
      </p>

      <h2 className={h2Class}>7. 政策变更</h2>
      <p className={pClass}>
        我们可能会不时更新本隐私政策。更新时，我们会修改上方的“最后更新”日期。变更后继续使用
        WriteFit，即表示你接受更新后的政策。
      </p>

      <h2 className={h2Class}>8. 联系我们</h2>
      <p className={pClass}>
        如果你对本隐私政策或你的数据有任何疑问，请联系我们：
        <a
          href="mailto:aifeefee70@gmail.com"
          className="text-primary hover:underline"
        >
          aifeefee70@gmail.com
        </a>
        。
      </p>

      <p className="mt-12 border-t border-border pt-6 text-sm">
        <Link href="/" className="text-primary hover:underline">
          &larr; 返回首页
        </Link>
      </p>
    </main>
  );
}
