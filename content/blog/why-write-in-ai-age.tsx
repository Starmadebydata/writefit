// ====================================================================
// Blog 文章：Why Write When AI Can Write Everything? /
//            当 AI 能写出一切，为什么还要自己写？
// ====================================================================
// 由两篇草稿融合重写：A1 的三层价值框架 + A2 的叙事开场/结尾与细节。
// meta 是索引/sitemap/RSS/schema 的唯一数据源。
// ====================================================================

import type { BlogPostMeta } from "@/lib/jsonld";
import { Link } from "@/i18n/navigation";

export const meta: BlogPostMeta = {
  slug: "why-write-in-ai-age",
  date: "2026-07-20",
  titles: {
    en: "Why Write When AI Can Write Everything?",
    zh: "当 AI 能写出一切，为什么还要自己写？",
  },
  descriptions: {
    en: "The real crisis for writers isn't that machines write well — it's that we forget why we write. On the three things AI can't replace, where to draw the line with AI, and a daily practice for your native writing ability.",
    zh: "AI 时代写作者真正的危机，不是机器写得太好，而是人会因此忘记自己为什么要写。谈谈 AI 替代不了的三层价值、与 AI 的边界划法，以及一套原生写作力的日常修炼。",
  },
};

export function PostEn() {
  return (
    <>
      <p>
        Two years ago I got stuck on a paragraph and handed it to an AI.
        Fifteen seconds later it gave me three versions. Each was fluent,
        appropriate, fine. None of them sounded like me.
      </p>
      <p>
        That&apos;s when I understood the real crisis for writers. Not that
        machines write well. That they write well enough to make us forget
        why we write.
      </p>

      <h2>First, be honest about what writing is for you</h2>
      <p>
        Before &quot;how do I keep writing,&quot; there&apos;s an earlier
        question: what is the writing actually for?
      </p>
      <p>
        If the honest answer is content and quotas, AI already beat you, and
        the gap widens daily. Nobody manufactures acceptable text cheaper.
        But writing was never only text production. Three layers of its value
        are out of AI&apos;s reach.
      </p>
      <p>
        <strong>Writing is how thinking gets finished.</strong> Most people
        think they write down what they&apos;ve already figured out. It works
        the other way: we figure things out by writing. A vague thought only
        takes shape once it&apos;s forced into a sentence. Outsource this
        layer to AI and you haven&apos;t saved labor — you&apos;ve skipped the
        thinking. Mental arithmetic died with the calculator. Organizing
        thoughts dies the same way, quietly, when something else always does
        the organizing.
      </p>
      <p>
        <strong>Writing is an archive of who you were.</strong> Your tone,
        your hesitations, your clumsiness — they belong to this exact version
        of you. Twenty years from now, rereading your rough sentences,
        you&apos;ll feel a small &quot;this was me&quot; that no flawless
        generated text can give you. Personal writing is a monument you build
        in time.
      </p>
      <p>
        <strong>Writing is credit between people.</strong> A reader reads the
        person behind the argument: the lived experience, the willingness to
        stand behind the words. No AI text carries the signature &quot;I
        wrote this, in my name.&quot; The more generated content floods the
        world, the more that signature is worth.
      </p>
      <p>
        Which answers &quot;why keep writing&quot;: machines replace text.
        They can&apos;t replace the person writing it.
      </p>

      <h2>Redraw the boundary: a sparring partner, not a ghostwriter</h2>
      <p>
        Writing by hand doesn&apos;t mean banning AI. Used right, it&apos;s
        the best sparring partner you&apos;ll ever have — as long as one
        boundary holds: the thinking starts with you. AI extends your
        ability; it must not become your ability. Concretely:
      </p>
      <ul>
        <li>
          <strong>Pick your own subjects.</strong> The most valuable part of
          any piece is why <em>you</em> are the one writing it. Before
          drafting, write a hundred words of your core idea in your own
          words, however fragmented. That&apos;s the foundation. Don&apos;t
          hand it over.
        </li>
        <li>
          <strong>Write your own first drafts.</strong> Then let AI find
          fault — not fixes. Use it as a demanding editor: show me the
          logical holes and the muddy passages. It finds the problems; you
          fix them. That small distinction decides whether your writing
          muscle grows or atrophies.
        </li>
        <li>
          <strong>Let it play devil&apos;s advocate.</strong> Make your
          argument, then ask AI to attack it. Tireless, free, a Socrates on
          tap. What the debate forces you to deepen becomes your own skill.
        </li>
        <li>
          <strong>Beware the polish habit.</strong> Once is harmless. As a
          habit it&apos;s corrosive: you start holding your own work to the
          machine&apos;s smooth, faultless, nobody&apos;s-home style, and
          your voice gets sanded down a pass at a time. As I argued in{" "}
          <Link href="/blog/ai-voice-anatomy">The Anatomy of AI Voice</Link>,
          polishing is regression to the mean, and voice lives in the
          deviation. A rough house with character beats a furnished
          apartment.
        </li>
      </ul>
      <p>
        AI is a mirror, not a pen. It shows you blind spots. You still do the
        walking.
      </p>

      <h2>Training your native writing ability</h2>
      <p>
        Native writing ability is the capacity to grow text straight out of
        your own experience and thought, no tool in between. Like strength,
        it atrophies. Six drills I use and can vouch for:
      </p>
      <ol>
        <li>
          <strong>A daily no-AI window.</strong> Twenty minutes, a dumb
          editor or pen and paper. A journal, a letter, nonsense nobody will
          read. The point isn&apos;t quality; it&apos;s keeping the
          brain-to-hand channel from rusting shut. Set the bar at one
          sentence — one sentence usually drags the rest out. The first
          sessions will feel painfully stiff. That stiffness is the
          diagnosis, and a month or two of reps is the cure.
        </li>
        <li>
          <strong>Read like an anatomist.</strong> Take a writer you admire
          and dissect a page: why does this section open here? Why this
          metaphor, in this spot? What dies if this paragraph goes?
          That&apos;s how you learn writing <em>decisions</em> — the judgment
          AI can&apos;t hand you. And when a sentence stops you cold,
          don&apos;t just admire it. Ask what it did.
        </li>
        <li>
          <strong>Compression.</strong> Finish a piece, then cut a third
          without losing any information. Deleting is the cruelest drill — it
          makes you defend every word. AI text&apos;s signature disease is
          redundancy: beautiful filler, correct emptiness. Compress often
          enough and you become immune.
        </li>
        <li>
          <strong>Write what only you can write.</strong> Rule of thumb: at
          least half your material comes from first-hand experience. AI can
          do &quot;the pain of heartbreak,&quot; but it has never frozen in a
          supermarket aisle over the yogurt brand you two used to buy. It has
          never smelled your grandmother&apos;s kitchen. Your life is not in
          its dataset. The closer you stay to lived experience, the less
          replaceable you are.
        </li>
        <li>
          <strong>Stay intellectually honest.</strong> AI is never uncertain;
          it always answers fluently. Human thought&apos;s best states are
          the opposite: doubt, contradiction, believing two things at once.
          Don&apos;t rush the conclusion. Let &quot;I don&apos;t know&quot;
          stay on the page. The best essays say &quot;I&apos;m still
          thinking,&quot; not &quot;I figured it out.&quot; That rough edge
          is a texture no polished surface has.
        </li>
        <li>
          <strong>Ruminate, then publish.</strong> Every few months, reread
          your old work. Rewrite one piece you didn&apos;t nail and compare
          versions; progress or stagnation is right there in the diff. Notice
          which old paragraphs still move you — that&apos;s usually where
          your style lives. Style isn&apos;t designed. It surfaces through
          repetition. And publish, even when it&apos;s imperfect. Being seen
          writing badly is a rite of passage. Hiding inside AI&apos;s
          polished shell, you never learn to walk your own road.
        </li>
      </ol>

      <h2>Accept slow. Accept clumsy.</h2>
      <p>
        The cruelest hit of the AI age is efficiency despair: you grind out a
        thousand words in an afternoon, the machine does ten thousand in
        three seconds. But writing was never piecework. You don&apos;t stop
        walking because cars are faster. Walking was never about A to B.
        It&apos;s the ground under your feet, and the thing that finally
        clicks halfway through.
      </p>
      <p>
        Hemingway said all first drafts are shit. Not modesty — a description
        of the job: good text gets revised out of clumsiness, and the clumsy
        process is the very process that changes the writer. You write slowly
        because you&apos;re thinking. You write clumsily because you&apos;re
        facing what you haven&apos;t figured out. Your text has flaws because
        living people leave traces. In a different coordinate system, those
        &quot;defects&quot; are the whole point.
      </p>

      <h2>The ending</h2>
      <p>
        AI will write more and more perfect essays. But the world has never
        lacked perfect essays. It lacks essays in which a person actually
        lived, thought, suffered — and wrote it down.
      </p>
      <p>
        AI can produce ten thousand pieces about autumn. Only you can write:
        &quot;On a Tuesday evening in July, I was sitting on my balcony. An
        old man across the building was watering his flowers. I suddenly
        thought of my grandfather, and I cried — though I don&apos;t entirely
        know why.&quot;
      </p>
      <p>
        That &quot;don&apos;t entirely know why&quot; — that&apos;s you.
      </p>
      <p>
        That&apos;s also why we built WriteFit: an AI that never writes for
        you. It diagnoses, then hands the pen back. To start today:{" "}
        <Link href="/practice/dev">
          one 15-minute session, no account needed
        </Link>
        . Bring your own draft.
      </p>
      <p>
        Keep writing. In your own sentences, about your own world. Slowly,
        clumsily — that&apos;s your pen, breathing.
      </p>
    </>
  );
}

