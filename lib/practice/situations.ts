// ====================================================================
// 叙事情境库（灵感宝库风格）
// ====================================================================
// 方法论来源：弗雷德·怀特《作家的灵感宝库》——按主题类别索引情境，
// 通过「类别 × 具体钩子」组合生成大量前提句训练题。
//
// 生成是确定性的（模块加载时展开为固定数组），
// 因此 getDailyPrompt 的「同一 seed 永远同一题」性质不受影响。
// ====================================================================

// 情境类别（对应灵感宝库的章节主题，每类若干个具体「如果」钩子）
interface SituationCategory {
  key: string;
  whatIfsZh: string[];
  whatIfsEn: string[];
}

export const SITUATION_CATEGORIES: SituationCategory[] = [
  {
    key: "discovery", // 发现或创造
    whatIfsZh: [
      "如果一位图书管理员发现每本被借出又归还的书里都多了一页",
      "如果一位维修工在老居民楼的墙里发现了一套完整的、还在运转的管道系统，却不通向任何地方",
      "如果一位业余天文爱好者发现自家阳台望远镜里的星空比天文台的多一颗星",
    ],
    whatIfsEn: [
      "What if a librarian discovered that every returned book contains one extra page",
      "What if a repairman found a complete, still-running pipe system inside the walls of an old building — leading nowhere",
      "What if an amateur astronomer found one more star in the sky through her balcony telescope than the observatory could see",
    ],
  },
  {
    key: "investigation", // 检查和探索
    whatIfsZh: [
      "如果一位社区调解员发现十年来经手的每起纠纷背后都是同一个人",
      "如果一位小学门口的保安开始调查一个每天准时出现却从不接孩子的老人",
      "如果一位审计员在账目里发现一笔每月固定支出，用途栏永远写着「补偿」",
    ],
    whatIfsEn: [
      "What if a community mediator realized the same person was behind every dispute she had handled for ten years",
      "What if a school security guard began investigating an old man who shows up at the gate every day but never picks up a child",
      "What if an auditor found a fixed monthly payment in the books whose purpose field always reads 'compensation'",
    ],
  },
  {
    key: "escape", // 摆脱或逃离
    whatIfsZh: [
      "如果一位金牌客服决定辞职，却发现公司系统里她的离职申请每次都会自动消失",
      "如果一位靠代写情书为生的人想金盆洗手，最后一位客户却出了十倍价钱",
      "如果一个人搬到新城市想摆脱过去，却发现新邻居订阅了他家乡的地方报纸",
    ],
    whatIfsEn: [
      "What if a star customer-service agent decided to quit, but her resignation kept vanishing from the company system",
      "What if a professional love-letter ghostwriter wanted out, and the final client offered ten times the fee",
      "What if someone moved to a new city to escape the past, only to find the new neighbor subscribes to his hometown newspaper",
    ],
  },
  {
    key: "communication", // 交流
    whatIfsZh: [
      "如果一位手语翻译发现自己翻译的聋人老太太每次都在说谎",
      "如果一位电台深夜主播发现每晚同一时间打进来的听众，说的都是明天才会发生的事",
      "如果一对多年不说话的父子只能通过给同一盆花浇水交流",
    ],
    whatIfsEn: [
      "What if a sign-language interpreter realized the elderly deaf woman she interprets for lies every single time",
      "What if a late-night radio host noticed the caller who phones at the same hour each night describes things that happen the next day",
      "What if a father and son who haven't spoken for years could communicate only by watering the same plant",
    ],
  },
  {
    key: "growth", // 成长
    whatIfsZh: [
      "如果一位五十岁才开始学游泳的会计报名了横渡海峡",
      "如果一个从没赢过一局棋的少年被镇上唯一的棋手收为关门弟子",
      "如果一位害怕当众说话的老师被迫接手学校的辩论队",
    ],
    whatIfsEn: [
      "What if an accountant who learned to swim at fifty signed up to cross the strait",
      "What if a teenager who has never won a single game of chess became the last student of the town's only master",
      "What if a teacher terrified of public speaking was forced to take over the school debate team",
    ],
  },
  {
    key: "secret", // 秘密
    whatIfsZh: [
      "如果一位遗物整理师在客户父亲的遗物里发现了写给自己的信",
      "如果一个小区的业主群里有人每天匿名发布一条只有真正的老住户才能看懂的消息",
      "如果一位婚礼摄影师保存着每场婚礼上没人注意到的同一位宾客的照片",
    ],
    whatIfsEn: [
      "What if an estate cleaner found, among a client's late father's belongings, letters addressed to herself",
      "What if someone in a neighborhood group chat posted a daily anonymous message only true old residents could decode",
      "What if a wedding photographer kept photos of the same unnoticed guest from every wedding he ever shot",
    ],
  },
  {
    key: "threat", // 威胁
    whatIfsZh: [
      "如果一家老面馆收到连续三十天的匿名差评，每条都精确描述了后厨当天的失误",
      "如果一位桥梁工程师发现自己二十年前的计算错误，而那座桥明天要办马拉松",
      "如果一位养蜂人发现蜂群每天清晨排成的图案越来越像一个日期",
    ],
    whatIfsEn: [
      "What if an old noodle shop received anonymous bad reviews thirty days straight, each precisely describing that day's kitchen mistakes",
      "What if a bridge engineer discovered his own calculation error from twenty years ago — and the bridge hosts a marathon tomorrow",
      "What if a beekeeper noticed the morning formation of his bees looks more and more like a date",
    ],
  },
  {
    key: "transformation", // 转化
    whatIfsZh: [
      "如果小区里最凶的物业主任突然开始给每户人家手写道歉信",
      "如果一位以毒舌闻名的餐厅评论家失去了味觉却不敢告诉任何人",
      "如果一个只会照着菜谱做饭的人接手了母亲从不写菜谱的私房菜馆",
    ],
    whatIfsEn: [
      "What if the fiercest property manager in the neighborhood suddenly began hand-writing apology letters to every household",
      "What if a restaurant critic famous for cruelty lost his sense of taste and dared not tell anyone",
      "What if someone who can only cook from recipes inherited a family restaurant whose owner never wrote anything down",
    ],
  },
];

// 生成前提句训练题（确定性展开：类别 × 钩子 → 完整题面）
export function buildPremisePrompts(locale: "en" | "zh"): string[] {
  const prompts: string[] = [];
  for (const cat of SITUATION_CATEGORIES) {
    const whatIfs = locale === "zh" ? cat.whatIfsZh : cat.whatIfsEn;
    for (const w of whatIfs) {
      prompts.push(
        locale === "zh"
          ? `「${w}，会怎样？」把它写成一句话前提：具体人物 + 想要什么 + 阻碍是什么 + 失败会失去什么。`
          : `"${w}?" Turn it into a one-sentence premise: a specific character + what they want + what stands in the way + what they lose if they fail.`
      );
    }
  }
  return prompts;
}
