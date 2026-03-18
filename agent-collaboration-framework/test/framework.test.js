import { describe, it } from 'node:test';
import assert from 'node:assert';
import { CollaborationFramework } from '../src/index.js';

describe('CollaborationFramework', () => {
  describe('execute', () => {
    it('should execute simple task solo', async () => {
      const framework = new CollaborationFramework({
        thresholds: { complexity: 10, estimatedTimeMinutes: 10, subtaskCount: 10 }
      });

      const task = {
        id: 'simple-task',
        description: 'Update color'
      };

      const result = await framework.execute(task);

      assert.strictEqual(result.strategy, 'solo');
      assert.ok(result.executionId);
      assert.ok(result.metrics);
    });

    it('should delegate complex task', async () => {
      const framework = new CollaborationFramework({
        thresholds: { complexity: 3, estimatedTimeMinutes: 2, subtaskCount: 2 }
      });

      const task = {
        id: 'complex-task',
        description: 'Debug and fix complex issue with API and database'
      };

      const result = await framework.execute(task);

      assert.strictEqual(result.strategy, 'collaborative');
      assert.ok(result.subtaskResults);
      assert.ok(result.subtaskResults.length > 0);
    });

    it('should return metrics', async () => {
      const framework = new CollaborationFramework();

      const task = {
        id: 'metrics-test',
        description: 'Debug complex system with UI backend and database issues'
      };

      const result = await framework.execute(task);

      assert.ok(result.metrics.duration >= 0);
      assert.ok(result.metrics.subtasks >= 0);
      if (result.strategy === 'collaborative') {
        assert.ok(result.metrics.speedupFactor > 0);
      }
    });
  });

  describe('shouldDelegate', () => {
    it('should delegate high complexity', () => {
      const framework = new CollaborationFramework({
        thresholds: { complexity: 5 }
      });

      const analysis = { complexity: 8, estimatedTimeMinutes: 1, subtasks: [] };
      assert.strictEqual(framework.shouldDelegate(analysis), true);
    });

    it('should delegate long tasks', () => {
      const framework = new CollaborationFramework({
        thresholds: { estimatedTimeMinutes: 5 }
      });

      const analysis = { complexity: 3, estimatedTimeMinutes: 10, subtasks: [] };
      assert.strictEqual(framework.shouldDelegate(analysis), true);
    });

    it('should delegate many subtasks', () => {
      const framework = new CollaborationFramework({
        thresholds: { subtaskCount: 3 }
      });

      const analysis = { 
        complexity: 3, 
        estimatedTimeMinutes: 1, 
        subtasks: [{}, {}, {}, {}] 
      };
      assert.strictEqual(framework.shouldDelegate(analysis), true);
    });

    it('should delegate multi-domain tasks', () => {
      const framework = new CollaborationFramework();

      const analysis = {
        complexity: 3,
        estimatedTimeMinutes: 1,
        subtasks: [
          { domain: 'ui' },
          { domain: 'backend' }
        ]
      };
      assert.strictEqual(framework.shouldDelegate(analysis), true);
    });

    it('should work solo for simple tasks', () => {
      const framework = new CollaborationFramework({
        thresholds: { complexity: 5, estimatedTimeMinutes: 3, subtaskCount: 3 }
      });

      const analysis = {
        complexity: 3,
        estimatedTimeMinutes: 2,
        subtasks: [{ domain: 'ui' }]
      };
      assert.strictEqual(framework.shouldDelegate(analysis), false);
    });
  });

  describe('getStats', () => {
    it('should return framework statistics', async () => {
      const framework = new CollaborationFramework();

      // Execute a task to generate stats
      await framework.execute({
        id: 'stats-test',
        description: 'Debug complex issue'
      });

      const stats = framework.getStats();

      assert.ok(stats.thresholds);
      assert.ok(stats.performance);
      assert.ok(stats.agents);
      assert.ok(Array.isArray(stats.agents));
    });
  });
});
