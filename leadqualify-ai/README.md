# LeadQualify AI

> AI-powered lead qualification for freelancers and agencies. Stop wasting hours on cold leads — let AI instantly score and rank your prospects so you can focus on closing deals.

---

## 🎯 What It Does

LeadQualify AI analyzes your inbound leads and scores them 0–100 across four dimensions:

| Dimension | What It Measures |
|---|---|
| 💰 Budget Fit | Does their budget align with your pricing? |
| ⏱️ Timeline Fit | Is their timeline realistic and urgent? |
| 💬 Messaging Fit | Does their need match your services? |
| 👤 Decision Maker | Are they actually the decision-maker? |

Each lead gets tagged as **HOT 🔥**, **WARM 🌡️**, **COOL ❄️**, or **COLD 🧊** with a personalized outreach angle.

---

## ⚡ Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Set Your API Key (Recommended)

For AI-powered scoring, set your OpenAI API key:

```bash
export OPENAI_API_KEY="sk-..."
```

Or use Anthropic:

```bash
export ANTHROPIC_API_KEY="sk-ant-..."
```

> ⚠️ **Without an API key**, the tool uses heuristic (rule-based) scoring — still useful, but AI mode is far more accurate.

### 3. Run

**Web UI (Gradio):**
```bash
python leadqualify.py --web
```
Then open `http://localhost:7860`

**CLI — Paste leads directly:**
```bash
python leadqualify.py --text "John Smith | john@acme.com | Acme Corp | Needs a new website, budget $5-8k, wants to launch by Q2"
```

**CLI — From CSV:**
```bash
python leadqualify.py --csv leads.csv --services "web design and development"
```

**Save results to JSON:**
```bash
python leadqualify.py --text "..." --output results.json
```

---

## 📋 CSV Format

Your CSV should have columns like: `name`, `email`, `company`, `message`

Example:
```csv
name,email,company,message
John Smith,john@acme.com,Acme Corp,"Needs a new website, budget $5-8k, wants to launch by Q2"
Jane Doe,jane@startup.io,Startup.io,"Interested in brand identity, timeline is flexible, working with a small budget"
```

The tool is flexible — any column names work as long as there's enough text to analyze.

---

## 📊 Scoring Guide

| Score | Tier | Action |
|---|---|---|
| 80–100 | 🔥 HOT | Act immediately — send personalized outreach within 24h |
| 60–79 | 🌡️ WARM | Nurture with value — share relevant case studies, send sequence |
| 40–59 | ❄️ COOL | Low priority — auto-responder welcome sequence |
| 0–39 | 🧊 COLD | Not worth your time — batch monthly newsletter |

---

## 🏗️ How It Works

```
You paste/import leads
        ↓
LeadQualify AI analyzes each lead
  (GPT-4 / Claude + your service description)
        ↓
Scored output with:
  ✅ Tier + Score
  ✅ Per-dimension breakdown
  ✅ Personalized first-contact strategy
```

---

## 🔧 Programmatic Usage

```python
from leadqualify import score_lead

result = score_lead(
    lead_text="John Smith | john@acme.com | Needs a website redesign, budget $8k, wants to launch in 6 weeks",
    your_services="web design, branding, and development for B2B SaaS companies"
)

print(result["tier"])       # "HOT"
print(result["total_score"])# 85
print(result["ideal_first_contact"])  # "Send a portfolio of B2B SaaS redesigns..."
```

---

## ⚙️ Requirements

- Python 3.9+
- `openai` library + `OPENAI_API_KEY` env var (optional but recommended)
- OR `anthropic` library + `ANTHROPIC_API_KEY` env var (optional)
- `gradio` for the web UI (auto-installed via requirements.txt)

---

## 💡 Tips for Best Results

1. **Be specific in your services description** — "web design for restaurants and hospitality" scores better than just "web design"
2. **Paste the full inquiry** — include context like "found you through a referral" or "read your case study on X"
3. **Run batches of 10-20** — the CSV upload is perfect for processing your full inbox
4. **Use HOT leads for immediate outreach** — the ideal_first_contact field gives you a personalized angle

---

## 📄 License

MIT — use it, tweak it, sell it with your branding if you want.
