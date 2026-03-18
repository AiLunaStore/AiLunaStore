/**
 * Tests for Budget Manager
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { BudgetManager } from '../src/cost/budget-manager.js';

describe('BudgetManager', () => {
  it('should initialize budgets', () => {
    const manager = new BudgetManager({ defaultLimit: 5.00 });
    manager.initBudget('test-project', { limit: 2.00 });
    
    const budget = manager.getBudgetStatus('test-project');
    assert.ok(budget);
    assert.strictEqual(budget.limit, 2.00);
    assert.strictEqual(budget.spent, 0);
    assert.strictEqual(budget.remaining, 2.00);
  });

  it('should record costs', () => {
    const manager = new BudgetManager();
    manager.initBudget('test', { limit: 1.00 });
    
    manager.recordCost('test', {
      amount: 0.25,
      taskId: 'task-1',
      description: 'Test cost'
    });
    
    const budget = manager.getBudgetStatus('test');
    assert.strictEqual(budget.spent, 0.25);
    assert.strictEqual(budget.remaining, 0.75);
  });

  it('should check affordability', () => {
    const manager = new BudgetManager();
    manager.initBudget('test', { limit: 1.00 });
    manager.recordCost('test', { amount: 0.60, description: 'Test' });
    
    const affordable = manager.canAfford('test', 0.30);
    assert.strictEqual(affordable.affordable, true);
    
    const notAffordable = manager.canAfford('test', 0.50);
    assert.strictEqual(notAffordable.affordable, false);
  });

  it('should track reservations', () => {
    const manager = new BudgetManager();
    manager.initBudget('test', { limit: 1.00 });
    
    const reserved = manager.reserveBudget('test', 'task-1', 0.50);
    assert.strictEqual(reserved, true);
    
    const budget = manager.getBudgetStatus('test');
    assert.strictEqual(budget.reserved, 0.50);
    assert.strictEqual(budget.available, 0.50);
    
    // Should not be able to reserve more than available
    const notReserved = manager.reserveBudget('test', 'task-2', 0.60);
    assert.strictEqual(notReserved, false);
  });

  it('should generate efficiency report', () => {
    const manager = new BudgetManager();
    manager.initBudget('project-1', { limit: 2.00 });
    manager.initBudget('project-2', { limit: 1.00 });
    
    manager.recordCost('project-1', { amount: 0.50, description: 'Test' });
    manager.recordCost('project-2', { amount: 0.25, description: 'Test' });
    
    const report = manager.getEfficiencyReport();
    assert.strictEqual(report.summary.totalBudgets, 2);
    assert.strictEqual(report.summary.totalSpent, 0.75);
    assert.ok(report.recommendations);
  });
});