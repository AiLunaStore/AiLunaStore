# Agent Collaboration Framework

A framework for enabling agents to delegate subtasks to specialized subagents for parallel collaboration, reducing sequential bottlenecks and improving task completion efficiency.

## Overview

The Agent Collaboration Framework provides a structured approach to:
- **Task Decomposition**: Automatically break down complex tasks into parallelizable subtasks
- **Agent Specialization**: Match subtasks to specialized agents based on their expertise
- **Coordination Patterns**: Execute subtasks in parallel, sequence, or pipeline as needed
- **Performance Tracking**: Measure speedup, quality, and cost efficiency

## Quick Start

```javascript
import { CollaborationFramework } from './src/index.js';

// Initialize the framework
const framework = new CollaborationFramework();

// Define a complex task
const task = {
  id: 'debug-desktop-app',
  description: 'Debug the desktop application crash on startup',
  context: {
    error: 'App crashes with "Cannot read property of undefined"',
    logs: ['...'],
    environment: 'macOS 15.3'
  }
};

// Execute with collaboration
const result = await framework.execute(task);
console.log(`Completed in ${result.metrics.duration}ms`);
console.log(`Speedup: ${result.metrics.speedupFactor}x`);
```

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Collaboration Framework                   │
├─────────────────────────────────────────────────────────────┤
│  Task Analyzer → Agent Matcher → Coordinator → Integrator   │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐        │
│  │   UI    │  │ Backend │  │Database │  │ Network │        │
│  │ Specialist│  │Specialist│  │Specialist│  │Specialist│        │
│  └─────────┘  └─────────┘  └─────────┘  └─────────┘        │
│  ┌─────────┐  ┌─────────┐                                    │
│  │Integration│  │Debugging │                                    │
│  │Specialist │  │Specialist│                                    │
│  └─────────┘  └─────────┘                                    │
└─────────────────────────────────────────────────────────────┘
```

## Components

### 1. Task Analyzer (`src/core/task-analyzer.js`)
Analyzes tasks and decomposes them into subtasks with dependency mapping.

### 2. Agent Registry (`src/core/agent-registry.js`)
Registry of specialized agents with capabilities and expertise areas.

### 3. Coordinator (`src/core/coordinator.js`)
Orchestrates subtask execution using various coordination patterns.

### 4. Progress Tracker (`src/core/progress-tracker.js`)
Monitors subagent completion and reports progress.

### 5. Result Integrator (`src/core/result-integrator.js`)
Combines subagent outputs into a cohesive final result.

### 6. Error Handler (`src/core/error-handler.js`)
Handles failures with retry, reassignment, or escalation strategies.

### 7. Performance Tracker (`src/core/performance-tracker.js`)
Collects metrics on speedup, quality, cost, and success rate.

## Agent Specializations

| Agent | Expertise | Best For |
|-------|-----------|----------|
| UI/JavaScript Specialist | HTML/CSS/JS, DOM, event listeners | Frontend bugs, UI issues |
| Backend/API Specialist | Node.js, Express, WebSocket, REST | API issues, server logic |
| Database Specialist | SQL, schemas, queries, migrations | Data issues, query optimization |
| Network Specialist | CORS, firewall, connectivity, DNS | Network errors, connectivity |
| Integration Specialist | Component integration, testing | End-to-end issues, testing |
| Debugging Specialist | Error diagnosis, console logs, stack traces | Complex bugs, root cause analysis |

## Coordination Patterns

### Parallel Independent
Execute subtasks with no dependencies simultaneously.

```javascript
const pattern = new ParallelIndependentPattern();
const results = await pattern.execute(subtasks, agents);
```

### Sequential Dependent
Execute subtasks in order where each depends on the previous.

```javascript
const pattern = new SequentialDependentPattern();
const results = await pattern.execute(subtasks, agents);
```

### Fan-Out/Fan-In
Coordinator delegates to multiple agents, then integrates results.

```javascript
const pattern = new FanOutFanInPattern();
const result = await pattern.execute(task, subtasks, agents);
```

### Pipeline
Output of one subagent feeds into the next.

```javascript
const pattern = new PipelinePattern();
const result = await pattern.execute(subtasks, agents);
```

## Delegation Rules

Tasks are delegated when:
- **Complexity Score** > 5 (on scale of 1-10)
- **Estimated Time** > 3 minutes
- **Number of Subtasks** > 3
- **Required Expertise** spans multiple domains

## Performance Metrics

The framework tracks:
- **Speedup Factor**: Solo time vs collaborative time
- **Quality Metrics**: Error rate, completeness score
- **Cost Efficiency**: Token usage per task
- **Success Rate**: Task completion percentage

## Examples

See the `examples/` directory for:
- `debugging-workflow.js` - Debugging a desktop application
- `feature-implementation.js` - Implementing a new feature
- `refactoring-task.js` - Code refactoring with parallel analysis

## Testing

```bash
npm test
```

## License

MIT