export function PostZh() {
  return (
    <>
      <p>
        两年前，我第一次把一段卡壳的文字交给 AI 续写。十五秒后，它交还了
        三个版本，每一个都通顺、得体，挑不出毛病。也每一个都不像是我写的。
      </p>
      <p>
        那一刻我意识到，真正的危机不是机器写得太好，而是人会因此慢慢忘记
        自己为什么要写。
      </p>

      <h2>一、先想清楚：写作对你而言到底是什么</h2>
      <p>
        在讨论怎么坚持之前，得先回答一个更根本的问题：你写作是为了什么？
      </p>
      <p>
        如果只是为了产出内容、完成 KPI，那坦白说，AI 已经赢了你，赢面只会
        越来越大。机器生产合格文本的性价比，人类永远追不上。但写作不止于此。
        至少有三层价值，AI 替代不了。
      </p>
      <p>
        <strong>写作是思考的完成。</strong>很多人以为自己是想清楚了才写，
        其实正相反，我们是写着写着才想清楚。模糊的思绪被压进句子的模具时，
        才被迫显出形状。把这一层外包给 AI，外包掉的不是劳动，是思考本身。
        计算器普及之后心算会退化，长期让 AI 替你组织语言，组织思想的能力
        也会悄悄流失。
      </p>
      <p>
        <strong>写作是自我的存档。</strong>你此刻的语气、偏见、犹豫、笨拙，
        都是这个时间点的你所独有的。二十年后重读年轻时写下的粗糙文字，那种
        「这是我」的确认感，AI 写得再完美也给不了。个人写作，是在时间中为
        自己立碑。
      </p>
      <p>
        <strong>写作是人与人之间的信用。</strong>读者读一篇文章，读的是观点
        背后那个真实的人：有经历、有体温，肯为自己的文字负责。AI 文本再流畅，
        也没有这份「我以我的名义写下这段话」的背书。AI 内容越泛滥，这份信用
        越升值。
      </p>
      <p>
        想清楚这三层，「为什么还要自己写」就有答案了：机器替代的是文本，
        替代不了的是写作者本人的存在。
      </p>

      <h2>二、和 AI 的边界：陪练，不是替身</h2>
      <p>
        坚持自己写，不等于把 AI 拒之门外。用好了，它是很好的陪练。关键在
        一条边界：思考的主动权在你手里。AI 是能力的延伸，不能变成替代。
        几个具体的划法：
      </p>
      <ul>
        <li>
          <strong>选题和立意，自己来。</strong>一篇文章最值钱的，是「为什么
          偏偏是你来写它」。你独有的经历和角度，AI 没有。动笔前先用自己
          的话写一两百字核心想法，哪怕支离破碎。这是地基，不能让渡。
        </li>
        <li>
          <strong>初稿自己写，AI 只负责挑刺。</strong>写完初稿，把 AI 当
          苛刻的编辑用：让它指出逻辑漏洞和表达含混的地方。注意，是「指出
          问题」，不是「直接改好」。问题它发现，修改你完成。这个区别看着小，
          其实决定了你的写作肌肉在长还是在萎缩。
        </li>
        <li>
          <strong>把 AI 当反方辩手。</strong>写完一个论点，让它从对立面
          攻击你。它不知疲倦、火力凶猛，是免费的苏格拉底。辩论中被逼着
          深化的思考，最后都沉淀成你自己的功力。
        </li>
        <li>
          <strong>警惕润色依赖。</strong>写个毛坯交给 AI「润色一下」，偶尔
          为之无妨，成了习惯就麻烦了。你会慢慢把 AI 那种四平八稳、挑不出
          错也没有个性的文风当成好文字的标准，自己的声音在一次次润色里
          磨平。我们在
          <Link href="/blog/ai-voice-anatomy">《解剖「AI 味」》</Link>
          里说过：润色是向平均值回归，声音住在偏离平均值的地方。毛坯房的
          粗粝，好过精装房的千篇一律。
        </li>
      </ul>
      <p>
        说到底，AI 是镜子，不是笔。它照见盲区，走路的还是你。
      </p>

      <h2>三、原生写作力怎么练</h2>
      <p>
        原生写作能力，就是不靠任何工具，从自己的经验和思考里直接长出文字
        的能力。它像体力，不练就退化。几条我自己在用、也确实有效的练法：
      </p>
      <ol>
        <li>
          <strong>每天一段「无 AI 时间」。</strong>二十分钟就够，纸笔或者
          最简陋的编辑器，写什么都行：日记、随笔、不给任何人看的废话。
          重点不是写出好东西，是别让「从脑子到手」这条通路锈掉。门槛降到
          不可能失败：只写一句话。通常一句话落地，后面的会自己跟出来。头
          几次会艰涩得吓人，这说明通路确实在生锈。坚持一两个月，生涩退了，
          思想的流速会快起来。
        </li>
        <li>
          <strong>解剖式慢读。</strong>找一个你真正佩服的作家，把他的文章
          逐段拆开：这段为什么从这里起笔？这个比喻为什么放在这个位置？
          这段删了，损失什么？这是在学「写作决策」，那种判断力只能从细读里
          长出来。读到一个让你停下来的句子，多问一句：它好在哪里？
        </li>
        <li>
          <strong>压缩练习。</strong>写完任何东西，强制删掉三分之一，信息
          不许损失。删字是最残酷的训练，它逼你直面每一个词有没有必要存在。
          AI 文本的典型病就是冗余，漂亮的废话、正确的空话。常做压缩的人，
          对这病有免疫力。
        </li>
        <li>
          <strong>写只有你能写的东西。</strong>定条纪律：至少一半的创作
          取材于第一手经验，你亲眼看见、亲身经历的事。AI 可以写「失恋的
          痛苦」，但它没在超市里盯着你们一起买过的那个牌子的酸奶、愣在
          原地过；它也不知道你外婆厨房里那股散不掉的油烟味。它的语料库里
          没有你的人生。写作越贴着真实经验，越不可替代。
        </li>
        <li>
          <strong>保持思考的诚实。</strong>AI 永远不会真的「不确定」，它
          总是答得流畅又自信。人思考最珍贵的状态是不确定，是矛盾，是
          「我同时相信两件事」。别急着下结论，允许自己在文章里写「我
          不知道」。最好的散文往往不是「我想明白了」，而是「我还在想」。
          这种毛边，AI 的光滑表面上不会有。
        </li>
        <li>
          <strong>反刍，并且发出来。</strong>隔几个月重读旧文，做两件事：
          把没写透的题目重写一遍，新旧对比，进步还是停滞一目了然；挑出
          那些现在读来还会心头一动的段落，想想它们为什么好，那往往就是
          你的风格。风格不是设计的，是写着写着、反刍着反刍着，自己浮出来
          的。另外，定期把自己的文字公之于众，哪怕不够好。写得不好被看见，
          是必经之路。躲进 AI 的光鲜外壳里，永远学不会走自己的路。
        </li>
      </ol>

      <h2>四、接受慢，接受拙</h2>
      <p>
        AI 时代对写作者最狠的心理冲击，是效率绝望：你吭哧半天一千字，
        机器三秒一万字。但写作不是计件生产。你不会因为汽车比人快就放弃
        散步。散步的意义不在从 A 点到 B 点，在于脚掌贴着地面的触感，
        在于走着走着，突然想通了一件事。
      </p>
      <p>
        海明威说，初稿都是狗屎。他不是谦虚，是在陈述事实：好文字是在
        笨拙里一遍遍改出来的，而那个笨拙的过程，正好也是写作者自己被
        改变的过程。你写得慢，因为你在想。你写得拙，因为你在诚实面对
        自己还没想清楚的部分。你的文字有瑕疵，因为那是活人留下的痕迹。
        这些效率视角下的「缺点」，换个坐标系，就是写作的意义本身。
      </p>

      <h2>结语</h2>
      <p>
        AI 会写出越来越多完美的文章。但世界不缺完美的文章，缺的是
        「这个人真的活过、想过、痛过，然后写了下来」的文章。
      </p>
      <p>
        AI 可以写一万篇关于秋天的散文。只有你能写：「七月的一个周二
        傍晚，我坐在阳台上，看见对面楼有个老人在浇花，突然想起我爷爷，
        然后我哭了，但我不完全知道为什么。」
      </p>
      <p>那个「不完全知道为什么」，就是你。</p>
      <p>
        这也是我们做 WriteFit 的原因：一个永远不替你写的 AI，只做诊断，
        然后把笔还给你。想从今天开始，
        <Link href="/practice/dev">不用注册，先跑一轮 15 分钟的训练</Link>
        。带上你自己的稿子。
      </p>
      <p>
        继续写吧。用你自己的句子，写你自己的世界。慢一点，拙一点，
        都没关系。那是你的笔在呼吸。
      </p>
    </>
  );
}
