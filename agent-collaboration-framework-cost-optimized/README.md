# Agent Collaboration Framework - Cost Optimized

A framework for enabling agents to delegate subtasks to specialized subagents for parallel collaboration, with comprehensive cost optimization and budget management.

## Overview

The Cost-Optimized Agent Collaboration Framework extends the base framework with:
- **Cost-Aware Agent Selection**: Choose agents based on quality/cost ratio
- **Budget Management**: Track spending, set limits, receive alerts
- **Cost Prediction**: Estimate costs before task execution
- **Real-time Monitoring**: Live cost dashboard in Mission Control
- **Optimization Algorithms**: Maximize quality within budget constraints

## Pricing Data (per 1M tokens)

| Model | Provider | Input | Output | Quality | Speed |
|-------|----------|-------|--------|---------|-------|
| Kimi K2.5 | Moonshot | $0.60 | $3.00 | 9/10 | 6/10 |
| GPT-4o | OpenAI | $2.50 | $10.00 | 9/10 | 7/10 |
| Claude 3.5 Sonnet | Anthropic | $3.00 | $15.00 | 10/10 | 6/10 |
| Claude 3.5 Haiku | Anthropic | $0.75 | $3.75 | 7/10 | 8/10 |
| DeepSeek Chat | DeepSeek | $0.14 | $0.14 | 8/10 | 8/10 |

## Quick Start

```javascript
import { CostOptimizedFramework } from './src/index.js';

// Initialize with budget constraints
const framework = new CostOptimizedFramework({
  budget: {
    defaultLimit: 5.00, // $5.00 default per task
    alerts: [0.5, 0.8, 0.95] // Alert at 50%, 80%, 95%
  }
});

// Define a complex task
const task = {
  id: 'debug-desktop-app',
  description: 'Debug the desktop application crash on startup',
  context: {
    error: 'App crashes with "Cannot read property of undefined"',
    logs: ['...'],
    environment: 'macOS 15.3'
  },
  budget: 3.00 // Optional: specific budget for this task
};

// Execute with cost optimization
const result = await framework.execute(task);
console.log(`Completed in ${result.metrics.duration}ms`);
console.log(`Cost: $${result.metrics.cost.total.toFixed(4)}`);
console.log(`Quality/Cost Ratio: ${result.metrics.cost.qualityPerDollar.toFixed(2)}`);
```

## Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                 Cost-Optimized Collaboration Framework               │
├─────────────────────────────────────────────────────────────────────┤
│  Task Analyzer → Cost Optimizer → Agent Selector → Coordinator      │
├─────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌───────────┐  │
│  │ Cost-Aware  │  │   Budget    │  │   Mission   │  │  Fallback │  │
│  │   Agent     │  │   Manager   │  │   Control   │  │   Chain   │  │
│  │  Registry   │  │             │  │  Dashboard  │  │  Manager  │  │
│  └─────────────┘  └─────────────┘  └─────────────┘  └───────────┘  │
└─────────────────────────────────────────────────────────────────────┘
```

## Components

### 1. Cost-Aware Agent Registry (`src/core/agent-registry.js`)
Enhanced registry with pricing data, quality scores, and speed ratings.

### 2. Cost Calculator (`src/cost/cost-calculator.js`)
Token estimation and cost prediction for tasks.

### 3. Cost Optimization Engine (`src/cost/optimization-engine.js`)
Selects optimal agents based on quality/cost ratio and budget constraints.

### 4. Budget Manager (`src/cost/budget-manager.js`)
Tracks spending, enforces limits, and generates cost reports.

### 5. Mission Control Dashboard (`mission-control/`)
Real-time cost visualization and monitoring interface.

## Cost Optimization Features

### Token Estimation
```javascript
const estimate = framework.costCalculator.estimateTokens({
  taskType: 'debugging',
  complexity: 7,
  contextSize: 'large'
});
// Returns: { input: 2500, output: 1500, total: 4000 }
```

### Cost Prediction
```javascript
const prediction = framework.costCalculator.predictCost({
  task: myTask,
  agentId: 'ui-specialist'
});
// Returns: { estimatedCost: 2.45, confidence: 0.85 }
```

### Budget-Aware Delegation
```javascript
// Framework automatically selects best agent within budget
const result = await framework.execute(task, {
  budget: 5.00,
  minQuality: 7 // Minimum quality score required
});
```

### Fallback Chains
```javascript
// Define fallback chain: try cheap first, escalate if needed
const chain = framework.optimizationEngine.createFallbackChain({
  task: myTask,
  strategy: 'cheap-to-expensive'
});
// Returns: ['deepseek-specialist', 'kimi-specialist', 'claude-haiku', ...]
```

## Mission Control Dashboard

Launch the dashboard:
```bash
open mission-control/index.html
```

Features:
- **Live Cost Meter**: Real-time spending visualization
- **Budget Progress**: Visual budget consumption bars
- **Cost Breakdown**: Per-agent cost analysis
- **Efficiency Metrics**: Quality per dollar tracking
- **Alert Notifications**: Budget threshold warnings

## Cost Efficiency Metrics

The framework tracks:
- **Cost per Task**: Average spending per execution
- **Quality per Dollar**: Quality score divided by cost
- **Budget Utilization**: Percentage of budget used
- **Cost Savings**: Savings from optimization vs naive selection
- **Agent Efficiency**: Cost effectiveness by agent type

## Examples

See the `examples/` directory for:
- `cost-optimized-debugging.js` - Debugging with budget constraints
- `budget-management.js` - Working with project budgets
- `fallback-chain-demo.js` - Demonstrating fallback strategies

## Testing

```bash
npm test
```

## License

MIT
