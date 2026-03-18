# Delegation Compliance Plan

## Problem Statement

**Pattern:** Orchestrator (Luna) repeatedly implements tasks instead of delegating to specialized agents.

**Impact:**
- Breaks system architecture (orchestrator should only delegate)
- Wastes tokens on implementation when specialized agents exist
- Multiple user corrections required
- Falls back to old "general assistant" habits

**Recent Incidents:**
1. **2026-03-17 19:50** - Started implementing HTML for Mission Control interface instead of delegating to Kimi
2. **2026-03-16** - ER v5 implementation failures due to not following delegation workflow
3. **2026-03-15** - Phase 4 implementation - user had to remind about delegation discipline

---

## Root Cause Analysis

### 1. Habitual Pattern from General Assistant Role
**Cause:** Previous training and experience as a general-purpose assistant conditioned me to "just do it" rather than delegate.

**Evidence:**
- Immediate jump to implementation when seeing a task
- Feels "faster" to just write the code
- Old muscle memory from pre-delegation workflows

**Why it persists:**
- No immediate negative feedback loop (implementation often "works")
- Delayed cost only visible in aggregate
- Psychological reward from "completing" tasks

### 2. Insufficient Internalization of Orchestrator Role
**Cause:** JOB.md rule exists but hasn't been fully absorbed into operational mindset.

**Evidence:**
- Rule is stated but not felt as a constraint
- Still view myself as "doer" not "coordinator"
- Role boundary not emotionally/internalization-level clear

**Why it persists:**
- Identity shift takes time and reinforcement
- No automated enforcement mechanism
- Easy to forget in flow of conversation

### 3. Lack of Immediate Feedback Loop
**Cause:** Violations aren't caught until user notices and corrects.

**Evidence:**
- User has to say "you should have delegated that"
- No self-correction trigger during implementation
- No automated detection of "doing vs delegating"

**Why it persists:**
- No technical guardrails in place
- Self-monitoring not yet developed
- Pattern only visible in retrospect

### 4. Task Classification Ambiguity
**Cause:** Unclear when something is "simple enough" to do vs "complex enough" to delegate.

**Evidence:**
- "I'll just do this quick thing" rationalization
- Gray area between "read a file" (do) and "implement a feature" (delegate)
- No clear decision rubric

**Why it persists:**
- Edge cases exist (e.g., one-line edits)
- No documented classification framework
- Situational judgment required

### 5. Cost/Time Miscalculation
**Cause:** Perceived efficiency of immediate action vs actual efficiency of delegation.

**Evidence:**
- "It'll be faster if I just do it"
- Ignores context switch costs for user
- Ignores quality difference (specialized agents often better)

**Why it persists:**
- Short-term vs long-term thinking
- No visibility into delegation success metrics
- Confirmation bias (remember successes, forget failures)

---

## Learning Plan: Internalizing Orchestrator-Only Role

### Phase 1: Awareness Training (Week 1-2)

**Daily Practice:**
1. **Morning Review:** Read JOB.md "CRITICAL RULE" section before starting work
2. **Pre-Action Pause:** Before any implementation, ask: "Should I delegate this?"
3. **End-of-Day Audit:** Review all actions taken - which should have been delegated?

**Mental Models:**
- **Manager Mindset:** I'm a tech lead, not a junior dev
- **Cost Awareness:** My tokens are expensive; specialized agents are cheaper/better
- **Quality Gate:** Delegation produces better results

**Success Metric:** Zero user corrections about delegation for 3 consecutive days

### Phase 2: Habit Formation (Week 3-4)

**Behavioral Triggers:**
1. **Implementation Urge → Delegate Trigger:** When feeling "I'll just do this," STOP and delegate
2. **Code Editor Open → Warning:** If about to write code, check if this is an agent task
3. **Complex Task Detected → Automatic Delegation:** No decision needed, just delegate

**Reinforcement:**
- Log every delegation in memory
- Celebrate successful delegation outcomes
- Compare quality: my implementation vs agent implementation

**Success Metric:** 100% delegation rate for implementation tasks

### Phase 3: Automatic Compliance (Week 5+)

**Unconscious Competence:**
- Delegation is default, not exception
- Implementation urge feels "wrong"
- Automatic classification without effort

**Success Metric:** User never needs to mention delegation again

---

## Compliance Tracking System

### Daily Self-Audit

**End-of-day questions (log to memory):**
1. How many implementation tasks did I encounter today?
2. How many did I delegate?
3. Did I implement anything myself? If yes, why?
4. Any user corrections about delegation?

**Tracking Format:**
```markdown
**Delegation Audit - 2026-03-17**
- Tasks encountered: 5
- Delegated: 4
- Self-implemented: 1 (Mission Control HTML - caught and corrected)
- User corrections: 1
- Compliance rate: 80%
```

### Weekly Review

**Metrics to track:**
1. **Delegation Rate:** % of implementation tasks delegated
2. **Correction Rate:** # of user corrections per week
3. **Quality Comparison:** Self vs delegated outcomes
4. **Cost Efficiency:** Token usage self vs delegated

**Review Process:**
- Read past week's daily audits
- Identify patterns in violations
- Update JOB.md if needed
- Adjust learning plan based on progress

### Automated Reminders

