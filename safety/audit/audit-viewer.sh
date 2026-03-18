#!/bin/bash
# Audit Viewer Script
# Purpose: Query audit logs for accountability
# Usage: ./audit-viewer.sh [options]

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
AUDIT_LOG="$WORKSPACE/safety/audit/audit-log.jsonl"

# Ensure audit log exists
mkdir -p "$WORKSPACE/safety/audit"
touch "$AUDIT_LOG"

# Show usage
usage() {
    echo "Audit Log Viewer"
    echo ""
    echo "Usage:"
    echo "  $0 --today              Show today's entries"
    echo "  $0 --recent [N]         Show last N entries (default: 20)"
    echo "  $0 --filter <type>      Filter by action type"
    echo "  $0 --user <name>        Filter by user"
    echo "  $0 --since <date>       Entries since date (YYYY-MM-DD)"
    echo "  $0 --summary            Daily summary"
    echo ""
    echo "Examples:"
    echo "  $0 --today"
    echo "  $0 --recent 50"
    echo "  $0 --filter write_file"
    echo "  $0 --since 2026-03-01"
}

# Show today's entries
show_today() {
    local today=$(date +%Y-%m-%d)
    echo "=== Audit Log: $today ==="
    echo ""
    
    grep "\"timestamp\": \"$today" "$AUDIT_LOG" 2>/dev/null | while read -r line; do
        echo "$line" | python3 -m json.tool 2>/dev/null || echo "$line"
        echo "---"
    done
    
    local count=$(grep -c "\"timestamp\": \"$today" "$AUDIT_LOG" 2>/dev/null || echo "0")
    echo ""
    echo "Total entries: $count"
}

# Show recent entries
show_recent() {
    local n="${1:-20}"
    echo "=== Last $n Audit Entries ==="
    echo ""
    
    tail -n "$n" "$AUDIT_LOG" | while read -r line; do
        # Parse and display
        local timestamp=$(echo "$line" | grep -o '"timestamp": "[^"]*"' | cut -d'"' -f4)
        local action=$(echo "$line" | grep -o '"action": "[^"]*"' | cut -d'"' -f4)
        local actor=$(echo "$line" | grep -o '"actor": "[^"]*"' | cut -d'"' -f4)
        local result=$(echo "$line" | grep -o '"result": "[^"]*"' | cut -d'"' -f4)
        
        echo "[$timestamp] $actor: $action → $result"
    done
}

# Filter by type
filter_by_type() {
    local filter="$1"
    echo "=== Audit Log: Filtered by '$filter' ==="
    echo ""
    
    grep "\"action\": \"$filter\"" "$AUDIT_LOG" 2>/dev/null | while read -r line; do
        echo "$line" | python3 -m json.tool 2>/dev/null || echo "$line"
        echo "---"
    done
}

# Filter by user
filter_by_user() {
    local user="$1"
    echo "=== Audit Log: Filtered by user '$user' ==="
    echo ""
    
    grep "\"actor\": \"$user\"" "$AUDIT_LOG" 2>/dev/null | while read -r line; do
        echo "$line" | python3 -m json.tool 2>/dev/null || echo "$line"
        echo "---"
    done
}

# Show entries since date
show_since() {
    local since_date="$1"
    echo "=== Audit Log: Since $since_date ==="
    echo ""
    
    while read -r line; do
        local timestamp=$(echo "$line" | grep -o '"timestamp": "[^"]*"' | cut -d'"' -f4)
        if [[ "$timestamp" > "$since_date" ]] || [[ "$timestamp" == "$since_date"* ]]; then
            echo "$line" | python3 -m json.tool 2>/dev/null || echo "$line"
            echo "---"
        fi
    done < "$AUDIT_LOG"
}

# Show summary
show_summary() {
    echo "=== Audit Summary ==="
    echo ""
    
    local total=$(wc -l < "$AUDIT_LOG" 2>/dev/null || echo "0")
    local today=$(date +%Y-%m-%d)
    local today_count=$(grep -c "\"timestamp\": \"$today" "$AUDIT_LOG" 2>/dev/null || echo "0")
    
    echo "Total entries: $total"
    echo "Today's entries: $today_count"
    echo ""
    
    # Action breakdown
    echo "Action breakdown:"
    cut -d'"' -f8 "$AUDIT_LOG" 2>/dev/null | sort | uniq -c | sort -rn | head -10
    
    echo ""
    echo "Actor breakdown:"
    cut -d'"' -f12 "$AUDIT_LOG" 2>/dev/null | sort | uniq -c | sort -rn | head -10
}

# Main
main() {
    case "${1:-}" in
        --today)
            show_today
            ;;
        --recent)
            show_recent "${2:-20}"
            ;;
        --filter)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 --filter <action_type>"
                exit 1
            fi
            filter_by_type "$2"
            ;;
        --user)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 --user <username>"
                exit 1
            fi
            filter_by_user "$2"
            ;;
        --since)
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 --since YYYY-MM-DD"
                exit 1
            fi
            show_since "$2"
            ;;
        --summary)
            show_summary
            ;;
        *)
            usage
            ;;
    esac
}

main "$@"
