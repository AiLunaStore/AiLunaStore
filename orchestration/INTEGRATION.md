# System Architecture v5.0 - Integration Guide

## Overview

This document describes the integration of the new multi-agent orchestration system (v5.0) with the existing Hired AI system (Phases 1-4).

## Architecture Comparison

### Previous Architecture (v4.x)
```
Request → Triage → Planner → Implementer → Reviewer → Output
         (single path, sequential execution)
```

### New Architecture (v5.0)
```
Request → Triage → Orchestrator → Planner → Parallel Implementers
                                          ↓
                              [Research] [Coding] [Automation]
                                          ↓
                    Self-Critique → Decision Gate → [Reviewer] → Output
                                                    (conditional)
```

## Key Improvements

| Aspect | v4.x | v5.0 |
|--------|------|------|
| **Execution** | Sequential | Parallel |
| **Supervision** | Manual | Watchdog (automated) |
| **Quality Control** | Final review only | Self-critique + conditional review |
| **Reliability** | Basic retry | Fallback model routing |
| **Cost Efficiency** | Fixed | Conditional reviewer (30-50% savings) |
| **Speed** | Baseline | 2-3x faster (parallel) |

## Integration Points

### 1. Delegation System Integration

The new orchestration system works alongside the existing delegation system:

```python
# Existing delegation (Phase 2)
from delegation.templates.triage_template import TriageTemplate

# New orchestration (Phase 5)
from orchestration.core.orchestrator import Orchestrator

# They can work together:
# 1. Use existing triage for initial classification
# 2. Route to new orchestrator for complex tasks
# 3. Use existing templates for specific agent types
```

**Preserved Components:**
- `delegation/templates/` - All templates remain functional
- `delegation/procedures/` - All procedures remain valid
- `delegation/tracking/` - Task tracking continues to work

### 2. Memory System Integration

The orchestration system logs to the existing memory system:

```python
# Logs to memory/YYYY-MM-DD.md
# Stores metrics in orchestration/metrics/logs/
# Updates knowledge/systems/ with new architecture info
```

**Preserved Components:**
- `memory/` - Daily logs continue
- `knowledge/` - Knowledge base extended
- `skills/` - Skills remain valid

### 3. Safety System Integration

The watchdog supervisor integrates with existing safety systems:

```python
# Phase 3 safety systems
from system.safety.validator import SafetyValidator

# New watchdog
from orchestration.watchdog.supervisor import WatchdogSupervisor

# Integration: Watchdog calls existing safety validators
```

**Preserved Components:**
- `autonomy/` - Autonomy protocols remain
- `accountability/` - Scope checking integrated
- `safety/` - Trust ladder respected

## Migration Guide

### For Existing Tasks

No changes required. Existing delegation continues to work:

```bash
# Existing workflow (still works)
python3 delegation/procedures/delegation-procedure.md
```

### For New Tasks

Use the new orchestrator for improved performance:

```python
from orchestration.core.orchestrator import Orchestrator

orch = Orchestrator()
result = await orch.process_request("Your request here")
```

### Hybrid Approach

Use both systems together:

```python
# Step 1: Use existing triage
from delegation.agents.triage import TriageAgent
triage = TriageAgent()
classification = await triage.classify(request)

# Step 2: Route to new orchestrator if complex
if classification.complexity == "complex":
    from orchestration.core.orchestrator import Orchestrator
    orch = Orchestrator()
    result = await orch.process_request(request)
else:
    # Use existing simple workflow
    from delegation.agents.implementer import ImplementerAgent
    agent = ImplementerAgent()
    result = await agent.execute(request)
```

## Configuration

### Agent Configuration

Edit `orchestration/config/agents.yaml`:

```yaml
agents:
  coding:
    model: "kimi-k2.5"
    fallback_model: "deepseek-coder"
    timeout_seconds: 30
```

### Model Configuration

Edit `orchestration/config/models.yaml`:

