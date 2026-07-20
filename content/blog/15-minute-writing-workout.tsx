// ====================================================================
// Blog 文章：The 15-Minute Writing Workout / 每天 15 分钟的写作训练法
// ====================================================================
// 三部曲第三篇（术）：ai-voice-anatomy（识）→ why-write-in-ai-age（道）
// → 本篇（术）。内容直接对应 WriteFit 训练闭环。
// meta 是索引/sitemap/RSS/schema 的唯一数据源。
// ====================================================================

import type { BlogPostMeta } from "@/lib/jsonld";
import { Link } from "@/i18n/navigation";

export const meta: BlogPostMeta = {
  slug: "15-minute-writing-workout",
  date: "2026-07-20",
  titles: {
    en: "The 15-Minute Writing Workout: A Daily Protocol That Actually Works",
    zh: "每天 15 分钟：一套可执行的写作训练法",
  },
  descriptions: {
    en: "You don't need more time to become a better writer. You need a protocol. Ten minutes of writing, three diagnosed problems, five minutes of revision — daily. Here's the full method, the rules that make it stick, and an honest timeline.",
    zh: "提升写作缺的不是时间，是一套规程。十分钟写作、三个诊断问题、五分钟修改，每天一轮。这是完整的方法、让它坚持下去的规则，以及一份诚实的时间表。",
  },
};

export function PostEn() {
  return (
    <>
      <p>
        Most people who want to write better are waiting for the same thing:
        a free afternoon. A quiet weekend. A retreat. Somehow the afternoon
        never comes, and the draft from last October is still the draft from
        last October.
      </p>
      <p>
        Here&apos;s a different premise. You don&apos;t need more time. You
        need a protocol — something small enough to do every day, structured
        enough that every minute is spent on the thing that actually improves
        writing. Fifteen minutes is enough. This is the whole method.
      </p>

      <h2>Why fifteen minutes</h2>
      <p>
        Fifteen minutes is the smallest unit that contains one real
        repetition: a draft, feedback, and a revision. Anything shorter and
        you&apos;re just jotting. Anything longer and you&apos;ll start
        negotiating with yourself about whether today counts.
      </p>
      <p>
        The math matters less than the frequency. Seven sessions of fifteen
        minutes beat one two-hour Sunday session, and it isn&apos;t close.
        Skill consolidates between sessions, not during them — the brain
        works on the problem overnight and shows up slightly better next
        time. A weekly binge gives it one night to work. A daily practice
        gives it seven.
      </p>

      <h2>The protocol</h2>

      <h3>Minutes 0–10: Write</h3>
      <p>
        Timer on. Write anything: a paragraph about your day, an argument you
        can&apos;t stop having in your head, a description of the room.
        Two rules, both absolute: don&apos;t stop moving, and don&apos;t
        delete. The delete key is off limits for ten minutes — every time you
        erase a sentence you&apos;re training the wrong muscle (the one that
        avoids judgment instead of the one that produces text). Bad sentences
        stay. You&apos;ll deal with them in a minute.
      </p>

      <h3>Minutes 10–13: Diagnose</h3>
      <p>
        Now get feedback — from an editor if you have one, from an AI coach
        if you don&apos;t, from your own checklist if neither. The crucial
        constraint: <strong>exactly three problems, no more</strong>. A page
        of red ink teaches nothing; it just hurts. Three specific problems —
        this vague verb, this sentence that says nothing, this paragraph in
        the wrong order — that&apos;s a workload your brain will actually
        pick up.
      </p>

      <h3>Minutes 13–15: Revise</h3>
      <p>
        Fix the three problems. Yourself, by hand — this is where the
        improvement lives, and it&apos;s the step everyone tries to skip.
        Don&apos;t touch anything else. You&apos;re not making the piece
        good; you&apos;re making one specific weakness slightly less weak.
        That&apos;s a training session. Good pieces are a side effect, and
        they come later.
      </p>

      <h3>After the timer: two thirty-second habits</h3>
      <p>
        First, look at the diff. Original next to revision, actually look at
        what changed. Most people have never seen their own improvement
        rendered visibly, and it does something to your motivation that no
        pep talk can. Second, save one sentence — the best one you wrote
        today — into a file. A year from now that file is your voice,
        documented.
      </p>

      <h2>The rules that keep it alive</h2>
      <p>
        The protocol is the easy part. Surviving month two is the hard part.
        Four rules, learned the hard way:
      </p>
      <ol>
        <li>
          <strong>Same time, same place.</strong> Anchor the session to
          something that already happens every day — morning coffee, the
          train, lunch. Willpower is not a strategy; a trigger is. I write
          at 6:40, after the kettle goes on. The kettle does the discipline
          for me.
        </li>
        <li>
          <strong>Never miss twice.</strong> Missing one day is life. Missing
          two is the beginning of quitting — the third day the negotiation
          gets much easier to lose. One miss is a data point; two is a
          pattern. Protect the pattern, not the record.
        </li>
        <li>
          <strong>Track the streak, not the quality.</strong> Some days
          you&apos;ll write garbage. Write it anyway and log the session.
          Quality is a lagging indicator; it follows the streak by about a
          month. People quit in week three because the work still looks bad,
          right before the curve bends.
        </li>
        <li>
          <strong>Keep a prompt list for empty days.</strong> The blank page
          is hardest when you also have to choose the topic. Keep five
          starters ready: something that annoyed me recently, a place I
          know well, explain my job to a smart ten-year-old, the last
          conversation that stayed with me, what I changed my mind about
          this year. An empty day plus a prompt is still a session.
        </li>
      </ol>

      <h2>An honest timeline</h2>
      <p>
        Week one will feel worse, not better. You&apos;ll see problems
        everywhere and fix none of them smoothly. That&apos;s perception
        arriving before skill, and it&apos;s a good sign even though it
        feels like regression.
      </p>
      <p>
        Around week four the starts get easier. Blank-page dread shrinks
        from minutes to seconds; the first sentence arrives on its own.
        Around month three, reread something from week one. The difference
        will embarrass you a little, in the good way.
      </p>
      <p>
        That&apos;s the whole pitch. Fifteen minutes, three problems, one
        saved sentence, every day. No retreat required.
      </p>

      <h2>Where the tool fits</h2>
      <p>
        You can run this protocol with a kitchen timer and a notebook —
        please do, starting today. We built{" "}
        <Link href="/methodology">WriteFit</Link> to handle the two steps
        that are hard to do alone: the diagnosis (three specific problems,
        not a wall of comments) and the diff (original versus revision, side
        by side), plus the sentence library that accumulates as you go.{" "}
        <Link href="/practice/dev">Try one session</Link> — fifteen minutes,
        no account. Then keep the streak, with or without us.
      </p>
    </>
  );
}

