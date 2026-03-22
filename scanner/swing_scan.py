#!/usr/bin/env python3
"""
Swing Trade Scanner — Polygon API + Technical Analysis
"""

import sys
import json
import urllib.request
import urllib.error
import time
from datetime import datetime, timedelta

API_KEY = "CeQhHb9GpjuOkz8flFU7DCR9MGUaUYhh"
BASE_URL = "https://api.polygon.io/v2/aggs/ticker"
REQUEST_DELAY = 0.5  # 2 calls/sec to avoid rate limit
MAX_RETRIES = 3
RETRY_DELAY = 15

# ── TODAY'S CANDIDATES FROM MARKET SCAN ─────────────────────────────────────
WATCHLIST = [
    "PL",      # Planet Labs +24.4%, 3M vol, ~$33
    "SMCI",    # Super Micro -27% but high vol (fallen, not setup)
    "BABA",    # Alibaba +0.7%, 1.2M vol
    "DELL",    # Dell +4.2%, 812K vol
    "NVDA",    # NVIDIA -0.3%, 2.5M vol
    "FLY",     # Firefly Aerospace +12.4%, 436K vol
    "SER",     # Serina Therapeutics +13.7%, 2.4M vol
    "MU",      # Micron -0.1%, 1.2M vol
    "TSLA",    # Tesla -0.3%
    "AAPL",    # Apple -0.4%
    "MSFT",    # Microsoft -0.8%
    "META",    # Meta -0.6%
    "NVO",     # Novo Nordisk -1.5%
    "SMCI",    # Super Micro -27%
    "CODX",    # Co-Diagnostics +44% (pennystock, check price)
]

HISTORY_DAYS = 100
RSI_LOW = 40
RSI_HIGH = 70
VOL_RATIO_MIN = 1.2


def fetch_bars(ticker: str, days: int = HISTORY_DAYS) -> list | None:
    end = datetime.now()
    start = end - timedelta(days=days)
    url = (
        f"{BASE_URL}/{ticker}/range/1/day/"
        f"{start.strftime('%Y-%m-%d')}/{end.strftime('%Y-%m-%d')}"
        f"?adjusted=true&sort=asc&limit=500&apiKey={API_KEY}"
    )
    for attempt in range(MAX_RETRIES):
        try:
            with urllib.request.urlopen(url, timeout=15) as resp:
                data = json.loads(resp.read())
            if data.get("status") == "OK" and data.get("results"):
                return data["results"]
            elif data.get("status") == "DELAYED":
                return data.get("results")
            return None
        except urllib.error.HTTPError as e:
            if e.code == 429 and attempt < MAX_RETRIES - 1:
                print(f"\n  [!] Rate limited on {ticker}, waiting {RETRY_DELAY}s...", file=sys.stderr)
                time.sleep(RETRY_DELAY)
                continue
            return None
        except Exception:
            return None
    return None


def calc_rsi(closes: list, period: int = 14) -> float | None:
    if len(closes) < period + 1:
        return None
    deltas = [closes[i] - closes[i - 1] for i in range(1, len(closes))]
    gains = [d if d > 0 else 0 for d in deltas[-period:]]
    losses = [-d if d < 0 else 0 for d in deltas[-period:]]
    avg_gain = sum(gains) / period
    avg_loss = sum(losses) / period
    if avg_loss == 0:
        return 100
    rs = avg_gain / avg_loss
    return 100 - (100 / (1 + rs))


def calc_sma(closes: list, period: int) -> float | None:
    if len(closes) < period:
        return None
    return sum(closes[-period:]) / period


def calc_vol_ratio(volumes: list, period: int = 20) -> float:
    if len(volumes) < period:
        return 1.0
    avg_vol = sum(volumes[-period:]) / period
    return (volumes[-1] / avg_vol) if avg_vol > 0 else 1.0


