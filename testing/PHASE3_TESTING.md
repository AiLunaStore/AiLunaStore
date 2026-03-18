# Testing Phase 3

## Test Suite

Run all tests:
```bash
./testing/test-phase3.sh
```

Run specific component tests:
```bash
./testing/test-phase3.sh autonomy
./testing/test-phase3.sh accountability
./testing/test-phase3.sh safety
./testing/test-phase3.sh functional
./testing/test-phase3.sh integration
```

## Manual Testing

### Test Heartbeat
```bash
# Dry run
./autonomy/checks/heartbeat-check.sh --dry-run

# Actual run
./autonomy/checks/heartbeat-check.sh

# Check state
cat autonomy/checks/heartbeat-state.json
```

### Test Scope Check
```bash
# Test allowed action
./accountability/scope/scope-check.sh L2 read memory/test.md

# Test restricted action
./accountability/scope/scope-check.sh L0 write memory/test.md
```

### Test Trust Check
```bash
# Check status
./safety/trust/trust-check.sh --status

# Verify action
./safety/trust/trust-check.sh L2 write_file
```

### Test Emergency Stop
```bash
# Check status
./safety/emergency/emergency-stop.sh status

# Activate (test only)
./safety/emergency/emergency-stop.sh activate "Test emergency" PAUSE

# Deactivate
./safety/emergency/emergency-stop.sh deactivate "Test complete" "TestUser"
```

### Test Error Reporting
```bash
./accountability/errors/error-report.sh \
  --severity MEDIUM \
  --component "test" \
  --message "Test error report"
```

## Expected Results

All scripts should:
1. Execute without errors
2. Return appropriate exit codes
3. Create/update state files
4. Log actions appropriately

## Integration Tests

Verify components work together:

1. **Heartbeat → Tasks:** Heartbeat triggers task runner
2. **Scope → Autonomy:** Scope respects autonomy level
3. **Trust → Safety:** Trust level enables safety checks
4. **Error → Audit:** Errors are audited

## Continuous Testing

The heartbeat system runs tests automatically:
- Health checks every hour
- Task validation every 30 minutes
- Safety checks daily

## Test Coverage

| Component | Tests | Status |
|-----------|-------|--------|
| Autonomy | 8 | ✅ |
| Accountability | 7 | ✅ |
| Safety | 8 | ✅ |
| Functional | 4 | ✅ |
| Integration | 2 | ✅ |

---

**Last Updated:** 2026-03-16
