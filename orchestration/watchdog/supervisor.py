"""
Watchdog supervisor for monitoring task execution.
Handles timeouts, retries, and fallback routing.
"""

import asyncio
import time
from typing import Any, Callable, Dict, List, Optional
from dataclasses import dataclass, field
from enum import Enum
import json


class WatchdogStatus(Enum):
    HEALTHY = "healthy"
    WARNING = "warning"
    CRITICAL = "critical"
    EMERGENCY = "emergency"


class TaskState(Enum):
    PENDING = "pending"
    RUNNING = "running"
    TIMEOUT = "timeout"
    RETRYING = "retrying"
    COMPLETED = "completed"
    FAILED = "failed"


@dataclass
class TaskMonitor:
    """Monitors a single task execution."""
    task_id: str
    agent: str
    model: str
    start_time: float
    timeout_seconds: int
    max_retries: int
    retry_count: int = 0
    state: TaskState = TaskState.PENDING
    last_progress_time: float = field(default_factory=time.time)
    tokens_used: int = 0
    
    def is_timed_out(self) -> bool:
        """Check if task has exceeded timeout."""
        return time.time() - self.start_time > self.timeout_seconds
    
    def is_stalled(self, stall_threshold_seconds: int = 15) -> bool:
        """Check if task has made no progress."""
        return time.time() - self.last_progress_time > stall_threshold_seconds
    
    def can_retry(self) -> bool:
        """Check if task can be retried."""
        return self.retry_count < self.max_retries


