import { IntegratedAgentSystem } from '../src/index.js';

/**
 * Example: Basic Usage
 * 
 * This example demonstrates the basic usage of the Integrated Agent System.
 */

async function basicExample() {
  console.log('🚀 Integrated Agent System - Basic Example\n');

  // Initialize the system
  const system = new IntegratedAgentSystem({
    defaultBudget: 10.00,
    alertThresholds: [0.5, 0.8, 0.95]
  });

  // Set up event handlers
  system.on('onTaskStart', ({ executionId, task, routing }) => {
    console.log(`▶️  Task started: ${task.id}`);
    console.log(`   Type: ${routing.taskType}`);
    console.log(`   Strategy: ${routing.strategy}`);
    console.log(`   Agent: ${routing.agentName}`);
    console.log(`   Model: ${routing.modelName}`);
    console.log(`   Estimated cost: $${routing.estimatedCost.toFixed(4)}\n`);
  });

  system.on('onTaskComplete', ({ executionId, result }) => {
    console.log(`✅ Task completed: ${executionId}`);
    console.log(`   Duration: ${result.metrics.duration}ms`);
    console.log(`   Cost: $${result.metrics.cost.toFixed(4)}`);
    console.log(`   Quality: ${(result.metrics.qualityScore * 100).toFixed(0)}%\n`);
  });

  system.on('onFallback', ({ reason, from, to }) => {
    console.log(`🔄 Fallback triggered: ${reason}`);
    console.log(`   From: ${from.model}`);
    console.log(`   To: ${to?.model || 'none remaining'}\n`);
  });

  // Example 1: Coding task
  console.log('--- Example 1: Coding Task ---');
  const codingResult = await system.execute({
    id: 'coding-task-1',
    description: 'Implement a React component for user authentication with JWT tokens',
    complexity: 8
  });

  console.log('Result:', {
    success: codingResult.result.success,
    model: codingResult.metrics.model,
    cost: `$${codingResult.metrics.cost.toFixed(4)}`,
    duration: `${codingResult.metrics.duration}ms`,
    fallbackUsed: codingResult.result.fallbackUsed
  });

  // Example 2: Research task
  console.log('\n--- Example 2: Research Task ---');
  const researchResult = await system.execute({
    id: 'research-task-1',
    description: 'Research the best state management libraries for React in 2025',
    complexity: 5
  }, {
    strategy: 'research'  // Use research-optimized strategy
  });

  console.log('Result:', {
    success: researchResult.result.success,
    model: researchResult.metrics.model,
    cost: `$${researchResult.metrics.cost.toFixed(4)}`,
    taskType: researchResult.routing.taskType
  });

  // Example 3: Planning task
  console.log('\n--- Example 3: Planning Task ---');
  const planningResult = await system.execute({
    id: 'planning-task-1',
    description: 'Design the architecture for a real-time collaboration feature',
    complexity: 9
  }, {
    strategy: 'planning'
  });

  console.log('Result:', {
    success: planningResult.result.success,
    model: planningResult.metrics.model,
    cost: `$${planningResult.metrics.cost.toFixed(4)}`
  });

  // Example 4: Economy strategy (budget-conscious)
  console.log('\n--- Example 4: Economy Strategy ---');
  const economyResult = await system.execute({
    id: 'economy-task-1',
    description: 'Create a simple API endpoint for user registration',
    complexity: 4
  }, {
    strategy: 'economy'
  });

  console.log('Result:', {
    success: economyResult.result.success,
    model: economyResult.metrics.model,
    cost: `$${economyResult.metrics.cost.toFixed(4)}`,
    strategy: economyResult.routing.strategy
  });

  // Print system status
  console.log('\n--- System Status ---');
  const status = system.getStatus();
  console.log('Active executions:', status.orchestrator.activeExecutions);
  console.log('Total executions:', status.performanceMonitor.overall.totalExecutions);
  console.log('Success rate:', `${status.performanceMonitor.overall.successRate.toFixed(1)}%`);
  console.log('Budget utilization:', `${status.costTracker.globalUtilization.toFixed(1)}%`);

  // Print cost report
  console.log('\n--- Cost Report ---');
  const costReport = system.getCostReport();
  console.log('Total spent:', `$${costReport.status.totalSpent.toFixed(4)}`);
  console.log('Total budget:', `$${costReport.status.totalLimit.toFixed(2)}`);
  console.log('Remaining:', `$${costReport.status.totalRemaining.toFixed(4)}`);

  // Print performance report
  console.log('\n--- Performance Report ---');
  const perfReport = system.getPerformanceReport();
  console.log('Average cost per task:', `$${perfReport.summary.overall.averageCost.toFixed(4)}`);
  console.log('Average quality:', `${(perfReport.quality.overallQuality * 100).toFixed(1)}%`);

  // Print cost comparison with Kimi-only
  console.log('\n--- Cost Comparison vs Kimi-Only ---');
  console.log('Kimi-only cost:', `$${perfReport.comparison.kimiOnlyCost.toFixed(4)}`);
  console.log('Optimized cost:', `$${perfReport.comparison.optimizedCost.toFixed(4)}`);
  console.log('Savings:', `$${perfReport.comparison.savings.toFixed(4)}`);
  console.log('Savings %:', `${perfReport.comparison.savingsPercent.toFixed(1)}%`);

  console.log('\n✨ Example completed!');
}

// Run the example
basicExample().catch(console.error);
