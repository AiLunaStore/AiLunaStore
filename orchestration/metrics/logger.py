"""
Metrics logging and collection for the orchestration system.
"""

import json
import time
from typing import Any, Dict, List, Optional
from dataclasses import dataclass, field, asdict
from datetime import datetime
from pathlib import Path
import asyncio


@dataclass
class AgentMetrics:
    """Metrics for a single agent execution."""
    agent: str
    model: str
    latency_ms: int
    tokens_in: int
    tokens_out: int
    status: str
    fallback_used: bool = False
    retry_count: int = 0
    timestamp: str = field(default_factory=lambda: datetime.utcnow().isoformat())


@dataclass
class RequestMetrics:
    """Metrics for a complete request."""
    request_id: str
    start_time: float
    end_time: Optional[float] = None
    total_latency_ms: int = 0
    agent_calls: List[AgentMetrics] = field(default_factory=list)
    tokens_total_in: int = 0
    tokens_total_out: int = 0
    parallel_speedup: float = 1.0
    fallback_count: int = 0
    retry_count: int = 0
    risk_level: str = "low"
    reviewed: bool = False
    
    def finalize(self):
        """Finalize metrics after request completion."""
        if self.end_time is None:
            self.end_time = time.time()
        self.total_latency_ms = int((self.end_time - self.start_time) * 1000)


