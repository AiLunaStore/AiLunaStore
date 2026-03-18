# System Architecture

## Overview

The Integrated Agent System is built on a modular architecture that separates concerns while enabling tight integration between components.

## Component Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Integrated Agent System                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                        CONFIGURATION LAYER                           │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌────────────┐  │   │
│  │  │  models.json│  │  agents.json│  │strategies.  │  │fallback-   │  │   │
│  │  │             │  │             │  │    json     │  │chains.json │  │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └────────────┘  │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                         CORE SYSTEM LAYER                            │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────┐ │   │
│  │  │ Orchestrator │  │ Task Router  │  │ Cost Tracker │  │Fallback  │ │   │
│  │  │              │  │              │  │              │  │Manager   │ │   │
│  │  │ • Execution  │  │ • Classify   │  │ • Budget     │  │• Chains  │ │   │
│  │  │ • Coordinate │  │ • Route      │  │ • Track      │  │• Escalate│ │   │
│  │  │ • Integrate  │  │ • Select     │  │ • Alert      │  │• Retry   │ │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘  └──────────┘ │   │
│  │                                                                      │   │
│  │  ┌────────────────────────────────────────────────────────────────┐ │   │
│  │  │                  Performance Monitor                            │ │   │
│  │  │  • Metrics Collection  • Quality Analysis  • Efficiency Tracking│ │   │
│  │  └────────────────────────────────────────────────────────────────┘ │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                      PRESENTATION LAYER                              │   │
│  │                                                                      │   │
│  │  ┌──────────────────────────────────────────────────────────────┐   │   │
│  │  │                 Mission Control Dashboard                     │   │   │
│  │  │                                                                │   │   │
│  │  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌─────────┐  │   │   │
│  │  │  │  Overview  │  │  Models    │  │   Agents   │  │ Budgets │  │   │   │
│  │  │  │   Cards    │  │   Table    │  │   Table    │  │  Chart  │  │   │   │
│  │  │  └────────────┘  └────────────┘  └────────────┘  └─────────┘  │   │   │
│  │  │                                                                │   │   │
│  │  │  ┌────────────────────────────────────────────────────────┐   │   │   │
│  │  │  │              Quality/Cost Slider                        │   │   │   │
│  │  │  └────────────────────────────────────────────────────────┘   │   │   │
│  │  │                                                                │   │   │
│  │  └──────────────────────────────────────────────────────────────┘   │   │
│  │                                                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Data Flow

### Task Execution Flow

```
1. Task Input
   │
   ▼
2. Task Router
   ├── Classify task type (coding, research, planning, etc.)
   ├── Select strategy (balanced, quality, economy, speed)
   └── Select optimal agent + model
   │
   ▼
3. Budget Check
   ├── Check if task can be afforded
   ├── Reserve budget
   └── Alert if budget low
   │
   ▼
4. Execution with Fallback
   ├── Try primary model
   ├── Escalate on failure/quality issues
   └── Track attempts
   │
   ▼
5. Cost Recording
   ├── Record actual cost
   ├── Release reservation
   └── Update budget
   │
   ▼
6. Performance Tracking
   ├── Record metrics
   ├── Calculate efficiency
   └── Update dashboard
   │
   ▼
7. Result Output
```

## Component Details

### Orchestrator

The central coordinator that manages the entire execution flow.

**Responsibilities:**
- Initialize execution context
- Coordinate between components
- Handle errors and recovery
- Manage execution lifecycle

**Key Methods:**
- `execute(task, options)` - Main execution entry point
- `executeWithFallback()` - Handle fallback chains
- `finalizeExecution()` - Complete and store results

### Task Router

Intelligent task classification and routing system.

**Responsibilities:**
- Classify tasks by type
- Select appropriate strategy
- Match agents to tasks
- Estimate costs

**Classification Algorithm:**
```javascript
1. Extract keywords from task description
2. Score against pattern libraries
3. Check file extensions in context
4. Select highest confidence match
5. Estimate complexity (1-10)
```

### Cost Tracker

Real-time budget management and cost tracking.

**Responsibilities:**
- Track spending per budget
- Manage reservations
- Trigger alerts
- Generate reports

**Budget States:**
```
Healthy:    utilization < 50%
Warning:    utilization 50-80%
Critical:   utilization 80-95%
Exceeded:   utilization > 95%
```

### Performance Monitor

Metrics collection and analysis system.

