/**
 * Tests for Optimization Engine
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { OptimizationEngine } from '../src/cost/optimization-engine.js';
import { AgentRegistry } from '../src/core/agent-registry.js';

describe('OptimizationEngine', () => {
  it('should select optimal agent', () => {
    const engine = new OptimizationEngine();
    const registry = new AgentRegistry();
    
    const task = { description: 'Fix UI bug', domain: 'ui' };
    const selection = engine.selectOptimalAgent({
      task,
      budget: 0.10,
      qualityRequired: 7,
      agentRegistry: registry,
      strategy: 'balanced'
    });
    
    assert.ok(selection);
    assert.ok(selection.agent);
    assert.ok(selection.rationale);
    assert.strictEqual(typeof selection.estimatedCost, 'number');
  });

  it('should create fallback chain', () => {
    const engine = new OptimizationEngine();
    const registry = new AgentRegistry();
    
    const chain = engine.createFallbackChain({
      task: { description: 'Fix UI bug', domain: 'ui' },
      agentRegistry: registry,
      strategy: 'cheap-to-expensive',
      maxAgents: 3
    });
    
    assert.ok(Array.isArray(chain));
    assert.ok(chain.length <= 3);
  });

  it('should compare strategies', () => {
    const engine = new OptimizationEngine();
    const registry = new AgentRegistry();
    
    const comparison = engine.compareStrategies({
      task: { description: 'Debug error' },
      budget: 0.10,
      agentRegistry: registry
    });
    
    assert.ok(Array.isArray(comparison));
    assert.strictEqual(comparison.length, 5); // 5 strategies
    
    for (const result of comparison) {
      assert.ok(result.strategy);
      assert.strictEqual(typeof result.quality, 'number');
      assert.strictEqual(typeof result.estimatedCost, 'number');
    }
  });

  it('should optimize assignments', () => {
    const engine = new OptimizationEngine();
    const registry = new AgentRegistry();
    
    const subtasks = [
      { id: 'task-1', domain: 'ui', description: 'Fix CSS' },
      { id: 'task-2', domain: 'backend', description: 'Fix API' }
    ];
    
    const result = engine.optimizeAssignments({
      subtasks,
      budget: 0.20,
      minQuality: 7,
      agentRegistry: registry,
      strategy: 'balanced'
    });
    
    assert.ok(result);
    assert.ok(Array.isArray(result.assignments));
    assert.strictEqual(typeof result.totalCost, 'number');
    assert.strictEqual(typeof result.withinBudget, 'boolean');
  });
});