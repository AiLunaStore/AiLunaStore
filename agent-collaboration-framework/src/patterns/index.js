// Coordination Patterns - Reusable execution patterns for agent collaboration

/**
 * Base class for coordination patterns
 */
export class CoordinationPattern {
  constructor(options = {}) {
    this.options = options;
  }

  /**
   * Execute the pattern - must be implemented by subclasses
   * @param {Object} params - Execution parameters
   * @returns {Promise<Object>} Execution results
   */
  async execute(params) {
    throw new Error('execute() must be implemented by subclass');
  }

  /**
   * Validate that all required parameters are present
   * @param {Object} params - Parameters to validate
   * @param {string[]} required - Required parameter names
   */
  validateParams(params, required) {
    for (const param of required) {
      if (!(param in params)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }
}

// Export pattern implementations
export { ParallelIndependentPattern } from './parallel-independent.js';
export { SequentialDependentPattern } from './sequential-dependent.js';
export { FanOutFanInPattern } from './fan-out-fan-in.js';
export { PipelinePattern } from './pipeline.js';
