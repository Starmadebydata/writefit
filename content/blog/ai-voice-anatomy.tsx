// ====================================================================
// Blog 文章：The Anatomy of AI Voice / 解剖"AI 味"
// ====================================================================
// meta 是索引/sitemap/RSS/schema 的唯一数据源。
// PostEn / PostZh 为文章正文（裸标签，由文章页的 .prose-wf 排版）。
// ====================================================================

import { Link } from "@/i18n/navigation";
import type { BlogPostMeta } from "@/lib/jsonld";

export const meta: BlogPostMeta = {
  slug: "ai-voice-anatomy",
  date: "2026-07-20",
  titles: {
    en: "The Anatomy of AI Voice: Why Polished Text All Sounds the Same",
    zh: "解剖“AI 味”：为什么润色过的文字都一个味",
  },
  descriptions: {
    en: "AI voice is not an AI problem — it's an average problem. A field guide to the five tells of machine-polished text, and how to train your way back to a human voice.",
    zh: "AI 味不是 AI 的问题，是“平均数”的问题。一份机器润色文的五大特征解剖指南，以及如何把自己练回人声。",
  },
};

export function PostEn() {
  return (
    <>
      <p>
        You know the smell. Three sentences into a LinkedIn post, a cover
        letter, a friend&apos;s WeChat article — and you can tell: this was
        polished by a machine. Nothing is wrong with it. That&apos;s the
        problem. Every sentence is smooth, correct, and strangely hollow, like
        a hotel room: clean, functional, and nobody&apos;s.
      </p>
      <p>
        What exactly are you smelling? After months of building an AI writing
        coach and staring at thousands of drafts, I&apos;ve come to a
        conclusion that changed how I think about my own writing:
      </p>
      <blockquote>
        <p>
          AI voice is not an AI problem. It&apos;s an average problem.
        </p>
      </blockquote>
      <p>
        A language model is, at its core, a machine for producing the most
        probable next sentence — the statistical center of everything ever
        written. Ask it to polish your draft and it does exactly what you
        asked: it moves your text toward the mean. Your weird metaphors,
        your short angry sentences, your abrupt pivots — the places where
        your voice actually lives — get sanded off as outliers.
      </p>
      <p>
        Voice is deviation from the mean. Polishing is regression toward it.
        That&apos;s the whole trade, and nobody warns you about it.
      </p>

      <h2>The five tells</h2>
      <p>
        Once you see the anatomy, you can&apos;t unsee it. These are the five
        markers I check for first — in AI text, and increasingly, in my own.
      </p>

      <h3>1. Uniform rhythm</h3>
      <p>
        Read the text aloud and count the beats. AI writes in a metronome:
        medium sentence, medium sentence, medium sentence. Humans syncopate.
        We write a long, winding sentence that builds pressure — and then we
        stop. Short. On purpose. Machine-polished text almost never does
        this; variation in sentence length is one of the first things
        regression to the mean destroys.
      </p>

      <h3>2. The rule of three, everywhere</h3>
      <p>
        &quot;Clear, concise, and compelling.&quot; &quot;Faster, better,
        stronger.&quot; AI has learned that humans find triads satisfying, so
        it deploys them constantly — until the device itself becomes the
        tell. One triad per page is rhetoric. Six per page is a fingerprint.
      </p>

      <h3>3. Connective tissue without bone</h3>
      <p>
        &quot;Moreover.&quot; &quot;Furthermore.&quot; &quot;It&apos;s worth
        noting that.&quot; These phrases simulate logic. They promise that
        sentence B follows from sentence A — but read closely and the two
        sentences often just sit next to each other, unrelated, held together
        by a transition word doing work the idea should be doing.
      </p>

      <h3>4. Hedging as a lifestyle</h3>
      <p>
        &quot;It could potentially be argued that this might, in some cases,
        help.&quot; Human writers hedge when they&apos;re unsure. AI hedges
        by default, because the average of all human opinion is no opinion.
        The result is text that never risks being wrong — and never says
        anything worth quoting either.
      </p>

      <h3>5. Zero specifics</h3>
      <p>
        &quot;Many companies struggle with this.&quot; &quot;People often
        find it hard.&quot; How many companies? Which people? Where?
        Specifics — a number, a name, a place, a Tuesday — are expensive for
        a model to produce and cheap for a human who actually lived
        something. Their absence is the loudest tell of all.
      </p>

      <h2>Why this matters more than you think</h2>
      <p>
        Readers rarely notice these tells consciously. But they feel them.
        Engagement drops, trust drops, and the text slides out of memory
        within minutes. Memory anchors to the unusual, and nothing unusual is
        left. In a world where anyone can generate
        &quot;pretty good&quot; text in ten seconds, sounding like the
        average is the same as being invisible.
      </p>
      <p>
        And here&apos;s the uncomfortable part: the more you let AI polish
        your writing, the more your own unassisted writing drifts toward the
        same voice. You&apos;re not borrowing a style. You&apos;re training
        one — on yourself.
      </p>

      <h2>Five exercises to get your voice back</h2>
      <p>
        The good news: AI voice is a habit, and habits respond to training.
        These are the drills I use — fifteen minutes, on your own draft, no
        AI allowed:
      </p>
      <ol>
        <li>
          <strong>Read it aloud.</strong> Mark every spot where you run out
          of breath, and every stretch where the rhythm never changes. Those
          are your metronome zones. Break them: split one long sentence,
          merge two short ones.
        </li>
        <li>
          <strong>Hunt the triads.</strong> Find every rule of three. Keep
          the single best one on the page. Rewrite the rest as plain
          statements — or better, as one example instead of three adjectives.
        </li>
        <li>
          <strong>Delete the hedges.</strong> Every &quot;might&quot;,
          &quot;could&quot;, &quot;it&apos;s worth noting&quot; gets a
          verdict: turn it into a claim you stand behind, or cut the
          sentence entirely. You&apos;ll be surprised how often cutting wins.
        </li>
        <li>
          <strong>Tax every paragraph.</strong> Each paragraph owes you one
          specific: a number, a name, a place, or a moment in time. If it
          can&apos;t pay, the paragraph is probably filler.
        </li>
        <li>
          <strong>Steal a rhythm.</strong> Take a writer whose voice you
          love. Copy one paragraph of theirs by hand. Then write your own
          paragraph with the same sentence-length pattern but your content.
          Voice is physical before it is intellectual.
        </li>
      </ol>

      <h2>The point</h2>
      <p>
        None of this is an argument against AI. It&apos;s an argument for
        using it in the right direction: not as a ghostwriter that pulls your
        text toward the average, but as a coach that points at where
        you&apos;ve gone flat and hands the pen back. Diagnosis, not
        replacement.
      </p>
      <p>
        That&apos;s exactly the fourth dimension WriteFit diagnoses — clarity,
        specificity, personal voice, and AI-likeness — and the drills above
        are built into the training loop. If you want to see your own five
        tells,{" "}
        <Link href="/practice/dev">run one session, no account needed</Link>. Bring
        a draft. Leave with three things to fix — and your voice intact.
      </p>
    </>
  );
}

