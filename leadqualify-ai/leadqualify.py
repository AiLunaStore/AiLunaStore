#!/usr/bin/env python3
"""
LeadQualify AI — AI-Powered Lead Qualification Tool
https://gumroad.com/... (update with your Gumroad link)

Usage:
    python leadqualify.py                          # Launch web UI (Gradio)
    python leadqualify.py --csv leads.csv          # Process CSV file
    python leadqualify.py --text "name|email|..."  # Process text input
"""

import os
import csv
import json
import argparse
import sys
from pathlib import Path

# Try OpenAI first, fall back to free assessment
HAS_OPENAI = False
try:
    from openai import OpenAI
    client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY", ""))
    HAS_OPENAI = bool(os.environ.get("OPENAI_API_KEY", ""))
except ImportError:
    pass

# Try Anthropic as fallback
HAS_ANTHROPIC = False
try:
    import anthropic
    anthropic_client = anthropic.Anthropic(api_key=os.environ.get("ANTHROPIC_API_KEY", ""))
    HAS_ANTHROPIC = bool(os.environ.get("ANTHROPIC_API_KEY", ""))
except ImportError:
    pass


# ─────────────────────────────────────────────
# Scoring Criteria & Prompts
# ─────────────────────────────────────────────

SCORING_CRITERIA = """
Each lead is scored 0-100 across 4 dimensions:
  • Budget Fit (0-25): Does their budget align with your pricing?
  • Timeline Fit (0-25): Is their timeline realistic?
  • Messaging Fit (0-25): Does their described need match your services?
  • Decision Maker (0-25): Are they likely the decision-maker?

Final Score: Sum of all dimensions (0-100)
  80-100 → HOT 🔥  (Act immediately)
  60-79  → WARM 🌡️ (Nurture with value)
  40-59  → COOL ❄️  (Low priority, auto-responder)
  0-39   → COLD 🧊  (Not worth your time)
"""


def build_lead_prompt(lead_text: str, your_services: str) -> str:
    return f"""You are a senior business development consultant helping a freelancer or agency qualify leads.

Their Services:
{your_services}

Evaluate the following lead:
---
{lead_text}
---

Respond ONLY with valid JSON in this exact format (no markdown, no explanation, just the JSON object):
{{
  "budget_score": 0-25,
  "budget_reason": "1-2 sentence explanation",
  "timeline_score": 0-25,
  "timeline_reason": "1-2 sentence explanation",
  "messaging_score": 0-25,
  "messaging_reason": "1-2 sentence explanation",
  "decision_score": 0-25,
  "decision_reason": "1-2 sentence explanation",
  "total_score": 0-100,
  "tier": "HOT|WARM|COOL|COLD",
  "emoji": "🔥|🌡️|❄️|🧊",
  "summary": "2-3 sentence overall assessment and recommended action",
  "ideal_first_contact": "specific, personalized outreach angle based on what stood out"
}}
"""


def score_lead_openai(lead_text: str, your_services: str) -> dict:
    """Score a lead using OpenAI GPT-4."""
    prompt = build_lead_prompt(lead_text, your_services)
    response = client.chat.completions.create(
        model="gpt-4o",
        messages=[
            {"role": "system", "content": "You are a lead qualification expert. Always respond with valid JSON only."},
            {"role": "user", "content": prompt}
        ],
        temperature=0.3,
        max_tokens=600,
    )
    return json.loads(response.choices[0].message.content)


def score_lead_anthropic(lead_text: str, your_services: str) -> dict:
    """Score a lead using Anthropic Claude."""
    prompt = build_lead_prompt(lead_text, your_services)
    response = anthropic_client.messages.create(
        model="claude-sonnet-4-20250514",
        max_tokens=600,
        messages=[
            {"role": "user", "content": prompt}
        ],
    )
    return json.loads(response.content[0].text)


