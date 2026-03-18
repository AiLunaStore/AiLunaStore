# Agent Collaboration Framework - Architecture

## System Overview

The Agent Collaboration Framework enables parallel task execution by breaking down complex tasks into subtasks and delegating them to specialized agents.

```
┌─────────────────────────────────────────────────────────────────┐
│                     Collaboration Framework                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │ Task Analyzer │───▶│Agent Registry│───▶│ Coordinator  │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                   │                   │                │
│         ▼                   ▼                   ▼                │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │                    Coordination Patterns                 │    │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐       │    │
│  │  │Parallel │ │Sequential│ │Fan-Out/ │ │Pipeline │       │    │
│  │  │Independent│ │Dependent│ │Fan-In   │ │         │       │    │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘       │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Specialized Agents                          │    │
│  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ ┌────────┐ │    │
│  │  │   UI   │ │ Backend│ │Database│ │ Network│ │ Debug  │ │    │
│  │  │Specialist│ │Specialist│ │Specialist│ │Specialist│ │Specialist│ │    │
│  │  └────────┘ └────────┘ └────────┘ └────────┘ └────────┘ │    │
│  └─────────────────────────────────────────────────────────┘    │
│                              │                                   │
│                              ▼                                   │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐       │
│  │   Result     │◀───│   Progress   │◀───│   Error      │       │
│  │  Integrator  │    │   Tracker    │    │   Handler    │       │
│  └──────────────┘    └──────────────┘    └──────────────┘       │
│         │                                                        │
│         ▼                                                        │
│  ┌──────────────┐                                                │
│  │  Performance │                                                │
│  │   Tracker    │                                                │
│  └──────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

## Component Details

### 1. Task Analyzer (`src/core/task-analyzer.js`)

**Purpose**: Decomposes tasks into subtasks with dependency mapping

**Key Methods**:
- `analyze(task)` - Main entry point
- `identifyDomains(description, context)` - Detects relevant domains
- `calculateComplexity(description, domains)` - Scores task complexity (1-10)
- `decompose(task, domains)` - Breaks task into subtasks
- `mapDependencies(subtasks)` - Creates dependency graph
- `identifyParallelizable(subtasks, dependencies)` - Finds parallel execution groups

**Output**:
```javascript
{
  originalTask: task,
  domains: ['ui', 'backend'],
  complexity: 7,
  estimatedTimeMinutes: 15,
  subtasks: [...],
  dependencies: {...},
  parallelizable: [['st-1', 'st-2'], ['st-3']]
}
```

### 2. Agent Registry (`src/core/agent-registry.js`)

**Purpose**: Manages specialized agents and matches them to subtasks

**Key Methods**:
- `register(agent)` - Add new agent
- `findByDomain(domain)` - Find agents by expertise
- `matchAgents(subtasks)` - Match subtasks to best agents
- `getStats()` - Get agent utilization statistics

**Default Agents**:
| Agent | Domains | Best For |
|-------|---------|----------|
| UI/JavaScript Specialist | ui, frontend, javascript | Frontend bugs, UI issues |
| Backend/API Specialist | backend, api, server | API issues, server logic |
| Database Specialist | database, sql, query | Data issues, optimization |
| Network Specialist | network, cors, connectivity | Network errors, CORS |
| Integration Specialist | integration, testing | Component integration |
| Debugging Specialist | debugging, error | Complex bugs, diagnosis |

### 3. Coordinator (`src/core/coordinator.js`)

**Purpose**: Orchestrates subtask execution using coordination patterns

**Key Methods**:
- `execute(params)` - Main execution entry
- `selectPattern(analysis)` - Chooses best pattern based on dependencies
- `registerPattern(name, pattern)` - Add custom patterns

**Pattern Selection Logic**:
1. Has data flow between subtasks? → Pipeline
2. Has dependencies between subtasks? → Sequential Dependent
3. No dependencies? → Parallel Independent
4. Mixed scenario? → Fan-Out/Fan-In

### 4. Coordination Patterns

#### Parallel Independent Pattern
- **Use Case**: Multiple independent tasks
- **Execution**: All at once, no dependencies
- **Example**: UI analysis + Backend analysis + DB analysis

#### Sequential Dependent Pattern
- **Use Case**: Tasks that must complete in order
- **Execution**: Level by level, respecting dependencies
- **Example**: Diagnose → Fix → Test

#### Fan-Out/Fan-In Pattern
- **Use Case**: Divide work, integrate results
- **Execution**: Parallel execution, single integration point
- **Example**: Multi-domain debugging

#### Pipeline Pattern
- **Use Case**: Data flows through stages
- **Execution**: Sequential, output feeds next input
- **Example**: Parse → Transform → Generate

### 5. Progress Tracker (`src/core/progress-tracker.js`)

**Purpose**: Monitors subagent completion and reports progress

**Key Methods**:
- `start(executionId, assignments)` - Begin tracking
- `update(executionId, update)` - Record progress
- `complete(executionId)` / `fail(executionId, error)` - End tracking
- `getExecution(executionId)` - Get current status
- `getStats()` - Get aggregate statistics

**Event Structure**:
```javascript
{
  executionId: 'exec-123',
  subtaskId: 'st-1',
  status: 'started' | 'completed' | 'failed',
  agent: 'agent-id',
  timestamp: 1234567890
}
```

### 6. Result Integrator (`src/core/result-integrator.js`)

**Purpose**: Combines subagent outputs into cohesive final result

**Key Methods**:
- `integrate(params)` - Main integration entry
- `extractFindings(results)` - Pull findings from all subtasks
- `identifyConflicts(findings)` - Detect opposing recommendations
- `resolveConflicts(conflicts, analysis)` - Resolve using strategy
- `synthesizeSolution(task, findings, resolved, analysis)` - Build final solution

**Conflict Resolution Strategies**:
- `priority` - Choose highest priority finding
- `domain` - Choose most relevant to task domain
- `merge` - Combine findings
- `manual` - Flag for human review

### 7. Error Handler (`src/core/error-handler.js`)

**Purpose**: Handles failures with retry, reassignment, or escalation

**Error Types**:
- `timeout` - Execution timeout
- `network` - Network connectivity issues
- `auth` - Authentication/authorization failures
- `not_found` - Missing resources
- `parse` - Data parsing errors
- `resource` - Memory/CPU exhaustion
- `unknown` - Uncategorized errors

**Strategies** (in order):
1. **Retry** - For retryable errors (timeout, network)
2. **Reassign** - Try alternative agent
3. **Escalate** - Escalate to human after threshold
4. **Coordinator Fallback** - Handle directly

### 8. Performance Tracker (`src/core/performance-tracker.js`)

**Purpose**: Collects metrics on speedup, quality, cost, and success

**Key Metrics**:
- **Speedup Factor**: Estimated solo time / Actual collaborative time
- **Quality Score**: Based on completion rate and success rate (0-100)
- **Token Usage**: Estimated input/output tokens
- **Success Rate**: Percentage of successful executions

**Tracking**:
```javascript
{
  executions: { total, successful, failed, successRate },
  timing: { totalDuration, avgDuration, avgSpeedupFactor },
  quality: { avgScore, totalSubtasks },
  cost: { totalTokens, avgTokensPerExecution }
}
```

## Data Flow

```
1. User submits task
        ↓
