# WriteFit 博客内容日历（2026-07 起）

节奏：每周 2-3 篇，每篇维持现有 3 篇（`why-write-in-ai-age` / `ai-voice-anatomy` /
`15-minute-writing-workout`）的深度——中英双语、2000+ 字、有明确论点而非泛泛而谈、
结尾带 `/practice/dev` 转化链接。不追日更，追这个质量线。

## 一、已有内容盘点（避免选题撞车）

| Slug | 中文标题 | 定位 |
|---|---|---|
| `why-write-in-ai-age` | 为什么还要在 AI 时代写作（道） | 价值主张/理念篇 |
| `ai-voice-anatomy` | 解剖"AI 味"（识） | 问题诊断篇：AI 味的 5 个特征 |
| `15-minute-writing-workout` | 每天 15 分钟写作训练法（术） | 方法论篇：完整训练流程 |

三篇已经构成"道-识-术"闭环，覆盖了核心理念、核心问题（AI 味）、核心方法（15 分钟流程）。
后续选题要避免重复这三个角度，往下面四个方向铺开。

## 二、内容支柱（对应产品的四个核心概念）

产品诊断维度是 clarity / specificity / voice / AI-likeness（见 `lib/ai/schemas.ts`），
这天然就是四根内容支柱，每根支柱下再细分选题：

1. **Clarity 清晰度** — 句子结构、逻辑链条、读者认知负荷
2. **Specificity 具体性** — 抽象 vs 具体、细节密度、"show don't tell"
3. **Voice 个人声音** — 文风一致性、语域（register）、如何不被 AI 磨平
4. **AI-likeness AI 味** — 已有一篇深度文（`ai-voice-anatomy`），可以做子话题延伸

再加两根跨产品支柱：

5. **训练方法论** — 刻意练习、反馈循环、习惯养成（呼应 `15-minute-writing-workout`）
6. **场景/人群** — 不同用户为什四要写作（求职、内容创作、非母语者、学生），带具体使用案例

## 三、选题池（30 个，按支柱分组，可直接排产）

### Clarity 清晰度（TOFU 教育向）
1. Why your writing feels "hard to read" even when the grammar is perfect
2. The one-idea-per-sentence rule and when to break it
3. How to cut 30% of your word count without losing meaning
4. Reading level vs. reader respect: the clarity paradox

### Specificity 具体性
5. "Show, don't tell" is bad advice. Here's the version that works.
6. The vague-word blacklist: words that make writing forgettable
7. How specific is too specific? A rubric for detail density
8. From "very successful" to a number: a rewriting drill

### Voice 个人声音
9. What "finding your voice" actually means (it's not what writing teachers say)
10. Why your writing sounds different in email vs. WeChat vs. cover letters — and whether that's a problem
11. Voice consistency across a long document: how to check yourself
12. Can you have a voice in a second language? (yes — here's how)

### AI 味 / AI-likeness 延伸
13. The em-dash epidemic: why AI (and now humans) overuse "—"
14. "It's not just X, it's Y": anatomy of the AI parallelism tic
15. Three-part lists are a tell. Here's why AI structures everything in threes.
16. Can AI detectors actually detect AI? What WriteFit measures instead

### 训练方法论
17. Deliberate practice for writers: what actually transfers to skill
18. Why editing your own first draft is harder than it looks
19. The feedback loop that made WriteFit's training design (behind-the-scenes)
20. How long until you see improvement? An honest timeline (extends `15-minute-writing-workout`)
21. Journaling vs. deliberate writing practice: they're not the same thing

### 场景/人群（转化导向，BOFU）
22. Writing a cover letter without sounding like everyone else's cover letter
23. Content creators: why AI-polished posts get less engagement (and the fix)
24. Non-native English writers: how to keep your voice while fixing your grammar
25. Students: why AI detectors are the wrong thing to worry about — write like this instead
26. Founders writing their own copy: the case against outsourcing your voice
27. Freelance writers: how to prove your writing is yours (portfolio strategy)

### 对比/决策向（BOFU，转化率最高但要写得诚实克制）
28. WriteFit vs. Grammarly: feedback that improves you vs. feedback that fixes typos
29. Why WriteFit won't write for you (and why that's the point)
30. What "AI writing coach" should mean — and why most tools get it backwards

## 四、排产节奏建议

- 每周 2-3 篇，建议固定在周二/周四（+ 周日可选）发布，形成读者习惯
- 每 4 篇里安排：2 篇 TOFU 教育向（Clarity/Specificity/Voice） + 1 篇训练方法论
  + 1 篇场景/对比向（BOFU），保持流量与转化的平衡，不要连续堆 BOFU 内容
- 内链策略：每篇至少链回 `/practice/dev`（转化）+ `/methodology`（信任背书）+
  1-2 篇同支柱的历史文章（构建 topic cluster，帮 SEO 也帮读者）
- 每篇发布后检查：`app/sitemap.ts`、`app/feed.xml` 是否自动收录新 slug
  （现有实现应该是自动扫 `content/blog/index.ts`，新增文章记得同步加进 index）

## 五、单篇模板（照抄现有 3 篇的结构）

1. **Hook**：一个具体场景或反直觉论点开篇，不要"在 AI 时代，写作变得……"这种空话开头
2. **核心论点**：一句话讲清这篇文章要证明什么
3. **展开**：3-5 个小节，每节一个子论点 + 具体例子/对比
4. **方法/清单**（如适用）：给读者可以直接抄的动作，不要只有理论
5. **结尾转化**：一句话呼应产品能力 + `/practice/dev` 链接，不要硬广
6. **中英双语**：`PostEn` / `PostZh` 两个组件，`meta.titles`/`meta.descriptions` 双语齐全
7. **`content/blog/index.ts` 记得注册新文章**，否则 sitemap/RSS/列表页不会收录
