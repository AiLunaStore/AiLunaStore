# Scheduled Tasks Framework

## What It Does

A practical task scheduler that runs recurring tasks automatically. Unlike complex cron systems, this is designed for the Hired AI workflow.

## Built-in Tasks

| Task ID | Schedule | Description | Status |
|---------|----------|-------------|--------|
| `daily-memory-cleanup` | Daily 2am | Archive old memory files | ✅ Enabled |
| `weekly-metrics-report` | Sundays 9am | Generate weekly summary | ✅ Enabled |
| `daily-git-commit` | Daily 11pm | Auto-commit changes | ❌ Disabled |
| `hourly-health-log` | Every hour | Log health metrics | ✅ Enabled |

## Usage

### List All Tasks
```bash
./autonomy/tasks/task-runner.sh --list
```

### Run a Specific Task
```bash
./autonomy/tasks/task-runner.sh --run daily-memory-cleanup
```

### Run All Due Tasks
```bash
./autonomy/tasks/task-runner.sh
```

## Task Format

Each task in `tasks.json`:

```json
{
  "id": "unique-task-id",
  "name": "Human-readable name",
  "description": "What this task does",
  "schedule": "cron expression",
  "enabled": true/false,
  "last_run": "ISO timestamp",
  "run_count": 0,
  "action": "action_name"
}
```

## Adding a New Task

1. Add task to `tasks.json`:
```json
{
  "id": "my-custom-task",
  "name": "My Custom Task",
  "description": "Does something useful",
  "schedule": "0 */6 * * *",
  "enabled": true,
  "last_run": "",
  "run_count": 0,
  "action": "my_custom_action"
}
```

2. Add action handler to `task-runner.sh`:
```bash
"my_custom_action")
    my_custom_function
    ;;
```

3. Define the function:
```bash
my_custom_function() {
    log "INFO" "Running my custom task"
    # Your code here
}
```

## Schedule Format

Uses simplified cron:
- `0 * * * *` - Every hour
- `0 2 * * *` - Daily at 2am
- `0 9 * * 0` - Sundays at 9am
- `*/30 * * * *` - Every 30 minutes

## Logs

Task logs: `metrics/autonomy/tasks-YYYY-MM-DD.log`

## Integration

Tasks are automatically run by the heartbeat system when due.
