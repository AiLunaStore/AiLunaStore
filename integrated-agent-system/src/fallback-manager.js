import fallbackChainsConfig from '../config/fallback-chains.json' assert { type: 'json' };

/**
 * Fallback Manager - Manages automatic escalation when models fail
 */
export class FallbackManager {
  constructor(options = {}) {
    this.fallbackChains = options.fallbackChains || fallbackChainsConfig.fallbackChains;
    this.globalSettings = options.globalSettings || fallbackChainsConfig.globalSettings;
    
    // Track fallback usage
    this.fallbackStats = {
      totalFallbacks: 0,
      byTaskType: {},
      byReason: {}
    };
  }

  /**
   * Get fallback chain for a task type
   */
  getFallbackChain(taskType) {
    const chainConfig = this.fallbackChains[taskType];
    
    if (!chainConfig) {
      // Return default coding chain if no specific chain found
      return this.fallbackChains['coding']?.chain || [];
    }
    
    return chainConfig.chain;
  }

  /**
   * Execute with fallback support
   */
  async executeWithFallback(executeFn, taskType, context = {}) {
    const chain = this.getFallbackChain(taskType);
    const errors = [];
    
    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      
      try {
        // Attempt execution
        const result = await this.executeWithTimeout(
          () => executeFn(step, context),
          this.globalSettings.timeoutSeconds * 1000
        );
        
        // Check quality threshold
        if (result.qualityScore >= this.globalSettings.qualityThreshold) {
          // Record fallback if not first attempt
          if (i > 0) {
            this.recordFallback(taskType, 'quality_retry', i);
          }
          
          return {
            ...result,
            fallbackUsed: i > 0,
            fallbackAttempts: i,
            finalStep: step
          };
        }
        
        // Quality below threshold, continue to next fallback
        errors.push({
          step: i,
          reason: 'quality_threshold',
          qualityScore: result.qualityScore,
          threshold: this.globalSettings.qualityThreshold
        });
        
      } catch (error) {
        errors.push({
          step: i,
          reason: 'error',
          error: error.message
        });
        
        // Check if we should retry this step
        if (this.shouldRetry(step, error) && context.retries < step.maxRetries) {
          context.retries = (context.retries || 0) + 1;
          i--; // Retry same step
          continue;
        }
        
        // Record fallback
        this.recordFallback(taskType, 'error', i);
        
        // Continue to next fallback step
        continue;
      }
    }
    
    // All fallbacks exhausted
    throw new FallbackExhaustedError(
      `All fallback options exhausted for task type: ${taskType}`,
      errors
    );
  }

  /**
   * Execute with timeout
   */
  executeWithTimeout(fn, timeoutMs) {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error(`Execution timed out after ${timeoutMs}ms`));
      }, timeoutMs);
      
      Promise.resolve(fn())
        .then(result => {
          clearTimeout(timeout);
          resolve(result);
        })
        .catch(error => {
          clearTimeout(timeout);
          reject(error);
        });
    });
  }

  /**
   * Check if a step should be retried
   */
  shouldRetry(step, error) {
    // Retry on timeout or transient errors
    if (error.message.includes('timeout')) return true;
    if (error.message.includes('rate limit')) return true;
    if (error.message.includes('temporary')) return true;
    if (error.message.includes('ECONNRESET')) return true;
    
    return false;
  }

  /**
   * Record fallback usage
   */
  recordFallback(taskType, reason, stepIndex) {
    this.fallbackStats.totalFallbacks++;
    
    // By task type
    if (!this.fallbackStats.byTaskType[taskType]) {
      this.fallbackStats.byTaskType[taskType] = 0;
    }
    this.fallbackStats.byTaskType[taskType]++;
    
    // By reason
    if (!this.fallbackStats.byReason[reason]) {
      this.fallbackStats.byReason[reason] = 0;
    }
    this.fallbackStats.byReason[reason]++;
  }

  /**
   * Get fallback statistics
   */
  getStats() {
    return {
      ...this.fallbackStats,
      chains: Object.keys(this.fallbackChains).reduce((acc, key) => {
        acc[key] = this.fallbackChains[key].chain.length;
        return acc;
      }, {})
    };
  }

  /**
   * Validate a fallback chain
   */
  validateChain(taskType) {
    const chain = this.getFallbackChain(taskType);
    const issues = [];
    
    if (chain.length === 0) {
      issues.push(`No fallback chain defined for task type: ${taskType}`);
      return { valid: false, issues };
    }
    
    if (chain.length < 2) {
      issues.push(`Fallback chain for ${taskType} has only one option`);
    }
    
    // Check for duplicate models
    const models = chain.map(step => step.model);
    const duplicates = models.filter((item, index) => models.indexOf(item) !== index);
    if (duplicates.length > 0) {
      issues.push(`Duplicate models in chain: ${[...new Set(duplicates)].join(', ')}`);
    }
    
    return {
      valid: issues.length === 0,
      issues,
      chainLength: chain.length,
      models: [...new Set(models)]
    };
  }

  /**
   * Validate all fallback chains
   */
  validateAllChains() {
    const results = {};
    
    for (const taskType of Object.keys(this.fallbackChains)) {
      results[taskType] = this.validateChain(taskType);
    }
    
    return results;
  }

  /**
   * Get chain recommendations
   */
  getRecommendations(taskType) {
    const chain = this.getFallbackChain(taskType);
    const recommendations = [];
    
    if (chain.length < 3) {
      recommendations.push({
        type: 'chain_length',
        severity: 'warning',
        message: `Chain has only ${chain.length} options. Consider adding more fallbacks.`
      });
    }
    
    // Check cost progression
    let prevCost = 0;
    for (let i = 0; i < chain.length; i++) {
      const step = chain[i];
      // Assume cost is inversely related to position (cheaper first)
      // This is a simplified check
    }
    
    return recommendations;
  }
}

/**
 * Custom error for exhausted fallbacks
 */
export class FallbackExhaustedError extends Error {
  constructor(message, errors) {
    super(message);
    this.name = 'FallbackExhaustedError';
    this.errors = errors;
    this.fallbackAttempts = errors.length;
  }
}

export default FallbackManager;
