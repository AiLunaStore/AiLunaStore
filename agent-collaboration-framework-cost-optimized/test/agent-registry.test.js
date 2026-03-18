/**
 * Tests for Cost-Aware Agent Registry
 */
import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AgentRegistry } from '../src/core/agent-registry.js';

describe('AgentRegistry', () => {
  it('should register default agents with cost data', () => {
    const registry = new AgentRegistry();
    const agents = registry.getAllAgents();
    
    assert.strictEqual(agents.length > 0, true);
    
    const uiSpecialist = registry.getAgent('ui-specialist');
    assert.ok(uiSpecialist);
    assert.strictEqual(typeof uiSpecialist.inputCost, 'number');
    assert.strictEqual(typeof uiSpecialist.outputCost, 'number');
    assert.strictEqual(typeof uiSpecialist.quality, 'number');
    assert.strictEqual(typeof uiSpecialist.speed, 'number');
    assert.ok(uiSpecialist.qualityCostRatio);
  });

  it('should calculate cost estimates', () => {
    const registry = new AgentRegistry();
    const estimate = registry.getCostEstimate('ui-specialist');
    
    assert.ok(estimate);
    assert.strictEqual(typeof estimate.input, 'number');
    assert.strictEqual(typeof estimate.output, 'number');
    assert.strictEqual(typeof estimate.total, 'number');
    assert.ok(estimate.total > 0);
  });

  it('should find agents by domain with constraints', () => {
    const registry = new AgentRegistry();
    const matches = registry.findByDomainWithConstraints('ui', {
      minQuality: 7,
      maxCost: 0.10
    });
    
    assert.ok(Array.isArray(matches));
    for (const match of matches) {
      assert.ok(match.agent.quality >= 7);
    }
  });

  it('should create fallback chain', () => {
    const registry = new AgentRegistry();
    const chain = registry.createFallbackChain('ui', { minQuality: 7 });
    
    assert.ok(Array.isArray(chain));
    if (chain.length > 1) {
      // Should be sorted by cost (cheapest first)
      for (let i = 1; i < chain.length; i++) {
        assert.ok(chain[i-1].estimatedCost <= chain[i].estimatedCost);
      }
    }
  });

  it('should provide cost summary', () => {
    const registry = new AgentRegistry();
    const summary = registry.getCostSummary();
    
    assert.ok(summary);
    assert.strictEqual(typeof summary.totalAgents, 'number');
    assert.strictEqual(typeof summary.averageQuality, 'number');
    assert.ok(summary.bestValueAgent);
    assert.ok(summary.cheapestAgent);
  });
});