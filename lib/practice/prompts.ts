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

// 训练类型的中文名称
export const PRACTICE_TYPE_LABELS: Record<PracticeType, string> = {
  free_writing: "自由写作",
  sentence_surgery: "句子手术",
  specificity_drill: "具体化训练",
  anti_ai_voice: "反 AI 腔训练",
  title_drill: "标题训练",
  opening_drill: "开头训练",
};

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

// 具体化训练题目
export const SPECIFICITY_DRILL_PROMPTS_ZH = [
  "写一段关于你最近做的一个项目的描述，但不要用任何抽象词。",
  "描述你今天早上做的第一件事，只用具体动作。",
  "写一段关于一个产品的评价，每个判断都要附带一个具体例子。",
];

// 反 AI 腔训练题目
export const ANTI_AI_VOICE_PROMPTS_ZH = [
  "写一段关于 AI 对你工作影响的文字，但不要用任何 AI 常用词。",
  "写一段产品介绍，但不用'赋能'、'闭环'、'重塑'这些词。",
  "写一段关于你行业的看法，但每句话都必须有'我'。",
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
    "free_writing", // 周六
  ];
  return schedule[dayOfWeek];
}

// 根据训练类型随机选一个题目
export function getRandomPrompt(
  type: PracticeType,
  language: "zh" | "en" = "zh"
): string {
  let prompts: string[];
  switch (type) {
    case "free_writing":
      prompts = language === "zh" ? FREE_WRITING_PROMPTS_ZH : FREE_WRITING_PROMPTS_EN;
      break;
    case "sentence_surgery":
      prompts = SENTENCE_SURGERY_PROMPTS_ZH;
      break;
    case "specificity_drill":
      prompts = SPECIFICITY_DRILL_PROMPTS_ZH;
      break;
    case "anti_ai_voice":
      prompts = ANTI_AI_VOICE_PROMPTS_ZH;
      break;
    default:
      prompts = FREE_WRITING_PROMPTS_ZH;
  }
  return prompts[Math.floor(Math.random() * prompts.length)];
}
