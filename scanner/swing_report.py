#!/usr/bin/env python3
"""
Swing Trade Report — Polygon Technicals Only
Receives tickers from the agent, returns technical analysis for each.
Agent handles web search + candidate selection. This script just does Polygon.
"""

import sys
import json
import urllib.request
import urllib.error
import time
from datetime import datetime, timedelta

API_KEY = "CeQhHb9GpjuOkz8flFU7DCR9MGUaUYhh"
BASE_URL = "https://api.polygon.io/v2/aggs/ticker"
REQUEST_DELAY = 0.5
MAX_RETRIES = 3
RETRY_DELAY = 15
HISTORY_DAYS = 100

# ── FILTERS ──────────────────────────────────────────────────────────────────
RSI_LOW, RSI_HIGH = 40, 70
VOL_RATIO_MIN = 1.3
MIN_PRICE, MAX_PRICE = 10, 150
MIN_AV_VOL = 1_000_000
RISK_PCT = 0.02
ACCT_SIZE = 1000
MIN_RR = 2.0
MIN_SCORE = 55

# ── HELPERS ──────────────────────────────────────────────────────────────────

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
    return 100 - (100 / (1 + avg_gain / avg_loss))


def calc_sma(closes: list, period: int) -> float | None:
    if len(closes) < period:
        return None
    return sum(closes[-period:]) / period


def calc_ema(closes: list, period: int = 20) -> float | None:
    if len(closes) < period:
        return None
    k = 2 / (period + 1)
    ema = sum(closes[:period]) / period
    for price in closes[period:]:
        ema = price * k + ema * (1 - k)
    return ema


def avg_volume_fn(volumes: list, period: int = 20) -> float:
    if len(volumes) < period:
        return sum(volumes) / len(volumes) if volumes else 0
    return sum(volumes[-period:]) / period


def analyze_ticker(ticker: str) -> dict | None:
    bars = fetch_bars(ticker)
    if not bars or len(bars) < 60:
        return None

    closes = [b["c"] for b in bars]
    volumes = [b["v"] for b in bars]
    highs = [b["h"] for b in bars]
    lows = [b["l"] for b in bars]

    price = closes[-1]
    prev_close = closes[-2] if len(closes) >= 2 else price
    daily_return = ((price - prev_close) / prev_close) * 100

    sma20 = calc_sma(closes, 20)
    sma50 = calc_sma(closes, 50)
    sma200 = calc_sma(closes, 200) if len(closes) >= 200 else None
    ema20 = calc_ema(closes, 20)
    rsi = calc_rsi(closes)
    vol_ratio = volumes[-1] / avg_volume_fn(volumes) if avg_volume_fn(volumes) else 1
    av_vol = avg_volume_fn(volumes)

    high_52w = max(highs[-252:]) if len(highs) >= 252 else max(highs)
    low_52w = min(lows[-252:]) if len(lows) >= 252 else min(lows)
    pct_from_52w = ((price - high_52w) / high_52w) * 100

    return {
        "ticker": ticker,
        "price": round(price, 2),
        "daily_return": round(daily_return, 2),
        "rsi": round(rsi, 1) if rsi else None,
        "sma20": round(sma20, 2) if sma20 else None,
        "sma50": round(sma50, 2),
        "sma200": round(sma200, 2) if sma200 else None,
        "ema20": round(ema20, 2) if ema20 else None,
        "vol_ratio": round(vol_ratio, 2),
        "av_vol": round(av_vol / 1_000_000, 1),
        "above_sma50": price > sma50 if sma50 else False,
        "above_sma20": price > sma20 if sma20 else False,
        "above_ema20": price > ema20 if ema20 else False,
        "strong_rsi": rsi is not None and RSI_LOW < rsi < RSI_HIGH,
        "good_vol": vol_ratio >= VOL_RATIO_MIN,
        "liquid": av_vol >= MIN_AV_VOL,
        "in_range": MIN_PRICE <= price <= MAX_PRICE,
        "high_52w": round(high_52w, 2),
        "low_52w": round(low_52w, 2),
        "pct_from_52w": round(pct_from_52w, 1),
    }


def score_setup(r: dict) -> float:
    if not r or not r.get("in_range") or not r.get("liquid"):
        return 0
    score = 0
    if r["above_sma50"]: score += 25
    if r["above_sma20"]: score += 10
    if r["above_ema20"]: score += 10
    if r["strong_rsi"]: score += 20
    if r["good_vol"]: score += 15
    if r["rsi"] and 45 <= r["rsi"] <= 60: score += 10
    if r["pct_from_52w"] > -5: score += 10
    elif r["pct_from_52w"] > -15: score += 5
    return score


