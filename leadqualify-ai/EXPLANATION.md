# How LeadQualify AI Works — Full Explanation

A plain-English + technical guide to the LeadQualify AI system. Whether you're a freelancer wondering *"why did my lead get a 42?"* or a developer poking around the code — this doc is for you.

---

## TL;DR at a Glance

LeadQualify AI reads a lead's message (name, email, company, what they said they need) and scores it **0–100** across four dimensions. It then slaps a tier label on it (🔥 HOT through 🧊 COLD) and tells you the best opening line to use. You can run it via web UI, CLI, CSV batch, or Python API.

---

## 1. The Core Scoring Algorithm

Each lead gets scored across **four independent dimensions**, each worth up to 25 points, for a **maximum total of 100 points**.

| Dimension | Max Points | What It's Evaluating |
|---|---|---|
| 💰 Budget Fit | 25 | Does their money match your pricing? |
| ⏱️ Timeline Fit | 25 | Is their deadline realistic and urgent? |
| 💬 Messaging Fit | 25 | Does their need actually match what you offer? |
| 👤 Decision Maker | 25 | Are they the person who can actually say "yes"? |

### How Points Become Tiers

| Score | Tier | What to Do |
|---|---|---|
| 80–100 | 🔥 HOT | Reach out personally within 24 hours |
| 60–79 | 🌡️ WARM | Send a nurture sequence (case studies, value emails) |
| 40–59 | ❄️ COOL | Auto-responder welcome sequence is fine |
| 0–39 | 🧊 COLD | Batch newsletter — don't spend energy here |

### The Math (Simplified)

It's not simple addition of raw signals — the AI (or heuristic engine) interprets the *combination* of signals intelligently. For example, a lead saying "our CEO wants this done by Friday" might score high on both Timeline AND Decision Maker simultaneously, because urgency + decision-maker presence is a compound positive signal. A lead saying "we're exploring options, no rush, still in research mode" loses points on both Timeline and Decision Maker at once.

---

## 2. How It Analyzes Each Dimension

### 💰 Budget Fit (0–25)

**What it's looking for:**
- Explicit budget mentions ("$5–8k", "willing to invest $10k")
- Willingness signals ("we have budget allocated", "ready to move")
- Pricing alignment with your stated services

**What hurts this score:**
- "tight budget", "low budget", "we're a startup with limited funds"
- "free" or "pro-bono" requests
- No budget mentioned at all (ambiguity = penalty in AI mode)

**Example:** A lead that says *"We have $15k set aside for this project and approval to spend it"* → near-maximum budget score. One that says *"we're bootstrapped and need to be mindful of costs"* → moderate-to-low score.

---

### ⏱️ Timeline Fit (0–25)

**What it's looking for:**
- Specific deadlines ("need it live by Q2", "launching in May")
- Urgency signals ("need this ASAP", "urgent", "time-sensitive")
- Realistic timeframes (a 6-week build for a complex e-commerce site = red flag in the *other* direction)

**What hurts this score:**
- "exploring options", "when we get around to it"
- "sometime next year"
- Unrealistic timelines (AI mode flags this; heuristic mode is simpler)

**Example:** *"We're launching a product in 6 weeks and need the website ready"* → high timeline score if your services can support that. *"We're in early stages and just gathering quotes"* → low score.

**Note:** The AI also penalizes *unrealistically tight* timelines (like "we need this tomorrow"). Quality work takes time, and the AI knows this.

---

### 💬 Messaging Fit (0–25)

**What it's looking for:**
- Keywords that match your stated services
- Clear problem statements ("we need a redesign because...")
- Specific needs vs. vague interest

