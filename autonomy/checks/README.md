# Heartbeat System

## What It Does

The heartbeat system runs proactive checks every 30 minutes to keep the Hired AI system healthy and responsive.

## Checks Performed

| Check | Frequency | What It Does |
|-------|-----------|--------------|
| Memory Consolidation | Daily | Marks old memory files for consolidation |
| System Health | Hourly | Checks disk usage, errors, git status |
| Task Status | 30 min | Monitors active delegation tasks |
| External Systems | 4 hours | Verifies internet connectivity |

## Usage

### Run Manually
```bash
./autonomy/checks/heartbeat-check.sh
```

### Dry Run (See what would happen)
```bash
./autonomy/checks/heartbeat-check.sh --dry-run
```

### Check Status
```bash
cat autonomy/checks/heartbeat-state.json
```

## State File

The `heartbeat-state.json` tracks:
- When each check last ran
- When it's next due
- How many heartbeats have run
- Issues found

## Integration

This is called by OpenClaw's heartbeat prompt. When you receive a heartbeat:

1. System reads `HEARTBEAT.md` for context
2. Executes `autonomy/checks/heartbeat-check.sh`
3. Updates `heartbeat-state.json`
4. Logs to `metrics/autonomy/heartbeat-YYYY-MM-DD.log`

## Adding New Checks

1. Add check definition to `heartbeat-state.json`
2. Add check function to `heartbeat-check.sh`
3. Add execution logic in `main()`

## Logs

Logs are stored in:
```
metrics/autonomy/heartbeat-YYYY-MM-DD.log
```

View today's log:
```bash
tail -f metrics/autonomy/heartbeat-$(date +%Y-%m-%d).log
```
