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
  // —— 叙事训练轨道（方法论来源：斯托尔、勒古恩、大泽在昌、维兰德）——
  "premise_drill", // 前提句训练（维兰德：「如果」问句 → 一句话前提）
  "pov_shift", // 视角改写（勒古恩练习七）
  "dialogue_only", // 纯对话（勒古恩练习九 A&B）
  "cut_half", // 砍一半（勒古恩练习十 + 契诃夫）
  "expectation_twist", // 读者期待→反转（维兰德 + 大泽「公平的规则」）
] as const;

// 叙事类训练类型（评测时注入叙事问题清单 + 大泽式五项评级）
export const NARRATIVE_PRACTICE_TYPES: readonly string[] = [
  "premise_drill",
  "pov_shift",
  "dialogue_only",
  "cut_half",
  "expectation_twist",
];

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
    premise_drill: "Premise Drill",
    pov_shift: "POV Shift",
    dialogue_only: "Dialogue Only",
    cut_half: "Cut It in Half",
    expectation_twist: "Expectation Twist",
  };
  const labelsZh: Record<PracticeType, string> = {
    free_writing: "自由写作",
    sentence_surgery: "句子手术",
    specificity_drill: "具体化训练",
    anti_ai_voice: "反 AI 腔训练",
    title_drill: "标题训练",
    opening_drill: "开头训练",
    premise_drill: "前提句训练",
    pov_shift: "视角改写",
    dialogue_only: "纯对话训练",
    cut_half: "砍一半训练",
    expectation_twist: "期待反转训练",
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
// 升级依据（斯托尔《写作好故事的科学原理》）：大脑被"意外变化"和"信息缺口"抓住。
export const OPENING_DRILL_PROMPTS_ZH = [
  "写一个让人停下滚动的开头段落。",
  "为同一篇文章写三个不同的开头：一个问题、一个场景、一个大胆的判断。",
  "用一个具体的个人故事重写一个无聊的开头。",
  "写一个开头段：在前三句里让一件日常但意外的小变化发生（门没锁、电话响了一声就挂、常坐的位置被人占了），并让人物做出一个反常的反应。",
  "写一个开头段，故意留下一个信息缺口：读者看得到发生了什么，但不知道为什么，必须往下读才能知道。",
  "写一个开头段，第一句就是变化发生的瞬间，不要任何背景铺垫。背景信息最多只允许漏出一句。",
];

// 开头训练题目（英文）
export const OPENING_DRILL_PROMPTS_EN = [
  "Write an opening paragraph that makes a reader stop scrolling.",
  "Write three different openings for the same article: a question, a scene, and a bold claim.",
  "Rewrite a boring opening using a specific personal anecdote.",
  "Write an opening paragraph where a small but unexpected change happens within the first three sentences (a door left unlocked, a phone that rings once and stops), and a person reacts in an unusual way.",
  "Write an opening paragraph that leaves a deliberate information gap: the reader sees what happened but not why, and has to keep reading to find out.",
  "Write an opening paragraph whose first sentence is the moment something changes. No setup allowed — at most one sentence of background may leak in.",
];

// ====================================================================
// 叙事训练轨道题库
// ====================================================================

import { buildPremisePrompts } from "./situations";

// 前提句训练（维兰德《小说的骨架》：「如果」问句 → 一句话前提）
// 用户产出：一句话，包含【具体人物 + 想要什么 + 冲突/阻碍 + 失败的代价】
export const PREMISE_DRILL_PROMPTS_ZH = [
  "「如果一个小镇上所有人都在同一晚做了同一个梦，会怎样？」把它扩写成一句话前提：具体人物 + 想要什么 + 阻碍是什么 + 失败会失去什么。",
  "「如果一位守灯塔的人发现塔上的灯每晚都在自动给某个人发信号，会怎样？」写出一句话前提，四要素齐全：人物、目标、冲突、代价。",
  "「如果一个外卖骑手连续七天接到同一个不存在的地址的订单，会怎样？」写出一句话前提，人物要具体到职业和性格。",
  "「如果一个记账 App 开始记录你从没花过的钱，会怎样？」写出一句话前提，读完这句话就能想象出整个故事的形状。",
  "「如果一位年迈的钟表匠收到一块永远快一小时的表，而它从不出错？」写出一句话前提：谁、想要什么、被什么挡住、输了会怎样。",
  "自拟一个「如果」问句（从你熟悉的行业或生活里取材），然后把它写成一句话前提：具体人物 + 目标 + 冲突 + 代价。",
  "「如果一个从不撒谎的公务员发现，自己每说一句真话，城市里就有一盏灯熄灭？」写出一句话前提，四要素缺一不可。",
  "「如果一对老夫妻发现家里的老猫会在每次有人要说谎之前离开房间？」写出一句话前提，人物、目标、冲突、代价都要落实。",
];

export const PREMISE_DRILL_PROMPTS_EN = [
  "\"What if everyone in a small town had the same dream on the same night?\" Expand it into a one-sentence premise: a specific character + what they want + what stands in the way + what they lose if they fail.",
  "\"What if a lighthouse keeper discovered the lamp was signaling one particular person every night?\" Write a one-sentence premise with all four elements: character, goal, conflict, stakes.",
  "\"What if a delivery rider kept receiving orders for the same address that doesn't exist, seven days in a row?\" Write a one-sentence premise; make the character specific down to job and temperament.",
  "\"What if a budgeting app started logging money you never spent?\" Write a one-sentence premise so complete that the shape of the whole story is visible in it.",
  "\"What if an old watchmaker received a watch that runs exactly one hour fast — and is never wrong?\" Write a one-sentence premise: who, wants what, blocked by what, loses what.",
  "Invent your own \"what if\" question from a field or life you know well, then turn it into a one-sentence premise: specific character + goal + conflict + stakes.",
  "\"What if a civil servant who never lies discovered that every true sentence he speaks turns off one light in the city?\" Write a one-sentence premise with all four elements.",
];

// 前提句题库扩充：手写题 + 情境库（灵感宝库风格）确定性生成的题
// 展开在模块加载时完成，getDailyPrompt 的确定性不受影响
export const PREMISE_DRILL_PROMPTS_ALL_ZH = [
  ...PREMISE_DRILL_PROMPTS_ZH,
  ...buildPremisePrompts("zh"),
];
export const PREMISE_DRILL_PROMPTS_ALL_EN = [
  ...PREMISE_DRILL_PROMPTS_EN,
  ...buildPremisePrompts("en"),
];

// 期待反转训练（维兰德「读者期待清单」+ 大泽「公平的规则」「写读者之未料」）
// 题式：给一个常见情境 → 先列读者的三条期待 → 打破其中一条写一小段场景
export const EXPECTATION_TWIST_PROMPTS_ZH = [
  "情境：侦探把所有嫌疑人召集到客厅宣布真凶。先写下读者对这个场景的三条期待（每条一行），然后选一条打破，写一小段场景。反转必须公平——回头看时读者要能发现你早已留了线索。",
  "情境：婚礼上，主持人问「有人反对吗」。列出读者的三条期待，打破其中一条，写一小段场景。禁止无厘头——反转要出自人物的欲望或缺陷，不是天上掉下来的。",
  "情境：老人临终前把子女叫到床前，要宣布遗产分配。列三条读者期待，打破一条，写一小段场景。打破后的走向必须比原期待更让人想往下读。",
  "情境：深夜加油站，一辆车缓缓驶入，车灯坏了一只。列三条读者期待，打破一条，写一小段场景。你打破的如果是「危险将至」，就要给出一个更有意思的东西来代替紧张感。",
  "情境：学徒终于要在师傅面前露一手。列三条读者期待，打破一条，写一小段场景。注意公平规则：反转的种子要埋在场景里，不能靠隐瞒关键信息骗读者。",
  "情境：有人在旧货市场用极低的价格买到一件明显值钱的东西。列三条读者期待，打破一条，写一小段场景。",
];

export const EXPECTATION_TWIST_PROMPTS_EN = [
  "Situation: the detective gathers every suspect in the drawing room to reveal the culprit. First list three things the reader expects from this scene (one per line), then break one of them and write a short scene. The twist must be fair — looking back, the reader should find you planted the clue.",
  "Situation: at a wedding, the officiant asks if anyone objects. List three reader expectations, break one, write a short scene. No randomness — the twist must grow from a character's desire or flaw, not fall from the sky.",
  "Situation: a dying parent calls the children to the bedside to announce the inheritance. List three reader expectations, break one, write a short scene. The broken path must be more compelling than the expected one.",
  "Situation: a car with one dead headlight rolls slowly into a late-night gas station. List three reader expectations, break one, write a short scene. If you break 'danger is coming', replace the tension with something more interesting.",
  "Situation: the apprentice finally performs in front of the master. List three reader expectations, break one, write a short scene. Fair-play rule: the seed of the twist must be planted in the scene — no cheating by hiding key information.",
  "Situation: someone buys an obviously valuable object for almost nothing at a flea market. List three reader expectations, break one, write a short scene.",
];

// 视角改写（勒古恩《写小说最重要的十件事》练习七）
// 同一场景，先用参与者 A 的有限第三人称写，再换 B 视角重写
export const POV_SHIFT_PROMPTS_ZH = [
  "场景：超市收银台前，两个人为插队争执，旁边一个孩子在看。先用其中一人的有限第三人称写约 150 字，空一行，再换另一个人的视角把同一场景重写一遍。少用或不用对话。",
  "场景：家庭饭桌上，母亲宣布要卖掉老房子，成年的儿女反应不一。先用母亲的有限第三人称写一遍，空一行，再用其中一个子女的视角重写。",
  "场景：深夜出租车上，乘客发现司机没有走导航的路线。先用乘客视角写一遍，空一行，再用司机视角重写——司机绕路有一个完全无害的理由。",
  "场景：电梯里，同事 A 撞见同事 B 抱着一箱私人物品。先用 A 的有限第三人称写一遍，空一行，再用 B 的视角重写。两版里人物注意到的细节应该不同。",
  "场景：小区楼下，一位老人坚持不让搬家公司把一棵盆栽搬上车。先用老人视角写，空一行，再用搬家工人的视角重写。",
  "场景：宠物医院候诊室，两位主人的狗打了起来。先用其中一位主人的有限第三人称写，空一行，再换另一位重写。每个视角只能知道这个人物能知道的事。",
];

export const POV_SHIFT_PROMPTS_EN = [
  "Scene: two people argue over queue-jumping at a supermarket checkout while a child watches. Write it in limited third person from one participant (about 120 words), leave a blank line, then rewrite the same scene from the other participant's point of view. Use little or no dialogue.",
  "Scene: at a family dinner, a mother announces she is selling the old house; her grown children react differently. Write it from the mother's limited third person, blank line, then rewrite from one child's point of view.",
  "Scene: late at night, a taxi passenger notices the driver has left the navigation route. Write it from the passenger's point of view, blank line, then rewrite from the driver's — who has a completely harmless reason.",
  "Scene: in an elevator, coworker A runs into coworker B holding a box of personal belongings. Write it from A's limited third person, blank line, then from B's. The details each version notices should differ.",
  "Scene: outside an apartment building, an old man refuses to let the movers load one potted plant onto the truck. Write from the old man's point of view, blank line, then from a mover's.",
  "Scene: two dogs start fighting in a vet's waiting room. Write from one owner's limited third person, blank line, then the other's. Each viewpoint may only know what that character can know.",
];

// 纯对话训练（勒古恩练习九 A&B：只有两人的对话，没有任何舞台说明）
export const DIALOGUE_ONLY_PROMPTS_ZH = [
  "只用两个人的对话写一个场景：车在高速上快没油了，两人对下一步做法有分歧。不加叙述、不加动作描写、不写名字，只写 A：、B： 开头的台词。读者要能从话里分清两人是谁、什么关系。",
  "只用对话写：两人在收拾一位刚去世亲人的遗物，一人想留下某样东西，一人想处理掉。禁止说明式对话——不要让人物说出双方都已知道的事。",
  "只用对话写：面试快结束时，面试官问了一个明显越界的问题。两个声音要一听就能分开，不靠名字。",
  "只用对话写：一对合伙人对账时发现少了一笔钱。让紧张感只从台词的节奏和内容里出来，不许有任何旁白。",
  "只用对话写：搬进新家的第一晚，一人坚持听到了墙里有声音，另一人不信。危机要在对话里逐渐升级。",
  "只用对话写：机场广播延误了最后一班飞机，一对多年未见的旧友在登机口认出了彼此。两人各自隐瞒着一件事——但不许直接说出来。",
];

export const DIALOGUE_ONLY_PROMPTS_EN = [
  "Using only dialogue between two people, write a scene: the car is nearly out of gas on the highway and they disagree about what to do next. No narration, no stage directions, no names — just lines starting with A: and B:. The reader must be able to tell who is who and what their relationship is from the talk alone.",
  "Dialogue only: two people are sorting a recently deceased relative's belongings; one wants to keep something, the other wants it gone. No expository dialogue — never let a character state what both already know.",
  "Dialogue only: near the end of a job interview, the interviewer asks a clearly inappropriate question. The two voices must be distinguishable without names.",
  "Dialogue only: two business partners going over the books discover money is missing. The tension must come entirely from the rhythm and content of the lines.",
  "Dialogue only: first night in a new home; one person insists there's a sound inside the wall, the other doesn't believe it. Let the crisis escalate through the dialogue.",
  "Dialogue only: the last flight is delayed and two old friends recognize each other at the gate after many years. Each is hiding one thing — and neither may say it outright.",
];

// 砍一半训练（勒古恩练习十 + 契诃夫「扔掉前三页」）
// 利用现有 write → diagnose → revise → compare 流程：
// 写作阶段放开写，修改阶段砍到一半，compare 阶段自动对比
export const CUT_HALF_PROMPTS_ZH = [
  "用 10 分钟放开写一段 300 字左右的段落，主题：你搬过的一次家。想到什么写什么，不用克制。诊断后，在修改稿里把它砍到 150 字以内：删掉重复、解释和铺垫，保住具体细节——不许用概括替代细节。",
  "放开写 300 字：一次失败的合作。不用克制。之后在修改稿里砍掉一半字数，砍完后叙事必须依然清晰、情感冲击必须依然在，禁止用「总之」「不知为何」蒙混。",
  "放开写 300 字：你最熟悉的一条街。之后在修改稿里删到一半。检查你删的是浮沫（重复、空话、过度解释）还是真金（细节、动作、画面）——真金必须留下。",
  "放开写 300 字：一次没赶上的火车/航班。之后砍到一半。契诃夫说：先扔掉开头——试试把你最舍不得的前几句删掉，看看剩下的部分是否自己缝合了起来。",
  "放开写 300 字：一个你观察过很久的陌生人。之后砍到一半。如果有对话，对话也要砍掉一半。",
  "放开写 300 字：你第一次挣到钱的经历。之后砍到一半，保留所有具体名词和动作，优先删形容词、副词和解释性句子。",
];

export const CUT_HALF_PROMPTS_EN = [
  "Spend 10 minutes writing about 250 words, uncensored, on: a move to a new home. Write loose — don't hold back. After the diagnosis, cut it to under 125 words in your revision: delete repetition, explanation, and setup, but keep the concrete details — never replace a detail with a summary.",
  "Write 250 loose words on: a collaboration that failed. Then cut the word count in half in your revision. The narrative must stay clear and the emotional impact must survive. No cheating with 'somehow' or 'in the end'.",
  "Write 250 loose words on: the street you know best. Then cut it in half. Check whether you cut froth (repetition, filler, over-explaining) or gold (details, actions, images) — the gold must stay.",
  "Write 250 loose words on: a train or flight you missed. Then cut it in half. Chekhov's advice: throw away the opening first — try deleting the sentences you love most at the start and see if the rest seals itself together.",
  "Write 250 loose words on: a stranger you have watched for a long time. Then cut it in half. If there is dialogue, cut the dialogue in half too.",
  "Write 250 loose words on: the first money you ever earned. Then cut it in half, keeping every concrete noun and action; delete adjectives, adverbs, and explanatory sentences first.",
];

// 根据日期选择训练类型：表达周与叙事周隔周交替
// - 表达周：原有 6 类轮换（非虚构表达力）
// - 叙事周：前提句/视角/纯对话/砍一半 + 每周保留反 AI 腔与开头训练
// 用「自 epoch 起的第几周」的奇偶决定，跨年也不会跳变
export function getPracticeTypeByDate(date: Date): PracticeType {
  const dayOfWeek = date.getDay(); // 0=周日, 1=周一, ...
  // 周序号与 dayOfWeek 同用本地时间，且以周日为一周起点
  // （epoch 1970-01-01 是周四，+4 把周界对齐到周日，避免周中翻转）
  const localDays = Math.floor(
    (date.getTime() - date.getTimezoneOffset() * 60 * 1000) / (24 * 60 * 60 * 1000)
  );
  const weekIndex = Math.floor((localDays + 4) / 7);
  const expressionWeek: PracticeType[] = [
    "free_writing", // 周日
    "free_writing", // 周一
    "sentence_surgery", // 周二
    "specificity_drill", // 周三
    "anti_ai_voice", // 周四
    "title_drill", // 周五
    "opening_drill", // 周六
  ];
  // 叙事周的周一在「前提句」和「期待反转」之间隔次轮换
  // （连续的叙事周 weekIndex 为 1,3,5...，floor(weekIndex/2) 依次 +1）
  const narrativeMonday: PracticeType =
    Math.floor(weekIndex / 2) % 2 === 0 ? "premise_drill" : "expectation_twist";
  const narrativeWeek: PracticeType[] = [
    "free_writing", // 周日
    narrativeMonday, // 周一（前提句 / 期待反转 轮换）
    "pov_shift", // 周二
    "dialogue_only", // 周三
    "anti_ai_voice", // 周四（核心训练每周保留）
    "cut_half", // 周五
    "opening_drill", // 周六（已升级为钩子/好奇心缺口标准）
  ];
  const schedule = weekIndex % 2 === 0 ? expressionWeek : narrativeWeek;
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
  premise_drill: 15, // 产出只有一句话
  pov_shift: 80, // 同一场景两个版本
  dialogue_only: 60,
  cut_half: 100, // 写作阶段是放开写的初稿
  expectation_twist: 80, // 三条期待清单 + 一小段场景
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
    case "premise_drill":
      return locale === "zh" ? PREMISE_DRILL_PROMPTS_ALL_ZH : PREMISE_DRILL_PROMPTS_ALL_EN;
    case "expectation_twist":
      return locale === "zh" ? EXPECTATION_TWIST_PROMPTS_ZH : EXPECTATION_TWIST_PROMPTS_EN;
    case "pov_shift":
      return locale === "zh" ? POV_SHIFT_PROMPTS_ZH : POV_SHIFT_PROMPTS_EN;
    case "dialogue_only":
      return locale === "zh" ? DIALOGUE_ONLY_PROMPTS_ZH : DIALOGUE_ONLY_PROMPTS_EN;
    case "cut_half":
      return locale === "zh" ? CUT_HALF_PROMPTS_ZH : CUT_HALF_PROMPTS_EN;
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