2. Task Analyzer decomposes task
   - Identify domains
   - Calculate complexity
   - Create subtasks
   - Map dependencies
        ↓
3. Framework decides: Solo or Collaborative?
   - Check thresholds
   - If solo: Return simple result
   - If collaborative: Continue
        ↓
4. Agent Registry matches agents
   - Find best agent for each subtask
   - Consider expertise and load
        ↓
5. Coordinator selects pattern
   - Analyze dependencies
   - Choose optimal pattern
        ↓
6. Execute subtasks
   - Progress Tracker monitors
   - Error Handler manages failures
        ↓
7. Result Integrator combines outputs
   - Extract findings
   - Resolve conflicts
   - Synthesize solution
        ↓
8. Performance Tracker records metrics
        ↓
9. Return integrated result to user
```

## Delegation Decision

```javascript
shouldDelegate(analysis) {
  // Check complexity threshold
  if (analysis.complexity > this.thresholds.complexity) return true;
  
  // Check time threshold
  if (analysis.estimatedTimeMinutes > this.thresholds.estimatedTimeMinutes) 
    return true;
  
  // Check subtask count threshold
  if (analysis.subtasks.length > this.thresholds.subtaskCount) return true;
  
  // Check if multiple domains required
  const uniqueDomains = new Set(analysis.subtasks.map(s => s.domain));
  if (uniqueDomains.size > 1) return true;
  
  return false;
}
```

## Agent Matching Algorithm

```javascript
matchAgents(subtasks) {
  for (const subtask of subtasks) {
    const candidates = findByDomain(subtask.domain);
    
    // Score candidates
    const scored = candidates.map(c => ({
      agent: c.agent,
      score: c.expertise * (1 - c.agent.load) // Expertise * availability
    }));
    
    // Select best
    scored.sort((a, b) => b.score - a.score);
    assignments.push({
      subtask,
      agent: scored[0].agent
    });
  }
}
```

## Extension Points

### Custom Agents

```javascript
class MyAgent extends BaseAgent {
  constructor() {
    super({ id: 'my-agent', domains: ['my-domain'], ... });
  }
  
  async execute(task) {
    // Custom execution logic
  }
}

framework.registerAgent(new MyAgent());
```

### Custom Patterns

```javascript
class MyPattern extends CoordinationPattern {
  async execute(params) {
    // Custom coordination logic
  }
}

framework.coordinator.registerPattern('my-pattern', new MyPattern());
```

### Custom Analyzers

Extend `TaskAnalyzer` and override methods:

```javascript
class MyAnalyzer extends TaskAnalyzer {
  identifyDomains(description, context) {
    // Custom domain detection
    const domains = super.identifyDomains(description, context);
    // Add custom logic
    return domains;
  }
}
```

## Performance Considerations

### Concurrency Control

- Default max concurrency: 10 subtasks
- Configurable per pattern
- Prevents resource exhaustion

### Timeout Handling

- Default timeout: 5 minutes per subtask
- Configurable at framework and pattern level
- Automatic cleanup of stuck executions

### Memory Management

- Execution history limited (default: 1000 entries)
- Automatic cleanup of old executions
- Progress tracker cleanup for completed tasks

## Security Considerations

### Agent Isolation

- Each subtask runs in isolation
- No shared state between agents
- Results passed through integrator

### Error Sanitization

- Error messages sanitized before logging
- Stack traces not exposed to other agents
- Sensitive data filtered from results

### Rate Limiting

- Built-in concurrency limits
- Per-agent max concurrent tasks
- Framework-level throttling available
