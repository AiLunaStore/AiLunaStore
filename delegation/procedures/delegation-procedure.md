# Delegation Procedure

## Purpose
Standard operating procedure for creating and managing task delegations.

## When to Delegate

### Delegate When:
- Task is clearly outside your primary role
- Another agent type is better suited
- Parallel processing would speed completion
- Specialized expertise is needed
- You need an independent review
- Stakes require escalation

### Don't Delegate When:
- Task is within your core responsibilities
- Context would be lost in handoff
- Time to delegate exceeds time to do
- You're avoiding accountability
- No clear recipient exists

## Delegation Process

### Step 1: Analyze the Request (2-5 minutes)

**Questions to Answer:**
1. What is the actual goal?
2. What type of work is required?
3. What are the constraints?
4. What could go wrong?
5. Who is best suited to handle this?

**Use the Decision Tree:**
```
Needs Triage? → Triage Agent
Needs Planning? → Planner Agent
Needs Review? → Reviewer Agent
High Stakes? → Escalation Agent
Otherwise → Implementer Agent
```

### Step 2: Prepare the Delegation (5-10 minutes)

**Select Template:**
- Copy appropriate template from `delegation/templates/`
- Fill in all header fields
- Generate Task ID: `[TYPE]-YYYYMMDD-###`

**Required Information:**
- Clear summary
- Complete context
- Specific requirements
- Success criteria
- Constraints and boundaries
- Timeline and priority

**Quality Check:**
- [ ] Would I understand this if I received it?
- [ ] Are success criteria measurable?
- [ ] Is the scope clear?
- [ ] Are constraints explicit?

### Step 3: Create Tracking Entry (1 minute)

**Add to Active Tasks:**
```bash
# Edit delegation/tracking/active-tasks.md
# Add entry at the top following the format
```

**Required Fields:**
- Task ID
- Type
- Status: Pending
- Owner: [Recipient agent]
- Delegated: [Current timestamp]
- Due: [Deadline]
- Priority

### Step 4: Execute Delegation (1 minute)

**Methods:**
- Subagent spawn for isolated tasks
- Direct message for quick handoffs
- Async delegation for non-urgent tasks

**Include:**
- Filled template
- Reference to tracking entry
- Offer to clarify if needed

### Step 5: Monitor Progress (ongoing)

**Check Status:**
- Review `active-tasks.md` regularly
- Update status as task progresses
- Note any blockers immediately

**Status Updates:**
- In Progress: Task started
- Blocked: Issue encountered
- Ready for Review: Completed, needs verification
- Ready for Handoff: Completed, pass to next agent

### Step 6: Complete and Archive (2 minutes)

**Upon Completion:**
1. Update tracking entry to "Completed"
2. Move entry from `active-tasks.md` to `completed-tasks.md`
3. Fill in completion details
4. Document lessons learned
5. Update metrics

## Delegation Quality Standards

### Good Delegation Checklist

**Clarity:**
- [ ] Goal is unambiguous
- [ ] Success criteria are specific
- [ ] Scope boundaries are clear
- [ ] Constraints are explicit

**Context:**
- [ ] Background is provided
- [ ] Stakeholders are identified
- [ ] Related work is referenced
- [ ] Why this matters is explained

**Support:**
- [ ] Resources are provided
- [ ] Access is granted
- [ ] Questions are welcomed
- [ ] Escalation path is clear

**Accountability:**
- [ ] Owner is clear
- [ ] Deadline is realistic
- [ ] Checkpoints are defined
- [ ] Review process is specified

## Common Delegation Patterns

### Pattern 1: Triage → Implement
**Use for:** Clear tasks that need quick routing
**Flow:**
1. Triage assesses and categorizes
2. Routes to Implementer
3. Implementer executes
4. Optional: Reviewer verifies

### Pattern 2: Planner → Implement → Review
**Use for:** Complex tasks requiring design
**Flow:**
1. Planner creates detailed plan
2. Implementer executes plan
3. Reviewer verifies quality
4. Deploy/complete

### Pattern 3: Triage → Escalation
**Use for:** Unclear or high-stakes situations
**Flow:**
1. Triage recognizes complexity/risk
2. Escalation analyzes options
3. Decision made
4. Appropriate agent executes

### Pattern 4: Implement → Review → Iterate
**Use for:** Quality-critical work
**Flow:**
1. Implementer creates deliverable
2. Reviewer provides feedback
3. Implementer addresses feedback
4. Repeat until approved

## Error Handling

### If Delegation is Rejected
1. **Understand why:** Ask for specific feedback
2. **Revise:** Address the issues
3. **Re-delegate:** Try again with improvements
4. **Escalate if needed:** If pattern continues

### If Task is Blocked
1. **Document blocker:** Update tracking entry
2. **Notify stakeholders:** Communicate delay
3. **Attempt resolution:** Address if within scope
4. **Escalate if needed:** If can't resolve

### If Task Fails
1. **Document failure:** What happened and why
2. **Analyze root cause:** Learn from failure
3. **Determine next steps:** Retry, replan, or abandon
4. **Update procedures:** Prevent recurrence

## Metrics to Track

### Delegation Effectiveness
- Success rate by agent type
- Average completion time
- Rework rate
- Handoff failures

### Quality Indicators
- Clarity scores (recipient feedback)
- First-time success rate
- Escalation frequency
- Blocker frequency

### Efficiency Metrics
- Time to delegate
- Time to complete
- Handoff count
- Parallel execution rate

---

**Last Updated:** 2026-03-15
**Review Cycle:** Monthly