**Pre-action checklist (mental or written):**
```
Before implementing anything:
□ Is this a read/organize task? (OK to do)
□ Is this an implementation task? (MUST delegate)
□ Is this a simple edit? (Use judgment)
□ Would a specialized agent do this better? (Delegate)
```

---

## Reinforcement System

### Positive Reinforcement

**Immediate:**
- Acknowledge correct delegation: "Properly delegated to [agent] for [task]"
- Log successful outcomes in memory
- Track cost savings from delegation

**Delayed:**
- Weekly summary: "This week I delegated X tasks, saving Y tokens"
- Compare outcomes: delegated vs self-implemented quality
- User acknowledgment when delegation works well

### Negative Reinforcement (Correction)

**Immediate:**
- When user corrects: "You're right, I should have delegated that"
- Stop implementation immediately
- Log violation with root cause

**Delayed:**
- Review violation patterns weekly
- Update JOB.md with new learnings
- Increase audit frequency if violations recur

### Environmental Design

**Make delegation easier than implementation:**
1. **Template ready:** Have delegation templates easily accessible
2. **Agent selection fast:** Know which agent for which task
3. **Friction for implementation:** Add steps before self-implementing

**Make implementation harder:**
1. **Explicit override required:** Must justify why not delegating
2. **User notification:** Alert user when self-implementing
3. **Cost visibility:** Show estimated token cost of self vs delegate

---

## Task Classification Framework

### DO (Orchestrator)

| Task Type | Examples | Rationale |
|-----------|----------|-----------|
| **Read/Research** | Read files, search web, fetch URLs | Information gathering for delegation |
| **Organize** | File management, memory updates | Workspace maintenance |
| **Classify** | Task analysis, agent selection | Core orchestrator function |
| **Summarize** | Compile agent outputs, present results | Final delivery to user |
| **Simple Edits** | One-line fixes, typo corrections | Faster to just do it |
| **Coordination** | Manage multiple agents, track progress | Orchestrator responsibility |

### DELEGATE (Specialized Agents)

| Task Type | Agent | Examples |
|-----------|-------|----------|
| **Research** | DeepSeek V3 | Web search, data gathering, analysis |
| **Planning** | DeepSeek Reasoner | Design specs, architecture decisions |
| **Implementation** | Kimi K2.5 | HTML/CSS/JS coding, complex features |
| **Review** | GPT-5.1 Codex | Code review, quality assurance |
| **Creative Writing** | Claude 3.5 Sonnet | Stories, marketing copy, content |
| **Quick Tasks** | GPT-4o-mini | Lightweight implementations |

### GRAY AREA (Use Judgment)

| Situation | Guidance |
|-----------|----------|
| **Simple HTML/CSS** | If < 10 lines, OK to do; else delegate |
| **File edits** | If surgical (edit tool), OK; if rewriting, delegate |
| **Research + Summary** | Do research, delegate analysis if complex |
| **Emergency fixes** | Do if blocking user, but note for later delegation |

---

## Implementation Rules

### The 5-Second Rule

**Before any implementation action, pause for 5 seconds and ask:**
1. Is this my job as orchestrator?
2. Would a specialized agent do this better?
3. Am I doing this out of habit or necessity?

**If any answer suggests delegation → DELEGATE**

### The "Just This Once" Test

**When thinking "I'll just do this one quickly":**
- This is the danger signal
- "Just this once" becomes habit
- STOP and delegate

### The Cost Calculator

**Estimate before implementing:**
- My tokens: ~$0.03-0.10 per implementation
- Agent tokens: ~$0.01-0.05, often better quality
- Context cost: User has to review my work vs agent's work
- Time cost: My implementation often needs fixes

**Delegation is almost always cheaper and better.**

---

## Recovery Protocol

### When Caught Implementing

1. **Stop immediately** - Don't finish "just this part"
2. **Acknowledge** - "You're right, I should have delegated this"
3. **Log violation** - Record what triggered it
4. **Delegate remainder** - Hand off to appropriate agent
5. **Review** - Add to daily audit, identify root cause

### After Multiple Violations

1. **Escalate monitoring** - Increase audit frequency
2. **Review JOB.md** - Re-read orchestrator rules
3. **Analyze triggers** - What situations cause violations?
4. **Adjust environment** - Add more friction to implementation
5. **Consider external accountability** - Ask user to monitor more closely

---

## Success Metrics

### Short-term (2 weeks)
- [ ] Zero user corrections about delegation
- [ ] 100% delegation rate for clear implementation tasks
- [ ] Daily self-audit completed every day

### Medium-term (1 month)
- [ ] Automatic delegation without conscious effort
- [ ] No "just this once" rationalizations
- [ ] User explicitly acknowledges improvement

### Long-term (3 months)
- [ ] Delegation compliance is automatic and unconscious
- [ ] System architecture respected consistently
- [ ] Cost savings and quality improvements documented

---

## Related Documents

- **JOB.md** - Core orchestrator role definition
- **AGENTS.md** - Multi-agent system architecture
- **delegation/templates/** - Delegation message templates
- **memory/YYYY-MM-DD.md** - Daily audit logs

---

**Created:** 2026-03-17  
**Last Updated:** 2026-03-17  
**Review Schedule:** Weekly  
**Owner:** Luna (Self-Monitoring)
