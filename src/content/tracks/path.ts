import type { Track } from "@/lib/content/types";

export const path: Track = {
  slug: "path-forward",
  title: "Your Path Forward",
  tagline: "How to practise for real, and what the timeline honestly looks like.",
  description:
    "You've done the reading. This closing track is about what to do with it: how to choose a paper-trading platform, how to structure practice so it actually builds skill rather than screen time, and a realistic picture of how long it takes to become consistently good.",
  icon: "path",
  order: 6,
  level: "Closing",
  modules: [
    {
      slug: "practising-for-real",
      title: "Practising for real",
      summary: "Where to practise, how to structure it, and how long it actually takes.",
      lessons: [
        /* ------------------------------------------------------------ 6.1 */
        {
          slug: "how-to-practise",
          title: "How to practise properly",
          subtitle: "Choosing a platform, and a practice plan that builds skill instead of hours",
          minutes: 8,
          blocks: [
            {
              type: "p",
              text: "MarketLab deliberately has no simulator. There are plenty of good ones, they're free, and building a worse version inside a course would just be a toy. What this lesson gives you is the thing those platforms don't: **a structure for using one properly.**",
            },
            {
              type: "p",
              text: "That distinction matters more than it sounds. Most people open a demo account, click buttons for two weeks, get bored, and conclude they've practised. They haven't — they've generated screen time. Practice requires a hypothesis, a record, and a review.",
            },
            { type: "h", level: 2, text: "Choosing a platform" },
            {
              type: "p",
              text: "You don't need the best one; you need one that doesn't teach you bad habits. Judge on these:",
            },
            {
              type: "table",
              headers: ["Look for", "Why it matters"],
              rows: [
                ["Realistic spreads and commissions", "A simulator with zero costs will make a losing strategy look profitable. This is the single most important feature."],
                ["Real-time or genuinely delayed real data", "Some demos use idealised data with impossibly clean fills. You want the messiness."],
                ["A proper order ticket", "Market, limit, stop and stop-limit, with a position-size field. If you can't place a real stop, you can't practise risk management."],
                ["Bar-replay mode", "Replaying historical data bar-by-bar lets you get 200 trades of experience in a week instead of a year. The single most underrated learning tool available."],
                ["Exportable trade history", "You need the data for your journal. A platform you can't export from makes review manual and therefore optional."],
                ["No leverage by default", "A demo that hands you 100:1 leverage teaches position sizing habits that will destroy a real account."],
              ],
            },
            {
              type: "callout",
              variant: "desk",
              title: "The categories, without naming names",
              body: [
                "**Charting platforms with paper trading built in** — best charts, good bar replay, usually free at the basic tier. Best all-round starting point.",
                "**Broker demo accounts** — most realistic execution, since it's the platform you'd eventually use for real. Often time-limited, and the ones attached to leveraged CFD brokers deserve particular caution.",
                "**Dedicated simulators and replay tools** — strongest for bar replay and structured drilling; usually paid.",
                "Whatever you choose, check the costs are realistic before you trust a single result.",
              ],
            },
            { type: "h", level: 2, text: "The practice plan" },
            {
              type: "p",
              text: "Twelve weeks, structured. This is deliberately slower than most people want, and it's the sequence that actually produces competence.",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Weeks 1–2: Read charts, place nothing",
                  body: "Every day, mark up three charts: trend structure, support and resistance [[zone|zones]], any patterns present. No trades. Screenshot each one, then check back a week later and see what actually happened. You're calibrating your reading against reality, which is impossible once money is involved.",
                },
                {
                  title: "Weeks 3–4: Write the strategy",
                  body: "One setup. Entry criteria, invalidation, position size formula, exit rules — the checklist from the Strategy track. Specific enough that a stranger could apply it. Do not proceed until this exists on paper.",
                },
                {
                  title: "Weeks 5–8: Bar replay, 100 trades",
                  body: "Replay historical data bar-by-bar with the right side hidden. Take every trade your rules produce — including the ones you don't like. Log all of them. This is the highest-value phase and it's the one people skip.",
                },
                {
                  title: "Weeks 9–12: Forward test in real time",
                  body: "Run the same rules on live prices. Fewer trades, and much harder, because now you're waiting rather than clicking replay. This tests the thing replay can't: whether you'll follow the rules when there's nothing to do.",
                },
                {
                  title: "Then: review, honestly",
                  body: "100+ logged trades is enough to compute expectancy. Positive with acceptable drawdown, and a plan-adherence rate above 90%? You have something. Negative, or adherence below 70%? The problem is identified, and it's usually discipline rather than the strategy.",
                },
              ],
            },
            {
              type: "callout",
              variant: "warn",
              title: "What makes paper trading misleading",
              body: [
                "It's a genuinely useful tool with two honest limitations you should hold in mind:",
                "**Fills are optimistic.** Simulators generally fill you at the price you asked for. Real markets give you slippage, partial fills and gaps. Assume live results will be worse.",
                "**The emotions are absent.** Paper trading cannot reproduce the feeling of a real loss, which is precisely the thing that breaks discipline. What it *can* do is build the mechanical habits — sizing by formula, placing stops, journaling — so that when emotion does arrive, the process is already automatic.",
              ],
            },
            { type: "h", level: 2, text: "Deliberate practice, not screen time" },
            {
              type: "p",
              text: "The research on skill acquisition is consistent: hours alone don't produce expertise. What produces it is practice with a specific target, immediate feedback, and correction. Applied here:",
            },
            {
              type: "list",
              items: [
                "**Practise one thing at a time.** A week of only identifying trend structure beats a week of vaguely trading everything.",
                "**Get feedback fast.** Bar replay gives you the outcome in seconds instead of weeks — that compression is the entire reason it works so well.",
                "**Study your losses specifically.** Group them: bad setup, bad entry, bad exit, or plan violation? The categories point at different fixes.",
                "**Stay slightly uncomfortable.** If every trade feels obvious, you're replaying what you already know rather than building anything new.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Choose a platform with realistic costs, real order types and bar replay. Then follow a structure: two weeks reading charts without trading, two writing the strategy, four in bar replay taking 100 logged trades, four forward testing live. Paper trading's fills are optimistic and its emotions absent — its real job is making the mechanical habits automatic before money is involved.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "What's the most important feature to check in a paper-trading platform?",
              options: [
                "The number of indicators available",
                "That it applies realistic spreads and commissions",
                "A mobile app",
                "How much virtual money it gives you",
              ],
              answer: 1,
              explain:
                "Zero-cost simulation makes losing strategies look profitable, which is worse than no practice at all — you'd be building confidence in something that doesn't work.",
            },
            {
              id: "q2",
              prompt: "Why is bar replay considered the highest-value practice tool?",
              options: [
                "It guarantees profitable trades",
                "It compresses months of feedback into days while keeping the future genuinely hidden",
                "It removes the need for a strategy",
                "It simulates emotions accurately",
              ],
              answer: 1,
              explain:
                "Fast, honest feedback is what drives skill acquisition. Replay gives you 200 decisions in a week with the right side of the chart still hidden.",
            },
            {
              id: "q3",
              prompt: "What are the two honest limitations of paper trading?",
              options: [
                "It's too slow and too expensive",
                "Fills are optimistic, and the emotional pressure of real money is absent",
                "It uses fake charts and fake companies",
                "It only works for long-term investing",
              ],
              answer: 1,
              explain:
                "Both are real, and neither makes it useless. Its job is making sizing, stops and journaling automatic before emotion enters the picture.",
            },
            {
              id: "q4",
              prompt: "Why does the plan begin with two weeks of marking up charts without placing any trades?",
              options: [
                "To build patience as a virtue",
                "To calibrate your chart reading against what actually happened, which becomes impossible once a position is involved",
                "Because platforms need setup time",
                "To satisfy regulatory requirements",
              ],
              answer: 1,
              explain:
                "Once you hold a position, you stop reading the chart and start looking for evidence you're right. Reading without stakes is the only way to test the reading itself.",
            },
          ],
        },

        /* ------------------------------------------------------------ 6.2 */
        {
          slug: "realistic-timeline",
          title: "What the timeline honestly looks like",
          subtitle: "How long it takes, what progress feels like, and how to tell if it's working",
          minutes: 7,
          blocks: [
            {
              type: "p",
              text: "Most trading education is vague about timelines, because the honest answer isn't a good sales pitch. Here it is anyway.",
            },
            { type: "h", level: 2, text: "The realistic phases" },
            {
              type: "table",
              caption:
                "Rough, and highly variable. The point isn't the specific durations — it's that every phase is longer than people expect, and the last one has no end.",
              headers: ["Phase", "Roughly", "What's happening"],
              rows: [
                ["Learning the language", "1–3 months", "Charts, order types, terminology. You are here, or nearly through it."],
                ["Structured practice", "3–6 months", "Paper trading with a written strategy and a journal. Building mechanical habits."],
                ["Finding an edge", "6–24 months", "Testing approaches, discarding most, finding something with positive expectancy that suits you."],
                ["Trading it consistently", "1–3 years", "The hard part. Following your own rules through drawdowns, without adjusting them mid-slump."],
                ["Adapting as markets change", "Ongoing", "Edges decay. What worked in one regime stops working. This phase never ends."],
              ],
            },
            {
              type: "p",
              text: "That's years, not months, and the largest block of time is spent on execution rather than knowledge. Knowing what to do and doing it consistently are separated by a gap that reading cannot close.",
            },
            { type: "h", level: 2, text: "What progress actually feels like" },
            {
              type: "p",
              text: "Not a rising equity curve. It feels like this:",
            },
            {
              type: "list",
              items: [
                "**You take fewer trades.** Early on, everything looks like a setup. Later, you'll go a week without one and be comfortable — because you can now tell the difference.",
                "**Losses stop feeling personal.** A stop-out becomes an outcome you'd already accounted for rather than evidence you were stupid.",
                "**You can explain every trade in one sentence.** Setup, invalidation, target. If you can't, you don't take it.",
                "**You stop looking for a better indicator.** The search for a magic setting is a phase almost everyone goes through, and leaving it is a milestone.",
                "**Your journal gets boring.** Same setups, same sizing, same process. Boring is what a working process looks like from the inside.",
              ],
            },
            {
              type: "callout",
              variant: "desk",
              title: "The measure that matters before profit",
              body: [
                "For at least the first year, judge yourself on **plan adherence, not profit.** What percentage of your trades followed your written rules?",
                "It's the better metric because it's within your control and it's not corrupted by luck. Profit over a small sample tells you about market conditions; adherence tells you about you. Get adherence above 90% and the profitability question becomes answerable — because now you're actually testing your strategy rather than testing your discipline.",
              ],
            },
            { type: "h", level: 2, text: "Signs it's not working" },
            {
              type: "p",
              text: "Worth knowing in advance, while you can still recognise them honestly:",
            },
            {
              type: "list",
              items: [
                "You've changed strategy more than twice in three months. That's not searching for an edge — it's avoiding the discomfort of a drawdown.",
                "You've stopped journaling. Almost always the first thing to go, and almost always precedes the losses.",
                "You're trading larger after losses rather than after a documented improvement in expectancy.",
                "You can't state your last trade's invalidation price from memory.",
                "Trading is affecting your sleep, your schoolwork, or your mood on days you haven't traded.",
              ],
            },
            {
              type: "callout",
              variant: "warn",
              body: [
                "That last one is the one to take seriously. Markets are genuinely engaging, and for some people that engagement becomes compulsive in a way that looks identical to dedication from the outside. If checking prices has become something you can't stop doing, the problem isn't your strategy. Step away, talk to someone, and treat it as what it is.",
              ],
            },
            { type: "h", level: 2, text: "What to do right now" },
            {
              type: "p",
              text: "You're probably not old enough to open a brokerage account, and that's genuinely an advantage. You have the one thing experienced traders wish they'd had: **time to learn without money at stake.**",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Start the journal today",
                  body: "Hypothetical trades, marked-up charts, written reasoning before the outcome. A spreadsheet is enough. In two years you'll have a record most traders never build.",
                },
                {
                  title: "Learn the mechanics on a demo",
                  body: "Order types, position sizing by formula, placing real stops. These should be muscle memory long before real money exists.",
                },
                {
                  title: "Build the long-term base first",
                  body: "When you can invest, the evidence points at a boring core: broad index funds, bought regularly, held for decades. Active trading, if you pursue it, belongs alongside that — small, deliberately sized, with money you can genuinely afford to lose.",
                },
                {
                  title: "Keep reading beyond this site",
                  body: "Market Wizards for how professionals actually think. Trading in the Zone for the psychology. Reminiscences of a Stock Operator for the fact that none of this is new. And the primary sources from the evidence lesson — reading the actual research is a habit worth having.",
                },
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "The realistic timeline is years, and most of it is spent on execution rather than knowledge. Progress looks like taking fewer trades, losing without it feeling personal, and a boring journal. Judge yourself on plan adherence before profit. And the time before you can trade with real money is an advantage — use it to build the record and the habits.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "Which phase typically takes longest?",
              options: [
                "Learning terminology and chart basics",
                "Finding a strategy with positive expectancy",
                "Executing your own rules consistently through drawdowns",
                "Choosing a broker",
              ],
              answer: 2,
              explain:
                "Knowledge is the fast part. The gap between knowing what to do and doing it consistently is where years go, and reading can't close it.",
            },
            {
              id: "q2",
              prompt: "Why is plan adherence a better early metric than profit?",
              options: [
                "Profit is impossible to measure accurately",
                "Adherence is within your control and isn't corrupted by luck, whereas profit over a small sample mostly reflects market conditions",
                "Brokers report adherence automatically",
                "Adherence predicts returns exactly",
              ],
              answer: 1,
              explain:
                "Until adherence is high, you're testing your discipline rather than your strategy — so the profitability question isn't yet answerable.",
            },
            {
              id: "q3",
              prompt: "You've changed strategy three times in three months. What does that suggest?",
              options: [
                "Healthy experimentation",
                "That you're avoiding the discomfort of drawdowns rather than testing anything properly",
                "You're adapting well to changing markets",
                "Nothing — strategies should change often",
              ],
              answer: 1,
              explain:
                "Every strategy has losing stretches. Abandoning each one during its drawdown guarantees you experience only the losing part of every approach you try.",
            },
            {
              id: "q4",
              prompt: "What does genuine progress typically look like?",
              options: [
                "Taking more trades as you spot more opportunities",
                "Fewer trades, losses that don't feel personal, and a journal that's become boring",
                "Finding an indicator that finally works",
                "A steadily rising account balance from month one",
              ],
              answer: 1,
              explain:
                "Selectivity, emotional neutrality and a repetitive process are what a working method looks like from the inside. Boring is the goal.",
            },
            {
              id: "q5",
              prompt: "You're 16 and can't open a brokerage account yet. How should you view that?",
              options: [
                "As a barrier delaying your progress",
                "As an advantage — time to build habits, a journal and a track record with nothing at stake",
                "As a reason to use an offshore broker",
                "As irrelevant to learning",
              ],
              answer: 1,
              explain:
                "The years before real money are the ones experienced traders wish they'd had. Skill built without stakes is skill you keep once the stakes arrive.",
            },
          ],
        },
      ],
    },
  ],
};
