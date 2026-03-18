# System Architecture v5.0 - Multi-Agent Orchestration System

## Overview

This document describes the upgraded Hired AI system architecture with parallel execution, watchdog supervision, and intelligent routing for improved speed, reliability, and cost efficiency.

## Architecture Components

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    HIRED AI v5.0 - MULTI-AGENT SYSTEM                      │
│                    (Parallel Execution + Watchdog Supervision)             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: SUPERVISOR (WATCHDOG)                                      │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Watchdog Agent - Lightweight Monitor                          │  │   │
│  │  │  • Task timeout monitoring (30s limit)                         │  │   │
│  │  │  • Stalled task detection                                      │  │   │
│  │  │  • Runaway loop prevention                                     │  │   │
│  │  │  • Token usage tracking                                        │  │   │
│  │  │  • Automatic retry with fallback models                        │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: TRIAGE                                                     │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Triage Agent - GPT-4o-mini / GPT-5-nano                       │  │   │
│  │  │  • Classify incoming requests                                  │  │   │
│  │  │  • Route to appropriate agent                                  │  │   │
│  │  │  • Quick priority assessment                                   │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: ORCHESTRATOR                                               │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Orchestrator Agent - DeepSeek Chat                            │  │   │
│  │  │  • Coordinate system operations                                │  │   │
│  │  │  • Delegate tasks to appropriate agents                        │  │   │
│  │  │  • CRITICAL: NO heavy reasoning or execution                   │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: PLANNER                                                    │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Planner Agent - DeepSeek Reasoner                             │  │   │
│  │  │  • Generate structured task plans                              │  │   │
│  │  │  • Create task graphs with parallel execution paths            │  │   │
│  │  │  • Output: {"tasks":[{"id":"...","parallel":true}]}            │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: PARALLEL IMPLEMENTERS                                      │   │
│  │  ┌───────────────┐ ┌───────────────┐ ┌───────────────┐             │   │
│  │  │    Research   │ │    Coding     │ │  Automation   │             │   │
│  │  │    Agent      │ │    Agent      │ │    Agent      │             │   │
│  │  │  DeepSeek     │ │   Kimi K2.5   │ │  GPT-4o-mini  │             │   │
│  │  │    Chat       │ │               │ │               │             │   │
│  │  └───────────────┘ └───────────────┘ └───────────────┘             │   │
│  │         ↓                    ↓                    ↓                 │   │
│  │         └────────────────────┴────────────────────┘                 │   │
│  │                              ↓                                      │   │
│  │                    [Parallel Execution Results]                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 6: SELF-CRITIQUE                                              │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Self-Critique Agent - GPT-4o-mini / DeepSeek Chat             │  │   │
│  │  │  • Check for logical errors                                    │  │   │
│  │  │  • Detect hallucinated information                             │  │   │
│  │  │  • Identify incomplete tasks                                   │  │   │
│  │  │  • Flag inconsistencies                                        │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 7: REVIEW DECISION GATE                                       │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Decision Gate                                                 │  │   │
│  │  │  • Output: REVIEW_DECISION: low_risk | high_risk               │  │   │
│  │  │  • REASON: [short explanation]                                 │  │   │
│  │  │  • High risk → Route to Final Reviewer                         │  │   │
│  │  │  • Low risk → Skip to output                                   │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │  LAYER 8: FINAL REVIEWER (CONDITIONAL)                               │   │
│  │  ┌───────────────────────────────────────────────────────────────┐  │   │
│  │  │  Final Reviewer Agent - GPT-5.1 Codex                          │  │   │
│  │  │  • ONLY RUN if REVIEW_DECISION = high_risk                     │  │   │
│  │  │  • Verify correctness                                          │  │   │
│  │  │  • Validate reasoning                                          │  │   │
│  │  │  • Check code quality                                          │  │   │
│  │  │  • Confirm task completeness                                   │  │   │
│  │  └───────────────────────────────────────────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    ↓                                        │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         FINAL OUTPUT                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Supervisor (Watchdog)

**Purpose:** Lightweight monitor for system reliability

**Responsibilities:**
- Monitor task execution time (30-second timeout)
- Detect stalled tasks
- Prevent runaway loops
- Track token usage
- Trigger automatic retries with fallback models

**Fallback Routing:**
```yaml
coding:
  primary: kimi-k2.5
  fallback_1: deepseek-coder
  fallback_2: gpt-4o-mini

research:
  primary: deepseek-chat
  fallback_1: mixtral
  fallback_2: llama3
```

**Model:** Lightweight rule-based system (no LLM)

### 2. Triage

**Purpose:** Classify and route incoming requests

**Model:** GPT-4o-mini or GPT-5-nano

**Responsibilities:**
- Classify request type (coding, research, automation, etc.)
- Assess priority and urgency
- Route to appropriate agent
- Flag special considerations

