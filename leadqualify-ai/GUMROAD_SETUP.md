# Gumroad Setup Guide — LeadQualify AI

## Step 1: Create Your Gumroad Product

1. Go to [gumroad.com](https://gumroad.com) and sign in (or create an account)
2. Click **"New Product"**
3. Fill in:
   - **Product name:** LeadQualify AI
   - **Description:** Paste from your sales page
   - **Price:** $29 (or $39 for extra support)
   - **Type:** Downloadable product

## Step 2: Upload Your Files

Upload these files as your product files:
- `leadqualify-ai.zip` — the complete package (ZIP it first)
- OR individual files:
  - `leadqualify.py`
  - `requirements.txt`
  - `README.md`
  - `sample_leads.csv`

**Tip:** Put everything in one folder, zip it, upload the zip. Customers get one-click download.

## Step 3: Write Your Product Description

```
LeadQualify AI — Stop chasing cold leads. Let AI do the sorting.

Instantly qualify any inbound lead with AI-powered scoring across:
✅ Budget Fit (are they serious about paying?)
✅ Timeline Fit (can they move when you need to?)
✅ Messaging Fit (does their need match your services?)
✅ Decision Maker (are you talking to the right person?)

Each lead gets a HOT 🔥 / WARM 🌡️ / COOL ❄️ / COLD 🧊 score plus a personalized first-contact strategy.

Works in two modes:
• Web UI — paste leads, get instant results (Gradio interface)
• CLI — pipe CSVs, process batches of 50+ leads at once

Works out of the box with built-in heuristic scoring. Add your own OpenAI or Anthropic API key for GPT-4/Claude-powered analysis.

Includes:
- leadqualify.py (main tool — works on Mac/Linux/Windows)
- requirements.txt
- README.md (full documentation)
- sample_leads.csv (example data)
```

## Step 4: Connect Your Sales Page

1. In Gumroad product settings, copy your **product link**
2. Update `sales-page.html` — find the `<form action="https://gumroad.com/l/YOUR_PRODUCT_ID">` and replace `YOUR_PRODUCT_ID`
3. Host the `sales-page.html` on:
   - **GitHub Pages** (free) — push to a repo, enable Pages
   - **Netlify** (free) — drag and drop
   - **Carrd.co** (~$19/yr) — point to your Gumroad link

## Step 5: Share Your Link

Your Gumroad link will look like: `gumroad.com/l/leadqualify-ai`

Share it:
- Twitter/X bio
- Freelancer communities (Indie Hackers, Hacker News, Reddit r/freelance)
- Your existing客户 newsletter
- LinkedIn posts

## Pricing Strategy

| Version | Price | What's Included |
|---|---|---|
| Base | $29 | Tool + docs + sample data |
| Bundle | $49 | + 50 bonus lead prompt templates |
| Bundle+ | $79 | + Setup call recording + custom scoring rules |

Start at $29, raise to $39 after 10 sales. Raise to $49 after 25 sales.

## What to Customize

The tool is MIT licensed — you're free to:
- Rebrand it with your own name
- Add your own scoring rules
- Integrate into your own product stack
- Use it for agency clients

---

**Questions?** Check the README.md in the product folder.
