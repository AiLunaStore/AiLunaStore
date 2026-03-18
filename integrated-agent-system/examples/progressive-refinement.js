import { IntegratedAgentSystem } from '../src/index.js';

/**
 * Example: Confidence-Based Progressive Refinement
 * 
 * This example demonstrates the confidence-based routing system
 * that tries cheap models first and escalates based on confidence scores.
 */

async function progressiveRefinementExample() {
  console.log('🎯 Confidence-Based Progressive Refinement Example\n');
  console.log('This system tries cheap models first and escalates based on confidence.\n');

  const system = new IntegratedAgentSystem({
    defaultBudget: 10.00,
    confidence: {
      cheapThreshold: 0.75,
      standardThreshold: 0.85,
      criticalThreshold: 0.90
    }
  });

  // Track stage completions
  system.on('onStageComplete', ({ stage, model, confidence, passed }) => {
    const status = passed ? '✅ PASSED' : '❌ FAILED';
    console.log(`   Stage ${stage} (${model}): ${(confidence * 100).toFixed(1)}% confidence ${status}`);
  });

  // Example 1: Simple task (should pass at Stage 1 - cheap model)
  console.log('--- Example 1: Simple Utility Function ---');
  console.log('Expected: Stage 1 (DeepSeek V3.2) should have high confidence\n');
  
  const simpleTask = {
    id: 'simple-task',
    description: 'Create a utility function to format dates',
    complexity: 3
  };

  const simpleResult = await system.executeProgressive(simpleTask);
  
  console.log('\nResult:');
  console.log(`  Final model: ${simpleResult.result.modelName}`);
  console.log(`  Stages used: ${simpleResult.result.finalStage}`);
  console.log(`  Total cost: $${simpleResult.result.cost.toFixed(4)}`);
  console.log(`  Final confidence: ${(simpleResult.result.confidence.overall * 100).toFixed(1)}%`);
  console.log(`  Duration: ${simpleResult.result.duration}ms\n`);

  // Example 2: Complex task (may need Stage 2 or 3)
  console.log('--- Example 2: Complex Authentication System ---');
  console.log('Expected: May need Stage 2 (MiniMax) or Stage 3 (Kimi polish)\n');
  
  const complexTask = {
    id: 'complex-task',
    description: 'Implement a complete JWT-based authentication system with refresh tokens',
    complexity: 9
  };

  const complexResult = await system.executeProgressive(complexTask);
  
  console.log('\nResult:');
  console.log(`  Final model: ${complexResult.result.modelName}`);
  console.log(`  Stages used: ${complexResult.result.finalStage}`);
  console.log(`  Total cost: $${complexResult.result.cost.toFixed(4)}`);
  console.log(`  Final confidence: ${(complexResult.result.confidence.overall * 100).toFixed(1)}%`);
  console.log(`  Duration: ${complexResult.result.duration}ms`);
  console.log(`  Refined: ${complexResult.result.refined ? 'Yes' : 'No'}\n`);

  // Example 3: Critical task (should use premium model)
  console.log('--- Example 3: Critical Security Component ---');
  console.log('Expected: Will use Stage 3 (Kimi) for critical tasks\n');
  
  const criticalTask = {
    id: 'critical-task',
    description: 'Implement encryption key management for production system',
    complexity: 8,
    critical: true  // Mark as critical
  };

  const criticalResult = await system.executeProgressive(criticalTask);
  
  console.log('\nResult:');
  console.log(`  Final model: ${criticalResult.result.modelName}`);
  console.log(`  Stages used: ${criticalResult.result.finalStage}`);
  console.log(`  Total cost: $${criticalResult.result.cost.toFixed(4)}`);
  console.log(`  Final confidence: ${(criticalResult.result.confidence.overall * 100).toFixed(1)}%`);
  console.log(`  Duration: ${criticalResult.result.duration}ms\n`);

  // Example 4: Compare with traditional approach
  console.log('--- Example 4: Comparison with Traditional Approach ---');
  
  const comparisonTask = {
    id: 'comparison-task',
    description: 'Create a REST API endpoint for user registration',
    complexity: 6
  };

  // Progressive approach
  console.log('Progressive approach:');
  const progressiveResult = await system.executeProgressive(comparisonTask);
  console.log(`  Cost: $${progressiveResult.result.cost.toFixed(4)}`);
  console.log(`  Model: ${progressiveResult.result.modelName}`);
  console.log(`  Stages: ${progressiveResult.result.finalStage}\n`);

  // Traditional approach (skip progressive)
  console.log('Traditional approach (direct model selection):');
  const traditionalResult = await system.executeTraditional(comparisonTask);
  console.log(`  Cost: $${traditionalResult.metrics.cost.toFixed(4)}`);
  console.log(`  Model: ${traditionalResult.result.model}`);
  console.log(`  (Uses strategy-based selection)\n`);

  // Print learning statistics
  console.log('--- Progressive Refinement Statistics ---');
  const stats = system.getProgressiveStats();
  
  console.log('\nSuccess Rates by Model:');
  for (const [model, rate] of Object.entries(stats.learning.successRates)) {
    const attempts = stats.learning.attempts[model];
    const successes = stats.learning.successes[model];
    console.log(`  ${model}: ${(rate * 100).toFixed(1)}% (${successes}/${attempts})`);
  }
  
  console.log('\nOptimal Strategy:');
  const optimal = stats.learning.optimalStrategy;
  console.log(`  Recommended: ${optimal.recommended}`);
  console.log(`  Cheap expected cost: $${optimal.cheap.expectedCost.toFixed(4)}`);
  console.log(`  Standard expected cost: $${optimal.standard.expectedCost.toFixed(4)}`);
  console.log(`  Premium expected cost: $${optimal.premium.expectedCost.toFixed(4)}`);
  console.log(`  Progressive expected cost: $${optimal.progressive.expectedCost.toFixed(4)}`);
  
  console.log('\nCurrent Thresholds:');
  console.log(`  Cheap: ${(stats.thresholds.cheap * 100).toFixed(0)}%`);
  console.log(`  Standard: ${(stats.thresholds.standard * 100).toFixed(0)}%`);
  console.log(`  Critical: ${(stats.thresholds.critical * 100).toFixed(0)}%`);

  // Print cost savings analysis
  console.log('\n--- Cost Savings Analysis ---');
  const totalTasks = 4;
  const avgProgressiveCost = (
    simpleResult.result.cost + 
    complexResult.result.cost + 
    criticalResult.result.cost + 
    progressiveResult.result.cost
  ) / totalTasks;
  
  const cheapCost = 0.0010;  // DeepSeek V3.2
  const standardCost = 0.0039;  // MiniMax M2.5
  const premiumCost = 0.0057;  // Kimi K2.5
  
  console.log(`\nAverage cost per task: $${avgProgressiveCost.toFixed(4)}`);
  console.log(`vs always using cheap: $${cheapCost.toFixed(4)}`);
  console.log(`vs always using standard: $${standardCost.toFixed(4)}`);
  console.log(`vs always using premium: $${premiumCost.toFixed(4)}`);
  
  const savingsVsPremium = ((premiumCost - avgProgressiveCost) / premiumCost * 100).toFixed(1);
  console.log(`\nSavings vs always using premium: ${savingsVsPremium}%`);

  console.log('\n✨ Progressive refinement example completed!');
}

// Run the example
progressiveRefinementExample().catch(console.error);
