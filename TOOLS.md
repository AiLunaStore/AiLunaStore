# TOOLS.md - Enhanced Tool Documentation

## Purpose
Comprehensive documentation of all available tools, their access patterns, usage logging, safety checks, and proficiency tracking.

---

## Table of Contents

1. [Tool Inventory](#tool-inventory)
2. [Tool Access Patterns](#tool-access-patterns)
3. [Usage Logging](#usage-logging)
4. [Safety & Approval Workflows](#safety--approval-workflows)
5. [Tool Proficiency Tracking](#tool-proficiency-tracking)
6. [API Keys & Authentication](#api-keys--authentication)
7. [System Architecture Notes](#system-architecture-notes)

---

## Tool Inventory

### Core OpenClaw Tools

| Tool | Purpose | Risk Level | Proficiency | Last Used |
|------|---------|------------|-------------|-----------|
| `read` | Read file contents | Low | Expert | Daily |
| `write` | Create/overwrite files | Medium | Expert | Daily |
| `edit` | Precise file edits | Medium | Expert | Daily |
| `exec` | Execute shell commands | High | Expert | Daily |
| `process` | Manage background processes | Medium | Competent | Weekly |
| `web_search` | Web search via Brave | Low | Expert | Daily |
| `web_fetch` | Fetch URL content | Low | Expert | Daily |
| `image` | Analyze images with vision | Low | Competent | Occasionally |
| `sessions_yield` | End turn for subagents | Low | Expert | As needed |

### Installed Skills (OpenClaw)

#### Technical Skills
| Skill | Purpose | Risk Level | Proficiency | Dependencies |
|-------|---------|------------|-------------|--------------|
| `coding-agent` | Delegate coding tasks | Medium | Proficient | `exec`, `process` |
| `github` | GitHub operations | Medium | Expert | `exec` |
| `node-connect` | Node connection diagnosis | Low | Competent | `exec` |
| `tmux` | Remote tmux control | Low | Competent | `exec` |
| `video-frames` | Video frame extraction | Low | Competent | `exec` |

#### Creative Skills
| Skill | Purpose | Risk Level | Proficiency | Dependencies |
|-------|---------|------------|-------------|--------------|
| `nano-pdf` | PDF editing | Low | Competent | `exec` |
| `things-mac` | Things 3 management | Low | Expert | `exec` |

#### Analytical Skills
| Skill | Purpose | Risk Level | Proficiency | Dependencies |
|-------|---------|------------|-------------|--------------|
| `healthcheck` | Security hardening | High | Competent | `exec` |
| `model-usage` | Cost usage analysis | Low | Proficient | `exec` |
| `weather` | Weather forecasts | Low | Expert | `exec` |

#### Social Skills
| Skill | Purpose | Risk Level | Proficiency | Dependencies |
|-------|---------|------------|-------------|--------------|
| `xurl` | X/Twitter API | **Critical** | Competent | `exec` |

#### Operational Skills
| Skill | Purpose | Risk Level | Proficiency | Dependencies |
|-------|---------|------------|-------------|--------------|
| `blucli` | BluOS control | Low | Competent | `exec` |
| `clawhub` | Skill management | Medium | Expert | `exec` |
| `eightctl` | Eight Sleep control | Low | Competent | `exec` |
| `gh-issues` | GitHub issue automation | Medium | Proficient | `exec`, `github` |
| `skill-creator` | Create/edit skills | Medium | Expert | `read`, `write`, `edit` |

### Custom Skills (Workspace)

| Skill | Purpose | Risk Level | Proficiency | Source |
|-------|---------|------------|-------------|--------|
| `tailwind-css` | Tailwind CSS utilities | Low | Proficient | Local |
| `deploy-to-vercel` | Vercel deployment | Medium | Proficient | Local |
| `vercel-composition-patterns` | React patterns | Low | Proficient | Local |
| `vercel-react-best-practices` | React optimization | Low | Proficient | Local |
| `vercel-react-native-skills` | React Native best practices | Low | Competent | Local |
| `web-design-guidelines` | UI compliance review | Low | Proficient | Local |

---

## Tool Access Patterns

### Read Operations (Low Risk)
**Tools:** `read`, `web_search`, `web_fetch`, `image`

**Access Pattern:**
- No approval required
- Log usage for analytics
- Safe to use freely

**Best Practices:**
- Use `read` with offset/limit for large files
- Cache web results when possible
- Respect robots.txt for web fetching

### Write Operations (Medium Risk)
**Tools:** `write`, `edit`

**Access Pattern:**
- No approval for workspace files
- Approval for system files
- Log all changes

**Best Practices:**
- Use `edit` for surgical changes
- Use `write` for new files
- Backup before major edits
- Verify changes after editing

### Execute Operations (High Risk)
**Tools:** `exec`, `process`

**Access Pattern:**
- Approval required for elevated permissions
- Approval required for destructive operations
- Log all commands
- Audit trail for security

**Safety Checks:**
```
Before exec with elevated permissions:
1. Is this necessary?
2. Is the command correct?
3. Are arguments safe?
4. Is the working directory correct?
5. What's the rollback plan?
```

**Best Practices:**
- Use `trash` instead of `rm`
- Quote variables properly
- Check return codes
- Use timeouts for long commands
- Prefer `edit` over `sed` when possible

### External API Operations (Critical Risk)
**Tools:** `xurl`, `github` (for writes)

**Access Pattern:**
- Always requires explicit approval
- Log all external communications
- Verify recipient before sending
- Confirm content before posting

**Pre-flight Checklist:**
- [ ] Recipient is correct
- [ ] Content is appropriate
- [ ] Tone matches context
- [ ] No sensitive information exposed
- [ ] User has authorized this action

---

## Usage Logging

### Log Format

```json
{
  "timestamp": "2026-03-15T22:31:00Z",
  "tool": "tool_name",
  "operation": "specific_operation",
  "context": "task_context",
  "duration_ms": 1234,
  "success": true,
  "risk_level": "Low|Medium|High|Critical",
  "approval_required": false,
  "approval_received": null,
  "parameters": {
    "key": "value"
  },
  "result_summary": "brief description",
  "errors": []
}
```

### Log Location
- **Current:** `metrics/tool-usage/YYYY-MM.json`
- **Archive:** `metrics/tool-usage/archive/`

### Log Analysis

**Daily Metrics:**
- Total tool invocations
- Success/failure rates
- Average duration by tool
- Risk distribution

**Weekly Metrics:**
- Tool proficiency trends
- Error patterns
- Approval frequency
- Usage optimization opportunities

**Monthly Metrics:**
- Tool adoption rates
- Skill development progress
- Safety incident review
- Workflow efficiency

### Automated Logging

All tool usage is automatically logged by OpenClaw runtime. Manual logging for:
- Complex multi-tool workflows
- Custom skill usage
- External API calls
- Error conditions

---

## Safety & Approval Workflows

### Risk Levels

| Level | Definition | Approval Required | Examples |
|-------|------------|-------------------|----------|
| **Low** | Read-only, internal, reversible | No | `read`, `web_search` |
| **Medium** | Write operations, internal | Contextual | `write`, `edit`, `exec` (safe) |
| **High** | System-level, external reads | Usually | `exec` (elevated), `healthcheck` |
| **Critical** | External writes, communications | Always | `xurl`, social media, email |

### Approval Workflows

#### Automatic (Low Risk)
```
Request → Execute → Log → Complete
```

#### Contextual (Medium Risk)
```
Request → Check Context → 
  [If safe] → Execute → Log → Complete
  [If uncertain] → Ask User → Execute → Log → Complete
```

#### Required (High/Critical Risk)
```
Request → Present to User → 
  [Approved] → Execute → Log → Complete
  [Denied] → Abort → Log → Notify
```

### Approval Request Format

```markdown
**APPROVAL REQUIRED**

**Action:** [What I want to do]
**Tool:** [Tool name]
**Risk Level:** [High/Critical]
**Impact:** [What could happen]

**Details:**
[Specific parameters, commands, etc.]

**Safety Checks:**
- [ ] I've verified this is necessary
- [ ] I've checked for safer alternatives
- [ ] I have a rollback plan

**Approve:** /approve allow-once
**Deny:** /approve deny
```

### Safety Checklists

#### Before Destructive Operations
- [ ] Is there a backup?
- [ ] Can this be undone?
- [ ] Is the scope limited?
- [ ] Have I double-checked the target?

#### Before External Communications
- [ ] Is the recipient correct?
- [ ] Is the content appropriate?
- [ ] Would Levin send this?
- [ ] Is the tone right?
- [ ] No sensitive data exposed?

#### Before System Changes
- [ ] Do I understand the change?
- [ ] Is this the minimal change needed?
- [ ] Can I test first?
- [ ] What's the rollback plan?

---

## Tool Proficiency Tracking

### Proficiency Levels

| Level | Description | Criteria |
|-------|-------------|----------|
| **Novice** | Basic understanding | Used < 5 times, needs guidance |
| **Competent** | Can use independently | Used 5-20 times, occasional reference |
| **Proficient** | Efficient usage | Used 20-50 times, knows best practices |
| **Expert** | Mastery | Used 50+ times, can teach others |
| **Master** | Innovation | Creates new patterns, optimizes usage |

### Current Proficiency Matrix

| Tool | Level | Uses | Trend | Next Milestone |
|------|-------|------|-------|----------------|
| `read` | Expert | 1000+ | Stable | Maintain |
| `write` | Expert | 500+ | Stable | Maintain |
| `edit` | Expert | 400+ | Stable | Maintain |
| `exec` | Expert | 300+ | Stable | Maintain |
| `web_search` | Expert | 200+ | Stable | Maintain |
| `web_fetch` | Expert | 150+ | Stable | Maintain |
| `image` | Competent | 15 | ↑ | Proficient at 20 uses |
| `process` | Competent | 25 | ↑ | Proficient at 30 uses |
| `coding-agent` | Proficient | 35 | ↑ | Expert at 50 uses |
| `github` | Expert | 80+ | Stable | Maintain |
| `healthcheck` | Competent | 8 | ↑ | Proficient at 15 uses |
| `xurl` | Competent | 10 | → | Proficient at 20 uses |
| `things-mac` | Expert | 60+ | Stable | Maintain |
| `skill-creator` | Expert | 40+ | Stable | Maintain |

### Proficiency Development Plan

#### Target: `image` → Proficient
- **Current:** 15 uses
- **Target:** 20 uses
- **Plan:** Use for all image analysis tasks
- **ETA:** 1 week

#### Target: `process` → Proficient
- **Current:** 25 uses
- **Target:** 30 uses
- **Plan:** Use for background task management
- **ETA:** 1 week

#### Target: `coding-agent` → Expert
- **Current:** 35 uses
- **Target:** 50 uses
- **Plan:** Delegate more complex coding tasks
- **ETA:** 2 weeks

#### Target: `healthcheck` → Proficient
- **Current:** 8 uses
- **Target:** 15 uses
- **Plan:** Weekly security checks
- **ETA:** 2 months

---

## API Keys & Authentication

### Provider Keys (Reference Only)

**Note:** Actual authentication handled through OpenClaw's auth system.

| Provider | Key Status | Last Verified | Notes |
|----------|------------|---------------|-------|
| OpenAI | Active | 2026-03-15 | Working |
| Kimi (Moonshot) | **Issue** | 2026-03-15 | Invalid auth error |
| DeepSeek | Active | 2026-03-15 | Working |
| Gemini | Active | 2026-03-15 | Working |
| OpenRouter | Active | 2026-03-15 | Working |

### Kimi API Issue
**Status:** Invalid Authentication error
**Actions:**
1. Verify key is still active
2. Check Moonshot account status
3. Update auth-profiles.json if needed

### Key Rotation Schedule
- **Frequency:** Every 90 days
- **Next Rotation:** 2026-06-15
- **Process:** Documented in `security/key-rotation.md`

---

## System Architecture Notes

### Hired AI Implementation Status

| Phase | Status | Completion |
|-------|--------|------------|
| **Phase 1** | ✅ Complete | Three-layer memory + JOB.md |
| **Phase 2** | ✅ Complete | Identity & Tools Enhancement |
| **Phase 3** | 📋 Planned | Autonomy & Accountability |
| **Phase 4** | 📋 Planned | Safety Rails & Integration |

### Available Models

| Model | Provider | Status | Best For |
|-------|----------|--------|----------|
| DeepSeek Chat | DeepSeek | ✅ Working | Implementation |
| GPT-5.1 Codex | OpenAI | ✅ Working | Coding, Review |
| GPT-5.4 | OpenAI | ✅ Working | Planning |
| GPT-5-nano | OpenAI | ✅ Working | Triage |
| Claude 3.5 Sonnet | OpenRouter | ✅ Working | Planning |
| Claude 3.5 Haiku | OpenRouter | ✅ Working | Quick tasks |
| GPT-4o-mini | OpenRouter | ✅ Working | Lightweight |

### Model Selection Guide

| Task Type | Primary | Fallback |
|-----------|---------|----------|
| Planning | Claude 3.5 Sonnet | GPT-5.4 |
| Implementation | DeepSeek Chat | GPT-5.1 Codex |
| Review | GPT-5.1 Codex | Claude 3.5 Sonnet |
| Triage | GPT-5-nano | GPT-4o-mini |
| Escalation | GPT-5.4 | Claude 3.5 Sonnet |

---

## Workspace Structure

```
/Users/levinolonan/.openclaw/workspace/
├── memory/              # Daily episodic memory
├── knowledge/           # Semantic memory
├── skills/              # Procedural memory
│   ├── technical/
│   ├── creative/
│   ├── analytical/
│   ├── social/
│   ├── operational/
│   └── development/     # Skill development (Phase 2)
├── delegation/          # Delegation system (Phase 2)
│   ├── templates/
│   ├── tracking/
│   └── procedures/
├── metrics/             # Performance tracking (Phase 2)
├── team/                # Team collaboration
└── [core files]         # AGENTS.md, JOB.md, etc.
```

---

## Quick Reference

### Tool Safety Quick-Check

| If you want to... | Use | Risk | Need Approval? |
|-------------------|-----|------|----------------|
| Read a file | `read` | Low | No |
| Create new file | `write` | Medium | No (workspace) |
| Edit existing file | `edit` | Medium | No (workspace) |
| Run safe command | `exec` | Medium | No |
| Run elevated command | `exec` + elevated | High | Yes |
| Search web | `web_search` | Low | No |
| Fetch URL | `web_fetch` | Low | No |
| Analyze image | `image` | Low | No |
| Post to X/Twitter | `xurl` | Critical | Always |
| Send message | Platform tool | Critical | Always |

### Emergency Contacts

| Issue | Contact | Method |
|-------|---------|--------|
| Security breach | Levin | Immediate notification |
| Data loss | Escalation Agent | Delegation |
| System failure | Technical skills | `healthcheck` |
| External API issues | Provider docs | `web_fetch` |

---

**Last Updated:** 2026-03-15
**Next Review:** Weekly
**Document Owner:** Luna (Digital Team Member)
