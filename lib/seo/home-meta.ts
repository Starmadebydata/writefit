// ====================================================================
// 首页 SEO 文案（唯一权威来源）
// ====================================================================
// layout.tsx 和 page.tsx 的 generateMetadata 都从这里取 title/description，
// 保证 <title>、meta description、og:*、twitter:* 三处始终一致。
// 目标关键词：ai writing coach / ai writing training / daily writing practice
// ====================================================================

export const HOME_META = {
  titles: {
    en: "WriteFit — AI Writing Coach & Daily Writing Training App",
    zh: "WriteFit — AI 写作教练与每日写作训练",
  },
  descriptions: {
    en: "WriteFit is an AI writing coach for daily writing practice. Get AI writing training with real feedback on your own drafts — 15 minutes a day, no ghostwriting.",
    zh: "WriteFit 是 AI 写作教练，提供每日写作训练：真实 AI 反馈、逐句修改、清晰的提升路径。每天 15 分钟，不代写，只让你写得更好。",
  },
  keywords: {
    en: [
      "ai writing coach",
      "ai writing training",
      "daily writing practice",
      "writing exercises",
      "improve writing with ai",
    ],
    zh: ["AI 写作教练", "写作训练", "每日写作练习", "写作练习", "提升写作"],
  },
} as const;
