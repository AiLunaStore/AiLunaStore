/**
 * Example: Cost-Optimized Debugging Workflow
 * Demonstrates budget-aware agent selection for a debugging task
 */

import { CostOptimizedFramework } from '../src/index.js';

async function runExample() {
  console.log('🚀 Cost-Optimized Debugging Workflow Example\n');
  
  // Initialize framework with budget settings
  const framework = new CostOptimizedFramework({
    budget: {
      defaultLimit: 3.00,
      alerts: [0.5, 0.8, 0.95]
    }
  });
  
  // Define a complex debugging task
  const task = {
    id: 'debug-desktop-app',
    description: 'Debug the desktop application crash on startup',
    context: {
      error: 'App crashes with "Cannot read property of undefined"',
      logs: [
        '[ERROR] TypeError: Cannot read property \'config\' of undefined',
        '[ERROR] at App.initialize (app.js:45:12)',
        '[ERROR] at processTicksAndRejections (internal/process/task_queues.js:97:5)'
      ],
      environment: 'macOS 15.3',
      appVersion: '2.1.0'
    },
    budget: 2.50 // Specific budget for this task
  };
  
  console.log('📋 Task:', task.description);
  console.log('💰 Budget: $' + task.budget.toFixed(2));
  console.log('\n🔍 Analyzing task...\n');
  
  // Get optimization recommendations before execution
  const recommendations = framework.getRecommendations(task);
  console.log('💡 Recommendations:');
  recommendations.forEach(rec => {
    console.log(`   [${rec.severity.toUpperCase()}] ${rec.message}`);
  });
  console.log('');
  
  // Execute with cost optimization
  console.log('⚙️  Executing with cost optimization...\n');
  const result = await framework.execute(task, {
    strategy: 'balanced', // balanced, cheapest, highest-quality, fastest
    minQuality: 7
  });
  
  // Display results
  console.log('\n📊 Execution Results');
  console.log('===================');
  console.log(`Execution ID: ${result.executionId}`);
  console.log(`Strategy: ${result.strategy}`);
  console.log(`Duration: ${result.metrics.duration}ms`);
  console.log(`Success: ${result.metrics.success ? '✅' : '❌'}`);
  
  console.log('\n💰 Cost Analysis');
  console.log('----------------');
  console.log(`Predicted Cost: $${result.costPrediction.expected.toFixed(4)}`);
  console.log(`Actual Cost: $${result.metrics.cost.actual.toFixed(4)}`);
  console.log(`Quality/$ Ratio: ${result.metrics.cost.qualityPerDollar.toFixed(2)}`);
  console.log(`Savings: ${result.metrics.cost.savings.summary}`);
  
  console.log('\n🤖 Agent Assignments');
  console.log('--------------------');
  result.optimization.assignments.forEach(assignment => {
    console.log(`  • ${assignment.subtaskId}:`);
    console.log(`    Agent: ${assignment.agentName}`);
    console.log(`    Est. Cost: $${assignment.estimatedCost?.toFixed(4) || 'N/A'}`);
  });
  
  console.log('\n📈 Budget Status');
  console.log('----------------');
  const budgetStatus = result.budgetStatus;
  console.log(`Spent: $${budgetStatus.spent.toFixed(4)} / $${budgetStatus.limit.toFixed(2)}`);
  console.log(`Utilization: ${budgetStatus.utilization.toFixed(1)}%`);
  console.log(`Remaining: $${budgetStatus.remaining.toFixed(4)}`);
  
  console.log('\n✨ Example complete!');
  
  // Return framework stats
  console.log('\n📊 Framework Statistics');
  console.log('-----------------------');
  const stats = framework.getStats();
  console.log(JSON.stringify(stats, null, 2));
}

runExample().catch(console.error);