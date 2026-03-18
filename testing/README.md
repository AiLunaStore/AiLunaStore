# Testing Framework - Phase 4

Comprehensive testing framework for the Hired AI system with full Phase 3 integration testing.

## Test Structure

```
testing/
├── README.md
├── framework/
│   └── runner.py          # Main test runner
├── test-phase4-integration.sh  # Quick shell-based tests
├── unit/                  # Unit tests (future)
├── integration/           # Integration tests (future)
└── reports/               # Test reports
```

## Running Tests

### Quick Integration Tests
```bash
cd /Users/levinolonan/.openclaw/workspace
./testing/test-phase4-integration.sh
```

### Python Test Suite
```bash
cd /Users/levinolonan/.openclaw/workspace
python3 testing/framework/runner.py
```

### Individual Component Tests

#### Test Workflow Engine
```bash
cd /Users/levinolonan/.openclaw/workspace/system/workflows
python3 engine.py
```

#### Test Health Checker
```bash
cd /Users/levinolonan/.openclaw/workspace/system/monitoring
python3 health_checker.py
```

#### Test Safety Validator
```bash
cd /Users/levinolonan/.openclaw/workspace/system/safety
python3 validator.py
```

## Test Coverage

### Phase 3 Integration Tests
- ✅ Heartbeat script exists and is executable
- ✅ Scope checker exists and is executable
- ✅ Emergency stop exists and is executable
- ✅ Trust ladder documentation exists
- ✅ Autonomy protocols exist
- ✅ Scope documentation exists
- ✅ Phase 3 READMEs exist
- ✅ Scope check functionality (read actions)
- ✅ Emergency stop status command

### Phase 4 System Tests
- ✅ Workflow engine exists
- ✅ Health checker exists
- ✅ Safety validator exists
- ✅ Cost optimizer exists
- ✅ Cache module exists
- ✅ Budget manager exists
- ✅ Dashboard exists

### Integration Flow Tests
- ✅ Workflow engine imports
- ✅ Health checker imports
- ✅ Safety validator imports
- ✅ Phase3Integration class methods
- ✅ Trust level retrieval
- ✅ Emergency status check

### Performance Module Tests
- ✅ CostOptimizer imports
- ✅ SemanticCache imports
- ✅ BudgetManager imports

## Test Results

Tests generate JSON reports in `testing/reports/`:

```json
{
  "timestamp": "2026-03-16T00:00:00",
  "duration_seconds": 5.23,
  "tests_run": 20,
  "failures": 0,
  "errors": 0,
  "skipped": 0,
  "success": true
}
```

## Continuous Integration

To run tests automatically:

```bash
# Add to crontab for daily testing
0 9 * * * cd /Users/levinolonan/.openclaw/workspace && python3 testing/framework/runner.py >> testing/reports/cron.log 2>&1
```

## Writing New Tests

### Python Unit Test Example
```python
import unittest
from testing.framework.runner import WORKSPACE

class MyTests(unittest.TestCase):
    def test_something(self):
        self.assertTrue(True)

if __name__ == '__main__':
    unittest.main()
```

### Shell Test Example
```bash
#!/bin/bash
source testing/test-phase4-integration.sh

test_header "My New Tests"

if [ condition ]; then
    test_pass "Test description"
else
    test_fail "Test description"
fi
```

---

**Status**: Operational  
**Phase**: 4E - Testing Framework  
**Last Updated**: 2026-03-16
