# Delegation System

## Purpose
Standardized templates and procedures for delegating tasks between agents with clear accountability, tracking, and error handling.

## Overview

The delegation system enables efficient task distribution across agent types while maintaining accountability and quality. Each agent type has specialized capabilities and responsibilities.

## Agent Types

| Agent Type | Role | Best For |
|------------|------|----------|
| **Triage** | Initial assessment | Classifying requests, routing, quick decisions |
| **Planner** | Strategy & design | Complex planning, architecture, coordination |
| **Implementer** | Execution | Building, coding, creating, executing plans |
| **Reviewer** | Quality assurance | Code review, analysis, verification, feedback |
| **Escalation** | Complex decisions | High-stakes choices, ambiguous situations |

## Quick Reference

### Delegation Decision Tree

```
Incoming Request
       │
       ▼
┌─────────────────┐
│  Needs Triage?  │────────Yes──────► Triage Agent
│ (unclear scope) │
└─────────────────┘
       │ No
       ▼
┌─────────────────┐
│  Needs Planning?│────────Yes──────► Planner Agent
│ (complex, multi-│
│  step, unclear  │
│  approach)      │
└─────────────────┘
       │ No
       ▼
┌─────────────────┐
│  Needs Review?  │────────Yes──────► Reviewer Agent
│ (verify, check, │
│  analyze)       │
└─────────────────┘
       │ No
       ▼
┌─────────────────┐
│  High Stakes?   │────────Yes──────► Escalation Agent
│ (irreversible,  │
│  ambiguous,     │
│  risky)         │
└─────────────────┘
       │ No
       ▼
   Implementer Agent (default)
```

## Directory Structure

```
delegation/
├── README.md                 # This file
├── templates/               # Request/response templates
│   ├── triage-template.md
│   ├── planner-template.md
│   ├── implementer-template.md
│   ├── reviewer-template.md
│   └── escalation-template.md
├── tracking/               # Task tracking and accountability
│   ├── active-tasks.md
│   └── completed-tasks.md
└── procedures/             # Standard operating procedures
    ├── delegation-procedure.md
    ├── handoff-procedure.md
    └── error-handling.md
```

## Usage

### Creating a Delegation

1. Identify the appropriate agent type using the decision tree
2. Use the corresponding template from `templates/`
3. Fill in all required fields
4. Create tracking entry in `tracking/active-tasks.md`
5. Execute delegation
6. Update tracking upon completion

### Receiving a Delegation

1. Read the delegation template completely
2. Acknowledge receipt (update status)
3. Execute the task
4. Respond using the response format
5. Update tracking to completed

### Accountability Principles

- **Clear Ownership:** Every task has exactly one owner at any time
- **Explicit Handoffs:** Transitions are documented and acknowledged
- **Status Visibility:** Task state is always known and recorded
- **Completion Criteria:** Success is defined before execution begins
- **Error Recovery:** Failures have defined fallback procedures

## Integration with Phase 1

The delegation system builds on the three-layer memory system:
- **Episodic:** Delegation requests/responses logged in daily memory
- **Semantic:** Agent capabilities and patterns stored in knowledge/
- **Procedural:** Delegation procedures documented in skills/

## Best Practices

1. **Be Specific:** Vague delegations lead to poor results
2. **Provide Context:** Include relevant background information
3. **Define Success:** Clear completion criteria prevent misalignment
4. **Set Boundaries:** Explicitly state what's in/out of scope
5. **Plan for Failure:** Know what to do if the primary approach fails

## Metrics

Track delegation effectiveness:
- Success rate by agent type
- Average completion time
- Handoff frequency
- Error/rework rate
- Satisfaction scores

See `metrics/delegation-metrics.md` for detailed tracking.

---

**Last Updated:** 2026-03-15
**Phase:** 2 - Identity & Tools Enhancement
