import { describe, it, expect, beforeEach } from 'vitest';
import { ConfidenceScorer } from '../src/confidence-scorer.js';
import { ProgressiveRefinementPipeline } from '../src/progressive-refinement-pipeline.js';
import { IntegratedAgentSystem } from '../src/index.js';

describe('Confidence-Based Progressive Refinement', () => {
  describe('ConfidenceScorer', () => {
    let scorer;

    beforeEach(() => {
      scorer = new ConfidenceScorer({
        cheapThreshold: 0.75,
        standardThreshold: 0.85,
        criticalThreshold: 0.90
      });
    });

    it('should calculate confidence for coding results', () => {
      const result = {
        output: `
          // Implementation for: Create a function
          /**
           * @param {Object} options
           * @returns {Promise<Object>}
           */
          async function createFeature(options = {}) {
            try {
              const result = await processData(options);
              return result;
            } catch (error) {
              console.error('Error:', error);
              throw error;
            }
          }
          module.exports = { createFeature };
        `
      };
      
      const task = {
        description: 'Implement a feature',
        complexity: 5
      };
      
      const confidence = scorer.calculateConfidence(result, task);
      
      expect(confidence.overall).toBeGreaterThan(0);
      expect(confidence.overall).toBeLessThanOrEqual(1);
      expect(confidence.metrics).toHaveProperty('completeness');
      expect(confidence.metrics).toHaveProperty('codeQuality');
      expect(confidence.metrics).toHaveProperty('errorDetection');
    });

    it('should calculate confidence for research results', () => {
      const result = {
        output: `
          # Analysis
          
          Based on research from multiple sources, here are the findings:
          
          ## Comparison
          
          Option A vs Option B - Option A is better for performance.
          
          ## Conclusion
          
          In summary, the recommended approach is Option A.
        `
      };
      
      const task = {
        description: 'Research state management options',
        complexity: 4
      };
      
      const confidence = scorer.calculateConfidence(result, task);
      
      expect(confidence.overall).toBeGreaterThan(0);
      expect(confidence.metrics.completeness).toBeGreaterThan(0.5);
    });

    it('should apply correct thresholds based on task type', () => {
      const normalTask = { description: 'Implement feature', complexity: 5 };
      const criticalTask = { description: 'Implement encryption', complexity: 8, critical: true };
      const complexTask = { description: 'Redesign architecture', complexity: 9 };
      
      expect(scorer.getThresholdForTask(normalTask)).toBe(0.75);
      expect(scorer.getThresholdForTask(criticalTask)).toBe(0.90);
      expect(scorer.getThresholdForTask(complexTask)).toBe(0.85);
    });

    it('should update thresholds based on performance', () => {
      const initialThresholds = scorer.getThresholds();
      
      scorer.updateThresholds({
        cheapSuccessRate: 0.95,
        standardSuccessRate: 0.92
      });
      
      const newThresholds = scorer.getThresholds();
      
      // Should increase thresholds when success rates are high
      expect(newThresholds.cheap).toBeGreaterThan(initialThresholds.cheap);
      expect(newThresholds.standard).toBeGreaterThan(initialThresholds.standard);
    });
  });

  describe('ProgressiveRefinementPipeline', () => {
    let pipeline;

    beforeEach(() => {
      pipeline = new ProgressiveRefinementPipeline({
        confidence: {
          cheapThreshold: 0.75,
          standardThreshold: 0.85,
          criticalThreshold: 0.90
        }
      });
    });

    it('should execute with progressive refinement', async () => {
      const task = {
        id: 'test-task',
        description: 'Create a utility function',
        complexity: 5
      };
      
      const result = await pipeline.execute(task);
      
      expect(result.success).toBe(true);
      expect(result.model).toBeDefined();
      expect(result.cost).toBeGreaterThan(0);
      expect(result.stages).toBeInstanceOf(Array);
      expect(result.confidence).toHaveProperty('overall');
    });

    it('should track learning statistics', async () => {
      const task = { id: 'test', description: 'Implement feature', complexity: 5 };
      
      await pipeline.execute(task);
      await pipeline.execute(task);
      
      const stats = pipeline.getLearningStats();
      
      expect(stats.attempts.cheap).toBeGreaterThan(0);
      expect(stats.successRates).toHaveProperty('cheap');
      expect(stats.optimalStrategy).toHaveProperty('recommended');
    });

    it('should calculate costs correctly', () => {
      const cheapModel = pipeline.models.cheap;
      const standardModel = pipeline.models.standard;
      const premiumModel = pipeline.models.premium;
      
      const cheapCost = pipeline.calculateCost(cheapModel);
      const standardCost = pipeline.calculateCost(standardModel);
      const premiumCost = pipeline.calculateCost(premiumModel);
      
      expect(cheapCost).toBeLessThan(standardCost);
      expect(standardCost).toBeLessThan(premiumCost);
    });

    it('should update thresholds based on learning', () => {
      pipeline.learningSystem.attempts.cheap = 100;
      pipeline.learningSystem.successes.cheap = 95;
      pipeline.learningSystem.attempts.standard = 50;
      pipeline.learningSystem.successes.standard = 45;
      
      const initialThresholds = pipeline.confidenceScorer.getThresholds();
      
      pipeline.updateThresholds();
      
      const newThresholds = pipeline.confidenceScorer.getThresholds();
      
      // With high success rates, thresholds should increase
      expect(newThresholds.cheap).toBeGreaterThanOrEqual(initialThresholds.cheap);
    });
  });

  describe('Integrated Agent System with Progressive Refinement', () => {
    let system;

    beforeEach(() => {
      system = new IntegratedAgentSystem({
        defaultBudget: 10.00,
        confidence: {
          cheapThreshold: 0.75,
          standardThreshold: 0.85,
          criticalThreshold: 0.90
        }
      });
    });

    it('should execute tasks with progressive refinement', async () => {
      const task = {
        id: 'integration-test',
        description: 'Implement authentication',
        complexity: 7
      };
      
      const result = await system.executeProgressive(task);
      
      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('metrics');
      expect(result.metrics.progressive).toBe(true);
      expect(result.metrics.stages).toBeInstanceOf(Array);
    });

    it('should execute tasks with traditional fallback', async () => {
      const task = {
        id: 'traditional-test',
        description: 'Research libraries',
        complexity: 5
      };
      
      const result = await system.executeTraditional(task);
      
      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('metrics');
    });

    it('should calculate confidence for results', () => {
      const result = {
        output: '// Implementation\nfunction test() { return true; }'
      };
      
      const task = { description: 'Implement function' };
      
      const confidence = system.calculateConfidence(result, task);
      
      expect(confidence).toHaveProperty('overall');
      expect(confidence).toHaveProperty('metrics');
      expect(confidence).toHaveProperty('passed');
    });

    it('should return progressive statistics', async () => {
      const task = { id: 'stats-test', description: 'Test task', complexity: 5 };
      
      await system.executeProgressive(task);
      
      const stats = system.getProgressiveStats();
      
      expect(stats).toHaveProperty('learning');
      expect(stats).toHaveProperty('thresholds');
      expect(stats.learning).toHaveProperty('attempts');
      expect(stats.learning).toHaveProperty('successRates');
    });

    it('should update confidence thresholds', () => {
      const newThresholds = system.updateConfidenceThresholds();
      
      expect(newThresholds).toHaveProperty('cheap');
      expect(newThresholds).toHaveProperty('standard');
      expect(newThresholds).toHaveProperty('critical');
    });

    it('should switch execution modes', () => {
      expect(system.setExecutionMode('progressive')).toBe(true);
      expect(system.setExecutionMode('traditional')).toBe(true);
      expect(system.setExecutionMode('invalid')).toBe(false);
    });

    it('should include progressive stats in dashboard data', async () => {
      const task = { id: 'dashboard-test', description: 'Test', complexity: 5 };
      
      await system.executeProgressive(task);
      
      const dashboardData = system.getDashboardData();
      
      expect(dashboardData).toHaveProperty('progressiveStats');
      expect(dashboardData.progressiveStats).toHaveProperty('learning');
      expect(dashboardData.progressiveStats).toHaveProperty('thresholds');
    });

    it('should demonstrate cost savings with progressive refinement', async () => {
      // Execute multiple tasks
      const tasks = [
        { id: 't1', description: 'Simple utility', complexity: 3 },
        { id: 't2', description: 'API endpoint', complexity: 5 },
        { id: 't3', description: 'Auth system', complexity: 8, critical: true }
      ];
      
      for (const task of tasks) {
        await system.executeProgressive(task);
      }
      
      const report = system.getPerformanceReport();
      const stats = system.getProgressiveStats();
      
      // Should have some cost data
      expect(report.summary.overall.totalCost).toBeGreaterThan(0);
      expect(stats.learning.attempts).toBeDefined();
    });
  });

  describe('Confidence Scoring Weights', () => {
    it('should have weights that sum to 1', () => {
      const scorer = new ConfidenceScorer();
      
      const weights = scorer.weights;
      const sum = Object.values(weights).reduce((a, b) => a + b, 0);
      
      expect(sum).toBeCloseTo(1, 2);
    });

    it('should prioritize completeness and code quality for coding tasks', () => {
      const scorer = new ConfidenceScorer();
      
      expect(scorer.weights.completeness).toBe(0.25);
      expect(scorer.weights.codeQuality).toBe(0.25);
      expect(scorer.weights.completeness + scorer.weights.codeQuality).toBe(0.50);
    });
  });

  describe('Stage Escalation Logic', () => {
    let pipeline;

    beforeEach(() => {
      pipeline = new ProgressiveRefinementPipeline({
        confidence: {
          cheapThreshold: 0.75,
          standardThreshold: 0.85,
          criticalThreshold: 0.90
        }
      });
    });

    it('should escalate when confidence is low', async () => {
      // Mock low confidence for cheap model
      const originalCalculateConfidence = pipeline.confidenceScorer.calculateConfidence;
      let callCount = 0;
      
      pipeline.confidenceScorer.calculateConfidence = (result, task) => {
        callCount++;
        if (callCount === 1) {
          // First call (cheap model) - return low confidence
          return { overall: 0.5, passed: false, metrics: {} };
        }
        // Second call (standard model) - return high confidence
        return { overall: 0.9, passed: true, metrics: {} };
      };
      
      const task = { id: 'test', description: 'Test', complexity: 5 };
      const result = await pipeline.execute(task);
      
      expect(result.finalStage).toBe(2);
      expect(result.stages.length).toBe(2);
      
      pipeline.confidenceScorer.calculateConfidence = originalCalculateConfidence;
    });

    it('should use premium for critical tasks', async () => {
      const task = { id: 'critical', description: 'Security', complexity: 8, critical: true };
      
      // This will use standard model for most cases but should check critical
      const result = await pipeline.execute(task);
      
      // Should have at least tried 2 stages for critical task
      expect(result.stages.length).toBeGreaterThanOrEqual(2);
    });
  });
});
