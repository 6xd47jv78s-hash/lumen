import type { Track } from "@/lib/content/types";

export const risk: Track = {
  slug: "risk",
  title: "Risk & Psychology",
  tagline: "The arithmetic and the self-control that decide whether any of it works.",
  description:
    "Everything else on this site is about being right. This track is about what happens when you're wrong — which, even for excellent traders, is most of the time. Position sizing, risk/reward, stop placement, the specific psychological failures that end accounts, and an honest look at what the evidence says about short-term trading.",
  icon: "risk",
  order: 4,
  level: "Core",
  modules: [
    {
      slug: "the-arithmetic",
      title: "The arithmetic",
      summary: "Position sizing, risk/reward and stops — the maths that keeps you in the game.",
      lessons: [
        /* ------------------------------------------------------------ 4.1 */
        {
          slug: "position-sizing",
          title: "Position sizing: why the size of your losses matters more than being right",
          subtitle: "The arithmetic of drawdown, and why professionals risk 1%",
          minutes: 9,
          blocks: [
            {
              type: "p",
              text: "If you take one thing from this entire site, take this lesson. Not because it's the most interesting — it isn't — but because it is the difference between a trader who has a bad month and a trader who has no account.",
            },
            { type: "h", level: 2, text: "Losses and gains are not symmetric" },
            {
              type: "p",
              text: "Lose 10% and you need 11.1% to recover. That sounds close enough. Keep going and the relationship stops being reasonable.",
            },
            {
              type: "table",
              caption: "The recovery required after a drawdown. Note how it stops being linear.",
              headers: ["Drawdown", "Remaining capital (from £10,000)", "Gain needed to recover"],
              numericFrom: 1,
              rows: [
                ["10%", "£9,000", "11.1%"],
                ["25%", "£7,500", "33.3%"],
                ["50%", "£5,000", "100%"],
                ["75%", "£2,500", "300%"],
                ["90%", "£1,000", "900%"],
              ],
            },
            {
              type: "p",
              text: "A 50% [[drawdown]] requires you to *double your remaining money* just to get back to where you started. Doubling an account is something skilled traders don't reliably do in a year. That's why the professional obsession isn't with maximising returns — it's with never being in the position where recovery requires a miracle.",
            },
            { type: "h", level: 2, text: "What one oversized loss costs" },
            {
              type: "p",
              text: "Here's the scenario that ends most beginner accounts. Two traders, same £10,000, same setups, same 60% win rate, same 20 trades.",
            },
            {
              type: "worked",
              title: "Trader A — disciplined 1% risk",
              rows: [
                { label: "12 winners at +1.5%", value: "^up^+£1,800^" },
                { label: "8 losers at −1%", value: "^down^−£800^" },
                { label: "Net", value: "^up^+£1,000^", emphasis: true },
                { label: "Account", value: "£11,000" },
              ],
            },
            {
              type: "worked",
              title: "Trader B — same trades, but three of them were 'high conviction'",
              rows: [
                { label: "12 winners at +1.5%", value: "^up^+£1,800^" },
                { label: "5 normal losers at −1%", value: "^down^−£500^" },
                { label: "3 oversized losers at −12%", value: "^down^−£3,600^" },
                { label: "Net", value: "^down^−£2,300^", emphasis: true },
                { label: "Account", value: "£7,700" },
              ],
              note: "Identical analysis. Identical win rate. Identical entries. The only difference was position size on three trades — and it turned a +10% year into a −23% year.",
            },
            {
              type: "callout",
              variant: "warn",
              body: [
                "Trader B's three oversized trades were, of course, the ones they were most confident about. That's not a coincidence — it's the mechanism. **Conviction is not correlated with being right**, but it is very strongly correlated with betting more, which is why it does so much damage.",
              ],
            },
            { type: "h", level: 2, text: "The formula" },
            {
              type: "formula",
              expr: "Position size = (Account × Risk %) ÷ (Entry price − Stop price)",
              note: "Everything on the right is decided before you enter. Position size is an output. It is never a number you pick because it feels right.",
            },
            {
              type: "worked",
              title: "Same risk, three different positions",
              rows: [
                { label: "Account £5,000, risking 1%", value: "£50 at risk" },
                { label: "Trade A — stop £0.50 away", value: "100 shares" },
                { label: "Trade B — stop £2.00 away", value: "25 shares" },
                { label: "Trade C — stop £5.00 away", value: "10 shares" },
                { label: "Loss if stopped out, all three", value: "£50", emphasis: true },
              ],
              note: "This is the entire idea. A wider stop doesn't mean more risk — it means a smaller position. Traders who fix their position size and let the stop fall wherever have variable, uncontrolled risk on every trade.",
            },
            { type: "h", level: 2, text: "How much should you risk?" },
            {
              type: "table",
              headers: ["Risk per trade", "Who uses it", "10 straight losses"],
              numericFrom: 2,
              rows: [
                ["0.25–0.5%", "Large funds, or anyone with a small edge", "−2.5% to −5%"],
                ["1%", "The professional standard", "−9.6%"],
                ["2%", "Aggressive but defensible with a proven edge", "−18.3%"],
                ["5%", "Reckless", "−40%"],
                ["10%", "Not a strategy — a countdown", "−65%"],
              ],
              caption:
                "Ten consecutive losses is not a disaster scenario. In a 40%-win-rate trend system it happens roughly every few hundred trades — which means it will happen to you.",
            },
            {
              type: "callout",
              variant: "desk",
              title: "Why 1% is the standard",
              body: [
                "It's not superstition. At 1%, a ten-loss streak costs you under 10% — recoverable both financially and, more importantly, psychologically. At 5%, the same streak costs 40%, which requires a 67% gain to undo and will almost certainly break your discipline long before that.",
                "**Risk per trade is chosen so that a normal losing streak is survivable.** Not a catastrophic one — a normal one.",
              ],
            },
            { type: "h", level: 2, text: "Thinking in R" },
            {
              type: "p",
              text: "Professionals rarely talk in currency. They talk in **R** — one unit of [[risk per trade]]. If you risk £50 per trade, that's your 1R. A trade that made £150 was +3R. A month that made £400 was +8R.",
            },
            {
              type: "p",
              text: "This is more than jargon. It makes performance comparable across account sizes and time, it stops you feeling differently about the same trade because of the pound figure attached, and it makes the question 'is this working?' answerable. Ten trades at +0.4R average is an edge. Ten trades at −0.2R average is a leak, regardless of whether the pound total happens to be positive.",
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Drawdowns are asymmetric — 50% down needs 100% up to recover. Position size is calculated from your fixed risk percentage and your stop distance, never chosen by feel. 1% per trade is the professional standard because it makes an ordinary ten-loss streak survivable. Measure everything in R, not in currency.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "Your account falls 50%. What gain is needed to get back to where you started?",
              options: ["50%", "75%", "100%", "150%"],
              answer: 2,
              explain:
                "£10,000 → £5,000 needs £5,000 of profit on £5,000 of capital: a 100% gain. This asymmetry is the entire reason professionals prioritise avoiding large [[drawdown|drawdowns]] over maximising returns.",
            },
            {
              id: "q2",
              prompt: "£8,000 account, 1% risk, entry £64, stop £60. Position size?",
              options: ["125 shares", "20 shares", "80 shares", "50 shares"],
              answer: 1,
              explain:
                "Risk budget £80; risk per share £4; 80 ÷ 4 = 20 shares. The £4 stop distance is what makes the position small — not any judgement about how good the trade is.",
            },
            {
              id: "q3",
              prompt: "Trade A has a £0.50 stop, Trade B a £5.00 stop, same 1% risk. Which risks more money?",
              options: [
                "Trade B — the wider stop means more risk",
                "Trade A — tighter stops get hit more often",
                "Neither; both risk exactly 1% because position size adjusts",
                "Depends on the share price",
              ],
              answer: 2,
              explain:
                "That's what position sizing does. Trade B gets one-tenth the shares, so the loss at stop is identical. A wider stop costs you position size, not risk.",
            },
            {
              id: "q4",
              prompt: "Why do 'high conviction' trades cause disproportionate damage?",
              options: [
                "High-conviction trades are more likely to lose",
                "Conviction isn't correlated with being right, but it is strongly correlated with betting bigger — so the losses are oversized",
                "They're usually taken at the wrong time of day",
                "Brokers charge more on large positions",
              ],
              answer: 1,
              explain:
                "The problem is the size, not the trade. Feeling certain doesn't improve the odds; it just removes the discipline that would have kept the loss small.",
            },
            {
              id: "q5",
              prompt: "Why do traders measure results in R rather than currency?",
              options: [
                "It's easier to calculate",
                "It makes performance comparable across account sizes and stops the pound figure distorting how you feel about a trade",
                "Tax authorities require it",
                "It hides losses",
              ],
              answer: 1,
              explain:
                "R normalises everything to units of risk taken. +3R is +3R whether it's £30 or £30,000, which is what makes 'is my edge working?' an answerable question.",
            },
          ],
        },

        /* ------------------------------------------------------------ 4.2 */
        {
          slug: "risk-reward",
          title: "Risk/reward: why it matters more than being right",
          subtitle: "The relationship between win rate and reward size, and how it frees you",
          minutes: 7,
          blocks: [
            {
              type: "p",
              text: "Beginners ask 'how often does this work?' Professionals ask 'what do I make when it works, versus what I lose when it doesn't?' The second question contains the first — and this lesson shows why.",
            },
            { type: "h", level: 2, text: "The break-even relationship" },
            {
              type: "p",
              text: "Your [[risk/reward ratio]] determines the win rate you need. Not approximately — exactly.",
            },
            {
              type: "formula",
              expr: "Break-even win rate = 1 ÷ (1 + Reward/Risk)",
              note: "At 3:1, that's 1 ÷ 4 = 25%. You can be wrong three times out of four and still not lose money.",
            },
            {
              type: "figure",
              figure: "rr-grid",
              caption:
                "Every point on this chart is break-even. Anything above the line is profit; anything below is loss. Notice how quickly the required win rate falls as reward grows.",
            },
            {
              type: "p",
              text: "This is genuinely liberating once it lands. **You do not need to be right most of the time.** A trend follower who is right 35% of the time with 4:1 winners has a strong system. Someone right 85% of the time with 1:5 losers is in serious trouble and probably doesn't know it yet.",
            },
            { type: "h", level: 2, text: "Expectancy: the number that decides everything" },
            {
              type: "formula",
              expr: "Expectancy = (Win rate × Avg win) − (Loss rate × Avg loss)",
              note: "Expressed in R, this tells you what you make per trade on average. Positive is an edge; negative is a leak that volume will eventually expose.",
            },
            {
              type: "table",
              caption: "Four systems. Only the arithmetic decides which are worth trading.",
              headers: ["System", "Win rate", "Avg win", "Avg loss", "Expectancy"],
              numericFrom: 1,
              rows: [
                ["Trend following", "35%", "4.0R", "1.0R", "+0.75R"],
                ["Breakout", "45%", "2.2R", "1.0R", "+0.44R"],
                ["Mean reversion", "78%", "0.5R", "1.0R", "+0.17R"],
                ["The 'safe' one", "90%", "0.3R", "3.0R", "−0.03R"],
              ],
            },
            {
              type: "p",
              text: "That last row is worth staring at. A 90% win rate — nine winners for every loser — and it loses money. It's also exactly what a strategy looks like when someone takes tiny profits quickly and lets losers run. It feels fantastic to trade, right up until it doesn't.",
            },
            {
              type: "callout",
              variant: "warn",
              title: "The bias that builds that system",
              body: [
                "Nobody designs the bottom row deliberately. It's what [[loss aversion]] produces: closing winners early feels like locking in a win, and holding losers feels like avoiding a loss. Repeat both a hundred times and you've constructed a high-win-rate, negative-expectancy machine.",
                "This is called the [[disposition effect]], and it's one of the most consistently measured behaviours in retail trading data.",
              ],
            },
            { type: "h", level: 2, text: "Using it before you enter" },
            {
              type: "p",
              text: "Risk/reward is a filter, and it works before the trade rather than after. Three prices, one decision:",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Where's my entry?",
                  body: "The price my criteria actually put me in at — not the price I wish I'd got.",
                },
                {
                  title: "Where's my invalidation?",
                  body: "The price that proves me wrong. Entry minus stop is my risk per share.",
                },
                {
                  title: "Where's the realistic target?",
                  body: "The next significant [[resistance]], or a measured move. **Realistic** — not the price that would make the ratio look acceptable.",
                },
              ],
            },
            {
              type: "p",
              text: "If the resulting ratio is below your minimum — many swing traders use 2:1 — you don't take the trade. Not a smaller position. **No trade.** The setup can be perfect and still not be worth the risk, and recognising that is a skill in itself.",
            },
            {
              type: "callout",
              variant: "desk",
              title: "The manipulation to watch for in yourself",
              body: [
                "The target is the soft number in this calculation, and it's the one that gets quietly stretched. You want the trade, the ratio comes out at 1.4:1, and suddenly the target moves 8% higher because 'it could run'.",
                "Set the target from chart structure — the next level price would actually have to fight through — **before** you calculate the ratio. Once you've computed a ratio, you're no longer a neutral judge of where the target belongs.",
              ],
            },
            { type: "h", level: 2, text: "The honest caveat" },
            {
              type: "p",
              text: "Risk/reward is not free. Demanding 5:1 on everything sounds like an obvious upgrade, but the setups that offer it are rare and your win rate on them will be lower — targets that far away get hit less often. Push the requirement too high and you take almost no trades, and the ones you take mostly fail.",
            },
            {
              type: "p",
              text: "The number that matters is expectancy, not the ratio. A 2:1 system taken 50 times a year can easily out-earn a 6:1 system taken four times. Optimise the product, not one of its factors.",
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Break-even win rate is 1 ÷ (1 + reward/risk), so at 3:1 you only need to be right 26% of the time. Expectancy — win rate × average win minus loss rate × average loss — is the only number that decides whether a system makes money. Set targets from chart structure before you calculate the ratio, and reject trades that don't clear your minimum rather than shrinking them.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "Your average winner is 3× your average loser. What win rate do you need to break even?",
              options: ["50%", "33%", "25%", "10%"],
              answer: 2,
              explain:
                "1 ÷ (1 + 3) = 25%. Being wrong three times out of four is survivable at 3:1 — which is why win rate quoted alone tells you almost nothing.",
            },
            {
              id: "q2",
              prompt: "A system wins 90% of the time, making 0.3R per win and losing 3R per loss. Is it profitable?",
              options: [
                "Yes — a 90% win rate is excellent",
                "No — (0.9 × 0.3) − (0.1 × 3) = 0.27 − 0.30 = −0.03R per trade",
                "Break-even exactly",
                "Can't tell without knowing the market",
              ],
              answer: 1,
              explain:
                "It loses money despite nine winners for every loser. This is precisely the system the [[disposition effect]] builds: winners cut early, losers held.",
            },
            {
              id: "q3",
              prompt: "Your setup is perfect but the risk/reward comes out at 1.2:1, below your 2:1 minimum. What do you do?",
              options: [
                "Take it with a smaller position",
                "Take it — a good setup is a good setup",
                "Skip it entirely",
                "Move the stop closer to improve the ratio",
              ],
              answer: 2,
              explain:
                "Reducing size doesn't fix a poor ratio; it just makes a poor-expectancy trade smaller. Moving the stop closer is worse — it puts your stop somewhere the market didn't justify.",
            },
            {
              id: "q4",
              prompt: "What's the danger of demanding a 6:1 ratio on every trade?",
              options: [
                "There is none — higher is always better",
                "Such setups are rare and distant targets get hit less often, so you take very few trades and win a small share of them",
                "Brokers reject large targets",
                "It increases your risk per trade",
              ],
              answer: 1,
              explain:
                "Win rate and reward trade off. [[Expectancy]] × frequency is what you actually earn, so a modest ratio taken often can beat a spectacular ratio taken rarely.",
            },
            {
              id: "q5",
              prompt: "Why should the target be set from chart structure before calculating the ratio?",
              options: [
                "It's faster",
                "Because once you know the ratio you want, the target stops being a neutral judgement and becomes the number you stretch to justify the trade",
                "Because structure targets are always reached",
                "Because brokers require a target price",
              ],
              answer: 1,
              explain:
                "The target is the softest number in the calculation and the easiest to rationalise. Fixing it from the chart first keeps the ratio an honest test rather than a formality.",
            },
          ],
        },

        /* ------------------------------------------------------------ 4.3 */
        {
          slug: "stop-losses",
          title: "Stop-losses: placement, not hope",
          subtitle: "Why 'the price I hope it doesn't reach' isn't a strategy",
          minutes: 8,
          blocks: [
            {
              type: "p",
              text: "Most beginners place a stop by asking 'how much am I willing to lose?' That question produces a number with no relationship to the chart — and a stop the market has no reason to respect.",
            },
            {
              type: "p",
              text: "The right question is: **at what price is my reason for this trade no longer true?** Answer that, and the stop places itself. Then the position size adjusts to make the risk acceptable. The order matters enormously.",
            },
            { type: "h", level: 2, text: "Placement, by method" },
            {
              type: "cards",
              items: [
                {
                  title: "Structural",
                  subtitle: "The default",
                  body: "Beyond the swing point or level your thesis depends on. Long on a bounce from support? The stop goes below the support [[zone]] — below the whole band, not the exact low.",
                },
                {
                  title: "Volatility-based",
                  subtitle: "The refinement",
                  body: "1 to 2× [[ATR]] beyond the level. This sizes the buffer to how much the instrument actually moves, which is what stops normal noise from taking you out.",
                },
                {
                  title: "Time-based",
                  subtitle: "The underused one",
                  body: "\"If this hasn't worked within 10 days, I'm out.\" A setup that stalls has been invalidated by inaction, even if price never hit your stop.",
                },
                {
                  title: "Percentage",
                  subtitle: "The one to avoid",
                  body: "\"Always 5% below entry.\" Arbitrary — it ignores the chart and the instrument's volatility entirely. It's the method that puts stops in the worst possible places.",
                },
              ],
            },
            { type: "h", level: 2, text: "The classic placement error" },
            {
              type: "p",
              text: "You've already met the mechanism in the false-signals lesson. Here it is as a discipline problem rather than a chart-reading one.",
            },
            {
              type: "chart",
              spec: {
                scenario: "stop-hunt",
                seed: 733,
                bars: 110,
                symbol: "CDXA",
                timeframe: "4H",
                height: 320,
                showVolume: true,
                levels: [
                  { anchor: "price.support", label: "support", kind: "support" },
                  { anchor: "price.wick", label: "where stops sat", kind: "stop" },
                ],
                markers: [{ anchor: "bar.hunt", text: "swept", position: "below", kind: "warn" }],
              },
              caption:
                "Everyone put their stop just under the obvious level. One bar took them all out and reversed. Those traders had the right idea and the wrong stop placement — which pays exactly the same as being wrong.",
            },
            {
              type: "callout",
              variant: "desk",
              body: [
                "**Wider stop, smaller position.** That's the trade, and it's almost always the right one. A stop 1.5 ATR below the level with a smaller size beats a tight stop that gets swept by ordinary noise — same money at risk, far better odds of the trade surviving long enough to work.",
              ],
            },
            { type: "h", level: 2, text: "Things that are not stop-loss strategies" },
            {
              type: "list",
              items: [
                "**A mental stop.** \"I'll get out if it hits £45.\" You won't. At £45 you'll find a reason to wait for £44.50. The whole point of a resting order is that it executes without needing your cooperation at the worst moment.",
                "**Moving it further away.** Widening a stop as price approaches is the single clearest signal that a trade has become an emotional position. Your thesis was invalidated; the only thing you changed was your willingness to accept it.",
                "**No stop, because you'll 'watch it'.** You'll be asleep, in a lesson, or your internet will drop. Markets [[gap]].",
                "**A stop so tight it can't survive noise.** A stop inside the instrument's ordinary daily range isn't risk management, it's a guaranteed exit with extra steps.",
              ],
            },
            {
              type: "callout",
              variant: "warn",
              title: "The one that gets rationalised most",
              body: [
                "\"It's a good company, so I'll hold through the drawdown.\" That's an investing thesis, and it may be perfectly valid — but you entered on a *trading* thesis with a defined invalidation. Switching from trader to long-term investor at the exact moment a position moves against you is the most common way a small planned loss becomes an unplanned large one.",
                "The decision to invest long-term should be made before entry, with position sizing to match. Not at the point of pain.",
              ],
            },
            { type: "h", level: 2, text: "Trailing stops" },
            {
              type: "p",
              text: "A trailing stop moves in your favour and never against. It's the mechanism that lets a winner run — which matters, because in most positive-expectancy systems a small number of large winners carry the whole result.",
            },
            {
              type: "list",
              items: [
                "**Moving average trail** — exit on a close below the 20-day. Simple, effective, gives the trade room.",
                "**Swing-point trail** — move the stop under each new higher low. Structural, and it exits you exactly when the trend definition breaks.",
                "**ATR trail** — maintain a fixed multiple of ATR below the high. Adapts automatically as volatility changes.",
              ],
            },
            {
              type: "p",
              text: "The trade-off is real and worth naming: **trail too tight and you get shaken out of good trades; trail too loose and you give back too much profit.** Tighter trails raise your win rate and shrink your average winner — which, as you now know, may not be an improvement at all.",
            },
            {
              type: "callout",
              variant: "note",
              title: "Moving to break-even",
              body: [
                "Moving your stop to entry once a trade is up 1R is popular and it's a genuine trade-off, not free protection. It eliminates the chance of a loss on that trade, and it also converts a lot of eventual winners into scratches, because normal pullbacks routinely retest the entry.",
                "Traders disagree about this. If you use it, do it after a meaningful move — commonly 1.5R or more — rather than at the first sign of profit.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "Place stops where your thesis is invalidated, then size the position to make that risk acceptable — never the reverse. Use structure plus a volatility buffer, and keep the stop beyond the noise band rather than a tick past an obvious level. Mental stops, widened stops and 'I'll watch it' are not risk management.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "What's the correct question when deciding where to put a stop?",
              options: [
                "How much money am I willing to lose?",
                "At what price is my reason for the trade no longer true?",
                "What's a round number below entry?",
                "What does my broker suggest?",
              ],
              answer: 1,
              explain:
                "Invalidation first, then position size adjusts to make that loss acceptable. Starting from a comfortable loss puts your stop at a price the market has no reason to respect.",
            },
            {
              id: "q2",
              prompt: "Price approaches your stop and you widen it to give the trade room. What have you actually done?",
              options: [
                "Improved the trade's chance of working",
                "Abandoned your risk management — the thesis was invalidated and you only changed your willingness to accept it",
                "Applied a trailing stop correctly",
                "Reduced your risk",
              ],
              answer: 1,
              explain:
                "Widening under pressure converts a planned small loss into an unplanned large one. It's the single most common way accounts are damaged.",
            },
            {
              id: "q3",
              prompt: "Why is a stop just below an obvious support level a poor choice?",
              options: [
                "Support levels are unreliable",
                "Everyone's stop is in the same place, making it a dense pool of orders that gets swept by ordinary volatility",
                "Brokers can see it",
                "It's too far from entry",
              ],
              answer: 1,
              explain:
                "Order concentration is the problem. Placing beyond the noise band — commonly 1–1.5× [[ATR]] past the level — costs position size and buys survival.",
            },
            {
              id: "q4",
              prompt: "What's the real trade-off of a tight trailing stop?",
              options: [
                "It costs more in commission",
                "It raises your win rate but shrinks your average winner, which can lower overall expectancy",
                "It only works in downtrends",
                "There is no trade-off",
              ],
              answer: 1,
              explain:
                "Most positive-expectancy systems depend on a few large winners. A tight trail systematically cuts exactly those trades short.",
            },
            {
              id: "q5",
              prompt: "You're stopped out and decide instead to 'hold it as a long-term investment'. What's wrong?",
              options: [
                "Nothing — long-term investing is sound",
                "You entered on a trading thesis with a defined invalidation and changed the plan at the moment of pain, with a position sized for a trade rather than a hold",
                "Long-term investing requires a different broker",
                "The company's fundamentals must have changed",
              ],
              answer: 1,
              explain:
                "The switch is a rationalisation, not a decision. If you genuinely want long-term exposure, that's decided before entry and sized accordingly.",
            },
          ],
        },
      ],
    },

    {
      slug: "the-psychology",
      title: "The psychology",
      summary: "The specific failures that end accounts, and the evidence about who actually wins.",
      lessons: [
        /* ------------------------------------------------------------ 4.4 */
        {
          slug: "trading-psychology",
          title: "Trading psychology: the three failures, walked through",
          subtitle: "FOMO, revenge trading and overconfidence — as they actually happen",
          minutes: 9,
          blocks: [
            {
              type: "p",
              text: "Abstract warnings about emotional discipline don't help, because nobody thinks they're being emotional at the time. So here are the three failures as scenarios — the actual sequence of thoughts, and the specific point where the damage was already done.",
            },
            { type: "h", level: 2, text: "Failure one: FOMO" },
            {
              type: "story",
              title: "The stock you were watching, without you",
              beats: [
                {
                  label: "Monday",
                  text: "You've had a stock on your watchlist for two weeks. Your plan says buy on a pullback to £30. It's at £32 and won't come down.",
                },
                {
                  label: "Wednesday",
                  text: "It gaps to £35 on an analyst upgrade. Your setup is gone. You feel it — that specific tightness. You'd have made 12%.",
                },
                {
                  label: "Thursday",
                  text: "It's at £37 and every chat you read is talking about it. You buy at £37.20, size 'about what feels right'. No stop, because where would it even go?",
                },
                {
                  label: "Friday",
                  text: "£34.10. You're down 8% on a position that's larger than usual, with no exit plan, in a stock you never wanted at this price.",
                },
              ],
              verdict:
                "**The mistake wasn't Thursday's entry — it was that Thursday had no rules attached.** [[FOMO]] entries are structurally bad: you buy furthest from your invalidation point, which forces either a stop so wide the position must be tiny, or a stop so tight it can't survive noise. The setup you missed on Monday had a stop £2 away. Thursday's had no defensible stop at all.",
            },
            {
              type: "callout",
              variant: "desk",
              title: "The counter",
              body: [
                "**A missed trade costs you nothing.** That's not a consolation, it's arithmetic — your account is exactly where it was.",
                "The practical defence is a rule written in advance: *if I miss my entry, I do not chase. I wait for the next setup or the next instrument.* There are thousands of instruments and the market opens again tomorrow. Scarcity is the illusion FOMO runs on.",
              ],
            },
            { type: "h", level: 2, text: "Failure two: revenge trading" },
            {
              type: "story",
              title: "Tuesday afternoon",
              beats: [
                {
                  label: "10:15",
                  text: "Stopped out for −1R. Clean loss, plan followed, nothing wrong. You feel fine.",
                },
                {
                  label: "11:40",
                  text: "Second setup. Stopped out again. −2R on the day. Now you're annoyed — not at the trades, at the day.",
                },
                {
                  label: "12:20",
                  text: "You take a third trade. It's not really a setup; it's *nearly* one. Size is doubled, because you want the day back in one move. You don't consciously decide this.",
                },
                {
                  label: "12:55",
                  text: "It goes against you. You don't take the stop — taking it would make the day −4R, and that's unacceptable. You widen it.",
                },
                {
                  label: "14:30",
                  text: "You close at −6R. One afternoon has erased three good weeks.",
                },
              ],
              verdict:
                "**The damage was done at 12:20, not 14:30.** [[Revenge trading]] escalates size exactly as judgement deteriorates — that's the whole mechanism, and it's why it's so reliably destructive. The two earlier losses were fine. Everything after them was an attempt to change the past.",
            },
            {
              type: "callout",
              variant: "warn",
              body: [
                "This is why the daily loss limit is the most valuable line in a [[trading plan]]. It doesn't rely on you noticing you're compromised — the whole problem is that you won't. It's a rule that fires before your judgement is needed.",
                "Set it at 2–3R and treat it as absolute. Two losses, walk away. The market will still be there.",
              ],
            },
            { type: "h", level: 2, text: "Failure three: overconfidence" },
            {
              type: "story",
              title: "The good month",
              beats: [
                {
                  label: "Week 1–2",
                  text: "Seven trades, six winners. Your reading feels sharp. You're catching moves other people are missing.",
                },
                {
                  label: "Week 3",
                  text: "You start taking setups that are 'close enough'. They keep working, which confirms your instincts are ahead of your rules.",
                },
                {
                  label: "Week 4",
                  text: "You raise risk from 1% to 3%. It feels justified — you're clearly in form, and 1% now seems needlessly timid.",
                },
                {
                  label: "Week 5",
                  text: "Market conditions shift. The setups that worked in a trending market fail in a choppy one. Four losses at 3% is −12%, and it took nine days.",
                },
              ],
              verdict:
                "**A run of winners is mostly information about market conditions, not about you.** In a strong trend almost any long-biased approach works. [[Overconfidence]] takes that environmental gift and reads it as personal skill — then raises the stake right before the environment changes. The reason risk per trade is fixed in advance is precisely so that it can't be adjusted by how you're feeling.",
            },
            { type: "h", level: 2, text: "Why these are so hard to beat" },
            {
              type: "p",
              text: "These aren't character flaws. They're well-documented cognitive patterns that show up in controlled studies, in professionals, and in people who know all about them.",
            },
            {
              type: "table",
              headers: ["Bias", "What it does", "The structural defence"],
              rows: [
                ["[[Loss aversion]]", "Losing hurts about twice as much as winning feels good", "Resting stop orders — the decision is already executed"],
                ["[[Disposition effect]]", "Sell winners early, hold losers", "Pre-set targets and trailing rules"],
                ["Recency bias", "Overweight the last few trades", "Judge in samples of 30+, not in threes"],
                ["Confirmation bias", "Seek evidence that supports the position you hold", "Write the invalidation price down before entering"],
                ["Hindsight bias", "Believe the outcome was obvious afterwards", "Journal your reasoning *before* the result is known"],
              ],
            },
            {
              type: "callout",
              variant: "desk",
              title: "The real lesson",
              body: [
                "You cannot discipline your way out of these. Willpower is exactly the resource that fails under stress, so a plan that depends on it fails at the moment it's needed.",
                "What works is **structure**: resting stop orders, position sizes calculated by formula, daily loss limits, a written plan. Every one of these is a way of removing your in-the-moment judgement from a decision you've already made better in advance.",
              ],
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "FOMO makes you buy furthest from invalidation. Revenge trading escalates size exactly as judgement fails. Overconfidence mistakes favourable conditions for personal skill and raises risk right before conditions change. None of them is solved by willpower — they're solved by structure decided in advance: resting stops, formula-calculated size, and a daily loss limit.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "Structurally, why is a FOMO entry a bad trade even if the direction turns out right?",
              options: [
                "Because chasing always loses money",
                "Because you enter furthest from your invalidation point, forcing either an oversized stop or one too tight to survive noise",
                "Because the spread is wider when a stock is moving",
                "Because it means you missed the real setup",
              ],
              answer: 1,
              explain:
                "The problem is geometric, not moral. Distance from invalidation is what determines whether a trade can be sized and stopped sensibly.",
            },
            {
              id: "q2",
              prompt: "In the revenge trading scenario, where was the real damage done?",
              options: [
                "The first stop-out at 10:15",
                "The second stop-out at 11:40",
                "At 12:20, taking a non-setup at double size",
                "At 14:30, closing the position",
              ],
              answer: 2,
              explain:
                "The first two losses were the system working. The escalation — an unplanned trade at double size — is where an ordinary day became a damaging one.",
            },
            {
              id: "q3",
              prompt: "You've won six of your last seven trades. What is the most defensible interpretation?",
              options: [
                "Your skill has improved and you should increase risk",
                "It's mostly information about current market conditions, and conditions change",
                "You've found an edge that will persist",
                "You should switch strategies while you're ahead",
              ],
              answer: 1,
              explain:
                "Seven trades is far too small a sample to distinguish skill from a favourable environment. Raising risk on that basis is how good months become bad quarters.",
            },
            {
              id: "q4",
              prompt: "Why doesn't willpower solve these problems?",
              options: [
                "Because traders are undisciplined by nature",
                "Because willpower is exactly the resource that degrades under stress, so a plan depending on it fails when it's needed",
                "Because markets are designed to exploit it",
                "It does — discipline is the whole answer",
              ],
              answer: 1,
              explain:
                "Structure works because it removes the decision from the moment of pressure. Resting stops, formula-based sizing and pre-set loss limits all execute without needing you to be at your best.",
            },
            {
              id: "q5",
              prompt: "What's the structural defence against the disposition effect?",
              options: [
                "Checking positions more frequently",
                "Pre-set targets and trailing rules decided before entry",
                "Trading larger positions",
                "Using more indicators",
              ],
              answer: 1,
              explain:
                "The bias operates in the moment of the decision. Deciding the exit in advance means the moment never arrives as an open question.",
            },
          ],
        },

        /* ------------------------------------------------------------ 4.5 */
        {
          slug: "the-evidence",
          title: "What the evidence says about short-term trading",
          subtitle: "The research, presented straight — because you should know it before you start",
          minutes: 10,
          blocks: [
            {
              type: "p",
              text: "This is the most important lesson on this site, and it's the one most trading education either omits or buries in a disclaimer. It belongs here, in the middle of the course, because it's professional knowledge — the kind that shapes how you approach everything else.",
            },
            {
              type: "p",
              text: "The evidence on how retail traders actually perform is unusually clear and unusually consistent across countries, decades and asset classes.",
            },
            { type: "h", level: 2, text: "What the research found" },
            {
              type: "cards",
              items: [
                {
                  title: "Barber & Odean (2000)",
                  subtitle: "US, 66,000 households",
                  body: "*\"Trading Is Hazardous to Your Wealth.\"* The average household underperformed the market by roughly 1.5 percentage points a year. **The most active 20% underperformed by around 6.5 points a year.** More trading, worse results — a near-linear relationship.",
                },
                {
                  title: "Barber, Lee, Liu & Odean (2014)",
                  subtitle: "Taiwan, full market data",
                  body: "Studying the entire Taiwanese day-trading population, **less than 1% were able to reliably outperform net of fees.** Roughly the same fraction that would be expected to look skilled by chance alone in a group that size.",
                },
                {
                  title: "Chague, De-Losso & Giovannetti (2020)",
                  subtitle: "Brazil, equity futures",
                  body: "*\"Day Trading for a Living?\"* Of individuals who began day trading and persisted for more than 300 days, **97% lost money.** Only 1.1% earned more than the Brazilian minimum wage.",
                },
                {
                  title: "Regulatory disclosures",
                  subtitle: "EU / UK, ongoing",
                  body: "Brokers offering leveraged CFDs are legally required to publish the share of retail accounts that lose money. The figures are consistently in the **74–89%** range, and they're published by the firms themselves.",
                },
              ],
            },
            {
              type: "callout",
              variant: "note",
              body: [
                "That last one deserves emphasis. Those percentages aren't from critics of the industry — they're mandatory disclosures the brokers themselves publish, on their own homepages, because regulators concluded consumers couldn't otherwise see the base rate.",
              ],
            },
            { type: "h", level: 2, text: "Why the losses happen" },
            {
              type: "p",
              text: "These aren't mysterious. Every mechanism is something you've already met in this course.",
            },
            {
              type: "list",
              ordered: true,
              items: [
                "**Costs compound with frequency.** Spread plus commission on every trade. Trade 300 times a year instead of 12 and you've multiplied your cost drag by 25 while your edge stayed the same.",
                "**Leverage removes recovery time.** Being right about direction and early about timing is normal. Leverage converts that ordinary situation into a [[liquidation]].",
                "**Position sizing errors.** A few oversized losses erase many disciplined wins — the exact arithmetic from the position sizing lesson.",
                "**The [[disposition effect]].** Winners cut early, losers held. Measured repeatedly in real brokerage data, across every market studied.",
                "**Overtrading driven by boredom and FOMO.** Most of the entries that damage accounts weren't setups at all.",
                "**Survivorship bias in what you see.** The people posting screenshots are the winners, plus the losers who haven't stopped yet. The distribution you observe is not the real one.",
              ],
            },
            { type: "h", level: 2, text: "The professional comparison" },
            {
              type: "p",
              text: "It isn't just retail. S&P's SPIVA reports track professional fund managers against their benchmarks, and over 10–15 year windows **the large majority of actively managed funds underperform a simple index fund** — commonly 85–90%+ in US large-cap categories.",
            },
            {
              type: "p",
              text: "These are full-time professionals with research teams, direct company access, and infrastructure you will never have. Most of them cannot beat the average, after costs, over time.",
            },
            {
              type: "callout",
              variant: "warn",
              title: "What this means for the benchmark",
              body: [
                "[[Passive investing]] — buying a broad index fund regularly and holding for decades — has historically returned around 7–10% a year before inflation in developed markets, with no research, no screen time and near-zero costs.",
                "**That's the bar.** Any active approach has to beat it not just before costs, but after costs, after tax, and after the value of the hundreds of hours it consumes. Most don't. That's not cynicism; it's the base rate.",
              ],
            },
            { type: "h", level: 2, text: "So why learn any of this?" },
            {
              type: "p",
              text: "A fair question, and there are honest answers.",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Because it's not a coin flip — it's a skill with a very low success rate",
                  body: "That ~1% who reliably profit are real, and studies find their outperformance persists rather than being random. It's small, it takes years, and the people who get there almost universally arrive via exactly the material in this track: strict risk control, a tested edge, and a journal. The odds are bad; they aren't zero.",
                },
                {
                  title: "Because understanding markets is worth it regardless",
                  body: "Knowing why rates move stocks, how leverage works, what a spread costs you and why costs compound makes you better at every financial decision you'll ever make — pensions, mortgages, ISAs, evaluating whether an investment product is a rip-off.",
                },
                {
                  title: "Because it inoculates you",
                  body: "The people who lose most are the ones who never learned the base rates. Knowing that 97% figure, and *why* it happens, is genuine protection against the account that promises 40% a month.",
                },
                {
                  title: "Because this knowledge makes you a better passive investor",
                  body: "The main threat to a long-term index strategy is panic-selling in a crash. Understanding market structure, volatility regimes and your own biases is precisely what makes holding through a 35% drawdown possible.",
                },
              ],
            },
            {
              type: "callout",
              variant: "desk",
              title: "The professional framing",
              body: [
                "Ask an experienced trader whether most people should trade actively and you'll usually get 'no'. Ask whether *they* should have learned how markets work and the answer is always yes.",
                "The two aren't in conflict. **Market literacy is broadly valuable; active short-term trading is a specialist pursuit with a low success rate.** Treating them as the same thing is the error that costs people money.",
              ],
            },
            { type: "h", level: 2, text: "What a realistic path looks like" },
            {
              type: "p",
              text: "If you do want to pursue this seriously, the evidence points at a specific shape: a long-term core built on index funds that you don't touch, and — separately, later, with money you can genuinely afford to lose — a small deliberately-sized allocation for active trading, only after a long period of paper trading and journaling has demonstrated an actual edge.",
            },
            {
              type: "p",
              text: "That's not the exciting version. It is the version that the people who last actually followed.",
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "The research is consistent across countries and decades: the large majority of active retail traders lose money, more trading correlates with worse returns, and around 1% reliably profit. Most professional fund managers also fail to beat a passive index over long periods. Learn this material because market literacy is valuable and because knowing the base rates protects you — not because the odds on short-term trading are good.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "In Barber & Odean's study of 66,000 US households, what was the relationship between trading frequency and returns?",
              options: [
                "More active traders outperformed",
                "There was no relationship",
                "The most active traders underperformed the market by roughly 6.5 percentage points a year",
                "Only leveraged traders underperformed",
              ],
              answer: 2,
              explain:
                "The relationship was close to linear: more trading, worse net returns. Costs and behavioural errors both scale with frequency.",
            },
            {
              id: "q2",
              prompt: "In the Brazilian study of people who day-traded for more than 300 days, what share lost money?",
              options: ["About 50%", "About 70%", "About 85%", "About 97%"],
              answer: 3,
              explain:
                "97% lost money, and only 1.1% earned more than the Brazilian minimum wage — despite persisting for over a year, which filters out casual participants.",
            },
            {
              id: "q3",
              prompt: "Why are EU and UK brokers legally required to publish the percentage of losing retail accounts?",
              options: [
                "To advertise their performance",
                "Because regulators concluded consumers couldn't otherwise see the base rate of losses",
                "For tax purposes",
                "To compare themselves with competitors",
              ],
              answer: 1,
              explain:
                "The disclosure exists precisely because the base rate is not visible from marketing material. The 74–89% figures come from the firms themselves.",
            },
            {
              id: "q4",
              prompt: "What do SPIVA reports show about professional active fund managers?",
              options: [
                "Most beat their benchmark over 10+ years",
                "The large majority underperform a simple index fund over 10–15 year periods",
                "They perform identically to index funds",
                "Only small funds underperform",
              ],
              answer: 1,
              explain:
                "Commonly 85–90%+ underperform in US large-cap categories over 15 years — full-time professionals with resources no individual has.",
            },
            {
              id: "q5",
              prompt: "Given this evidence, what's the defensible reason to learn market analysis?",
              options: [
                "The studies are outdated and no longer apply",
                "Market literacy improves every financial decision you make, protects you from scams, and makes holding a long-term portfolio through crashes possible",
                "Because the 97% simply didn't try hard enough",
                "Because retail traders now have better tools than institutions",
              ],
              answer: 1,
              explain:
                "Market literacy and active short-term trading are different things. The first is broadly valuable; the second is a specialist pursuit with a low success rate — and conflating them is the error that costs people money.",
            },
          ],
        },

        /* ------------------------------------------------------------ 4.6 */
        {
          slug: "trade-journaling",
          title: "Trade journaling: the highest-leverage habit",
          subtitle: "What to log, why it works, and the review that turns records into improvement",
          minutes: 7,
          blocks: [
            {
              type: "p",
              text: "Almost every trader who becomes consistently profitable keeps a [[trading journal]]. Almost every trader who doesn't, doesn't. That correlation isn't a coincidence, and the mechanism is worth understanding.",
            },
            { type: "h", level: 2, text: "Why memory can't do this job" },
            {
              type: "p",
              text: "Three reasons, all of them well documented:",
            },
            {
              type: "list",
              items: [
                "**Hindsight bias.** After the fact, you remember your reasoning as clearer than it was. A loss becomes 'I knew that was risky', which quietly erases the lesson.",
                "**Recency bias.** Your sense of how you're doing is dominated by the last three trades. Actual patterns live in samples of thirty or more.",
                "**Selective recall.** The trade you exited early that then ran 20% is unforgettable. The four you exited early that immediately reversed are gone. Your mental sample is not a sample.",
              ],
            },
            {
              type: "p",
              text: "A journal converts scattered impressions into data. That's the whole trick — and it's why the entries written **before** the outcome is known are the valuable ones.",
            },
            { type: "h", level: 2, text: "What to log" },
            {
              type: "p",
              text: "Split it in two: what you record at entry, and what you record at exit. The separation is deliberate — it's what preserves your reasoning from being rewritten by the result.",
            },
            {
              type: "checklist",
              title: "At entry — before you know anything",
              items: [
                "Date, instrument, direction, timeframe.",
                "**Which setup is this?** Name it from your plan. If you can't, that's the most important entry you'll ever make.",
                "Entry price, stop price, target price.",
                "Position size, and the calculation that produced it.",
                "Planned risk in R and the risk/reward ratio.",
                "**Why this trade, in one sentence.** Written now, not later.",
                "**Confidence, 1–5.** Over time this reveals whether your confidence has any predictive value. For most traders it has none, which is itself worth knowing.",
                "How you feel: calm, rushed, wanting to make something back.",
                "A screenshot of the chart at entry, with your levels marked.",
              ],
            },
            {
              type: "checklist",
              title: "At exit",
              items: [
                "Exit price, date, result in R.",
                "Exit reason: stop hit, target hit, trailed out, or **discretionary override** — flag those, they're where the leaks are.",
                "Did I follow my plan? Yes/no. This is the single most valuable field in the journal.",
                "What actually happened versus what I expected.",
                "A screenshot at exit.",
              ],
            },
            {
              type: "callout",
              variant: "desk",
              title: "The one field that matters most",
              body: [
                "**'Did I follow my plan?'** — and crucially, it's independent of whether the trade made money.",
                "This gives you four categories, and they're the real scoreboard: followed the plan and won (repeat), followed the plan and lost (fine — normal), broke the plan and lost (obvious lesson), and **broke the plan and won**. That last one is the dangerous quadrant. It teaches you that breaking the plan works, and it's how discipline erodes.",
              ],
            },
            { type: "h", level: 2, text: "The review" },
            {
              type: "p",
              text: "Logging without reviewing is just admin. The review is where the value is, and it needs a schedule.",
            },
            {
              type: "steps",
              items: [
                {
                  title: "Weekly, 15 minutes",
                  body: "Read every trade. Count plan violations. Note anything you'd do differently. Don't draw conclusions about the strategy — the sample is too small.",
                },
                {
                  title: "Monthly, 45 minutes",
                  body: "Now look for patterns. Group by setup: which is actually profitable in R? Group by day and by mood. Compare expectancy of plan-followed trades against plan-broken ones — that comparison is usually startling.",
                },
                {
                  title: "Quarterly",
                  body: "With 30+ trades you can finally judge the strategy itself. Is expectancy positive? Is max drawdown within what you expected? Should a setup be dropped entirely?",
                },
              ],
            },
            {
              type: "callout",
              variant: "note",
              title: "What people usually find",
              body: [
                "Two results are so common they're almost universal. **One setup is carrying everything** while the others are flat or negative — and the fix is to trade only that one. And **plan-followed trades have materially better expectancy than plan-broken trades**, which converts discipline from a virtue into a measured number.",
                "Neither is discoverable from memory. Both change how you trade immediately.",
              ],
            },
            { type: "h", level: 2, text: "Start now, on paper" },
            {
              type: "p",
              text: "You don't need a broker account to start. Journal hypothetical trades: mark the setup on a chart, write the entry, stop, size and reasoning, then check back in a week. Everything that makes a journal valuable — the pre-committed reasoning, the honest scoring, the pattern-finding — works identically without money involved.",
            },
            {
              type: "p",
              text: "A spreadsheet is enough. Ten columns and a screenshot folder will outperform most paid journaling software, because the constraint was never the tool.",
            },
            {
              type: "callout",
              variant: "key",
              body: [
                "A journal converts scattered impressions into data your memory cannot hold honestly. Log your reasoning at entry, before the outcome is known, and score every trade on whether you followed your plan independently of whether it made money. Review weekly for discipline, monthly for patterns, quarterly for the strategy itself.",
              ],
            },
          ],
          quiz: [
            {
              id: "q1",
              prompt: "Why must the reasoning for a trade be written at entry rather than after the exit?",
              options: [
                "It's faster",
                "Hindsight bias rewrites your remembered reasoning to fit the outcome, destroying the lesson",
                "Brokers require timestamps",
                "It doesn't matter when it's written",
              ],
              answer: 1,
              explain:
                "Once you know the result, you cannot reliably recover what you actually thought. The pre-outcome entry is the only honest record.",
            },
            {
              id: "q2",
              prompt: "Which journal field is most valuable?",
              options: [
                "Profit or loss in currency",
                "Whether you followed your plan, recorded independently of the result",
                "The time of day",
                "The instrument's sector",
              ],
              answer: 1,
              explain:
                "Outcome and process are different things. Separating them is what lets you tell a good decision with a bad result from a bad decision with a lucky one.",
            },
            {
              id: "q3",
              prompt: "Why is 'broke the plan and won' the dangerous quadrant?",
              options: [
                "It isn't — a win is a win",
                "Because it reinforces breaking the plan, and that's how discipline erodes over time",
                "Because brokers flag it",
                "Because it usually involves leverage",
              ],
              answer: 1,
              explain:
                "The reward is immediate and the cost is delayed. Flagging these explicitly is the only way to stop a profitable violation training you into an unprofitable habit.",
            },
            {
              id: "q4",
              prompt: "Why shouldn't you judge a strategy from a weekly review?",
              options: [
                "Weekly reviews are unnecessary",
                "The sample is far too small — a handful of trades is mostly noise",
                "Strategies only change monthly",
                "You need broker statements first",
              ],
              answer: 1,
              explain:
                "Weekly reviews are for discipline; strategy judgements need 30+ trades. Changing a system after three losses is recency bias wearing a lab coat.",
            },
            {
              id: "q5",
              prompt: "Can you journal usefully without a real trading account?",
              options: [
                "No — journals require real fills",
                "Yes — logging hypothetical trades with pre-committed reasoning captures nearly all the value",
                "Only if you use paid software",
                "Only for long-term investments",
              ],
              answer: 1,
              explain:
                "The mechanism is honest pre-outcome reasoning and pattern-finding across a sample. None of that requires money at risk — which makes it the ideal thing to start now.",
            },
          ],
        },
      ],
    },
  ],
};
