#!/bin/bash
# Task Runner - Scheduled Task Framework
# Purpose: Execute recurring tasks that CAN BE DEPLOYED
# Usage: ./task-runner.sh [--list] [--run <task-id>]

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
TASKS_FILE="$WORKSPACE/autonomy/tasks/tasks.json"
LOG_FILE="$WORKSPACE/metrics/autonomy/tasks-$(date +%Y-%m-%d).log"

# Ensure directories exist
mkdir -p "$WORKSPACE/metrics/autonomy"

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Initialize tasks file if missing
init_tasks() {
    if [ ! -f "$TASKS_FILE" ]; then
        cat > "$TASKS_FILE" << 'EOF'
{
  "version": "1.0",
  "last_run": "",
  "tasks": [
    {
      "id": "daily-memory-cleanup",
      "name": "Daily Memory Cleanup",
      "description": "Archive old memory files to archive directory",
      "schedule": "0 2 * * *",
      "enabled": true,
      "last_run": "",
      "run_count": 0,
      "action": "archive_old_memories"
    },
    {
      "id": "weekly-metrics-report",
      "name": "Weekly Metrics Report",
      "description": "Generate weekly performance summary",
      "schedule": "0 9 * * 0",
      "enabled": true,
      "last_run": "",
      "run_count": 0,
      "action": "generate_weekly_report"
    },
    {
      "id": "daily-git-commit",
      "name": "Daily Git Commit",
      "description": "Auto-commit workspace changes",
      "schedule": "0 23 * * *",
      "enabled": false,
      "last_run": "",
      "run_count": 0,
      "action": "git_auto_commit"
    },
    {
      "id": "hourly-health-log",
      "name": "Hourly Health Log",
      "description": "Log system health metrics",
      "schedule": "0 * * * *",
      "enabled": true,
      "last_run": "",
      "run_count": 0,
      "action": "log_health_metrics"
    }
  ]
}
EOF
        log "INFO" "Initialized tasks.json"
    fi
}

# List all tasks
list_tasks() {
    echo "=== Scheduled Tasks ==="
    echo ""
    
    local tasks=$(cat "$TASKS_FILE" | grep -o '"tasks": \[[^]]*\]')
    
    # Parse and display tasks (simplified)
    cat "$TASKS_FILE" | python3 -c "
import json
import sys
data = json.load(sys.stdin)
for task in data['tasks']:
    status = '✅' if task['enabled'] else '❌'
    print(f\"{status} {task['id']}\")
    print(f\"   Name: {task['name']}\")
    print(f\"   Schedule: {task['schedule']}\")
    print(f\"   Last run: {task['last_run'] or 'Never'}\")
    print(f\"   Run count: {task['run_count']}\")
    print()
" 2>/dev/null || echo "Install python3 for better formatting"
}

# Check if task is due
is_task_due() {
    local schedule="$1"
    local last_run="$2"
    
    # Simple check - if never run, it's due
    if [ -z "$last_run" ]; then
        echo "true"
        return
    fi
    
    # Parse schedule (simplified - just check daily for now)
    # In production, use proper cron parsing
    local last_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$last_run" "+%s" 2>/dev/null || echo "0")
    local now_epoch=$(date +%s)
    local hours_since=$(( (now_epoch - last_epoch) / 3600 ))
    
    # Extract interval from schedule (very simplified)
    if [[ "$schedule" == *"* * * *"* ]]; then
        # Every hour
        if [ $hours_since -ge 1 ]; then
            echo "true"
        else
            echo "false"
        fi
    elif [[ "$schedule" == "0 2 * * *" ]]; then
        # Daily at 2am
        if [ $hours_since -ge 24 ]; then
            echo "true"
        else
            echo "false"
        fi
    elif [[ "$schedule" == "0 9 * * 0" ]]; then
        # Weekly
        if [ $hours_since -ge 168 ]; then
            echo "true"
        else
            echo "false"
        fi
    else
        # Default: check if > 1 hour
        if [ $hours_since -ge 1 ]; then
            echo "true"
        else
            echo "false"
        fi
    fi
}

# Execute task action
execute_action() {
    local action="$1"
    local task_id="$2"
    
    log "INFO" "Executing action: $action"
    
    case "$action" in
        "archive_old_memories")
            archive_old_memories
            ;;
        "generate_weekly_report")
            generate_weekly_report
            ;;
        "git_auto_commit")
            git_auto_commit
            ;;
        "log_health_metrics")
            log_health_metrics
            ;;
        *)
            log "ERROR" "Unknown action: $action"
            return 1
            ;;
    esac
}

# Archive old memory files
archive_old_memories() {
    log "INFO" "Archiving old memory files..."
    
    local memory_dir="$WORKSPACE/memory"
    local archive_dir="$WORKSPACE/memory/archive"
    
    mkdir -p "$archive_dir"
    
    # Find memory files older than 30 days
    local count=0
    for file in "$memory_dir"/2026-*.md; do
        if [ -f "$file" ]; then
            local filename=$(basename "$file")
            # Simple date check - files from previous months
            if [[ "$filename" < "$(date +%Y-%m)" ]]; then
                mv "$file" "$archive_dir/"
                count=$((count + 1))
                log "INFO" "Archived: $filename"
            fi
        fi
    done
    
    log "SUCCESS" "Archived $count memory files"
}