class WatchdogSupervisor:
    """
    Lightweight supervisor that monitors task execution.
    Handles timeouts, stalled tasks, and automatic retries.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or self._default_config()
        self.monitors: Dict[str, TaskMonitor] = {}
        self.status = WatchdogStatus.HEALTHY
        self.metrics = {
            "tasks_monitored": 0,
            "timeouts": 0,
            "retries": 0,
            "fallbacks": 0,
            "stalls_detected": 0
        }
        self._running = False
        self._monitor_task = None
    
    def _default_config(self) -> Dict:
        """Default watchdog configuration."""
        return {
            "default_timeout": 30,
            "stall_threshold": 15,
            "max_retries": 3,
            "check_interval": 5,
            "fallback_routing": {
                "coding": ["kimi-k2.5", "deepseek-coder", "gpt-4o-mini"],
                "research": ["deepseek-chat", "mixtral", "llama3"],
                "triage": ["gpt-4o-mini", "gpt-5-nano"],
                "orchestrator": ["deepseek-chat", "gpt-4o"],
                "planner": ["deepseek-reasoner", "claude-3.5-sonnet"],
                "critique": ["gpt-4o-mini", "deepseek-chat"],
                "reviewer": ["gpt-5.1-codex", "claude-3.5-sonnet"]
            }
        }
    
    async def start(self):
        """Start the watchdog monitoring loop."""
        self._running = True
        self._monitor_task = asyncio.create_task(self._monitor_loop())
    
    async def stop(self):
        """Stop the watchdog monitoring loop."""
        self._running = False
        if self._monitor_task:
            self._monitor_task.cancel()
            try:
                await self._monitor_task
            except asyncio.CancelledError:
                pass
    
    async def _monitor_loop(self):
        """Main monitoring loop."""
        while self._running:
            try:
                await self._check_all_monitors()
                await asyncio.sleep(self.config["check_interval"])
            except Exception as e:
                print(f"Watchdog error: {e}")
                await asyncio.sleep(1)
    
    async def _check_all_monitors(self):
        """Check all monitored tasks."""
        for task_id, monitor in list(self.monitors.items()):
            # Check for timeout
            if monitor.is_timed_out() and monitor.state == TaskState.RUNNING:
                await self._handle_timeout(task_id)
            
            # Check for stalled tasks
            elif monitor.is_stalled(self.config["stall_threshold"]) and monitor.state == TaskState.RUNNING:
                await self._handle_stall(task_id)
    
    def register_task(self, task_id: str, agent: str, model: str, 
                     timeout_seconds: Optional[int] = None) -> TaskMonitor:
        """
        Register a task for monitoring.
        
        Args:
            task_id: Unique task identifier
            agent: Agent type (coding, research, etc.)
            model: Model being used
            timeout_seconds: Override default timeout
            
        Returns:
            TaskMonitor instance
        """
        monitor = TaskMonitor(
            task_id=task_id,
            agent=agent,
            model=model,
            start_time=time.time(),
            timeout_seconds=timeout_seconds or self.config["default_timeout"],
            max_retries=self.config["max_retries"]
        )
        
        self.monitors[task_id] = monitor
        self.metrics["tasks_monitored"] += 1
        
        return monitor
    
    def update_progress(self, task_id: str, tokens_used: int = 0):
        """Update task progress."""
        if task_id in self.monitors:
            self.monitors[task_id].last_progress_time = time.time()
            self.monitors[task_id].tokens_used += tokens_used
    
    def mark_running(self, task_id: str):
        """Mark task as running."""
        if task_id in self.monitors:
            self.monitors[task_id].state = TaskState.RUNNING
    
    def mark_completed(self, task_id: str):
        """Mark task as completed."""
        if task_id in self.monitors:
            self.monitors[task_id].state = TaskState.COMPLETED
            # Clean up after a delay
            asyncio.create_task(self._cleanup_monitor(task_id, delay=60))
    
    def mark_failed(self, task_id: str):
        """Mark task as failed."""
        if task_id in self.monitors:
            self.monitors[task_id].state = TaskState.FAILED
    
    async def _cleanup_monitor(self, task_id: str, delay: int = 60):
        """Clean up monitor after delay."""
        await asyncio.sleep(delay)
        if task_id in self.monitors:
            if self.monitors[task_id].state in [TaskState.COMPLETED, TaskState.FAILED]:
                del self.monitors[task_id]
    
    async def _handle_timeout(self, task_id: str):
        """Handle task timeout."""
        monitor = self.monitors[task_id]
        self.metrics["timeouts"] += 1
        
        print(f"[WATCHDOG] Task {task_id} timed out after {monitor.timeout_seconds}s")
        
        if monitor.can_retry():
            await self._retry_task(task_id, reason="timeout")
        else:
            monitor.state = TaskState.TIMEOUT
            self.status = WatchdogStatus.CRITICAL
    
    async def _handle_stall(self, task_id: str):
        """Handle stalled task."""
        monitor = self.monitors[task_id]
        self.metrics["stalls_detected"] += 1
        
        print(f"[WATCHDOG] Task {task_id} stalled (no progress for {self.config['stall_threshold']}s)")
        
        # For stalls, we just log - actual handling depends on context
        # Could trigger fallback, notify, or wait longer
    
    async def _retry_task(self, task_id: str, reason: str):
        """Retry a task with fallback model."""
        monitor = self.monitors[task_id]
        monitor.retry_count += 1
        monitor.state = TaskState.RETRYING
        
        self.metrics["retries"] += 1
        
        # Get fallback model
        fallback_model = self._get_fallback_model(monitor.agent, monitor.model)
        
        if fallback_model:
            self.metrics["fallbacks"] += 1
            print(f"[WATCHDOG] Retrying task {task_id} with fallback model: {fallback_model} (reason: {reason})")
            
            # Reset timing for retry
            monitor.start_time = time.time()
            monitor.last_progress_time = time.time()
            monitor.model = fallback_model
            monitor.state = TaskState.RUNNING
            
            return fallback_model
        else:
            print(f"[WATCHDOG] No fallback available for task {task_id}")
            monitor.state = TaskState.FAILED
            return None
    
    def _get_fallback_model(self, agent: str, current_model: str) -> Optional[str]:
        """Get the next fallback model for an agent."""
        fallback_chain = self.config["fallback_routing"].get(agent, [])
        
        try:
            current_index = fallback_chain.index(current_model)
            if current_index + 1 < len(fallback_chain):
                return fallback_chain[current_index + 1]
        except ValueError:
            # Current model not in chain, use first fallback
            if fallback_chain:
                return fallback_chain[0]
        
        return None
    
    def get_status(self) -> Dict:
        """Get current watchdog status."""
        running_tasks = sum(1 for m in self.monitors.values() if m.state == TaskState.RUNNING)
        
        return {
            "status": self.status.value,
            "running_tasks": running_tasks,
            "monitored_tasks": len(self.monitors),
            "metrics": self.metrics,
            "config": {
                "timeout": self.config["default_timeout"],
                "max_retries": self.config["max_retries"],
                "check_interval": self.config["check_interval"]
            }
        }
    
    def get_task_status(self, task_id: str) -> Optional[Dict]:
        """Get status for a specific task."""
        if task_id not in self.monitors:
            return None
        
        monitor = self.monitors[task_id]
        return {
            "task_id": task_id,
            "agent": monitor.agent,
            "model": monitor.model,
            "state": monitor.state.value,
            "elapsed_seconds": time.time() - monitor.start_time,
            "retry_count": monitor.retry_count,
            "tokens_used": monitor.tokens_used
        }
    
    async def execute_with_watchdog(self, task_func: Callable, task_id: str, 
                                   agent: str, model: str, **kwargs) -> Any:
        """
        Execute a task with watchdog monitoring.
        
        Args:
            task_func: Async function to execute
            task_id: Unique task identifier
            agent: Agent type
            model: Model to use
            **kwargs: Arguments for task_func
            
        Returns:
            Task result
        """
        # Register task
        monitor = self.register_task(task_id, agent, model)
        
        max_attempts = self.config["max_retries"] + 1
        current_model = model
        
        for attempt in range(max_attempts):
            try:
                # Mark as running
                self.mark_running(task_id)
                
                # Execute task with timeout
                result = await asyncio.wait_for(
                    task_func(model=current_model, **kwargs),
                    timeout=monitor.timeout_seconds
                )
                
                # Mark as completed
                self.mark_completed(task_id)
                
                return {
                    "success": True,
                    "result": result,
                    "model_used": current_model,
                    "attempts": attempt + 1,
                    "task_id": task_id
                }
                
            except asyncio.TimeoutError:
                print(f"[WATCHDOG] Task {task_id} timed out (attempt {attempt + 1})")
                
                if attempt < max_attempts - 1:
                    # Get fallback and retry
                    fallback = self._get_fallback_model(agent, current_model)
                    if fallback:
                        current_model = fallback
                        monitor.retry_count += 1
                        self.metrics["retries"] += 1
                        self.metrics["fallbacks"] += 1
                        print(f"[WATCHDOG] Retrying with fallback model: {fallback}")
                    else:
                        break
                else:
                    break
                    
            except Exception as e:
                print(f"[WATCHDOG] Task {task_id} failed with error: {e}")
                
                if attempt < max_attempts - 1:
                    # Retry with fallback
                    fallback = self._get_fallback_model(agent, current_model)
                    if fallback:
                        current_model = fallback
                        monitor.retry_count += 1
                        self.metrics["retries"] += 1
                    else:
                        break
                else:
                    break
        
        # All attempts failed
        self.mark_failed(task_id)
        
        return {
            "success": False,
            "error": f"Task failed after {attempt + 1} attempts",
            "task_id": task_id,
            "last_model_used": current_model
        }
