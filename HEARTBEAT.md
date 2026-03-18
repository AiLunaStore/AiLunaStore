# HEARTBEAT.md - Practical Proactive Monitoring

## What This Is

A WORKING heartbeat system that runs every 30 minutes to keep the Hired AI healthy and proactive.

## Quick Start

When you receive a heartbeat prompt:

1. **System reads this file** (for context)
2. **Runs** `autonomy/checks/heartbeat-check.sh`
3. **Updates** `autonomy/checks/heartbeat-state.json`
4. **Logs** to `metrics/autonomy/heartbeat-YYYY-MM-DD.log`

## What Gets Checked

| Check | Frequency | Action If Issue |
|-------|-----------|-----------------|
| Memory Consolidation | Daily | Mark files for archive |
| System Health | Hourly | Alert on high disk/memory |
| Task Status | 30 min | Monitor delegation queue |
| External Systems | 4 hours | Check connectivity |

## Heartbeat Response Options

### `HEARTBEAT_OK`
Use when:
- All checks passed
- No issues to report
- System healthy

### Specific Actions
Use when:
- Memory needs consolidation
- Tasks need attention
- Issues found

Example:
```
Memory consolidation needed for 2026-03-15. 
Running consolidation now...
```

## Manual Execution

```bash
# Run heartbeat manually
./autonomy/checks/heartbeat-check.sh

# Dry run (see what would happen)
./autonomy/checks/heartbeat-check.sh --dry-run

# Check current state
cat autonomy/checks/heartbeat-state.json
```

## State File

`autonomy/checks/heartbeat-state.json` tracks:
- When each check last ran
- When it's next due
- Total heartbeats
- Issues found

## Integration

- **Phase 1 (Memory):** Consolidates episodic memory
- **Phase 2 (Delegation):** Monitors task queue
- **Phase 3 (This):** Runs checks, maintains state
- **Phase 4 (Integration):** Reports to dashboard

## Adding New Checks

1. Add to `heartbeat-state.json`:
```json
"my_check": {
  "last_run": "",
  "next_run": "",
  "status": "pending",
  "interval_minutes": 60
}
```

2. Add function to `heartbeat-check.sh`:
```bash
my_check() {
    log "INFO" "Running my check..."
    # Your check logic
}
```

3. Add to `main()`:
```bash
if [ "$(is_due "$my_last" 60 minutes)" == "true" ]; then
    my_check
fi
```

## Logs

Location: `metrics/autonomy/heartbeat-YYYY-MM-DD.log`

View:
```bash
tail -f metrics/autonomy/heartbeat-$(date +%Y-%m-%d).log
```

## Troubleshooting

**Heartbeat not running:**
- Check state file exists
- Verify script is executable
- Check log for errors

**Checks not executing:**
- Verify intervals in state file
- Check `is_due` logic
- Review timestamps

**Too many alerts:**
- Adjust thresholds
- Increase intervals
- Filter noise

---

**Last Updated:** 2026-03-16  
**Version:** 3.1.0 (Practical Rebuild)  
**Status:** Operational
