import type { Exercise } from "@/lib/exercise/types";

/**
 * Every interactive exercise on the site. Lessons embed them by id via an
 * `exercise` block; the standalone practice tool groups them by mode and
 * difficulty. Model answers are anchored to generated structure, so a chart and
 * its correct answer can never drift apart.
 */
export const EXERCISES: Exercise[] = [
  /* ------------------------------------------------------------ trend --- */
  {
    id: "trend-basic-up",
    kind: "choice",
    mode: "trend",
    difficulty: 1,
    title: "Read the structure",
    brief:
      "Ignore how the chart feels. Look only at the sequence of swing highs and swing lows, then answer.",
    spec: { scenario: "uptrend", seed: 71, bars: 110, symbol: "NDLR", timeframe: "1D", height: 320 },
    question: "What does the swing structure tell you?",
    options: [
      "Uptrend — each peak is higher than the last, and each pullback bottoms above the previous one",
      "Downtrend — price is falling from the top-left of the chart",
      "Range — price keeps returning to the same area",
      "No readable structure — the swings are random",
    ],
    answer: 0,
    optionFeedback: [
      "Right. Higher highs and higher lows, in sequence. That's the definition — not a vibe.",
      "Read left to right: the chart starts low and ends high. This is the mistake of reading a chart backwards.",
      "A range needs a ceiling and a floor that price keeps returning to. Here every peak is at a new price.",
      "There is clear structure: three ascending peaks, each pullback holding above the last.",
    ],
    debrief: [
      "An uptrend is a testable claim, not an impression: **each swing high is above the previous swing high, and each swing low is above the previous swing low**.",
      "The value of defining it this way is that it hands you a specific price that would prove you wrong — the most recent higher low. That price becomes your stop, your invalidation, and your evidence.",
    ],
  },
  {
    id: "trend-change",
    kind: "bar",
    mode: "trend",
    difficulty: 2,
    title: "Where did the trend break?",
    brief:
      "This chart was a healthy uptrend and then stopped being one. Click the bar where the uptrend was structurally broken — not where it merely looked weak.",
    spec: {
      scenario: "trend-change",
      seed: 214,
      bars: 120,
      symbol: "AVCO",
      timeframe: "1D",
      height: 340,
      showVolume: true,
    },
    answerAnchor: "bar.break",
    window: 4,
    traps: [
      {
        anchor: "bar.lh",
        window: 3,
        message:
          "Close — that's the lower high, the first warning. But a lower high alone isn't a broken trend: price can still make a new high from there. The trend only breaks when the last higher low fails.",
      },
    ],
    debrief: [
      "A trend change happens in two beats. **Beat one: a lower high** — buyers failed to push past the prior peak. **Beat two: the previous higher low breaks** — sellers took out the floor that defined the uptrend.",
      "Beat one is a warning that tells you to tighten risk. Beat two is the confirmation that the structure has actually flipped. Traders who act on beat one alone get chopped up, because plenty of lower highs resolve back into the trend.",
    ],
  },
  {
    id: "trend-choppy",
    kind: "choice",
    mode: "trend",
    difficulty: 3,
    title: "Trend or no trend?",
    brief: "Be honest about what this chart supports. Most charts, most of the time, look like this.",
    spec: { scenario: "choppy-range", seed: 909, bars: 100, symbol: "KRTN", timeframe: "4H", height: 320 },
    question: "What is the correct read here?",
    options: [
      "There is no tradeable trend — bars overlap heavily and swings go nowhere",
      "Uptrend, because the last few bars are rising",
      "Downtrend, because the chart dips in the middle",
      "Strong uptrend forming — it's about to break out",
    ],
    answer: 0,
    optionFeedback: [
      "Correct, and this is the hardest answer to give. 'No trade' is a position.",
      "The last few bars are always rising or falling. Structure is a sequence, not the newest two bars.",
      "One dip inside overlapping chop isn't a downtrend — there's no sequence of lower highs and lower lows.",
      "Nothing here supports that. Predicting a breakout from chop is guessing dressed up as analysis.",
    ],
    debrief: [
      "Markets are estimated to trend a minority of the time and chop the rest. If your read of every chart is 'trend', you will take trend trades in conditions that punish them.",
      "The professional skill being tested here is refusing to see structure that isn't there. **The ability to say 'nothing to do' is a real edge**, because it protects capital for the setups that are genuinely readable.",
    ],
  },

  /* ----------------------------------------------------------- levels --- */
  {
    id: "levels-range",
    kind: "levels",
    mode: "levels",
    difficulty: 1,
    title: "Mark the range",
    brief:
      "Click the chart to place a horizontal level at the ceiling price and another at the floor price. Place two, then submit.",
    spec: { scenario: "range", seed: 44, bars: 110, symbol: "HLTX", timeframe: "1D", height: 340 },
    targets: [
      { anchor: "price.resistance", label: "Resistance", kind: "resistance" },
      { anchor: "price.support", label: "Support", kind: "support" },
    ],
    tolerancePct: 1.2,
    maxLevels: 3,
    debrief: [
      "The levels worth marking are the ones price has **reacted to more than once**. A single touch is a data point; three touches is a level other traders are watching too.",
      "Note that your line doesn't have to be perfect — it has to be in the right zone. Prices cluster in bands, not at exact decimals, which is why professionals draw S/R as areas and place stops beyond the whole band rather than a hair past a line.",
    ],
  },
  {
    id: "levels-flip",
    kind: "levels",
    mode: "levels",
    difficulty: 2,
    title: "Find the level that changed jobs",
    brief:
      "One price on this chart acted as a ceiling, then acted as a floor after it broke. Mark that single level.",
    spec: { scenario: "support-flip", seed: 302, bars: 110, symbol: "ORVX", timeframe: "1D", height: 340 },
    targets: [{ anchor: "price.level", label: "Flip level", kind: "neutral" }],
    tolerancePct: 1.1,
    maxLevels: 2,
    debrief: [
      "This is a **polarity flip**, and the reason behind it is human. Traders who sold at that ceiling watch price break above it and regret selling. Traders who bought the break want to add. Both groups place buy orders at the same price — so the old ceiling becomes a floor.",
      "A retest that holds is stronger evidence than the breakout itself, because it proves the buying wasn't just a one-bar burst of enthusiasm.",
    ],
  },
  {
    id: "levels-hard",
    kind: "levels",
    mode: "levels",
    difficulty: 3,
    title: "Mark the levels that matter",
    brief:
      "This chart has two prices worth drawing: the double top's ceiling and the neckline below it. Mark both.",
    spec: { scenario: "double-top", seed: 512, bars: 120, symbol: "PLNR", timeframe: "1D", height: 340, showVolume: true },
    targets: [
      { anchor: "price.peak", label: "Double-top ceiling", kind: "resistance" },
      { anchor: "price.neckline", label: "Neckline", kind: "support" },
    ],
    tolerancePct: 1.3,
    maxLevels: 3,
    debrief: [
      "Two rejections from the same ceiling is a supply signal. The neckline is what converts it into a **trade**: until that floor breaks, the pattern is just a chart with two bumps on it.",
      "Notice the second peak arrived on lighter volume than the first. Fewer buyers were willing to chase the same price — the participation was draining out before the price admitted it.",
    ],
  },

  /* ---------------------------------------------------------- breakout --- */
  {
    id: "breakout-clean",
    kind: "bar",
    mode: "breakout",
    difficulty: 1,
    title: "Click the breakout bar",
    brief:
      "Price ranged, then broke out. Click the bar that closed decisively beyond the range ceiling. Volume is shown beneath.",
    spec: {
      scenario: "breakout",
      seed: 88,
      bars: 115,
      symbol: "VRDN",
      timeframe: "1D",
      height: 340,
      showVolume: true,
    },
    answerAnchor: "bar.breakout",
    window: 3,
    traps: [
      {
        anchor: "bar.retest",
        window: 3,
        message:
          "That's the retest, which came after the break. Good instinct — the retest is often the better entry — but the breakout bar is the one that first closed above the ceiling.",
      },
    ],
    debrief: [
      "Three things marked this as a real break rather than a poke: the bar **closed** beyond the level rather than just wicking through it, its range was visibly larger than the recent average, and volume expanded sharply.",
      "Then the level was retested from above and held. That's the full sequence a breakout trader wants to see — and it's why many wait for the retest instead of buying the break itself.",
    ],
  },
  {
    id: "breakout-flag",
    kind: "bar",
    mode: "breakout",
    difficulty: 2,
    title: "Where does the flag break?",
    brief:
      "A sharp advance, then a quiet drifting consolidation. Click the bar where price broke out of the consolidation and resumed the move.",
    spec: {
      scenario: "bull-flag",
      seed: 141,
      bars: 110,
      symbol: "SNTC",
      timeframe: "1D",
      height: 340,
      showVolume: true,
    },
    answerAnchor: "bar.flagEnd",
    window: 4,
    traps: [
      {
        anchor: "bar.poleTop",
        window: 3,
        message:
          "That's the top of the pole — where the first move ended and the flag began. The breakout is at the other end of the consolidation.",
      },
    ],
    debrief: [
      "A flag is what **orderly profit-taking** looks like. Early buyers trim, which drifts price down slightly, but no wave of new sellers arrives — so the pullback is shallow and the bars get small.",
      "The tell is volume drying up inside the flag and expanding on the break. A 'flag' where volume rises during the pullback is usually distribution wearing a flag's costume.",
    ],
  },

  /* ------------------------------------------------------ false signal --- */
  {
    id: "false-signal-trap",
    kind: "bar",
    mode: "false-signal",
    difficulty: 2,
    title: "Find the trap",
    brief:
      "One bar here poked above resistance and sucked in breakout buyers before reversing. Click it.",
    spec: {
      scenario: "fakeout",
      seed: 617,
      bars: 115,
      symbol: "MERD",
      timeframe: "1D",
      height: 340,
      showVolume: true,
    },
    answerAnchor: "bar.trap",
    window: 3,
    debrief: [
      "Two details separated this from a real breakout, and both were visible **before** the reversal. The bar poked above the level intraday but **closed back inside the range** — the market rejected the higher price. And volume on the break was only modestly above average, when genuine breakouts usually arrive with a surge.",
      "This is why the closing price does more work than the high. A wick through a level is a failed attempt; a close beyond it is an agreement.",
    ],
  },
  {
    id: "false-signal-hunt",
    kind: "bar",
    mode: "false-signal",
    difficulty: 3,
    title: "Spot the stop run",
    brief:
      "Support held twice. Then one bar spiked below it and instantly recovered. Click that bar.",
    spec: {
      scenario: "stop-hunt",
      seed: 733,
      bars: 110,
      symbol: "CDXA",
      timeframe: "4H",
      height: 340,
      showVolume: true,
    },
    answerAnchor: "bar.hunt",
    window: 3,
    debrief: [
      "After support holds twice, everybody can see the level — and most of them put their stop just underneath it. That cluster of stop orders is a pool of guaranteed selling, sitting at a known price.",
      "Large participants who want to buy size need someone to sell to them. Pushing price through an obvious level triggers that selling and fills their orders at a discount. Whether any individual sweep is deliberate or emergent, **your defence is the same**: place stops beyond the noise band rather than a tick past the obvious line, and treat a fast reversal back through a level as evidence, not bad luck.",
    ],
  },
  {
    id: "false-signal-divergence",
    kind: "choice",
    mode: "false-signal",
    difficulty: 3,
    title: "Price says up, volume says…",
    brief: "Read the price action and the volume together before answering.",
    spec: {
      scenario: "volume-divergence",
      seed: 455,
      bars: 110,
      symbol: "TLVR",
      timeframe: "1D",
      height: 340,
      showVolume: true,
    },
    question: "What is the most defensible read?",
    options: [
      "The uptrend is intact but thinning — fewer participants on each new push, so tighten risk rather than add",
      "Sell immediately and go short — falling volume proves the top is in",
      "Ignore volume entirely; price making highs is all that matters",
      "Volume is falling, so price must fall next",
    ],
    answer: 0,
    optionFeedback: [
      "Correct — and note how conditional it is. Divergence adjusts your risk, it doesn't generate a trade.",
      "Far too strong. Trends run on declining volume for long stretches; shorting on divergence alone is a good way to lose repeatedly to a trend that keeps going.",
      "Volume tells you how many people backed the move. Discarding it throws away the participation half of the picture.",
      "Volume doesn't cause price. Falling volume is a description of thinning participation, not a mechanism that makes price drop.",
    ],
    debrief: [
      "Each new high here came on less volume than the last. The move is being carried by fewer and fewer participants — which makes it fragile, not doomed.",
      "The correct professional response to a warning sign is proportionate: **reduce size, tighten your stop, stop adding**. Treating a warning as a reversal signal is how traders end up fighting trends that have months left in them.",
    ],
  },
];

export const EXERCISE_BY_ID: Record<string, Exercise> = Object.fromEntries(
  EXERCISES.map((e) => [e.id, e]),
);
