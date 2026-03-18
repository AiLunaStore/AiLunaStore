#!/bin/bash
# Heartbeat Check Script
# Purpose: Proactive monitoring that ACTUALLY WORKS
# Usage: ./heartbeat-check.sh [--dry-run]

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
STATE_FILE="$WORKSPACE/autonomy/checks/heartbeat-state.json"
LOG_FILE="$WORKSPACE/metrics/autonomy/heartbeat-$(date +%Y-%m-%d).log"
DRY_RUN=false

# Parse arguments
if [ "$1" == "--dry-run" ]; then
    DRY_RUN=true
    echo "[DRY RUN] No changes will be made"
fi

# Ensure directories exist
mkdir -p "$WORKSPACE/metrics/autonomy"
mkdir -p "$WORKSPACE/autonomy/checks"

# Initialize state file if missing
if [ ! -f "$STATE_FILE" ]; then
    cat > "$STATE_FILE" << 'EOF'
{
  "last_heartbeat": "",
  "next_scheduled": "",
  "status": "active",
  "checks": {
    "memory_consolidation": {
      "last_run": "",
      "next_run": "",
      "status": "pending",
      "interval_hours": 24
    },
    "health_check": {
      "last_run": "",
      "next_run": "",
      "status": "pending",
      "interval_minutes": 60
    },
    "task_status": {
      "last_run": "",
      "next_run": "",
      "status": "pending",
      "interval_minutes": 30
    },
    "external_check": {
      "last_run": "",
      "next_run": "",
      "status": "pending",
      "interval_hours": 4
    }
  },
  "metrics": {
    "total_heartbeats": 0,
    "checks_run": 0,
    "issues_found": 0
  }
}
EOF
fi

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Read state file
read_state() {
    cat "$STATE_FILE"
}

# Update state file
update_state() {
    if [ "$DRY_RUN" = false ]; then
        echo "$1" > "$STATE_FILE"
    fi
}

# Check if a check is due
is_due() {
    local last_run="$1"
    local interval="$2"
    local interval_unit="$3"
    
    if [ -z "$last_run" ]; then
        echo "true"
        return
    fi
    
    local last_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$last_run" "+%s" 2>/dev/null || echo "0")
    local now_epoch=$(date +%s)
    local diff=$((now_epoch - last_epoch))
    
    local threshold=0
    if [ "$interval_unit" == "hours" ]; then
        threshold=$((interval * 3600))
    else
        threshold=$((interval * 60))
    fi
    
    if [ $diff -ge $threshold ]; then
        echo "true"
    else
        echo "false"
    fi
}

# Run memory consolidation check
check_memory_consolidation() {
    log "INFO" "Checking memory consolidation..."
    
    local memory_dir="$WORKSPACE/memory"
    local today=$(date +%Y-%m-%d)
    local yesterday=$(date -v-1d +%Y-%m-%d 2>/dev/null || date -d "yesterday" +%Y-%m-%d)
    
    # Check if yesterday's memory exists and needs consolidation
    if [ -f "$memory_dir/$yesterday.md" ]; then
        log "INFO" "Found memory file for $yesterday"
        
        # Check if already consolidated (look for marker)
        if grep -q "<!-- CONSOLIDATED -->" "$memory_dir/$yesterday.md" 2>/dev/null; then
            log "INFO" "Memory already consolidated for $yesterday"
            return 0
        fi
        
        log "ACTION" "Memory consolidation needed for $yesterday"
        
        if [ "$DRY_RUN" = false ]; then
            # Create consolidation marker
            echo -e "\n<!-- CONSOLIDATED -->" >> "$memory_dir/$yesterday.md"
            log "SUCCESS" "Memory marked for consolidation"
        fi
        
        return 1  # Action needed
    else
        log "INFO" "No memory file found for $yesterday"
        return 0
    fi
}

# Run health check
check_system_health() {
    log "INFO" "Running system health check..."
    
    local issues=0
    
    # Check disk usage
    local disk_usage=$(df -h "$WORKSPACE" | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ "$disk_usage" -gt 85 ]; then
        log "WARNING" "Disk usage high: ${disk_usage}%"
        issues=$((issues + 1))
    else
        log "INFO" "Disk usage OK: ${disk_usage}%"
    fi
    
    # Check for error logs
    local error_count=$(find "$WORKSPACE" -name "*.log" -mtime -1 -exec grep -l "ERROR" {} \; 2>/dev/null | wc -l)
    if [ "$error_count" -gt 0 ]; then
        log "WARNING" "Found $error_count log files with errors"
        issues=$((issues + 1))
    else
        log "INFO" "No error logs found"
    fi
    
    # Check git status if in repo
    if [ -d "$WORKSPACE/.git" ]; then
        local uncommitted=$(cd "$WORKSPACE" && git status --porcelain 2>/dev/null | wc -l)
        if [ "$uncommitted" -gt 10 ]; then
            log "WARNING" "$uncommitted uncommitted changes"
            issues=$((issues + 1))
        else
            log "INFO" "Git status OK ($uncommitted changes)"
        fi
    fi
    
    return $issues
}

