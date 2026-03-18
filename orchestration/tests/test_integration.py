#!/usr/bin/env python3
"""
Test suite for the orchestration system.
"""

import asyncio
import sys
import time
from pathlib import Path

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from orchestration.core.orchestrator import Orchestrator, RiskLevel
from orchestration.core.task_graph import TaskGraphManager, Task
from orchestration.core.result_aggregator import ResultAggregator, AgentOutput
from orchestration.watchdog.supervisor import WatchdogSupervisor, TaskMonitor
from orchestration.watchdog.fallback_router import FallbackRouter
from orchestration.critique.critique_engine import SelfCritiqueLayer
from orchestration.critique.decision_gate import ReviewDecisionGate
from orchestration.metrics.logger import MetricsLogger


class TestWatchdog:
    """Test watchdog functionality."""
    
    def test_supervisor_initialization(self):
        """Test watchdog supervisor initialization."""
        supervisor = WatchdogSupervisor()
        assert supervisor is not None
        assert supervisor.config["default_timeout"] == 30
        print("✓ Watchdog supervisor initialization")
    
    def test_task_monitor(self):
        """Test task monitoring."""
        supervisor = WatchdogSupervisor()
        monitor = supervisor.register_task("test-1", "coding", "kimi-k2.5")
        
        assert monitor.task_id == "test-1"
        assert monitor.agent == "coding"
        assert monitor.state.value == "pending"
        
        supervisor.mark_running("test-1")
        assert monitor.state.value == "running"
        
        supervisor.mark_completed("test-1")
        assert monitor.state.value == "completed"
        print("✓ Task monitoring")
    
    def test_fallback_routing(self):
        """Test fallback model routing."""
        router = FallbackRouter()
        
        # Test coding fallback chain
        fallback = router.get_fallback("coding", "kimi-k2.5")
        assert fallback == "deepseek-coder"
        
        fallback2 = router.get_fallback("coding", "deepseek-coder")
        assert fallback2 == "gpt-4o-mini"
        
        # Test end of chain
        fallback3 = router.get_fallback("coding", "gpt-4o-mini")
        assert fallback3 is None
        
        print("✓ Fallback routing")


class TestTaskGraph:
    """Test task graph functionality."""
    
    def test_task_creation(self):
        """Test task creation."""
        task = Task(
            id="test-task",
            agent="coding",
            type="implementation",
            description="Test task",
            parallel=True,
            depends_on=[]
        )
        
        assert task.id == "test-task"
        assert task.agent == "coding"
        print("✓ Task creation")
    
    def test_task_graph_manager(self):
        """Test task graph manager."""
        manager = TaskGraphManager()
        
        # Add tasks
        manager.add_task(Task("task1", "research", "search", "Task 1", True, []))
        manager.add_task(Task("task2", "coding", "implement", "Task 2", True, []))
        manager.add_task(Task("task3", "research", "analyze", "Task 3", False, ["task1", "task2"]))
        
        # Get parallel groups
        groups = manager.get_parallel_groups()
        assert len(groups) == 2
        assert len(groups[0]) == 2  # task1 and task2
        assert len(groups[1]) == 1  # task3
        
        print("✓ Task graph manager")
    
    def test_critical_path(self):
        """Test critical path calculation."""
        manager = TaskGraphManager()
        
        manager.add_task(Task("a", "research", "search", "A", True, []))
        manager.add_task(Task("b", "coding", "implement", "B", True, ["a"]))
        manager.add_task(Task("c", "research", "analyze", "C", True, ["a"]))
        manager.add_task(Task("d", "coding", "test", "D", False, ["b", "c"]))
        
        critical_path = manager.get_critical_path()
        assert len(critical_path) >= 2
        
        print("✓ Critical path calculation")
    
    def test_parallel_speedup(self):
        """Test parallel speedup calculation."""
        manager = TaskGraphManager()
        
        # 4 tasks in 2 parallel groups
        manager.add_task(Task("t1", "research", "search", "T1", True, []))
        manager.add_task(Task("t2", "coding", "implement", "T2", True, []))
        manager.add_task(Task("t3", "research", "analyze", "T3", False, ["t1", "t2"]))
        manager.add_task(Task("t4", "coding", "test", "T4", False, ["t3"]))
        
        speedup = manager.calculate_parallel_speedup(1000)
        assert speedup > 1.0  # Should show speedup
        
        print("✓ Parallel speedup calculation")


class TestCritique:
    """Test critique and decision gate."""
    
    def test_self_critique(self):
        """Test self-critique layer."""
        critique = SelfCritiqueLayer()
        
        # Test with simple output
        output = {"result": "success", "data": "test"}
        context = {"requirements": ["requirement1"]}
        
        result = asyncio.run(critique.critique(output, context, "general"))
        
        assert "quality_score" in result
        assert "issues" in result
        print("✓ Self-critique layer")
    
    def test_decision_gate(self):
        """Test review decision gate."""
        gate = ReviewDecisionGate()
        
        # Test high-risk output (code)
        code_output = "def test(): pass"
        critique_result = {"quality_score": 0.9, "critical_issues": 0}
        
        decision = gate.decide(code_output, critique_result, "coding")
        assert decision["REVIEW_DECISION"] == "high_risk"
        print("✓ Decision gate (high risk)")
        
        # Test low-risk output (summary)
        summary_output = "This is a summary of findings."
        critique_result2 = {"quality_score": 0.95, "critical_issues": 0}
        
        decision2 = gate.decide(summary_output, critique_result2, "summary")
        assert decision2["REVIEW_DECISION"] == "low_risk"
        print("✓ Decision gate (low risk)")


