# Planner Agent Delegation Template

## Request Format

```markdown
---
**Delegation Type:** Planner
**Task ID:** PLN-YYYYMMDD-###
**Priority:** [Critical/High/Medium/Low]
**Deadline:** [When plan is needed]
**Source:** [Triage/Direct Request/Escalation]
**Parent Task:** [If part of larger effort]
---

### Request Summary
[What needs to be planned - the end goal]

### Context
- **Background:** [How did we get here]
- **Current State:** [Where things stand now]
- **Desired Outcome:** [What success looks like]
- **Constraints:** [Time, resources, technical, etc.]
- **Stakeholders:** [Who cares about this]

### Planning Scope
- **In Scope:** [What to include in plan]
- **Out of Scope:** [What to explicitly exclude]
- **Assumptions:** [What we're taking as given]
- **Dependencies:** [What this depends on]
- **Dependents:** [What depends on this]

### Requirements

#### Functional Requirements
- [What the solution must do]
- [Specific capabilities needed]
- [User interactions]

#### Non-Functional Requirements
- [Performance requirements]
- [Security requirements]
- [Scalability needs]
- [Maintainability standards]

### Constraints & Considerations
- **Technical Constraints:** [Tech stack, platform limitations]
- **Resource Constraints:** [Time, budget, people]
- **Business Constraints:** [Policies, compliance]
- **User Constraints:** [Accessibility, skill level]

### Planning Deliverables
- [ ] Architecture/design document
- [ ] Implementation plan with phases
- [ ] Resource requirements
- [ ] Risk assessment
- [ ] Timeline/milestones
- [ ] Success criteria

### Decision Points
[What decisions need to be made during planning]

### Reference Materials
- [Links to relevant docs, code, designs]
- [Previous similar work]
- [External resources]

### Success Criteria
- [ ] Plan is comprehensive and actionable
- [ ] All requirements are addressed
- [ ] Risks are identified with mitigations
- [ ] Timeline is realistic
- [ ] Implementation can proceed without major replanning
```

## Response Format

```markdown
---
**Task ID:** [From request]
**Status:** [Completed/Needs Input/Blocked/Escalated]
**Completed:** [Timestamp]
**Plan Version:** [1.0, 1.1, etc.]
---

## Executive Summary
[2-3 paragraph overview of the plan]

## Goals & Objectives

### Primary Goal
[The main thing we're achieving]

### Success Criteria
- [Measurable criterion 1]
- [Measurable criterion 2]
- [Measurable criterion 3]

## Architecture/Design

### Overview
[High-level approach]

### Components
| Component | Purpose | Technology | Notes |
|-----------|---------|------------|-------|
| [Name] | [What it does] | [Stack] | [Considerations] |

### Data Flow
[Description or diagram of how data moves]

### Integration Points
- [External systems to connect]
- [APIs to use]
- [Data formats]

## Implementation Plan

### Phase 1: [Name]
**Duration:** [Time estimate]
**Goal:** [What this phase achieves]

#### Tasks
- [ ] [Task 1 with acceptance criteria]
- [ ] [Task 2 with acceptance criteria]
- [ ] [Task 3 with acceptance criteria]

#### Deliverables
- [What Phase 1 produces]

#### Dependencies
- [What must be ready first]

---

### Phase 2: [Name]
**Duration:** [Time estimate]
**Goal:** [What this phase achieves]

[Same structure as Phase 1]

---

### Phase N: [Name]
[Continue for all phases]

## Resource Requirements

### Personnel
| Role | Time Needed | Skills Required |
|------|-------------|-----------------|
| [Role] | [Hours/Days] | [Skills] |

### Tools & Infrastructure
- [Tools needed]
- [Infrastructure requirements]
- [Third-party services]

### Budget
[If applicable]

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| [Description] | [High/Med/Low] | [High/Med/Low] | [Strategy] | [Who watches] |

## Timeline

### Milestones
| Milestone | Target Date | Dependencies | Success Criteria |
|-----------|-------------|--------------|------------------|
| [Name] | [Date] | [What first] | [How we know] |

### Gantt/Schedule
[Visual timeline or list]

## Decision Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| [What was decided] | [Alternatives] | [Selection] | [Why] |

## Open Questions

| Question | Blocking? | Who Can Answer | Target Date |
|----------|-----------|----------------|-------------|
| [What we need to know] | [Yes/No] | [Person/Role] | [When] |

## Handoff to Implementation

### Ready to Start
- [x] Architecture approved
- [x] Requirements finalized
- [x] Resources available
- [ ] [Any blockers resolved]

### Implementation Package
```
[Structured data for implementer]
```

### First Phase Ready
- [x] Phase 1 tasks defined
- [x] Acceptance criteria clear
- [x] Dependencies met

## Review & Validation

### Self-Review Checklist
- [ ] Plan addresses all requirements
- [ ] Timeline is realistic
- [ ] Risks have mitigations
- [ ] Resources are available
- [ ] Success criteria are measurable

### Peer Review Needed?
[Yes/No - if yes, what to review]

### Approval Required From
- [ ] [Stakeholder 1]
- [ ] [Stakeholder 2]

## Appendices

### A. Detailed Technical Specifications
[If needed]

### B. Research & Analysis
[Supporting research]

### C. Reference Materials
[Links and resources]

---

**Planning Time:** [How long planning took]
**Next Steps:** [What happens now]
**Plan Owner:** [Who maintains this plan]
```

## Example

### Request Example

