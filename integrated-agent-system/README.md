# Integrated Agent System

A unified, intelligent agent collaboration system that routes tasks to optimal models, tracks costs in real-time, and maximizes efficiency through intelligent fallback chains.

## Overview

The Integrated Agent System combines three powerful frameworks:

1. **Collaboration Framework** - Task decomposition and parallel execution
2. **Cost Optimization Framework** - Budget-aware agent selection and tracking
3. **Mission Control Dashboard** - Real-time visualization and monitoring

## Key Features

### 🎯 Intelligent Task Routing
- Automatic task classification (coding, research, planning, UI, backend, integration)
- Strategy-based agent selection (balanced, quality, economy, speed)
- Optimal model assignment based on task requirements

### 💰 Cost Optimization
- Real-time cost tracking per task, model, and agent
- Budget management with alerts at 50%, 80%, 95%
- 23-60% cost savings vs Kimi-only system

### 📊 Performance Monitoring
- Quality, speed, and cost metrics per model-task pair
- Efficiency tracking (quality per dollar)
- Trend analysis over time

### 🔄 Intelligent Fallbacks
- Automatic escalation when models fail
- Task-type specific fallback chains
- Quality threshold validation

## Quick Start

```javascript
import { IntegratedAgentSystem } from './src/index.js';

// Initialize the system
const system = new IntegratedAgentSystem({
  defaultBudget: 10.00,
  alertThresholds: [0.5, 0.8, 0.95]
});

// Execute a task
const result = await system.execute({
  id: 'my-task',
  description: 'Implement a React component for user authentication',
  complexity: 7
}, {
  strategy: 'balanced',  // or 'quality', 'economy', 'speed'
  budget: 5.00
});

console.log(`Completed in ${result.metrics.duration}ms`);
console.log(`Cost: $${result.metrics.cost.toFixed(4)}`);
console.log(`Model used: ${result.metrics.model}`);
```

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Integrated Agent System                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐      │
│  │   Task       │───▶│   Task       │───▶│  Agent       │      │
│  │   Input      │    │   Router     │    │  Selection   │      │
│  └──────────────┘    └──────────────┘    └──────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │                    Orchestrator                       │      │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │      │
│  │  │  Fallback  │  │   Cost     │  │ Performance│     │      │
│  │  │  Manager   │  │  Tracker   │  │  Monitor   │     │      │
│  │  └────────────┘  └────────────┘  └────────────┘     │      │
│  └──────────────────────────────────────────────────────┘      │
│         │                   │                   │               │
│         ▼                   ▼                   ▼               │
│  ┌──────────────────────────────────────────────────────┐      │
│  │              Mission Control Dashboard                │      │
│  │  • Real-time cost visualization                      │      │
│  │  • Budget alerts and warnings                        │      │
│  │  • Model performance comparisons                     │      │
│  │  • Quality/cost preference controls                  │      │
│  └──────────────────────────────────────────────────────┘      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Model Configuration

### Primary Models

| Model | Provider | SWE-bench | Input | Output | Best For |
|-------|----------|-----------|-------|--------|----------|
| **MiniMax M2.5** | MiniMax | 80.2% | $0.30 | $1.20 | Coding (Primary) |
| DeepSeek V3.2 | DeepSeek | 75.5% | $0.14 | $0.28 | General/Orchestration |
| DeepSeek Reasoner | DeepSeek | 72.0% | $0.14 | $0.28 | Planning/Reasoning |
| Gemini 3.1 Pro | Google | 78.5% | $0.35 | $1.05 | Coding/Research |
| Gemini 2.5 Flash | Google | 65.0% | $0.10 | $0.40 | Research (Fast) |
| Claude 3.5 Sonnet | Anthropic | 77.0% | $3.00 | $15.00 | Complex Reasoning |

### Fallback Chains

```
Coding Tasks:
  MiniMax M2.5 → DeepSeek V3.2 → Gemini 3.1 Pro → Claude Sonnet

Research Tasks:
  Gemini 2.5 Flash → DeepSeek V3.2 → Claude Sonnet

Planning Tasks:
  DeepSeek Reasoner → DeepSeek V3.2 → Claude Sonnet
```

## Agent Specializations

