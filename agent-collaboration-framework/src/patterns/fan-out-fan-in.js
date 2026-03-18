import { CoordinationPattern } from './base-pattern.js';
import { ParallelIndependentPattern } from './parallel-independent.js';

/**
 * Fan-Out/Fan-In Pattern
 * Coordinator delegates to multiple agents, then integrates results
 * 
 * Use case: Divide work among specialists, then combine results
 * Example: Debug a bug by having UI, backend, and DB specialists analyze simultaneously
 */
export class FanOutFanInPattern extends CoordinationPattern {
  constructor(options = {}) {
    super(options);
    this.options = {
      timeoutMs: options.timeoutMs || 300000,
      ...options
    };
  }

  async execute(params) {
    this.validateParams(params, ['task', 'analysis', 'assignments', 'executionId']);
    
    const { executionId, task, analysis, assignments, onProgress, timeoutMs } = params;
    const startTime = Date.now();
    
    // Fan out: Execute all subtasks in parallel
    const parallelPattern = new ParallelIndependentPattern(this.options);
    const parallelResult = await parallelPattern.execute({
      executionId,
      assignments,
      onProgress,
      timeoutMs
    });
    
    // Fan in: Integration happens in ResultIntegrator (called by framework)
    // This pattern just ensures all results are collected
    
    return {
      pattern: 'fan-out-fan-in',
      subtaskResults: parallelResult.subtaskResults,
      duration: Date.now() - startTime,
      completed: parallelResult.completed,
      failed: parallelResult.failed,
      successRate: parallelResult.successRate
    };
  }
}
