# Incident Response Guide

## Purpose

Step-by-step guide for handling incidents. ACTUALLY WORKS in practice.

## Severity Levels

| Level | Response Time | Who Handles |
|-------|---------------|-------------|
| **CRITICAL** | Immediate | Human + System |
| **HIGH** | < 1 hour | Human + System |
| **MEDIUM** | < 24 hours | System, notify human |
| **LOW** | < 7 days | System |
| **INFO** | Log only | System |

## Response Steps

### 1. Detection

**Automatic Detection:**
- Heartbeat system monitors every 30 min
- Health checks run hourly
- Error logs scanned continuously

**Manual Detection:**
- User reports issue
- System behaves unexpectedly
- External alert received

### 2. Classification

Use the error reporting script:
```bash
./accountability/errors/error-report.sh \
  --severity HIGH \
  --component "memory-system" \
  --message "Memory consolidation failed" \
  --details "Disk space at 95%"
```

### 3. Immediate Response

**CRITICAL (First 5 minutes):**
1. Stop harmful activity
2. Preserve system state
3. Create incident file
4. Alert human immediately
5. Begin containment

**HIGH (First 15 minutes):**
1. Assess scope and impact
2. Create incident file
3. Notify human
4. Begin diagnosis
5. Implement workaround if possible

**MEDIUM/LOW:**
1. Log error with context
2. Queue for resolution
3. Continue monitoring
4. Address during next maintenance window

### 4. Investigation

**Gather Information:**
```bash
# Check recent logs
tail -n 100 metrics/autonomy/heartbeat-$(date +%Y-%m-%d).log

# Check system status
./autonomy/checks/heartbeat-check.sh

# Review error log
tail -n 20 accountability/errors/error-log.jsonl
```

**Key Questions:**
- What changed recently?
- When did it start?
- What's the scope?
- Is there a workaround?

### 5. Resolution

**Short-term Fix:**
- Workaround to restore service
- Document what was done
- Monitor for recurrence

**Long-term Fix:**
- Address root cause
- Test thoroughly
- Deploy carefully
- Update procedures

### 6. Post-Incident

**Update Incident File:**
```markdown
## Resolution

**Resolved:** [TIMESTAMP]
**Fix:** [What was done]
**Root Cause:** [Why it happened]

## Lessons Learned

- [What worked]
- [What didn't work]
- [What to improve]
```

**Update Documentation:**
- Add to error patterns
- Update procedures if needed
- Share lessons learned

## Common Incidents

### Disk Space Full
```bash
# Check usage
df -h

# Find large files
find . -type f -size +100M

# Clean up
./autonomy/tasks/task-runner.sh --run daily-memory-cleanup
```

### Task Stuck
```bash
# Check active tasks
cat delegation/tracking/active-tasks.md

# Mark as failed if stuck
# (Manual update to task file)
```

### API Rate Limit
```bash
# Check recent API usage
# (Review metrics)

# Switch to fallback
# (If configured)

# Wait and retry
sleep 3600
```

### Memory System Error
```bash
# Check memory files
ls -la memory/

# Validate JSON
python3 -m json.tool memory/heartbeat-state.json

# Restore from backup if needed
```

## Incident Files

Location: `accountability/errors/incidents/`

Format: `ERR-YYYYMMDD-HHMMSS-XXXX.md`

Each file contains:
- Summary
- Timeline
- Response actions
- Resolution
- Lessons learned

## Escalation

**When to escalate:**
- CRITICAL severity
- Can't resolve within SLA
- Security concern
- Data loss

**How to escalate:**
1. Document current state
2. Summarize actions taken
3. Explain what's needed
4. Provide incident file path

## Prevention

**Proactive Measures:**
- Regular health checks
- Resource monitoring
- Automated cleanup
- Backup verification

**Monitoring:**
- Heartbeat every 30 min
- Health check hourly
- Error log review daily
- Metrics review weekly
