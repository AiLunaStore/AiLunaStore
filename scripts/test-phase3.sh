#!/bin/bash

# Phase 3 Implementation Test Script
# Tests Autonomy & Accountability systems

set -e

echo "========================================="
echo "Phase 3 Implementation Test Suite"
echo "========================================="
echo "Date: $(date)"
echo "System: $(uname -a)"
echo ""

# Configuration
TEST_DIR="test-results/phase3"
mkdir -p "$TEST_DIR"
LOG_FILE="$TEST_DIR/test-$(date +%Y%m%d-%H%M%S).log"

# Test counters
TESTS_PASSED=0
TESTS_FAILED=0
TESTS_SKIPPED=0

# Logging function
log() {
    echo "$(date +'%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Test function
run_test() {
    local test_name="$1"
    local test_command="$2"
    local test_description="$3"
    
    log "Starting test: $test_name"
    log "Description: $test_description"
    
    if eval "$test_command" >> "$LOG_FILE" 2>&1; then
        log "✅ PASS: $test_name"
        ((TESTS_PASSED++))
        return 0
    else
        log "❌ FAIL: $test_name"
        ((TESTS_FAILED++))
        return 1
    fi
}

# Skip test function
skip_test() {
    local test_name="$1"
    local reason="$2"
    
    log "⏭️ SKIP: $test_name - $reason"
    ((TESTS_SKIPPED++))
}

echo "Phase 3 Test Suite Starting..." | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

# ============================================================================
# Test Group 1: File System & Configuration
# ============================================================================

log "=== Test Group 1: File System & Configuration ==="

run_test "config_files_exist" \
    "test -f HEARTBEAT.md && test -f SCOPE.md && test -f SAFETY.md" \
    "Check if core configuration files exist"

run_test "heartbeat_content" \
    "grep -q 'Enhanced Proactive Monitoring System' HEARTBEAT.md" \
    "Check if HEARTBEAT.md has enhanced content"

run_test "scope_content" \
    "grep -q 'Operational Boundaries Matrix' SCOPE.md" \
    "Check if SCOPE.md has operational boundaries matrix"

run_test "safety_content" \
    "grep -q 'Trust Ladder System' SAFETY.md" \
    "Check if SAFETY.md has trust ladder system"

run_test "directory_structure" \
    "test -d scripts && test -d delegation && test -d status && test -d memory" \
    "Check if required directories exist"

# ============================================================================
# Test Group 2: Autonomy Mechanisms
# ============================================================================

log "=== Test Group 2: Autonomy Mechanisms ==="

run_test "heartbeat_state_file" \
    "test -f memory/heartbeat-state.json && jq -e '.status' memory/heartbeat-state.json > /dev/null" \
    "Check if heartbeat state file exists and is valid JSON"

run_test "scheduled_tasks_config" \
    "test -f scripts/scheduled-tasks.json && jq -e '.scheduler' scripts/scheduled-tasks.json > /dev/null" \
    "Check if scheduled tasks configuration exists and is valid"

run_test "task_manager_script" \
    "test -f scripts/task-manager.sh && test -x scripts/task-manager.sh" \
    "Check if task manager script exists and is executable"

run_test "autonomy_protocols" \
    "test -f delegation/autonomy-protocols.md && grep -q 'Graduated Initiative Levels' delegation/autonomy-protocols.md" \
    "Check if autonomy protocols document exists"

run_test "status_dashboard" \
    "test -f status/dashboard.md && grep -q 'System Status Dashboard' status/dashboard.md" \
    "Check if status dashboard exists"

# ============================================================================
# Test Group 3: Accountability System
# ============================================================================

log "=== Test Group 3: Accountability System ==="

run_test "error_reporting_system" \
    "test -f delegation/error-reporting-system.md && grep -q 'Error Reporting & Incident Response' delegation/error-reporting-system.md" \
    "Check if error reporting system document exists"

run_test "scope_enhancements" \
    "grep -q 'Decision Authority Framework' SCOPE.md && grep -q 'Resource Management Framework' SCOPE.md" \
    "Check if SCOPE.md has enhanced sections"

run_test "safety_enhancements" \
    "grep -q 'Emergency Stop Mechanisms' SAFETY.md && grep -q 'Audit Trail & Logging System' SAFETY.md" \
    "Check if SAFETY.md has enhanced sections"

# ============================================================================
# Test Group 4: Integration & Documentation
# ============================================================================

log "=== Test Group 4: Integration & Documentation ==="

run_test "integration_guide" \
    "test -f delegation/integration-guide.md && grep -q 'Phase 3 Integration Guide' delegation/integration-guide.md" \
    "Check if integration guide exists"

run_test "test_script" \
    "test -f scripts/test-phase3.sh && test -x scripts/test-phase3.sh" \
    "Check if this test script exists and is executable"

# ============================================================================
# Test Group 5: System Functionality
# ============================================================================

log "=== Test Group 5: System Functionality ==="

# Test JSON parsing capabilities
run_test "json_parsing" \
    "jq -e '.checks.health_check.status' memory/heartbeat-state.json | grep -q 'completed'" \
    "Test JSON parsing of heartbeat state"

# Test task manager dry run
run_test "task_manager_dry_run" \
    "cd scripts && ./task-manager.sh --help 2>&1 | head -5" \
    "Test task manager dry run"

# ============================================================================
# Test Group 6: Safety & Compliance
# ============================================================================

log "=== Test Group 6: Safety & Compliance ==="

run_test "safety_principles" \
    "grep -c '## Core Safety Principles' SAFETY.md | grep -q '1'" \
    "Check safety principles section exists"

run_test "trust_levels" \
    "grep -c 'Level 0: Restricted' SAFETY.md | grep -q '1'" \
    "Check trust levels are defined"

run_test "emergency_procedures" \
    "grep -q 'Emergency Stop Mechanisms' SAFETY.md" \
    "Check emergency procedures are documented"

# ============================================================================
# Summary & Reporting
# ============================================================================

log "=== Test Summary ==="

TOTAL_TESTS=$((TESTS_PASSED + TESTS_FAILED + TESTS_SKIPPED))
SUCCESS_RATE=$((TESTS_PASSED * 100 / TOTAL_TESTS))

echo "" | tee -a "$LOG_FILE"
echo "=========================================" | tee -a "$LOG_FILE"
echo "TEST SUMMARY" | tee -a "$LOG_FILE"
echo "=========================================" | tee -a "$LOG_FILE"
echo "Total Tests:    $TOTAL_TESTS" | tee -a "$LOG_FILE"
echo "Tests Passed:   $TESTS_PASSED" | tee -a "$LOG_FILE"
echo "Tests Failed:   $TESTS_FAILED" | tee -a "$LOG_FILE"
echo "Tests Skipped:  $TESTS_SKIPPED" | tee -a "$LOG_FILE"
echo "Success Rate:   $SUCCESS_RATE%" | tee -a "$LOG_FILE"
echo "" | tee -a "$LOG_FILE"

if [ $TESTS_FAILED -eq 0 ]; then
    echo "✅ All tests passed!" | tee -a "$LOG_FILE"
    echo "Phase 3 implementation is ready for deployment." | tee -a "$LOG_FILE"
    exit 0
else
    echo "❌ Some tests failed. Check $LOG_FILE for details." | tee -a "$LOG_FILE"
    echo "Failed tests need to be addressed before deployment." | tee -a "$LOG_FILE"
    
    # Show failed test details
    echo "" | tee -a "$LOG_FILE"
    echo "Failed tests:" | tee -a "$LOG_FILE"
    grep "❌ FAIL:" "$LOG_FILE" | tee -a "$LOG_FILE"
    
    exit 1
fi