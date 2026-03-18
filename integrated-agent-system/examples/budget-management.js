import { IntegratedAgentSystem } from '../src/index.js';

/**
 * Example: Budget Management
 * 
 * This example demonstrates budget management and alerts.
 */

async function budgetExample() {
  console.log('💰 Integrated Agent System - Budget Management Example\n');

  // Initialize with low budget to demonstrate alerts
  const system = new IntegratedAgentSystem({
    defaultBudget: 0.10,  // Very low budget for demo
    alertThresholds: [0.3, 0.6, 0.9]
  });

  // Track alerts
  const alerts = [];
  system.on('onBudgetAlert', (alert) => {
    alerts.push(alert);
    console.log(`🚨 BUDGET ALERT: ${alert.message}\n`);
  });

  // Execute tasks until budget is depleted
  console.log('Executing tasks with $0.10 budget...\n');

  let taskCount = 0;
  let totalCost = 0;

  while (totalCost < 0.10) {
    taskCount++;
    
    try {
      const result = await system.execute({
        id: `budget-task-${taskCount}`,
        description: `Task ${taskCount}: Implement feature`,
        complexity: 5
      }, {
        strategy: 'economy'  // Use economy to maximize tasks
      });

      if (result.success === false && result.error === 'Budget exceeded') {
        console.log('❌ Budget exceeded! Stopping.');
        break;
      }

      totalCost += result.metrics.cost;
      
      console.log(`Task ${taskCount}: $${result.metrics.cost.toFixed(4)} | Total: $${totalCost.toFixed(4)}`);
      
    } catch (error) {
      console.log('Error:', error.message);
      break;
    }
  }

  // Print results
  console.log('\n--- Budget Summary ---');
  console.log('Tasks completed:', taskCount);
  console.log('Total cost:', `$${totalCost.toFixed(4)}`);
  console.log('Alerts triggered:', alerts.length);
  
  if (alerts.length > 0) {
    console.log('\nAlert details:');
    alerts.forEach(alert => {
      console.log(`  - ${alert.threshold}% threshold at $${alert.spent.toFixed(4)}`);
    });
  }

  // Demonstrate budget reset
  console.log('\n--- Resetting Budget ---');
  system.costTracker.resetBudget('default');
  const newStatus = system.costTracker.getStatus();
  console.log('Budget reset. New utilization:', `${newStatus.globalUtilization.toFixed(1)}%`);

  console.log('\n✨ Budget example completed!');
}

// Run the example
budgetExample().catch(console.error);
