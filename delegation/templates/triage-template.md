# Triage Agent Delegation Template

## Request Format

```markdown
---
**Delegation Type:** Triage
**Task ID:** TRI-YYYYMMDD-###
**Priority:** [Critical/High/Medium/Low]
**Deadline:** [If applicable]
**Source:** [Where request came from]
---

### Request Summary
[1-2 sentence description of what needs triage]

### Raw Input
[The actual request, message, or task as received]

### Context
- **User/Requester:** [Who made the request]
- **Channel:** [Where it came from - Telegram, Discord, etc.]
- **Urgency Signals:** [Any indicators of urgency]
- **Previous Interactions:** [Relevant history]

### Classification Needs
- [ ] Categorize request type
- [ ] Assess urgency/priority
- [ ] Identify required capabilities
- [ ] Route to appropriate agent
- [ ] Flag any concerns

### Constraints
- **Time Limit:** [How long to spend on triage]
- **Information Gaps:** [What might be missing]
- **Special Considerations:** [Anything unusual]

### Success Criteria
- [ ] Request is correctly categorized
- [ ] Appropriate agent is identified
- [ ] Priority is accurately assessed
- [ ] Handoff is clear and actionable
```

## Response Format

```markdown
---
**Task ID:** [From request]
**Status:** [Completed/Needs Clarification/Escalated]
**Completed:** [Timestamp]
---

### Classification Results

**Request Type:** [Question/Task/Information/Decision/Other]
**Category:** [Technical/Creative/Administrative/Social/Other]
**Priority:** [Critical/High/Medium/Low]
**Urgency:** [Immediate/Today/This Week/Eventually]

### Routing Decision

**Assigned To:** [Agent Type - Planner/Implementer/Reviewer/Escalation]
**Rationale:** [Why this agent type]
**Confidence:** [High/Medium/Low]

### Required Capabilities
- [Capability 1]
- [Capability 2]
- [Capability 3]

### Context Summary
[Key information the assigned agent needs to know]

### Recommended Approach
[Brief suggestion for how to handle]

### Flags & Concerns
- [Any warnings, risks, or special considerations]

### Handoff Package
```
[Structured data for next agent - can be JSON or formatted text]
```

### Time Spent
[How long triage took]

### Notes
[Anything else worth recording]
```

## Example

### Request Example

```markdown
---
**Delegation Type:** Triage
**Task ID:** TRI-20260315-001
**Priority:** Medium
**Source:** Telegram direct message
---

### Request Summary
User wants help organizing their project files and creating a better folder structure.

### Raw Input
"hey can you help me organize all these project files? it's getting messy"

### Context
- **User/Requester:** Levin
- **Channel:** Telegram direct
- **Urgency Signals:** None explicit, but mentions "getting messy"
- **Previous Interactions:** None relevant

### Classification Needs
- [x] Categorize request type
- [x] Assess urgency/priority
- [x] Identify required capabilities
- [x] Route to appropriate agent
- [ ] Flag any concerns

### Constraints
- **Time Limit:** 5 minutes
- **Information Gaps:** Don't know which projects, how many files, current structure
- **Special Considerations:** User has specific organizational preferences

### Success Criteria
- [x] Request is correctly categorized
- [x] Appropriate agent is identified
- [x] Priority is accurately assessed
- [x] Handoff is clear and actionable
```

### Response Example

```markdown
---
**Task ID:** TRI-20260315-001
**Status:** Completed
**Completed:** 2026-03-15T22:35:00Z
---

### Classification Results

**Request Type:** Task
**Category:** Administrative
**Priority:** Medium
**Urgency:** This Week

### Routing Decision

**Assigned To:** Implementer
**Rationale:** Straightforward organizational task with clear execution path
**Confidence:** High

### Required Capabilities
- File system operations
- Organization best practices
- Understanding of user's project structure

### Context Summary
User (Levin) wants help organizing project files. Current state is "getting messy" but no specific urgency. Likely multiple projects involved based on workspace structure.

### Recommended Approach
1. Assess current file structure
2. Propose organization scheme
3. Get approval before moving files
4. Execute reorganization
5. Document new structure

### Flags & Concerns
- User may have specific preferences - confirm before making changes
- Use `trash` not `rm` for any deletions
- Some files may be actively in use - check git status

### Handoff Package
```json
{
  "task": "organize_project_files",
  "user": "Levin",
  "scope": "project files organization",
  "constraints": ["confirm before changes", "use trash not rm"],
  "context": "user mentioned files are getting messy",
  "approach": "assess -> propose -> approve -> execute -> document"
}
```

### Time Spent
3 minutes

### Notes
User seems relaxed about timeline - no need to rush. May be good opportunity to establish better ongoing organization practices.
```

## Triage Agent Guidelines

### Do
- Be quick but thorough
- Ask clarifying questions if needed
- Document your reasoning
- Flag anything unusual
- Provide clear handoff information

### Don't
- Spend too long on any single triage
- Make assumptions without noting them
- Route to wrong agent type
- Ignore red flags or concerns
- Leave handoff ambiguous

### Common Patterns

| Input Pattern | Likely Type | Route To |
|---------------|-------------|----------|
| "How do I..." | Question | Implementer (if simple) / Planner (if complex) |
| "Can you build..." | Task | Planner first, then Implementer |
| "What do you think..." | Opinion | Reviewer or Escalation |
| "Review this..." | Review | Reviewer |
| "URGENT..." | Priority | Triage then expedite |
| "Should I..." | Decision | Escalation (if high stakes) |

---

**Last Updated:** 2026-03-15
