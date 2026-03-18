import { describe, it, expect } from 'vitest';
import { PerformanceMonitor } from '../src/performance-monitor.js';

describe('Cost Savings Verification', () => {
  let monitor;

  beforeEach(() => {
    monitor = new PerformanceMonitor();
  });

  it('should calculate savings for MiniMax vs Kimi', () => {
    // Simulate 100 tasks using MiniMax M2.5
    for (let i = 0; i < 100; i++) {
      monitor.record({
        executionId: `task-${i}`,
        task: { complexity: 5 },
        routing: { taskType: 'coding', model: 'minimax-m2.5', agent: 'coding-specialist' },
        result: { success: true, qualityScore: 0.9, model: 'minimax-m2.5', agent: 'coding-specialist' },
        duration: 5000,
        cost: 0.0039 // MiniMax M2.5 cost per task
      });
    }

    const comparison = monitor.getCostComparison();
    
    // Kimi cost per task: (2000/1M * 0.60) + (1500/1M * 3.00) = $0.0057
    // MiniMax cost per task: $0.0039
    // Expected savings per task: $0.0018
    // Total savings for 100 tasks: $0.18
    
    expect(comparison.kimiOnlyCost).toBeCloseTo(0.57, 2); // 100 * 0.0057
    expect(comparison.optimizedCost).toBeCloseTo(0.39, 2); // 100 * 0.0039
    expect(comparison.savings).toBeGreaterThan(0);
    expect(comparison.savingsPercent).toBeGreaterThan(20); // Should save at least 20%
  });

  it('should calculate savings with mixed model usage', () => {
    // Simulate mixed usage
    const tasks = [
      { model: 'minimax-m2.5', cost: 0.0039, count: 50 },
      { model: 'deepseek-v3.2', cost: 0.0010, count: 30 },
      { model: 'gemini-2.5-flash-lite', cost: 0.0012, count: 20 }
    ];

    for (const taskType of tasks) {
      for (let i = 0; i < taskType.count; i++) {
        monitor.record({
          executionId: `task-${taskType.model}-${i}`,
          task: { complexity: 5 },
          routing: { taskType: 'coding', model: taskType.model, agent: 'coding-specialist' },
          result: { success: true, qualityScore: 0.85, model: taskType.model, agent: 'coding-specialist' },
          duration: 5000,
          cost: taskType.cost
        });
      }
    }

    const comparison = monitor.getCostComparison();
    
    // Total optimized cost: (50 * 0.0039) + (30 * 0.0010) + (20 * 0.0012) = 0.195 + 0.03 + 0.024 = 0.249
    // Kimi cost: 100 * 0.0057 = 0.57
    
    expect(comparison.optimizedCost).toBeCloseTo(0.249, 2);
    expect(comparison.savings).toBeGreaterThan(0.30); // Should save more than $0.30
    expect(comparison.savingsPercent).toBeGreaterThan(50); // Should save more than 50%
  });

  it('should demonstrate economy strategy savings', () => {
    // Simulate tasks using economy strategy (mostly DeepSeek and Gemini Flash)
    for (let i = 0; i < 100; i++) {
      const isResearch = i % 3 === 0;
      const model = isResearch ? 'gemini-2.5-flash-lite' : 'deepseek-v3.2';
      const cost = isResearch ? 0.0012 : 0.0010;
      
      monitor.record({
        executionId: `economy-task-${i}`,
        task: { complexity: 4 },
        routing: { taskType: isResearch ? 'research' : 'coding', model, agent: isResearch ? 'research-specialist' : 'coding-specialist' },
        result: { success: true, qualityScore: 0.8, model, agent: isResearch ? 'research-specialist' : 'coding-specialist' },
        duration: 4000,
        cost
      });
    }

    const comparison = monitor.getCostComparison();
    
    // Economy strategy should yield significant savings
    expect(comparison.savingsPercent).toBeGreaterThan(60);
  });

  it('should show quality strategy costs more but still saves vs Kimi', () => {
    // Simulate tasks using quality strategy (MiniMax, Claude)
    for (let i = 0; i < 100; i++) {
      const useClaude = i % 10 === 0; // 10% Claude for critical tasks
      const model = useClaude ? 'claude-sonnet' : 'minimax-m2.5';
      const cost = useClaude ? 0.057 : 0.0039;
      
      monitor.record({
        executionId: `quality-task-${i}`,
        task: { complexity: 7 },
        routing: { taskType: 'coding', model, agent: 'coding-specialist' },
        result: { success: true, qualityScore: useClaude ? 0.98 : 0.9, model, agent: 'coding-specialist' },
        duration: 6000,
        cost
      });
    }

    const comparison = monitor.getCostComparison();
    
    // Even with quality strategy, should still save vs using Kimi for everything
    expect(comparison.savings).toBeGreaterThan(0);
  });

  it('should calculate per-task cost averages correctly', () => {
    // Record tasks with known costs
    const costs = [0.001, 0.002, 0.003, 0.004, 0.005];
    
    for (let i = 0; i < costs.length; i++) {
      monitor.record({
        executionId: `avg-task-${i}`,
        task: { complexity: 5 },
        routing: { taskType: 'coding', model: 'deepseek-v3.2', agent: 'coding-specialist' },
        result: { success: true, qualityScore: 0.85, model: 'deepseek-v3.2', agent: 'coding-specialist' },
        duration: 5000,
        cost: costs[i]
      });
    }

    const comparison = monitor.getCostComparison();
    
    // Average: (0.001 + 0.002 + 0.003 + 0.004 + 0.005) / 5 = 0.003
    expect(comparison.perTaskAverage.optimized).toBeCloseTo(0.003, 3);
  });
});
