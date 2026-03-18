"""
Core orchestration engine for the multi-agent system.
Coordinates all layers from triage to final output.
"""

import asyncio
import json
import time
import uuid
from dataclasses import dataclass, field
from enum import Enum
from typing import Any, Dict, List, Optional, Callable
from datetime import datetime


class TaskStatus(Enum):
    PENDING = "pending"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    TIMEOUT = "timeout"
    RETRYING = "retrying"


class RiskLevel(Enum):
    LOW = "low_risk"
    HIGH = "high_risk"


@dataclass
class TaskResult:
    """Result from a task execution."""
    task_id: str
    agent: str
    status: TaskStatus
    output: Any
    latency_ms: int
    tokens_in: int
    tokens_out: int
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())
    error: Optional[str] = None
    fallback_used: bool = False


@dataclass
class OrchestrationResult:
    """Final result from the orchestration pipeline."""
    request_id: str
    output: Any
    metrics: Dict[str, Any]
    risk_level: RiskLevel
    reviewed: bool
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class TaskGraph:
    """Represents a task graph with parallel execution paths."""
    tasks: List[Dict[str, Any]]
    parallel_groups: List[List[str]]
    
    def get_parallel_tasks(self) -> List[List[Dict[str, Any]]]:
        """Get tasks grouped by parallel execution groups."""
        groups = []
        for group_ids in self.parallel_groups:
            group = [t for t in self.tasks if t["id"] in group_ids]
            groups.append(group)
        return groups
    
    def get_task_dependencies(self, task_id: str) -> List[str]:
        """Get dependencies for a specific task."""
        for task in self.tasks:
            if task["id"] == task_id:
                return task.get("depends_on", [])
        return []


