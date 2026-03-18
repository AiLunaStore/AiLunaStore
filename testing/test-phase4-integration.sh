#!/bin/bash
# Quick Integration Test Script
# Tests Phase 4 integration with NEW Phase 3 components

set -e

WORKSPACE="/Users/levinolonan/.openclaw/workspace"
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

PASSED=0
FAILED=0

test_header() {
    echo ""
    echo "========================================"
    echo "$1"
    echo "========================================"
}

test_pass() {
    echo -e "${GREEN}✓ PASS${NC}: $1"
    ((PASSED++))
}

test_fail() {
    echo -e "${RED}✗ FAIL${NC}: $1"
    ((FAILED++))
}

test_warn() {
    echo -e "${YELLOW}⚠ WARN${NC}: $1"
}

# Test Phase 3 Components Exist
test_header "Phase 3 Component Existence Tests"

if [ -f "$WORKSPACE/autonomy/checks/heartbeat-check.sh" ]; then
    test_pass "heartbeat-check.sh exists"
else
    test_fail "heartbeat-check.sh not found"
fi

if [ -f "$WORKSPACE/accountability/scope/scope-check.sh" ]; then
    test_pass "scope-check.sh exists"
else
    test_fail "scope-check.sh not found"
fi

if [ -f "$WORKSPACE/safety/emergency/emergency-stop.sh" ]; then
    test_pass "emergency-stop.sh exists"
else
    test_fail "emergency-stop.sh not found"
fi

if [ -f "$WORKSPACE/safety/trust/trust-ladder.md" ]; then
    test_pass "trust-ladder.md exists"
else
    test_fail "trust-ladder.md not found"
fi

# Test Phase 4 Components Exist
test_header "Phase 4 Component Existence Tests"

if [ -f "$WORKSPACE/system/workflows/engine.py" ]; then
    test_pass "engine.py exists"
else
    test_fail "engine.py not found"
fi

if [ -f "$WORKSPACE/system/monitoring/health_checker.py" ]; then
    test_pass "health_checker.py exists"
else
    test_fail "health_checker.py not found"
fi

if [ -f "$WORKSPACE/system/safety/validator.py" ]; then
    test_pass "validator.py exists"
else
    test_fail "validator.py not found"
fi

if [ -f "$WORKSPACE/dashboard/ui/index.html" ]; then
    test_pass "dashboard index.html exists"
else
    test_fail "dashboard index.html not found"
fi

# Test Phase 3 Scripts Executable
test_header "Phase 3 Script Execution Tests"

if [ -x "$WORKSPACE/autonomy/checks/heartbeat-check.sh" ]; then
    test_pass "heartbeat-check.sh is executable"
else
    test_warn "heartbeat-check.sh not executable (may need chmod +x)"
fi

if [ -x "$WORKSPACE/accountability/scope/scope-check.sh" ]; then
    test_pass "scope-check.sh is executable"
else
    test_warn "scope-check.sh not executable (may need chmod +x)"
fi

# Test Scope Check Functionality
test_header "Scope Check Functionality Tests"

cd "$WORKSPACE"

# Test read action (should be allowed - return 0)
if ./accountability/scope/scope-check.sh read memory/test.md > /dev/null 2>&1; then
    test_pass "scope-check allows read action"
else
    test_fail "scope-check failed on read action"
fi

# Test emergency status
test_header "Emergency Stop Tests"

if ./safety/emergency/emergency-stop.sh status > /dev/null 2>&1; then
    test_pass "emergency-stop.sh status works"
else
    test_fail "emergency-stop.sh status failed"
fi

# Test Python Module Imports
test_header "Python Module Import Tests"

cd "$WORKSPACE"

if python3 -c "import sys; sys.path.insert(0, 'system/workflows'); from engine import WorkflowEngine, Phase3Integration; print('OK')" 2>/dev/null | grep -q "OK"; then
    test_pass "WorkflowEngine imports successfully"
else
    test_fail "WorkflowEngine import failed"
fi

if python3 -c "import sys; sys.path.insert(0, 'system/monitoring'); from health_checker import HealthChecker, Phase3HealthIntegration; print('OK')" 2>/dev/null | grep -q "OK"; then
    test_pass "HealthChecker imports successfully"
else
    test_fail "HealthChecker import failed"
fi

if python3 -c "import sys; sys.path.insert(0, 'system/safety'); from validator import SafetyValidator, Phase3SafetyIntegration; print('OK')" 2>/dev/null | grep -q "OK"; then
    test_pass "SafetyValidator imports successfully"
else
    test_fail "SafetyValidator import failed"
fi

# Test Performance Modules
test_header "Performance Module Tests"

if python3 -c "import sys; sys.path.insert(0, 'system/performance'); from optimizer import CostOptimizer; print('OK')" 2>/dev/null | grep -q "OK"; then
    test_pass "CostOptimizer imports successfully"
else
    test_fail "CostOptimizer import failed"
fi

if python3 -c "import sys; sys.path.insert(0, 'system/performance'); from cache import SemanticCache; print('OK')" 2>/dev/null | grep -q "OK"; then
    test_pass "SemanticCache imports successfully"
else
    test_fail "SemanticCache import failed"
fi

if python3 -c "import sys; sys.path.insert(0, 'system/performance'); from budget import BudgetManager; print('OK')" 2>/dev/null | grep -q "OK"; then
    test_pass "BudgetManager imports successfully"
else
    test_fail "BudgetManager import failed"
fi

# Summary
test_header "Test Summary"
echo "Passed: $PASSED"
echo "Failed: $FAILED"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✅ All tests passed!${NC}"
    exit 0
else
    echo -e "${RED}❌ Some tests failed${NC}"
    exit 1
fi
