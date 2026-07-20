// ====================================================================
// 人物工坊步骤定义（神圣缺陷切入法）
// ====================================================================
// 方法论来源：威尔·斯托尔《写作好故事的科学原理》附录。
// 五步：神圣缺陷 → 创伤起源 → 确认偏差 → 控制理论 → 爆点。
// 每步包含：标题、目标说明、写作指引、启发问题。
// 文案双语内联（与 methodology 页同一模式），避免扩散 i18n 依赖。
// ====================================================================

import type { WorkshopStepId } from "@/lib/ai/prompts";

export interface WorkshopStepDef {
  id: WorkshopStepId;
  titleZh: string;
  titleEn: string;
  goalZh: string;
  goalEn: string;
  instructionZh: string;
  instructionEn: string;
  // 启发问题 / 句式模板（展示在写作框上方）
  promptsZh: string[];
  promptsEn: string[];
  minChars: number; // 最低字数（防空提交，宽松）
}

export const WORKSHOP_STEPS: WorkshopStepDef[] = [
  {
    id: "sacred_flaw",
    titleZh: "第 1 步 · 神圣缺陷",
    titleEn: "Step 1 · The Sacred Flaw",
    goalZh: "找出人物奉为神圣、却是误解的信念。缺陷定义得越严格，人物越独特。",
    goalEn: "Find the belief your character holds sacred that is actually a misunderstanding. The stricter the definition, the more unique the character.",
    instructionZh: "用下面的句式之一（或其变体）写出人物的神圣缺陷，然后用几句话说明：这个信念如何定义了他？别人会怎么向陌生人介绍他？",
    instructionEn: "Use one of the templates below (or a variant) to state the character's sacred flaw, then add a few sentences: how does this belief define them? How would others describe them to a stranger?",
    promptsZh: [
      "只有……的时候，我才是安全的。",
      "人们只会在我……的时候才会爱我。",
      "我有一个绝不能让任何人知道的秘密，那就是……",
      "我生活中最重要的事情，就是……",
      "他人的可憎之处，莫过于……",
    ],
    promptsEn: [
      "I am only safe when …",
      "People will only love me if …",
      "I have a secret no one must ever know: …",
      "The most important thing in my life is …",
      "Nothing is more despicable in other people than …",
    ],
    minChars: 30,
  },
  {
    id: "origin_trauma",
    titleZh: "第 2 步 · 创伤起源",
    titleEn: "Step 2 · The Origin Scene",
    goalZh: "写出缺陷诞生的具体时刻（人生前 20 年）。不是概括，是一个完整场景。",
    goalEn: "Write the specific moment (in the first ~20 years of life) where the flaw was born. Not a summary — one full scene.",
    instructionZh: "把这个时刻写成能看见的场景：时间、地点、在场的人、说了什么话。创伤不必惊天动地——《长日将尽》里史蒂文斯的创伤只是父亲超常的情绪克制。",
    instructionEn: "Write it as a visible scene: time, place, who was present, what was said. It need not be dramatic — Stevens's trauma in The Remains of the Day is merely his father's superhuman restraint.",
    promptsZh: [
      "这件事发生在哪一天的什么时刻？",
      "谁在场？谁说了什么？",
      "排斥感或羞辱感从哪个细节里渗出来？",
    ],
    promptsEn: [
      "On what day, at what moment, did it happen?",
      "Who was present? Who said what?",
      "Through which detail does the sting of exclusion or humiliation seep in?",
    ],
    minChars: 100,
  },
  {
    id: "confirmation",
    titleZh: "第 3 步 · 确认偏差",
    titleEn: "Step 3 · The Confirmation Scene",
    goalZh: "写一个年轻时的关键时刻：人物带着缺陷信念行动，居然成功了——从此把它奉为神圣。",
    goalEn: "Write a key youthful moment: the character acts on the flawed belief and it works — sanctifying it forever.",
    instructionZh: "场景里要有真实的利害，人物要起积极作用。这个事件让人物彻底相信：这个信念就是自己掌控世界的钥匙。依然要写成完整场景。",
    instructionEn: "The scene needs real stakes, with the character playing an active role. This event convinces them the belief is their key to controlling the world. Again: a full scene.",
    promptsZh: [
      "当时什么东西正处于危险之中？",
      "人物靠这个信念达到了什么目的？",
      "成功之后，人物对自己说了什么？",
    ],
    promptsEn: [
      "What was at risk in that moment?",
      "What did the character achieve through the belief?",
      "After it worked, what did they tell themselves?",
    ],
    minChars: 100,
  },
  {
    id: "control_theory",
    titleZh: "第 4 步 · 控制理论",
    titleEn: "Step 4 · The Theory of Control",
    goalZh: "缺陷 + 个性 + 经验 = 人物从世界获取所需的整体策略，以及这套策略塑造的具体生活。",
    goalEn: "Flaw + personality + experience = the character's overall strategy for getting what they want, and the specific life it has built.",
    instructionZh: "回答启发问题，把人物的生活写具体：职业、社区、家庭、朋友和敌人。记住：在人物自己看来，这个缺陷目前整体是有益的。",
    instructionEn: "Answer the probes and make the life concrete: job, neighborhood, family, friends and enemies. Remember: from the character's view, the flaw is currently a net good.",
    promptsZh: [
      "这个缺陷给了人物什么地位和优越感？",
      "它如何塑造了他的职业、感情和朋友圈？",
      "它给了他什么快乐？",
      "违背它行事时，他害怕失去什么？",
      "它给他树了什么敌、埋了什么雷？",
    ],
    promptsEn: [
      "What status and superiority does the flaw confer?",
      "How has it shaped their job, love life, friendships?",
      "What pleasure does it give them?",
      "What do they fear losing if they act against it?",
      "What enemies has it made, what risks has it buried?",
    ],
    minChars: 120,
  },
  {
    id: "ignition",
    titleZh: "第 5 步 · 爆点",
    titleEn: "Step 5 · The Ignition Point",
    goalZh: "一个意外变化精准切中人物最深的缺陷，人物反常应对，欲望点燃为目标——情节开始。",
    goalEn: "An unexpected change strikes the deepest flaw; the character reacts unusually; desire ignites into a goal — the plot begins.",
    instructionZh: "写出这个变化事件和人物的反应。变化可以微不足道，但必须切中缺陷；反应要反常到让读者察觉「有什么不寻常的事要发生」。最后写出由此产生的目标——人物将用错误的方法追求它。",
    instructionEn: "Write the change and the reaction. The change can be tiny but must hit the flaw; the reaction must be unusual enough that a reader senses something extraordinary coming. End with the goal it ignites — which the character will pursue by the wrong means.",
    promptsZh: [
      "为什么这件事偏偏发生在这个人身上？",
      "为什么偏偏是今天？为什么必须立刻行动？",
      "人物最不敢面对的是谁？这件事怎么把他推向那个人？",
      "什么重要的东西正面临巨大危机？",
    ],
    promptsEn: [
      "Why does this event happen to this person, of all people?",
      "Why today of all days? Why must they act now?",
      "Who do they least dare to face — and how does this push them toward that person?",
      "What vital thing is now at risk?",
    ],
    minChars: 100,
  },
];
