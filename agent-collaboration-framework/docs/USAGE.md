# Agent Collaboration Framework - Usage Guide

## Quick Start

### Installation

```bash
# Clone or copy the framework
cd agent-collaboration-framework
npm install
```

### Basic Usage

```javascript
import { CollaborationFramework } from './src/index.js';

// Initialize
const framework = new CollaborationFramework();

// Define a task
const task = {
  id: 'my-task',
  description: 'Debug the login form validation',
  context: {
    error: 'Form submits but shows no error message',
    browser: 'Chrome 120'
  }
};

// Execute
const result = await framework.execute(task);
console.log(result);
```

## Configuration

### Delegation Thresholds

Control when tasks are delegated vs handled solo:

```javascript
const framework = new CollaborationFramework({
  thresholds: {
    complexity: 5,              // Delegate if complexity > 5 (1-10 scale)
    estimatedTimeMinutes: 3,    // Delegate if estimated time > 3 minutes
    subtaskCount: 3             // Delegate if more than 3 subtasks
  }
});
```

### Component Options

```javascript
const framework = new CollaborationFramework({
  // Task Analyzer options
  analyzer: {
    domainKeywords: { /* custom keywords */ }
  },
  
  // Coordinator options
  coordinator: {
    defaultPattern: 'fan-out-fan-in',
    timeoutMs: 300000,
    retryAttempts: 2
  },
  
  // Progress Tracker options
  progress: {
    emitEvents: true,
    logLevel: 'info'
  },
  
  // Error Handler options
  errorHandler: {
    maxRetries: 2,
    enableReassignment: true,
    enableEscalation: true
  },
  
  // Performance Tracker options
  performance: {
    trackTokenUsage: true,
    historySize: 1000
  }
});
```

## Task Definition

### Basic Task

```javascript
const task = {
  id: 'unique-task-id',
  description: 'What needs to be done'
};
```

### Task with Context

```javascript
const task = {
  id: 'debug-task',
  description: 'Debug application crash',
  context: {
    error: 'Error message or stack trace',
    environment: 'OS, versions, etc.',
    logs: ['log line 1', 'log line 2'],
    recentChanges: ['change 1', 'change 2']
  }
};
```

## Understanding Results

### Result Structure

```javascript
{
  executionId: 'exec-1234567890-abc123',
  task: { /* original task */ },
  strategy: 'collaborative',  // or 'solo'
  result: {
    success: true,
    solution: { /* integrated solution */ },
    summary: { /* execution summary */ }
  },
  subtaskResults: [
    {
      subtask: { /* subtask definition */ },
      agent: 'agent-id',
      result: { /* subtask output */ },
      success: true
    }
  ],
  metrics: {
    duration: 1234,           // milliseconds
    subtasks: 5,              // number of subtasks
    speedupFactor: 2.5,       // parallel speedup
    estimatedSoloTime: 30000, // estimated ms if done solo
    quality: { /* quality metrics */ },
    success: true
  }
}
```

## Coordination Patterns

### Parallel Independent

Use when subtasks have no dependencies:

```javascript
import { ParallelIndependentPattern } from './src/patterns/index.js';

const pattern = new ParallelIndependentPattern({
  maxConcurrency: 5,
  timeoutMs: 60000
});
```

### Sequential Dependent

Use when subtasks must execute in order:

```javascript
import { SequentialDependentPattern } from './src/patterns/index.js';

const pattern = new SequentialDependentPattern({
  stopOnFailure: true
});
```

### Fan-Out/Fan-In

Default pattern - delegates to specialists then integrates:

```javascript
import { FanOutFanInPattern } from './src/patterns/index.js';

const pattern = new FanOutFanInPattern();
```

### Pipeline

Use when output of one subtask feeds into the next:

```javascript
import { PipelinePattern } from './src/patterns/index.js';

const pattern = new PipelinePattern({
  passData: true,
  stopOnFailure: true
});
```

## Custom Agents

### Registering a Custom Agent

```javascript
framework.registerAgent({
  id: 'my-custom-agent',
  name: 'My Custom Agent',
  description: 'What this agent does',
  domains: ['custom-domain'],
  capabilities: ['capability-1', 'capability-2'],
  expertise: {
    'Custom Area': 0.95,
    'Related Area': 0.80
  },
  preferences: {
    taskTypes: ['my-task-type'],
    maxConcurrentTasks: 3
  }
});
```

### Creating Agent Class

