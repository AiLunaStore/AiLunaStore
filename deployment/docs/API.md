# API Documentation

## REST API

### Authentication

Currently, the API does not require authentication. For production deployments, consider adding:
- API key authentication
- JWT tokens
- OAuth integration

### Base URL

```
http://localhost:8080/api
```

### Response Format

All responses are JSON:

```json
{
  "data": {},
  "timestamp": 1234567890
}
```

Error responses:

```json
{
  "error": "Error message",
  "timestamp": 1234567890
}
```

---

## Endpoints

### Health Check

```http
GET /api/health
```

Check if the server is running.

**Response:**
```json
{
  "status": "healthy",
  "uptime": 3600000,
  "uptimeFormatted": "1h",
  "version": "2.0.0",
  "nodeEnv": "production",
  "activeConnections": 5,
  "totalRequests": 150,
  "timestamp": 1234567890
}
```

---

### System Status

```http
GET /api/status
```

Get comprehensive system status.

**Response:**
```json
{
  "system": {
    "status": "healthy",
    "uptime": 3600000,
    "version": "2.0.0"
  },
  "agentSystem": {
    "activeExecutions": 2,
    "totalExecutions": 150,
    "models": ["minimax-m2.5", "deepseek-v3.2"],
    "agents": ["coding-specialist", "orchestrator"]
  }
}
```

---

### List Agents

```http
GET /api/agents
```

Get all agents and their status.

**Response:**
```json
{
  "agents": [
    {
      "id": "coding-specialist",
      "name": "Coding Specialist",
      "status": "active",
      "model": "minimax-m2.5",
      "tasksCompleted": 45,
      "currentTask": "Implementing feature X",
      "lastActive": 1234567890
    }
  ],
  "activeCount": 3,
  "totalCount": 7
}
```

---

### Get Agent

```http
GET /api/agents/:id
```

Get specific agent details.

**Parameters:**
- `id` (path) - Agent ID

**Response:**
```json
{
  "id": "coding-specialist",
  "name": "Coding Specialist",
  "status": "active",
  "model": "minimax-m2.5",
  "tasksCompleted": 45,
  "currentTask": "Implementing feature X",
  "lastActive": 1234567890
}
```

---

### Get Metrics

```http
GET /api/metrics
```

Get dashboard metrics.

**Response:**
```json
{
  "currentSpending": 2.50,
  "totalBudget": 10.00,
  "budgetUtilization": 0.25,
  "totalExecutions": 150,
  "successRate": 98.5,
  "avgCostPerTask": 0.0167,
  "costSavings": 3.20,
  "savingsPercent": 56.0,
  "avgDuration": 2500,
  "avgQuality": 8.5,
  "byModel": {
    "minimax-m2.5": {
      "total": 1.50,
      "count": 50,
      "average": 0.03
    }
  },
  "byAgent": {},
  "byTaskType": {},
  "recentHistory": []
}
```

---

### Get Cost Report

```http
GET /api/costs
```

Get detailed cost report.

**Response:**
```json
{
  "status": {
    "totalSpent": 2.50,
    "totalLimit": 10.00,
    "globalUtilization": 25.0
  },
  "breakdowns": {
    "byModel": {},
    "byAgent": {},
    "byTaskType": {}
  },
  "budgets": [],
  "recentHistory": []
}
```

---

### Get Performance Report

```http
GET /api/performance
```

Get performance metrics.

**Response:**
```json
{
  "summary": {
    "overall": {
      "totalExecutions": 150,
      "successRate": 98.5,
      "averageCost": 0.0167,
      "averageDuration": 2500
    },
    "byModel": {},
    "byAgent": {}
  },
  "quality": {
    "overallQuality": 8.5,
    "highQualityRate": 92.0
  },
  "comparison": {
    "kimiOnlyCost": 5.70,
    "optimizedCost": 2.50,
    "savings": 3.20,
    "savingsPercent": 56.0
  }
}
```

---

### Get Execution History

```http
GET /api/history
```

Get execution history.

**Query Parameters:**
- `limit` (number) - Max results (default: 50)
- `model` (string) - Filter by model
- `agent` (string) - Filter by agent
- `taskType` (string) - Filter by task type

**Response:**
```json
[
  {
    "executionId": "exec-123",
    "task": {
      "id": "task-1",
      "description": "Implement feature",
      "complexity": 7
    },
    "result": {
      "success": true,
      "model": "minimax-m2.5",
      "agent": "coding-specialist"
    },
    "metrics": {
      "duration": 2500,
      "cost": 0.0167
    },
    "timestamp": 1234567890
  }
]
```

---

### Execute Task

```http
POST /api/execute
```

Execute a new task.

**Request Body:**
```json
{
  "id": "task-123",
  "description": "Implement a React component",
  "complexity": 7,
  "domain": "coding",
  "strategy": "balanced",
  "budget": 1.00
}
```

**Response:**
```json
{
  "success": true,
  "result": {
    "executionId": "exec-123",
    "output": "Executed task...",
    "model": "minimax-m2.5",
    "agent": "coding-specialist",
    "actualCost": 0.0167,
    "qualityScore": 0.85
  },
  "duration": 2500,
  "apiLatency": 50
}
```

---

### Update Configuration

```http
POST /api/config
```

Update system configuration.

**Request Body:**
```json
{
  "strategy": "quality",
  "budget": 20.00
}
```

**Response:**
```json
{
  "success": true,
  "config": {
    "strategy": "quality",
    "budget": 20.00
  }
}
```

---

## WebSocket API

### Connection

```javascript
const ws = new WebSocket('ws://localhost:8080/ws');
```

### Client → Server Messages

#### Ping

```json
{
  "type": "ping"
}
```

#### Get Agents

```json
{
  "type": "get_agents"
}
```

#### Get Metrics

```json
{
  "type": "get_metrics"
}
```

#### Execute Task

```json
{
  "type": "execute_task",
  "payload": {
    "id": "task-123",
    "description": "Implement feature",
    "complexity": 7,
    "strategy": "balanced",
    "budget": 1.00
  }
}
```

#### Set Strategy

```json
{
  "type": "set_strategy",
  "payload": {
    "mode": "progressive"
  }
}
```

#### Update Budget

```json
{
  "type": "update_budget",
  "payload": {
    "limit": 20.00
  }
}
```

### Server → Client Messages

#### Init

Sent on initial connection:

```json
{
  "type": "init",
  "data": {
    "system": {},
    "agents": {},
    "metrics": {},
    "timestamp": 1234567890
  }
}
```

#### Update

Periodic updates (every 5 seconds):

```json
{
  "type": "update",
  "data": {
    "agents": {},
    "metrics": {},
    "system": {},
    "timestamp": 1234567890
  }
}
```

#### Task Result

```json
{
  "type": "task_result",
  "data": {
    "success": true,
    "result": {},
    "duration": 2500
  }
}
```

#### Error

```json
{
  "type": "error",
  "error": "Error message"
}
```

---

## Error Codes

| HTTP Status | Description |
|-------------|-------------|
| 200 | Success |
| 400 | Bad Request |
| 404 | Not Found |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

Default limits:
- 100 requests per 60 seconds per IP

Headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1234567890
```
