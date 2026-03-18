/**
 * Fan-Out/Fan-In Pattern - Coordinator delegates, then integrates results
 */
import { ParallelIndependentPattern } from './parallel-independent.js';

export class FanOutFanInPattern {
  async execute(params) {
    const { executionId, task, analysis, assignments, onProgress, timeoutMs } = params;
    const startTime = Date.now();
    
    const parallelPattern = new ParallelIndependentPattern();
    const parallelResult = await parallelPattern.execute({
      executionId,
      assignments,
      onProgress,
      timeoutMs
    });
    
    return {
      pattern: 'fan-out-fan-in',
      subtaskResults: parallelResult.subtaskResults,
      duration: Date.now() - startTime,
      completed: parallelResult.completed,
      failed: parallelResult.failed
    };
  }
}