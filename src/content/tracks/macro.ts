import type { Track } from "@/lib/content/types";

export const macro: Track = {
  slug: "macro",
  title: "Macro & News Literacy",
  tagline: "Why prices move when nothing about the company changed.",
  description:
    "Most large market moves have nothing to do with charts. Interest rates reprice everything, scheduled data releases produce the year's most violent hours, and earnings day punishes anyone who confuses good results with good news. This track teaches you to read the macro picture and to tell a market-moving headline from noise.",
  icon: "macro",
  order: 5,
  level: "Advanced",
  modules: [
    {
      slug: "what-moves-markets",
      title: "What moves markets",
      summary: "Rates, data releases and earnings — the three engines of large moves.",
      lessons: [
        /* ------------------------------------------------------------ 5.1 */
        {
          slug: "interest-rates",
          title: "How interest rates move everything",
          subtitle: "The gravitational constant of financial markets",
          minutes: 8,
          blocks: [
            {
              type: "p",
              text: "If you understand one macroeconomic idea, make it this one. The [[interest rate]] set by a [[central bank]] is the single variable with the widest reach in finance — change it and every asset on earth reprices, including ones that have nothing to do with borrowing.",
            },
            { type: "h", level: 2, text: "Why rates touch everything" },
            {
              type: "p",
              text: "Two mechanisms, and they compound.",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Future money is worth less when rates are high",
                  body: "A share is a claim on future profits. To value it you discount those future profits back to today, and the discount rate is anchored to the interest rate. Raise rates and every future pound is worth less today — so the share price falls even if the business is unchanged.",
                },
                {
                  title: "Cash becomes a real competitor",
                  body: "When a savings account pays 0.5%, owning volatile shares is an easy decision. When it pays 5% guaranteed, the bar for taking equity risk rises sharply — and money flows out of stocks and into deposits and bonds.",
                },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Why growth stocks fall hardest",
              body: [
                "A utility company earns most of its profit in the next few years. A high-growth technology company's value is mostly in profits expected a decade out.",
                "Discounting hits distant cash flows much harder than near ones, so the same rate rise damages the growth company far more. This is the mechanical reason technology sells off hardest when rates rise — it isn't sentiment.",
              ],
            },
            { type: "h", level: 2, text: "The chain of causation" },
            {
              type: "p",
              text: "Almost every macro story you'll read is a link in one chain. Learn the chain and most headlines decode themselves.",
            },
            {
              type: "table",
              caption:
                "Read it right to left too: when you see stocks fall on 'good' economic data, this chain is why.",
              headers: ["Step", "What happens"],
              rows: [
                ["Economic data", "Inflation or employment comes in above or below expectations"],
                ["Rate expectations", "Traders reprice how likely and how fast the central bank cuts or hikes"],
                ["Bond yields", "[[Bond|Bonds]] reprice immediately — yields move within seconds"],
                ["Currency", "Higher relative rates attract capital, strengthening the currency"],
                ["Equities", "Discount rate changes; growth sectors move most"],
                ["Everything else", "Gold, crypto, property, commodities all reprice against the new risk-free rate"],
              ],
            },
            {
              type: "p",
              text: "This explains something that confuses beginners constantly: **strong economic data can send stocks down.** Strong data means less need for rate cuts, which means a higher discount rate, which means lower valuations. The economy got better and your shares fell. It's not irrational; it's the chain doing its job.",
            },
            { type: "h", level: 2, text: "Inflation is the input" },
            {
              type: "p",
              text: "[[Inflation]] drives the rate decision, which is why inflation data is the highest-impact release on the calendar. Central banks typically target around 2%. Above it persistently, they raise rates to slow the economy; well below it, they cut to stimulate.",
            },
            {
              type: "p",
              text: "The important subtlety: markets don't react to whether inflation is high. They react to whether it was **higher or lower than expected**. A 3.4% print when 3.1% was the [[consensus]] is bearish for equities even though 3.4% might be the lowest reading in two years.",
            },
            { type: "h", level: 2, text: "Bonds tell you what's happening" },
            {
              type: "p",
              text: "Bond yields are the market's live vote on future rates and inflation. When the 10-year yield jumps, the reason for an equity selloff is usually right there — and the bond market generally moves first, because it's where the rate view is expressed most directly.",
            },
            {
              type: "callout",
              variant: "desk",
              body: [
                "A habit worth building early: **when stocks move sharply and you don't know why, check the 10-year yield first.** It explains more equity moves than equity commentary does, and it's a single number.",
              ],
            },
            {
              type: "p",
              text: "One more thing bonds do: they invert. Normally longer-dated bonds yield more than short-dated ones — you demand more for lending longer. When short yields exceed long ones, the market is saying it expects rates to be much lower in future, which usually means it expects a recession. The inverted yield curve has preceded most US recessions of the past half century, though with lead times long and variable enough that it's a poor timing tool.",
            },
            { type: "h", level: 2, text: "Risk-on and risk-off" },
            {
              type: "p",
              text: "You'll see [[risk-on / risk-off]] constantly. It's shorthand for the market's collective appetite for risk, and it's useful because assets move in recognisable groups:",
            },
            {
              type: "cards",
              items: [
                {
                  title: "Risk-on",
                  subtitle: "Optimism",
                  bullets: [
                    "Stocks up, especially growth and small-cap",
                    "Crypto up, often more than stocks",
                    "Government bonds down (yields up)",
                    "Gold and safe-haven currencies weak",
                  ],
                },
                {
                  title: "Risk-off",
                  subtitle: "Fear — and it's faster",
                  bullets: [
                    "Stocks down, high-growth worst",
                    "Crypto down hard — it's the risk asset",
                    "Government bonds up (yields down)",
                    "Dollar, yen, franc and gold bid",
                  ],
                },
              ],
            },
            {
              type: "callout",
              variant: "warn",
              body: [
                "This matters for risk management, not just commentary. In risk-off conditions [[correlation|correlations]] converge toward 1 — the diversification you thought you had disappears exactly when you need it. Holding tech stocks, crypto and an emerging-market fund feels diversified and is essentially one bet on risk appetite.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Interest rates reprice every asset through two channels: the discount applied to future profits, and the return available on cash. Data drives rate expectations, which drive bonds, currencies and equities in that order — which is why strong economic data can push stocks down. Markets react to surprises against consensus, not to absolute levels.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "Why do high-growth technology stocks typically fall more than utilities when rates rise?",
              options: [
                "Technology companies borrow more",
                "Their value sits mostly in distant future profits, which discounting reduces far more than near-term profits",
                "Utilities are exempt from rate changes",
                "Technology investors panic more easily",
              ],
              answer: 1,
              explain:
                "It's arithmetic, not sentiment. Discounting compounds over time, so a rate rise hits a cash flow ten years out far harder than one arriving next year.",
            },
            {
              id: "q2",
              prompt: "Unemployment falls and wage growth accelerates. Stocks drop. Why?",
              options: [
                "The data must have been misreported",
                "A stronger economy means less need for rate cuts, so the discount rate applied to equities rises",
                "Higher wages mechanically reduce company profits to zero",
                "Investors sell on all news regardless of content",
              ],
              answer: 1,
              explain:
                "Good economic news is bad market news when it removes the case for cuts. Following the chain — data, rate expectations, bonds, equities — makes this predictable rather than baffling.",
            },
            {
              id: "q3",
              prompt: "Inflation prints at 3.4% when 3.1% was expected — the lowest reading in two years. How should equities react?",
              options: [
                "Rally, because inflation is at a two-year low",
                "Fall, because the number was above expectations and only the surprise is new information",
                "Not move, because it's within a normal range",
                "Rally, because two-year lows are always bullish",
              ],
              answer: 1,
              explain:
                "The 3.1% was already [[priced in]]. Only the 0.3-point surprise carries new information, and it points toward rates staying higher for longer.",
            },
            {
              id: "q4",
              prompt: "Stocks drop sharply and you don't know why. What's the most efficient first check?",
              options: [
                "Social media sentiment",
                "The 10-year government bond yield",
                "Yesterday's volume",
                "The 200-day moving average",
              ],
              answer: 1,
              explain:
                "Bond yields are where rate expectations are expressed most directly and they usually move first. A single number explains a large share of unexplained equity moves.",
            },
            {
              id: "q5",
              prompt: "You hold technology stocks, crypto and an emerging-market fund. How diversified are you in a risk-off event?",
              options: [
                "Well diversified — three different asset classes",
                "Barely — these correlate strongly in risk-off conditions and behave as one bet on risk appetite",
                "Fully hedged",
                "It depends on the currency",
              ],
              answer: 1,
              explain:
                "[[Correlation]] converges toward 1 in a crisis, which is exactly when diversification is supposed to protect you. Three risk assets are one position wearing three hats.",
            },
          ],
        },

        /* ------------------------------------------------------------ 5.2 */
        {
          slug: "economic-calendar",
          title: "Reading an economic calendar",
          subtitle: "CPI, NFP, FOMC — and why traders mostly use the calendar to stay out",
          minutes: 7,
          blocks: [
            {
              type: "p",
              text: "An [[economic calendar]] lists upcoming data releases with the time, the previous value, and the [[consensus]] forecast. Every trading platform has one, and most beginners ignore it — which is how people end up holding a position through the most violent ten minutes of the month by accident.",
            },
            { type: "h", level: 2, text: "The releases that matter" },
            {
              type: "table",
              headers: ["Release", "What it measures", "When", "Why it moves markets"],
              rows: [
                ["[[CPI]]", "Consumer price inflation", "Monthly", "The main input to rate decisions — usually the highest-impact number of the month"],
                ["[[NFP]]", "US jobs added, excluding farms", "First Friday", "Employment strength drives wage growth, which drives inflation"],
                ["[[FOMC]]", "US rate decision + projections", "8× a year", "The decision itself is usually priced in; the projections and press conference aren't"],
                ["GDP", "Total economic output", "Quarterly", "Confirms the growth picture, though it's backward-looking"],
                ["PMI", "Business activity surveys", "Monthly", "Forward-looking — surveys of purchasing managers lead official data"],
                ["Retail sales", "Consumer spending", "Monthly", "Consumption is the largest component of most developed economies"],
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "Three numbers, one that matters",
              body: [
                "Every entry shows **previous**, **consensus** and, after release, **actual**. Price reacts to `actual − consensus`. Previous is context only.",
                "Watch for revisions too. A strong jobs number alongside a large downward revision to last month's figure is often net negative, and the first automated reaction frequently gets it wrong for a minute or two.",
              ],
            },
            { type: "h", level: 2, text: "What a release actually looks like" },
            {
              type: "chart",
              spec: {
                scenario: "news-spike",
                seed: 404,
                bars: 78,
                symbol: "ES",
                timeframe: "5m",
                height: 300,
                showVolume: true,
                markers: [{ anchor: "bar.spike", text: "release", position: "above", kind: "warn" }],
              },
              caption:
                "Index futures across a scheduled release. Note the shape: near-zero volatility beforehand as participants stand aside, a violent spike, then a partial retracement as considered positioning replaces automated reaction.",
            },
            {
              type: "p",
              text: "Three things happen in that window that should worry any trader holding a position through it:",
            },
            {
              type: "list",
              items: [
                "**Spreads widen dramatically.** Market makers pull quotes when they don't know where price is going. A spread that is normally one tick can become ten.",
                "**Slippage is severe.** A [[stop order]] triggered in that spike converts to a market order and fills wherever there's liquidity, which can be far from your trigger.",
                "**Direction is close to random in the first seconds.** The initial move is dominated by automated execution and triggered stops, and reversals within a minute are common.",
              ],
            },
            { type: "h", level: 2, text: "How experienced traders use it" },
            {
              type: "p",
              text: "Almost entirely defensively. This surprises people who expect it to be a trading opportunity.",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Check it before every session",
                  body: "Thirty seconds. What's out today, and at what time? This is the entire habit.",
                },
                {
                  title: "Don't open new positions right before a high-impact release",
                  body: "You're taking a coin flip with a widened spread attached, which is a negative-expectancy bet regardless of your analysis.",
                },
                {
                  title: "Reduce or close existing positions",
                  body: "Or accept the risk deliberately, with a size that assumes your stop fills badly. The mistake is holding through it without having decided to.",
                },
                {
                  title: "Wait for the dust to settle",
                  body: "Many traders don't act for 15–30 minutes after a major release. The move that holds is more informative than the move that spikes.",
                },
              ],
            },
            {
              type: "callout",
              variant: "desk",
              body: [
                "There's a real disagreement here worth knowing about. Some traders specialise in news events, trading the volatility deliberately. It can be done — but it demands fast execution, wide stops sized for the spread, and acceptance of severe slippage. It's a specialist discipline, not a general-purpose technique, and it's a poor place for anyone to start.",
              ],
            },
            { type: "h", level: 2, text: "The stock-specific calendar" },
            {
              type: "p",
              text: "Individual shares have their own scheduled event: [[earnings]]. The principle is identical but the risk is higher, because earnings land outside market hours and produce [[gap|gaps]] your stop cannot protect you from.",
            },
            {
              type: "p",
              text: "The rule most swing traders follow is simple and absolute: **know when every position you hold reports, and decide deliberately whether to be in it.** Holding through earnings without meaning to is one of the most common unforced errors there is.",
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "The calendar shows previous, consensus and actual — only `actual − consensus` moves price. Scheduled releases produce widened spreads, severe slippage and near-random initial direction. Experienced traders use the calendar defensively: check it every session, avoid opening into high-impact events, and always know when your holdings report earnings.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "An economic calendar shows previous 3.2%, consensus 3.0%, actual 3.1%. How should markets react?",
              options: [
                "Bullishly — inflation fell from 3.2%",
                "Bearishly — 3.1% is above the 3.0% consensus, so it's a hawkish surprise",
                "No reaction — it's between the two",
                "Bullishly — any fall is good",
              ],
              answer: 1,
              explain:
                "Price is set against consensus, not against last month. The fall from 3.2% was already expected and priced; the 0.1 point miss is the new information.",
            },
            {
              id: "q2",
              prompt: "Why is placing a market order seconds after a major release dangerous?",
              options: [
                "Exchanges block orders during releases",
                "Spreads widen sharply and liquidity thins, so fills can be far from the quoted price",
                "Orders are queued and executed hours later",
                "It isn't — that's the best time to trade",
              ],
              answer: 1,
              explain:
                "Market makers withdraw quotes when uncertainty peaks. Crossing a spread ten times its normal width is a large, avoidable cost.",
            },
            {
              id: "q3",
              prompt: "How do most experienced traders primarily use the economic calendar?",
              options: [
                "To find trading opportunities in volatility",
                "Defensively — to know when not to have exposure",
                "To predict the direction of the release",
                "They ignore it and trade the chart",
              ],
              answer: 1,
              explain:
                "Its main value is knowing when *not* to be exposed. Trading releases deliberately is a specialist discipline requiring fast execution and wide, deliberately sized stops.",
            },
            {
              id: "q4",
              prompt: "Why is earnings risk on an individual share worse than a scheduled macro release?",
              options: [
                "Earnings are unscheduled",
                "Earnings land outside market hours, producing gaps that stops cannot protect against",
                "Earnings affect more assets",
                "Earnings reports are less reliable",
              ],
              answer: 1,
              explain:
                "A [[gap]] means no trading occurred between the two prices. A stop triggers at the open and fills at whatever the first available price is.",
            },
          ],
        },

        /* ------------------------------------------------------------ 5.3 */
        {
          slug: "earnings-season",
          title: "Earnings: why good numbers can send a stock down",
          subtitle: "Expectations, guidance, and the most predictable volatility on the calendar",
          minutes: 8,
          blocks: [
            {
              type: "p",
              text: "Four times a year, public companies report results. For a few weeks the market's attention shifts from macro to individual businesses, and individual shares produce their largest single-day moves of the year.",
            },
            {
              type: "p",
              text: "The reaction is where beginners get confused, because it routinely looks backwards. A company posts record profits and drops 12%. Another misses badly and rallies 8%. Neither is irrational once you know what's being priced.",
            },
            { type: "h", level: 2, text: "What's actually being judged" },
            {
              type: "p",
              text: "Four things, roughly in order of importance:",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Guidance for the coming quarters",
                  body: "Usually the most important item in the whole release. You own a claim on future profits, so a company's own forecast for the future matters more than the quarter that just ended. Weak [[guidance]] routinely sinks a stock that beat on everything else.",
                },
                {
                  title: "Results versus consensus",
                  body: "Not versus last year — versus what analysts expected, which is already in the price. Beating by a wide margin matters; beating by a penny usually doesn't.",
                },
                {
                  title: "The quality of the numbers",
                  body: "Profit growth from genuine sales growth is valued very differently from profit growth from cost-cutting. Analysts dig into margins and segment detail on the call, which is why a stock can reverse direction an hour after the release.",
                },
                {
                  title: "Positioning going in",
                  body: "A stock that has already risen 30% into the report needs a spectacular result to justify it. The bar isn't the consensus number — it's whatever is already priced in.",
                },
              ],
            },
            {
              type: "chart",
              spec: {
                scenario: "earnings-gap",
                seed: 27,
                bars: 90,
                symbol: "TRVN",
                timeframe: "1D",
                height: 320,
                showVolume: true,
                markers: [{ anchor: "bar.gap", text: "earnings", position: "above", kind: "down" }],
              },
              caption:
                "Price drifted higher into the report, then gapped down 6.5% on results that beat expectations. The rise beforehand was the market pricing in a good result — leaving nothing to buy once it arrived.",
            },
            { type: "h", level: 2, text: "The mechanics of the gap" },
            {
              type: "p",
              text: "Companies report outside market hours deliberately, so the information can be absorbed without a disorderly session. The consequence for traders is a [[gap]]: the stock closed at £52.40 and opens at £48.90, with **no trading at any price in between**.",
            },
            {
              type: "callout",
              variant: "warn",
              title: "This is the clearest limit of a stop-loss",
              body: [
                "A stop at £51 doesn't sell at £51. It triggers at the open and fills near £48.90 — your realised loss is roughly double what you planned.",
                "There is no order type that fixes this. The only defences are not holding through the event, or sizing the position small enough that a gap of this size is survivable. Most swing traders simply close before earnings.",
              ],
            },
            { type: "h", level: 2, text: "Implied moves" },
            {
              type: "p",
              text: "Options markets publish an expected move for earnings — you'll see \"the options market is pricing a ±7% move.\" That number is genuinely useful even if you never trade options: it tells you the size of the swing the market considers normal for this event.",
            },
            {
              type: "p",
              text: "If a stock is priced for ±7% and moves 3%, that's a *small* reaction even though 3% is a big day in normal terms. This reframes what \"a big move\" means during earnings season, and it's the first thing a professional checks before deciding whether a reaction was actually a surprise.",
            },
            { type: "h", level: 2, text: "Sector read-through" },
            {
              type: "p",
              text: "One company's report is treated as evidence about every similar company. A retailer reporting weak consumer demand drags the whole sector down before those companies have said anything.",
            },
            {
              type: "p",
              text: "That has a direct risk-management consequence, and it's the same one from the trading plan lesson: **holding five stocks in one sector is not five positions.** During earnings season, one report can move all five together.",
            },
            {
              type: "callout",
              variant: "desk",
              title: "The practical rules",
              body: [
                "**Know when every holding reports.** Non-negotiable, and it takes seconds to check.",
                "**Decide deliberately.** Hold through it, or close before it — either is defensible. Doing it by accident is not.",
                "**Don't expect to predict the reaction.** Even analysts with full models and management access get direction wrong routinely, because they're predicting a reaction to a surprise relative to positioning they can't fully observe.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Earnings reactions price the surprise against expectations and, above all, the guidance for coming quarters — which is why record results can send a stock down. Reports land outside market hours, so the gap risk cannot be managed with any order type, only with position size or by not holding through it.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "A company beats profit expectations but lowers next-quarter guidance. The stock falls. Why?",
              options: [
                "Guidance is unimportant; the market overreacted",
                "You own a claim on future profits, so a lowered forecast reduces the value of what you own more than a beaten past quarter increases it",
                "Beating expectations always triggers profit-taking",
                "Guidance changes are illegal to price in",
              ],
              answer: 1,
              explain:
                "The reported quarter is history and was largely anticipated. [[Guidance]] is the new information about the future you actually own.",
            },
            {
              id: "q2",
              prompt: "A stock has risen 30% into its earnings report and then falls on a solid beat. What's the explanation?",
              options: [
                "The results were secretly bad",
                "A good result was already priced in by the run-up, so meeting it gave buyers no reason to keep buying and gave early buyers a reason to sell",
                "The exchange mispriced the open",
                "Analysts changed their estimates after the fact",
              ],
              answer: 1,
              explain:
                "The bar isn't consensus — it's whatever is already in the price. This is the same mechanism as 'buy the rumour, sell the news'.",
            },
            {
              id: "q3",
              prompt: "The options market prices a ±8% earnings move. The stock moves 3%. How should you read that?",
              options: [
                "A large reaction — 3% is a big day",
                "A small reaction relative to what was expected",
                "The options market was wrong",
                "The stock will move another 5%",
              ],
              answer: 1,
              explain:
                "The implied move sets the scale for what counts as normal for this event. Against ±8%, a 3% move means the result was close to what was already expected.",
            },
            {
              id: "q4",
              prompt: "You hold a stock with a stop at £51. It closes at £52.40 and opens at £48.90 after earnings. What happens?",
              options: [
                "You're filled at £51",
                "The stop is cancelled",
                "The stop triggers at the open and fills near £48.90 — roughly double the planned loss",
                "The broker covers the difference",
              ],
              answer: 2,
              explain:
                "No trading occurred between the two prices, so there was no £51 to fill at. This is the clearest limit of stop-losses and the reason most swing traders close before earnings.",
            },
          ],
        },
      ],
    },

    {
      slug: "reading-the-news",
      title: "Reading the news",
      summary: "Market-behaviour patterns, and telling signal from noise.",
      lessons: [
        /* ------------------------------------------------------------ 5.4 */
        {
          slug: "market-behaviour-patterns",
          title: "Buy the rumour, sell the news — and other patterns worth knowing",
          subtitle: "Recurring market behaviours, explained by who was already positioned",
          minutes: 7,
          blocks: [
            {
              type: "p",
              text: "Certain patterns recur often enough to have names. None is a trading system, and treating them as one will cost you money. They're useful as **explanations** — ways of not being baffled when price does the opposite of what the headline suggests.",
            },
            { type: "h", level: 2, text: "Buy the rumour, sell the news" },
            {
              type: "p",
              text: "The most important one. An asset rallies in anticipation of an expected positive event, then falls when it actually happens.",
            },
            {
              type: "p",
              text: "**Why:** traders position ahead of the event. By the time it arrives, everyone who was going to buy has bought — there's no new demand. Meanwhile everyone who bought early has their profit and a reason to take it. The event confirms what was expected, and confirmation is worth nothing to a market that already priced it.",
            },
            {
              type: "story",
              title: "The shape it takes",
              beats: [
                { label: "Six weeks out", text: "A widely anticipated product launch is announced for a specific date. The stock begins drifting higher on the expectation." },
                { label: "Two weeks out", text: "Coverage intensifies. The stock is up 22%. Retail buying accelerates as the story becomes obvious to everyone." },
                { label: "Launch day", text: "The product is exactly as good as expected. The stock falls 5%." },
                { label: "The week after", text: "It drifts lower as early buyers finish taking profit." },
              ],
              verdict:
                "Nothing went wrong. The 22% rise **was** the market pricing the good news. Launch day contained no new information, so there was nothing left to buy and a great deal of profit to take. The lesson: **anticipated events are priced before they happen.**",
            },
            {
              type: "callout",
              variant: "note",
              body: [
                "Bitcoin's [[halving]] events are the cleanest recurring example. The supply reduction is known years in advance, down to the block. Anything knowable years ahead is [[priced in]] long before the date — which is why the halving itself is rarely the moment price moves.",
              ],
            },
            { type: "h", level: 2, text: "The others worth knowing" },
            {
              type: "cards",
              items: [
                {
                  title: "Sell the rip / buy the dip",
                  subtitle: "Regime-dependent",
                  body: "In an uptrend, dips get bought; in a downtrend, rallies get sold. Useful only if you've correctly identified which regime you're in — and applying the wrong one is how traders 'buy the dip' all the way down a bear market.",
                },
                {
                  title: "Flight to quality",
                  subtitle: "Risk-off in one phrase",
                  body: "In a crisis, capital moves to government bonds, the dollar, the yen and gold — regardless of their fundamentals. It's a positioning reflex, not a valuation judgement.",
                },
                {
                  title: "Sector rotation",
                  subtitle: "Money moves, it doesn't leave",
                  body: "Capital shifts between sectors as the economic cycle turns — into defensives when growth slows, into cyclicals when it accelerates. A falling sector often means a rising one somewhere else.",
                },
                {
                  title: "Capitulation",
                  subtitle: "The end of a decline",
                  body: "The final phase of a selloff: extreme volume, a vertical drop, then a sharp reversal. It's the point where the last holders give up. Only ever identifiable afterwards — anyone claiming to spot it live is guessing.",
                },
              ],
            },
            { type: "h", level: 2, text: "Two you should be sceptical of" },
            {
              type: "callout",
              variant: "myth",
              title: "Seasonal patterns",
              body: [
                "\"Sell in May and go away.\" \"The Santa Claus rally.\" \"September is the worst month.\" These are real statistical tendencies in historical data — and they're weak, inconsistent across markets and decades, and heavily data-mined.",
                "The deeper problem: test enough calendar patterns and some will look significant by chance alone. Treat seasonality as trivia unless you've seen it hold up out-of-sample across multiple markets, and never as a reason to take a position.",
              ],
            },
            {
              type: "callout",
              variant: "myth",
              title: "\"This time it's different\"",
              body: [
                "Famously described as the four most expensive words in investing — usually deployed to justify valuations that historical relationships can't support.",
                "But the honest version is more nuanced than the slogan. Sometimes things genuinely are different: floating exchange rates, the internet, and zero-commission trading all changed market structure permanently. The error isn't believing change happens — it's using the phrase to dismiss a risk rather than to explain one.",
              ],
            },
            {
              type: "callout",
              variant: "desk",
              body: [
                "The reason to learn these is diagnostic, not predictive. When price does something that seems to contradict the news, one of these patterns usually explains it — and *understanding why you were surprised* is how you stop being surprised the same way twice.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Anticipated events are priced before they occur, which is why assets often fall on good news that everyone expected. These patterns are explanatory tools, not signals: they help you understand why price did something unexpected. Be actively sceptical of seasonal patterns, which are weak and heavily data-mined.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "A stock rises 22% ahead of a widely anticipated launch, then falls 5% on launch day. What happened?",
              options: [
                "The launch disappointed",
                "The good news was priced in during the run-up, so there was no new demand and early buyers took profit",
                "The market is irrational",
                "Institutional investors manipulated the price",
              ],
              answer: 1,
              explain:
                "The 22% rise *was* the market pricing the news. Confirming an expectation adds no information — that's 'buy the rumour, sell the news' in one sentence.",
            },
            {
              id: "q2",
              prompt: "Why is Bitcoin's halving a textbook 'priced in' event?",
              options: [
                "Because it doesn't actually reduce supply",
                "Because the date and effect are known years in advance, so the market prices it long before it happens",
                "Because it happens too rarely to matter",
                "Because exchanges suspend trading during it",
              ],
              answer: 1,
              explain:
                "Anything knowable years ahead is reflected in price long before the date. Perfect predictability is exactly what makes an event a poor trading catalyst.",
            },
            {
              id: "q3",
              prompt: "What's the appropriate level of confidence in seasonal patterns like 'sell in May'?",
              options: [
                "High — they're documented over decades",
                "Low — the effects are weak, inconsistent across markets, and heavily data-mined",
                "Absolute — they're the most reliable signals available",
                "They only work on crypto",
              ],
              answer: 1,
              explain:
                "Test enough calendar patterns and some look significant by chance. Weak, inconsistent effects are the classic signature of data mining rather than a real edge.",
            },
            {
              id: "q4",
              prompt: "What is the genuine value of learning these behaviour patterns?",
              options: [
                "They generate reliable entry signals",
                "They're diagnostic — they explain why price did something that contradicted the headline, so you're not surprised the same way twice",
                "They predict the exact size of moves",
                "They replace technical analysis",
              ],
              answer: 1,
              explain:
                "These are frameworks for understanding, not signals. Trading them mechanically is how a useful explanation becomes an expensive habit.",
            },
          ],
        },

        /* ------------------------------------------------------------ 5.5 */
        {
          slug: "headline-literacy",
          title: "Reading a headline for relevance versus noise",
          subtitle: "A filter for what actually matters, and how financial media works",
          minutes: 7,
          blocks: [
            {
              type: "p",
              text: "Financial media produces enormous volume, and most of it has no bearing on prices. Worse, a great deal of it is written *after* a move to explain it — which makes it sound predictive when it's descriptive.",
            },
            {
              type: "p",
              text: "The filter below is four questions. It takes about ten seconds per headline and it removes most of the noise.",
            },
            { type: "h", level: 2, text: "The four questions" },
            {
              type: "steps",
              items: [
                {
                  title: "Is this new information, or already known?",
                  body: "\"Company announces record profits\" — was that expected? If analysts forecast it and the stock rose 15% into it, the announcement isn't news. Only surprises move prices.",
                },
                {
                  title: "Does it change future cash flows or the discount rate?",
                  body: "Those are the only two things that change what an asset is worth. A rate decision changes the discount rate. A lost major contract changes cash flows. A CEO's opinion about their industry's future changes neither.",
                },
                {
                  title: "How big is it relative to the company or economy?",
                  body: "\"Firm wins £40m contract\" is transformative for a £200m company and rounding error for a £90bn one. Headlines almost never provide this scale, and it's usually the difference between signal and noise.",
                },
                {
                  title: "Is it durable or a one-off?",
                  body: "A recurring change in demand matters far more than a single quarter's weather disruption. Markets discount one-offs quickly and reprice persistent changes properly.",
                },
              ],
            },
            { type: "h", level: 2, text: "Sorting real examples" },
            {
              type: "table",
              headers: ["Headline", "Read", "Why"],
              rows: [
                ["Central bank raises rates 0.5% against 0.25% expected", "**Signal**", "Changes the discount rate for every asset, and it's a genuine surprise"],
                ["Analyst raises price target from £50 to £58", "**Mostly noise**", "One opinion. Targets follow price far more often than they lead it"],
                ["Company loses contract worth 30% of revenue", "**Signal**", "Directly changes future cash flows, at material scale"],
                ["\"Stocks fall on inflation fears\"", "**Noise**", "Written after the move to explain it. Note there's no specific new fact in the sentence"],
                ["Regulator opens investigation into a firm's main product", "**Signal**", "Introduces genuine uncertainty about future cash flows"],
                ["\"Crypto could hit $200k, says fund manager\"", "**Noise**", "A prediction from someone who profits if you believe it"],
                ["Company suspends its dividend", "**Signal**", "A costly, credible signal about the company's own view of its cash position"],
              ],
            },
            { type: "h", level: 2, text: "How financial media actually works" },
            {
              type: "p",
              text: "Not a conspiracy — just incentives worth understanding.",
            },
            {
              type: "list",
              items: [
                "**Attention is the product.** Dramatic headlines outperform accurate ones. \"Markets drift slightly lower on light volume\" is often the truthful version of \"Investors flee stocks amid mounting fears.\"",
                "**Explanations are generated after the fact.** A journalist on deadline needs a reason for today's move. The reason is frequently constructed, and there's rarely any way to verify it.",
                "**Sources have positions.** A fund manager on television talking up an asset may well hold it. That doesn't make them dishonest, but it isn't neutral analysis either.",
                "**Novelty beats base rates.** \"Trader turns £5,000 into £400,000\" is a story. The thousands who lost aren't, because they aren't unusual.",
              ],
            },
            {
              type: "callout",
              variant: "warn",
              title: "Social media is the same problem, amplified",
              body: [
                "Anyone posting about a position they hold benefits if you buy it. Screenshots are trivially fabricated. Losing trades are silently deleted. Accounts selling courses need visible success far more than they need accurate success.",
                "The reliable filter: **does this person profit if I believe them?** If they're selling a course, a signal service, or holding the asset they're promoting, treat everything they say as marketing until proven otherwise.",
              ],
            },
            { type: "h", level: 2, text: "A sane news routine" },
            {
              type: "checklist",
              title: "For a swing trader, ten minutes a day",
              items: [
                "Check the [[economic calendar]] for today's scheduled releases.",
                "Check whether any position you hold reports earnings this week.",
                "Scan headlines for anything that passes the four questions — most days, nothing does.",
                "Check the 10-year yield and the index level to know the regime you're in.",
                "Stop. Consuming more market news does not improve decisions, and there's good evidence it degrades them by manufacturing urgency.",
              ],
            },
            {
              type: "callout",
              variant: "desk",
              body: [
                "The single most useful discipline: **when a headline makes you want to trade immediately, that's the signal to wait.** Urgency is manufactured by media incentives, and it's the emotional state in which people take the trades they most regret.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Filter every headline with four questions: is it new, does it change cash flows or the discount rate, how big is it relative to the company, and is it durable? Most financial media is written after the move to explain it, and most sources profit if you believe them. When a headline creates urgency, that's the reason to wait.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "\"Stocks fall on inflation fears.\" What should you conclude?",
              options: [
                "Inflation data was released and was bad",
                "Very little — this is a post-hoc explanation with no specific new fact in it",
                "Stocks will keep falling",
                "It's time to sell",
              ],
              answer: 1,
              explain:
                "There's no verifiable claim in the sentence. Journalists need a reason for today's move; that reason is frequently constructed after the fact.",
            },
            {
              id: "q2",
              prompt: "A £90bn company announces a £40m contract win. How significant is it?",
              options: [
                "Very — £40m is a large number",
                "Almost immaterial at that scale, though it could be transformative for a much smaller company",
                "Impossible to judge",
                "Significant because contract wins signal momentum",
              ],
              answer: 1,
              explain:
                "Scale relative to the business is the question headlines almost never answer, and it's usually the difference between signal and noise.",
            },
            {
              id: "q3",
              prompt: "Which of these is the strongest genuine signal?",
              options: [
                "An analyst raising a price target",
                "A fund manager predicting a price on television",
                "A company suspending its dividend",
                "A social media account posting a profit screenshot",
              ],
              answer: 2,
              explain:
                "Suspending a dividend is costly and credible — companies avoid it because it damages the share price, so doing it reveals genuine information about their cash position.",
            },
            {
              id: "q4",
              prompt: "What's the most reliable filter for a social media trading account?",
              options: [
                "Their follower count",
                "Whether they profit if you believe them — a course, a signal service, or a position they're promoting",
                "How confident they sound",
                "Whether they post screenshots",
              ],
              answer: 1,
              explain:
                "Follower counts, confidence and screenshots are all easily manufactured. Incentive is the one thing that's hard to fake and easy to check.",
            },
            {
              id: "q5",
              prompt: "A headline makes you want to place a trade immediately. What does that indicate?",
              options: [
                "A genuine opportunity that requires speed",
                "That you should wait — urgency is manufactured by media incentives and is the state in which people take their worst trades",
                "That the news is highly significant",
                "That your analysis is working",
              ],
              answer: 1,
              explain:
                "If a headline is public, it's already in the price. The urgency is a feeling produced by how the story was written, not evidence about the opportunity.",
            },
          ],
        },
      ],
    },
  ],
};
