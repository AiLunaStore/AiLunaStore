# Error Handling & Fallback Procedures

## Purpose
Standard procedures for handling failures, errors, and unexpected situations in delegated tasks.

## Error Classification

### By Severity

**Critical:**
- Data loss or corruption
- Security breach
- System outage
- Irreversible damage
- **Action:** Immediate escalation, stop all work

**Major:**
- Significant functionality broken
- Performance severely degraded
- Blocked progress
- **Action:** Escalate, assess recovery options

**Minor:**
- Non-critical feature not working
- Cosmetic issues
- Workaround available
- **Action:** Document, fix if within scope, continue

### By Type

**Technical Errors:**
- Code bugs
- System failures
- Integration issues
- Resource exhaustion

**Process Errors:**
- Miscommunication
- Scope creep
- Missed requirements
- Quality failures

**External Errors:**
- Dependency failures
- Third-party issues
- Access problems
- Environmental issues

## Error Response Process

### Step 1: Detect and Assess (1-5 minutes)

**Recognize the Error:**
- Unexpected behavior
- Failed tests
- Error messages
- User reports

**Classify:**
- Severity (Critical/Major/Minor)
- Type (Technical/Process/External)
- Impact scope
- Urgency

**Immediate Actions:**
- [ ] Stop work if critical
- [ ] Preserve state/logs
- [ ] Document what happened
- [ ] Notify if others affected

### Step 2: Contain (5-15 minutes)

**Prevent Spread:**
- Isolate affected components
- Prevent data corruption
- Block cascading failures
- Secure sensitive data

**Preserve Evidence:**
```markdown
## Error Record

**Timestamp:** [When]
**Task:** [Task ID]
**Agent:** [Who encountered]
**Error:** [What happened]
**Context:** [What was happening]
**Impact:** [What's affected]
**Evidence:** [Logs, screenshots, etc.]
```

### Step 3: Diagnose (15-30 minutes)

**Root Cause Analysis:**
1. **What happened?** (Observable symptoms)
2. **Why did it happen?** (Immediate cause)
3. **Why did that happen?** (Underlying cause)
4. **How do we prevent recurrence?** (Systemic fix)

**Questions to Ask:**
- Was this a known risk?
- Could this have been caught earlier?
- What assumptions were wrong?
- What information was missing?

### Step 4: Resolve or Escalate

**If Fixable in Scope:**
- Develop fix
- Test fix
- Deploy/apply fix
- Verify resolution
- Document solution

**If Requires Escalation:**
- Prepare escalation package
- Document attempted fixes
- Recommend options
- Escalate with full context

### Step 5: Recover and Resume

**Recovery Steps:**
- [ ] Verify system/task stability
- [ ] Restore from backup if needed
- [ ] Re-run affected processes
- [ ] Verify outputs

**Resumption:**
- [ ] Update tracking status
- [ ] Adjust timeline if needed
- [ ] Communicate status
- [ ] Resume work

### Step 6: Learn and Improve

**Post-Error Review:**
```markdown
## Post-Error Analysis

**Error:** [Description]
**Root Cause:** [Underlying cause]
**Impact:** [What was affected]
**Resolution:** [How fixed]
**Time to Resolve:** [Duration]

**Prevention:**
- [How to prevent recurrence]

**Detection:**
- [How to catch earlier next time]

**Process Improvements:**
- [Changes to procedures]

**Documentation Updates:**
- [What to document]
```

## Fallback Procedures

### Fallback 1: Retry
**When:** Transient failures, timeouts
**How:**
1. Wait brief period (exponential backoff)
2. Retry operation
3. Limit retries (max 3)
4. Escalate if persistent

### Fallback 2: Degrade Gracefully
**When:** Non-critical component failure
**How:**
1. Disable failing feature
2. Continue with reduced functionality
3. Notify user of limitation
4. Log for later fix

### Fallback 3: Alternative Approach
**When:** Primary approach blocked
**How:**
1. Identify alternative methods
2. Assess trade-offs
3. Select best alternative
4. Document why primary failed

### Fallback 4: Manual Intervention
**When:** Automation fails
**How:**
1. Document manual steps
2. Execute manually
3. Log what was done
4. Fix automation for next time

### Fallback 5: Escalate
**When:** Can't resolve within scope/authority
**How:**
1. Document everything tried
2. Prepare escalation package
3. Escalate with full context
4. Stand by for guidance

### Fallback 6: Abort and Rollback
**When:** Continuing is worse than stopping
**How:**
1. Stop all work
2. Preserve state
3. Rollback to last known good
4. Document what happened
5. Escalate for direction

## Common Error Patterns

### Pattern 1: Scope Creep
**Symptoms:** Task growing beyond original boundaries
**Response:** 
- Document new requirements
- Assess impact on timeline
- Escalate for prioritization
- Don't silently absorb

### Pattern 2: Requirements Misunderstanding
**Symptoms:** Building wrong thing
**Response:**
- Stop immediately
- Clarify requirements
- Assess rework needed
- Escalate if major impact

### Pattern 3: Technical Blocker
**Symptoms:** Can't proceed due to technical issue
**Response:**
- Document blocker
- Attempt workarounds
- Research solutions
- Escalate if stuck > 30 min

### Pattern 4: Resource Exhaustion
**Symptoms:** Out of time/tokens/compute
**Response:**
- Document current state
- Checkpoint progress
- Request more resources or
- Scope reduction

### Pattern 5: Dependency Failure
**Symptoms:** External system/person blocking
**Response:**
- Document dependency
- Attempt alternative
- Escalate dependency owner
- Consider workaround

## Error Prevention

### Design for Failure
- Assume components will fail
- Build in redundancy
- Use circuit breakers
- Implement graceful degradation

### Validate Early
- Check inputs immediately
- Verify assumptions
- Test early and often
- Fail fast on critical errors

### Monitor Continuously
- Watch for warning signs
- Log comprehensively
- Alert on anomalies
- Review regularly

### Document Assumptions
- State what you're assuming
- Verify assumptions
- Update when learned
- Share with team

## Error Communication

### To Stakeholders
**Template:**
```
**Issue Alert:** [Task ID]
**Severity:** [Critical/Major/Minor]
**Status:** [Investigating/Contained/Resolved]
**Impact:** [What's affected]
**ETA for Resolution:** [When expected]
**Workaround:** [If available]
```

### To Tracking System
- Update task status to "Blocked"
- Add error details
- Note escalation if applicable
- Update on resolution

### To Documentation
- Log in error tracking
- Update procedures if needed
- Add to lessons learned

## Recovery Checklist

### After Critical Error
- [ ] System stabilized
- [ ] Data integrity verified
- [ ] Root cause understood
- [ ] Fix implemented and tested
- [ ] Monitoring in place
- [ ] Stakeholders informed
- [ ] Documentation updated
- [ ] Process improvements identified

### After Major Error
- [ ] Issue resolved
- [ ] Work resumed
- [ ] Timeline adjusted
- [ ] Stakeholders updated
- [ ] Lessons documented

### After Minor Error
- [ ] Issue fixed
- [ ] Work continued
- [ ] Noted for future reference

---

**Last Updated:** 2026-03-15
**Review Cycle:** After each major error
