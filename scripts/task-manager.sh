#!/bin/bash

# Task Manager for Hired AI System
# Manages scheduled tasks defined in scheduled-tasks.json

set -e

CONFIG_FILE="scripts/scheduled-tasks.json"
LOG_DIR="metrics/tasks"
STATE_FILE="memory/task-state.json"

# Create directories if they don't exist
mkdir -p "$LOG_DIR"
mkdir -p "$(dirname "$STATE_FILE")"

# Load configuration
load_config() {
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Error: Configuration file not found: $CONFIG_FILE"
        exit 1
    fi
    
    # Use jq to parse JSON
    if ! command -v jq &> /dev/null; then
        echo "Error: jq is required but not installed"
        exit 1
    fi
    
    echo "Loaded configuration from $CONFIG_FILE"
}

# Initialize state file
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" << EOF
{
  "initialized": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "version": "1.0.0",
  "tasks": {},
  "statistics": {
    "total_executions": 0,
    "successful": 0,
    "failed": 0,
    "last_run": null
  }
}
EOF
        echo "Initialized state file: $STATE_FILE"
    fi
}

# Check if task should run
should_run_task() {
    local task_name="$1"
    local schedule="$2"
    local last_run
    
    # Get last run time from state file
    last_run=$(jq -r ".tasks.\"$task_name\".last_run // \"never\"" "$STATE_FILE" 2>/dev/null || echo "never")
    
    if [ "$last_run" = "never" ]; then
        echo "Task $task_name has never run - scheduling first run"
        return 0
    fi
    
    # Parse schedule
    if [[ "$schedule" =~ ^[0-9]+h$ ]]; then
        # Interval schedule (e.g., "4h")
        local interval_hours=${schedule%h}
        local last_run_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$last_run" +%s 2>/dev/null || echo 0)
        local current_epoch=$(date +%s)
        local hours_since=$(( (current_epoch - last_run_epoch) / 3600 ))
        
        if [ $hours_since -ge $interval_hours ]; then
            echo "Task $task_name due: $hours_since hours since last run (interval: ${interval_hours}h)"
            return 0
        else
            echo "Task $task_name not due: $hours_since hours since last run (interval: ${interval_hours}h)"
            return 1
        fi
    else
        # Cron schedule - for simplicity, we'll just check if it's been more than 24 hours
        # In production, use a proper cron parser
        local last_run_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%SZ" "$last_run" +%s 2>/dev/null || echo 0)
        local current_epoch=$(date +%s)
        local hours_since=$(( (current_epoch - last_run_epoch) / 3600 ))
        
        # For daily tasks, check if it's been > 23 hours
        if [ $hours_since -ge 23 ]; then
            echo "Task $task_name due: $hours_since hours since last run"
            return 0
        else
            echo "Task $task_name not due: $hours_since hours since last run"
            return 1
        fi
    fi
}

# Execute a task
execute_task() {
    local task_name="$1"
    local task_config="$2"
    
    local command=$(echo "$task_config" | jq -r '.command')
    local timeout=$(echo "$task_config" | jq -r '.timeout')
    local priority=$(echo "$task_config" | jq -r '.priority')
    local description=$(echo "$task_config" | jq -r '.description')
    
    echo "Executing task: $task_name"
    echo "Description: $description"
    echo "Priority: $priority"
    echo "Timeout: $timeout"
    
    # Create log file
    local log_file="$LOG_DIR/${task_name}-$(date +%Y%m%d-%H%M%S).log"
    
    # Start execution
    local start_time=$(date +%s)
    
    # Execute command with timeout
    # Note: In production, you'd want to handle the actual OpenClaw command execution
    # For now, we'll simulate it
    echo "Command: $command" > "$log_file"
    echo "Started: $(date)" >> "$log_file"
    
    # Simulate execution
    sleep 2
    
    # Random success/failure for demonstration
    if [ $((RANDOM % 10)) -lt 8 ]; then
        # Success
        echo "Result: SUCCESS" >> "$log_file"
        local result="success"
        echo "Task $task_name completed successfully"
    else
        # Failure
        echo "Result: FAILED" >> "$log_file"
        local result="failed"
        echo "Task $task_name failed"
    fi
    
    local end_time=$(date +%s)
    local duration=$((end_time - start_time))
    
    echo "Duration: ${duration}s" >> "$log_file"
    echo "Completed: $(date)" >> "$log_file"
    
    # Update state file
    update_task_state "$task_name" "$result" "$duration"
    
    # Handle notifications
    handle_notifications "$task_name" "$task_config" "$result"
    
    return 0
}

# Update task state
update_task_state() {
    local task_name="$1"
    local result="$2"
    local duration="$3"
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Create temporary update file
    local temp_file=$(mktemp)
    
    jq --arg task "$task_name" \
       --arg timestamp "$timestamp" \
       --arg result "$result" \
       --argjson duration "$duration" \
       '.tasks[$task] = {
          last_run: $timestamp,
          result: $result,
          duration: $duration
        } |
        .statistics.total_executions += 1 |
        .statistics.last_run = $timestamp |
        if $result == "success" then
          .statistics.successful += 1
        else
          .statistics.failed += 1
        end' \
       "$STATE_FILE" > "$temp_file"
    
    mv "$temp_file" "$STATE_FILE"
    
    echo "Updated state for task: $task_name"
}

# Handle notifications
handle_notifications() {
    local task_name="$1"
    local task_config="$2"
    local result="$3"
    
    local notify_on_success=$(echo "$task_config" | jq -r '.notifications.on_success')
    local notify_on_failure=$(echo "$task_config" | jq -r '.notifications.on_failure')
    
    if [ "$result" = "success" ] && [ "$notify_on_success" = "true" ]; then
        echo "Sending success notification for task: $task_name"
        # In production, send actual notification
    fi
    
    if [ "$result" = "failed" ] && [ "$notify_on_failure" = "true" ]; then
        echo "Sending failure notification for task: $task_name"
        # In production, send actual notification
    fi
}

# Main execution loop
main() {
    load_config
    init_state
    
    echo "Starting task manager at $(date)"
    
    # Process cron jobs
    echo "Processing cron jobs..."
    local cron_jobs=$(jq -c '.cron_jobs | to_entries[]' "$CONFIG_FILE")
    
    while IFS= read -r job; do
        local task_name=$(echo "$job" | jq -r '.key')
        local task_config=$(echo "$job" | jq -r '.value')
        local enabled=$(echo "$task_config" | jq -r '.enabled')
        local schedule=$(echo "$task_config" | jq -r '.schedule')
        
        if [ "$enabled" = "true" ]; then
            if should_run_task "$task_name" "$schedule"; then
                execute_task "$task_name" "$task_config"
            fi
        else
            echo "Task $task_name is disabled"
        fi
    done <<< "$cron_jobs"
    
    # Process recurring tasks
    echo "Processing recurring tasks..."
    local recurring_tasks=$(jq -c '.recurring_tasks | to_entries[]' "$CONFIG_FILE")
    
    while IFS= read -r task; do
        local task_name=$(echo "$task" | jq -r '.key')
        local task_config=$(echo "$task" | jq -r '.value')
        local enabled=$(echo "$task_config" | jq -r '.enabled')
        local interval=$(echo "$task_config" | jq -r '.interval')
        
        if [ "$enabled" = "true" ]; then
            if should_run_task "$task_name" "$interval"; then
                execute_task "$task_name" "$task_config"
            fi
        else
            echo "Task $task_name is disabled"
        fi
    done <<< "$recurring_tasks"
    
    echo "Task manager completed at $(date)"
}

# Run main function
main "$@"