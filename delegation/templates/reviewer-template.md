# Reviewer Agent Delegation Template

## Request Format

```markdown
---
**Delegation Type:** Reviewer
**Task ID:** REV-YYYYMMDD-###
**Priority:** [Critical/High/Medium/Low]
**Deadline:** [When review is needed]
**Source:** [Post-Implementation/Pre-Deployment/Quality Check]
**Subject:** [What's being reviewed]
---

### Review Scope
- **Type:** [Code/Document/Plan/Design/Decision]
- **Subject:** [What specifically to review]
- **Version:** [Version/date of item being reviewed]
- **Author:** [Who created it]
- **Context:** [Why it was created]

### Review Focus Areas
- [ ] Correctness - Does it work/achieve goals?
- [ ] Completeness - Is anything missing?
- [ ] Clarity - Is it understandable?
- [ ] Quality - Does it meet standards?
- [ ] Security - Are there vulnerabilities?
- [ ] Performance - Will it perform well?
- [ ] Maintainability - Can it be maintained?
- [ ] Consistency - Does it follow conventions?

### Review Criteria

#### Must Pass (Blockers)
- [Criterion 1 - will block approval if not met]
- [Criterion 2 - will block approval if not met]

#### Should Pass (Recommendations)
- [Criterion 3 - strongly recommended]
- [Criterion 4 - strongly recommended]

#### Nice to Have (Suggestions)
- [Criterion 5 - optional improvement]
- [Criterion 6 - optional improvement]

### Reference Materials
- **Requirements:** [Link to requirements]
- **Standards:** [Link to style guides, conventions]
- **Previous Work:** [Similar items for comparison]
- **Context Documents:** [Background reading]

### Review Constraints
- **Time Available:** [How long to spend]
- **Depth Expected:** [High-level/Detailed/Comprehensive]
- **Review Method:** [Async/Interactive/Pair review]

### Expected Output
- [ ] Findings summary
- [ ] Specific issues identified
- [ ] Recommendations
- [ ] Approval/Request changes decision
- [ ] Priority of changes

### Success Criteria
- [ ] All focus areas addressed
- [ ] Clear findings documented
- [ ] Actionable recommendations
- [ ] Decision made (approve/request changes)
```

## Response Format

```markdown
---
**Task ID:** [From request]
**Status:** [Approved/Approved with Comments/Changes Requested/Blocked]
**Completed:** [Timestamp]
**Review Duration:** [Time spent]
---

## Review Summary

### Overall Assessment
[High-level verdict and summary]

### Decision
**Status:** [Approved / Approved with Comments / Changes Requested / Blocked]

**Rationale:**
[Why this decision was made]

### Confidence Level
[High/Medium/Low - how sure are you of this assessment]

## Detailed Findings

### Critical Issues (Must Fix)
| # | Issue | Location | Impact | Suggested Fix |
|---|-------|----------|--------|---------------|
| 1 | [Description] | [Where] | [What could go wrong] | [How to fix] |

### Major Issues (Should Fix)
| # | Issue | Location | Impact | Suggested Fix |
|---|-------|----------|--------|---------------|
| 1 | [Description] | [Where] | [Impact] | [Suggestion] |

### Minor Issues (Nice to Fix)
| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 1 | [Description] | [Where] | [Suggestion] |

### Questions
| # | Question | Context | Priority |
|---|----------|---------|----------|
| 1 | [What you need to know] | [Why you're asking] | [Blocking/Curious] |

## Strengths

### What's Done Well
- [Strength 1]
- [Strength 2]
- [Strength 3]

### Positive Observations
- [Observation 1]
- [Observation 2]

## Focus Area Analysis

### Correctness
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Does it work/achieve goals?]

### Completeness
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Is anything missing?]

### Clarity
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Is it understandable?]

### Quality
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Does it meet standards?]

### Security
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Are there vulnerabilities?]

### Performance
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Will it perform well?]

### Maintainability
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Can it be maintained?]

### Consistency
**Assessment:** [Pass/Concern/Fail]
**Notes:** [Does it follow conventions?]

## Recommendations

### Immediate Actions (Before Merge/Deploy)
- [ ] [Action 1]
- [ ] [Action 2]

### Near-term Improvements (Next iteration)
- [ ] [Improvement 1]
- [ ] [Improvement 2]

### Future Considerations (Backlog)
- [ ] [Consideration 1]
- [ ] [Consideration 2]

## Comparison to Standards

### Against Requirements
| Requirement | Met? | Evidence |
|-------------|------|----------|
| [Req 1] | [Yes/No/Partial] | [Where/how] |

### Against Style Guide
| Standard | Followed? | Notes |
|----------|-----------|-------|
| [Standard 1] | [Yes/No] | [Notes] |

### Against Best Practices
| Practice | Applied? | Notes |
|----------|----------|-------|
| [Practice 1] | [Yes/No] | [Notes] |

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [Description] | [High/Med/Low] | [High/Med/Low] | [How to address] |

## Learning Opportunities

### For Author
- [What author can learn from this]
- [Resources to check out]

### For Team
- [Patterns to adopt/avoid]
- [Process improvements]

## Review Metadata

### Review Method
- [ ] Self-review checklist
- [ ] Manual inspection
- [ ] Automated tools
- [ ] Peer discussion
- [ ] Testing/verification

### Tools Used
- [Tool 1]
- [Tool 2]

### Time Breakdown
| Activity | Time |
|----------|------|
| Reading/Understanding | [Time] |
| Analysis | [Time] |
| Writing review | [Time] |
| **Total** | **[Time]** |

## Follow-up

### Re-review Required?
[Yes/No - if yes, what to focus on]

### Who Should Address
[Individual or team responsible]

### Timeline
[When fixes should be complete]

### Sign-off
- [ ] Review completed
- [ ] Findings documented
- [ ] Decision communicated
- [ ] Next steps clear

---

**Review Notes:**
[Any additional context or observations]
```

