"""
Task graph management for parallel execution.
"""

from typing import Any, Dict, List, Set, Optional
from dataclasses import dataclass, field
from enum import Enum


class TaskState(Enum):
    PENDING = "pending"
    READY = "ready"
    RUNNING = "running"
    COMPLETED = "completed"
    FAILED = "failed"
    SKIPPED = "skipped"


@dataclass
class Task:
    """Represents a single task in the task graph."""
    id: str
    agent: str
    type: str
    description: str
    parallel: bool = True
    depends_on: List[str] = field(default_factory=list)
    estimated_tokens: int = 1000
    state: TaskState = TaskState.PENDING
    result: Any = None
    error: Optional[str] = None
    
    def is_ready(self, completed_ids: Set[str]) -> bool:
        """Check if task is ready to execute (all dependencies met)."""
        return all(dep in completed_ids for dep in self.depends_on)
    
    def to_dict(self) -> Dict:
        """Convert task to dictionary."""
        return {
            "id": self.id,
            "agent": self.agent,
            "type": self.type,
            "description": self.description,
            "parallel": self.parallel,
            "depends_on": self.depends_on,
            "estimated_tokens": self.estimated_tokens,
            "state": self.state.value
        }


class TaskGraphManager:
    """
    Manages task graphs with parallel execution support.
    """
    
    def __init__(self):
        self.tasks: Dict[str, Task] = {}
        self.completed_ids: Set[str] = set()
        self.failed_ids: Set[str] = set()
    
    def add_task(self, task: Task) -> None:
        """Add a task to the graph."""
        self.tasks[task.id] = task
    
    def get_task(self, task_id: str) -> Optional[Task]:
        """Get a task by ID."""
        return self.tasks.get(task_id)
    
    def get_ready_tasks(self) -> List[Task]:
        """Get all tasks that are ready to execute."""
        ready = []
        for task in self.tasks.values():
            if task.state == TaskState.PENDING and task.is_ready(self.completed_ids):
                task.state = TaskState.READY
                ready.append(task)
        return ready
    
    def mark_completed(self, task_id: str, result: Any) -> None:
        """Mark a task as completed."""
        if task_id in self.tasks:
            self.tasks[task_id].state = TaskState.COMPLETED
            self.tasks[task_id].result = result
            self.completed_ids.add(task_id)
    
    def mark_failed(self, task_id: str, error: str) -> None:
        """Mark a task as failed."""
        if task_id in self.tasks:
            self.tasks[task_id].state = TaskState.FAILED
            self.tasks[task_id].error = error
            self.failed_ids.add(task_id)
    
    def get_parallel_groups(self) -> List[List[Task]]:
        """
        Group tasks into parallel execution groups.
        Tasks in the same group have no dependencies on each other.
        """
        groups = []
        remaining = set(self.tasks.keys())
        completed = set()
        
        while remaining:
            # Find all tasks that are ready (dependencies met)
            ready = [
                self.tasks[tid] for tid in remaining
                if self.tasks[tid].is_ready(completed)
            ]
            
            if not ready:
                # Deadlock detected
                break
            
            groups.append(ready)
            
            # Mark these tasks as completed for next iteration
            for task in ready:
                remaining.remove(task.id)
                completed.add(task.id)
        
        return groups
    
    def get_execution_order(self) -> List[List[str]]:
        """
        Get the execution order as groups of task IDs.
        Each group can be executed in parallel.
        """
        groups = self.get_parallel_groups()
        return [[task.id for task in group] for group in groups]
    
    def get_critical_path(self) -> List[str]:
        """
        Calculate the critical path (longest dependency chain).
        """
        # Build adjacency list
        graph = {tid: [] for tid in self.tasks}
        for task in self.tasks.values():
            for dep in task.depends_on:
                if dep in graph:
                    graph[dep].append(task.id)
        
        # Calculate longest path using DFS
        memo = {}
        
        def longest_path(task_id: str) -> int:
            if task_id in memo:
                return memo[task_id]
            
            if not graph[task_id]:
                memo[task_id] = 1
                return 1
            
            max_length = 1 + max(longest_path(child) for child in graph[task_id])
            memo[task_id] = max_length
            return max_length
        
        # Find the starting point (no dependencies)
        starts = [tid for tid, task in self.tasks.items() if not task.depends_on]
        
        if not starts:
            return []
        
        # Find the longest path
        critical_start = max(starts, key=longest_path)
        
        # Reconstruct the path
        path = [critical_start]
        current = critical_start
        
        while graph[current]:
            current = max(graph[current], key=longest_path)
            path.append(current)
        
        return path
    
    def estimate_total_time(self, avg_task_time_ms: int = 1000) -> int:
        """
        Estimate total execution time in milliseconds.
        Assumes parallel execution within groups.
        """
        groups = self.get_parallel_groups()
        # Each group takes the max time of its tasks
        return len(groups) * avg_task_time_ms
    
    def estimate_sequential_time(self, avg_task_time_ms: int = 1000) -> int:
        """
        Estimate time if all tasks were executed sequentially.
        """
        return len(self.tasks) * avg_task_time_ms
    
    def calculate_parallel_speedup(self, avg_task_time_ms: int = 1000) -> float:
        """
        Calculate the speedup factor from parallelization.
        """
        sequential = self.estimate_sequential_time(avg_task_time_ms)
        parallel = self.estimate_total_time(avg_task_time_ms)
        
        if parallel == 0:
            return 1.0
        
        return sequential / parallel
    
    def validate(self) -> List[str]:
        """
        Validate the task graph.
        Returns list of validation errors (empty if valid).
        """
        errors = []
        
        # Check for circular dependencies
        visited = set()
        rec_stack = set()
        
        def has_cycle(task_id: str) -> bool:
            visited.add(task_id)
            rec_stack.add(task_id)
            
            task = self.tasks.get(task_id)
            if task:
                for dep in task.depends_on:
                    if dep not in visited:
                        if has_cycle(dep):
                            return True
                    elif dep in rec_stack:
                        return True
            
            rec_stack.remove(task_id)
            return False
        
        for task_id in self.tasks:
            if task_id not in visited:
                if has_cycle(task_id):
                    errors.append(f"Circular dependency detected involving task {task_id}")
        
        # Check for missing dependencies
        for task in self.tasks.values():
            for dep in task.depends_on:
                if dep not in self.tasks:
                    errors.append(f"Task {task.id} depends on unknown task {dep}")
        
        # Check for duplicate IDs
        seen_ids = set()
        for task_id in self.tasks:
            if task_id in seen_ids:
                errors.append(f"Duplicate task ID: {task_id}")
            seen_ids.add(task_id)
        
        return errors
    
    def to_dict(self) -> Dict:
        """Convert task graph to dictionary."""
        return {
            "tasks": [task.to_dict() for task in self.tasks.values()],
            "execution_order": self.get_execution_order(),
            "critical_path": self.get_critical_path(),
            "estimated_speedup": self.calculate_parallel_speedup()
        }
    
    @classmethod
    def from_plan(cls, plan_dict: Dict) -> "TaskGraphManager":
        """
        Create a TaskGraphManager from a plan dictionary.
        """
        manager = cls()
        
        for task_dict in plan_dict.get("tasks", []):
            task = Task(
                id=task_dict["id"],
                agent=task_dict["agent"],
                type=task_dict["type"],
                description=task_dict["description"],
                parallel=task_dict.get("parallel", True),
                depends_on=task_dict.get("depends_on", []),
                estimated_tokens=task_dict.get("estimated_tokens", 1000)
            )
            manager.add_task(task)
        
        return manager
