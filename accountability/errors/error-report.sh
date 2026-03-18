#!/bin/bash
# Error Report Script
# Purpose: Create structured error reports that ACTUALLY HELP with incidents
# Usage: ./error-report.sh --severity SEV --message "Error description" [--component NAME] [--details "Extra info"]

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
ERROR_LOG="$WORKSPACE/accountability/errors/error-log.jsonl"
INCIDENT_DIR="$WORKSPACE/accountability/errors/incidents"

# Ensure directories exist
mkdir -p "$WORKSPACE/accountability/errors"
mkdir -p "$INCIDENT_DIR"

# Parse arguments
SEVERITY=""
MESSAGE=""
COMPONENT="system"
DETAILS=""

while [[ $# -gt 0 ]]; do
    case $1 in
        --severity)
            SEVERITY="$2"
            shift 2
            ;;
        --message)
            MESSAGE="$2"
            shift 2
            ;;
        --component)
            COMPONENT="$2"
            shift 2
            ;;
        --details)
            DETAILS="$2"
            shift 2
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# Validate required args
if [ -z "$SEVERITY" ] || [ -z "$MESSAGE" ]; then
    echo "Usage: $0 --severity SEV --message 'Error message' [--component NAME] [--details 'Extra info']"
    echo ""
    echo "Severity levels:"
    echo "  CRITICAL - System down, data loss, security breach"
    echo "  HIGH     - Major functionality impaired"
    echo "  MEDIUM   - Minor issues, workarounds available"
    echo "  LOW      - Cosmetic issues"
    echo "  INFO     - Monitoring alerts"
    exit 1
fi

# Generate error ID
ERROR_ID="ERR-$(date +%Y%m%d-%H%M%S)-$(openssl rand -hex 2 2>/dev/null || echo $$)"
TIMESTAMP=$(date -u +"%Y-%m-%dT%H:%M:%SZ")

# Get system context
DISK_USAGE=$(df "$WORKSPACE" | awk 'NR==2 {print $5}' | sed 's/%//')
MEMORY_USAGE=$(ps -o %mem= -p $$ 2>/dev/null || echo "N/A")
ACTIVE_TASKS=$(grep -c "^## " "$WORKSPACE/delegation/tracking/active-tasks.md" 2>/dev/null || echo "0")
CURRENT_LEVEL=$(grep -o '"current_level": "[^"]*"' "$WORKSPACE/autonomy/protocols/level-state.json" 2>/dev/null | cut -d'"' -f4 || echo "L2")

# Create error entry
ERROR_ENTRY=$(cat << EOF
{
  "error_id": "$ERROR_ID",
  "timestamp": "$TIMESTAMP",
  "severity": "$SEVERITY",
  "component": "$COMPONENT",
  "message": "$MESSAGE",
  "details": "$DETAILS",
  "context": {
    "disk_usage_percent": $DISK_USAGE,
    "autonomy_level": "$CURRENT_LEVEL",
    "active_tasks": $ACTIVE_TASKS
  },
  "status": "open",
  "resolution": null,
  "resolved_at": null
}
EOF
)

# Log to error log
echo "$ERROR_ENTRY" >> "$ERROR_LOG"

# For CRITICAL/HIGH, create incident file
if [ "$SEVERITY" == "CRITICAL" ] || [ "$SEVERITY" == "HIGH" ]; then
    INCIDENT_FILE="$INCIDENT_DIR/$ERROR_ID.md"
    
    cat > "$INCIDENT_FILE" << EOF
# Incident Report: $ERROR_ID

**Severity:** $SEVERITY  
**Component:** $COMPONENT  
**Opened:** $TIMESTAMP  
**Status:** Open

## Summary

$MESSAGE

## Details

$DETAILS

## System Context

- Disk Usage: ${DISK_USAGE}%
- Autonomy Level: $CURRENT_LEVEL
- Active Tasks: $ACTIVE_TASKS

## Timeline

- **$TIMESTAMP** - Incident detected and logged

## Response Actions

- [ ] Acknowledge incident
- [ ] Assess impact
- [ ] Implement fix
- [ ] Verify resolution
- [ ] Document lessons learned

## Resolution

_To be filled when resolved_

---

**Next Review:** $(date -v+1d +"%Y-%m-%d" 2>/dev/null || date -d "tomorrow" +"%Y-%m-%d")
EOF

    echo "🚨 INCIDENT CREATED: $ERROR_ID"
    echo "   File: $INCIDENT_FILE"
    echo ""
fi

# Output summary
echo "Error Reported:"
echo "  ID: $ERROR_ID"
echo "  Severity: $SEVERITY"
echo "  Component: $COMPONENT"
echo "  Message: $MESSAGE"
echo ""

# Severity-specific output
case "$SEVERITY" in
    "CRITICAL")
        echo "⚠️  CRITICAL: Immediate action required!"
        echo "   Check: $INCIDENT_DIR/$ERROR_ID.md"
        ;;
    "HIGH")
        echo "⚠️  HIGH: Urgent attention needed"
        echo "   Check: $INCIDENT_DIR/$ERROR_ID.md"
        ;;
    "MEDIUM")
        echo "⚠️  MEDIUM: Address within 24 hours"
        ;;
    "LOW")
        echo "ℹ️  LOW: Address when convenient"
        ;;
esac

echo ""
echo "Logged to: $ERROR_LOG"