**Output Format:**
```json
{
  "request_type": "coding|research|automation|analysis|other",
  "priority": "critical|high|medium|low",
  "urgency": "immediate|today|this_week|eventually",
  "routed_to": "orchestrator",
  "capabilities_required": ["capability1", "capability2"],
  "flags": ["flag1", "flag2"]
}
```

### 3. Orchestrator

**Purpose:** Coordinate system and delegate tasks

**Model:** DeepSeek Chat

**CRITICAL RULE:** Must NOT perform heavy reasoning or task execution

**Responsibilities:**
- Receive triaged requests
- Determine if planning is needed
- Delegate to Planner or directly to Implementers
- Monitor task progress
- Coordinate parallel execution
- Aggregate results

### 4. Planner

**Purpose:** Generate structured task plans with parallel execution

**Model:** DeepSeek Reasoner

**Responsibilities:**
- Analyze complex requests
- Break down into subtasks
- Identify parallelizable tasks
- Create task dependency graph
- Output structured plan

**Output Format:**
```json
{
  "plan_id": "PLN-YYYYMMDD-###",
  "goal": "description of what we're achieving",
  "tasks": [
    {
      "id": "research",
      "agent": "research",
      "type": "research",
      "description": "What to research",
      "parallel": true,
      "estimated_tokens": 2000
    },
    {
      "id": "code",
      "agent": "coding",
      "type": "coding",
      "description": "What to code",
      "parallel": true,
      "estimated_tokens": 3000
    },
    {
      "id": "analysis",
      "agent": "research",
      "type": "analysis",
      "description": "Analyze results",
      "depends_on": ["research", "code"],
      "parallel": false,
      "estimated_tokens": 1500
    }
  ],
  "parallel_groups": [
    ["research", "code"],
    ["analysis"]
  ]
}
```

### 5. Parallel Implementers

#### Research Agent
- **Model:** DeepSeek Chat
- **Purpose:** Research, analysis, information gathering
- **Best For:** Web search, data analysis, fact-checking

#### Coding Agent
- **Model:** Kimi K2.5
- **Purpose:** Code implementation, debugging, refactoring
- **Best For:** Writing code, fixing bugs, code review

#### Automation Agent
- **Model:** GPT-4o-mini
- **Purpose:** Automation, scripting, routine tasks
- **Best For:** Shell scripts, file operations, system tasks

### 6. Self-Critique Layer

**Purpose:** Quality control before final review

**Model:** GPT-4o-mini or DeepSeek Chat

**Checks:**
- Logical errors
- Hallucinated information
- Incomplete tasks
- Inconsistencies

### 7. Review Decision Gate

**Purpose:** Determine if high-level verification is needed

**Output Format:**
```
REVIEW_DECISION: low_risk | high_risk
REASON: [short explanation]
```

**High Risk Criteria:**
- Generated code
- Complex reasoning
- Financial/technical calculations
- Factual research requiring verification
- Outputs flagged by self-critique

**Low Risk Criteria:**
- Summarization
- Formatting
- Simple explanations
- Trivial responses

### 8. Final Reviewer (Conditional)

**Purpose:** High-level verification for high-risk outputs

**Model:** GPT-5.1 Codex

**ONLY RUN if REVIEW_DECISION = high_risk**

**Verifies:**
- Correctness
- Reasoning validity
- Code quality
- Task completeness

## Logging & Monitoring

### Metrics to Track

```yaml
performance_metrics:
  - agent_execution_latency
  - token_usage_per_agent
  - task_success_rate
  - task_failure_rate
  - watchdog_triggered_retries
  - parallel_execution_efficiency
  - cost_per_request
  - time_saved_by_parallelization

quality_metrics:
  - self_critique_findings
  - high_risk_decisions
  - final_reviewer_interventions
  - error_rate_post_review

reliability_metrics:
  - timeout_events
  - fallback_model_usage
  - recovery_success_rate
  - system_availability
```

### Log Format

```json
{
  "timestamp": "2026-03-16T10:30:00Z",
  "request_id": "REQ-20260316-001",
  "layer": "watchdog|triage|orchestrator|planner|implementer|critique|decision|reviewer",
  "agent": "agent_name",
  "model": "model_name",
  "action": "action_description",
  "latency_ms": 1234,
  "tokens_in": 100,
  "tokens_out": 200,
  "status": "success|failure|timeout|retry",
  "fallback_used": false,
  "metadata": {}
}
```

## Integration with Existing System

### Backward Compatibility

The new architecture maintains compatibility with existing components:

