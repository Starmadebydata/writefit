// ====================================================================
// AI 模拟反馈工具（双语版）
// ====================================================================
// 当没有配置 DEEPSEEK_API_KEY 时，用这个工具生成模拟反馈
// 这样开发阶段也能看到完整的训练流程效果
// 等上线配置好 API Key 后，自动切换到真实 AI
//
// 支持中英文双语：locale 参数为 "en"（默认）或 "zh"
// JSON 结构（key）保持不变，只有 value（内容）随语言变化
// ====================================================================

import type {
  DiagnoseFeedback,
  AntiAIVoiceFeedback,
  SentenceSurgeryFeedback,
  CompareRevisionFeedback,
  WorkshopFeedback,
  StoryScores,
} from "./schemas";
import { NARRATIVE_PRACTICE_TYPES } from "@/lib/practice/prompts";

// 语言类型
export type MockLocale = "en" | "zh";

// 叙事类练习的模拟五项评级（演示用中性评级）
function mockStoryScores(practiceType?: string): StoryScores | undefined {
  if (!practiceType || !NARRATIVE_PRACTICE_TYPES.includes(practiceType)) return undefined;
  return {
    plot: "pass",
    character: "weak",
    prose: "pass",
    dialogue: practiceType === "dialogue_only" ? "pass" : "na",
    concept: "pass",
  };
}

// 生成模拟的诊断反馈
export function mockDiagnose(
  text: string,
  locale: MockLocale = "en",
  practiceType?: string
): DiagnoseFeedback {
  // 简单分析文本特征
  const sentences = text.split(/[。.！!？?\n]+/).filter((s) => s.trim().length > 5);
  const wordCount = text.length;

  // 找一个看起来最空泛的句子（最长的句子往往是空泛的）
  const sortedByLength = [...sentences].sort((a, b) => b.length - a.length);
  const mostAiLike = sortedByLength[0]?.trim() ?? text.slice(0, 50);

  // 找一个看起来最具体的句子（包含数字或具体名词的）
  const specificSentence = sentences.find((s) =>
    locale === "zh"
      ? /\d|我|今天|昨天|上周|这次|这个/.test(s)
      : /\d|I|today|yesterday|last week|this time|this/.test(s)
  );
  const bestSentence = (specificSentence ?? sentences[0] ?? text.slice(0, 50)).trim();

  if (locale === "zh") {
    return {
      top_issues: [
        {
          issue: "表达过于抽象，缺少具体场景",
          evidence: mostAiLike.slice(0, 80),
          why_it_matters: "读者无法在你的文字中看到画面，无法产生代入感。抽象的表达让人读完就忘。",
          revision_task: "找一个你亲身经历的具体场景，用'我+动作+细节'的方式重写这段话。",
        },
        {
          issue: "缺少个人判断，读起来像通用观点",
          evidence: sentences[1]?.trim().slice(0, 80) ?? text.slice(20, 80),
          why_it_matters: "没有个人判断的文字，任何人都能写，也就没有人会想读你写的版本。",
          revision_task: "在这段话后面加一句'我认为...'，说出你自己的真实看法，哪怕不完美。",
        },
        {
          issue: "句子节奏单一，缺少长短变化",
          evidence: sentences[2]?.trim().slice(0, 80) ?? text.slice(40, 100),
          why_it_matters: "所有句子长度接近时，阅读节奏会变得催眠。短句能制造强调，长句能展开论证。",
          revision_task: "把其中一句长句拆成两个短句，或者把两个短句合成一个有呼吸感的长句。",
        },
      ],
      best_sentence: bestSentence,
      most_ai_like_sentence: mostAiLike.slice(0, 100),
      next_revision_goal: "在修改稿中加入一个具体场景和个人判断，让文字只属于你。",
      example_revision: "（模拟示范）把抽象描述换成具体场景，例如：「那天下午三点，我盯着屏幕，第三次把同一段话删掉重写。」配置 AI 服务后，这里会显示针对你原文的完整示范改写。",
      scores: {
        clarity: Math.min(70, 40 + Math.floor(wordCount / 10)),
        specificity: Math.min(60, 30 + Math.floor(sentences.length * 3)),
        voice: Math.min(55, 25 + Math.floor(sentences.length * 2)),
        ai_like: Math.min(80, 40 + Math.floor(wordCount / 8)),
      },
      story_scores: mockStoryScores(practiceType),
    };
  }

  // English version
  return {
    top_issues: [
      {
        issue: "Vague claims without evidence",
        evidence: mostAiLike.slice(0, 80),
        why_it_matters: "Readers can't picture what you're describing. Abstract statements are forgotten the moment they're read.",
        revision_task: "Find a specific scene you personally experienced and rewrite this passage using 'I + action + detail'.",
      },
      {
        issue: "Missing personal judgment, reads like a generic opinion",
        evidence: sentences[1]?.trim().slice(0, 80) ?? text.slice(20, 80),
        why_it_matters: "Writing without personal judgment could be produced by anyone, so no one has a reason to read your version.",
        revision_task: "Add an 'I think...' sentence after this passage and state your real opinion, even if it's imperfect.",
      },
      {
        issue: "Monotonous sentence rhythm, no variation in length",
        evidence: sentences[2]?.trim().slice(0, 80) ?? text.slice(40, 100),
        why_it_matters: "When all sentences are similar in length, the reading rhythm becomes hypnotic. Short sentences create emphasis; long ones develop arguments.",
        revision_task: "Split one long sentence into two short ones, or merge two short sentences into one longer, breathing sentence.",
      },
    ],
    best_sentence: bestSentence,
    most_ai_like_sentence: mostAiLike.slice(0, 100),
    next_revision_goal: "Add a concrete scene and a personal judgment to your revision so the words belong only to you.",
    example_revision: "(Mock example) Turn vague description into a concrete scene, e.g. \"At 3pm I deleted and rewrote the same paragraph for the third time.\" Set up your AI service to get a real demonstration revision of your text.",
    scores: {
      clarity: Math.min(70, 40 + Math.floor(wordCount / 10)),
      specificity: Math.min(60, 30 + Math.floor(sentences.length * 3)),
      voice: Math.min(55, 25 + Math.floor(sentences.length * 2)),
      ai_like: Math.min(80, 40 + Math.floor(wordCount / 8)),
    },
    story_scores: mockStoryScores(practiceType),
  };
}