| Agent | Primary Model | Domains | Avg Cost/Task |
|-------|--------------|---------|---------------|
| Coding Specialist | MiniMax M2.5 | coding, debugging | $0.0039 |
| Research Specialist | Gemini 2.5 Flash | research, analysis | $0.0012 |
| Planning Specialist | DeepSeek Reasoner | planning, architecture | $0.0013 |
| UI Specialist | MiniMax M2.5 | ui, frontend | $0.00315 |
| Backend Specialist | MiniMax M2.5 | backend, api | $0.0039 |
| Integration Specialist | DeepSeek V3.2 | integration, testing | $0.0010 |
| Orchestrator | DeepSeek V3.2 | coordination | $0.0007 |

## Strategies

### Balanced (Default)
- Quality: 40%, Cost: 40%, Speed: 20%
- Min quality: 7/10
- Best for: Most tasks

### Quality First
- Quality: 80%, Cost: 10%, Speed: 10%
- Min quality: 9/10
- Best for: Critical production code

### Economy
- Quality: 20%, Cost: 70%, Speed: 10%
- Min quality: 6/10
- Best for: Prototyping, research

### Speed
- Quality: 20%, Cost: 20%, Speed: 60%
- Min quality: 7/10
- Best for: Quick iterations

## API Reference

### IntegratedAgentSystem

#### Constructor Options
```javascript
{
  defaultBudget: 10.00,        // Default budget limit
  alertThresholds: [0.5, 0.8, 0.95],  // Budget alert thresholds
  maxHistorySize: 1000         // Max execution history
}
```

#### Methods

##### `execute(task, options)`
Execute a task through the system.

**Parameters:**
- `task` - Task object with `id`, `description`, `complexity`
- `options` - Execution options
  - `strategy` - Strategy name ('balanced', 'quality', 'economy', 'speed')
  - `budget` - Task-specific budget limit
  - `budgetId` - Budget identifier

**Returns:** Execution result with metrics

##### `getStatus()`
Get comprehensive system status.

##### `getDashboardData()`
Get data formatted for Mission Control dashboard.

##### `getCostReport()`
Get detailed cost report with breakdowns.

##### `getPerformanceReport()`
Get performance metrics and analysis.

##### `on(event, handler)`
Register event handler.

**Events:**
- `onTaskStart` - Task execution started
- `onTaskComplete` - Task execution completed
- `onTaskError` - Task execution failed
- `onBudgetAlert` - Budget threshold reached
- `onFallback` - Fallback chain activated

## Mission Control Dashboard

Launch the dashboard:
```bash
open mission-control/index.html
```

### Features
- **Live Cost Meter** - Real-time spending visualization
- **Budget Progress** - Visual budget consumption bars
- **Model Performance** - Per-model success rates and costs
- **Agent Status** - Active agents and their current tasks
- **Quality/Cost Slider** - Adjust preference in real-time
- **Alert Notifications** - Budget threshold warnings

## Testing

```bash
# Run all tests
npm test

# Run specific test suite
npm test -- test/cost-savings.test.js

# Run with coverage
npm test -- --coverage
```

### Test Coverage
- Integration tests for all components
- Cost savings verification (vs Kimi-only)
- Configuration validation
- Fallback chain validation

## Cost Comparison

### vs Kimi K2.5 Only

| Metric | Kimi Only | Optimized | Savings |
|--------|-----------|-----------|---------|
| Avg Cost/Task | $0.0057 | $0.0025 | 56% |
| 100 Tasks | $0.57 | $0.25 | $0.32 |
| 1000 Tasks | $5.70 | $2.50 | $3.20 |

### By Strategy

| Strategy | Avg Cost/Task | Quality | Use Case |
|----------|---------------|---------|----------|
| Economy | $0.0011 | 7/10 | Prototyping |
| Balanced | $0.0025 | 8.5/10 | General |
| Quality | $0.0080 | 9.5/10 | Production |

## Configuration

### Models (`config/models.json`)
Define available models with pricing, capabilities, and performance metrics.

### Agents (`config/agents.json`)
Define specialized agents with model assignments and expertise.

### Strategies (`config/strategies.json`)
Define selection strategies with weights and constraints.

### Fallback Chains (`config/fallback-chains.json`)
Define escalation paths for each task type.

## Troubleshooting

### Budget Alerts
- System will warn at 50%, 80%, and 95% of budget
- Use `economy` strategy when budget is tight
- Adjust `defaultBudget` in constructor

### Model Failures
- Fallback chains automatically activate
- Check `fallbackManager.getStats()` for failure rates
- Validate chains with `fallbackManager.validateAllChains()`

### Performance Issues
- Check `performanceMonitor.getEfficiencyMetrics()`
- Switch to `speed` strategy for faster execution
- Consider model context window limits

## License

MIT
