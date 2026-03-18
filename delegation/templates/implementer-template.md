# Implementer Agent Delegation Template

## Request Format

```markdown
---
**Delegation Type:** Implementer
**Task ID:** IMP-YYYYMMDD-###
**Priority:** [Critical/High/Medium/Low]
**Deadline:** [When implementation must be complete]
**Source:** [Planner/Triage/Direct Request]
**Parent Plan:** [Link to plan if applicable]
---

### Request Summary
[What needs to be built/created/executed]

### Implementation Scope
- **Phase:** [If part of multi-phase plan]
- **Deliverables:** [What must be produced]
- **Acceptance Criteria:** [How we know it's done right]
- **Constraints:** [Technical, time, resource limits]

### Context & Background
- **Why this matters:** [Business/technical context]
- **Current State:** [Starting point]
- **Target State:** [What we're building toward]
- **User Impact:** [Who benefits and how]

### Technical Specifications
- **Technology Stack:** [Languages, frameworks, tools]
- **Architecture:** [High-level design]
- **Integration Points:** [What this connects to]
- **Data Requirements:** [Storage, formats, schemas]
- **Performance Requirements:** [Speed, capacity, etc.]

### Requirements Reference
- **Functional Requirements:** [Link or list]
- **Non-Functional Requirements:** [Link or list]
- **Design Mockups:** [If applicable]
- **API Specifications:** [If applicable]

### Resources Provided
- **Code Repository:** [Links]
- **Documentation:** [Links]
- **Sample Data:** [If needed]
- **Access/Credentials:** [If required]

### Testing Requirements
- **Test Cases:** [What to verify]
- **Test Data:** [What to use]
- **Environments:** [Where to test]
- **Sign-off Required:** [Who approves]

### Deployment/Handoff
- **Target Environment:** [Where it goes]
- **Deployment Method:** [How it gets there]
- **Rollback Plan:** [If something goes wrong]
- **Documentation Required:** [What to write]

### Success Criteria
- [ ] All deliverables completed
- [ ] Acceptance criteria met
- [ ] Tests passing
- [ ] Documentation complete
- [ ] Handoff successful
```

## Response Format

```markdown
---
**Task ID:** [From request]
**Status:** [Completed/Partial/Blocked/Failed]
**Completed:** [Timestamp]
**Duration:** [Time spent]
---

## Implementation Summary

### What Was Built
[Description of deliverables]

### Key Decisions Made
- [Decision 1 with rationale]
- [Decision 2 with rationale]

### Changes from Plan
| Planned | Actual | Reason |
|---------|--------|--------|
| [Original] | [What happened] | [Why] |

## Deliverables

### Code/Files Created
| File/Location | Purpose | Status |
|---------------|---------|--------|
| [Path] | [What it does] | [Complete/Partial] |

### Documentation Created
| Document | Location | Status |
|----------|----------|--------|
| [Name] | [Path] | [Complete/Partial] |

### Configuration Changes
| Change | Location | Applied? |
|--------|----------|----------|
| [What changed] | [Where] | [Yes/No] |

## Testing Results

### Test Cases Executed
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| [Description] | [Expected result] | [What happened] | [Pass/Fail] |

### Issues Found
| Issue | Severity | Resolution | Status |
|-------|----------|------------|--------|
| [Description] | [Critical/Major/Minor] | [How fixed] | [Open/Closed] |

### Performance Results
[If applicable - metrics, benchmarks]

## Quality Assurance

### Code Review
- [ ] Self-review completed
- [ ] Style guidelines followed
- [ ] No obvious bugs
- [ ] Error handling in place
- [ ] Logging implemented

### Security Check
- [ ] No secrets in code
- [ ] Input validation
- [ ] Output sanitization
- [ ] Access controls

### Documentation Review
- [ ] Code comments adequate
- [ ] User documentation complete
- [ ] API documentation updated
- [ ] README updated

## Deployment Status

### Deployment Steps
- [ ] [Step 1]
- [ ] [Step 2]
- [ ] [Step 3]

### Verification in Production
- [ ] Functionality works
- [ ] Performance acceptable
- [ ] No errors in logs
- [ ] Users can access

### Rollback Preparedness
- [ ] Rollback procedure documented
- [ ] Previous version available
- [ ] Data backup verified

## Handoff Information

### For Operations/Maintenance
- **Monitoring:** [What to watch]
- **Common Issues:** [Known problems]
- **Maintenance Tasks:** [Ongoing work]
- **Escalation Path:** [Who to call]

### For Users
- **What's New:** [User-facing changes]
- **How to Use:** [Instructions]
- **Known Limitations:** [Caveats]

### For Future Development
- **Technical Debt:** [What to clean up later]
- **Enhancement Ideas:** [Future improvements]
- **Refactoring Opportunities:** [Code improvements]

## Metrics

### Implementation Metrics
- **Estimated Time:** [Original estimate]
- **Actual Time:** [Time spent]
- **Lines of Code:** [If applicable]
- **Files Modified:** [Count]
- **Tests Written:** [Count]

### Quality Metrics
- **Test Coverage:** [Percentage]
- **Bugs Found:** [Count]
- **Documentation Coverage:** [Percentage]

## Lessons Learned

### What Went Well
- [Success 1]
- [Success 2]

### What Could Be Better
- [Improvement 1]
- [Improvement 2]

### Recommendations for Future
- [Recommendation 1]
- [Recommendation 2]

## Sign-off

### Self-Assessment
- [ ] I believe this is complete and correct
- [ ] I've tested the implementation
- [ ] Documentation is adequate
- [ ] I'm proud of the work

### Review Required?
[Yes/No - if yes, from whom]

### Next Steps
- [ ] [What happens next]
- [ ] [Any follow-up tasks]

---

**Implementation Notes:**
[Anything else worth recording]
```