export function PostZh() {
  return (
    <>
      <p>
        那种味道你一闻就知道。打开一篇领英动态、一封求职信、一条朋友的朋友圈
        长文——三句话之内你就能判断：这是机器润色过的。它没有任何毛病。问题
        就在这。每个句子都顺滑、正确、莫名地空洞，像酒店房间：干净、功能
        齐全、不属于任何人。
      </p>
      <p>
        你闻到的到底是什么？做了几个月 AI 写作教练、看了几千篇稿子之后，
        我得出了一个改变自己写作方式的结论：
      </p>
      <blockquote>
        <p>AI 味不是 AI 的问题，是“平均数”的问题。</p>
      </blockquote>
      <p>
        语言模型的本质，是一台生产“最可能的下一个句子”的机器——它输出的
        是人类全部写作的数字重心。你让它润色稿子，它就忠实地执行：把你的
        文字往平均值上拉。你那些怪怪的比喻、又短又冲的句子、没来由的转折
        ——你的声音真正栖身的地方——全被当作离群值打磨掉了。
      </p>
      <p>
        声音住在对平均值的偏离里，而润色就是向平均值回归。这就是这笔交易的
        全部真相，只是没人提醒你。
      </p>

      <h2>五个特征</h2>
      <p>
        一旦看清这套解剖结构，你就再也回不去了。以下是我最先检查的五个标记
        ——查 AI 的稿子，也越来越多地查自己的。
      </p>

      <h3>1. 节奏均匀</h3>
      <p>
        把文字读出声，数节拍。AI 写作像节拍器：中长句，中长句，中长句。
        人类写作是切分音：我们会写一个迂回攀升、不断加压的长句——然后
        急停。短句。故意的。机器润色过的文字几乎从不这样做；句长的变化
        是“向平均值回归”最先消灭的东西。
      </p>

      <h3>2. 三段式，无处不在</h3>
      <p>
        “清晰、简洁、有力。”“更快、更好、更强。”AI 学会了人类觉得
        三连顺口，于是不停使用——直到这个手法本身成了破绽。一页一处
        三连是修辞，一页六处就是指纹。
      </p>

      <h3>3. 没有骨头的结缔组织</h3>
      <p>
        “此外。”“更进一步说。”“值得注意的是。”这些短语在模拟逻辑。
        它们承诺句子 B 是从句子 A 推出来的——但仔细读，两句话往往只是
        并排躺着，互不相干，全靠一个过渡词干着本该由观点干的活。
      </p>

      <h3>4. 把对冲当生活方式</h3>
      <p>
        “在某种程度上，这或许可能有一定帮助。”人类写手在没把握的时候
        才对冲，AI 默认对冲——因为全人类观点的平均值就是没有观点。结果
        是永远不会错的文字，也永远没有任何值得引用的话。
      </p>

      <h3>5. 零具体</h3>
      <p>
        “很多公司都在为此挣扎。”“人们常常觉得这很难。”多少家公司？
        哪些人？在哪儿？具体的细节——一个数字、一个名字、一个地点、
        某个周二——对模型来说成本高昂，对真正活过的人来说信手拈来。
        它们的缺席，是最响亮的破绽。
      </p>

      <h2>这比你以为的更要紧</h2>
      <p>
        读者很少能自觉指出这些特征。但他们感觉得到。读完率下降，信任度
        下降，文字几分钟内就从记忆里滑走——因为记忆锚定在不寻常之处，
        而这里已经没有不寻常了。在一个任何人十秒钟都能生成“还不错”
        文字的世界里，听起来像平均值，就等于隐形。
      </p>
      <p>
        更不舒服的是：你越让 AI 润色你的文字，你自己徒手写出来的东西就
        越往那个声音上漂。你不是在借一种风格，你是在给自己训练一种风格。
      </p>

      <h2>五个练习，把声音练回来</h2>
      <p>
        好消息是：AI 味是一种习惯，而习惯是可以训练的。以下是我自己用的
        练习——十五分钟，改自己的稿子，不许用 AI：
      </p>
      <ol>
        <li>
          <strong>读出声。</strong>标出每一处你读得上气不接下气的地方，
          和每一段节奏毫无变化的地方。那是你的节拍器区域。拆掉它：劈开
          一个长句，或者合并两个短句。
        </li>
        <li>
          <strong>围猎三连。</strong>找出所有三段式。整页只留最好的一处，
          其余的改写成平铺直叙——或者更好：用一个例子代替三个形容词。
        </li>
        <li>
          <strong>删除对冲。</strong>每个“可能”“或许”“值得注意”都要
          审判一次：改成你敢负责的断言，或者整句删掉。你会惊讶于删掉的
          次数赢了多少回。
        </li>
        <li>
          <strong>向每段收税。</strong>每个段落都欠你一个具体：一个数字、
          一个名字、一个地点，或一个时间点。交不出来的段落，多半是凑数的。
        </li>
        <li>
          <strong>偷一种节奏。</strong>找一个你热爱的作家，手抄他一段
          文字——然后用他的句长节奏、装你自己的内容写一段。声音先是
          身体的，然后才是头脑的。
        </li>
      </ol>

      <h2>重点</h2>
      <p>
        以上不是反对 AI，而是主张把 AI 用在对的方向：不做把你的文字拉向
        平均值的枪手，而做指出你哪里写平了、然后把笔还给你的教练。要诊断，
        不要代写。
      </p>
      <p>
        这正是 WriteFit 诊断的第四个维度——清晰度、具体度、个人声音、
        AI 味——上面的练习也内置在训练闭环里。想看看你自己的五个特征，
        <Link href="/practice/dev">不用注册，直接跑一轮</Link>。带一篇稿子来，
        带着三个要改的问题走——声音原封不动。
      </p>
    </>
  );
}
