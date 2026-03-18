# Handoff Procedure

## Purpose
Standard procedure for transferring task ownership between agents to ensure continuity and accountability.

## Types of Handoffs

### 1. Sequential Handoff
**When:** Task moves from one phase to next (e.g., Plan → Implement)
**Characteristics:** Linear progression, clear completion criteria

### 2. Parallel Handoff
**When:** Task splits for concurrent work
**Characteristics:** Multiple agents work simultaneously, requires coordination

### 3. Escalation Handoff
**When:** Task moves to higher authority
**Characteristics:** Usually due to complexity, risk, or blockage

### 4. Return Handoff
**When:** Task comes back for revision or clarification
**Characteristics:** May include feedback, requires iteration

## Handoff Process

### Step 1: Prepare for Handoff (Outgoing Agent)

**Complete Your Work:**
- [ ] All deliverables finished
- [ ] Quality checks passed
- [ ] Documentation updated
- [ ] Tests passing (if applicable)

**Prepare Handoff Package:**
```markdown
## Handoff Package

### What Was Done
[Summary of work completed]

### Deliverables
| Item | Location | Status |
|------|----------|--------|
| [Name] | [Path] | [Complete] |

### Current State
[Where things stand]

### Known Issues
- [Any issues to be aware of]

### Next Steps
[What the receiving agent should do]

### Context & Notes
[Important background information]
```

**Update Tracking:**
- Change status to "Ready for Handoff"
- Add handoff timestamp
- Note receiving agent

### Step 2: Execute Handoff

**Formal Handoff:**
```markdown
---
**HANDOFF:** [Task ID]
**From:** [Outgoing Agent]
**To:** [Receiving Agent]
**Timestamp:** [When]
**Status:** [Complete/Partial/Blocked]
---

[Handoff Package]

**Questions?**
[Outgoing agent available for X minutes for clarification]
```

**Methods:**
- Direct message for simple handoffs
- Formal delegation template for complex handoffs
- Subagent spawn for isolated work

### Step 3: Accept Handoff (Receiving Agent)

**Acknowledge Receipt:**
```markdown
**HANDOFF ACCEPTED:** [Task ID]
**By:** [Receiving Agent]
**Timestamp:** [When]
**Questions:** [Any immediate questions]
```

**Review Package:**
- [ ] Read all documentation
- [ ] Access all deliverables
- [ ] Understand current state
- [ ] Clarify any questions

**Update Tracking:**
- Change status to "In Progress"
- Update owner to receiving agent
- Note handoff completion

### Step 4: Verify Continuity

**Outgoing Agent Verifies:**
- Receiving agent has all needed access
- No critical information lost
- Questions answered

**Receiving Agent Verifies:**
- Can continue work without blockers
- Understands context and goals
- Has clear next steps

## Handoff Quality Checklist

### Outgoing Agent
- [ ] Work is complete to handoff point
- [ ] Documentation is current
- [ ] Handoff package is comprehensive
- [ ] Known issues are documented
- [ ] Receiving agent briefed

### Handoff Package
- [ ] Clear summary of work done
- [ ] All deliverables listed with locations
- [ ] Current state explained
- [ ] Known issues identified
- [ ] Next steps specified
- [ ] Context provided

### Receiving Agent
- [ ] Package reviewed completely
- [ ] Access verified
- [ ] Questions asked and answered
- [ ] Ready to proceed
- [ ] Tracking updated

## Handoff Templates

### Template 1: Simple Handoff
```markdown
**Handoff:** [Task]
**Status:** [Complete/Partial]

**Done:**
- [What was completed]

**Location:**
[Where to find work]

**Next:**
[What to do next]

**Notes:**
[Anything else]
```

### Template 2: Complex Handoff
```markdown
## Handoff: [Task ID]

### Completion Status
[What phase/state is complete]

### Deliverables
[Detailed list with links/locations]

### Technical Details
[Architecture, design decisions, etc.]

### Open Items
[What's not done]

### Risks & Issues
[What to watch for]

### Next Phase Plan
[What comes next]

### Contacts
[Who to ask about what]
```

### Template 3: Emergency Handoff
```markdown
**URGENT HANDOFF:** [Task]
**Reason:** [Why urgent]

**Critical Info:**
[Must-know information]

**Status:**
[Where things stand]

**Immediate Action Needed:**
[What to do right now]

**Full Details:**
[Link to complete documentation]
```

## Common Handoff Scenarios

### Scenario 1: Plan to Implement
**Outgoing:** Planner
**Incoming:** Implementer
**Key Info:** Architecture, design decisions, constraints
**Package:** Implementation plan, design docs, requirements

### Scenario 2: Implement to Review
**Outgoing:** Implementer
**Incoming:** Reviewer
**Key Info:** What was built, how to test, known issues
**Package:** Code/files, test plan, documentation

### Scenario 3: Review to Implement (Rework)
**Outgoing:** Reviewer
**Incoming:** Implementer
**Key Info:** What needs to change, why, priority
**Package:** Review feedback, specific change requests

### Scenario 4: Triage to Escalation
**Outgoing:** Triage
**Incoming:** Escalation
**Key Info:** Why escalated, options considered, recommendation
**Package:** Triage analysis, context, urgency justification

## Handoff Failures & Recovery

### Failure: Information Lost
**Symptoms:** Receiving agent missing context
**Recovery:** Outgoing agent provides missing info
**Prevention:** Use comprehensive handoff package

### Failure: Access Denied
**Symptoms:** Receiving agent can't access resources
**Recovery:** Grant access or transfer ownership
**Prevention:** Verify access before handoff

### Failure: Misunderstood Requirements
**Symptoms:** Receiving agent proceeds incorrectly
**Recovery:** Clarify, possibly return to outgoing agent
**Prevention:** Explicit success criteria, questions encouraged

### Failure: Blocked Handoff
**Symptoms:** Can't complete handoff (incomplete work, etc.)
**Recovery:** Complete work or escalate
**Prevention:** Clear completion criteria

## Handoff Metrics

### Track:
- Handoff frequency by type
- Handoff success rate
- Time spent on handoffs
- Information loss incidents
- Rework after handoff

### Target:
- 95%+ successful handoffs
- < 5 min for simple handoffs
- < 15 min for complex handoffs
- Zero information loss

---

**Last Updated:** 2026-03-15
**Review Cycle:** Monthly
