import { IntegratedAgentSystem } from '../src/index.js';

/**
 * Example: Strategy Comparison
 * 
 * This example demonstrates how different strategies affect
 * model selection and costs.
 */

async function strategyExample() {
  console.log('🎯 Integrated Agent System - Strategy Comparison\n');

  const system = new IntegratedAgentSystem({
    defaultBudget: 10.00
  });

  const task = {
    id: 'strategy-comparison-task',
    description: 'Implement a user authentication system',
    complexity: 7
  };

  const strategies = ['economy', 'balanced', 'quality', 'speed'];
  const results = [];

  console.log('Testing same task with different strategies:\n');

  for (const strategy of strategies) {
    console.log(`--- Strategy: ${strategy.toUpperCase()} ---`);
    
    const result = await system.execute(task, { strategy });
    
    results.push({
      strategy,
      model: result.metrics.model,
      agent: result.metrics.agent,
      cost: result.metrics.cost,
      qualityScore: result.metrics.qualityScore,
      duration: result.metrics.duration
    });

    console.log(`Model: ${result.metrics.model}`);
    console.log(`Cost: $${result.metrics.cost.toFixed(4)}`);
    console.log(`Quality: ${(result.metrics.qualityScore * 100).toFixed(0)}%`);
    console.log(`Duration: ${result.metrics.duration}ms\n`);
  }

  // Print comparison table
  console.log('--- Comparison Summary ---');
  console.log('\nStrategy     | Model              | Cost      | Quality | Duration');
  console.log('-------------|--------------------|-----------|---------|----------');
  
  for (const r of results) {
    const modelName = r.model.padEnd(18);
    const cost = `$${r.cost.toFixed(4)}`.padEnd(9);
    const quality = `${(r.qualityScore * 100).toFixed(0)}%`.padEnd(7);
    const duration = `${r.duration}ms`.padEnd(8);
    
    console.log(`${r.strategy.padEnd(12)} | ${modelName} | ${cost} | ${quality} | ${duration}`);
  }

  // Calculate cost range
  const costs = results.map(r => r.cost);
  const minCost = Math.min(...costs);
  const maxCost = Math.max(...costs);
  const costRange = ((maxCost - minCost) / minCost * 100).toFixed(0);

  console.log(`\nCost range: ${costRange}% difference between cheapest and most expensive`);

  console.log('\n✨ Strategy comparison completed!');
}

// Run the example
strategyExample().catch(console.error);
