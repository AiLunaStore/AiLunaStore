# Escalation Agent Delegation Template

## Request Format

```markdown
---
**Delegation Type:** Escalation
**Task ID:** ESC-YYYYMMDD-###
**Priority:** [Critical/High]
**Deadline:** [When decision is needed]
**Source:** [Agent/Automated/System]
**Escalation Reason:** [Why this needs escalation]
---

### Decision Required
[What decision needs to be made]

### Context

#### Situation
[What's happening - the current state]

#### Background
[How we got here - relevant history]

#### Stakeholders
- **Decision Maker:** [Who has authority]
- **Impacted Parties:** [Who is affected]
- **Input Providers:** [Who has relevant info]

### Options Analysis

#### Option 1: [Name]
**Description:** [What this option entails]

**Pros:**
- [Advantage 1]
- [Advantage 2]

**Cons:**
- [Disadvantage 1]
- [Disadvantage 2]

**Risks:**
- [Risk 1]
- [Risk 2]

**Requirements:**
- [What would be needed]

---

#### Option 2: [Name]
[Same structure as Option 1]

---

#### Option N: [Name]
[Additional options as needed]

### Constraints
- **Hard Constraints:** [Non-negotiable limits]
- **Soft Constraints:** [Preferences, not requirements]
- **Time Pressure:** [Urgency factors]
- **Resource Limits:** [Budget, people, tools]
- **Policy/Legal:** [Regulatory constraints]

### Relevant Data
- **Metrics:** [Numbers that inform decision]
- **Precedents:** [Similar past decisions]
- **Expert Input:** [What specialists say]
- **User Feedback:** [What users want]

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Description] | [High/Med/Low] | [High/Med/Low] | [How to reduce] |

### Recommendation
[What the escalating agent recommends and why]

### Urgency Justification
[Why this can't wait for normal prioritization]

### Success Criteria
- [ ] Decision is made
- [ ] Rationale is documented
- [ ] Next steps are clear
- [ ] Stakeholders are informed
```

## Response Format

```markdown
---
**Task ID:** [From request]
**Status:** [Decided/Deferred/Delegated/Escalated Further]
**Completed:** [Timestamp]
**Decision Maker:** [Who made the call]
---

## Decision

### Decision Made
[Clear statement of what was decided]

### Selected Option
[Which option was chosen]

### Rationale
[Why this option was selected]

### Confidence Level
[High/Medium/Low - how sure we are]

## Decision Analysis

### Options Considered
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| [Option 1] | [Pros] | [Cons] | [Chosen/Rejected] |
| [Option 2] | [Pros] | [Cons] | [Chosen/Rejected] |

### Key Factors
[What mattered most in the decision]

### Trade-offs Accepted
[What we're giving up with this choice]

### Risks Accepted
| Risk | Accepted? | Mitigation Plan |
|------|-----------|-----------------|
| [Risk 1] | [Yes/No] | [How we'll handle] |

## Implementation

### Immediate Actions
- [ ] [Action 1 - who does what by when]
- [ ] [Action 2 - who does what by when]

### Communication Plan
- **Who to Inform:** [Stakeholders]
- **What to Communicate:** [Key messages]
- **When:** [Timeline]
- **How:** [Method]

### Rollback Plan
[If decision proves wrong, how do we undo]

## Monitoring & Review

### Success Metrics
- [How we'll know this was the right call]
- [What to measure]

### Review Trigger
[When to re-evaluate this decision]

### Checkpoint
[When to assess progress]

## Documentation

### Decision Log Entry
```
Date: [Date]
Decision: [What was decided]
Context: [Why it was needed]
Options: [What was considered]
Rationale: [Why this choice]
Decision Maker: [Who decided]
```

### Lessons Learned
- [What we learned from this]
- [What to remember for future]

## Follow-up Required

### Outstanding Questions
| Question | Who Can Answer | By When |
|----------|----------------|---------|
| [What we still need to know] | [Person] | [Date] |

### Dependencies
- [What this decision enables]
- [What this decision blocks]

### Next Decisions Anticipated
- [Future decisions this may lead to]

---

**Decision Notes:**
[Any additional context or considerations]
```

## Example

### Request Example