```javascript
import { BaseAgent } from './src/agents/index.js';

class MyAgent extends BaseAgent {
  constructor() {
    super({
      id: 'my-agent',
      name: 'My Agent',
      domains: ['my-domain'],
      capabilities: ['my-capability'],
      expertise: { 'My Area': 0.95 }
    });
  }

  async execute(task) {
    // Your execution logic
    return {
      success: true,
      output: 'Task completed',
      findings: []
    };
  }
}
```

## Progress Tracking

### Monitoring Progress

```javascript
const framework = new CollaborationFramework({
  progress: {
    emitEvents: true
  }
});

// Access progress tracker
const tracker = framework.progressTracker;

// Get execution status
const status = tracker.getExecution(executionId);
console.log(status.summary);

// Get all active executions
const active = tracker.getActiveExecutions();

// Get statistics
const stats = tracker.getStats();
```

### Progress Events

```javascript
// The framework emits progress events during execution:
{
  executionId: 'exec-123',
  subtaskId: 'subtask-1',
  status: 'started',      // or 'completed', 'failed'
  agent: 'agent-id',
  timestamp: 1234567890
}
```

## Performance Metrics

### Accessing Metrics

```javascript
// Get overall statistics
const stats = framework.getStats();

// Get detailed performance data
const perfStats = framework.performanceTracker.getStats();

// Get speedup analysis
const speedup = framework.performanceTracker.getSpeedupAnalysis();

// Get execution history
const history = framework.performanceTracker.getHistory(50);
```

### Metrics Structure

```javascript
{
  executions: {
    total: 100,
    successful: 95,
    failed: 5,
    successRate: 0.95
  },
  timing: {
    totalDuration: 123456,
    avgDuration: 1234,
    avgSpeedupFactor: 2.5
  },
  quality: {
    avgScore: 85,
    totalSubtasks: 500
  },
  cost: {
    totalTokens: 50000,
    avgTokensPerExecution: 500
  }
}
```

## Error Handling

### Automatic Retry

```javascript
const framework = new CollaborationFramework({
  errorHandler: {
    maxRetries: 3,
    retryDelayMs: 2000
  }
});
```

### Fallback Strategies

The framework automatically handles failures:

1. **Retry** - For retryable errors (timeout, network)
2. **Reassign** - Try a different agent
3. **Escalate** - Escalate to human after threshold
4. **Coordinator Fallback** - Coordinator handles directly

### Handling Errors

```javascript
try {
  const result = await framework.execute(task);
} catch (error) {
  // All fallback strategies exhausted
  console.error('Task failed:', error);
}
```

## Best Practices

### 1. Task Descriptions

Be specific in task descriptions to help the analyzer:

```javascript
// Good
const task = {
  description: 'Debug React component crash when submitting form with empty email'
};

// Less effective
const task = {
  description: 'Fix bug'
};
```

### 2. Context

Provide relevant context for better analysis:

```javascript
const task = {
  description: 'Debug issue',
  context: {
    error: 'Specific error message',
    environment: 'Node.js 20, macOS',
    recentChanges: ['What changed recently']
  }
};
```

### 3. Threshold Tuning

Adjust thresholds based on your use case:

- **Lower thresholds** for complex domains requiring expertise
- **Higher thresholds** for simple, repetitive tasks

### 4. Monitoring

Regularly check performance metrics:

```javascript
// Weekly review
const stats = framework.performanceTracker.getStats();
if (stats.quality.avgScore < 80) {
  console.warn('Quality declining - review agent assignments');
}
```

## Examples

See the `examples/` directory for complete working examples:

- `debugging-workflow.js` - Debugging a desktop application
- `feature-implementation.js` - Implementing a new feature
- `refactoring-task.js` - Code refactoring

Run examples:

```bash
node examples/debugging-workflow.js
node examples/feature-implementation.js
node examples/refactoring-task.js
```

## Testing

Run the test suite:

```bash
npm test
```

## Troubleshooting

### Task Not Being Delegated

Check your thresholds:

```javascript
const analysis = await framework.taskAnalyzer.analyze(task);
console.log('Complexity:', analysis.complexity);
console.log('Should delegate:', framework.shouldDelegate(analysis));
```

### Agent Not Found

Verify agent registration:

```javascript
const agents = framework.agentRegistry.getAllAgents();
console.log('Registered agents:', agents.map(a => a.id));
```

### Poor Performance

Check coordination pattern selection:

```javascript
const analysis = await framework.taskAnalyzer.analyze(task);
const pattern = framework.coordinator.selectPattern(analysis);
console.log('Selected pattern:', pattern);
```
