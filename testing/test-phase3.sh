#!/bin/bash
# Phase 3 Test Suite
# Purpose: Integrated testing that ACTUALLY RUNS
# Usage: ./test-phase3.sh [component]

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
TEST_LOG="$WORKSPACE/testing/phase3-test-results.log"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Ensure test log directory
mkdir -p "$WORKSPACE/testing"

# Test counter
TESTS_RUN=0
TESTS_PASSED=0
TESTS_FAILED=0

# Test function
run_test() {
    local name="$1"
    local command="$2"
    
    TESTS_RUN=$((TESTS_RUN + 1))
    echo -n "Testing $name... "
    
    if eval "$command" > /dev/null 2>&1; then
        echo -e "${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "[PASS] $name" >> "$TEST_LOG"
        return 0
    else
        echo -e "${RED}FAIL${NC}"
        TESTS_FAILED=$((TESTS_FAILED + 1))
        echo "[FAIL] $name" >> "$TEST_LOG"
        return 1
    fi
}

# Test Autonomy Components
test_autonomy() {
    echo "=== Testing Autonomy System ==="
    echo ""
    
    run_test "Heartbeat script exists" "test -f $WORKSPACE/autonomy/checks/heartbeat-check.sh"
    run_test "Heartbeat script is executable" "test -x $WORKSPACE/autonomy/checks/heartbeat-check.sh"
    run_test "Heartbeat state file exists" "test -f $WORKSPACE/autonomy/checks/heartbeat-state.json"
    run_test "Task runner exists" "test -f $WORKSPACE/autonomy/tasks/task-runner.sh"
    run_test "Tasks config exists" "test -f $WORKSPACE/autonomy/tasks/tasks.json"
    run_test "Autonomy levels doc exists" "test -f $WORKSPACE/autonomy/protocols/autonomy-levels.md"
    run_test "Level check script exists" "test -f $WORKSPACE/autonomy/protocols/level-check.sh"
    run_test "Level state exists" "test -f $WORKSPACE/autonomy/protocols/level-state.json"
    
    echo ""
}

# Test Accountability Components
test_accountability() {
    echo "=== Testing Accountability System ==="
    echo ""
    
    run_test "SCOPE.md exists" "test -f $WORKSPACE/accountability/scope/SCOPE.md"
    run_test "Scope quick ref exists" "test -f $WORKSPACE/accountability/scope/scope-quick-ref.md"
    run_test "Scope check script exists" "test -f $WORKSPACE/accountability/scope/scope-check.sh"
    run_test "Error report script exists" "test -f $WORKSPACE/accountability/errors/error-report.sh"
    run_test "Incident response doc exists" "test -f $WORKSPACE/accountability/errors/incident-response.md"
    run_test "Performance metrics exists" "test -f $WORKSPACE/accountability/reviews/performance-metrics.json"
    run_test "Metrics dashboard exists" "test -f $WORKSPACE/accountability/reviews/metrics-dashboard.md"
    
    echo ""
}

# Test Safety Components
test_safety() {
    echo "=== Testing Safety System ==="
    echo ""
    
    run_test "Trust ladder doc exists" "test -f $WORKSPACE/safety/trust/trust-ladder.md"
    run_test "Trust check script exists" "test -f $WORKSPACE/safety/trust/trust-check.sh"
    run_test "Trust state exists" "test -f $WORKSPACE/safety/trust/trust-state.json"
    run_test "Emergency stop script exists" "test -f $WORKSPACE/safety/emergency/emergency-stop.sh"
    run_test "Emergency procedures exist" "test -f $WORKSPACE/safety/emergency/emergency-procedures.md"
    run_test "Emergency status exists" "test -f $WORKSPACE/safety/emergency/emergency-status.json"
    run_test "Audit viewer exists" "test -f $WORKSPACE/safety/audit/audit-viewer.sh"
    run_test "Audit report exists" "test -f $WORKSPACE/safety/audit/audit-report.sh"
    
    echo ""
}

# Test Functional Components
test_functional() {
    echo "=== Testing Functional Components ==="
    echo ""
    
    # Test scope check (returns 0 for allowed, 2 for requires approval, 1 for not allowed)
    run_test "Scope check returns valid result" "$WORKSPACE/accountability/scope/scope-check.sh read memory/test.md"
    
    # Test trust check
    run_test "Trust check returns valid result" "$WORKSPACE/safety/trust/trust-check.sh --status"
    
    # Test level check
    run_test "Level check returns valid result" "$WORKSPACE/autonomy/protocols/level-check.sh"
    
    # Test emergency status
    run_test "Emergency status returns valid result" "$WORKSPACE/safety/emergency/emergency-stop.sh status"
    
    echo ""
}

# Test Integration
test_integration() {
    echo "=== Testing Integration ==="
    echo ""
    
    # Verify autonomy level matches trust level
    local auto_level=$(grep -o '"current_level": "[^"]*"' "$WORKSPACE/autonomy/protocols/level-state.json" | cut -d'"' -f4)
    local trust_level=$(grep -o '"current_level": "[^"]*"' "$WORKSPACE/safety/trust/trust-state.json" | cut -d'"' -f4)
    
    if [ "$auto_level" == "$trust_level" ]; then
        echo -e "Autonomy/Trust level alignment... ${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "Autonomy/Trust level alignment... ${RED}FAIL${NC}"
        echo "  Autonomy: $auto_level, Trust: $trust_level"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    # Verify scope matches autonomy level
    if grep -q "$auto_level" "$WORKSPACE/accountability/scope/SCOPE.md"; then
        echo -e "Scope/Autonomy alignment... ${GREEN}PASS${NC}"
        TESTS_PASSED=$((TESTS_PASSED + 1))
    else
        echo -e "Scope/Autonomy alignment... ${YELLOW}WARN${NC}"
        echo "  Scope doesn't explicitly mention $auto_level"
    fi
    TESTS_RUN=$((TESTS_RUN + 1))
    
    echo ""
}

# Main test runner
main() {
    echo "================================"
    echo "Phase 3 Test Suite"
    echo "================================"
    echo ""
    echo "Started: $(date '+%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Clear previous test log
    echo "Phase 3 Test Results - $(date)" > "$TEST_LOG"
    echo "================================" >> "$TEST_LOG"
    echo "" >> "$TEST_LOG"
    
    case "${1:-all}" in
        autonomy)
            test_autonomy
            ;;
        accountability)
            test_accountability
            ;;
        safety)
            test_safety
            ;;
        functional)
            test_functional
            ;;
        integration)
            test_integration
            ;;
        all|*)
            test_autonomy
            test_accountability
            test_safety
            test_functional
            test_integration
            ;;
    esac
    
    # Summary
    echo "================================"
    echo "Test Summary"
    echo "================================"
    echo "Tests Run: $TESTS_RUN"
    echo -e "Tests Passed: ${GREEN}$TESTS_PASSED${NC}"
    echo -e "Tests Failed: ${RED}$TESTS_FAILED${NC}"
    echo ""
    
    if [ $TESTS_FAILED -eq 0 ]; then
        echo -e "${GREEN}✅ All tests passed!${NC}"
        exit 0
    else
        echo -e "${RED}❌ Some tests failed${NC}"
        echo "See $TEST_LOG for details"
        exit 1
    fi
}

main "$@"