```yaml
models:
  coding:
    primary:
      name: "kimi-k2.5"
      cost_per_1k_input: 0.002
```

### Threshold Configuration

Edit `orchestration/config/thresholds.yaml`:

```yaml
timeouts:
  default_task_timeout: 30
  
retries:
  max_retries: 3
```

## Testing

### Run Integration Tests

```bash
cd /Users/levinolonan/.openclaw/workspace/orchestration
python3 integration_test.py
```

### Run Unit Tests

```bash
cd /Users/levinolonan/.openclaw/workspace/orchestration
python3 tests/test_integration.py
```

### Test Specific Components

```python
# Test watchdog
from orchestration.watchdog.supervisor import WatchdogSupervisor
supervisor = WatchdogSupervisor()

# Test decision gate
from orchestration.critique.decision_gate import ReviewDecisionGate
gate = ReviewDecisionGate()

# Test task graph
from orchestration.core.task_graph import TaskGraphManager
manager = TaskGraphManager()
```

## Monitoring

### Metrics Collection

The system automatically collects:

- Agent execution latency
- Token usage per agent
- Task success/failure rates
- Watchdog-triggered retries
- Parallel execution efficiency
- Cost per request

### View Metrics

```python
from orchestration.metrics.logger import MetricsLogger

logger = MetricsLogger()
summary = logger.get_summary(days=7)

print(f"Total requests: {summary['total_requests']}")
print(f"Average latency: {summary['avg_latency_ms']}ms")
print(f"Parallel speedup: {summary['avg_parallel_speedup']}x")
```

### Log Files

- `orchestration/metrics/logs/metrics-YYYY-MM-DD.jsonl` - Daily metrics
- `orchestration/metrics/logs/requests/YYYY-MM-DD/` - Per-request details

## Troubleshooting

### Common Issues

**Issue:** Watchdog timeouts too aggressive
**Solution:** Adjust `thresholds.yaml`:
```yaml
timeouts:
  default_task_timeout: 45  # Increase from 30
```

**Issue:** Too many fallback triggers
**Solution:** Check model health or adjust fallback chain in `models.yaml`

**Issue:** High review rate (costly)
**Solution:** Adjust decision gate thresholds:
```python
gate = ReviewDecisionGate(config={"critique_threshold": 0.6})
```

### Debug Mode

Enable debug logging:

```python
import logging
logging.basicConfig(level=logging.DEBUG)

orch = Orchestrator(config={"debug": True})
```

## Performance Benchmarks

### Expected Improvements

| Metric | v4.x | v5.0 | Improvement |
|--------|------|------|-------------|
| Simple request latency | 5s | 3s | 40% faster |
| Complex request latency | 30s | 12s | 60% faster |
| Cost (simple) | $0.05 | $0.03 | 40% savings |
| Cost (complex) | $0.50 | $0.30 | 40% savings |
| Success rate | 90% | 95% | 5% improvement |

### Benchmarking

Run performance tests:

```bash
python3 orchestration/tests/benchmark.py
```

## Future Enhancements

### Planned Features

1. **Adaptive Routing** - Learn optimal agent selection based on task history
2. **Dynamic Parallelism** - Adjust parallel execution based on system load
3. **Predictive Fallback** - Pre-warm fallback models for critical tasks
4. **Multi-Modal Support** - Extend to image, audio, and video tasks

### Extension Points

Add custom agents:

```python
from orchestration.agents.base_agent import BaseAgent

class CustomAgent(BaseAgent):
    async def execute(self, request, context=None):
        # Your implementation
        pass
```

## Support

### Documentation

- `orchestration/README.md` - System overview
- `orchestration/config/` - Configuration reference
- `orchestration/tests/` - Test examples

### Debugging

Check system health:

```python
from system.monitoring.health_checker import HealthChecker
checker = HealthChecker()
health = checker.get_system_health()
print(health)
```

---

**Version**: 5.0.0  
**Last Updated**: 2026-03-16  
**Maintained By**: Luna (Digital Team Member)
