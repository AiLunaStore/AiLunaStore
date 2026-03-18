"""
Orchestration system for multi-agent parallel execution.
"""

from .core.orchestrator import Orchestrator, OrchestrationResult
from .core.task_graph import TaskGraphManager, Task
from .core.result_aggregator import ResultAggregator

__all__ = [
    "Orchestrator",
    "OrchestrationResult",
    "TaskGraphManager",
    "Task",
    "ResultAggregator"
]

__version__ = "5.0.0"