```
┌─────────────────────────────────────────────────────────────┐
│                    EXISTING SYSTEM                          │
├─────────────────────────────────────────────────────────────┤
│  Phase 1: Memory & Knowledge (memory/, knowledge/, skills/) │
│  Phase 2: Delegation (delegation/)                          │
│  Phase 3: Autonomy & Safety (autonomy/, accountability/,    │
│           safety/)                                          │
│  Phase 4: Integration (system/, dashboard/, testing/)       │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                 NEW v5.0 ORCHESTRATION                      │
├─────────────────────────────────────────────────────────────┤
│  orchestration/                                             │
│    ├── config/           # Configuration files              │
│    ├── core/             # Core orchestration logic         │
│    ├── agents/           # Agent implementations            │
│    ├── watchdog/         # Supervisor implementation        │
│    ├── router/           # Triage and routing logic         │
│    ├── planner/          # Task planning engine             │
│    ├── critique/         # Self-critique layer              │
│    ├── metrics/          # Logging and monitoring           │
│    └── tests/            # Test suite                       │
└─────────────────────────────────────────────────────────────┘
```

## File Structure

```
orchestration/
├── README.md                    # This file
├── config/
│   ├── agents.yaml             # Agent configurations
│   ├── models.yaml             # Model routing and fallbacks
│   └── thresholds.yaml         # Watchdog thresholds
├── core/
│   ├── __init__.py
│   ├── orchestrator.py         # Main orchestration engine
│   ├── task_graph.py           # Task graph management
│   └── result_aggregator.py    # Result aggregation logic
├── agents/
│   ├── __init__.py
│   ├── base_agent.py           # Base agent class
│   ├── triage_agent.py         # Triage implementation
│   ├── planner_agent.py        # Planner implementation
│   ├── research_agent.py       # Research implementer
│   ├── coding_agent.py         # Coding implementer
│   ├── automation_agent.py     # Automation implementer
│   ├── critique_agent.py       # Self-critique implementation
│   └── reviewer_agent.py       # Final reviewer implementation
├── watchdog/
│   ├── __init__.py
│   ├── supervisor.py           # Watchdog supervisor
│   ├── timeout_handler.py      # Timeout management
│   ├── fallback_router.py      # Fallback model routing
│   └── token_monitor.py        # Token usage tracking
├── router/
│   ├── __init__.py
│   ├── request_classifier.py   # Request classification
│   └── agent_selector.py       # Agent selection logic
├── planner/
│   ├── __init__.py
│   ├── plan_generator.py       # Plan generation
│   ├── dependency_resolver.py  # Dependency resolution
│   └── parallel_optimizer.py   # Parallel execution optimization
├── critique/
│   ├── __init__.py
│   ├── critique_engine.py      # Self-critique logic
│   └── decision_gate.py        # Review decision gate
├── metrics/
│   ├── __init__.py
│   ├── logger.py               # Metrics logging
│   ├── collector.py            # Metrics collection
│   └── reporter.py             # Performance reporting
└── tests/
    ├── test_watchdog.py
    ├── test_triage.py
    ├── test_orchestrator.py
    ├── test_planner.py
    ├── test_parallel.py
    ├── test_critique.py
    └── test_integration.py
```

## Usage

### Basic Usage

```python
from orchestration.core.orchestrator import Orchestrator

# Initialize orchestrator
orch = Orchestrator()

# Process a request
result = await orch.process_request(
    request="Create a Python script to organize files by extension",
    context={"user": "Levin", "channel": "telegram"}
)

print(result.output)
print(result.metrics)
```

### Advanced Usage with Custom Configuration

```python
from orchestration.core.orchestrator import Orchestrator
from orchestration.config.models import ModelConfig

# Custom model configuration
config = ModelConfig(
    coding_primary="kimi-k2.5",
    coding_fallbacks=["deepseek-coder", "gpt-4o-mini"],
    research_primary="deepseek-chat",
    research_fallbacks=["mixtral", "llama3"],
    timeout_seconds=30,
    max_retries=3
)

orch = Orchestrator(config=config)
result = await orch.process_request(request="...")
```

## Testing

### Run All Tests

```bash
cd /Users/levinolonan/.openclaw/workspace/orchestration
python -m pytest tests/ -v
```

### Run Specific Test Suite

```bash
# Watchdog tests
python -m pytest tests/test_watchdog.py -v

# Parallel execution tests
python -m pytest tests/test_parallel.py -v

# Integration tests
python -m pytest tests/test_integration.py -v
```

## Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| Request Latency (simple) | < 5s | End-to-end |
| Request Latency (complex) | < 30s | End-to-end |
| Parallel Speedup | 2-3x | vs Sequential |
| Timeout Recovery | < 2s | Detection + Retry |
| Cost Reduction | 30-50% | vs v4.0 |
| Success Rate | > 95% | All requests |

---

**System Version**: 5.0.0
**Implementation Status**: In Progress
**Last Updated**: 2026-03-16
**Maintained By**: Luna (Digital Team Member)