def analyze(ticker: str) -> dict | None:
    bars = fetch_bars(ticker)
    if not bars or len(bars) < 60:
        return None

    closes = [b["c"] for b in bars]
    volumes = [b["v"] for b in bars]
    highs = [b["h"] for b in bars]
    lows = [b["l"] for b in bars]

    price = closes[-1]
    prev_close = closes[-2] if len(closes) >= 2 else price
    daily_return = ((price - prev_close) / prev_close) * 100 if prev_close else 0

    sma20 = calc_sma(closes, 20)
    sma50 = calc_sma(closes, 50)
    sma200 = calc_sma(closes, 200) if len(closes) >= 200 else None
    rsi = calc_rsi(closes)
    vol_ratio = calc_vol_ratio(volumes)

    if sma50 is None:
        return None

    high_52w = max(highs[-252:]) if len(highs) >= 252 else max(highs)
    low_52w = min(lows[-252:]) if len(lows) >= 252 else min(lows)
    pct_from_52w = ((price - high_52w) / high_52w) * 100 if high_52w else 0

    return {
        "ticker": ticker,
        "price": round(price, 2),
        "daily_return": round(daily_return, 2),
        "rsi": round(rsi, 1) if rsi else None,
        "sma20": round(sma20, 2) if sma20 else None,
        "sma50": round(sma50, 2),
        "sma200": round(sma200, 2) if sma200 else None,
        "vol_ratio": round(vol_ratio, 2),
        "above_sma50": price > sma50,
        "above_sma20": price > sma20 if sma20 else False,
        "strong_rsi": rsi is not None and RSI_LOW < rsi < RSI_HIGH,
        "good_vol": vol_ratio >= VOL_RATIO_MIN,
        "high_52w": round(high_52w, 2),
        "low_52w": round(low_52w, 2),
        "pct_from_52w": round(pct_from_52w, 1),
        "closes": closes,
        "volumes": volumes,
    }


def score_setup(r: dict) -> float:
    score = 0
    if r["above_sma50"]: score += 25
    if r["above_sma20"]: score += 15
    if r["strong_rsi"]: score += 20
    if r["good_vol"]: score += 15
    if r["rsi"] and 45 <= r["rsi"] <= 60: score += 10
    score += min(r["vol_ratio"] * 5, 15)
    return score


