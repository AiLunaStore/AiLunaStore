import { describe, it, expect, beforeEach } from 'vitest';
import { Orchestrator } from '../src/orchestrator.js';
import { TaskRouter } from '../src/task-router.js';
import { CostTracker } from '../src/cost-tracker.js';
import { PerformanceMonitor } from '../src/performance-monitor.js';
import { FallbackManager } from '../src/fallback-manager.js';
import { IntegratedAgentSystem } from '../src/index.js';

describe('Integrated Agent System', () => {
  describe('Orchestrator', () => {
    let orchestrator;

    beforeEach(() => {
      orchestrator = new Orchestrator({
        defaultBudget: 5.00
      });
    });

    it('should initialize with correct configuration', () => {
      const status = orchestrator.getStatus();
      expect(status.models).toContain('minimax-m2.5');
      expect(status.agents).toContain('coding-specialist');
      expect(status.costStatus.budgetCount).toBeGreaterThan(0);
    });

    it('should classify and route coding tasks correctly', async () => {
      const task = {
        id: 'test-1',
        description: 'Implement a React component for user authentication',
        complexity: 7
      };

      const result = await orchestrator.execute(task);
      
      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('metrics');
      expect(result.routing.taskType).toBe('coding');
      expect(result.metrics.cost).toBeGreaterThan(0);
    });

    it('should classify and route research tasks correctly', async () => {
      const task = {
        id: 'test-2',
        description: 'Research the best state management libraries for React',
        complexity: 5
      };

      const result = await orchestrator.execute(task);
      
      expect(result.routing.taskType).toBe('research');
      expect(result.metrics.cost).toBeLessThan(0.01); // Research should use cheaper models
    });

    it('should handle budget constraints', async () => {
      const task = {
        id: 'test-3',
        description: 'Debug a complex memory leak in Node.js application',
        complexity: 9,
        budget: 0.001 // Very low budget
      };

      const result = await orchestrator.execute(task, { budget: 0.001 });
      
      // Should either reject or use economy strategy
      expect(result.strategy === 'rejected' || result.routing.strategy === 'economy').toBe(true);
    });

    it('should track execution history', async () => {
      const task = {
        id: 'test-4',
        description: 'Create a simple API endpoint',
        complexity: 4
      };

      await orchestrator.execute(task);
      const history = orchestrator.getHistory({ limit: 10 });
      
      expect(history.length).toBeGreaterThan(0);
      expect(history[0]).toHaveProperty('executionId');
      expect(history[0]).toHaveProperty('metrics');
    });
  });

  describe('Task Router', () => {
    let router;

    beforeEach(() => {
      router = new TaskRouter();
    });

    it('should classify task types correctly', () => {
      const codingTask = { description: 'Implement a function to sort arrays' };
      const researchTask = { description: 'Find documentation about WebSockets' };
      const planningTask = { description: 'Design the architecture for a new feature' };

      expect(router.classifyTask(codingTask).taskType).toBe('coding');
      expect(router.classifyTask(researchTask).taskType).toBe('research');
      expect(router.classifyTask(planningTask).taskType).toBe('planning');
    });

    it('should select appropriate strategy based on task type', () => {
      const codingTask = { description: 'Fix a bug in the login system' };
      const context = {};

      const routing = router.classifyAndRoute(codingTask, context);
      
      expect(routing.strategy).toBe('coding');
      expect(routing.agent).toBe('coding-specialist');
      expect(routing.model).toBe('minimax-m2.5');
    });

    it('should select economy strategy when budget is tight', () => {
      const task = { description: 'Implement a feature' };
      const context = { budget: 0.5 };

      const routing = router.classifyAndRoute(task, context);
      
      expect(routing.strategy).toBe('economy');
    });

    it('should estimate costs correctly', () => {
      const task = { description: 'Test task', complexity: 5 };
      const routing = router.classifyAndRoute(task, {});
      
      expect(routing.estimatedCost).toBeGreaterThan(0);
      expect(routing.estimatedCost).toBeLessThan(0.1);
    });
  });

  describe('Cost Tracker', () => {
    let tracker;

    beforeEach(() => {
      tracker = new CostTracker({ defaultBudget: 10.00 });
    });

    it('should track costs correctly', () => {
      tracker.recordCost('default', {
        executionId: 'test-1',
        amount: 0.01,
        model: 'minimax-m2.5',
        agent: 'coding-specialist',
        taskType: 'coding'
      });

      const status = tracker.getBudgetStatus('default');
      expect(status.spent).toBe(0.01);
      expect(status.utilization).toBe(0.1);
    });

    it('should handle budget reservations', () => {
      tracker.reserveBudget('exec-1', 0.05);
      
      const status = tracker.getBudgetStatus('default');
      expect(status.reserved).toBe(0.05);
      expect(status.available).toBe(9.95);
    });

    it('should check affordability correctly', () => {
      const check1 = tracker.canAfford('default', 5.00);
      const check2 = tracker.canAfford('default', 15.00);

      expect(check1.affordable).toBe(true);
      expect(check2.affordable).toBe(false);
    });

    it('should trigger alerts at thresholds', () => {
      const alerts = [];
      tracker.onAlert((alert) => alerts.push(alert));

      // Spend 60% of budget
      tracker.recordCost('default', {
        executionId: 'test-1',
        amount: 6.00,
        model: 'minimax-m2.5',
        agent: 'coding-specialist',
        taskType: 'coding'
      });

      expect(alerts.length).toBeGreaterThan(0);
      expect(alerts[0].threshold).toBe(50);
    });

    it('should provide accurate cost breakdowns', () => {
      tracker.recordCost('default', {
        executionId: 'test-1',
        amount: 0.01,
        model: 'minimax-m2.5',
        agent: 'coding-specialist',
        taskType: 'coding'
      });

      tracker.recordCost('default', {
        executionId: 'test-2',
        amount: 0.005,
        model: 'deepseek-v3.2',
        agent: 'research-specialist',
        taskType: 'research'
      });

      const byModel = tracker.getBreakdown('model');
      expect(byModel['minimax-m2.5'].total).toBe(0.01);
      expect(byModel['deepseek-v3.2'].total).toBe(0.005);
    });
  });

  describe('Performance Monitor', () => {
    let monitor;

    beforeEach(() => {
      monitor = new PerformanceMonitor();
    });

    it('should record and aggregate metrics', () => {
      monitor.record({
        executionId: 'test-1',
        task: { complexity: 5 },
        routing: { taskType: 'coding', model: 'minimax-m2.5', agent: 'coding-specialist' },
        result: { success: true, qualityScore: 0.9, model: 'minimax-m2.5', agent: 'coding-specialist' },
        duration: 5000,
        cost: 0.01
      });

      const summary = monitor.getSummary();
      expect(summary.overall.totalExecutions).toBe(1);
      expect(summary.overall.successRate).toBe(100);
    });

    it('should calculate quality analysis', () => {
      monitor.record({
        executionId: 'test-1',
        task: { complexity: 5 },
        routing: { taskType: 'coding', model: 'minimax-m2.5', agent: 'coding-specialist' },
        result: { success: true, qualityScore: 0.85, model: 'minimax-m2.5', agent: 'coding-specialist' },
        duration: 5000,
        cost: 0.01
      });

      const analysis = monitor.getQualityAnalysis();
      expect(analysis.overallQuality).toBe(0.85);
    });

    it('should calculate efficiency metrics', () => {
      monitor.record({
        executionId: 'test-1',
        task: { complexity: 5 },
        routing: { taskType: 'coding', model: 'minimax-m2.5', agent: 'coding-specialist' },
        result: { success: true, qualityScore: 0.9, model: 'minimax-m2.5', agent: 'coding-specialist' },
        duration: 5000,
        cost: 0.01
      });

      const efficiency = monitor.getEfficiencyMetrics();
      expect(efficiency.byModel['minimax-m2.5']).toBe(90); // 0.9 / 0.01
    });

    it('should calculate cost comparison with Kimi-only system', () => {
      monitor.record({
        executionId: 'test-1',
        task: { complexity: 5 },
        routing: { taskType: 'coding', model: 'minimax-m2.5', agent: 'coding-specialist' },
        result: { success: true, qualityScore: 0.9, model: 'minimax-m2.5', agent: 'coding-specialist' },
        duration: 5000,
        cost: 0.0039 // MiniMax cost
      });

      const comparison = monitor.getCostComparison();
      expect(comparison.savings).toBeGreaterThan(0);
      expect(comparison.savingsPercent).toBeGreaterThan(0);
    });
  });

  describe('Fallback Manager', () => {
    let manager;

    beforeEach(() => {
      manager = new FallbackManager();
    });

    it('should return correct fallback chain for task types', () => {
      const codingChain = manager.getFallbackChain('coding');
      const researchChain = manager.getFallbackChain('research');

      expect(codingChain.length).toBeGreaterThan(0);
      expect(codingChain[0].model).toBe('minimax-m2.5');
      expect(researchChain[0].model).toBe('gemini-2.5-flash-lite');
    });

    it('should validate fallback chains', () => {
      const validation = manager.validateChain('coding');
      expect(validation.valid).toBe(true);
      expect(validation.chainLength).toBeGreaterThan(0);
    });

    it('should track fallback statistics', () => {
      manager.recordFallback('coding', 'error', 1);
      manager.recordFallback('coding', 'quality_threshold', 2);

      const stats = manager.getStats();
      expect(stats.totalFallbacks).toBe(2);
      expect(stats.byTaskType['coding']).toBe(2);
    });
  });

  describe('Integration Tests', () => {
    let system;

    beforeEach(() => {
      system = new IntegratedAgentSystem({
        defaultBudget: 10.00
      });
    });

    it('should execute end-to-end task flow', async () => {
      const task = {
        id: 'integration-test',
        description: 'Implement a user authentication system with JWT tokens',
        complexity: 8
      };

      const result = await system.execute(task);

      expect(result).toHaveProperty('executionId');
      expect(result).toHaveProperty('routing');
      expect(result).toHaveProperty('metrics');
      expect(result.routing.taskType).toBe('coding');
      expect(result.metrics.cost).toBeGreaterThan(0);
      expect(result.metrics.duration).toBeGreaterThan(0);
    });

    it('should provide comprehensive system status', () => {
      const status = system.getStatus();

      expect(status).toHaveProperty('orchestrator');
      expect(status).toHaveProperty('costTracker');
      expect(status).toHaveProperty('performanceMonitor');
      expect(status).toHaveProperty('fallbackManager');
    });

    it('should generate dashboard data', async () => {
      // Execute some tasks first
      await system.execute({ id: 't1', description: 'Code task', complexity: 5 });
      await system.execute({ id: 't2', description: 'Research task', complexity: 4 });

      const dashboardData = system.getDashboardData();

      expect(dashboardData).toHaveProperty('currentSpending');
      expect(dashboardData).toHaveProperty('successRate');
      expect(dashboardData).toHaveProperty('byModel');
      expect(dashboardData).toHaveProperty('byAgent');
    });

    it('should demonstrate cost savings vs Kimi-only', async () => {
      // Execute multiple tasks
      for (let i = 0; i < 10; i++) {
        await system.execute({
          id: `task-${i}`,
          description: 'Implement feature',
          complexity: 5
        });
      }

      const report = system.getPerformanceReport();
      
      expect(report.comparison.savings).toBeGreaterThan(0);
      expect(report.comparison.savingsPercent).toBeGreaterThan(10); // At least 10% savings
    });
  });
});