## Example

### Request Example

```markdown
---
**Delegation Type:** Implementer
**Task ID:** IMP-20260315-001
**Priority:** Medium
**Deadline:** 2026-03-16
**Source:** Planner (PLN-20260315-001 - Phase 1)
---

### Request Summary
Implement the foundation phase of file organization system: create folder structure, document naming conventions, and organize existing files.

### Implementation Scope
- **Phase:** Phase 1 - Foundation
- **Deliverables:** 
  - Folder structure created
  - Naming conventions documented
  - Existing files organized
- **Acceptance Criteria:**
  - All files have a clear home
  - User can find files easily
  - Naming conventions are clear
- **Constraints:** Use trash not rm, preserve git history

### Context & Background
- **Why this matters:** Workspace is getting messy, wasting time searching
- **Current State:** Flat structure, inconsistent naming
- **Target State:** Organized hierarchy with clear conventions

### Technical Specifications
- **Technology Stack:** Bash scripts, filesystem operations
- **Architecture:** 3-level hierarchy: Projects > Types > Files

### Resources Provided
- **Plan:** PLN-20260315-001
- **Sample Data:** Current workspace structure

### Success Criteria
- [ ] All deliverables completed
- [ ] Acceptance criteria met
- [ ] Documentation complete
```

### Response Example

```markdown
---
**Task ID:** IMP-20260315-001
**Status:** Completed
**Completed:** 2026-03-16T10:00:00Z
**Duration:** 2.5 hours
---

## Implementation Summary

### What Was Built
Created a comprehensive file organization system with hierarchical folder structure, documented naming conventions, and organized all existing files.

### Key Decisions Made
- Used project-based top level (matches user's mental model)
- Added 'archive' folder for old projects
- Created templates folder for reusable files

### Changes from Plan
| Planned | Actual | Reason |
|---------|--------|--------|
| 2-level hierarchy | 3-level hierarchy | Better organization |
| No archive | Added archive | Found old files |

## Deliverables

### Code/Files Created
| File/Location | Purpose | Status |
|---------------|---------|--------|
| `workspace/projects/` | Active projects | Complete |
| `workspace/archive/` | Old projects | Complete |
| `workspace/templates/` | Reusable templates | Complete |
| `docs/naming-conventions.md` | Documentation | Complete |

### Documentation Created
| Document | Location | Status |
|----------|----------|--------|
| Naming Conventions | `docs/naming-conventions.md` | Complete |
| Organization Guide | `docs/organization-guide.md` | Complete |

## Testing Results

### Test Cases Executed
| Test | Expected | Actual | Status |
|------|----------|--------|--------|
| Find any file | < 30 seconds | 15 seconds | Pass |
| Create new file in right place | Automatic | Works | Pass |

### Issues Found
| Issue | Severity | Resolution | Status |
|-------|----------|------------|--------|
| Some git repos had uncommitted changes | Minor | Committed before moving | Closed |

## Quality Assurance

### Code Review
- [x] Self-review completed
- [x] Style guidelines followed
- [x] No obvious bugs
- [x] Error handling in place

### Documentation Review
- [x] Code comments adequate
- [x] User documentation complete
- [x] README updated

## Handoff Information

### For Users
- **What's New:** Clear folder structure, documented conventions
- **How to Use:** See `docs/organization-guide.md`

### For Future Development
- **Technical Debt:** None identified
- **Enhancement Ideas:** Automation scripts for Phase 2

## Metrics

### Implementation Metrics
- **Estimated Time:** 2-3 hours
- **Actual Time:** 2.5 hours
- **Files Modified:** 150+
- **Documentation Pages:** 2

## Lessons Learned

### What Went Well
- User's mental model aligned with project-based organization
- Git history preserved successfully

### What Could Be Better
- Could have automated more of the file moving

## Sign-off

### Self-Assessment
- [x] I believe this is complete and correct
- [x] I've tested the implementation
- [x] Documentation is adequate

### Next Steps
- [ ] Get user feedback
- [ ] Proceed to Phase 2 if approved
```

## Implementer Agent Guidelines

### Do
- Follow the plan but adapt when needed
- Document changes from plan
- Test thoroughly
- Write clear documentation
- Handle errors gracefully

### Don't
- Skip testing to save time
- Leave "TODO" in production code
- Ignore edge cases
- Break existing functionality
- Deploy without verification

### Implementation Principles

1. **Understand first:** Read everything before starting
2. **Start small:** Verify approach with minimal change
3. **Test continuously:** Don't wait until the end
4. **Document as you go:** Don't leave it for later
5. **Leave it better:** Improve what you touch

### Quality Checklist

Before marking complete:
- [ ] Code works as specified
- [ ] Edge cases handled
- [ ] Error messages are helpful
- [ ] Documentation is accurate
- [ ] No secrets or sensitive data exposed
- [ ] Performance is acceptable
- [ ] Security considered

---

**Last Updated:** 2026-03-15