class Orchestrator:
    """
    Main orchestration engine that coordinates all layers of the system.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.request_id = None
        self.metrics = {
            "start_time": None,
            "end_time": None,
            "total_latency_ms": 0,
            "agent_calls": {},
            "tokens_total": {"in": 0, "out": 0},
            "parallel_speedup": 1.0,
            "fallback_count": 0,
            "retry_count": 0
        }
        self.watchdog = None  # Will be initialized
        self.logger = None    # Will be initialized
        
    async def process_request(self, request: str, context: Optional[Dict] = None) -> OrchestrationResult:
        """
        Process a request through the entire orchestration pipeline.
        
        Args:
            request: The user request
            context: Additional context (user, channel, etc.)
            
        Returns:
            OrchestrationResult with output and metrics
        """
        self.request_id = str(uuid.uuid4())[:8]
        self.metrics["start_time"] = time.time()
        context = context or {}
        
        try:
            # Layer 2: Triage
            triage_result = await self._triage(request, context)
            
            # Layer 3: Orchestrator - Determine if planning needed
            needs_planning = triage_result.get("complexity") == "complex"
            
            if needs_planning:
                # Layer 4: Planner
                plan = await self._plan(request, triage_result, context)
                
                # Layer 5: Parallel Implementers
                implementation_results = await self._execute_parallel(plan, context)
            else:
                # Direct execution without planning
                implementation_results = await self._execute_direct(triage_result, context)
            
            # Layer 6: Self-Critique
            critique_result = await self._critique(implementation_results, context)
            
            # Layer 7: Review Decision Gate
            risk_level = await self._decision_gate(critique_result, implementation_results)
            
            # Layer 8: Final Reviewer (conditional)
            if risk_level == RiskLevel.HIGH:
                final_output = await self._review(implementation_results, critique_result, context)
                reviewed = True
            else:
                final_output = self._aggregate_results(implementation_results)
                reviewed = False
            
            # Calculate metrics
            self.metrics["end_time"] = time.time()
            self.metrics["total_latency_ms"] = int(
                (self.metrics["end_time"] - self.metrics["start_time"]) * 1000
            )
            
            return OrchestrationResult(
                request_id=self.request_id,
                output=final_output,
                metrics=self.metrics,
                risk_level=risk_level,
                reviewed=reviewed
            )
            
        except Exception as e:
            # Handle errors with watchdog
            return await self._handle_error(e, request, context)
    
    async def _triage(self, request: str, context: Dict) -> Dict:
        """
        Layer 2: Triage - Classify and route the request.
        """
        start_time = time.time()
        
        # Simulate triage (in real implementation, call TriageAgent)
        triage_result = {
            "request_type": self._classify_request(request),
            "priority": "medium",
            "complexity": "complex" if len(request) > 100 else "simple",
            "routed_to": "orchestrator",
            "capabilities_required": ["coding", "research"],
            "flags": []
        }
        
        latency = int((time.time() - start_time) * 1000)
        self._record_agent_call("triage", latency, 100, 200)
        
        return triage_result
    
    async def _plan(self, request: str, triage: Dict, context: Dict) -> TaskGraph:
        """
        Layer 4: Planner - Generate structured task plan.
        """
        start_time = time.time()
        
        # Simulate planning (in real implementation, call PlannerAgent)
        tasks = [
            {
                "id": "research",
                "agent": "research",
                "type": "research",
                "description": f"Research context for: {request[:50]}...",
                "parallel": True,
                "estimated_tokens": 2000
            },
            {
                "id": "code",
                "agent": "coding",
                "type": "coding",
                "description": f"Implement solution for: {request[:50]}...",
                "parallel": True,
                "estimated_tokens": 3000
            },
            {
                "id": "analysis",
                "agent": "research",
                "type": "analysis",
                "description": "Analyze and synthesize results",
                "depends_on": ["research", "code"],
                "parallel": False,
                "estimated_tokens": 1500
            }
        ]
        
        parallel_groups = [["research", "code"], ["analysis"]]
        
        latency = int((time.time() - start_time) * 1000)
        self._record_agent_call("planner", latency, 200, 500)
        
        return TaskGraph(tasks=tasks, parallel_groups=parallel_groups)
    
    async def _execute_parallel(self, plan: TaskGraph, context: Dict) -> List[TaskResult]:
        """
        Layer 5: Execute tasks in parallel where possible.
        """
        results = []
        completed_tasks = {}
        
        # Execute each parallel group
        for group in plan.get_parallel_tasks():
            # Check dependencies
            ready_tasks = []
            for task in group:
                deps = plan.get_task_dependencies(task["id"])
                if all(dep in completed_tasks for dep in deps):
                    ready_tasks.append(task)
            
            if ready_tasks:
                # Execute tasks in parallel
                group_results = await asyncio.gather(*[
                    self._execute_task(task, context) for task in ready_tasks
                ])
                
                for result in group_results:
                    results.append(result)
                    if result.status == TaskStatus.COMPLETED:
                        completed_tasks[result.task_id] = result
        
        # Calculate parallel speedup
        sequential_time = sum(r.latency_ms for r in results)
        parallel_time = max(
            [sum(r.latency_ms for r in results if r.task_id in group) 
             for group in plan.parallel_groups]
        ) if results else 0
        
        if parallel_time > 0:
            self.metrics["parallel_speedup"] = sequential_time / parallel_time
        
        return results
    
    async def _execute_direct(self, triage: Dict, context: Dict) -> List[TaskResult]:
        """
        Execute a simple task directly without planning.
        """
        agent_type = triage.get("request_type", "research")
        
        task = {
            "id": "direct",
            "agent": agent_type,
            "type": agent_type,
            "description": "Direct execution",
            "parallel": False
        }
        
        result = await self._execute_task(task, context)
        return [result]
    
    async def _execute_task(self, task: Dict, context: Dict) -> TaskResult:
        """
        Execute a single task with the appropriate agent.
        """
        start_time = time.time()
        agent_type = task.get("agent", "research")
        
        # Simulate task execution (in real implementation, call specific agent)
        await asyncio.sleep(0.1)  # Simulate work
        
        latency = int((time.time() - start_time) * 1000)
        tokens_in = task.get("estimated_tokens", 1000) // 2
        tokens_out = task.get("estimated_tokens", 1000)
        
        self._record_agent_call(agent_type, latency, tokens_in, tokens_out)
        
        return TaskResult(
            task_id=task["id"],
            agent=agent_type,
            status=TaskStatus.COMPLETED,
            output=f"Result from {agent_type} agent",
            latency_ms=latency,
            tokens_in=tokens_in,
            tokens_out=tokens_out
        )
    
    async def _critique(self, results: List[TaskResult], context: Dict) -> Dict:
        """
        Layer 6: Self-Critique - Check for errors and issues.
        """
        start_time = time.time()
        
        # Simulate critique (in real implementation, call CritiqueAgent)
        issues = []
        
        for result in results:
            if result.status != TaskStatus.COMPLETED:
                issues.append(f"Task {result.task_id} failed")
        
        critique_result = {
            "logical_errors": [],
            "hallucinations": [],
            "incomplete_tasks": issues,
            "inconsistencies": [],
            "overall_quality": "good" if not issues else "needs_review"
        }
        
        latency = int((time.time() - start_time) * 1000)
        self._record_agent_call("critique", latency, 300, 400)
        
        return critique_result
    
    async def _decision_gate(self, critique: Dict, results: List[TaskResult]) -> RiskLevel:
        """
        Layer 7: Review Decision Gate - Determine risk level.
        """
        # High risk criteria
        has_code = any(r.agent == "coding" for r in results)
        has_issues = len(critique.get("incomplete_tasks", [])) > 0
        is_complex = len(results) > 2
        
        if has_code or has_issues or is_complex:
            return RiskLevel.HIGH
        
        return RiskLevel.LOW
    
    async def _review(self, results: List[TaskResult], critique: Dict, context: Dict) -> Any:
        """
        Layer 8: Final Reviewer - High-level verification.
        """
        start_time = time.time()
        
        # Simulate review (in real implementation, call ReviewerAgent)
        reviewed_output = {
            "verified": True,
            "findings": critique,
            "results": [r.output for r in results],
            "approval": "approved"
        }
        
        latency = int((time.time() - start_time) * 1000)
        self._record_agent_call("reviewer", latency, 500, 800)
        
        return reviewed_output
    
    def _aggregate_results(self, results: List[TaskResult]) -> Any:
        """
        Aggregate results from multiple tasks.
        """
        return {
            "results": [r.output for r in results],
            "agents_used": list(set(r.agent for r in results)),
            "total_tasks": len(results)
        }
    
    def _classify_request(self, request: str) -> str:
        """
        Simple request classification.
        """
        request_lower = request.lower()
        
        if any(word in request_lower for word in ["code", "script", "function", "debug"]):
            return "coding"
        elif any(word in request_lower for word in ["search", "find", "research", "analyze"]):
            return "research"
        elif any(word in request_lower for word in ["automate", "organize", "schedule"]):
            return "automation"
        else:
            return "research"
    
    def _record_agent_call(self, agent: str, latency: int, tokens_in: int, tokens_out: int):
        """
        Record metrics for an agent call.
        """
        if agent not in self.metrics["agent_calls"]:
            self.metrics["agent_calls"][agent] = {
                "calls": 0,
                "total_latency_ms": 0,
                "tokens_in": 0,
                "tokens_out": 0
            }
        
        self.metrics["agent_calls"][agent]["calls"] += 1
        self.metrics["agent_calls"][agent]["total_latency_ms"] += latency
        self.metrics["agent_calls"][agent]["tokens_in"] += tokens_in
        self.metrics["agent_calls"][agent]["tokens_out"] += tokens_out
        
        self.metrics["tokens_total"]["in"] += tokens_in
        self.metrics["tokens_total"]["out"] += tokens_out
    
    async def _handle_error(self, error: Exception, request: str, context: Dict) -> OrchestrationResult:
        """
        Handle errors with watchdog recovery.
        """
        self.metrics["end_time"] = time.time()
        self.metrics["total_latency_ms"] = int(
            (self.metrics["end_time"] - self.metrics["start_time"]) * 1000
        )
        
        return OrchestrationResult(
            request_id=self.request_id or str(uuid.uuid4())[:8],
            output={"error": str(error), "request": request},
            metrics=self.metrics,
            risk_level=RiskLevel.HIGH,
            reviewed=True
        )
