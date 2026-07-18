// ====================================================================
// 训练题库
// ====================================================================
// 这里存放所有训练类型的题目
// 系统每天从中选一个题目给用户练习
// ====================================================================

// 训练类型
export const PRACTICE_TYPES = [
  "free_writing", // 自由写作
  "sentence_surgery", // 句子手术
  "specificity_drill", // 具体化训练
  "anti_ai_voice", // 反 AI 腔训练
  "title_drill", // 标题训练
  "opening_drill", // 开头训练
] as const;

export type PracticeType = (typeof PRACTICE_TYPES)[number];

// 训练类型的中英文名称（根据语言返回对应标签）
export function getPracticeTypeLabel(type: PracticeType, locale: "en" | "zh"): string {
  const labelsEn: Record<PracticeType, string> = {
    free_writing: "Free Writing",
    sentence_surgery: "Sentence Surgery",
    specificity_drill: "Specificity Drill",
    anti_ai_voice: "Anti-AI Voice",
    title_drill: "Title Drill",
    opening_drill: "Opening Drill",
  };
  const labelsZh: Record<PracticeType, string> = {
    free_writing: "自由写作",
    sentence_surgery: "句子手术",
    specificity_drill: "具体化训练",
    anti_ai_voice: "反 AI 腔训练",
    title_drill: "标题训练",
    opening_drill: "开头训练",
  };
  return locale === "zh" ? labelsZh[type] : labelsEn[type];
}

// 中文自由写作题库
export const FREE_WRITING_PROMPTS_ZH = [
  "今天有没有一个时刻，你脑子里很清楚，但写出来很模糊？",
  "最近一个让你不舒服的产品细节是什么？",
  "你现在开始怀疑的一个 AI 行业共识是什么？",
  "独立开发者最容易重复犯的一个错误是什么？",
  "你什么时候意识到自己的文字开始变得像 AI？",
  "描述一次 AI 让你更快，但也让你想得更少的经历。",
  "你一直回避写哪个主题？为什么？",
  "你最近最想写诚实的一句话是什么？",
  "你最近用过的一个 AI 工具，哪里让你失望？",
  "你最近读到的一篇文章，哪里写得好，好在哪里？",
  "你的工作里，哪一件事你比大多数人做得好？为什么？",
  "最近有人给了你一个建议，你不同意，为什么？",
];

// 英文自由写作题库
export const FREE_WRITING_PROMPTS_EN = [
  "What was one moment today when your thinking felt clearer than your writing?",
  "Describe one product detail that annoyed you recently.",
  "What is one belief about AI that you are starting to doubt?",
  "What is one mistake indie developers repeatedly make?",
  "When did your writing start to sound too generic?",
  "Describe one moment when AI helped you move faster but think less.",
  "What is one topic you keep avoiding because it feels hard to write?",
  "What is one sentence you wish you could write more honestly?",
];

// 句子手术题目
export const SENTENCE_SURGERY_PROMPTS_ZH = [
  "选一句你最近写的、自己觉得不太对劲的句子。",
  "选一句你工作文档里最像报告腔的句子。",
  "选一句你用 AI 生成后觉得不太像自己的句子。",
];

// 句子手术题目（英文）
export const SENTENCE_SURGERY_PROMPTS_EN = [
  "Pick a sentence you wrote recently that feels off. Analyze it.",
  "Pick a sentence from your work document that sounds too corporate.",
  "Pick a sentence you generated with AI that doesn't sound like you.",
];

// 具体化训练题目
export const SPECIFICITY_DRILL_PROMPTS_ZH = [
  "写一段关于你最近做的一个项目的描述，但不要用任何抽象词。",
  "描述你今天早上做的第一件事，只用具体动作。",
  "写一段关于一个产品的评价，每个判断都要附带一个具体例子。",
];

// 具体化训练题目（英文）
export const SPECIFICITY_DRILL_PROMPTS_EN = [
  "Describe a project you worked on recently, without using any abstract words.",
  "Describe the first thing you did this morning, using only concrete actions.",
  "Review a product you use. Every claim must come with a specific example.",
];

// 反 AI 腔训练题目
export const ANTI_AI_VOICE_PROMPTS_ZH = [
  "写一段关于 AI 对你工作影响的文字，但不要用任何 AI 常用词。",
  "写一段产品介绍，但不用'赋能'、'闭环'、'重塑'这些词。",
  "写一段关于你行业的看法，但每句话都必须有'我'。",
];

