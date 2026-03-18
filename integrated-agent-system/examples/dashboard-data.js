import { IntegratedAgentSystem } from '../src/index.js';

/**
 * Example: Dashboard Data
 * 
 * This example shows how to retrieve and display dashboard data.
 */

async function dashboardExample() {
  console.log('📊 Integrated Agent System - Dashboard Data Example\n');

  const system = new IntegratedAgentSystem({
    defaultBudget: 10.00
  });

  // Execute some tasks to generate data
  console.log('Executing sample tasks...\n');

  const tasks = [
    { type: 'coding', desc: 'Implement login form', complexity: 5 },
    { type: 'research', desc: 'Find auth libraries', complexity: 4 },
    { type: 'coding', desc: 'Create API endpoint', complexity: 6 },
    { type: 'planning', desc: 'Design database schema', complexity: 7 },
    { type: 'ui', desc: 'Style components', complexity: 4 },
    { type: 'integration', desc: 'Connect frontend to backend', complexity: 6 }
  ];

  for (const task of tasks) {
    await system.execute({
      id: `dashboard-task-${task.type}`,
      description: task.desc,
      complexity: task.complexity
    }, {
      strategy: task.type === 'coding' ? 'coding' : 
                task.type === 'research' ? 'research' : 
                task.type === 'planning' ? 'planning' : 'balanced'
    });
  }

  // Get dashboard data
  console.log('--- Dashboard Data ---\n');
  
  const dashboardData = system.getDashboardData();

  // Overview
  console.log('📈 Overview');
  console.log('  Current spending:', `$${dashboardData.currentSpending.toFixed(4)}`);
  console.log('  Budget utilization:', `${dashboardData.budgetUtilization.toFixed(1)}%`);
  console.log('  Total executions:', dashboardData.totalExecutions);
  console.log('  Success rate:', `${dashboardData.successRate.toFixed(1)}%`);
  console.log('  Cost savings:', `$${dashboardData.costSavings.toFixed(4)} (${dashboardData.savingsPercent}%)`);
  console.log('');

  // Performance
  console.log('⚡ Performance');
  console.log('  Avg cost per task:', `$${dashboardData.avgCostPerTask.toFixed(4)}`);
  console.log('  Avg duration:', `${dashboardData.avgDuration.toFixed(0)}ms`);
  console.log('  Avg quality:', `${(dashboardData.avgQuality * 100).toFixed(1)}%`);
  console.log('');

  // Model breakdown
  console.log('🤖 Model Usage');
  for (const [model, data] of Object.entries(dashboardData.byModel)) {
    console.log(`  ${model}:`);
    console.log(`    Total: $${data.total.toFixed(4)}`);
    console.log(`    Tasks: ${data.count}`);
    console.log(`    Avg: $${data.average.toFixed(4)}`);
  }
  console.log('');

  // Agent breakdown
  console.log('👤 Agent Usage');
  for (const [agent, data] of Object.entries(dashboardData.byAgent)) {
    console.log(`  ${agent}:`);
    console.log(`    Total: $${data.total.toFixed(4)}`);
    console.log(`    Tasks: ${data.count}`);
  }
  console.log('');

  // Task type breakdown
  console.log('📋 Task Type Distribution');
  for (const [type, data] of Object.entries(dashboardData.byTaskType)) {
    console.log(`  ${type}: ${data.count} tasks ($${data.total.toFixed(4)})`);
  }
  console.log('');

  // Agent performance
  console.log('🏆 Agent Performance');
  for (const [agent, stats] of Object.entries(dashboardData.agentPerformance)) {
    console.log(`  ${agent}:`);
    console.log(`    Success rate: ${stats.successRate.toFixed(1)}%`);
    console.log(`    Avg cost: $${stats.averageCost.toFixed(4)}`);
    console.log(`    Avg quality: ${(stats.averageQuality * 100).toFixed(1)}%`);
  }
  console.log('');

  // Recent history
  console.log('🕐 Recent Activity');
  for (const record of dashboardData.recentHistory.slice(-5)) {
    const time = new Date(record.timestamp).toLocaleTimeString();
    console.log(`  ${time} | ${record.taskType} | ${record.model} | $${record.amount.toFixed(4)}`);
  }

  console.log('\n✨ Dashboard data example completed!');
}

// Run the example
dashboardExample().catch(console.error);