```markdown
---
**Delegation Type:** Escalation
**Task ID:** ESC-20260316-001
**Priority:** High
**Deadline:** 2026-03-16
**Source:** Implementer Agent (IMP-20260316-002)
**Escalation Reason:** Irreversible action with significant impact
---

### Decision Required
Should we delete the old file structure after migrating to the new organization system, or keep it as backup?

### Context

#### Situation
File organization Phase 1 is complete. All files have been moved to the new structure and verified. Old structure still exists in `workspace/old/`.

#### Background
User requested file organization due to messy workspace. New structure is working well. Old structure is taking up space but provides backup.

#### Stakeholders
- **Decision Maker:** Levin (user)
- **Impacted Parties:** Levin (file owner)
- **Input Providers:** Implementer Agent

### Options Analysis

#### Option 1: Delete Old Structure
**Description:** Remove `workspace/old/` after verification

**Pros:**
- Frees up disk space
- Eliminates confusion about which files are current
- Clean workspace

**Cons:**
- Irreversible (though files are in git)
- No immediate rollback option

**Risks:**
- Something might have been missed in migration
- User might want to reference old structure

**Requirements:**
- Complete verification that all files are migrated
- User confirmation

---

#### Option 2: Keep as Backup
**Description:** Retain `workspace/old/` for a period

**Pros:**
- Safety net if something was missed
- User can reference old locations
- Easy rollback

**Cons:**
- Uses disk space
- Might create confusion
- Delaying the inevitable

**Risks:**
- User might accidentally work in old location
- Clutter persists

**Requirements:**
- Clear labeling as "OLD - DO NOT USE"
- Timeline for eventual deletion

---

#### Option 3: Archive Compressed
**Description:** Compress old structure and store separately

**Pros:**
- Saves space vs keeping uncompressed
- Preserves backup
- Clear separation

**Cons:**
- Takes time to compress
- Still uses some space
- More complex

### Constraints
- **Hard Constraints:** Cannot lose data
- **Soft Constraints:** Prefer clean workspace
- **Time Pressure:** None immediate
- **Resource Limits:** Disk space is not critical

### Relevant Data
- **Metrics:** Old structure: 2.3GB, 1,247 files
- **Precedents:** Previous organization kept backup for 30 days
- **User Feedback:** User values safety over speed

### Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Missed file in migration | Low | High | Thorough verification |
| User wants old reference | Medium | Low | Can checkout from git |

### Recommendation
Option 2 (Keep as Backup) for 30 days, then delete. This balances safety with eventual cleanliness.

### Urgency Justification
Not urgent - can wait for user input. But decision needed to document next steps.

### Success Criteria
- [ ] Decision is made
- [ ] Rationale is documented
- [ ] Next steps are clear
- [ ] Stakeholders are informed
```

### Response Example

```markdown
---
**Task ID:** ESC-20260316-001
**Status:** Decided
**Completed:** 2026-03-16T12:00:00Z
**Decision Maker:** Levin (user input)
---

## Decision

### Decision Made
Keep old structure as backup for 30 days, clearly labeled as deprecated. Schedule deletion for 2026-04-15.

### Selected Option
Option 2 with timeline (modified)

### Rationale
User values data safety. 30 days provides adequate safety net while ensuring eventual cleanup. Git history provides additional safety layer.

### Confidence Level
High

## Decision Analysis

### Options Considered
| Option | Pros | Cons | Verdict |
|--------|------|------|---------|
| Delete immediately | Clean, saves space | Risky, irreversible | Rejected |
| Keep 30 days | Safe, clean eventually | Uses space temporarily | **Chosen** |
| Archive compressed | Saves space | Complex, unnecessary | Rejected |

### Key Factors
- Data safety is priority
- Disk space not critical
- Git provides additional backup

### Trade-offs Accepted
- Temporary disk space usage
- 30-day delay in full cleanup

### Risks Accepted
| Risk | Accepted? | Mitigation Plan |
|------|-----------|-----------------|
| User confusion | Yes | Clear labeling, reminder scheduled |

## Implementation

### Immediate Actions
- [ ] Label `workspace/old/` as "DEPRECATED - Delete after 2026-04-15"
- [ ] Add note to organization guide about backup
- [ ] Schedule deletion reminder

### Communication Plan
- **Who to Inform:** Levin
- **What to Communicate:** Backup retained for 30 days
- **When:** Now
- **How:** Summary message

### Rollback Plan
N/A - keeping files is the conservative choice

## Monitoring & Review

### Success Metrics
- No files needed from old location (indicates good migration)
- User doesn't report confusion

### Review Trigger
2026-04-15 - scheduled deletion review

### Checkpoint
2026-03-30 - mid-point check if space becomes issue

## Documentation

### Decision Log Entry
```
Date: 2026-03-16
Decision: Keep old file structure for 30 days
Context: Post-migration backup strategy
Options: Delete immediately, keep 30 days, archive
Rationale: Balance safety with cleanliness
Decision Maker: Levin (via Escalation Agent)
```

## Follow-up Required

### Outstanding Questions
None.

### Dependencies
- Enables: Full workspace cleanup in 30 days
- Blocks: None

### Next Decisions Anticipated
- Whether to proceed with deletion on 2026-04-15

---

**Decision Notes:**
User confirmed preference for safety over immediate cleanliness. 30-day period aligns with previous patterns.
```

## Escalation Agent Guidelines

### Do
- Present clear options
- Provide recommendation with rationale
- Include all relevant context
- Assess risks honestly
- Document the decision process

### Don't
- Escalate without analysis
- Hide your recommendation
- Omit important context
- Rush the decision
- Skip documentation

### When to Escalate

**Always Escalate:**
- Irreversible actions
- High-stakes decisions
- Ambiguous situations
- Policy violations
- Resource conflicts
- Safety concerns

**Consider Escalating:**
- Unclear requirements
- Multiple valid approaches
- Cross-team impact
- Unfamiliar domain

### Escalation Principles

1. **Analyze first:** Do the homework before escalating
2. **Present options:** Don't just dump the problem
3. **Make recommendation:** Have a point of view
4. **Document everything:** Decisions need records
5. **Follow through:** Implement the decision made

### Decision Quality Checklist

Before submitting escalation:
- [ ] I've analyzed all reasonable options
- [ ] I've identified key risks
- [ ] I've made a recommendation
- [ ] I've included all relevant context
- [ ] I've noted any time pressure
- [ ] I've considered stakeholders

---

**Last Updated:** 2026-03-15
