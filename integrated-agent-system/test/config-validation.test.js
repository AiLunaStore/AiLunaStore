import { describe, it, expect } from 'vitest';
import fallbackChains from '../config/fallback-chains.json' assert { type: 'json' };
import models from '../config/models.json' assert { type: 'json' };
import agents from '../config/agents.json' assert { type: 'json' };
import strategies from '../config/strategies.json' assert { type: 'json' };

describe('Configuration Validation', () => {
  describe('Models Configuration', () => {
    it('should have all required model fields', () => {
      for (const [id, model] of Object.entries(models.models)) {
        expect(model).toHaveProperty('id');
        expect(model).toHaveProperty('name');
        expect(model).toHaveProperty('provider');
        expect(model).toHaveProperty('pricing');
        expect(model).toHaveProperty('capabilities');
        expect(model).toHaveProperty('performance');
        expect(model).toHaveProperty('bestFor');
      }
    });

    it('should have valid pricing data', () => {
      for (const [id, model] of Object.entries(models.models)) {
        expect(model.pricing).toHaveProperty('inputPer1M');
        expect(model.pricing).toHaveProperty('outputPer1M');
        expect(model.pricing.inputPer1M).toBeGreaterThan(0);
        expect(model.pricing.outputPer1M).toBeGreaterThan(0);
      }
    });

    it('should have MiniMax M2.5 as primary coding model', () => {
      const minimax = models.models['minimax-m2.5'];
      expect(minimax).toBeDefined();
      expect(minimax.performance.sweBench).toBe(80.2);
      expect(minimax.pricing.inputPer1M).toBe(0.30);
      expect(minimax.pricing.outputPer1M).toBe(1.20);
    });

    it('should have valid fallback chains', () => {
      for (const [id, model] of Object.entries(models.models)) {
        if (model.fallbackTo) {
          expect(models.models[model.fallbackTo]).toBeDefined();
        }
      }
    });
  });

  describe('Agents Configuration', () => {
    it('should have all required agent fields', () => {
      for (const [id, agent] of Object.entries(agents.agents)) {
        expect(agent).toHaveProperty('id');
        expect(agent).toHaveProperty('name');
        expect(agent).toHaveProperty('primaryModel');
        expect(agent).toHaveProperty('fallbackChain');
        expect(agent).toHaveProperty('domains');
        expect(agent).toHaveProperty('capabilities');
        expect(agent).toHaveProperty('expertise');
      }
    });

    it('should reference valid models', () => {
      for (const [id, agent] of Object.entries(agents.agents)) {
        expect(models.models[agent.primaryModel]).toBeDefined();
        
        for (const fallbackModel of agent.fallbackChain) {
          expect(models.models[fallbackModel]).toBeDefined();
        }
      }
    });

    it('should have coding specialist with MiniMax M2.5', () => {
      const codingSpecialist = agents.agents['coding-specialist'];
      expect(codingSpecialist).toBeDefined();
      expect(codingSpecialist.primaryModel).toBe('minimax-m2.5');
      expect(codingSpecialist.domains).toContain('coding');
    });
  });

  describe('Strategies Configuration', () => {
    it('should have all required strategy fields', () => {
      for (const [id, strategy] of Object.entries(strategies.strategies)) {
        expect(strategy).toHaveProperty('id');
        expect(strategy).toHaveProperty('name');
        expect(strategy).toHaveProperty('weights');
        expect(strategy).toHaveProperty('constraints');
        expect(strategy.weights).toHaveProperty('quality');
        expect(strategy.weights).toHaveProperty('cost');
        expect(strategy.weights).toHaveProperty('speed');
      }
    });

    it('should have weights that sum to 1', () => {
      for (const [id, strategy] of Object.entries(strategies.strategies)) {
        const sum = strategy.weights.quality + strategy.weights.cost + strategy.weights.speed;
        expect(sum).toBeCloseTo(1, 1);
      }
    });

    it('should have valid fallback strategies', () => {
      for (const [id, strategy] of Object.entries(strategies.strategies)) {
        if (strategy.fallbackStrategy) {
          expect(strategies.strategies[strategy.fallbackStrategy]).toBeDefined();
        }
      }
    });
  });

  describe('Fallback Chains Configuration', () => {
    it('should have all required chain fields', () => {
      for (const [taskType, chain] of Object.entries(fallbackChains.fallbackChains)) {
        expect(chain).toHaveProperty('taskType');
        expect(chain).toHaveProperty('description');
        expect(chain).toHaveProperty('chain');
        expect(chain).toHaveProperty('escalationRules');
        expect(chain.chain.length).toBeGreaterThan(0);
      }
    });

    it('should reference valid models in chains', () => {
      for (const [taskType, chain] of Object.entries(fallbackChains.fallbackChains)) {
        for (const step of chain.chain) {
          expect(models.models[step.model]).toBeDefined();
          expect(agents.agents[step.agent]).toBeDefined();
        }
      }
    });

    it('should have coding chain starting with MiniMax M2.5', () => {
      const codingChain = fallbackChains.fallbackChains['coding'];
      expect(codingChain.chain[0].model).toBe('minimax-m2.5');
      expect(codingChain.chain[0].agent).toBe('coding-specialist');
    });

    it('should have valid escalation rules', () => {
      for (const [taskType, chain] of Object.entries(fallbackChains.fallbackChains)) {
        expect(chain.escalationRules).toHaveProperty('onFailure');
        expect(chain.escalationRules).toHaveProperty('onTimeout');
      }
    });
  });

  describe('Integration Between Configs', () => {
    it('should have consistent agent-model mappings', () => {
      for (const [agentId, agent] of Object.entries(agents.agents)) {
        // Primary model should be in model registry
        expect(models.models[agent.primaryModel]).toBeDefined();
        
        // Primary model should have capabilities matching agent domains
        const model = models.models[agent.primaryModel];
        const hasCodingCapability = agent.domains.includes('coding') && model.capabilities.coding >= 8;
        const hasResearchCapability = agent.domains.includes('research') && model.capabilities.research >= 7;
        
        expect(hasCodingCapability || hasResearchCapability || !agent.domains.includes('coding')).toBe(true);
      }
    });

    it('should have consistent fallback chains', () => {
      // All fallback chain models should exist
      for (const [taskType, chain] of Object.entries(fallbackChains.fallbackChains)) {
        const modelIds = chain.chain.map(step => step.model);
        const uniqueModels = [...new Set(modelIds)];
        
        for (const modelId of uniqueModels) {
          expect(models.models[modelId]).toBeDefined();
        }
      }
    });

    it('should have cost-effective model ordering in fallback chains', () => {
      for (const [taskType, chain] of Object.entries(fallbackChains.fallbackChains)) {
        let prevCost = 0;
        
        for (const step of chain.chain) {
          const model = models.models[step.model];
          const cost = model.pricing.inputPer1M + model.pricing.outputPer1M;
          
          // Each step should not be significantly more expensive than the previous
          // (allowing for some quality-based escalation)
          expect(cost).toBeLessThan(prevCost * 10); // No more than 10x jump
          prevCost = cost;
        }
      }
    });
  });
});
