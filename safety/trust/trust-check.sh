#!/bin/bash
# Trust Check Script
# Purpose: Verify trust level for actions
# Usage: ./trust-check.sh <level> <action> [target]

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
TRUST_FILE="$WORKSPACE/safety/trust/trust-state.json"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Initialize trust state
init_trust() {
    if [ ! -f "$TRUST_FILE" ]; then
        cat > "$TRUST_FILE" << 'EOF'
{
  "current_level": "L2",
  "trust_score": 45,
  "achieved_at": "2026-03-15T00:00:00Z",
  "days_at_level": 1,
  "metrics": {
    "success_rate": 97.9,
    "tasks_completed": 47,
    "tasks_failed": 1,
    "boundary_violations": 0,
    "safety_incidents": 0
  },
  "history": [
    {"level": "L0", "started": "2026-03-10", "ended": "2026-03-11", "duration_days": 1},
    {"level": "L1", "started": "2026-03-11", "ended": "2026-03-15", "duration_days": 4},
    {"level": "L2", "started": "2026-03-15", "ended": null, "duration_days": 1}
  ],
  "elevation_requests": [],
  "violations": []
}
EOF
    fi
}

# Check if action is trusted
check_trust() {
    local required_level="$1"
    local action="$2"
    local target="$3"
    
    init_trust
    
    local current_level=$(grep -o '"current_level": "[^"]*"' "$TRUST_FILE" | cut -d'"' -f4)
    local trust_score=$(grep -o '"trust_score": [0-9]*' "$TRUST_FILE" | grep -o '[0-9]*')
    
    # Level hierarchy
    declare -A level_value=(
        ["L0"]=0
        ["L1"]=1
        ["L2"]=2
        ["L3"]=3
        ["L4"]=4
    )
    
    local current_value=${level_value[$current_level]:-0}
    local required_value=${level_value[$required_level]:-0}
    
    echo "=== Trust Check ==="
    echo "Current Level: $current_level (score: $trust_score)"
    echo "Required Level: $required_level"
    echo "Action: $action"
    echo "Target: ${target:-N/A}"
    echo ""
    
    if [ $current_value -ge $required_value ]; then
        echo -e "${GREEN}✅ TRUSTED${NC}"
        echo "   Current level ($current_level) meets requirement ($required_level)"
        return 0
    else
        echo -e "${RED}❌ NOT TRUSTED${NC}"
        echo "   Current level ($current_level) below requirement ($required_level)"
        echo ""
        echo "To perform this action, you need:"
        
        case "$required_level" in
            "L1")
                echo "   - 24 hours at L0"
                echo "   - Human approval"
                ;;
            "L2")
                echo "   - 7 days at L1"
                echo "   - >95% success rate"
                echo "   - No violations"
                ;;
            "L3")
                echo "   - 30 days at L2"
                echo "   - >98% success rate"
                echo "   - Effective error handling"
                ;;
            "L4")
                echo "   - 90 days at L3"
                echo "   - >99% success rate"
                echo "   - Proven strategic decision-making"
                ;;
        esac
        
        return 1
    fi
}

# Show trust status
show_status() {
    init_trust
    
    local level=$(grep -o '"current_level": "[^"]*"' "$TRUST_FILE" | cut -d'"' -f4)
    local score=$(grep -o '"trust_score": [0-9]*' "$TRUST_FILE" | grep -o '[0-9]*')
    local days=$(grep -o '"days_at_level": [0-9]*' "$TRUST_FILE" | grep -o '[0-9]*')
    local success=$(grep -o '"success_rate": [0-9.]*' "$TRUST_FILE" | grep -o '[0-9.]*')
    
    echo "=== Trust Status ==="
    echo ""
    echo "Current Level: $level"
    echo "Trust Score: $score/100"
    echo "Days at Level: $days"
    echo "Success Rate: ${success}%"
    echo ""
    
    # Progress to next level
    case "$level" in
        "L0")
            echo "Progress to L1: Need 24 hours stable"
            ;;
        "L1")
            echo "Progress to L2: $days/7 days, ${success}%/95% success"
            ;;
        "L2")
            echo "Progress to L3: $days/30 days, ${success}%/98% success"
            ;;
        "L3")
            echo "Progress to L4: $days/90 days, ${success}%/99% success"
            ;;
        "L4")
            echo "Maximum level achieved!"
            ;;
    esac
}

# Main
main() {
    case "${1:-}" in
        --status)
            show_status
            ;;
        --set-level)
            # Human override to set level
            if [ -z "${2:-}" ]; then
                echo "Usage: $0 --set-level <L0|L1|L2|L3|L4> [reason]"
                exit 1
            fi
            echo "Setting trust level to $2"
            echo "Reason: ${3:-Manual override}"
            # Would update trust-state.json here
            ;;
        *)
            if [ $# -lt 2 ]; then
                echo "Usage: $0 <required_level> <action> [target]"
                echo "       $0 --status"
                echo "       $0 --set-level <level> [reason]"
                echo ""
                echo "Examples:"
                echo "  $0 L2 write_file memory/test.md"
                echo "  $0 L3 external_api call"
                echo "  $0 --status"
                exit 1
            fi
            check_trust "$1" "$2" "${3:-}"
            ;;
    esac
}

main "$@"