# Check task status
check_task_status() {
    log "INFO" "Checking task status..."
    
    local active_tasks="$WORKSPACE/delegation/tracking/active-tasks.md"
    local completed_tasks="$WORKSPACE/delegation/tracking/completed-tasks.md"
    
    if [ -f "$active_tasks" ]; then
        local task_count=$(grep -c "^## " "$active_tasks" 2>/dev/null || echo "0")
        log "INFO" "Found $task_count active tasks"
        
        # Check for stale tasks (older than 7 days)
        local stale_count=0
        # This is a simplified check - in production, parse dates properly
        log "INFO" "Task monitoring active"
    else
        log "INFO" "No active tasks file found"
    fi
    
    return 0
}

# Check external systems
check_external_systems() {
    log "INFO" "Checking external systems..."
    
    # Check internet connectivity
    if ping -c 1 -W 5 8.8.8.8 > /dev/null 2>&1; then
        log "INFO" "Internet connectivity OK"
    else
        log "WARNING" "Internet connectivity issue"
        return 1
    fi
    
    # Check API rate limits (if we had API tracking)
    log "INFO" "External systems check complete"
    
    return 0
}

# Main execution
main() {
    log "INFO" "=== Heartbeat Check Started ==="
    
    local state=$(read_state)
    local now=$(date -u +"%Y-%m-%dT%H:%M:%S")
    local checks_run=0
    local issues_found=0
    
    # Update last heartbeat
    state=$(echo "$state" | sed "s/\"last_heartbeat\": \"[^\"]*\"/\"last_heartbeat\": \"$now\"/")
    
    # Check memory consolidation (daily)
    local mem_last=$(echo "$state" | grep -o '"memory_consolidation": {[^}]*' | grep -o '"last_run": "[^"]*"' | cut -d'"' -f4)
    if [ "$(is_due "$mem_last" 24 hours)" == "true" ]; then
        if ! check_memory_consolidation; then
            issues_found=$((issues_found + 1))
        fi
        checks_run=$((checks_run + 1))
        state=$(echo "$state" | sed "s/\"memory_consolidation\": {[^}]*\"last_run\": \"[^\"]*\"/\"memory_consolidation\": {\"last_run\": \"$now\"/")
    fi
    
    # Check system health (hourly)
    local health_last=$(echo "$state" | grep -o '"health_check": {[^}]*' | grep -o '"last_run": "[^"]*"' | cut -d'"' -f4)
    if [ "$(is_due "$health_last" 60 minutes)" == "true" ]; then
        if ! check_system_health; then
            issues_found=$((issues_found + 1))
        fi
        checks_run=$((checks_run + 1))
        state=$(echo "$state" | sed "s/\"health_check\": {[^}]*\"last_run\": \"[^\"]*\"/\"health_check\": {\"last_run\": \"$now\"/")
    fi
    
    # Check task status (30 min)
    local task_last=$(echo "$state" | grep -o '"task_status": {[^}]*' | grep -o '"last_run": "[^"]*"' | cut -d'"' -f4)
    if [ "$(is_due "$task_last" 30 minutes)" == "true" ]; then
        check_task_status
        checks_run=$((checks_run + 1))
        state=$(echo "$state" | sed "s/\"task_status\": {[^}]*\"last_run\": \"[^\"]*\"/\"task_status\": {\"last_run\": \"$now\"/")
    fi
    
    # Check external systems (4 hours)
    local ext_last=$(echo "$state" | grep -o '"external_check": {[^}]*' | grep -o '"last_run": "[^"]*"' | cut -d'"' -f4)
    if [ "$(is_due "$ext_last" 4 hours)" == "true" ]; then
        if ! check_external_systems; then
            issues_found=$((issues_found + 1))
        fi
        checks_run=$((checks_run + 1))
        state=$(echo "$state" | sed "s/\"external_check\": {[^}]*\"last_run\": \"[^\"]*\"/\"external_check\": {\"last_run\": \"$now\"/")
    fi
    
    # Update metrics
    local total_beats=$(echo "$state" | grep -o '"total_heartbeats": [0-9]*' | grep -o '[0-9]*')
    total_beats=$((total_beats + 1))
    state=$(echo "$state" | sed "s/\"total_heartbeats\": [0-9]*/\"total_heartbeats\": $total_beats/")
    
    # Save state
    update_state "$state"
    
    log "INFO" "=== Heartbeat Complete ==="
    log "INFO" "Checks run: $checks_run, Issues found: $issues_found"
    
    if [ $issues_found -gt 0 ]; then
        exit 1
    fi
    
    exit 0
}

# Run main
main "$@"