def detect_pattern(r: dict) -> str:
    price = r["price"]
    sma20 = r["sma20"]
    sma50 = r["sma50"]
    if sma20 and price > sma20 and (sma20 * 1.03) >= price:
        return "Pullback to EMA-20"
    if r["above_sma50"] and r["good_vol"] and r["vol_ratio"] > 1.5:
        return "Breakout above SMA-50"
    if sma50 and abs(price - sma50) / sma50 < 0.03:
        return "Consolidation at SMA-50"
    if r["pct_from_52w"] > -3:
        return "Near 52W High"
    if r["low_52w"] and price / r["low_52w"] < 1.3:
        return "Support Bounce"
    return "Momentum Continuation"


def build_setup(r: dict) -> dict | None:
    if not r or r["price"] <= 0:
        return None
    pattern = detect_pattern(r)
    stop_pct = 0.05
    target_pct = stop_pct * MIN_RR * 1.2
    stop = round(r["price"] * (1 - stop_pct), 2)
    target = round(r["price"] * (1 + target_pct), 2)
    risk = r["price"] - stop
    reward = target - r["price"]
    rr = reward / risk if risk > 0 else 0
    if rr < MIN_RR:
        return None
    expected_move = ((target - r["price"]) / r["price"]) * 100
    return {
        "ticker": r["ticker"],
        "price": r["price"],
        "pattern": pattern,
        "rsi": r["rsi"],
        "sma20": r["sma20"],
        "sma50": r["sma50"],
        "sma200": r["sma200"],
        "ema20": r["ema20"],
        "vol_ratio": r["vol_ratio"],
        "av_vol": r["av_vol"],
        "pct_from_52w": r["pct_from_52w"],
        "entry": r["price"],
        "stop": stop,
        "target": target,
        "risk": round(risk, 2),
        "reward": round(reward, 2),
        "rr": round(rr, 1),
        "expected_move": round(expected_move, 1),
        "score": score_setup(r),
        "above_sma50": r["above_sma50"],
    }


def position_size(entry: float, stop: float) -> dict:
    max_risk = ACCT_SIZE * RISK_PCT
    risk_per_share = entry - stop
    if risk_per_share <= 0:
        return {"shares": 0, "risk": 0}
    shares = int(max_risk / risk_per_share)
    return {"shares": shares, "risk": round(shares * risk_per_share, 2)}


def rank_stars(score: float, rr: float) -> str:
    if score >= 85 and rr >= 2.5:
        return "★★★★★"
    elif score >= 70 and rr >= 2.2:
        return "★★★★"
    elif score >= 55 and rr >= 2.0:
        return "★★★"
    return "—"


def run_for_tickers(tickers: list) -> list:
    """Main entry point when called with a list of tickers."""
    print(f"🔍 Analyzing {len(tickers)} candidates...", file=sys.stderr)
    results = []
    for ticker in tickers:
        print(f"  {ticker}...", end=" ", flush=True)
        r = analyze_ticker(ticker)
        if r:
            results.append(r)
            print(f"${r['price']} RSI={r['rsi']}", file=sys.stderr)
        time.sleep(REQUEST_DELAY)
    print(f"  Got data for {len(results)}/{len(tickers)}", file=sys.stderr)

    setups = []
    for r in results:
        s = build_setup(r)
        if s and s["rr"] >= MIN_RR and s["score"] >= MIN_SCORE:
            setups.append(s)
    setups.sort(key=lambda x: x["score"], reverse=True)
    return setups


# ── CLI ─────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Called with tickers as args
        tickers = [a.upper() for a in sys.argv[1:] if a.startswith("-") is False]
        setups = run_for_tickers(tickers)
        print(f"\n=== RESULTS: {len(setups)} QUALIFYING SETUPS ===\n")
        for s in setups:
            stars = rank_stars(s["score"], s["rr"])
            print(f"{stars} {s['ticker']} | ${s['price']} | RSI={s['rsi']} | SMA50={'✅' if s['above_sma50'] else '❌'} | Vol={s['vol_ratio']}x | 52W={s['pct_from_52w']:+.1f}%")
            print(f"   Entry=${s['entry']} Stop=${s['stop']} Target=${s['target']} | R/R={s['rr']}:1 | Risk=${s['risk']}/share | Score={s['score']:.0f}")
        sys.exit(0)

    # Default: run with SPY/QQQ/IWM + a sample set
    print("No tickers provided. Run with: python3 swing_report.py XOM CVX COP...", file=sys.stderr)