def print_report(candidates: list, min_score: int = 45):
    now = datetime.now().strftime("%Y-%m-%d %H:%M PT")
    print(f"\n{'='*70}")
    print(f"  📊 SWING TRADE SCAN — {now}")
    print(f"  Source: Pre-market movers + live technicals via Polygon")
    print(f"{'='*70}")

    scored = [(r, score_setup(r)) for r in candidates if score_setup(r) >= min_score]
    scored.sort(key=lambda x: x[1], reverse=True)

    print(f"\n  Scanned {len(WATCHLIST)} tickers | Passed filters: {len(scored)}")

    if not scored:
        print("\n  ⚠ No candidates meet swing trade criteria.")
        return

    # ── TABLE ────────────────────────────────────────────────────────────
    print(f"\n{'TICKER':<7} {'PRICE':>8} {'RSI':>5} {'SMA20':>8} {'SMA50':>8} {'VOLx':>6} {'52W HIGH':>10} {'SCORE':>7}")
    print(f"{'-'*68}")
    for r, score in scored:
        rsi_str = f"{r['rsi']:.0f}" if r['rsi'] else "N/A"
        above = "✅" if r["above_sma50"] else "❌"
        print(
            f"{r['ticker']:<7} "
            f"${r['price']:>7.2f} "
            f"{rsi_str:>5} "
            f"${r['sma20'] or 0:>7.2f} "
            f"${r['sma50']:>7.2f} "
            f"{r['vol_ratio']:>5.1f}x "
            f"{r['pct_from_52w']:>+8.1f}% "
            f"{score:>6.0f}"
        )

    # ── DETAIL ───────────────────────────────────────────────────────────
    print(f"\n{'─'*70}")
    print("  TRADE SETUPS")
    print(f"{'─'*70}")
    for i, (r, score) in enumerate(scored[:6], 1):
        rsi = r['rsi'] or 50
        stop = round(min(r['sma50'], r['price'] * 0.965), 2)
        risk_pct = ((r['price'] - stop) / r['price']) * 100
        target = round(r['price'] * (1 + (risk_pct * 2.5) / 100), 2)
        reward_pct = ((target - r['price']) / r['price']) * 100

        stars = "⭐" * min(int(score) // 20 + 1, 5)

        print(f"\n  #{i} {r['ticker']} — {stars} (score: {score:.0f}/100)")
        print(f"     Price: ${r['price']} | SMA20: ${r['sma20']} | SMA50: ${r['sma50']} | SMA200: ${r['sma200']}")
        print(f"     RSI: {rsi:.0f} | Vol: {r['vol_ratio']}x 20-day avg | 52W High: {r['pct_from_52w']:+.1f}% from high")
        print(f"     Entry: ${r['price']} | Stop: ${stop} (-{risk_pct:.1f}%) | Target: ${target} (+{reward_pct:.1f}%)")
        print(f"     R/R: ~{2.5:.1f}:1 | Risk: ${r['price'] - stop:.2f}/share")

    # ── RISK MANAGEMENT ──────────────────────────────────────────────────
    acct_size = 1000
    risk_pct = 0.02  # 2% max risk per trade on small account

    print(f"\n{'─'*70}")
    print("  POSITION SIZING (Account: $1,000 | Max risk: 2% = $20/trade)")
    print(f"{'─'*70}")
    print(f"  {'TICKER':<7} {'ENTRY':>8} {'STOP':>8} {'RISK/SH':>8} {'MAX $':>8} {'MAX SH':>7} {'ACT $':>7} {'ACT R%':>8}")
    print(f"  {'-'*68}")
    for r, score in scored[:6]:
        stop = round(min(r['sma50'], r['price'] * 0.965), 2)
        risk_per_share = r['price'] - stop
        max_dollar = acct_size * risk_pct
        max_shares_if_stops_hit = int(max_dollar / risk_per_share) if risk_per_share > 0 else 0
        # Max shares affordable at entry price
        max_affordable = int(acct_size * 0.10 / r['price'])  # use 10% of acct for one position
        shares_to_buy = min(max_shares_if_stops_hit, max_affordable)
        actual_risk = shares_to_buy * risk_per_share
        actual_risk_pct = (actual_risk / acct_size) * 100 if shares_to_buy else 0
        reward_per_share = target - r['price']
        potential_reward = shares_to_buy * reward_per_share
        print(
            f"  {r['ticker']:<7} "
            f"${r['price']:>7.2f} "
            f"${stop:>7.2f} "
            f"${risk_per_share:>7.2f} "
            f"${max_dollar:>7.2f} "
            f"{shares_to_buy:>7} "
            f"${actual_risk:>6.2f} "
            f"{actual_risk_pct:>7.1f}%"
        )

    print(f"\n  💡 Max $ per trade: ${acct_size * risk_pct:.0f} | Using 10% of acct (~${acct_size * 0.10:.0f}) as hard cap")
    print(f"  💡 This keeps you from over-leveraging on a small account")

    print(f"\n{'='*70}")
    print("  ⚠️  Not financial advice. Always verify before trading.")
    print(f"{'='*70}\n")


if __name__ == "__main__":
    print("\n🔍 Running swing scan on today's movers...", file=sys.stderr)
    results = []
    for ticker in WATCHLIST:
        print(f"  Scanning {ticker}... ({len(results)} collected)", end="\r", flush=True)
        r = analyze(ticker)
        if r:
            results.append(r)
        time.sleep(REQUEST_DELAY)
    print(f"\n  Done — got data for {len(results)} tickers       ")

    if results:
        print_report(results)
    else:
        print("\n⚠ No data retrieved. Check API key and connection.")