**Responsibilities:**
- Collect execution metrics
- Calculate quality scores
- Track efficiency (quality/$)
- Generate trends

**Metrics Tracked:**
- Duration (ms)
- Cost ($)
- Quality score (0-1)
- Success rate (%)
- Fallback rate (%)

### Fallback Manager

Automatic escalation system for model failures.

**Responsibilities:**
- Manage fallback chains
- Track failure statistics
- Validate chain integrity
- Handle timeouts

**Escalation Rules:**
- On failure: escalate to next model
- On timeout: retry then escalate
- On quality threshold: escalate if below

## Configuration System

### Models Configuration

```json
{
  "model-id": {
    "id": "unique-identifier",
    "name": "Display Name",
    "provider": "API Provider",
    "pricing": {
      "inputPer1M": 0.30,
      "outputPer1M": 1.20
    },
    "capabilities": {
      "coding": 10,
      "reasoning": 9
    },
    "performance": {
      "sweBench": 80.2,
      "speed": 7
    }
  }
}
```

### Agents Configuration

```json
{
  "agent-id": {
    "id": "unique-identifier",
    "name": "Display Name",
    "primaryModel": "model-id",
    "fallbackChain": ["model-1", "model-2"],
    "domains": ["coding", "debugging"],
    "expertise": {
      "JavaScript": 0.95,
      "Python": 0.90
    }
  }
}
```

### Strategies Configuration

```json
{
  "strategy-id": {
    "weights": {
      "quality": 0.4,
      "cost": 0.4,
      "speed": 0.2
    },
    "constraints": {
      "minQuality": 7,
      "maxCostPerTask": 0.01
    }
  }
}
```

### Fallback Chains Configuration

```json
{
  "task-type": {
    "chain": [
      { "model": "primary", "agent": "specialist", "maxRetries": 2 },
      { "model": "fallback1", "agent": "specialist", "maxRetries": 2 },
      { "model": "fallback2", "agent": "specialist", "maxRetries": 1 }
    ],
    "escalationRules": {
      "onFailure": "escalate_to_next",
      "onTimeout": "retry_then_escalate"
    }
  }
}
```

## Event System

The system uses an event-driven architecture for loose coupling.

### Events

| Event | Payload | Description |
|-------|---------|-------------|
| `onTaskStart` | `{ executionId, task, routing }` | Task execution started |
| `onTaskComplete` | `{ executionId, result }` | Task completed successfully |
| `onTaskError` | `{ executionId, error }` | Task failed |
| `onBudgetAlert` | `{ type, budgetId, threshold }` | Budget threshold reached |
| `onFallback` | `{ executionId, reason, from, to }` | Fallback activated |

### Event Handling

```javascript
system.on('onTaskComplete', ({ executionId, result }) => {
  console.log(`Task ${executionId} completed with quality ${result.qualityScore}`);
});

system.on('onBudgetAlert', ({ type, threshold }) => {
  if (threshold === 95) {
    sendUrgentNotification('Budget nearly exhausted!');
  }
});
```

## Data Storage

### In-Memory Storage

Components use in-memory storage for:
- Active executions
- Budget states
- Metrics history
- Fallback statistics

### Persistence

For production use, implement:
- Database adapter for metrics
- File-based configuration
- Budget state persistence
- Execution history archival

## Security Considerations

### API Keys
- Store in environment variables
- Never commit to version control
- Rotate regularly

### Budget Limits
- Set conservative defaults
- Implement hard stops
- Audit trail for adjustments

### Rate Limiting
- Respect provider limits
- Implement exponential backoff
- Track usage per model

## Scalability

### Horizontal Scaling
- Stateless orchestrator design
- Shared configuration
- Distributed budget tracking

### Performance Optimization
- Caching for repeated tasks
- Batch metric updates
- Lazy loading for dashboard

## Extension Points

### Adding New Models
1. Add entry to `config/models.json`
2. Update relevant agent fallback chains
3. Add tests for model validation

### Adding New Agents
1. Add entry to `config/agents.json`
2. Define expertise and capabilities
3. Assign primary model and fallbacks

### Adding New Strategies
1. Add entry to `config/strategies.json`
2. Define weights and constraints
3. Add selection rules if needed

### Custom Integrations
```javascript
class CustomOrchestrator extends Orchestrator {
  async executeTaskWithAgent(executionId, task, fallbackStep, context) {
    // Custom execution logic
    return customResult;
  }
}
```