export function PostZh() {
  return (
    <>
      <p>
        想把文章写好的人，大多在等同一样东西：一个空闲的下午，一个安静的
        周末，一次闭关。那个下午永远不会来，去年十月开的头，到现在还是
        那个头。
      </p>
      <p>
        换个前提：你缺的不是时间，是一套规程——小到每天都能完成，又
        结构化到每一分钟都花在真正长本事的地方。十五分钟就够。下面是
        完整方法。
      </p>

      <h2>为什么是十五分钟</h2>
      <p>
        十五分钟是装得下「一次完整重复」的最小单位：一篇草稿、一次反馈、
        一轮修改。再短只是随手记，再长你就会开始跟自己谈判——今天忙，
        算不算？
      </p>
      <p>
        总时长没那么重要，频率才重要。七次十五分钟，远胜周日猛练两小时，
        差距还不小。技能是在两次练习之间固化的，不在练习当中——大脑夜里
        替你加工白天的问题，第二天你就好一点点。一周一练，给它加工的机会
        只有一次；每天一练，是七次。
      </p>

      <h2>训练规程</h2>

      <h3>第 0–10 分钟：写</h3>
      <p>
        计时器打开。写什么都行：今天遇到的一件事、脑子里吵了一路的那个
        论点、眼前这个房间。规则两条，都是死规定：手别停，别删字。这十
        分钟删除键是禁用的——每删掉一句，你练的都是错的肌肉（逃避评判
        的那块，而不是生产文字的那块）。烂句子留在原地，几分钟后自然
        有机会收拾它。
      </p>

      <h3>第 10–13 分钟：诊断</h3>
      <p>
        拿反馈。有编辑找编辑，没有就用 AI 教练，两个都没有就用自查清单。
        关键的约束只有一条：<strong>只找三个问题，一个都不许多</strong>。
        满页红字什么都教不会，只会疼。三个具体的问题——这个动词太虚、
        这句等于没说、这两段顺序倒了——才是大脑真的愿意接的工作量。
      </p>

      <h3>第 13–15 分钟：修改</h3>
      <p>
        把这三个问题改掉。自己动手，这是进步真正发生的地方，也是所有人
        最想跳过的一步。除此之外一个字都别碰。你不是在把这篇文章改好，
        是在把一个具体的弱点改得没那么弱。这叫训练。好文章是副产品，
        后面自己会来。
      </p>

      <h3>计时结束后：两个三十秒的习惯</h3>
      <p>
        第一，看一眼 diff。原稿和修改稿并排，认真看看你改了什么。多数人
        从没亲眼见过自己的进步长什么样，它对动机的刺激是任何鸡汤都
        比不了的。第二，存一句。把今天写得最好的那一句，丢进一个文件里。
        一年后这个文件就是你的声音，白纸黑字。
      </p>

      <h2>让它活下去的规则</h2>
      <p>
        规程是容易的部分，难的是活过第二个月。四条规则，都是学费换来的：
      </p>
      <ol>
        <li>
          <strong>同一时间，同一地点。</strong>把训练挂在一件每天必然发生
          的事上——早上的咖啡、通勤的地铁、午饭之后。意志力不是策略，
          触发器才是。我 6:40 写，电水壶一响就坐下。自律由水壶负责。
        </li>
        <li>
          <strong>断可以，不能连断两天。</strong>断一天是生活，断两天是
          放弃的开始——到第三天，谈判会好打得多的。一天是意外，两天是
          模式。要保护的是模式，不是完美纪录。
        </li>
        <li>
          <strong>记录连续天数，不记录质量。</strong>有些日子写出来的就是
          垃圾。垃圾也写，写完打卡。质量是滞后指标，大概落后连续天数
          一个月。多数人第三周放弃，因为东西看着还是烂——而那正好是
          曲线拐弯之前。
        </li>
        <li>
          <strong>给没灵感的日子备一份题目清单。</strong>空白页最难的不是
          写，是还要同时想选题。常备五个起手题：最近让我不爽的一件事、
          一个我特别熟悉的地方、把我的生活讲给一个聪明的十岁小孩听、
          最近一场忘不掉的谈话、今年我改变了看法的一件事。没灵感的日子
          加上一道题，依然是一次完整的训练。
        </li>
      </ol>

      <h2>一份诚实的时间表</h2>
      <p>
        第一周会感觉更差，不是更好。你会到处看见问题，又改不利索。这是
        感知跑在了技能前面，虽然感觉像退步，其实是好兆头。
      </p>
      <p>
        第四周前后，开头变容易了。对着空白页发怵的时间从几分钟缩到几秒，
        第一句话自己会来。第三个月，翻出第一周写的东西读一遍。差距会让
        你有点不好意思——好的那种不好意思。
      </p>
      <p>
        全部主张就这些：十五分钟，三个问题，一句存档，每天一轮。不需要
        闭关。
      </p>

      <h2>工具的位置</h2>
      <p>
        这套规程用厨房计时器和笔记本就能跑，请今天就开始。我们做
        <Link href="/methodology">WriteFit</Link>
        是为了接管其中两件一个人最难做的事：诊断（三个具体问题，而不是
        一墙批注）和 diff（原稿对修改稿，并排可见），外加那个随训练
        累积的句子库。<Link href="/practice/dev">跑一轮试试</Link>——
        十五分钟，不用注册。然后，不管用不用我们，把连续天数续上。
      </p>
    </>
  );
}
