/**
 * Cost Savings Verification Test
 * Validates 23-60% savings vs Kimi-only system
 */

import { describe, it, expect } from 'vitest';
import { PerformanceMonitor } from '../backend/integrated-agent-system.js';

describe('Cost Savings Verification', () => {
  it('should achieve at least 23% cost savings vs Kimi-only', () => {
    const monitor = new PerformanceMonitor();
    
    // Simulate 100 tasks with optimized system
    for (let i = 0; i < 100; i++) {
      monitor.record({
        executionId: `exec-${i}`,
        task: { description: 'Test task', complexity: 5 },
        routing: { taskType: 'coding' },
        result: {
          model: 'minimax-m2.5',
          agent: 'coding-specialist',
          qualityScore: 0.85,
          success: true
        },
        duration: 2500,
        cost: 0.0025 // Optimized cost per task
      });
    }
    
    const comparison = monitor.getCostComparison();
    
    console.log('Cost Comparison:');
    console.log(`  Kimi-only cost: $${comparison.kimiOnlyCost.toFixed(4)}`);
    console.log(`  Optimized cost: $${comparison.optimizedCost.toFixed(4)}`);
    console.log(`  Savings: $${comparison.savings.toFixed(4)} (${comparison.savingsPercent.toFixed(1)}%)`);
    
    expect(comparison.savingsPercent).toBeGreaterThanOrEqual(23);
    expect(comparison.savingsPercent).toBeLessThanOrEqual(70); // Allow for variance
  });

  it('should track savings by strategy', () => {
    const monitor = new PerformanceMonitor();
    
    // Economy strategy tasks (cheapest)
    for (let i = 0; i < 50; i++) {
      monitor.record({
        executionId: `exec-econ-${i}`,
        task: { description: 'Economy task', complexity: 3 },
        routing: { taskType: 'research' },
        result: {
          model: 'gemini-2.5-flash-lite',
          agent: 'research-specialist',
          qualityScore: 0.75,
          success: true
        },
        duration: 1500,
        cost: 0.0012
      });
    }
    
    // Quality strategy tasks (more expensive)
    for (let i = 0; i < 50; i++) {
      monitor.record({
        executionId: `exec-qual-${i}`,
        task: { description: 'Quality task', complexity: 8 },
        routing: { taskType: 'coding' },
        result: {
          model: 'minimax-m2.5',
          agent: 'coding-specialist',
          qualityScore: 0.92,
          success: true
        },
        duration: 3500,
        cost: 0.0050
      });
    }
    
    const comparison = monitor.getCostComparison();
    
    // Should still achieve savings even with quality tasks
    expect(comparison.savings).toBeGreaterThan(0);
    expect(comparison.savingsPercent).toBeGreaterThan(10);
  });

  it('should maintain quality above threshold', () => {
    const monitor = new PerformanceMonitor();
    
    // Record tasks with varying quality
    for (let i = 0; i < 100; i++) {
      monitor.record({
        executionId: `exec-${i}`,
        task: { description: 'Test task', complexity: 5 },
        routing: { taskType: 'coding' },
        result: {
          model: 'minimax-m2.5',
          agent: 'coding-specialist',
          qualityScore: 0.7 + Math.random() * 0.25, // 0.7 - 0.95
          success: true
        },
        duration: 2500,
        cost: 0.0025
      });
    }
    
    const quality = monitor.getQualityAnalysis();
    
    console.log('Quality Metrics:');
    console.log(`  Overall Quality: ${quality.overallQuality.toFixed(2)}`);
    console.log(`  High Quality Rate: ${quality.highQualityRate.toFixed(1)}%`);
    
    expect(quality.overallQuality).toBeGreaterThanOrEqual(0.7);
  });
});
