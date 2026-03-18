#!/usr/bin/env python3
"""
Testing Framework for Hired AI System - Phase 4
Comprehensive test suite with NEW Phase 3 integration tests.
"""

import unittest
import subprocess
import os
import sys
import json
from datetime import datetime

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

class Phase3IntegrationTests(unittest.TestCase):
    """Test integration with NEW Phase 3 components."""
    
    def test_heartbeat_script_exists(self):
        """Test that heartbeat script exists and is executable."""
        script = f"{WORKSPACE}/autonomy/checks/heartbeat-check.sh"
        self.assertTrue(os.path.exists(script), "Heartbeat script not found")
        self.assertTrue(os.access(script, os.X_OK), "Heartbeat script not executable")
    
    def test_scope_checker_exists(self):
        """Test that scope checker exists and is executable."""
        script = f"{WORKSPACE}/accountability/scope/scope-check.sh"
        self.assertTrue(os.path.exists(script), "Scope checker not found")
        self.assertTrue(os.access(script, os.X_OK), "Scope checker not executable")
    
    def test_emergency_stop_exists(self):
        """Test that emergency stop script exists and is executable."""
        script = f"{WORKSPACE}/safety/emergency/emergency-stop.sh"
        self.assertTrue(os.path.exists(script), "Emergency stop script not found")
        self.assertTrue(os.access(script, os.X_OK), "Emergency stop script not executable")
    
    def test_trust_ladder_exists(self):
        """Test that trust ladder documentation exists."""
        doc = f"{WORKSPACE}/safety/trust/trust-ladder.md"
        self.assertTrue(os.path.exists(doc), "Trust ladder documentation not found")
    
    def test_autonomy_protocols_exist(self):
        """Test that autonomy protocols exist."""
        levels = f"{WORKSPACE}/autonomy/protocols/autonomy-levels.md"
        level_check = f"{WORKSPACE}/autonomy/protocols/level-check.sh"
        self.assertTrue(os.path.exists(levels), "Autonomy levels not found")
        self.assertTrue(os.path.exists(level_check), "Level check script not found")
    
    def test_scope_documentation_exists(self):
        """Test that scope documentation exists."""
        scope = f"{WORKSPACE}/accountability/scope/SCOPE.md"
        self.assertTrue(os.path.exists(scope), "SCOPE.md not found")
    
    def test_phase3_readmes_exist(self):
        """Test that all Phase 3 READMEs exist."""
        autonomy_readme = f"{WORKSPACE}/autonomy/README.md"
        accountability_readme = f"{WORKSPACE}/accountability/README.md"
        safety_readme = f"{WORKSPACE}/safety/README.md"
        
        self.assertTrue(os.path.exists(autonomy_readme), "Autonomy README not found")
        self.assertTrue(os.path.exists(accountability_readme), "Accountability README not found")
        self.assertTrue(os.path.exists(safety_readme), "Safety README not found")
    
    def test_scope_check_read_action(self):
        """Test scope checker allows read actions."""
        script = f"{WORKSPACE}/accountability/scope/scope-check.sh"
        result = subprocess.run(
            [script, "read", "memory/test.md"],
            capture_output=True,
            timeout=10
        )
        # Return code 0 means allowed
        self.assertEqual(result.returncode, 0, "Read action should be allowed")
    
    def test_emergency_stop_status(self):
        """Test emergency stop status command works."""
        script = f"{WORKSPACE}/safety/emergency/emergency-stop.sh"
        result = subprocess.run(
            [script, "status"],
            capture_output=True,
            timeout=10
        )
        self.assertEqual(result.returncode, 0, "Emergency status check should succeed")


class Phase4SystemTests(unittest.TestCase):
    """Test Phase 4 system components."""
    
    def test_workflow_engine_exists(self):
        """Test that workflow engine exists."""
        engine = f"{WORKSPACE}/system/workflows/engine.py"
        self.assertTrue(os.path.exists(engine), "Workflow engine not found")
    
    def test_health_checker_exists(self):
        """Test that health checker exists."""
        checker = f"{WORKSPACE}/system/monitoring/health_checker.py"
        self.assertTrue(os.path.exists(checker), "Health checker not found")
    
    def test_safety_validator_exists(self):
        """Test that safety validator exists."""
        validator = f"{WORKSPACE}/system/safety/validator.py"
        self.assertTrue(os.path.exists(validator), "Safety validator not found")
    
    def test_cost_optimizer_exists(self):
        """Test that cost optimizer exists."""
        optimizer = f"{WORKSPACE}/system/performance/optimizer.py"
        self.assertTrue(os.path.exists(optimizer), "Cost optimizer not found")
    
    def test_cache_exists(self):
        """Test that cache module exists."""
        cache = f"{WORKSPACE}/system/performance/cache.py"
        self.assertTrue(os.path.exists(cache), "Cache module not found")
    
    def test_budget_manager_exists(self):
        """Test that budget manager exists."""
        budget = f"{WORKSPACE}/system/performance/budget.py"
        self.assertTrue(os.path.exists(budget), "Budget manager not found")
    
    def test_dashboard_exists(self):
        """Test that dashboard exists."""
        dashboard = f"{WORKSPACE}/dashboard/ui/index.html"
        self.assertTrue(os.path.exists(dashboard), "Dashboard not found")