// 反 AI 腔训练题目（英文）
export const ANTI_AI_VOICE_PROMPTS_EN = [
  "Write about AI's impact on your work, without using any common AI buzzwords.",
  "Write a product description without using 'empower', 'seamless', 'robust', or 'comprehensive'.",
  "Write about your industry. Every sentence must contain 'I' or 'we'.",
];

// 标题训练题目（中文）
export const TITLE_DRILL_PROMPTS_ZH = [
  "为同一篇文章写 5 个不同的标题。哪个让你自己想点进去？",
  "把一个无聊的标题改得具体，但不能变成标题党。",
  "写一个标题，提出一个读者真的想过的问题。",
];

// 标题训练题目（英文）
export const TITLE_DRILL_PROMPTS_EN = [
  "Write 5 different titles for the same blog post. Which one makes you want to click?",
  "Take a boring title and make it specific without being clickbait.",
  "Write a title that asks a question your reader has actually wondered about.",
];

// 开头训练题目（中文）
export const OPENING_DRILL_PROMPTS_ZH = [
  "写一个让人停下滚动的开头段落。",
  "为同一篇文章写三个不同的开头：一个问题、一个场景、一个大胆的判断。",
  "用一个具体的个人故事重写一个无聊的开头。",
];

// 开头训练题目（英文）
export const OPENING_DRILL_PROMPTS_EN = [
  "Write an opening paragraph that makes a reader stop scrolling.",
  "Write three different openings for the same article: a question, a scene, and a bold claim.",
  "Rewrite a boring opening using a specific personal anecdote.",
];

// 根据星期几选择训练类型（MVP 简单轮换）
export function getPracticeTypeByDate(date: Date): PracticeType {
  const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ...
  const schedule: PracticeType[] = [
    "free_writing", // 周日
    "free_writing", // 周一
    "sentence_surgery", // 周二
    "specificity_drill", // 周三
    "anti_ai_voice", // 周四
    "title_drill", // 周五
    "opening_drill", // 周六
  ];
  return schedule[dayOfWeek];
}

// 每种训练类型的最低字数要求
// 专项训练（句子手术、标题）产出天然较短，不能用统一的高门槛
export const MIN_WORDS_BY_TYPE: Record<PracticeType, number> = {
  free_writing: 50,
  sentence_surgery: 10,
  specificity_drill: 40,
  anti_ai_voice: 40,
  title_drill: 15,
  opening_drill: 30,
};

// 获取某个训练类型的题库（按语言）
function getPromptsForType(type: PracticeType, locale: "en" | "zh"): string[] {
  switch (type) {
    case "free_writing":
      return locale === "zh" ? FREE_WRITING_PROMPTS_ZH : FREE_WRITING_PROMPTS_EN;
    case "sentence_surgery":
      return locale === "zh" ? SENTENCE_SURGERY_PROMPTS_ZH : SENTENCE_SURGERY_PROMPTS_EN;
    case "specificity_drill":
      return locale === "zh" ? SPECIFICITY_DRILL_PROMPTS_ZH : SPECIFICITY_DRILL_PROMPTS_EN;
    case "anti_ai_voice":
      return locale === "zh" ? ANTI_AI_VOICE_PROMPTS_ZH : ANTI_AI_VOICE_PROMPTS_EN;
    case "title_drill":
      return locale === "zh" ? TITLE_DRILL_PROMPTS_ZH : TITLE_DRILL_PROMPTS_EN;
    case "opening_drill":
      return locale === "zh" ? OPENING_DRILL_PROMPTS_ZH : OPENING_DRILL_PROMPTS_EN;
    default:
      return locale === "zh" ? FREE_WRITING_PROMPTS_ZH : FREE_WRITING_PROMPTS_EN;
  }
}

// 根据训练类型随机选一个题目（开发演示用）
export function getRandomPrompt(
  type: PracticeType,
  locale: "en" | "zh" = "en"
): string {
  const prompts = getPromptsForType(type, locale);
  return prompts[Math.floor(Math.random() * prompts.length)];
}

// 确定性选题：同一个 seed（用户 ID + 日期）永远得到同一道题
// 这样"今日训练"在刷新、换设备后都保持不变
export function getDailyPrompt(
  type: PracticeType,
  locale: "en" | "zh",
  seed: string
): string {
  const prompts = getPromptsForType(type, locale);
  const key = `${type}:${locale}:${seed}`;
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) >>> 0;
  }
  return prompts[hash % prompts.length];
}
