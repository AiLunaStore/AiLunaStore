#!/bin/bash
# Level Check Script
# Purpose: Check current autonomy level and status
# Usage: ./level-check.sh [--detail]

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
STATE_FILE="$WORKSPACE/autonomy/protocols/level-state.json"

# Initialize state if missing
init_state() {
    if [ ! -f "$STATE_FILE" ]; then
        cat > "$STATE_FILE" << 'EOF'
{
  "current_level": "L2",
  "level_name": "Standard",
  "achieved_at": "2026-03-15T00:00:00Z",
  "days_at_level": 1,
  "target_level": "L3",
  "progress_percent": 3,
  "metrics": {
    "success_rate": 100.0,
    "tasks_completed": 15,
    "tasks_failed": 0,
    "boundary_violations": 0
  },
  "history": [
    {
      "level": "L0",
      "started": "2026-03-10T00:00:00Z",
      "ended": "2026-03-11T00:00:00Z",
      "duration_days": 1
    },
    {
      "level": "L1",
      "started": "2026-03-11T00:00:00Z",
      "ended": "2026-03-15T00:00:00Z",
      "duration_days": 4
    },
    {
      "level": "L2",
      "started": "2026-03-15T00:00:00Z",
      "ended": null,
      "duration_days": 1
    }
  ],
  "requirements": {
    "L3": {
      "min_days": 30,
      "min_success_rate": 98.0,
      "max_violations": 0
    }
  }
}
EOF
    fi
}

# Display current level
show_level() {
    local detail="${1:-false}"
    
    init_state
    
    local level=$(grep -o '"current_level": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
    local level_name=$(grep -o '"level_name": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
    local days=$(grep -o '"days_at_level": [0-9]*' "$STATE_FILE" | grep -o '[0-9]*')
    local target=$(grep -o '"target_level": "[^"]*"' "$STATE_FILE" | cut -d'"' -f4)
    local progress=$(grep -o '"progress_percent": [0-9]*' "$STATE_FILE" | grep -o '[0-9]*')
    
    echo "=== Autonomy Level Status ==="
    echo ""
    echo "Current Level: $level ($level_name)"
    echo "Days at Level: $days"
    echo "Target Level: $target"
    echo "Progress: $progress%"
    echo ""
    
    # Show level description
    case "$level" in
        "L0")
            echo "🔒 RESTRICTED MODE"
            echo "   All actions require human approval"
            ;;
        "L1")
            echo "📝 BASIC MODE"
            echo "   Limited autonomy with close supervision"
            ;;
        "L2")
            echo "⚙️  STANDARD MODE"
            echo "   Normal operation with routine autonomy"
            ;;
        "L3")
            echo "🚀 TRUSTED MODE"
            echo "   High autonomy with strategic oversight"
            ;;
        "L4")
            echo "🎯 AUTONOMOUS MODE"
            echo "   Full autonomy within defined boundaries"
            ;;
    esac
    
    if [ "$detail" == "true" ]; then
        echo ""
        echo "=== Detailed Metrics ==="
        
        local success_rate=$(grep -o '"success_rate": [0-9.]*' "$STATE_FILE" | grep -o '[0-9.]*')
        local completed=$(grep -o '"tasks_completed": [0-9]*' "$STATE_FILE" | grep -o '[0-9]*')
        local failed=$(grep -o '"tasks_failed": [0-9]*' "$STATE_FILE" | grep -o '[0-9]*')
        local violations=$(grep -o '"boundary_violations": [0-9]*' "$STATE_FILE" | grep -o '[0-9]*')
        
        echo "Success Rate: ${success_rate}%"
        echo "Tasks Completed: $completed"
        echo "Tasks Failed: $failed"
        echo "Boundary Violations: $violations"
        echo ""
        echo "=== Level History ==="
        
        # Parse and display history
        python3 << 'EOF' 2>/dev/null || echo "Install python3 for history display"
import json
with open('$STATE_FILE', 'r') as f:
    data = json.load(f)

for entry in data['history']:
    status = "← Current" if entry['ended'] is None else ""
    print(f"  {entry['level']}: {entry['duration_days']} days {status}")
EOF
    fi
}

# Main
main() {
    case "${1:-}" in
        --detail)
            show_level "true"
            ;;
        *)
            show_level "false"
            ;;
    esac
}

main "$@"
