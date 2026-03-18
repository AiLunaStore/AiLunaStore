# Accountability System - Practical Implementation

## Quick Start

This is a WORKING accountability framework that actually helps humans understand and manage the Hired AI system.

## Core Components

### 1. Scope Management (`scope/`)
- **Purpose:** CLEAR, ACTIONABLE boundaries
- **Files:**
  - `SCOPE.md` - Main scope document (replaces old version)
  - `scope-quick-ref.md` - One-page reference
  - `scope-check.sh` - Script to validate actions against scope

### 2. Error Reporting (`errors/`)
- **Purpose:** Error reporting that ACTUALLY HELPS with incidents
- **Files:**
  - `error-report.sh` - Create error reports from command line
  - `error-log.jsonl` - Structured error log
  - `incident-response.md` - Step-by-step incident handling

### 3. Performance Reviews (`reviews/`)
- **Purpose:** MEASURABLE metrics and review framework
- **Files:**
  - `performance-metrics.json` - Current metrics
  - `review-template.md` - Quarterly review template
  - `metrics-dashboard.md` - Human-readable metrics summary

## How It Works

1. **Scope Check:** Before any action, system checks `SCOPE.md`
2. **Error Capture:** All errors logged to `error-log.jsonl` with context
3. **Metrics Tracking:** Key metrics tracked in `performance-metrics.json`
4. **Regular Reviews:** Weekly auto-generated, quarterly human-led

## Integration Points

- **Autonomy System:** Scope defines what each level can do
- **Safety System:** Errors trigger safety protocols
- **Memory System:** Reviews inform knowledge updates

## Usage

```bash
# Check if an action is in scope
./accountability/scope/scope-check.sh "write_file" "memory/test.md"

# Report an error
./accountability/errors/error-report.sh --severity HIGH --message "Disk full"

# View current metrics
cat accountability/reviews/metrics-dashboard.md
```

## Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `scope/SCOPE.md` | Main scope document | ✅ Working |
| `scope/scope-quick-ref.md` | Quick reference | ✅ Working |
| `scope/scope-check.sh` | Scope validator | ✅ Working |
| `errors/error-report.sh` | Error reporting | ✅ Working |
| `errors/incident-response.md` | Response guide | ✅ Working |
| `reviews/metrics-dashboard.md` | Metrics view | ✅ Working |

---

**Status:** Operational  
**Last Updated:** 2026-03-16  
**Version:** 3.1.0 (Practical Rebuild)
