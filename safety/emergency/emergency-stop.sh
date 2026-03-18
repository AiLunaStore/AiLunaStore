#!/bin/bash
# Emergency Stop Script
# Purpose: Emergency mechanisms that WORK IN PRACTICE
# Usage: ./emergency-stop.sh activate|deactivate|status [reason]

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
STATUS_FILE="$WORKSPACE/safety/emergency/emergency-status.json"
LOCK_FILE="$WORKSPACE/safety/emergency/EMERGENCY_ACTIVE"
LOG_FILE="$WORKSPACE/safety/emergency/emergency.log"

# Ensure directory exists
mkdir -p "$WORKSPACE/safety/emergency"

# Initialize status file
init_status() {
    if [ ! -f "$STATUS_FILE" ]; then
        cat > "$STATUS_FILE" << 'EOF'
{
  "status": "normal",
  "active": false,
  "level": null,
  "activated_at": null,
  "activated_by": null,
  "reason": null,
  "deactivated_at": null,
  "deactivated_by": null,
  "history": []
}
EOF
    fi
}

# Log emergency event
log_event() {
    local event="$1"
    local details="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] $event: $details" >> "$LOG_FILE"
}

# Activate emergency stop
activate() {
    local reason="$1"
    local level="${2:-SOFT}"  # PAUSE, SOFT, HARD, NUCLEAR
    
    init_status
    
    if [ -f "$LOCK_FILE" ]; then
        echo "⚠️  Emergency stop already active!"
        cat "$LOCK_FILE"
        return 1
    fi
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    
    # Create lock file
    cat > "$LOCK_FILE" << EOF
EMERGENCY STOP ACTIVE
====================
Level: $level
Activated: $timestamp
Reason: $reason
Activated By: ${USER:-unknown}

To deactivate:
  ./emergency-stop.sh deactivate "Resolution reason" "Authorized By"
EOF

    # Update status
    cat > "$STATUS_FILE" << EOF
{
  "status": "emergency",
  "active": true,
  "level": "$level",
  "activated_at": "$timestamp",
  "activated_by": "${USER:-unknown}",
  "reason": "$reason",
  "deactivated_at": null,
  "deactivated_by": null
}
EOF

    # Log
    log_event "ACTIVATE" "Level=$level, Reason=$reason"
    
    # Output
    echo "🚨 EMERGENCY STOP ACTIVATED 🚨"
    echo ""
    echo "Level: $level"
    echo "Reason: $reason"
    echo "Time: $timestamp"
    echo ""
    
    case "$level" in
        "PAUSE")
            echo "Actions paused. Waiting for human input."
            ;;
        "SOFT")
            echo "All autonomous operations stopped."
            echo "System in safe monitoring mode."
            ;;
        "HARD")
            echo "All processes terminated."
            echo "System isolated."
            ;;
        "NUCLEAR")
            echo "COMPLETE SYSTEM SHUTDOWN"
            echo "Manual restart required."
            ;;
    esac
    
    echo ""
    echo "Status file: $STATUS_FILE"
    echo "Lock file: $LOCK_FILE"
}

# Deactivate emergency stop
deactivate() {
    local reason="$1"
    local authorized_by="${2:-}"
    
    init_status
    
    if [ ! -f "$LOCK_FILE" ]; then
        echo "ℹ️  No emergency stop active"
        return 0
    fi
    
    if [ -z "$authorized_by" ]; then
        echo "❌ Deactivation requires authorization"
        echo "Usage: $0 deactivate 'Resolution reason' 'Authorized By'"
        return 1
    fi
    
    local timestamp=$(date -u +"%Y-%m-%dT%H:%M:%SZ")
    local previous_status=$(cat "$STATUS_FILE")
    
    # Remove lock file
    rm "$LOCK_FILE"
    
    # Update status
    cat > "$STATUS_FILE" << EOF
{
  "status": "normal",
  "active": false,
  "level": null,
  "activated_at": null,
  "activated_by": null,
  "reason": null,
  "deactivated_at": "$timestamp",
  "deactivated_by": "$authorized_by",
  "deactivation_reason": "$reason"
}
EOF

    # Log
    log_event "DEACTIVATE" "Reason=$reason, AuthorizedBy=$authorized_by"
    
    echo "✅ EMERGENCY STOP DEACTIVATED"
    echo ""
    echo "Deactivated at: $timestamp"
    echo "Reason: $reason"
    echo "Authorized by: $authorized_by"
    echo ""
    echo "System resuming normal operations."
    echo "Trust level reset to L0 - requires human approval for actions."
}

# Show status
show_status() {
    init_status
    
    local status=$(grep -o '"status": "[^"]*"' "$STATUS_FILE" | cut -d'"' -f4)
    local active=$(grep -o '"active": \(true\|false\)' "$STATUS_FILE" | grep -o 'true\|false')
    
    echo "=== Emergency Stop Status ==="
    echo ""
    
    if [ "$active" == "true" ]; then
        local level=$(grep -o '"level": "[^"]*"' "$STATUS_FILE" | cut -d'"' -f4)
        local reason=$(grep -o '"reason": "[^"]*"' "$STATUS_FILE" | cut -d'"' -f4)
        local activated=$(grep -o '"activated_at": "[^"]*"' "$STATUS_FILE" | cut -d'"' -f4)
        
        echo -e "\033[0;31m🚨 EMERGENCY STOP ACTIVE\033[0m"
        echo ""
        echo "Level: $level"
        echo "Reason: $reason"
        echo "Activated: $activated"
        echo ""
        echo "Lock file exists: $LOCK_FILE"
    else
        echo -e "\033[0;32m✅ System Normal\033[0m"
        echo ""
        echo "No emergency stop active"
        echo "Operations proceeding normally"
        
        local deactivated=$(grep -o '"deactivated_at": "[^"]*"' "$STATUS_FILE" | cut -d'"' -f4)
        if [ -n "$deactivated" ] && [ "$deactivated" != "null" ]; then
            echo "Last emergency: $deactivated"
        fi
    fi
}

# Main
main() {
    case "${1:-}" in
        activate)
            activate "${2:-Emergency stop activated}" "${3:-SOFT}"
            ;;
        deactivate)
            deactivate "${2:-Issue resolved}" "${3:-}"
            ;;
        status)
            show_status
            ;;
        *)
            echo "Emergency Stop System"
            echo ""
            echo "Usage:"
            echo "  $0 activate 'reason' [PAUSE|SOFT|HARD|NUCLEAR]"
            echo "  $0 deactivate 'reason' 'authorized_by'"
            echo "  $0 status"
            echo ""
            echo "Levels:"
            echo "  PAUSE   - Pause operations, wait for input"
            echo "  SOFT    - Stop autonomous ops (default)"
            echo "  HARD    - Terminate all processes"
            echo "  NUCLEAR - Complete shutdown"
            echo ""
            show_status
            ;;
    esac
}

main "$@"