class TestResultAggregator:
    """Test result aggregation."""
    
    def test_aggregation(self):
        """Test result aggregation."""
        aggregator = ResultAggregator()
        
        # Add outputs
        aggregator.add_output(AgentOutput("coding", "task1", "Code result", 0.9))
        aggregator.add_output(AgentOutput("research", "task2", "Research result", 0.85))
        
        # Test concatenate strategy
        result = aggregator.aggregate("concatenate")
        assert result["aggregated"] == True
        assert result["agent_count"] == 2
        print("✓ Result aggregation (concatenate)")
        
        # Test prioritize strategy
        result2 = aggregator.aggregate("prioritize")
        assert result2["selected_agent"] == "coding"  # Higher confidence
        print("✓ Result aggregation (prioritize)")


class TestOrchestrator:
    """Test main orchestrator."""
    
    async def test_simple_request(self):
        """Test simple request processing."""
        orch = Orchestrator()
        
        result = await orch.process_request(
            request="Create a Python function to add two numbers",
            context={"user": "test"}
        )
        
        assert result.request_id is not None
        assert result.output is not None
        assert result.metrics["total_latency_ms"] > 0
        print("✓ Simple request processing")
    
    async def test_complex_request(self):
        """Test complex request processing."""
        orch = Orchestrator()
        
        result = await orch.process_request(
            request="Research the best Python web frameworks and create a comparison script",
            context={"user": "test"}
        )
        
        assert result.request_id is not None
        assert result.metrics["total_latency_ms"] > 0
        # Complex requests should show parallel speedup
        assert result.metrics.get("parallel_speedup", 1.0) >= 1.0
        print("✓ Complex request processing")


class TestMetrics:
    """Test metrics logging."""
    
    def test_metrics_logger(self):
        """Test metrics logger."""
        import tempfile
        import os
        
        with tempfile.TemporaryDirectory() as tmpdir:
            logger = MetricsLogger(log_dir=tmpdir)
            
            # Start request
            metrics = logger.start_request("test-req-1")
            assert metrics.request_id == "test-req-1"
            
            # Log agent call
            logger.log_agent_call("coding", "kimi-k2.5", 1000, 500, 1000)
            assert logger.current_request.tokens_total_in == 500
            
            # End request
            final = logger.end_request(reviewed=True)
            assert final.total_latency_ms > 0
            assert final.reviewed == True
            
            print("✓ Metrics logging")


def run_tests():
    """Run all tests."""
    print("\n" + "="*60)
    print("ORCHESTRATION SYSTEM TEST SUITE")
    print("="*60 + "\n")
    
    tests_run = 0
    tests_passed = 0
    
    # Watchdog tests
    print("\n📊 Watchdog Tests")
    print("-" * 40)
    watchdog_tests = TestWatchdog()
    for name, method in watchdog_tests.__class__.__dict__.items():
        if name.startswith("test_"):
            tests_run += 1
            try:
                method(watchdog_tests)
                tests_passed += 1
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    # Task graph tests
    print("\n📋 Task Graph Tests")
    print("-" * 40)
    task_tests = TestTaskGraph()
    for name, method in task_tests.__class__.__dict__.items():
        if name.startswith("test_"):
            tests_run += 1
            try:
                method(task_tests)
                tests_passed += 1
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    # Critique tests
    print("\n🔍 Critique Tests")
    print("-" * 40)
    critique_tests = TestCritique()
    for name, method in critique_tests.__class__.__dict__.items():
        if name.startswith("test_"):
            tests_run += 1
            try:
                method(critique_tests)
                tests_passed += 1
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    # Result aggregator tests
    print("\n🔄 Result Aggregator Tests")
    print("-" * 40)
    agg_tests = TestResultAggregator()
    for name, method in agg_tests.__class__.__dict__.items():
        if name.startswith("test_"):
            tests_run += 1
            try:
                method(agg_tests)
                tests_passed += 1
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    # Orchestrator tests
    print("\n🎯 Orchestrator Tests")
    print("-" * 40)
    orch_tests = TestOrchestrator()
    for name, method in orch_tests.__class__.__dict__.items():
        if name.startswith("test_"):
            tests_run += 1
            try:
                asyncio.run(method(orch_tests))
                tests_passed += 1
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    # Metrics tests
    print("\n📈 Metrics Tests")
    print("-" * 40)
    metrics_tests = TestMetrics()
    for name, method in metrics_tests.__class__.__dict__.items():
        if name.startswith("test_"):
            tests_run += 1
            try:
                method(metrics_tests)
                tests_passed += 1
            except Exception as e:
                print(f"✗ {name}: {e}")
    
    # Summary
    print("\n" + "="*60)
    print(f"TEST SUMMARY: {tests_passed}/{tests_run} passed")
    print("="*60 + "\n")
    
    return tests_passed == tests_run


if __name__ == "__main__":
    success = run_tests()
    sys.exit(0 if success else 1)
