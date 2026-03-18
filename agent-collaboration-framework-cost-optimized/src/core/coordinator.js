/**
 * Coordinator - Orchestrates subtask execution using coordination patterns
 */
import { ParallelIndependentPattern } from '../patterns/parallel-independent.js';
import { SequentialDependentPattern } from '../patterns/sequential-dependent.js';
import { FanOutFanInPattern } from '../patterns/fan-out-fan-in.js';
import { PipelinePattern } from '../patterns/pipeline.js';

export class Coordinator {
  constructor(options = {}) {
    this.options = {
      defaultPattern: options.defaultPattern || 'fan-out-fan-in',
      timeoutMs: options.timeoutMs || 300000,
      retryAttempts: options.retryAttempts || 2,
      ...options
    };
    
    this.patterns = new Map();
    this.registerDefaultPatterns();
  }

  registerDefaultPatterns() {
    this.registerPattern('parallel-independent', new ParallelIndependentPattern());
    this.registerPattern('sequential-dependent', new SequentialDependentPattern());
    this.registerPattern('fan-out-fan-in', new FanOutFanInPattern());
    this.registerPattern('pipeline', new PipelinePattern());
  }

  registerPattern(name, pattern) {
    this.patterns.set(name, pattern);
  }

  async execute(params) {
    const { executionId, task, analysis, assignments, onProgress } = params;
    
    const pattern = this.selectPattern(analysis);
    const patternImpl = this.patterns.get(pattern);
    
    if (!patternImpl) {
      throw new Error(`Unknown coordination pattern: ${pattern}`);
    }
    
    return await patternImpl.execute({
      executionId,
      task,
      analysis,
      assignments,
      onProgress,
      timeoutMs: this.options.timeoutMs,
      retryAttempts: this.options.retryAttempts
    });
  }

  selectPattern(analysis) {
    const { dependencies, subtasks } = analysis;
    
    const hasDataFlow = subtasks.some(st => st.type === 'transform' || st.type === 'process');
    if (hasDataFlow && subtasks.length > 1) {
      return 'pipeline';
    }
    
    const hasDependencies = Object.values(dependencies).some(dep => dep.dependsOn.length > 0);
    if (hasDependencies && analysis.parallelizable.length > 1) {
      return 'sequential-dependent';
    }
    
    if (!hasDependencies && subtasks.length > 1) {
      return 'parallel-independent';
    }
    
    return 'fan-out-fan-in';
  }
}