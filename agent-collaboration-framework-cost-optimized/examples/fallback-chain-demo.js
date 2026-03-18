/**
 * Example: Fallback Chain Demo
 * Demonstrates the fallback chain strategy for cost optimization
 */

import { CostOptimizedFramework } from '../src/index.js';

async function runFallbackDemo() {
  console.log('⛓️  Fallback Chain Demo\n');
  
  const framework = new CostOptimizedFramework();
  
  // Define a task that needs UI expertise
  const task = {
    id: 'ui-optimization',
    description: 'Optimize React component rendering performance',
    domain: 'ui'
  };
  
  console.log('📋 Task:', task.description);
  console.log('Domain:', task.domain);
  
  // Create fallback chains with different strategies
  const strategies = ['cheap-to-expensive', 'fast-to-slow', 'quality-descending', 'balanced'];
  
  for (const strategy of strategies) {
    console.log(`\n\n🔀 Strategy: ${strategy}`);
    console.log('='.repeat(40));
    
    const chain = framework.optimizationEngine.createFallbackChain({
      task,
      agentRegistry: framework.agentRegistry,
      strategy,
      maxAgents: 4
    });
    
    chain.forEach((agent, index) => {
      const rank = index + 1;
      const costIndicator = agent.estimatedCost < 0.01 ? '💚' : agent.estimatedCost < 0.05 ? '💛' : '❤️';
      console.log(`\n  ${rank}. ${agent.name}`);
      console.log(`     Model: ${agent.model}`);
      console.log(`     Quality: ${agent.quality}/10 | Speed: ${agent.speed}/10`);
      console.log(`     Est. Cost: $${agent.estimatedCost.toFixed(4)} ${costIndicator}`);
      console.log(`     Value Score: ${(agent.quality / agent.estimatedCost).toFixed(2)}`);
      console.log(`     Rationale: ${agent.rationale}`);
    });
  }
  
  // Demonstrate strategy comparison
  console.log('\n\n📊 Strategy Comparison');
  console.log('======================');
  
  const comparison = framework.optimizationEngine.compareStrategies({
    task,
    budget: 0.10,
    agentRegistry: framework.agentRegistry
  });
  
  console.log('\nStrategy | Agent | Quality | Speed | Est. Cost | Value Score');
  console.log('-'.repeat(70));
  
  for (const result of comparison) {
    const valueScore = result.estimatedCost > 0 ? (result.quality / result.estimatedCost).toFixed(2) : 'N/A';
    const violation = result.constraintViolation ? '⚠️' : '✓';
    console.log(
      `${result.strategy.padEnd(8)} | ` +
      `${result.agentName?.substring(0, 15).padEnd(15)} | ` +
      `${result.quality?.toString().padStart(2)}/10 | ` +
      `${result.speed?.toString().padStart(2)}/10 | ` +
      `$${result.estimatedCost?.toFixed(4).padStart(8)} | ` +
      `${valueScore.padStart(6)} ${violation}`
    );
  }
  
  // Show optimal selection
  console.log('\n\n🎯 Optimal Selection');
  console.log('===================');
  
  const optimal = framework.optimizationEngine.selectOptimalAgent({
    task,
    budget: 0.10,
    qualityRequired: 7,
    agentRegistry: framework.agentRegistry,
    strategy: 'balanced'
  });
  
  console.log(`Selected: ${optimal.agent?.name || 'None'}`);
  console.log(`Rationale: ${optimal.rationale}`);
  console.log(`Est. Cost: $${optimal.estimatedCost?.toFixed(4) || 'N/A'}`);
  console.log(`Quality/$: ${optimal.qualityCostRatio?.toFixed(2) || 'N/A'}`);
  
  if (optimal.alternatives && optimal.alternatives.length > 0) {
    console.log('\nAlternatives considered:');
    optimal.alternatives.forEach(alt => {
      console.log(`  • ${alt.name} (score: ${alt.score?.toFixed(3)}, cost: $${alt.cost?.toFixed(4)})`);
    });
  }
  
  console.log('\n✨ Demo complete!');
}

runFallbackDemo().catch(console.error);