```markdown
---
**Delegation Type:** Planner
**Task ID:** PLN-20260315-001
**Priority:** High
**Deadline:** 2026-03-16
**Source:** Triage (TRI-20260315-001)
---

### Request Summary
Plan the implementation of a file organization system for workspace with automated categorization and search.

### Context
- **Background:** User mentioned files are getting messy across multiple projects
- **Current State:** Flat structure, inconsistent naming, no search capability
- **Desired Outcome:** Organized, searchable file system with clear conventions
- **Constraints:** Must work with existing git repos, preserve history
- **Stakeholders:** Levin (primary user)

### Planning Scope
- **In Scope:** Folder structure, naming conventions, automation scripts, documentation
- **Out of Scope:** Cloud storage migration, external sharing features
- **Assumptions:** User will maintain system once established
- **Dependencies:** None
- **Dependents:** Future file organization tasks

### Requirements

#### Functional Requirements
- Categorize files by project and type
- Automated organization scripts
- Search capability
- Clear naming conventions

#### Non-Functional Requirements
- Preserve git history
- Work on macOS
- Easy to maintain
- Documented conventions

### Constraints & Considerations
- **Technical Constraints:** Must use existing tools (no new software to install)
- **Resource Constraints:** Implementation time < 1 day
- **User Constraints:** User should understand the system

### Planning Deliverables
- [x] Architecture/design document
- [x] Implementation plan with phases
- [x] Resource requirements
- [x] Risk assessment
- [x] Timeline/milestones
- [x] Success criteria

### Success Criteria
- [x] Plan is comprehensive and actionable
- [x] All requirements are addressed
- [x] Risks are identified with mitigations
- [x] Timeline is realistic
- [x] Implementation can proceed without major replanning
```

### Response Example

```markdown
---
**Task ID:** PLN-20260315-001
**Status:** Completed
**Completed:** 2026-03-15T23:00:00Z
**Plan Version:** 1.0
---

## Executive Summary

This plan outlines a three-phase approach to organizing Levin's workspace files. Phase 1 establishes the foundation with a clear folder structure and naming conventions. Phase 2 implements automation for ongoing organization. Phase 3 adds search capabilities. Total implementation time: 4-6 hours.

## Goals & Objectives

### Primary Goal
Create an organized, maintainable file system that makes finding and managing files effortless.

### Success Criteria
- All files categorized and moved within 1 day
- User can find any file in < 30 seconds
- New files are automatically organized
- System requires < 5 min/week maintenance

## Architecture/Design

### Overview
Hierarchical folder structure with project-based organization at the top level, file-type organization within projects, and automated scripts for maintenance.

### Components
| Component | Purpose | Technology | Notes |
|-----------|---------|------------|-------|
| Folder Structure | Organization | Filesystem | 3-level hierarchy |
| Naming Conventions | Consistency | Standards | Documented rules |
| Organize Script | Automation | Bash/Python | Run manually or scheduled |
| Documentation | Reference | Markdown | Living document |

### Data Flow
```
New File → Detect → Categorize → Move → Index
```

## Implementation Plan

### Phase 1: Foundation (2-3 hours)
**Goal:** Establish folder structure and move existing files

#### Tasks
- [ ] Create folder structure (15 min)
- [ ] Document naming conventions (15 min)
- [ ] Inventory existing files (30 min)
- [ ] Move files to new structure (60 min)
- [ ] Update any hardcoded paths (30 min)

#### Deliverables
- Folder structure in place
- Naming conventions documented
- All files organized

---

### Phase 2: Automation (1-2 hours)
**Goal:** Create scripts for ongoing organization

[Additional phases...]

## Resource Requirements

### Personnel
| Role | Time Needed | Skills Required |
|------|-------------|-----------------|
| Implementer | 4-6 hours | Bash, Python, file organization |

### Tools & Infrastructure
- Existing shell environment
- Python 3.x
- No additional tools needed

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation | Owner |
|------|------------|--------|------------|-------|
| Breaking existing workflows | Medium | High | Test changes, use trash not rm | Implementer |
| User doesn't adopt system | Low | Medium | Document clearly, make it easy | Planner |

## Timeline

### Milestones
| Milestone | Target Date | Dependencies | Success Criteria |
|-----------|-------------|--------------|------------------|
| Foundation Complete | Day 1 | None | Files organized |
| Automation Complete | Day 2 | Phase 1 | Scripts working |

## Decision Log

| Decision | Options Considered | Chosen | Rationale |
|----------|-------------------|--------|-----------|
| Top-level organization | Date vs Project vs Type | Project | Matches mental model |

## Handoff to Implementation

### Ready to Start
- [x] Architecture approved
- [x] Requirements finalized
- [x] Resources available

### Implementation Package
```json
{
  "phases": [
    {
      "name": "Foundation",
      "duration": "2-3 hours",
      "tasks": [...]
    }
  ]
}
```

---

**Planning Time:** 45 minutes
**Next Steps:** Hand off to Implementer Agent
**Plan Owner:** Luna (Digital Team Member)
```

## Planner Agent Guidelines

### Do
- Think through edge cases
- Document your reasoning
- Make plans actionable
- Include risk mitigations
- Set realistic timelines

### Don't
- Plan in excessive detail
- Ignore constraints
- Make unstated assumptions
- Create unachievable timelines
- Skip risk assessment

### Planning Principles

1. **Start with the end:** Define success first
2. **Work backwards:** From goal to current state
3. **Think in phases:** Deliver value incrementally
4. **Plan for change:** Build in flexibility
5. **Document decisions:** Show your work

---

**Last Updated:** 2026-03-15
