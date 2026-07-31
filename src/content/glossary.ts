export type GlossaryCategory =
  | "Market structure"
  | "Instruments"
  | "Orders"
  | "Chart reading"
  | "Strategy"
  | "Risk & psychology"
  | "Macro"
  | "Crypto";

export interface GlossaryEntry {
  /** Canonical display term. */
  term: string;
  /** Extra spellings that `[[...]]` markup should resolve to this entry. */
  aliases?: string[];
  category: GlossaryCategory;
  /** One or two sentences. Must stand alone — students hit this in a tooltip. */
  definition: string;
  /** Optional second paragraph with the nuance a trader would add. */
  detail?: string;
  related?: string[];
}

/**
 * Single source of truth for every term used site-wide. Lesson prose links into
 * this with `[[term]]` markup, so a term can never appear unexplained.
 */
export const GLOSSARY: GlossaryEntry[] = [
  /* ------------------------------------------------------ market structure */
  {
    term: "Market",
    category: "Market structure",
    definition:
      "Any venue where buyers and sellers meet to exchange an asset for money. A market's job is to produce a price both sides can act on.",
    detail:
      "Markets don't 'know' what something is worth. They produce the price at which the most recent buyer and seller agreed — which is a very different thing.",
    related: ["Price discovery", "Order book", "Liquidity"],
  },
  {
    term: "Price discovery",
    category: "Market structure",
    definition:
      "The continuous process by which competing buyers and sellers arrive at a price. Every trade is one more data point in that process.",
    related: ["Market", "Order book", "Volume"],
  },
  {
    term: "Order book",
    aliases: ["order books", "book"],
    category: "Market structure",
    definition:
      "The live list of all resting buy orders (bids) and sell orders (asks) at each price level for an asset.",
    detail:
      "The book is where 'support' and 'resistance' physically live: a price with a large stack of resting buy orders is genuinely harder to fall through.",
    related: ["Bid", "Ask", "Spread", "Liquidity", "Support"],
  },
  {
    term: "Bid",
    category: "Market structure",
    definition: "The highest price a buyer is currently willing to pay. If you sell at market, you sell into the bid.",
    related: ["Ask", "Spread", "Order book"],
  },
  {
    term: "Ask",
    aliases: ["offer"],
    category: "Market structure",
    definition: "The lowest price a seller is currently willing to accept. If you buy at market, you pay the ask.",
    related: ["Bid", "Spread", "Order book"],
  },
  {
    term: "Spread",
    aliases: ["bid-ask spread"],
    category: "Market structure",
    definition:
      "The gap between the bid and the ask. It is a real cost: buy and instantly sell, and you lose the spread.",
    detail:
      "Wide spreads are a warning sign about liquidity. A stock with a 0.02% spread and one with a 1.5% spread are not the same instrument to trade, whatever the chart looks like.",
    related: ["Bid", "Ask", "Liquidity", "Slippage"],
  },
  {
    term: "Liquidity",
    aliases: ["liquid", "illiquid"],
    category: "Market structure",
    definition:
      "How easily you can buy or sell size without moving the price. High liquidity means tight spreads and deep resting orders.",
    detail:
      "Liquidity is the hidden variable behind most 'the chart lied to me' moments. Thin markets produce false breakouts, violent wicks and slippage that no pattern can protect you from.",
    related: ["Spread", "Slippage", "Volume", "Order book"],
  },
  {
    term: "Slippage",
    category: "Market structure",
    definition:
      "The difference between the price you expected and the price you actually got. It grows with order size, volatility and thin liquidity.",
    related: ["Liquidity", "Market order", "Spread"],
  },
  {
    term: "Volatility",
    aliases: ["volatile"],
    category: "Market structure",
    definition:
      "How much and how fast a price moves. Higher volatility means bigger swings in both directions — it is not the same thing as risk, but it multiplies it.",
    detail:
      "Position size should be a function of volatility. The same 'one contract' means something completely different in a quiet market and a fast one.",
    related: ["Position sizing", "ATR", "Volatility regime"],
  },
  {
    term: "Volatility regime",
    category: "Market structure",
    definition:
      "An extended period in which volatility is persistently high or persistently low. Markets switch between regimes rather than averaging smoothly.",
    detail:
      "Strategies are regime-dependent. Mean reversion that prints money in a quiet regime can be destroyed by the first trending, high-volatility stretch.",
    related: ["Volatility", "Mean reversion"],
  },
  {
    term: "Market maker",
    category: "Market structure",
    definition:
      "A firm that continuously quotes both a bid and an ask, profiting from the spread while providing the liquidity everyone else trades against.",
    related: ["Liquidity", "Spread", "Order book"],
  },
  {
    term: "Exchange",
    category: "Market structure",
    definition:
      "The regulated venue that matches buyers with sellers and publishes the resulting prices — NYSE and Nasdaq for US shares, CME for futures, Binance or Coinbase for crypto.",
    related: ["Broker", "Order book"],
  },
  {
    term: "Broker",
    category: "Market structure",
    definition:
      "The intermediary that routes your order to an exchange and holds your account. You trade through a broker, not directly on an exchange.",
    related: ["Exchange", "Commission"],
  },
  {
    term: "Commission",
    aliases: ["fees", "commissions"],
    category: "Market structure",
    definition:
      "What your broker charges per trade. Even at zero commission you still pay the spread and, on some brokers, a markup buried in the fill price.",
    detail:
      "Costs scale with how often you trade. A strategy taking five trades a day faces roughly 250× the annual cost drag of one taking five trades a year.",
    related: ["Spread", "Scalping", "Slippage"],
  },

  /* ------------------------------------------------------------ instruments */
  {
    term: "Share",
    aliases: ["shares", "stock", "stocks", "equity", "equities"],
    category: "Instruments",
    definition:
      "A unit of ownership in a company. Owning one entitles you to a slice of the company's future profits and, usually, a vote.",
    related: ["Dividend", "Market capitalisation", "Earnings"],
  },
  {
    term: "Dividend",
    aliases: ["dividends"],
    category: "Instruments",
    definition:
      "A cash payment a company distributes to shareholders out of profits, usually quarterly. The share price typically drops by roughly the dividend on the ex-dividend date.",
    related: ["Share", "Earnings"],
  },
  {
    term: "Market capitalisation",
    aliases: ["market cap", "market capitalization"],
    category: "Instruments",
    definition:
      "Share price × number of shares outstanding — the market's total valuation of the company. It, not the share price, tells you how big a company is.",
    detail:
      "A $5 share is not 'cheap' and a $900 share is not 'expensive'. Price per share is an accounting artefact of how many shares exist.",
    related: ["Share", "Float"],
  },
  {
    term: "Float",
    category: "Instruments",
    definition:
      "The number of shares actually available to trade publicly, excluding locked-up insider holdings. A small float makes a stock far more volatile.",
    related: ["Market capitalisation", "Liquidity"],
  },
  {
    term: "Index",
    aliases: ["indices", "index fund"],
    category: "Instruments",
    definition:
      "A basket of assets tracked as one number — the S&P 500 tracks 500 large US companies. Index funds let you buy the whole basket in one trade.",
    related: ["Passive investing", "ETF"],
  },
  {
    term: "ETF",
    aliases: ["exchange-traded fund"],
    category: "Instruments",
    definition:
      "A fund that trades on an exchange like a share but holds a basket of assets underneath — the standard vehicle for buying an index cheaply.",
    related: ["Index", "Passive investing"],
  },
  {
    term: "Futures contract",
    aliases: ["futures", "future"],
    category: "Instruments",
    definition:
      "A standardised, legally binding agreement to buy or sell a set quantity of an asset at a set price on a set future date.",
    detail:
      "Futures are the purest leveraged instrument: you post margin worth a fraction of the contract's notional value, and your profit and loss is calculated on the full notional.",
    related: ["Margin", "Leverage", "Expiry", "Notional value", "Contract size"],
  },
  {
    term: "Contract size",
    category: "Instruments",
    definition:
      "How much of the underlying asset one futures contract controls — e.g. one E-mini S&P 500 contract is $50 × the index level.",
    related: ["Futures contract", "Notional value", "Tick"],
  },
  {
    term: "Notional value",
    category: "Instruments",
    definition:
      "The full market value a contract controls, as opposed to the margin you posted to control it. The number your profit and loss is actually calculated on.",
    related: ["Futures contract", "Leverage", "Margin"],
  },
  {
    term: "Expiry",
    aliases: ["expiration", "expires"],
    category: "Instruments",
    definition:
      "The date a derivative contract ceases to exist and settles. Unlike a share, a futures contract has a deadline built in.",
    related: ["Futures contract", "Rollover"],
  },
  {
    term: "Rollover",
    aliases: ["roll"],
    category: "Instruments",
    definition:
      "Closing an expiring futures contract and opening the equivalent position in the next contract month, to maintain exposure past expiry.",
    related: ["Expiry", "Futures contract"],
  },
  {
    term: "Tick",
    aliases: ["tick size", "tick value"],
    category: "Instruments",
    definition:
      "The smallest price increment an instrument can move, and the fixed cash value of that increment. Knowing your tick value is how you translate chart movement into money.",
    related: ["Contract size", "Futures contract", "Pip"],
  },
  {
    term: "Forex",
    aliases: ["FX", "currency pair", "currency pairs"],
    category: "Instruments",
    definition:
      "The market for exchanging one currency for another, quoted in pairs like EUR/USD. You are always simultaneously long one currency and short the other.",
    related: ["Pip", "Leverage", "Carry"],
  },
  {
    term: "Pip",
    category: "Instruments",
    definition:
      "The standard smallest quoted move in a currency pair — normally 0.0001, or 0.01 for yen pairs. Forex position sizing is done in currency per pip.",
    related: ["Forex", "Tick", "Position sizing"],
  },
  {
    term: "Carry",
    aliases: ["carry trade", "swap rate"],
    category: "Instruments",
    definition:
      "The interest you earn or pay for holding a currency position overnight, set by the interest-rate difference between the two currencies.",
    related: ["Forex", "Interest rate"],
  },
  {
    term: "Short selling",
    aliases: ["short", "shorting", "going short"],
    category: "Instruments",
    definition:
      "Selling an asset you don't own (borrowing it first) so you profit if the price falls. Your maximum loss is theoretically unlimited, because a price can rise forever.",
    detail:
      "This asymmetry is why shorting demands stricter risk control than buying. A long position can only go to zero; a short can go to any number.",
    related: ["Long", "Short squeeze", "Margin"],
  },
  {
    term: "Long",
    aliases: ["going long", "long position"],
    category: "Instruments",
    definition: "Owning an asset, so you profit if the price rises. The default direction for most investors.",
    related: ["Short selling"],
  },
  {
    term: "Short squeeze",
    category: "Instruments",
    definition:
      "A sharp rally driven by short sellers being forced to buy back to close losing positions, whose buying pushes the price higher still.",
    related: ["Short selling", "Volatility"],
  },
  {
    term: "Leverage",
    aliases: ["leveraged", "gearing"],
    category: "Instruments",
    definition:
      "Controlling a position larger than your account balance using borrowed money or margin. It multiplies gains and losses by exactly the same factor.",
    detail:
      "Leverage does not change whether you're right. It changes how long you can afford to be wrong — which is usually the thing that decides the outcome.",
    related: ["Margin", "Margin call", "Liquidation", "Position sizing"],
  },
  {
    term: "Margin",
    category: "Instruments",
    definition:
      "The cash you must post as collateral to open and hold a leveraged position. Initial margin opens it; maintenance margin keeps it open.",
    related: ["Leverage", "Margin call", "Liquidation"],
  },
  {
    term: "Margin call",
    category: "Instruments",
    definition:
      "A demand from your broker for more collateral because losses have pushed your account below maintenance margin. Ignore it and the position is closed for you.",
    related: ["Margin", "Liquidation", "Leverage"],
  },
  {
    term: "Liquidation",
    aliases: ["liquidated", "forced liquidation"],
    category: "Instruments",
    definition:
      "The broker or exchange force-closing your position because your collateral ran out. You don't choose the price, and in fast markets it is a bad one.",
    detail:
      "In crypto perpetuals, cascading liquidations are a market event in their own right: forced selling triggers lower prices, which triggers more forced selling.",
    related: ["Margin call", "Leverage", "Perpetual futures"],
  },

  /* ---------------------------------------------------------------- orders */
  {
    term: "Market order",
    category: "Orders",
    definition:
      "An instruction to buy or sell immediately at whatever price is currently available. Guarantees execution, not price.",
    related: ["Limit order", "Slippage", "Spread"],
  },
  {
    term: "Limit order",
    category: "Orders",
    definition:
      "An instruction to buy at no more than, or sell at no less than, a specified price. Guarantees price, not execution.",
    detail:
      "A limit order that never fills has still done its job — it stopped you paying a price you had already decided was too high.",
    related: ["Market order", "Order book"],
  },
  {
    term: "Stop order",
    aliases: ["stop", "stop-loss", "stop loss", "stops"],
    category: "Orders",
    definition:
      "A resting instruction that becomes a market order once price trades through a trigger level. Its normal use is to cap the loss on a position.",
    detail:
      "Because it converts to a market order, a stop can fill well below its trigger in a fast market. That gap is the difference between your intended risk and your actual risk.",
    related: ["Stop-limit order", "Slippage", "Risk per trade", "Invalidation"],
  },
  {
    term: "Stop-limit order",
    category: "Orders",
    definition:
      "A stop that converts into a limit order rather than a market order — protecting you from an awful fill, at the cost of possibly not filling at all.",
    related: ["Stop order", "Limit order"],
  },
  {
    term: "Take profit",
    aliases: ["target", "profit target"],
    category: "Orders",
    definition:
      "A resting limit order that closes a winning position at a predetermined price, so the decision is made before the emotion arrives.",
    related: ["Limit order", "Risk/reward ratio"],
  },
  {
    term: "Fill",
    aliases: ["filled", "execution"],
    category: "Orders",
    definition: "The completed execution of an order, and the price it happened at.",
    related: ["Slippage", "Market order"],
  },

  /* --------------------------------------------------------- chart reading */
  {
    term: "Candlestick",
    aliases: ["candle", "candles", "candlesticks"],
    category: "Chart reading",
    definition:
      "A chart bar showing four prices for one time period: open, high, low and close. The body spans open to close; the wicks show the extremes.",
    related: ["Open", "Close", "Wick", "Timeframe"],
  },
  { term: "Open", category: "Chart reading", definition: "The first traded price of a bar's time period." },
  {
    term: "Close",
    aliases: ["closing price"],
    category: "Chart reading",
    definition:
      "The last traded price of a bar's period, and the single most informative of the four values — it's the price the market settled on after argument.",
    related: ["Candlestick", "Open"],
  },
  {
    term: "Wick",
    aliases: ["wicks", "shadow", "tail"],
    category: "Chart reading",
    definition:
      "The thin line above or below a candle body, marking a price that traded but was rejected before the close.",
    detail:
      "Long wicks are the chart's record of a fight. A long lower wick means sellers pushed price down there and buyers refused to let it stay.",
    related: ["Candlestick", "Rejection"],
  },
  {
    term: "Rejection",
    category: "Chart reading",
    definition:
      "Price reaching a level and being pushed straight back, leaving a long wick. Evidence that resting orders at that level were strong enough to absorb the move.",
    related: ["Wick", "Support", "Resistance"],
  },
  {
    term: "Timeframe",
    aliases: ["timeframes", "time frame"],
    category: "Chart reading",
    definition:
      "How much time each candle on a chart represents — one minute, one hour, one day, one week. The same asset tells different stories on different timeframes.",
    detail:
      "Your timeframe should be chosen by how often you can actually look at a screen, not by which chart looks most exciting.",
    related: ["Candlestick", "Swing trading", "Scalping"],
  },
  {
    term: "Trend",
    aliases: ["trending", "uptrend", "downtrend"],
    category: "Chart reading",
    definition:
      "A sustained directional bias in price. An uptrend makes higher highs and higher lows; a downtrend makes lower highs and lower lows.",
    detail:
      "Defining trend structurally — by swing points — beats eyeballing it, because it gives you a specific price that proves you wrong.",
    related: ["Higher high", "Lower low", "Swing point", "Trend following"],
  },
  {
    term: "Higher high",
    aliases: ["higher highs", "HH", "higher low", "higher lows", "HL"],
    category: "Chart reading",
    definition:
      "A swing peak above the previous peak (and a swing trough above the previous trough). The two together define an uptrend.",
    related: ["Trend", "Swing point", "Lower low"],
  },
  {
    term: "Lower low",
    aliases: ["lower lows", "LL", "lower high", "lower highs", "LH"],
    category: "Chart reading",
    definition:
      "A swing trough below the previous trough (and a swing peak below the previous peak). The two together define a downtrend.",
    related: ["Trend", "Swing point", "Higher high"],
  },
  {
    term: "Swing point",
    aliases: ["swing high", "swing low", "swing points", "pivot"],
    category: "Chart reading",
    definition:
      "A local peak or trough where price turned — the anchor points you connect to read trend structure. A swing high has lower highs on both sides of it.",
    related: ["Trend", "Higher high", "Support"],
  },
  {
    term: "Support",
    category: "Chart reading",
    definition:
      "A price area where buying has repeatedly been strong enough to stop a decline. Not a magic line — a zone where resting buy orders cluster.",
    detail:
      "Support works partly because it's real (orders sit there) and partly because it's believed (traders act on it, which puts orders there). Both are reasons it can fail.",
    related: ["Resistance", "Order book", "Polarity flip", "Zone"],
  },
  {
    term: "Resistance",
    category: "Chart reading",
    definition:
      "A price area where selling has repeatedly been strong enough to stop an advance — the mirror image of support.",
    related: ["Support", "Breakout", "Polarity flip"],
  },
  {
    term: "Zone",
    aliases: ["S/R zone", "supply zone", "demand zone"],
    category: "Chart reading",
    definition:
      "The band of prices a support or resistance level really occupies. Levels are areas, not single numbers — drawing them as exact lines causes bad stop placement.",
    related: ["Support", "Resistance"],
  },
  {
    term: "Polarity flip",
    aliases: ["support becomes resistance", "flip"],
    category: "Chart reading",
    definition:
      "The tendency for broken resistance to act as support afterwards (and vice versa), because the traders trapped at that level change their behaviour once it breaks.",
    related: ["Support", "Resistance", "Retest"],
  },
  {
    term: "Breakout",
    aliases: ["break out", "breaks out"],
    category: "Chart reading",
    definition:
      "Price moving decisively out of a range or through a level, usually on expanded volume. The premise is that the balance between buyers and sellers has genuinely changed.",
    related: ["Range", "False breakout", "Volume", "Retest"],
  },
  {
    term: "False breakout",
    aliases: ["fakeout", "fake breakout", "failed breakout", "false signal"],
    category: "Chart reading",
    definition:
      "Price breaking a level and then reversing straight back through it, trapping everyone who entered on the break.",
    detail:
      "False breakouts are not a malfunction of the market — they're a feature of it. Stops cluster just beyond obvious levels, and triggering them is a legitimate source of liquidity for large traders.",
    related: ["Breakout", "Stop hunt", "Confirmation"],
  },
  {
    term: "Stop hunt",
    aliases: ["stop run", "liquidity sweep", "sweep"],
    category: "Chart reading",
    definition:
      "A quick push through an obvious level that triggers clustered stop orders, then reverses. Whether it's deliberate or emergent, the effect on your position is identical.",
    related: ["False breakout", "Stop order", "Liquidity"],
  },
  {
    term: "Retest",
    category: "Chart reading",
    definition:
      "Price returning to a broken level after a breakout. A level that holds on the retest is far better evidence than the break itself.",
    related: ["Breakout", "Polarity flip", "Confirmation"],
  },
  {
    term: "Confirmation",
    category: "Chart reading",
    definition:
      "Waiting for additional evidence — a candle close beyond a level, a volume expansion, a successful retest — before acting on a signal.",
    detail:
      "Confirmation is a trade-off, not a free upgrade: you get fewer false signals but a worse entry price. Which side of that trade-off is correct depends on your strategy, not on a rule.",
    related: ["False breakout", "Retest", "Breakout"],
  },
  {
    term: "Range",
    aliases: ["ranging", "consolidation", "sideways"],
    category: "Chart reading",
    definition:
      "A period where price oscillates between a support floor and a resistance ceiling with no directional bias. Markets spend most of their time here.",
    related: ["Breakout", "Mean reversion", "Support"],
  },
  {
    term: "Volume",
    category: "Chart reading",
    definition:
      "The number of shares or contracts traded in a period. It measures participation — how many people cared about the move, not how far price went.",
    detail:
      "Volume is context, not a signal. Its highest-value use is confirming or questioning a price move, and comparing it to that instrument's own recent average rather than an absolute number.",
    related: ["Volume divergence", "Breakout", "Liquidity"],
  },
  {
    term: "Volume divergence",
    aliases: ["divergence"],
    category: "Chart reading",
    definition:
      "Price making new highs while volume shrinks (or the reverse). It suggests the move is running on fewer and fewer participants.",
    detail:
      "Divergence is a warning to tighten risk, not an entry signal. Trends can and do continue on falling volume for a long time.",
    related: ["Volume", "Trend"],
  },
  {
    term: "Moving average",
    aliases: ["moving averages", "MA", "SMA", "EMA"],
    category: "Chart reading",
    definition:
      "The average closing price over the last N bars, plotted as a line, which smooths out noise to make the underlying direction visible.",
    detail:
      "Every moving average lags by construction — it is an average of the past. It cannot tell you a trend changed until after it changed.",
    related: ["Golden cross", "Trend", "Lag"],
  },
  {
    term: "Lag",
    category: "Chart reading",
    definition:
      "The delay built into any indicator calculated from past prices. Smoother indicators lag more; faster ones whipsaw more. There is no setting that removes the trade-off.",
    related: ["Moving average", "Indicator", "Whipsaw"],
  },
  {
    term: "Golden cross",
    aliases: ["death cross", "crossover"],
    category: "Chart reading",
    definition:
      "When the 50-period moving average crosses above the 200-period (golden cross) or below it (death cross). Widely watched, and widely over-credited.",
    detail:
      "Backtests show crossovers are mediocre standalone signals with a lot of false positives in ranging markets. Their real value is as a regime filter.",
    related: ["Moving average", "Whipsaw"],
  },
  {
    term: "Whipsaw",
    category: "Chart reading",
    definition:
      "Being stopped out in one direction and then watching price immediately reverse. The characteristic failure mode of trend systems in ranging markets.",
    related: ["Range", "Lag", "False breakout"],
  },
  {
    term: "Trend line",
    aliases: ["trendline", "trend lines"],
    category: "Chart reading",
    definition:
      "A diagonal line connecting a sequence of rising lows or falling highs, used to visualise the slope of a trend and where it might be tested.",
    detail:
      "Trend lines are the most subjective tool on the chart — small changes in which points you connect change the whole picture. Treat them as a sketch, not a measurement.",
    related: ["Trend", "Support", "Breakout"],
  },
  {
    term: "Chart pattern",
    aliases: ["patterns", "chart patterns"],
    category: "Chart reading",
    definition:
      "A recognisable shape in price — flag, double top, triangle — that reflects a specific underlying supply-and-demand story.",
    detail:
      "The shape is the symptom. What matters is the cause: who is trapped, who is waiting, and where their orders sit. Pattern-matching without that reasoning is astrology with candlesticks.",
    related: ["Bull flag", "Double top", "Breakout"],
  },
  {
    term: "Bull flag",
    aliases: ["flag", "flag pattern", "bear flag"],
    category: "Chart reading",
    definition:
      "A sharp directional move (the pole) followed by a tight, gently counter-sloping consolidation (the flag) before the move resumes.",
    detail:
      "The flag is what profit-taking looks like when it isn't heavy enough to reverse the trend. Volume drying up inside the flag is the confirming detail.",
    related: ["Chart pattern", "Breakout", "Volume"],
  },
  {
    term: "Double top",
    aliases: ["double bottom", "M pattern", "W pattern"],
    category: "Chart reading",
    definition:
      "Two failed attempts at the same level separated by a pullback, completed only when price breaks the intervening swing point (the neckline).",
    related: ["Chart pattern", "Neckline", "Resistance"],
  },
  {
    term: "Neckline",
    category: "Chart reading",
    definition:
      "The swing level between a pattern's two extremes. Until it breaks, a double top is just a chart with two peaks on it.",
    related: ["Double top", "Chart pattern"],
  },
  {
    term: "Gap",
    aliases: ["gapped", "gap up", "gap down"],
    category: "Chart reading",
    definition:
      "A jump between one bar's close and the next bar's open, with no trading in between — typically caused by news released while the market was shut.",
    related: ["Earnings", "Overnight risk"],
  },
  {
    term: "Indicator",
    aliases: ["indicators", "oscillator", "RSI", "MACD", "Bollinger Bands"],
    category: "Chart reading",
    definition:
      "A calculation derived from price and/or volume, plotted to make a specific property (momentum, volatility, trend) easier to see.",
    detail:
      "Every indicator is a transformation of data you already have on the chart. None of them add information; they reorganise it — which is useful, but not magic.",
    related: ["Moving average", "Lag", "ATR"],
  },
  {
    term: "ATR",
    aliases: ["average true range"],
    category: "Chart reading",
    definition:
      "Average True Range — the average size of a bar's full range over N periods. The standard way to measure how much an instrument typically moves.",
    detail:
      "ATR is the professional's answer to 'how far away should my stop be?' — far enough that normal noise doesn't hit it.",
    related: ["Volatility", "Stop order", "Position sizing"],
  },

  /* -------------------------------------------------------------- strategy */
  {
    term: "Trading strategy",
    aliases: ["strategy", "system", "edge"],
    category: "Strategy",
    definition:
      "A repeatable set of rules covering what you buy, when you enter, where you exit at a loss, where you exit at a profit, and how much you risk.",
    detail:
      "If any of those five is missing, you don't have a strategy — you have an opinion with a broker account attached.",
    related: ["Entry criteria", "Invalidation", "Position sizing", "Backtesting"],
  },
  {
    term: "Entry criteria",
    aliases: ["entry", "setup"],
    category: "Strategy",
    definition:
      "The specific, checkable conditions that must be true before you take a trade — written down before you look at a live chart.",
    related: ["Trading strategy", "Trading plan"],
  },
  {
    term: "Invalidation",
    aliases: ["invalidation point", "invalidated"],
    category: "Strategy",
    definition:
      "The price at which your reason for being in the trade is no longer true. Your stop belongs there — not at the loss you happen to find tolerable.",
    detail:
      "Deciding invalidation first, then sizing the position around it, is the single habit that most separates disciplined traders from the rest.",
    related: ["Stop order", "Position sizing", "Trading strategy"],
  },
  {
    term: "Trend following",
    category: "Strategy",
    definition:
      "Buying strength and selling weakness on the premise that moves in progress tend to continue. Low win rate, large winners, long flat periods.",
    related: ["Trend", "Breakout trading", "Risk/reward ratio"],
  },
  {
    term: "Breakout trading",
    category: "Strategy",
    definition:
      "Entering as price clears a defined level, betting that the move continues. Its central problem is that most breakouts fail.",
    related: ["Breakout", "False breakout", "Confirmation"],
  },
  {
    term: "Mean reversion",
    aliases: ["reversion", "fading"],
    category: "Strategy",
    definition:
      "Betting that a price stretched far from its average will snap back. High win rate, small winners, and occasional catastrophic losses if unguarded.",
    detail:
      "Mean reversion feels wonderful right up until the one trade where price doesn't revert. Position sizing is what decides whether that trade ends the strategy or dents it.",
    related: ["Range", "Volatility regime", "Risk per trade"],
  },
  {
    term: "Scalping",
    category: "Strategy",
    definition:
      "Taking many very short trades for small gains. Costs, spread and execution speed dominate the outcome, which is why it favours professionals.",
    related: ["Commission", "Spread", "Day trading"],
  },
  {
    term: "Day trading",
    aliases: ["intraday"],
    category: "Strategy",
    definition: "Opening and closing positions within the same session, holding nothing overnight.",
    related: ["Scalping", "Swing trading", "Overnight risk"],
  },
  {
    term: "Swing trading",
    category: "Strategy",
    definition:
      "Holding positions for days to weeks to capture one leg of a move. The most realistic active style for someone with a job or school.",
    related: ["Day trading", "Position trading", "Timeframe"],
  },
  {
    term: "Position trading",
    category: "Strategy",
    definition: "Holding for months to years on a macro or fundamental thesis, ignoring intraday noise entirely.",
    related: ["Swing trading", "Passive investing"],
  },
  {
    term: "Backtesting",
    aliases: ["backtest", "backtested"],
    category: "Strategy",
    definition:
      "Testing a set of rules against historical data to estimate how it would have performed, before risking money on it.",
    detail:
      "A backtest's job is mostly to kill ideas cheaply. Its results are an upper bound on live performance, never a forecast of it.",
    related: ["Overfitting", "Trading strategy", "Expectancy"],
  },
  {
    term: "Overfitting",
    aliases: ["curve fitting", "curve-fitted"],
    category: "Strategy",
    definition:
      "Tuning a strategy so precisely to past data that it captures that data's noise rather than any repeatable behaviour — and then fails live.",
    detail:
      "The tell is fragility: change one parameter slightly, or test a different year, and the results collapse. Robust edges degrade gracefully.",
    related: ["Backtesting", "Forward testing"],
  },
  {
    term: "Forward testing",
    aliases: ["paper trading", "demo trading"],
    category: "Strategy",
    definition:
      "Running a strategy on live prices without real money, to test it against conditions it wasn't designed on.",
    related: ["Backtesting", "Trading journal"],
  },
  {
    term: "Expectancy",
    aliases: ["edge expectancy"],
    category: "Strategy",
    definition:
      "The average amount you expect to make per trade: (win rate × average win) − (loss rate × average loss). Positive expectancy is the definition of an edge.",
    related: ["Win rate", "Risk/reward ratio", "Trading strategy"],
  },
  {
    term: "Win rate",
    category: "Strategy",
    definition:
      "The percentage of your trades that are profitable. On its own it says nothing about whether you make money.",
    detail:
      "A 30% win rate with 4:1 winners is a strong system. A 90% win rate with 20:1 losers is a countdown.",
    related: ["Expectancy", "Risk/reward ratio"],
  },

  /* -------------------------------------------------------- risk & psych */
  {
    term: "Risk per trade",
    aliases: ["risk-per-trade", "R"],
    category: "Risk & psychology",
    definition:
      "The fixed fraction of your account you accept losing on any single trade — commonly 0.5% to 2%. Professionals call one unit of it 'R'.",
    detail:
      "Fixing risk per trade converts a chaotic string of outcomes into a countable series of Rs, which is what makes performance measurable at all.",
    related: ["Position sizing", "Drawdown", "Invalidation"],
  },
  {
    term: "Position sizing",
    aliases: ["position size", "sizing"],
    category: "Risk & psychology",
    definition:
      "Calculating how many shares or contracts to buy so that hitting your stop costs exactly your intended risk. Size is the output, never the input.",
    detail:
      "Position size = (account × risk %) ÷ (entry − stop). Deciding size first and stop second is the most common way beginners blow up.",
    related: ["Risk per trade", "Invalidation", "Leverage"],
  },
  {
    term: "Risk/reward ratio",
    aliases: ["risk-reward", "R:R", "reward-to-risk"],
    category: "Risk & psychology",
    definition:
      "How much you stand to gain versus how much you're risking. Risking $100 to make $300 is 3:1.",
    detail:
      "Risk/reward and win rate are linked: the higher your R:R, the lower the win rate you can survive. A 3:1 system only needs to be right 26% of the time to break even.",
    related: ["Win rate", "Expectancy", "Risk per trade"],
  },
  {
    term: "Drawdown",
    category: "Risk & psychology",
    definition:
      "The peak-to-trough decline in an account. Recovery is asymmetric: a 50% drawdown requires a 100% gain to get back to even.",
    detail:
      "Drawdown is the number that ends trading careers — not because the maths is unrecoverable, but because the psychology usually is.",
    related: ["Risk per trade", "Position sizing", "Risk of ruin"],
  },
  {
    term: "Risk of ruin",
    category: "Risk & psychology",
    definition:
      "The probability that a losing streak wipes out your account given your edge, your risk per trade, and enough trades.",
    detail:
      "With no edge and 10% risk per trade, ruin isn't a risk — it's a schedule.",
    related: ["Drawdown", "Risk per trade", "Expectancy"],
  },
  {
    term: "FOMO",
    aliases: ["fear of missing out"],
    category: "Risk & psychology",
    definition:
      "Entering a trade because price is already running and you can't stand watching, rather than because your criteria were met.",
    detail:
      "FOMO entries are structurally bad trades: you buy furthest from your invalidation point, which forces either a wide stop or a stop that's too tight to survive noise.",
    related: ["Revenge trading", "Entry criteria", "Trading plan"],
  },
  {
    term: "Revenge trading",
    category: "Risk & psychology",
    definition:
      "Taking an unplanned trade — usually oversized — immediately after a loss, to win the money back.",
    detail:
      "It is the single most reliable way to turn one bad day into a destroyed account, because the size escalates exactly as judgement deteriorates.",
    related: ["FOMO", "Drawdown", "Trading journal"],
  },
  {
    term: "Overconfidence",
    aliases: ["hot hand"],
    category: "Risk & psychology",
    definition:
      "Increasing risk after a run of wins because recent success feels like proof of skill rather than a normal cluster in a random sequence.",
    related: ["Revenge trading", "Risk per trade"],
  },
  {
    term: "Loss aversion",
    category: "Risk & psychology",
    definition:
      "The well-documented bias that losing hurts roughly twice as much as an equivalent gain feels good — which is why traders cut winners early and hold losers.",
    related: ["Disposition effect", "Stop order"],
  },
  {
    term: "Disposition effect",
    category: "Risk & psychology",
    definition:
      "The measured tendency to sell winners too soon and hold losers too long. It is precisely backwards from what a positive-expectancy system requires.",
    related: ["Loss aversion", "Risk/reward ratio"],
  },
  {
    term: "Trading journal",
    aliases: ["journaling", "trade journal"],
    category: "Risk & psychology",
    definition:
      "A written record of every trade — setup, reasoning, size, outcome and emotional state — reviewed regularly to find patterns you can't see in the moment.",
    detail:
      "It's the highest-leverage habit available to an inexperienced trader, because it converts scattered experiences into data you can actually act on.",
    related: ["Forward testing", "Trading plan"],
  },
  {
    term: "Trading plan",
    category: "Risk & psychology",
    definition:
      "A written document defining your markets, timeframe, setups, risk per trade, daily loss limit and review process — written when calm, obeyed when not.",
    related: ["Trading strategy", "Trading journal", "Risk per trade"],
  },
  {
    term: "Overnight risk",
    aliases: ["gap risk"],
    category: "Risk & psychology",
    definition:
      "The risk that news between the close and the next open moves price straight through your stop. Stops don't work when the market isn't trading.",
    related: ["Gap", "Earnings", "Day trading"],
  },
  {
    term: "13F filing",
    aliases: ["13F", "13Fs", "13F filings"],
    category: "Risk & psychology",
    definition:
      "A quarterly disclosure US institutional managers running over $100m in equities must file, listing their long US equity positions.",
    detail:
      "Due 45 days after quarter end, and it excludes shorts, cash, bonds, non-US holdings and most derivatives. Useful for understanding how institutions think; useless as a trade list.",
    related: ["Copy trading", "Position sizing"],
  },
  {
    term: "Copy trading",
    aliases: ["signal service", "signal services", "mirror trading"],
    category: "Risk & psychology",
    definition:
      "Automatically or manually replicating another trader's positions, usually through a platform or a paid signal group.",
    detail:
      "The structural problem is that a position isn't a trade: you receive a direction and an entry, but not the invalidation, the position size relative to their account, the portfolio context or the exit — which is everything that decides the outcome.",
    related: ["13F filing", "Invalidation", "Trading plan"],
  },
  {
    term: "Passive investing",
    aliases: ["buy and hold", "index investing"],
    category: "Risk & psychology",
    definition:
      "Buying broad index funds regularly and holding for decades. The benchmark every active strategy has to beat — and most don't, after costs.",
    detail:
      "Understanding why the passive benchmark is so hard to beat is part of trading competence, not an argument against learning to trade.",
    related: ["Index", "ETF", "Expectancy"],
  },

  /* ----------------------------------------------------------------- macro */
  {
    term: "Interest rate",
    aliases: ["interest rates", "rates", "policy rate"],
    category: "Macro",
    definition:
      "The price of borrowing money, set at the short end by a central bank. It is the gravitational constant of financial markets — change it and every asset reprices.",
    detail:
      "Higher rates make safe cash more attractive and reduce the present value of distant future profits, which is why growth stocks fall hardest when rates rise.",
    related: ["Central bank", "Inflation", "Bond"],
  },
  {
    term: "Central bank",
    aliases: ["Federal Reserve", "the Fed", "ECB", "Bank of England"],
    category: "Macro",
    definition:
      "The institution that sets a currency's short-term interest rate and manages monetary policy — the Federal Reserve in the US, the ECB in the eurozone.",
    related: ["Interest rate", "FOMC", "Inflation"],
  },
  {
    term: "FOMC",
    category: "Macro",
    definition:
      "The Federal Open Market Committee — the Federal Reserve body that sets US interest rates. Its eight scheduled meetings a year are the highest-impact events on the calendar.",
    related: ["Central bank", "Interest rate", "Economic calendar"],
  },
  {
    term: "Inflation",
    category: "Macro",
    definition:
      "The rate at which prices across an economy rise. It drives central bank policy, which drives interest rates, which drive everything else.",
    related: ["CPI", "Interest rate", "Central bank"],
  },
  {
    term: "CPI",
    aliases: ["consumer price index"],
    category: "Macro",
    definition:
      "Consumer Price Index — the headline monthly inflation measure. Markets react to how it compares with expectations, not to whether it is high or low.",
    related: ["Inflation", "Economic calendar", "Consensus"],
  },
  {
    term: "NFP",
    aliases: ["non-farm payrolls", "nonfarm payrolls", "jobs report"],
    category: "Macro",
    definition:
      "Non-Farm Payrolls — the monthly US employment report released on the first Friday. One of the most volatile scheduled events in forex and index futures.",
    related: ["Economic calendar", "Central bank"],
  },
  {
    term: "Economic calendar",
    category: "Macro",
    definition:
      "A schedule of upcoming data releases and central bank events with their expected values. Traders use it primarily to know when *not* to be exposed.",
    related: ["CPI", "NFP", "FOMC", "Consensus"],
  },
  {
    term: "Consensus",
    aliases: ["expectations", "expected", "estimate"],
    category: "Macro",
    definition:
      "The average forecast among analysts for an upcoming data point. Price already reflects it, which is why only the surprise moves markets.",
    detail:
      "This is the single most misunderstood idea in news trading: 'good news' that is slightly worse than consensus is bearish.",
    related: ["Priced in", "Earnings", "CPI"],
  },
  {
    term: "Priced in",
    category: "Macro",
    definition:
      "Already reflected in the current price because the market anticipated it. Anticipated events move markets when they happen only to the extent they differ from what was expected.",
    related: ["Consensus", "Buy the rumour, sell the news"],
  },
  {
    term: "Buy the rumour, sell the news",
    aliases: ["buy the rumor sell the news"],
    category: "Macro",
    definition:
      "The pattern where an asset rallies in anticipation of good news and then falls when it arrives, because the buyers who positioned early take profits.",
    related: ["Priced in", "Consensus", "Earnings"],
  },
  {
    term: "Earnings",
    aliases: ["earnings report", "earnings season", "EPS"],
    category: "Macro",
    definition:
      "A company's quarterly profit report. The stock's reaction depends on results versus expectations and on forward guidance, not on the raw numbers.",
    related: ["Guidance", "Consensus", "Gap", "Share"],
  },
  {
    term: "Guidance",
    aliases: ["forward guidance", "outlook"],
    category: "Macro",
    definition:
      "A company's own forecast for coming quarters. Weak guidance routinely sinks a stock that just beat on every current-quarter number.",
    related: ["Earnings", "Consensus"],
  },
  {
    term: "Bond",
    aliases: ["bonds", "yield", "treasury", "yields"],
    category: "Macro",
    definition:
      "A tradable loan to a government or company that pays fixed interest. Bond yields are the market's live vote on future interest rates and inflation.",
    detail:
      "Bond prices and yields move inversely. Watching the 10-year Treasury yield tells you more about why stocks moved than most stock-market commentary does.",
    related: ["Interest rate", "Inflation"],
  },
  {
    term: "Risk-on / risk-off",
    aliases: ["risk-on", "risk-off", "risk appetite"],
    category: "Macro",
    definition:
      "Shorthand for the market's collective appetite for risk. Risk-on: stocks and crypto up, safe havens down. Risk-off: the reverse, usually faster.",
    related: ["Correlation", "Volatility"],
  },
  {
    term: "Correlation",
    category: "Macro",
    definition:
      "How closely two assets move together. It matters for risk because five correlated positions are one position wearing five hats.",
    detail:
      "Correlations tend toward 1 in a crisis — exactly when diversification is supposed to help.",
    related: ["Risk-on / risk-off", "Position sizing"],
  },

  /* ---------------------------------------------------------------- crypto */
  {
    term: "Blockchain",
    category: "Crypto",
    definition:
      "A shared, append-only ledger maintained by a distributed network, recording who owns what without a central authority.",
    related: ["Self-custody", "On-chain"],
  },
  {
    term: "On-chain",
    aliases: ["on chain"],
    category: "Crypto",
    definition:
      "Activity recorded directly on the blockchain, publicly visible — as opposed to trades inside an exchange's internal database.",
    detail:
      "Most crypto trading volume is off-chain, inside exchanges. This is why 'on-chain data' and 'exchange volume' answer different questions.",
    related: ["Blockchain", "Self-custody", "Exchange"],
  },
  {
    term: "Self-custody",
    aliases: ["custody", "wallet", "cold wallet", "not your keys"],
    category: "Crypto",
    definition:
      "Holding your own private keys rather than leaving assets with an exchange. You carry the security burden, but no third party can freeze or lose your coins.",
    detail:
      "'Not your keys, not your coins' isn't a slogan — multiple large exchanges have failed with customer assets inside, most notably FTX in 2022.",
    related: ["On-chain", "Exchange", "Counterparty risk"],
  },
  {
    term: "Counterparty risk",
    category: "Crypto",
    definition:
      "The risk that the institution on the other side of your position or holding your assets fails to deliver — a materially larger risk in crypto than in regulated equity markets.",
    related: ["Self-custody", "Exchange"],
  },
  {
    term: "Stablecoin",
    category: "Crypto",
    definition:
      "A crypto token designed to hold a fixed value, usually $1, backed by reserves. The unit most crypto pairs are actually quoted in.",
    related: ["Crypto", "Counterparty risk"],
  },
  {
    term: "Perpetual futures",
    aliases: ["perps", "perpetual swap", "perpetuals"],
    category: "Crypto",
    definition:
      "Crypto futures with no expiry date, kept in line with spot price by a periodic funding payment between longs and shorts.",
    detail:
      "Perps are where retail crypto leverage lives, often at 20× or more. They are the fastest available way to be liquidated.",
    related: ["Funding rate", "Leverage", "Liquidation"],
  },
  {
    term: "Funding rate",
    category: "Crypto",
    definition:
      "The recurring payment between long and short holders of a perpetual future. Persistently high positive funding means the crowd is heavily long — and crowded positioning tends to unwind violently.",
    related: ["Perpetual futures", "Leverage"],
  },
  {
    term: "Halving",
    category: "Crypto",
    definition:
      "The scheduled halving of Bitcoin's new-coin issuance roughly every four years, reducing new supply. A widely anticipated event, and therefore substantially priced in.",
    related: ["Priced in", "Blockchain"],
  },
];

const index = new Map<string, GlossaryEntry>();
for (const entry of GLOSSARY) {
  index.set(entry.term.toLowerCase(), entry);
  for (const alias of entry.aliases ?? []) index.set(alias.toLowerCase(), entry);
}

export function lookupTerm(term: string): GlossaryEntry | undefined {
  const key = term.trim().toLowerCase();
  return index.get(key) ?? index.get(key.replace(/s$/, ""));
}

export function slugifyTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export const GLOSSARY_CATEGORIES: GlossaryCategory[] = [
  "Market structure",
  "Instruments",
  "Orders",
  "Chart reading",
  "Strategy",
  "Risk & psychology",
  "Macro",
  "Crypto",
];