def score_lead_heuristic(lead_text: str, your_services: str) -> dict:
    """Rule-based scoring when no API keys are available."""
    text = lead_text.lower()
    score = 50  # baseline
    reasons = []

    # Budget signals
    if any(w in text for w in ["budget", "willing to pay", "invest", "$", "k/month", "k/mo"]):
        score += 10
        reasons.append("mentions budget/investment")
    if any(w in text for w in ["low budget", "tight budget", "no budget", "free", "cheap"]):
        score -= 15
        reasons.append("suggests tight/no budget")

    # Timeline signals
    if any(w in text for w in ["urgent", "asap", "immediately", "this week", " Deadline"]):
        score += 10
        reasons.append("has urgent timeline")
    if any(w in text for w in ["eventually", "sometime", "when we can", "exploring"]):
        score -= 8
        reasons.append("timeline is vague or far out")

    # Decision maker signals
    if any(w in text for w in ["ceo", "founder", "owner", "director", "head of", "decision"]):
        score += 10
        reasons.append("appears to be a decision-maker")
    if any(w in text for w in ["assistant", "intern", "coordinator", "please find"]):
        score -= 5

    # Messaging fit signals
    if any(w in text for w in your_services.lower().split()):
        score += 5
        reasons.append("need aligns with stated services")

    score = max(0, min(100, score))

    tier = "HOT" if score >= 80 else "WARM" if score >= 60 else "COOL" if score >= 40 else "COLD"
    emoji = {"HOT": "🔥", "WARM": "🌡️", "COOL": "❄️", "COLD": "🧊"}[tier]

    return {
        "budget_score": min(25, max(0, 10 + score // 5)),
        "budget_reason": reasons[0] if reasons else "Budget not clearly specified",
        "timeline_score": min(25, max(0, 10 + score // 6)),
        "timeline_reason": "Timeline assessed from context",
        "messaging_score": min(25, max(0, 10 + score // 7)),
        "messaging_reason": "Messaging alignment assessed from context",
        "decision_score": min(25, max(0, 10 + score // 8)),
        "decision_reason": "Decision-maker status inferred from context",
        "total_score": score,
        "tier": tier,
        "emoji": emoji,
        "summary": f"Heuristic score: {score}/100. {reasons[0] if reasons else 'Limited context for deep assessment.'} For accurate AI-powered scoring with detailed reasoning, add your OpenAI API key (export OPENAI_API_KEY=...).",
        "ideal_first_contact": "Send a value-forward email addressing their stated pain points."
    }


def score_lead(lead_text: str, your_services: str) -> dict:
    if HAS_OPENAI:
        return score_lead_openai(lead_text, your_services)
    elif HAS_ANTHROPIC:
        return score_lead_anthropic(lead_text, your_services)
    else:
        return score_lead_heuristic(lead_text, your_services)


def parse_csv_input(csv_path: str) -> list:
    """Parse leads from a CSV file. Expects columns: name, email, company, message (flexible)."""
    leads = []
    with open(csv_path, newline='', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        for row in reader:
            lead_text = " | ".join(f"{k}: {v}" for k, v in row.items() if v and str(v).strip())
            leads.append({
                "original": row,
                "text": lead_text,
            })
    return leads


def parse_text_input(text: str) -> list:
    """Parse leads from pipe or newline-separated text."""
    if "|" in text:
        separator = "|"
    else:
        separator = "\n"

    leads = []
    for line in text.strip().split(separator):
        line = line.strip()
        if line:
            leads.append({
                "original": {"raw": line},
                "text": line,
            })
    return leads


def format_result(lead: dict, result: dict) -> str:
    lines = [
        f"\n{'='*60}",
        f"  {result['emoji']} {result['tier']} — Score: {result['total_score']}/100",
        f"{'='*60}",
        f"\n📊 Scoring Breakdown:",
        f"   Budget:        {result['budget_score']}/25 — {result['budget_reason']}",
        f"   Timeline:      {result['timeline_score']}/25 — {result['timeline_reason']}",
        f"   Messaging Fit: {result['messaging_score']}/25 — {result['messaging_reason']}",
        f"   Decision Maker:{result['decision_score']}/25 — {result['decision_reason']}",
        f"\n💬 Summary:\n   {result['summary']}",
        f"\n📧 Ideal First Contact:\n   {result['ideal_first_contact']}",
    ]
    return "\n".join(lines)


# ─────────────────────────────────────────────
# CLI Mode
# ─────────────────────────────────────────────

def run_cli(args):
    print("\n🚀 LeadQualify AI — CLI Mode")
    print(f"   Provider: {'OpenAI GPT-4' if HAS_OPENAI else ('Anthropic Claude' if HAS_ANTHROPIC else 'Heuristic (free)')}\n")

    if args.csv:
        leads = parse_csv_input(args.csv)
    elif args.text:
        leads = parse_text_input(args.text)
    else:
        print("Please provide --csv <file> or --text <input>")
        sys.exit(1)

    your_services = args.services or "web development, design, and digital marketing services"
    total = len(leads)

    print(f"📋 Processing {total} lead(s)...\n")

    results = []
    for i, lead in enumerate(leads, 1):
        print(f"[{i}/{total}] Scoring: {lead['text'][:80]}...")
        result = score_lead(lead['text'], your_services)
        result["_original"] = lead["original"]
        results.append(result)
        print(format_result(lead, result))

    # Summary
    hot = sum(1 for r in results if r["tier"] == "HOT")
    warm = sum(1 for r in results if r["tier"] == "WARM")
    cool = sum(1 for r in results if r["tier"] == "COOL")
    cold = sum(1 for r in results if r["tier"] == "COLD")

    print(f"\n{'='*60}")
    print(f"  SUMMARY — {total} leads qualified")
    print(f"  🔥 HOT: {hot}  🌡️ WARM: {warm}  ❄️ COOL: {cool}  🧊 COLD: {cold}")
    print(f"{'='*60}\n")

    if args.output:
        with open(args.output, "w", encoding="utf-8") as f:
            json.dump(results, f, indent=2, ensure_ascii=False)
        print(f"💾 Results saved to {args.output}")


# ─────────────────────────────────────────────
# Web UI Mode (Gradio)
# ─────────────────────────────────────────────

def run_web():
    try:
        import gradio as gr
    except ImportError:
        print("Gradio not installed. Install with: pip install gradio")
        print("Or run CLI mode: python leadqualify.py --csv leads.csv ...")
        sys.exit(1)

    provider_note = ""
    if HAS_OPENAI:
        provider_note = "✅ OpenAI GPT-4 connected"
    elif HAS_ANTHROPIC:
        provider_note = "✅ Anthropic Claude connected"
    else:
        provider_note = "⚠️  No API key detected. Using heuristic scoring. Set OPENAI_API_KEY for AI-powered analysis."

    css = """
    .leadqualify-header { text-align: center; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; border-radius: 12px; margin-bottom: 20px; }
    .score-badge { font-size: 24px; font-weight: bold; padding: 10px 20px; border-radius: 8px; display: inline-block; }
    .hot { background: #fee2e2; color: #991b1b; } .warm { background: #fef3c7; color: #92400e; }
    .cool { background: #dbeafe; color: #1e40af; } .cold { background: #f3f4f6; color: #4b5563; }
    .result-card { border: 1px solid #e5e7eb; border-radius: 12px; padding: 16px; margin: 10px 0; background: #fafafa; }
    """

    def qualify_leads_csv(file, services):
        if file is None:
            return "Please upload a CSV file.", ""
        import tempfile
        temp_path = tempfile.NamedTemporaryFile(suffix=".csv", delete=False).name
        with open(temp_path, "wb") as f:
            f.write(file)
        leads = parse_csv_input(temp_path)
        os.unlink(temp_path)
        return process_leads_ui(leads, services)

    def qualify_leads_text(text, services):
        leads = parse_text_input(text)
        return process_leads_ui(leads, services)

    def process_leads_ui(leads, services):
        if not leads:
            return "No leads found. Check your input format.", ""
        srv = services or "freelance services"
        cards = []
        summary_parts = []

        for i, lead in enumerate(leads):
            result = score_lead(lead["text"], srv)
            tier_class = result["tier"].lower()
            card = f"""
            <div class="result-card">
                <div style="margin-bottom:8px"><strong>Lead:</strong> {lead['text'][:100]}{'...' if len(lead['text']) > 100 else ''}</div>
                <div class="score-badge {tier_class}">{result['emoji']} {result['tier']} — {result['total_score']}/100</div>
                <details style="margin-top:10px">
                    <summary style="cursor:pointer;color:#667eea;font-weight:600">View Details</summary>
                    <div style="margin-top:8px">
                        <div>💰 Budget: <strong>{result['budget_score']}/25</strong> — {result['budget_reason']}</div>
                        <div>⏱️  Timeline: <strong>{result['timeline_score']}/25</strong> — {result['timeline_reason']}</div>
                        <div>💬 Messaging: <strong>{result['messaging_score']}/25</strong> — {result['messaging_reason']}</div>
                        <div>👤 Decision Maker: <strong>{result['decision_score']}/25</strong> — {result['decision_reason']}</div>
                        <div style="margin-top:8px;padding:8px;background:#f0f0f0;border-radius:6px">
                            <strong>Summary:</strong> {result['summary']}<br><br>
                            <strong>📧 Best First Contact:</strong> {result['ideal_first_contact']}
                        </div>
                    </div>
                </details>
            </div>
            """
            cards.append(card)
            summary_parts.append(f"{result['emoji']} {result['tier']}")

        hot = sum(1 for c in cards if 'hot' in c)
        warm = sum(1 for c in cards if 'warm' in c)
        cool = sum(1 for c in cards if 'cool' in c)
        cold = sum(1 for c in cards if 'cold' in c)

        summary = f"📊 Summary: {hot} 🔥 HOT | {warm} 🌡️ WARM | {cool} ❄️ COOL | {cold} 🧊 COLD"
        return "\n".join(cards), summary

    with gr.Blocks(css=css, title="LeadQualify AI") as demo:
        gr.HTML("""
        <div class="leadqualify-header">
            <h1>🎯 LeadQualify AI</h1>
            <p>AI-powered lead qualification for freelancers & agencies</p>
            <p style="font-size:13px;opacity:0.9">""" + provider_note + """</p>
        </div>
        """)

        with gr.Tab("Paste Leads"):
            with gr.Row():
                with gr.Column():
                    text_input = gr.Textbox(label="Paste Your Leads", placeholder="Lead 1: name | email | company | message describing their need (one per line or pipe-separated)", lines=8)
                    services_input = gr.Textbox(label="Your Services (optional)", placeholder="e.g. web development, app design, brand strategy", lines=2)
                    btn = gr.Button("🔍 Qualify Leads", variant="primary")
                with gr.Column():
                    output = gr.HTML(label="Results")
                    summary = gr.Textbox(label="Summary", interactive=False)

            btn.click(fn=qualify_leads_text, inputs=[text_input, services_input], outputs=[output, summary])

        with gr.Tab("Upload CSV"):
            with gr.Row():
                with gr.Column():
                    csv_input = gr.File(label="Upload CSV (columns: name, email, company, message...)")
                    services_csv = gr.Textbox(label="Your Services (optional)", placeholder="e.g. web development, app design, brand strategy", lines=2)
                    btn2 = gr.Button("🔍 Qualify CSV", variant="primary")
                with gr.Column():
                    output2 = gr.HTML(label="Results")
                    summary2 = gr.Textbox(label="Summary", interactive=False)

            btn2.click(fn=qualify_leads_csv, inputs=[csv_input, services_csv], outputs=[output2, summary2])

        with gr.Row():
            gr.HTML(f"""
            <div style="text-align:center;padding:16px;background:#f9fafb;border-radius:8px;margin-top:10px">
                <p style="margin:0;font-size:13px;color:#6b7280">
                    {SCORING_CRITERIA.strip()}
                </p>
            </div>
            """)

    print("\n🌐 Launching LeadQualify AI Web UI...")
    print("   Open http://localhost:7860 in your browser\n")
    demo.launch(server_name="0.0.0.0", server_port=7860)


# ─────────────────────────────────────────────
# Entry Point
# ─────────────────────────────────────────────

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="LeadQualify AI — Qualify your leads with AI")
    parser.add_argument("--csv", help="Path to CSV file with leads")
    parser.add_argument("--text", help="Pipe or newline-separated lead text")
    parser.add_argument("--services", help="Describe your services for better scoring")
    parser.add_argument("--output", help="Save results to JSON file")
    parser.add_argument("--web", action="store_true", help="Launch web UI (Gradio)")

    args = parser.parse_args()

    if args.web or (not args.csv and not args.text):
        run_web()
    else:
        run_cli(args)
