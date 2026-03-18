/**
 * Integration tests for Cost-Optimized Framework
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CostOptimizedFramework } from '../src/index.js';

describe('CostOptimizedFramework', () => {
  it('should initialize with all components', () => {
    const framework = new CostOptimizedFramework();
    
    assert.ok(framework.taskAnalyzer);
    assert.ok(framework.agentRegistry);
    assert.ok(framework.costCalculator);
    assert.ok(framework.optimizationEngine);
    assert.ok(framework.budgetManager);
  });

  it('should provide cost predictions', async () => {
    const framework = new CostOptimizedFramework();
    
    const task = {
      id: 'test-task',
      description: 'Debug the application error',
      context: { error: 'Test error' }
    };
    
    // Test cost prediction directly
    const analysis = await framework.taskAnalyzer.analyze(task);
    const costPrediction = framework.predictExecutionCost(analysis);
    
    assert.ok(costPrediction);
    assert.ok(typeof costPrediction.expected === 'number');
    assert.ok(costPrediction.expected > 0);
  });

  it('should track costs in stats', async () => {
    const framework = new CostOptimizedFramework();
    
    // Initialize a budget
    framework.budgetManager.initBudget('test', { limit: 5.00 });
    
    // Record some costs
    framework.budgetManager.recordCost('test', {
      amount: 0.50,
      description: 'Test execution'
    });
    
    const stats = framework.getStats();
    assert.ok(stats);
    assert.ok(stats.budget);
    assert.ok(stats.agents);
    assert.ok(stats.costEfficiency);
  });

  it('should provide cost report', () => {
    const framework = new CostOptimizedFramework();
    framework.budgetManager.initBudget('test', { limit: 1.00 });
    
    const report = framework.getCostReport();
    assert.ok(report);
    assert.ok(Array.isArray(report.budgets));
    assert.ok(report.efficiency);
    assert.ok(report.agentStats);
  });
});