// 生成模拟的人物工坊反馈（平台未配置 Key 时的兜底）
export function mockWorkshopFeedback(text: string, locale: MockLocale = "en"): WorkshopFeedback {
  const firstSentence = text.split(/[。.！!？?\n]/).find((s) => s.trim().length > 3)?.trim() ?? "";
  if (locale === "zh") {
    return {
      what_works: firstSentence ? `「${firstSentence.slice(0, 40)}」——这个起点是具体的。` : "内容太短，还看不出立得住的东西。",
      what_is_generic_or_missing: [
        "（模拟反馈）还缺少可以看见的细节：时间、地点、在场的人、说了什么话。",
      ],
      deepening_questions: [
        "这件事发生在哪一天的什么时刻？当时谁在场？",
        "人物为此付出的具体代价是什么——失去了哪段关系、哪个机会？",
        "如果让人物自己辩护，他会怎么说服你他没有错？",
      ],
      ready_to_continue: text.length > 100,
      next_step_hint: "把概括换成一个能看见的场景，再进入下一步。",
    };
  }
  return {
    what_works: firstSentence ? `"${firstSentence.slice(0, 60)}" — this starting point is concrete.` : "Too short to judge yet.",
    what_is_generic_or_missing: [
      "(Mock feedback) Missing visible detail: when, where, who was present, what was said.",
    ],
    deepening_questions: [
      "On what day, at what moment, did this happen? Who was in the room?",
      "What did it concretely cost the character — which relationship, which opportunity?",
      "If the character defended themselves, how would they convince you they were right?",
    ],
    ready_to_continue: text.length > 100,
    next_step_hint: "Replace the summary with one visible scene before moving on.",
  };
}

// 生成模拟的反 AI 腔检测
export function mockAntiAIVoice(text: string, locale: MockLocale = "en"): AntiAIVoiceFeedback {
  const sentences = text.split(/[。.！!？?\n]+/).filter((s) => s.trim().length > 5);

  if (locale === "zh") {
    const bannedPhrases = [
      "值得注意的是", "从某种意义上说", "在当今时代", "深刻改变",
      "赋能", "生态", "闭环", "重塑", "这不仅体现了", "提供了新的可能性",
    ];
    const found = bannedPhrases.filter((p) => text.includes(p));

    const flagged = sentences
      .filter((s) => s.length > 40 || /值得注意|不仅|从而|进而|总之|综上|综上|可以看到/.test(s))
      .slice(0, 3)
      .map((s) => ({
        sentence: s.trim(),
        problem_type: s.length > 50 ? "句子过长" : "模板连接词",
        reason: s.length > 50
          ? "这个句子太长，读者需要反复阅读才能理解，可能是 AI 生成的典型特征。"
          : "使用了常见的 AI 模板连接词，让表达变得空泛。",
        manual_revision_instruction: "把这句话拆短，用你自己的话说一遍。",
      }));

    return {
      ai_like_score: Math.min(85, 35 + found.length * 15 + Math.floor(text.length / 20)),
      flagged_sentences: flagged,
      banned_phrases_found: found,
      one_revision_priority: found.length > 0
        ? `先删掉这些词：${found.join("、")}`
        : "把最长的句子拆成两个短句。",
    };
  }

  // English version
  const bannedPhrases = [
    "it is worth noting that", "in today's world", "plays a crucial role",
    "delve into", "leverage", "ecosystem", "seamless", "reshape",
    "this not only", "opens up new possibilities", "furthermore", "moreover",
  ];
  const found = bannedPhrases.filter((p) => text.toLowerCase().includes(p));

  const flagged = sentences
    .filter((s) => s.length > 80 || /furthermore|moreover|additionally|consequently|in conclusion|it is worth|not only|thereby|thus/.test(s))
    .slice(0, 3)
    .map((s) => ({
      sentence: s.trim(),
      problem_type: s.length > 100 ? "Sentence too long" : "Template transition word",
      reason: s.length > 100
        ? "This sentence is too long; readers have to re-read it to understand, a typical sign of AI-generated text."
        : "Uses a common AI template transition word, making the expression feel generic.",
      manual_revision_instruction: "Shorten this sentence and say it in your own words.",
    }));

  return {
    ai_like_score: Math.min(85, 35 + found.length * 15 + Math.floor(text.length / 20)),
    flagged_sentences: flagged,
    banned_phrases_found: found,
    one_revision_priority: found.length > 0
      ? `First remove these phrases: ${found.join(", ")}`
      : "Split the longest sentence into two shorter ones.",
  };
}

