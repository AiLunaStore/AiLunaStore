# Configuration Guide

This guide explains how to configure the Integrated Agent System for your specific needs.

## Table of Contents

1. [Models Configuration](#models-configuration)
2. [Agents Configuration](#agents-configuration)
3. [Strategies Configuration](#strategies-configuration)
4. [Fallback Chains Configuration](#fallback-chains-configuration)
5. [Environment Variables](#environment-variables)
6. [Examples](#examples)

## Models Configuration

File: `config/models.json`

### Structure

```json
{
  "model-id": {
    "id": "model-id",
    "name": "Display Name",
    "provider": "API Provider",
    "apiEndpoint": "endpoint-name",
    "capabilities": {
      "coding": 1-10,
      "reasoning": 1-10,
      "planning": 1-10,
      "research": 1-10,
      "chat": 1-10
    },
    "pricing": {
      "inputPer1M": 0.00,
      "outputPer1M": 0.00,
      "currency": "USD"
    },
    "performance": {
      "sweBench": 0-100,
      "speed": 1-10,
      "contextWindow": 0
    },
    "bestFor": ["task-type-1", "task-type-2"],
    "fallbackTo": "fallback-model-id"
  }
}
```

### Example: Adding MiniMax M2.5

```json
{
  "minimax-m2.5": {
    "id": "minimax-m2.5",
    "name": "MiniMax M2.5",
    "provider": "MiniMax",
    "apiEndpoint": "minimax",
    "capabilities": {
      "coding": 10,
      "reasoning": 9,
      "planning": 8,
      "research": 7,
      "chat": 8
    },
    "pricing": {
      "inputPer1M": 0.30,
      "outputPer1M": 1.20,
      "currency": "USD"
    },
    "performance": {
      "sweBench": 80.2,
      "speed": 7,
      "contextWindow": 1000000
    },
    "bestFor": ["coding", "implementation", "debugging"],
    "fallbackTo": "deepseek-v3.2"
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `provider` | string | API provider name |
| `apiEndpoint` | string | Endpoint identifier |
| `capabilities` | object | Capability scores (1-10) |
| `pricing` | object | Cost per 1M tokens |
| `performance` | object | Performance metrics |
| `bestFor` | array | Task types this model excels at |
| `fallbackTo` | string | Next model in fallback chain |

## Agents Configuration

File: `config/agents.json`

### Structure

```json
{
  "agent-id": {
    "id": "agent-id",
    "name": "Display Name",
    "description": "What this agent does",
    "primaryModel": "model-id",
    "fallbackChain": ["model-1", "model-2", "model-3"],
    "domains": ["domain-1", "domain-2"],
    "capabilities": ["capability-1", "capability-2"],
    "expertise": {
      "skill-1": 0.0-1.0,
      "skill-2": 0.0-1.0
    },
    "costProfile": {
      "avgInputTokens": 0,
      "avgOutputTokens": 0,
      "estimatedCostPerTask": 0.00
    },
    "quality": 1-10,
    "speed": 1-10
  }
}
```

### Example: Coding Specialist

```json
{
  "coding-specialist": {
    "id": "coding-specialist",
    "name": "Coding Specialist",
    "description": "Expert in code implementation, debugging, and optimization",
    "primaryModel": "minimax-m2.5",
    "fallbackChain": ["deepseek-v3.2", "gemini-3.1-pro", "claude-sonnet"],
    "domains": ["coding", "implementation", "debugging", "refactoring"],
    "capabilities": [
      "write_code",
      "debug_errors",
      "optimize_performance",
      "refactor_code"
    ],
    "expertise": {
      "JavaScript": 0.95,
      "TypeScript": 0.95,
      "Python": 0.90,
      "React": 0.90
    },
    "costProfile": {
      "avgInputTokens": 3000,
      "avgOutputTokens": 2500,
      "estimatedCostPerTask": 0.0039
    },
    "quality": 10,
    "speed": 7
  }
}
```

### Field Descriptions

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Unique identifier |
| `name` | string | Display name |
| `description` | string | Agent description |
| `primaryModel` | string | Default model for this agent |
| `fallbackChain` | array | Ordered list of fallback models |
| `domains` | array | Task domains this agent handles |
| `capabilities` | array | Specific capabilities |
| `expertise` | object | Skill levels (0-1) |
| `costProfile` | object | Typical token usage and cost |
| `quality` | number | Quality score (1-10) |
| `speed` | number | Speed score (1-10) |

## Strategies Configuration

File: `config/strategies.json`

### Structure

```json
{
  "strategies": {
    "strategy-id": {
      "id": "strategy-id",
      "name": "Display Name",
      "description": "What this strategy does",
      "weights": {
        "quality": 0.0-1.0,
        "cost": 0.0-1.0,
        "speed": 0.0-1.0
      },
      "constraints": {
        "minQuality": 1-10,
        "maxCostPerTask": 0.00
      },
      "preferredAgents": ["agent-1", "agent-2"],
      "fallbackStrategy": "fallback-strategy-id"
    }
  },
  "defaultStrategy": "strategy-id",
  "strategySelectionRules": [
    {
      "condition": "rule-expression",
      "strategy": "strategy-id"
    }
  ]
}
```

### Example: Balanced Strategy

```json
{
  "balanced": {
    "id": "balanced",
    "name": "Balanced",
    "description": "Optimal balance between quality and cost",
    "weights": {
      "quality": 0.4,
      "cost": 0.4,
      "speed": 0.2
    },
    "constraints": {
      "minQuality": 7,
      "maxCostPerTask": 0.01
    },
    "fallbackStrategy": "quality"
  }
}
```

### Built-in Strategies

| Strategy | Quality | Cost | Speed | Use Case |
|----------|---------|------|-------|----------|
| `balanced` | 40% | 40% | 20% | General purpose |
| `quality` | 80% | 10% | 10% | Critical tasks |
| `economy` | 20% | 70% | 10% | Cost-sensitive |
| `speed` | 20% | 20% | 60% | Fast iteration |
| `coding` | 60% | 20% | 20% | Code tasks |
| `research` | 30% | 50% | 20% | Research tasks |
| `planning` | 70% | 20% | 10% | Planning tasks |

### Strategy Selection Rules

Rules are evaluated in order to automatically select strategies:

```json
{
  "strategySelectionRules": [
    {
      "condition": "task.type == 'coding'",
      "strategy": "coding"
    },
    {
      "condition": "budget.remaining < 1.0",
      "strategy": "economy"
    }
  ]
}
```

## Fallback Chains Configuration

File: `config/fallback-chains.json`

### Structure

```json
{
  "fallbackChains": {
    "task-type": {
      "taskType": "task-type",
      "description": "Description of this chain",
      "chain": [
        {
          "model": "primary-model",
          "agent": "primary-agent",
          "rationale": "Why this is first",
          "maxRetries": 2
        },
        {
          "model": "fallback-model",
          "agent": "fallback-agent",
          "rationale": "Why this is second",
          "maxRetries": 2
        }
      ],
      "escalationRules": {
        "onFailure": "escalate_to_next",
        "onTimeout": "retry_then_escalate",
        "onQualityCheck": "escalate_if_below_threshold"
      }
    }
  },
  "globalSettings": {
    "maxEscalations": 3,
    "escalationDelayMs": 1000,
    "qualityThreshold": 0.7,
    "timeoutSeconds": 120
  }
}
```

### Example: Coding Fallback Chain

```json
{
  "coding": {
    "taskType": "coding",
    "description": "Fallback chain for coding tasks",
    "chain": [
      {
        "model": "minimax-m2.5",
        "agent": "coding-specialist",
        "rationale": "Primary coding model - best SWE-bench performance at low cost",
        "maxRetries": 2
      },
      {
        "model": "deepseek-v3.2",
        "agent": "coding-specialist",
        "rationale": "Fallback to DeepSeek V3.2 - excellent coding at lower cost",
        "maxRetries": 2
      },
      {
        "model": "gemini-3.1-pro",
        "agent": "coding-specialist",
        "rationale": "Fallback to Gemini 3.1 Pro - strong coding with large context",
        "maxRetries": 1
      },
      {
        "model": "claude-sonnet",
        "agent": "coding-specialist",
        "rationale": "Final fallback to Claude Sonnet - highest quality, highest cost",
        "maxRetries": 1
      }
    ],
    "escalationRules": {
      "onFailure": "escalate_to_next",
      "onTimeout": "retry_then_escalate",
      "onQualityCheck": "escalate_if_below_threshold"
    }
  }
}
```

## Environment Variables

Create a `.env` file in your project root:

```bash
# API Keys (required)
MINIMAX_API_KEY=your-minimax-key
DEEPSEEK_API_KEY=your-deepseek-key
GEMINI_API_KEY=your-gemini-key
ANTHROPIC_API_KEY=your-anthropic-key
OPENAI_API_KEY=your-openai-key

# Default Settings
DEFAULT_BUDGET=10.00
DEFAULT_STRATEGY=balanced
ALERT_THRESHOLDS=0.5,0.8,0.95

# Performance
MAX_HISTORY_SIZE=1000
TIMEOUT_SECONDS=120
MAX_RETRIES=3

# Debug
DEBUG_MODE=false
LOG_LEVEL=info
```

## Examples

### Example 1: Adding a New Model

Let's add GPT-5 when it becomes available:

```json
// config/models.json
{
  "gpt-5": {
    "id": "gpt-5",
    "name": "GPT-5",
    "provider": "OpenAI",
    "apiEndpoint": "openai",
    "capabilities": {
      "coding": 10,
      "reasoning": 10,
      "planning": 9,
      "research": 9,
      "chat": 10
    },
    "pricing": {
      "inputPer1M": 5.00,
      "outputPer1M": 15.00,
      "currency": "USD"
    },
    "performance": {
      "sweBench": 85.0,
      "speed": 8,
      "contextWindow": 256000
    },
    "bestFor": ["coding", "complex-reasoning"],
    "fallbackTo": "claude-sonnet"
  }
}
```

Then update the coding agent to use it:

```json
// config/agents.json
{
  "coding-specialist": {
    "primaryModel": "gpt-5",
    "fallbackChain": ["minimax-m2.5", "deepseek-v3.2", "claude-sonnet"]
  }
}
```

### Example 2: Creating a Custom Strategy

Create a "prototyping" strategy that prioritizes speed and cost:

```json
// config/strategies.json
{
  "strategies": {
    "prototyping": {
      "id": "prototyping",
      "name": "Prototyping",
      "description": "Fast and cheap for rapid prototyping",
      "weights": {
        "quality": 0.1,
        "cost": 0.5,
        "speed": 0.4
      },
      "constraints": {
        "minQuality": 5,
        "maxCostPerTask": 0.002
      },
      "preferredAgents": ["research-specialist", "integration-specialist"],
      "fallbackStrategy": "economy"
    }
  }
}
```

### Example 3: Custom Fallback Chain

Create a specialized chain for security tasks:

```json
// config/fallback-chains.json
{
  "security": {
    "taskType": "security",
    "description": "Fallback chain for security-sensitive tasks",
    "chain": [
      {
        "model": "claude-sonnet",
        "agent": "coding-specialist",
        "rationale": "Claude has strong safety alignment",
        "maxRetries": 2
      },
      {
        "model": "minimax-m2.5",
        "agent": "coding-specialist",
        "rationale": "Fallback to MiniMax for speed",
        "maxRetries": 2
      }
    ],
    "escalationRules": {
      "onFailure": "escalate_to_next",
      "onTimeout": "retry_then_escalate"
    }
  }
}
```

### Example 4: Budget-Conscious Configuration

For a project with strict budget constraints:

```javascript
// system-config.js
import { IntegratedAgentSystem } from './src/index.js';

const system = new IntegratedAgentSystem({
  defaultBudget: 2.00,  // Low default budget
  alertThresholds: [0.3, 0.6, 0.9],  // Earlier alerts
  maxHistorySize: 500
});

// Force economy strategy for all tasks
const result = await system.execute(task, {
  strategy: 'economy',
  budget: 0.50  // Per-task limit
});
```

## Validation

After making configuration changes, validate them:

```bash
# Run configuration validation tests
npm test -- test/config-validation.test.js

# Validate specific configuration file
node -e "
  const config = require('./config/models.json');
  console.log('Models:', Object.keys(config.models));
  console.log('Valid:', Object.values(config.models).every(m => m.pricing.inputPer1M > 0));
"
```

## Best Practices

1. **Start with defaults** - Use built-in configurations before customizing
2. **Test changes** - Always run tests after configuration changes
3. **Document customizations** - Add comments explaining why changes were made
4. **Version control** - Track configuration changes in git
5. **Monitor costs** - Use Mission Control to verify cost expectations
6. **Iterate gradually** - Make small changes and measure impact

## Troubleshooting

### Configuration Not Loading
- Check JSON syntax (use a validator)
- Verify file paths
- Check for missing required fields

### Model Not Found
- Verify model ID matches exactly
- Check that model is defined in models.json
- Ensure agent references valid model

### Strategy Not Applied
- Check strategy ID matches exactly
- Verify weights sum to 1.0
- Check that selection rules are valid

### Fallback Chain Issues
- Verify all models in chain exist
- Check that agents can use those models
- Validate chain has at least 2 options