class MetricsLogger:
    """
    Logs metrics for the orchestration system.
    """
    
    def __init__(self, log_dir: str = "/Users/levinolonan/.openclaw/workspace/orchestration/metrics/logs"):
        self.log_dir = Path(log_dir)
        self.log_dir.mkdir(parents=True, exist_ok=True)
        self.current_request: Optional[RequestMetrics] = None
        self._buffer: List[Dict] = []
        self._buffer_size = 100
        
    def start_request(self, request_id: str) -> RequestMetrics:
        """Start tracking a new request."""
        self.current_request = RequestMetrics(
            request_id=request_id,
            start_time=time.time()
        )
        return self.current_request
    
    def log_agent_call(self, agent: str, model: str, latency_ms: int,
                      tokens_in: int, tokens_out: int, status: str = "success",
                      fallback_used: bool = False, retry_count: int = 0):
        """Log an agent call."""
        if self.current_request is None:
            return
        
        metrics = AgentMetrics(
            agent=agent,
            model=model,
            latency_ms=latency_ms,
            tokens_in=tokens_in,
            tokens_out=tokens_out,
            status=status,
            fallback_used=fallback_used,
            retry_count=retry_count
        )
        
        self.current_request.agent_calls.append(metrics)
        self.current_request.tokens_total_in += tokens_in
        self.current_request.tokens_total_out += tokens_out
        
        if fallback_used:
            self.current_request.fallback_count += 1
        
        self.current_request.retry_count += retry_count
        
        # Log to buffer
        self._buffer.append({
            "type": "agent_call",
            "timestamp": datetime.utcnow().isoformat(),
            "data": asdict(metrics)
        })
        
        self._flush_if_needed()
    
    def log_parallel_execution(self, task_count: int, sequential_time_ms: int,
                               parallel_time_ms: int):
        """Log parallel execution metrics."""
        if self.current_request is None:
            return
        
        if parallel_time_ms > 0:
            self.current_request.parallel_speedup = sequential_time_ms / parallel_time_ms
        
        self._buffer.append({
            "type": "parallel_execution",
            "timestamp": datetime.utcnow().isoformat(),
            "data": {
                "task_count": task_count,
                "sequential_time_ms": sequential_time_ms,
                "parallel_time_ms": parallel_time_ms,
                "speedup": self.current_request.parallel_speedup
            }
        })
        
        self._flush_if_needed()
    
    def log_watchdog_event(self, event_type: str, task_id: str, 
                          details: Dict[str, Any]):
        """Log a watchdog event."""
        self._buffer.append({
            "type": "watchdog_event",
            "event": event_type,
            "task_id": task_id,
            "timestamp": datetime.utcnow().isoformat(),
            "details": details
        })
        
        self._flush_if_needed()
    
    def log_decision_gate(self, decision: str, reason: str, 
                         quality_score: float):
        """Log decision gate result."""
        self._buffer.append({
            "type": "decision_gate",
            "timestamp": datetime.utcnow().isoformat(),
            "data": {
                "decision": decision,
                "reason": reason,
                "quality_score": quality_score
            }
        })
        
        if self.current_request:
            self.current_request.risk_level = decision
        
        self._flush_if_needed()
    
    def end_request(self, reviewed: bool = False) -> RequestMetrics:
        """End tracking current request."""
        if self.current_request is None:
            raise ValueError("No active request")
        
        self.current_request.finalize()
        self.current_request.reviewed = reviewed
        
        # Log final metrics
        self._buffer.append({
            "type": "request_complete",
            "timestamp": datetime.utcnow().isoformat(),
            "data": {
                "request_id": self.current_request.request_id,
                "total_latency_ms": self.current_request.total_latency_ms,
                "tokens_total_in": self.current_request.tokens_total_in,
                "tokens_total_out": self.current_request.tokens_total_out,
                "parallel_speedup": self.current_request.parallel_speedup,
                "fallback_count": self.current_request.fallback_count,
                "retry_count": self.current_request.retry_count,
                "risk_level": self.current_request.risk_level,
                "reviewed": self.current_request.reviewed,
                "agent_calls_count": len(self.current_request.agent_calls)
            }
        })
        
        self._flush()
        
        # Save to file
        self._save_request_metrics(self.current_request)
        
        metrics = self.current_request
        self.current_request = None
        
        return metrics
    
    def _flush_if_needed(self):
        """Flush buffer if it reaches threshold."""
        if len(self._buffer) >= self._buffer_size:
            self._flush()
    
    def _flush(self):
        """Flush buffer to log file."""
        if not self._buffer:
            return
        
        # Write to daily log file
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        log_file = self.log_dir / f"metrics-{date_str}.jsonl"
        
        with open(log_file, "a") as f:
            for entry in self._buffer:
                f.write(json.dumps(entry) + "\n")
        
        self._buffer = []
    
    def _save_request_metrics(self, metrics: RequestMetrics):
        """Save complete request metrics to file."""
        date_str = datetime.utcnow().strftime("%Y-%m-%d")
        requests_dir = self.log_dir / "requests" / date_str
        requests_dir.mkdir(parents=True, exist_ok=True)
        
        file_path = requests_dir / f"{metrics.request_id}.json"
        
        with open(file_path, "w") as f:
            json.dump({
                "request_id": metrics.request_id,
                "start_time": metrics.start_time,
                "end_time": metrics.end_time,
                "total_latency_ms": metrics.total_latency_ms,
                "tokens_total": {
                    "in": metrics.tokens_total_in,
                    "out": metrics.tokens_total_out
                },
                "parallel_speedup": metrics.parallel_speedup,
                "fallback_count": metrics.fallback_count,
                "retry_count": metrics.retry_count,
                "risk_level": metrics.risk_level,
                "reviewed": metrics.reviewed,
                "agent_calls": [asdict(call) for call in metrics.agent_calls]
            }, f, indent=2)
    
    def get_summary(self, days: int = 7) -> Dict:
        """Get summary metrics for the last N days."""
        summary = {
            "total_requests": 0,
            "total_agent_calls": 0,
            "avg_latency_ms": 0,
            "total_tokens_in": 0,
            "total_tokens_out": 0,
            "avg_parallel_speedup": 0,
            "total_fallbacks": 0,
            "total_retries": 0,
            "high_risk_requests": 0,
            "reviewed_requests": 0
        }
        
        latencies = []
        speedups = []
        
        # Read request files from last N days
        for i in range(days):
            date = datetime.utcnow() - __import__('datetime').timedelta(days=i)
            date_str = date.strftime("%Y-%m-%d")
            requests_dir = self.log_dir / "requests" / date_str
            
            if not requests_dir.exists():
                continue
            
            for file_path in requests_dir.glob("*.json"):
                with open(file_path) as f:
                    data = json.load(f)
                
                summary["total_requests"] += 1
                summary["total_agent_calls"] += data.get("agent_calls_count", 0)
                latencies.append(data.get("total_latency_ms", 0))
                summary["total_tokens_in"] += data.get("tokens_total", {}).get("in", 0)
                summary["total_tokens_out"] += data.get("tokens_total", {}).get("out", 0)
                speedups.append(data.get("parallel_speedup", 1.0))
                summary["total_fallbacks"] += data.get("fallback_count", 0)
                summary["total_retries"] += data.get("retry_count", 0)
                
                if data.get("risk_level") == "high_risk":
                    summary["high_risk_requests"] += 1
                
                if data.get("reviewed", False):
                    summary["reviewed_requests"] += 1
        
        # Calculate averages
        if latencies:
            summary["avg_latency_ms"] = sum(latencies) / len(latencies)
        
        if speedups:
            summary["avg_parallel_speedup"] = sum(speedups) / len(speedups)
        
        return summary
