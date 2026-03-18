#!/bin/bash
# Scope Check Script
# Purpose: Validate if an action is within scope
# Usage: ./scope-check.sh <action> [target]

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
SCOPE_FILE="$WORKSPACE/accountability/scope/SCOPE.md"
LEVEL_FILE="$WORKSPACE/autonomy/protocols/level-state.json"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get current autonomy level
get_level() {
    if [ -f "$LEVEL_FILE" ]; then
        grep -o '"current_level": "[^"]*"' "$LEVEL_FILE" | cut -d'"' -f4
    else
        echo "L2"
    fi
}

# Check if action is allowed
check_action() {
    local action="$1"
    local target="$2"
    local level=$(get_level)
    
    echo "=== Scope Check ==="
    echo "Action: $action"
    echo "Target: ${target:-N/A}"
    echo "Autonomy Level: $level"
    echo ""
    
    # Define allowed actions by level
    case "$level" in
        "L0")
            # L0: Read only
            case "$action" in
                "read"|"view"|"check"|"status")
                    echo -e "${GREEN}✅ ALLOWED${NC} at $level"
                    return 0
                    ;;
                *)
                    echo -e "${RED}❌ NOT ALLOWED${NC} at $level"
                    echo "   Requires: L1 or higher"
                    return 1
                    ;;
            esac
            ;;
            
        "L1")
            # L1: Read + write logs
            case "$action" in
                "read"|"view"|"check"|"status"|"log"|"write_log")
                    echo -e "${GREEN}✅ ALLOWED${NC} at $level"
                    return 0
                    ;;
                "write"|"create")
                    if [[ "$target" == *"memory/"* ]] || [[ "$target" == *"knowledge/"* ]] || [[ "$target" == *"skills/"* ]]; then
                        echo -e "${GREEN}✅ ALLOWED${NC} at $level (to memory/knowledge/skills)"
                        return 0
                    else
                        echo -e "${YELLOW}⚠️  REQUIRES APPROVAL${NC} at $level"
                        echo "   Target outside standard directories"
                        return 2
                    fi
                    ;;
                *)
                    echo -e "${RED}❌ NOT ALLOWED${NC} at $level"
                    echo "   Requires: L2 or higher"
                    return 1
                    ;;
            esac
            ;;
            
        "L2"|"L3"|"L4")
            # L2+: Most actions allowed with conditions
            case "$action" in
                "read"|"view"|"check"|"status"|"log"|"write_log")
                    echo -e "${GREEN}✅ ALLOWED${NC} at $level"
                    return 0
                    ;;
                "write"|"create"|"edit")
                    if [[ "$target" == *"memory/"* ]] || [[ "$target" == *"knowledge/"* ]] || [[ "$target" == *"skills/"* ]] || [[ "$target" == *"metrics/"* ]]; then
                        echo -e "${GREEN}✅ ALLOWED${NC} at $level"
                        return 0
                    else
                        echo -e "${YELLOW}⚠️  REQUIRES APPROVAL${NC} at $level"
                        echo "   Target: $target"
                        return 2
                    fi
                    ;;
                "delete"|"remove"|"trash")
                    echo -e "${YELLOW}⚠️  REQUIRES APPROVAL${NC} at $level"
                    echo "   Use 'trash' instead of 'rm' when possible"
                    return 2
                    ;;
                "execute"|"run"|"exec")
                    echo -e "${GREEN}✅ ALLOWED${NC} at $level (safe commands)"
                    echo "   Note: Elevated commands still require approval"
                    return 0
                    ;;
                "send"|"post"|"message"|"email"|"tweet")
                    if [ "$level" == "L4" ]; then
                        echo -e "${GREEN}✅ ALLOWED${NC} at $level"
                        return 0
                    else
                        echo -e "${YELLOW}⚠️  REQUIRES APPROVAL${NC} at $level"
                        echo "   External communications need explicit permission"
                        return 2
                    fi
                    ;;
                "schedule"|"task"|"cron")
                    if [ "$level" == "L2" ] || [ "$level" == "L3" ] || [ "$level" == "L4" ]; then
                        echo -e "${GREEN}✅ ALLOWED${NC} at $level"
                        return 0
                    else
                        echo -e "${YELLOW}⚠️  REQUIRES APPROVAL${NC} at $level"
                        return 2
                    fi
                    ;;
                *)
                    echo -e "${YELLOW}⚠️  UNCLEAR${NC} - Check SCOPE.md"
                    echo "   Action not in standard list"
                    return 2
                    ;;
            esac
            ;;
            
        *)
            echo -e "${RED}❌ UNKNOWN LEVEL${NC}: $level"
            return 1
            ;;
    esac
}

# Main
main() {
    if [ $# -lt 1 ]; then
        echo "Usage: $0 <action> [target]"
        echo ""
        echo "Examples:"
        echo "  $0 read memory/test.md"
        echo "  $0 write knowledge/concepts/test.md"
        echo "  $0 delete old-file.txt"
        echo "  $0 send email"
        echo ""
        echo "Returns:"
        echo "  0 = Allowed"
        echo "  1 = Not allowed"
        echo "  2 = Requires approval"
        exit 1
    fi
    
    check_action "$1" "$2"
    exit $?
}

main "$@"
