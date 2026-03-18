/**
 * Tests for Cost Calculator
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CostCalculator } from '../src/cost/cost-calculator.js';

describe('CostCalculator', () => {
  it('should estimate tokens for task types', () => {
    const calculator = new CostCalculator();
    
    const estimate = calculator.estimateTokens({
      taskType: 'debugging',
      complexity: 7,
      contextSize: 'medium'
    });
    
    assert.ok(estimate);
    assert.ok(estimate.input > 0);
    assert.ok(estimate.output > 0);
    assert.strictEqual(estimate.total, estimate.input + estimate.output);
    assert.ok(estimate.confidence > 0 && estimate.confidence <= 1);
  });

  it('should calculate savings', () => {
    const calculator = new CostCalculator();
    
    const savings = calculator.calculateSavings(0.50, 1.00);
    
    assert.strictEqual(savings.absolute, 0.50);
    assert.strictEqual(savings.percentage, 50);
    assert.ok(savings.summary.includes('Saved'));
  });

  it('should infer task type from description', () => {
    const calculator = new CostCalculator();
    
    // "Debug" keyword takes precedence
    assert.strictEqual(
      calculator.inferTaskType({ description: 'Debug the error in the UI' }),
      'debugging'
    );
    
    // "Fix" keyword also indicates debugging
    assert.strictEqual(
      calculator.inferTaskType({ description: 'Fix the CSS styling' }),
      'debugging'
    );
    
    assert.strictEqual(
      calculator.inferTaskType({ description: 'Optimize the database query' }),
      'db-analysis'
    );
  });

  it('should estimate context size', () => {
    const calculator = new CostCalculator();
    
    const small = calculator.estimateContextSize({ context: { error: 'short' } });
    assert.ok(['small', 'medium'].includes(small));
    
    const large = calculator.estimateContextSize({
      context: { logs: 'x'.repeat(3000) }
    });
    assert.ok(['large', 'xlarge'].includes(large));
  });
});