**What hurts this score:**
- The lead wants something you clearly don't offer (e.g., you're a web designer and they need accounting software)
- Vague messages ("interested in your services", no specifics)
- Misaligned audience (e.g., you're a B2B SaaS specialist and the lead is a consumer app)

**How you improve this:** When you run the tool, pass `--services "web design and branding for restaurants and hospitality"` instead of just "web design". The more specific your services description, the better the AI can spot genuine alignment.

---

### 👤 Decision Maker (0–25)

**What it's looking for:**
- Title indicators in the message or inferred from context: CEO, Founder, Owner, Director, Head of...
- Language suggesting authority ("we're ready to move", "I can make this happen")
- Company size correlation (a 5-person startup's "CEO" is genuinely the decision maker; a 500-person company's "marketing coordinator" probably isn't)

**What hurts this score:**
- "I'm an intern coordinating this for my boss"
- Email signatures suggesting coordinator/assistant roles
- Gatekeeper language ("please find below", "my manager asked me to reach out")

**Example:** *"I'm the founder of a 10-person team and we need this live by Q1"* → likely max decision-maker score. *"My manager asked me to get quotes from a few vendors"* → low score.

---

## 3. Heuristic Mode vs. AI Mode

This is the most important distinction for users.

### 🤖 AI Mode (GPT-4 or Claude)

**How it works:**
The lead's text + your services description are sent as a structured prompt to either:
- **OpenAI GPT-4o** (if `OPENAI_API_KEY` is set)
- **Anthropic Claude Sonnet** (if `ANTHROPIC_API_KEY` is set, and no OpenAI key)

The LLM reads the full context, applies judgment across all four dimensions simultaneously, and returns a structured JSON score with natural-language reasoning for each dimension.

**Why it's better:**
- Contextual judgment: GPT-4 understands that *"our CFO is pushing for this to close before Q2"* combined with *"we have board approval for the budget"* means something different than either signal alone.
- Sarcasm, hedging, and complex language don't fool it.
- It understands industry-specific language and norms.
- It provides natural-language explanations that actually make sense.

**Setup:**
```bash
export OPENAI_API_KEY="sk-..."
# or
export ANTHROPIC_API_KEY="sk-ant-..."
```

### 📐 Heuristic Mode (Free, no API key)

**How it works:**
When no API key is found, the tool runs purely rule-based scoring. It scans the lead text for keyword signals:

```python
# Budget signals (add points)
if any(w in text for w in ["budget", "$", "invest"]):
    score += 10

# Budget penalties
if any(w in text for w in ["low budget", "free", "cheap"]):
    score -= 15

# Timeline signals
if any(w in text for w in ["urgent", "asap"]):
    score += 10

# Decision maker signals
if any(w in text for w in ["ceo", "founder", "owner"]):
    score += 10
```

**Strengths:**
- Always works, costs nothing
- Fast (no API round-trip)
- Good enough for rough triage

**Weaknesses:**
- No contextual judgment
- Can't understand negation ("definitely NOT a tight budget" would still trigger "tight budget" detection)
- All dimensions scored somewhat independently; can't understand compound signals
- Explanations are generic ("Timeline assessed from context")

**Fallback chain:** OpenAI → Anthropic → Heuristic (automatic, based on what's available)

---

## 4. Example Workflow: Input → Output

### Input (CLI)
```bash
python leadqualify.py \
  --text "Sarah Chen | sarah@techflow.io | TechFlow | We need a complete website redesign, budget $12-15k, launching our Series A in April. I'm the CEO." \
  --services "web design and development for B2B SaaS companies"
```

### What Happens Internally

1. **Parse:** The text is split by `|` into structured fields
2. **Prompt Build:** A structured prompt is assembled:
   ```
   You are a senior business development consultant...
   Their Services: web design and development for B2B SaaS companies
   Evaluate: Sarah Chen | sarah@techflow.io | TechFlow | We need a complete website redesign, budget $12-15k, launching our Series A in April. I'm the CEO.
   ```
3. **Scoring (AI mode):** GPT-4 reads the full context, applies judgment, returns:
   ```json
   {
     "budget_score": 23,
     "budget_reason": "Clear $12-15k budget aligns well with B2B SaaS web design pricing",
     "timeline_score": 20,
     "timeline_reason": "Series A launch in April provides clear, urgent timeline",
     "messaging_score": 22,
     "messaging_reason": "Website redesign need is a core service match",
     "decision_score": 24,
     "decision_reason": "CEO is the primary decision-maker for a significant investment",
     "total_score": 89,
     "tier": "HOT",
     "emoji": "🔥",
     "summary": "Highly qualified lead with clear budget, urgent timeline, and direct access to the decision-maker. Strong alignment with your B2B SaaS positioning.",
     "ideal_first_contact": "Reference their Series A milestone — acknowledge you're familiar with the pressure of a funded launch timeline and share a relevant B2B SaaS case study."
   }
   ```

### Output (Terminal)
```
============================================================
  🔥 HOT — Score: 89/100
============================================================

📊 Scoring Breakdown:
   Budget:        23/25 — Clear $12-15k budget aligns well with B2B SaaS web design pricing
   Timeline:      20/25 — Series A launch in April provides clear, urgent timeline
   Messaging Fit: 22/25 — Website redesign need is a core service match
   Decision Maker:24/25 — CEO is the primary decision-maker for a significant investment

💬 Summary:
   Highly qualified lead with clear budget, urgent timeline, and direct access to the decision-maker. Strong alignment with your B2B SaaS positioning.

📧 Ideal First Contact:
   Reference their Series A milestone — acknowledge you're familiar with the pressure of a funded launch timeline and share a relevant B2B SaaS case study.
```

---

## 5. Technical Architecture

### File Structure
```
leadqualify-ai/
├── leadqualify.py        # Main application (all logic in one file, ~530 lines)
├── requirements.txt      # Dependencies
├── README.md             # User-facing documentation
├── GUMROAD_SETUP.md      # Gumroad licensing/delivery instructions
├── sample_leads.csv      # Example CSV input
├── sample_results.json   # Example JSON output
└── sales-page.html       # Marketing/sales page
```

### Dependencies (`requirements.txt`)
```
openai          # OpenAI API client (optional)
anthropic       # Anthropic API client (optional)
gradio          # Web UI framework (optional, auto-installed)
```

**Python 3.9+ required.** No database, no backend server, no Docker. It's a standalone script.

### Architecture Diagram

```
                    ┌─────────────────────────────────────┐
                    │         leadqualify.py              │
                    │                                     │
┌──────────┐        │  ┌─────────────────────────────────┐│
│  You     │──────────▶│  Input Parser                   ││
│ (CLI/Web)│        │  │  • CSV (csv.DictReader)         ││
└──────────┘        │  │  • Text (pipe/newline split)    ││
                    │  │  • Gradio Web form              ││
                    │  └──────────┬──────────────────────┘│
                    │             │                       │
                    │             ▼                       │
                    │  ┌─────────────────────────────────┐│
                    │  │  score_lead() — Router          ││
                    │  │                                 ││
                    │  │  HAS_OPENAI?                   ││
                    │  │    → score_lead_openai()       ││
                    │  │  HAS_ANTHROPIC?                ││
                    │  │    → score_lead_anthropic()     ││
                    │  │  else:                          ││
                    │  │    → score_lead_heuristic()     ││
                    │  └──────────┬──────────────────────┘│
                    │             │                       │
                    │  ┌──────────▼──────────────────────┐│
                    │  │  Scoring Engine                 ││
                    │  │                                 ││
                    │  │  AI Mode:                       ││
                    │  │  ┌───────────────────────────┐  ││
                    │  │  │ build_lead_prompt()        │  ││
                    │  │  │   → LLM (GPT-4/Claude)     │  ││
                    │  │  │   → json.loads(response)   │  ││
                    │  │  └───────────────────────────┘  ││
                    │  │                                 ││
                    │  │  Heuristic Mode:                ││
                    │  │  ┌───────────────────────────┐  ││
                    │  │  │ keyword matching          │  ││
                    │  │  │ baseline=50, +/- signals   │  ││
                    │  │  └───────────────────────────┘  ││
                    │  └──────────┬──────────────────────┘│
                    │             │                       │
                    │             ▼                       │
                    │  ┌─────────────────────────────────┐│
                    │  │  Output Formatter               ││
                    │  │  • format_result() — CLI text  ││
                    │  │  • Gradio HTML cards            ││
                    │  │  • JSON (--output flag)         ││
                    │  └─────────────────────────────────┘│
                    └─────────────────────────────────────┘
```

### Key Functions

| Function | Purpose |
|---|---|
| `score_lead(lead_text, your_services)` | Main entry point. Routes to AI or heuristic. |
| `score_lead_openai()` | Calls GPT-4o via OpenAI SDK |
| `score_lead_anthropic()` | Calls Claude Sonnet via Anthropic SDK |
| `score_lead_heuristic()` | Rule-based scoring, no API needed |
| `build_lead_prompt()` | Constructs the system+user prompt sent to LLM |
| `parse_csv_input()` | Reads CSV, flattens rows to text strings |
| `parse_text_input()` | Splits pipe or newline-separated text into lead records |
| `format_result()` | Renders result dict as human-readable CLI output |
| `run_web()` | Launches the Gradio web UI |
| `run_cli()` | Runs the command-line interface |

### API Keys & Auth

```python
# Automatic detection — no code changes needed
HAS_OPENAI = bool(os.environ.get("OPENAI_API_KEY"))
HAS_ANTHROPIC = bool(os.environ.get("ANTHROPIC_API_KEY"))
```

The tool checks for keys at import time. Set them as environment variables and the tool picks them up automatically. Priority: OpenAI → Anthropic → Heuristic.

### Programmatic Usage

```python
from leadqualify import score_lead

result = score_lead(
    lead_text="John Smith | john@acme.com | Acme Corp | Needs a new website, budget $5-8k, wants to launch by Q2",
    your_services="web design, branding, and development for B2B SaaS companies"
)

print(result["tier"])              # "HOT"
print(result["total_score"])        # e.g. 85
print(result["ideal_first_contact"]) # "Send a portfolio of B2B SaaS redesigns..."
```

### Gradio Web UI Architecture

The web UI uses Gradio's `Blocks` API with two tabs:

1. **Paste Leads** — free-text input, pipe or newline separated
2. **Upload CSV** — file upload, processed server-side via temp file

Both paths call `process_leads_ui()` which loops over leads, scores each one, and renders results as HTML cards. The scoring is synchronous (no queue/worker), so the Gradio interface blocks during batch processing.

---

## Scoring Criteria Reference

```
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
```

---

## Tips for Best Results

1. **Be specific in your services description** — "web design for restaurants and hospitality" scores better than just "web design"
2. **Paste the full inquiry** — include context like "found you through a referral" or "read your case study on X"
3. **Run batches of 10-20** — the CSV upload is perfect for processing your full inbox
4. **Use HOT leads for immediate outreach** — the `ideal_first_contact` field gives you a personalized angle
5. **Set an API key** — heuristic mode is a decent fallback, but AI mode is meaningfully more accurate