class IntegrationFlowTests(unittest.TestCase):
    """Test end-to-end integration flows."""
    
    def test_workflow_engine_imports(self):
        """Test that workflow engine can be imported."""
        sys.path.insert(0, f"{WORKSPACE}/system/workflows")
        try:
            from engine import WorkflowEngine, Phase3Integration
            self.assertTrue(True, "Workflow engine imported successfully")
        except ImportError as e:
            self.fail(f"Failed to import workflow engine: {e}")
    
    def test_health_checker_imports(self):
        """Test that health checker can be imported."""
        sys.path.insert(0, f"{WORKSPACE}/system/monitoring")
        try:
            from health_checker import HealthChecker, Phase3HealthIntegration
            self.assertTrue(True, "Health checker imported successfully")
        except ImportError as e:
            self.fail(f"Failed to import health checker: {e}")
    
    def test_safety_validator_imports(self):
        """Test that safety validator can be imported."""
        sys.path.insert(0, f"{WORKSPACE}/system/safety")
        try:
            from validator import SafetyValidator, Phase3SafetyIntegration
            self.assertTrue(True, "Safety validator imported successfully")
        except ImportError as e:
            self.fail(f"Failed to import safety validator: {e}")
    
    def test_phase3_integration_class(self):
        """Test Phase3Integration class methods."""
        sys.path.insert(0, f"{WORKSPACE}/system/workflows")
        from engine import Phase3Integration
        
        # Test get_trust_level
        level = Phase3Integration.get_trust_level()
        self.assertIn(level, ["L0", "L1", "L2", "L3", "L4"], "Trust level should be L0-L4")
        
        # Test check_emergency_status
        status = Phase3Integration.check_emergency_status()
        self.assertIn("emergency_active", status, "Emergency status should have 'emergency_active' key")


class TestRunner:
    """Run all tests and generate report."""
    
    def __init__(self):
        self.results = []
        self.start_time = None
        self.end_time = None
    
    def run_all(self) -> Dict[str, Any]:
        """Run all test suites."""
        self.start_time = datetime.now()
        
        # Create test suite
        loader = unittest.TestLoader()
        suite = unittest.TestSuite()
        
        # Add test classes
        suite.addTests(loader.loadTestsFromTestCase(Phase3IntegrationTests))
        suite.addTests(loader.loadTestsFromTestCase(Phase4SystemTests))
        suite.addTests(loader.loadTestsFromTestCase(IntegrationFlowTests))
        
        # Run tests
        runner = unittest.TextTestRunner(verbosity=2)
        result = runner.run(suite)
        
        self.end_time = datetime.now()
        
        # Compile results
        return {
            "timestamp": datetime.now().isoformat(),
            "duration_seconds": (self.end_time - self.start_time).total_seconds(),
            "tests_run": result.testsRun,
            "failures": len(result.failures),
            "errors": len(result.errors),
            "skipped": len(result.skipped),
            "success": result.wasSuccessful(),
            "failure_details": [
                {"test": str(test), "traceback": traceback}
                for test, traceback in result.failures + result.errors
            ]
        }
    
    def save_report(self, report: Dict[str, Any]):
        """Save test report to file."""
        report_dir = f"{WORKSPACE}/testing/reports"
        os.makedirs(report_dir, exist_ok=True)
        
        report_file = f"{report_dir}/test-report-{datetime.now().strftime('%Y-%m-%d-%H%M%S')}.json"
        
        with open(report_file, 'w') as f:
            json.dump(report, f, indent=2)
        
        return report_file


def run_tests():
    """Main entry point for running tests."""
    print("=" * 70)
    print("Hired AI System - Phase 4 Testing Framework")
    print("Testing Integration with NEW Phase 3 Components")
    print("=" * 70)
    
    runner = TestRunner()
    results = runner.run_all()
    
    print("\n" + "=" * 70)
    print("Test Summary")
    print("=" * 70)
    print(f"Tests Run: {results['tests_run']}")
    print(f"Failures: {results['failures']}")
    print(f"Errors: {results['errors']}")
    print(f"Skipped: {results['skipped']}")
    print(f"Duration: {results['duration_seconds']:.2f}s")
    print(f"Status: {'✅ PASSED' if results['success'] else '❌ FAILED'}")
    
    # Save report
    report_file = runner.save_report(results)
    print(f"\nReport saved to: {report_file}")
    
    return results['success']


if __name__ == '__main__':
    success = run_tests()
    sys.exit(0 if success else 1)