// 生成模拟的句子手术反馈
export function mockSentenceSurgery(text: string, locale: MockLocale = "en"): SentenceSurgeryFeedback {
  if (locale === "zh") {
    const emptyWords = ["其实", "基本上", "一般来说", "可以说", "从某种角度来看", "在某种程度上"];
    const found = emptyWords.filter((w) => text.includes(w));

    return {
      empty_words: found,
      delete_candidates: found,
      abstract_words: ["价值", "意义", "发展", "提升", "优化", "创新"].filter((w) => text.includes(w)),
      missing_specifics: ["具体时间", "具体地点", "具体人物", "具体动作", "具体结果"],
      rhythm_problem: text.length > 60 ? "句子太长，缺少停顿，读者会喘不过气。" : "句子节奏还可以，但可以更有力。",
      revision_task: found.length > 0
        ? `先删掉这些空泛词：${found.join("、")}，然后加一个具体例子。`
        : "给这句话加一个具体场景或数字，让它更有说服力。",
      example_direction: "比如把'很好'改成'好到让我忍不住截图发给朋友'。",
    };
  }

  // English version
  const emptyWords = [
    "actually", "basically", "generally", "arguably", "in a sense",
    "to some extent", "it seems that", "one might say", "essentially", "literally",
  ];
  const found = emptyWords.filter((w) => text.toLowerCase().includes(w));

  return {
    empty_words: found,
    delete_candidates: found,
    abstract_words: ["value", "significance", "development", "improvement", "optimization", "innovation"].filter((w) =>
      text.toLowerCase().includes(w)
    ),
    missing_specifics: ["a specific time", "a specific place", "a specific person", "a specific action", "a specific result"],
    rhythm_problem: text.length > 120 ? "The sentence is too long with no pauses; readers run out of breath." : "The rhythm is okay, but it could be punchier.",
    revision_task: found.length > 0
      ? `First delete these empty words: ${found.join(", ")}; then add a concrete example.`
      : "Add a specific scene or number to this sentence to make it more convincing.",
    example_direction: "For example, change 'very good' to 'so good I screenshotted it and sent it to a friend.'",
  };
}

// 生成模拟的版本对比反馈
export function mockCompareRevision(original: string, revised: string, locale: MockLocale = "en"): CompareRevisionFeedback {
  const originalWords = original.length;
  const revisedWords = revised.length;
  const wordDiff = revisedWords - originalWords;

  if (locale === "zh") {
    return {
      improved: revisedWords !== originalWords,
      summary: wordDiff < 0
        ? "你删减了内容，让表达更精炼了。"
        : wordDiff > 20
          ? "你增加了内容，加入了更多细节。"
          : "你调整了表达方式，但整体长度变化不大。",
      what_improved: ["句子节奏", "个人声音", "具体性"].slice(0, wordDiff < 0 ? 2 : 3),
      what_got_worse: wordDiff > 50 ? ["可能加入了新的空泛内容"] : [],
      specificity_change: wordDiff > 0 ? "提升" : "基本不变",
      voice_change: "提升",
      ai_like_change: "降低",
      next_revision_task: "再读一遍修改稿，找出一个还可以更具体的句子，继续改。",
    };
  }

  // English version
  return {
    improved: revisedWords !== originalWords,
    summary: wordDiff < 0
      ? "You trimmed content, making the expression more concise."
      : wordDiff > 20
        ? "You added content, incorporating more detail."
        : "You adjusted the wording, but the overall length didn't change much.",
    what_improved: ["Sentence rhythm", "Personal voice", "Specificity"].slice(0, wordDiff < 0 ? 2 : 3),
    what_got_worse: wordDiff > 50 ? ["May have introduced new vague content"] : [],
    specificity_change: wordDiff > 0 ? "Improved" : "Roughly unchanged",
    voice_change: "Improved",
    ai_like_change: "Decreased",
    next_revision_task: "Read through the revision once more, find a sentence that could be more specific, and keep editing.",
  };
}