# Generate weekly report
generate_weekly_report() {
    log "INFO" "Generating weekly report..."
    
    local report_file="$WORKSPACE/metrics/weekly-report-$(date +%Y-W%U).md"
    
    cat > "$report_file" << EOF
# Weekly Report - Week $(date +%U)

**Generated:** $(date '+%Y-%m-%d %H:%M:%S')

## Summary

- Heartbeats run: $(grep -c "Heartbeat Complete" "$WORKSPACE/metrics/autonomy/heartbeat-$(date +%Y-%m-%d).log" 2>/dev/null || echo "0")
- Tasks completed: $(grep -c "SUCCESS" "$LOG_FILE" 2>/dev/null || echo "0")
- Issues found: $(grep -c "WARNING\|ERROR" "$WORKSPACE/metrics/autonomy/"*.log 2>/dev/null || echo "0")

## System Health

- Disk usage: $(df -h "$WORKSPACE" | awk 'NR==2 {print $5}')
- Active tasks: $(grep -c "^## " "$WORKSPACE/delegation/tracking/active-tasks.md" 2>/dev/null || echo "0")

## Next Week

- [ ] Review completed tasks
- [ ] Update documentation
- [ ] Check system metrics

EOF

    log "SUCCESS" "Weekly report generated: $report_file"
}

# Git auto-commit
git_auto_commit() {
    log "INFO" "Running git auto-commit..."
    
    if [ ! -d "$WORKSPACE/.git" ]; then
        log "WARNING" "Not a git repository"
        return 1
    fi
    
    cd "$WORKSPACE"
    
    # Check for changes
    if [ -z "$(git status --porcelain)" ]; then
        log "INFO" "No changes to commit"
        return 0
    fi
    
    # Add and commit
    git add -A
    git commit -m "Auto-commit: $(date '+%Y-%m-%d %H:%M:%S')"
    
    log "SUCCESS" "Changes committed"
}

# Log health metrics
log_health_metrics() {
    local metrics_file="$WORKSPACE/metrics/system-metrics.jsonl"
    
    local metric=$(cat << EOF
{"timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)", "disk_usage": $(df "$WORKSPACE" | awk 'NR==2 {print $5}' | sed 's/%//'), "active_tasks": $(grep -c "^## " "$WORKSPACE/delegation/tracking/active-tasks.md" 2>/dev/null || echo "0")}
EOF
)
    
    echo "$metric" >> "$metrics_file"
    log "INFO" "Health metrics logged"
}

# Update task last_run
update_task_status() {
    local task_id="$1"
    local now=$(date -u +"%Y-%m-%dT%H:%M:%S")
    
    # Use Python for JSON manipulation
    python3 << EOF
import json

with open('$TASKS_FILE', 'r') as f:
    data = json.load(f)

for task in data['tasks']:
    if task['id'] == '$task_id':
        task['last_run'] = '$now'
        task['run_count'] = task.get('run_count', 0) + 1
        break

with open('$TASKS_FILE', 'w') as f:
    json.dump(data, f, indent=2)
EOF
}

# Run all due tasks
run_due_tasks() {
    log "INFO" "=== Task Runner Started ==="
    
    local tasks_run=0
    
    # Read tasks and check each one
    python3 << 'PYEOF'
import json
import sys
import subprocess

with open('$TASKS_FILE', 'r') as f:
    data = json.load(f)

tasks_run = 0

for task in data['tasks']:
    if not task['enabled']:
        continue
    
    # Check if due (simplified)
    import datetime
    last_run = task.get('last_run', '')
    
    is_due = False
    if not last_run:
        is_due = True
    else:
        try:
            last = datetime.datetime.fromisoformat(last_run.replace('Z', '+00:00'))
            now = datetime.datetime.now(datetime.timezone.utc)
            hours_since = (now - last).total_seconds() / 3600
            
            schedule = task['schedule']
            if '* * * * *' in schedule:  # Every hour
                is_due = hours_since >= 1
            elif '0 2 * * *' in schedule:  # Daily
                is_due = hours_since >= 24
            elif '0 9 * * 0' in schedule:  # Weekly
                is_due = hours_since >= 168
            else:
                is_due = hours_since >= 1
        except:
            is_due = True
    
    if is_due:
        print(f"TASK_DUE:{task['id']}:{task['action']}")
        tasks_run += 1

sys.exit(0 if tasks_run > 0 else 1)
PYEOF

    # Process output and run tasks
    # This is handled by the calling code
    
    log "INFO" "=== Task Runner Complete ==="
}

# Run specific task
run_task() {
    local task_id="$1"
    
    log "INFO" "Running task: $task_id"
    
    # Get task details
    local task_info=$(python3 << EOF
import json
with open('$TASKS_FILE', 'r') as f:
    data = json.load(f)
for task in data['tasks']:
    if task['id'] == '$task_id':
        print(f"{task['action']}|{task['enabled']}")
        break
EOF
)
    
    if [ -z "$task_info" ]; then
        log "ERROR" "Task not found: $task_id"
        return 1
    fi
    
    local action=$(echo "$task_info" | cut -d'|' -f1)
    local enabled=$(echo "$task_info" | cut -d'|' -f2)
    
    if [ "$enabled" != "True" ]; then
        log "WARNING" "Task is disabled: $task_id"
        return 1
    fi
    
    # Execute
    if execute_action "$action" "$task_id"; then
        update_task_status "$task_id"
        log "SUCCESS" "Task completed: $task_id"
        return 0
    else
        log "ERROR" "Task failed: $task_id"
        return 1
    fi
}

# Main
main() {
    init_tasks
    
    case "${1:-}" in
        --list)
            list_tasks
            ;;
        --run)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 --run <task-id>"
                exit 1
            fi
            run_task "$2"
            ;;
        *)
            run_due_tasks
            ;;
    esac
}

main "$@"
