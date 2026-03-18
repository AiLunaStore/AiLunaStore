# Troubleshooting Guide

This guide helps you diagnose and resolve common issues with the Integrated Agent System.

## Table of Contents

1. [Installation Issues](#installation-issues)
2. [Configuration Errors](#configuration-errors)
3. [Execution Failures](#execution-failures)
4. [Budget Issues](#budget-issues)
5. [Performance Problems](#performance-problems)
6. [Model Failures](#model-failures)
7. [Dashboard Issues](#dashboard-issues)

## Installation Issues

### Module Not Found

**Error:**
```
Error: Cannot find module '../config/models.json'
```

**Solution:**
1. Ensure you're running from the project root
2. Check that config files exist:
   ```bash
   ls config/
   ```
3. Verify file permissions:
   ```bash
   chmod 644 config/*.json
   ```

### Import Assertions Error

**Error:**
```
SyntaxError: Unexpected token 'assert'
```

**Solution:**
Update to Node.js 18+ or use the `--experimental-import-meta-resolve` flag:
```bash
node --experimental-import-meta-resolve src/index.js
```

## Configuration Errors

### Invalid JSON

**Error:**
```
SyntaxError: Unexpected token } in JSON at position 1234
```

**Solution:**
1. Validate JSON syntax:
   ```bash
   node -e "JSON.parse(require('fs').readFileSync('config/models.json'))"
   ```
2. Use a JSON linter (e.g., jsonlint.com)
3. Check for trailing commas (not allowed in JSON)

### Missing Required Fields

**Error:**
```
Error: Model must have an id
```

**Solution:**
Check configuration files for required fields:
- **models.json**: `id`, `name`, `provider`, `pricing`, `capabilities`
- **agents.json**: `id`, `name`, `primaryModel`, `domains`
- **strategies.json**: `id`, `weights`, `constraints`

### Model Not Found

**Error:**
```
Error: Model minimax-m2.5 not found
```

**Solution:**
1. Verify model ID in `config/models.json`
2. Check for typos in references
3. Ensure model is defined before agents that use it

## Execution Failures

### Task Rejected - Budget

**Error:**
```javascript
{
  strategy: 'rejected',
  reason: 'Insufficient budget',
  budgetStatus: { available: 0.5, cost: 1.0 }
}
```

**Solution:**
1. Check current budget status:
   ```javascript
   console.log(system.costTracker.getStatus());
   ```
2. Increase budget or use economy strategy:
   ```javascript
   await system.execute(task, { strategy: 'economy' });
   ```
3. Reset budget if needed:
   ```javascript
   system.costTracker.resetBudget('default');
   ```

### All Fallbacks Exhausted

**Error:**
```
FallbackExhaustedError: All fallback options exhausted for task type: coding
```

**Solution:**
1. Check fallback chain:
   ```javascript
   console.log(system.fallbackManager.getFallbackChain('coding'));
   ```
2. Verify models in chain are configured
3. Check model API keys
4. Review error details:
   ```javascript
   console.log(error.errors);
   ```

### Timeout

**Error:**
```
Error: Execution timed out after 120000ms
```

**Solution:**
1. Increase timeout in config:
   ```json
   // config/fallback-chains.json
   {
     "globalSettings": {
       "timeoutSeconds": 300
     }
   }
   ```
2. Use faster models:
   ```javascript
   await system.execute(task, { strategy: 'speed' });
   ```
3. Break task into smaller subtasks

## Budget Issues

### Budget Alerts Not Firing

**Problem:** Budget exceeded 80% but no alert received

**Solution:**
1. Verify alert thresholds:
   ```javascript
   console.log(system.costTracker.alertThresholds);
   ```
2. Register alert handler:
   ```javascript
   system.costTracker.onAlert((alert) => {
     console.log('Budget alert:', alert.message);
   });
   ```
3. Check if alerts were already triggered:
   ```javascript
   console.log(system.costTracker.getBudgetStatus('default').alertsTriggered);
   ```

### Incorrect Cost Tracking

**Problem:** Costs don't match expected values

**Solution:**
1. Verify model pricing in config
2. Check token estimation:
   ```javascript
   const routing = system.taskRouter.classifyAndRoute(task);
   console.log('Estimated cost:', routing.estimatedCost);
   ```
3. Review actual costs:
   ```javascript
   console.log(system.costTracker.getBreakdown('model'));
   ```

### Budget Not Resetting

**Problem:** Budget persists across restarts

**Solution:**
Budgets are in-memory only. To persist:
1. Save budget state before exit:
   ```javascript
   const state = system.costTracker.getAllBudgets();
   fs.writeFileSync('budget-state.json', JSON.stringify(state));
   ```
2. Restore on startup:
   ```javascript
   const state = JSON.parse(fs.readFileSync('budget-state.json'));
   for (const budget of state) {
     system.costTracker.initBudget(budget.id, { limit: budget.limit });
   }
   ```

## Performance Problems

### Slow Task Execution

**Problem:** Tasks taking longer than expected

**Solution:**
1. Check which model is being used:
   ```javascript
   const result = await system.execute(task);
   console.log('Model used:', result.metrics.model);
   ```
2. Use speed strategy:
   ```javascript
   await system.execute(task, { strategy: 'speed' });
   ```
3. Check performance metrics:
   ```javascript
   console.log(system.performanceMonitor.getSummary());
   ```

### High Memory Usage

**Problem:** System using too much memory

**Solution:**
1. Reduce history size:
   ```javascript
   const system = new IntegratedAgentSystem({
     maxHistorySize: 100
   });
   ```
2. Clear old metrics:
   ```javascript
   system.performanceMonitor.reset();
   ```
3. Monitor active executions:
   ```javascript
   console.log(system.orchestrator.getStatus().activeExecutions);
   ```

### Poor Quality Results

**Problem:** Task quality below expectations

**Solution:**
1. Use quality strategy:
   ```javascript
   await system.execute(task, { strategy: 'quality' });
   ```
2. Check quality scores:
   ```javascript
   const report = system.getPerformanceReport();
   console.log(report.quality);
   ```
3. Verify fallback chain isn't skipping high-quality models

## Model Failures

### API Key Invalid

**Error:**
```
Error: Invalid API key for model minimax-m2.5
```

**Solution:**
1. Check environment variables:
   ```bash
   echo $MINIMAX_API_KEY
   ```
2. Verify key in `.env` file
3. Restart application after updating keys

### Rate Limit Exceeded

**Error:**
```
Error: Rate limit exceeded for provider MiniMax
```

**Solution:**
1. Implement rate limiting:
   ```javascript
   await new Promise(resolve => setTimeout(resolve, 1000));
   ```
2. Use fallback models:
   ```javascript
   // Fallback chain will automatically try other models
   ```
3. Check provider rate limits and adjust

### Model Unavailable

**Error:**
```
Error: Model minimax-m2.5 temporarily unavailable
```

**Solution:**
1. Check provider status page
2. Fallback chain will try alternatives automatically
3. Temporarily modify fallback chain:
   ```javascript
   // Use DeepSeek instead
   const result = await system.execute(task, {
     strategy: 'balanced'
   });
   ```

## Dashboard Issues

### Dashboard Not Loading

**Problem:** Mission Control shows blank page

**Solution:**
1. Check file path:
   ```bash
   ls mission-control/index.html
   ```
2. Open directly in browser:
   ```bash
   open mission-control/index.html
   ```
3. Check browser console for JavaScript errors

### Data Not Updating

**Problem:** Dashboard shows stale data

**Solution:**
1. Check connection status indicator
2. Verify system is running:
   ```javascript
   console.log(system.getStatus());
   ```
3. Refresh dashboard manually
4. Check for CORS issues if running remotely

### Charts Not Rendering

**Problem:** Cost charts show placeholder text

**Solution:**
1. Check for Chart.js or canvas issues in console
2. Verify data is available:
   ```javascript
   console.log(system.getDashboardData());
   ```
3. Try different browser

## Debugging Tips

### Enable Debug Logging

```javascript
const system = new IntegratedAgentSystem({
  debug: true
});

// Or set environment variable
DEBUG=* node app.js
```

### Inspect Execution Flow

```javascript
system.on('onTaskStart', (data) => {
  console.log('Task started:', data.executionId);
  console.log('Routing:', data.routing);
});

system.on('onFallback', (data) => {
  console.log('Fallback triggered:', data.reason);
  console.log('From:', data.from.model);
  console.log('To:', data.to?.model);
});

system.on('onTaskComplete', (data) => {
  console.log('Task completed:', data.result);
});
```

### Validate Configuration

```bash
# Run all validation tests
npm test

# Run specific tests
npm test -- test/config-validation.test.js
npm test -- test/integration.test.js
npm test -- test/cost-savings.test.js
```

### Check System Health

```javascript
function healthCheck() {
  const status = system.getStatus();
  
  console.log('=== System Health Check ===');
  console.log('Active executions:', status.orchestrator.activeExecutions);
  console.log('Budget utilization:', status.costTracker.globalUtilization.toFixed(1) + '%');
  console.log('Success rate:', status.performanceMonitor.overall.successRate.toFixed(1) + '%');
  console.log('Total executions:', status.performanceMonitor.overall.totalExecutions);
  
  // Check for issues
  const issues = [];
  
  if (status.costTracker.globalUtilization > 90) {
    issues.push('Budget nearly exhausted');
  }
  
  if (status.performanceMonitor.overall.successRate < 80) {
    issues.push('Success rate below threshold');
  }
  
  if (issues.length > 0) {
    console.log('\n⚠️  Issues detected:');
    issues.forEach(issue => console.log('  - ' + issue));
  } else {
    console.log('\n✅ System healthy');
  }
}

healthCheck();
```

## Getting Help

If issues persist:

1. **Check documentation:**
   - README.md
   - docs/ARCHITECTURE.md
   - docs/CONFIGURATION.md

2. **Review examples:**
   - Look at test files for usage patterns
   - Check configuration examples in docs/

3. **Enable verbose logging:**
   ```bash
   DEBUG=integrated-agent-system:* node app.js
   ```

4. **Create minimal reproduction:**
   ```javascript
   // minimal-test.js
   import { IntegratedAgentSystem } from './src/index.js';
   
   const system = new IntegratedAgentSystem();
   
   system.execute({
     id: 'test',
     description: 'Simple test task'
   }).then(console.log).catch(console.error);
   ```

5. **Check for updates:**
   ```bash
   git pull
   npm update
   ```

## Common Error Codes

| Error | Meaning | Solution |
|-------|---------|----------|
| `BUDGET_EXCEEDED` | Task cost exceeds available budget | Increase budget or use economy strategy |
| `FALLBACK_EXHAUSTED` | All fallback models failed | Check model configurations and API keys |
| `TIMEOUT` | Task took too long | Increase timeout or use faster models |
| `INVALID_CONFIG` | Configuration error | Validate JSON and required fields |
| `MODEL_NOT_FOUND` | Referenced model doesn't exist | Check model IDs in configuration |
| `AGENT_NOT_FOUND` | Referenced agent doesn't exist | Check agent IDs in configuration |

## Reset Everything

If you need a fresh start:

```javascript
// Reset all components
system.costTracker.resetBudget('default');
system.performanceMonitor.reset();
system.fallbackManager.stats = { totalFallbacks: 0, byTaskType: {}, byReason: {} };

// Or reinitialize
system = new IntegratedAgentSystem();
```