## Example

### Request Example

```markdown
---
**Delegation Type:** Reviewer
**Task ID:** REV-20260316-001
**Priority:** Medium
**Deadline:** 2026-03-16
**Source:** Post-Implementation
**Subject:** File organization system (IMP-20260315-001)
---

### Review Scope
- **Type:** Implementation
- **Subject:** File organization system Phase 1
- **Version:** 2026-03-16
- **Author:** Implementer Agent
- **Context:** Workspace organization project

### Review Focus Areas
- [x] Correctness - Does it work/achieve goals?
- [x] Completeness - Is anything missing?
- [x] Clarity - Is it understandable?
- [x] Quality - Does it meet standards?
- [ ] Security - Are there vulnerabilities?
- [ ] Performance - Will it perform well?
- [x] Maintainability - Can it be maintained?
- [x] Consistency - Does it follow conventions?

### Review Criteria

#### Must Pass (Blockers)
- Files can be found quickly
- Git history preserved
- No data loss

#### Should Pass (Recommendations)
- Documentation is clear
- Conventions are consistent

### Reference Materials
- **Plan:** PLN-20260315-001
- **Standards:** Workspace organization standards

### Success Criteria
- [ ] All focus areas addressed
- [ ] Clear findings documented
- [ ] Actionable recommendations
- [ ] Decision made
```

### Response Example

```markdown
---
**Task ID:** REV-20260316-001
**Status:** Approved with Comments
**Completed:** 2026-03-16T11:00:00Z
**Review Duration:** 30 minutes
---

## Review Summary

### Overall Assessment
Well-executed implementation that meets the core requirements. Folder structure is logical, documentation is clear, and files are properly organized. A few minor improvements suggested.

### Decision
**Status:** Approved with Comments

**Rationale:**
Implementation successfully achieves the goals set out in the plan. Minor documentation improvements recommended but not blocking.

### Confidence Level
High

## Detailed Findings

### Critical Issues (Must Fix)
None found.

### Major Issues (Should Fix)
None found.

### Minor Issues (Nice to Fix)
| # | Issue | Location | Suggestion |
|---|-------|----------|------------|
| 1 | Naming conventions doc could include examples | `docs/naming-conventions.md` | Add 3-5 concrete examples |
| 2 | No guidance on when to archive | `docs/organization-guide.md` | Add archive criteria |

### Questions
| # | Question | Context | Priority |
|---|----------|---------|----------|
| 1 | How often should organization be reviewed? | Maintenance | Curious |

## Strengths

### What's Done Well
- Clear 3-level hierarchy that matches user's mental model
- Comprehensive documentation
- Git history preserved correctly
- Good use of trash instead of rm

### Positive Observations
- Thoughtful addition of archive folder
- Templates folder is a nice touch for reusability

## Focus Area Analysis

### Correctness
**Assessment:** Pass
**Notes:** Files are organized correctly, can be found quickly

### Completeness
**Assessment:** Pass
**Notes:** All Phase 1 deliverables completed

### Clarity
**Assessment:** Pass
**Notes:** Documentation is clear and well-structured

### Quality
**Assessment:** Pass
**Notes:** Meets workspace standards

### Maintainability
**Assessment:** Pass
**Notes:** Structure is sustainable, conventions are documented

### Consistency
**Assessment:** Pass
**Notes:** Follows established patterns

## Recommendations

### Immediate Actions (Before Merge/Deploy)
None required.

### Near-term Improvements (Next iteration)
- [ ] Add examples to naming conventions doc
- [ ] Add archive criteria guidance

### Future Considerations (Backlog)
- [ ] Consider automation scripts (Phase 2)
- [ ] Periodic review schedule

## Risk Assessment

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| User doesn't read documentation | Medium | Low | Make conventions intuitive |

## Follow-up

### Re-review Required?
No - minor suggestions can be addressed in normal workflow.

### Who Should Address
Implementer or any agent

### Timeline
Suggestions are non-blocking; address when convenient.

### Sign-off
- [x] Review completed
- [x] Findings documented
- [x] Decision communicated
- [x] Next steps clear
```

## Reviewer Agent Guidelines

### Do
- Be thorough but efficient
- Focus on what matters
- Provide specific, actionable feedback
- Acknowledge what's done well
- Distinguish blockers from suggestions

### Don't
- Nitpick trivial issues
- Block without clear rationale
- Ignore the big picture
- Be vague about problems
- Skip sections of the review

### Review Principles

1. **Understand context first:** Know why this was created
2. **Check requirements:** Verify it meets the spec
3. **Look for blockers:** Critical issues first
4. **Consider the user:** Will this work for them?
5. **Suggest improvements:** Make it better if you can

### Review Checklist

Before submitting review:
- [ ] I've read all the context
- [ ] I've checked against requirements
- [ ] I've identified all blockers
- [ ] My feedback is specific
- [ ] I've noted strengths
- [ ] My decision is clear
- [ ] Next steps are documented

---

**Last Updated:** 2026-03-15
