/**
 * Example: Budget Management Demo
 * Shows how to work with multiple project budgets
 */

import { CostOptimizedFramework } from '../src/index.js';

async function runBudgetDemo() {
  console.log('💰 Budget Management Demo\n');
  
  const framework = new CostOptimizedFramework({
    budget: {
      defaultLimit: 5.00,
      alerts: [0.5, 0.8, 0.95]
    }
  });
  
  // Initialize budgets for different projects
  framework.budgetManager.initBudget('project-alpha', { 
    limit: 2.00,
    metadata: { description: 'Frontend refactoring' }
  });
  
  framework.budgetManager.initBudget('project-beta', { 
    limit: 1.50,
    metadata: { description: 'API integration' }
  });
  
  framework.budgetManager.initBudget('project-gamma', { 
    limit: 1.00,
    metadata: { description: 'Bug fixes' }
  });
  
  console.log('📊 Initial Budget Status');
  console.log('========================');
  
  for (const budget of framework.budgetManager.getAllBudgets()) {
    console.log(`\n${budget.id}:`);
    console.log(`  Limit: $${budget.limit.toFixed(2)}`);
    console.log(`  Available: $${budget.available.toFixed(2)}`);
  }
  
  // Simulate some spending
  console.log('\n\n💸 Recording Costs...\n');
  
  framework.budgetManager.recordCost('project-alpha', {
    amount: 0.45,
    taskId: 'task-1',
    agentId: 'ui-specialist',
    description: 'UI component analysis'
  });
  
  framework.budgetManager.recordCost('project-alpha', {
    amount: 0.32,
    taskId: 'task-2',
    agentId: 'ui-specialist',
    description: 'CSS refactoring'
  });
  
  framework.budgetManager.recordCost('project-beta', {
    amount: 0.15,
    taskId: 'task-3',
    agentId: 'backend-specialist',
    description: 'API endpoint review'
  });
  
  framework.budgetManager.recordCost('project-gamma', {
    amount: 0.08,
    taskId: 'task-4',
    agentId: 'debugging-specialist',
    description: 'Error diagnosis'
  });
  
  // Show updated status
  console.log('📊 Updated Budget Status');
  console.log('========================');
  
  for (const budget of framework.budgetManager.getAllBudgets()) {
    console.log(`\n${budget.id}:`);
    console.log(`  Limit: $${budget.limit.toFixed(2)}`);
    console.log(`  Spent: $${budget.spent.toFixed(4)}`);
    console.log(`  Remaining: $${budget.remaining.toFixed(4)}`);
    console.log(`  Utilization: ${budget.utilization.toFixed(1)}%`);
    console.log(`  Status: ${budget.isOverBudget ? '🔴 Over Budget' : budget.isNearLimit ? '🟡 Near Limit' : '🟢 OK'}`);
  }
  
  // Get efficiency report
  console.log('\n\n📈 Efficiency Report');
  console.log('===================');
  const efficiency = framework.budgetManager.getEfficiencyReport();
  console.log(`Total Budgets: ${efficiency.summary.totalBudgets}`);
  console.log(`Total Spent: $${efficiency.summary.totalSpent.toFixed(4)}`);
  console.log(`Global Utilization: ${efficiency.summary.globalUtilization.toFixed(1)}%`);
  console.log(`Cost Per Task: $${efficiency.summary.costPerTask.toFixed(4)}`);
  
  // Show recommendations
  if (efficiency.recommendations.length > 0) {
    console.log('\n💡 Recommendations:');
    efficiency.recommendations.forEach(rec => {
      const icon = rec.severity === 'critical' ? '🔴' : rec.severity === 'warning' ? '🟡' : '🔵';
      console.log(`  ${icon} [${rec.type}] ${rec.message}`);
    });
  }
  
  // Get spending report for project-alpha
  console.log('\n\n📋 Spending Report: Project Alpha');
  console.log('=================================');
  const report = framework.budgetManager.getSpendingReport('project-alpha');
  console.log(`Total Tasks: ${report.totalTasks}`);
  console.log('\nBy Agent:');
  for (const [agentId, data] of Object.entries(report.byAgent)) {
    console.log(`  ${agentId}: $${data.total.toFixed(4)} (${data.count} tasks, avg $${data.average.toFixed(4)})`);
  }
  
  console.log('\n✨ Demo complete!');
}

runBudgetDemo().catch(console.error);