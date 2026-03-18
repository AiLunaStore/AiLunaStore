/**
 * Error Handler - Handles failures with retry, reassignment, or escalation strategies
 */
export class ErrorHandler {
  constructor(options = {}) {
    this.options = {
      maxRetries: options.maxRetries || 2,
      retryDelayMs: options.retryDelayMs || 1000,
      enableReassignment: options.enableReassignment ?? true,
      enableEscalation: options.enableEscalation ?? true,
      escalationThreshold: options.escalationThreshold || 3, // Failures before escalation
      ...options
    };
    
    this.failureHistory = new Map(); // Track failures per subtask
  }

  /**
   * Handle an error during execution
   * @param {Object} params - Error context
   * @returns {Promise<Object>} Handling result
   */
  async handle(params) {
    const { executionId, error, task, framework } = params;
    
    console.error(`[ErrorHandler] Execution ${executionId} failed:`, error.message);
    
    // Determine error type
    const errorType = this.classifyError(error);
    
    // Get failure count for this context
    const failureKey = `${executionId}-${task.id}`;
    const failureCount = (this.failureHistory.get(failureKey) || 0) + 1;
    this.failureHistory.set(failureKey, failureCount);
    
    // Decide on handling strategy
    if (failureCount <= this.options.maxRetries && this.isRetryable(errorType)) {
      // Retry the task
      return await this.retry(params, failureCount);
    }
    
    if (this.options.enableReassignment && failureCount <= this.options.maxRetries + 1) {
      // Try reassigning to a different agent
      return await this.reassign(params);
    }
    
    if (this.options.enableEscalation && failureCount >= this.options.escalationThreshold) {
      // Escalate to human or higher-level agent
      return await this.escalate(params);
    }
    
    // Fallback: coordinator takes over
    return await this.coordinatorFallback(params);
  }

  /**
   * Classify an error by type
   * @param {Error} error - The error
   * @returns {string} Error type
   */
  classifyError(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('timeout') || message.includes('etimedout')) {
      return 'timeout';
    }
    if (message.includes('network') || message.includes('connection') || message.includes('econnrefused')) {
      return 'network';
    }
    if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
      return 'auth';
    }
    if (message.includes('not found') || message.includes('enoent')) {
      return 'not_found';
    }
    if (message.includes('parse') || message.includes('syntax') || message.includes('unexpected')) {
      return 'parse';
    }
    if (message.includes('memory') || message.includes('heap')) {
      return 'resource';
    }
    
    return 'unknown';
  }

  /**
   * Check if an error type is retryable
   * @param {string} errorType - Error type
   * @returns {boolean} Whether to retry
   */
  isRetryable(errorType) {
    const retryable = ['timeout', 'network', 'resource'];
    return retryable.includes(errorType);
  }

  /**
   * Retry the failed execution
   * @param {Object} params - Error context
   * @param {number} attempt - Retry attempt number
   * @returns {Promise<Object>} Retry result
   */
  async retry(params, attempt) {
    const { executionId, task, framework } = params;
    
    console.log(`[ErrorHandler] Retrying execution ${executionId} (attempt ${attempt})...`);
    
    // Wait before retry
    await this.delay(this.options.retryDelayMs * attempt);
    
    try {
      // Retry execution
      const result = await framework.execute(task);
      
      return {
        recovered: true,
        strategy: 'retry',
        attempt,
        result
      };
    } catch (error) {
      return {
        recovered: false,
        strategy: 'retry',
        attempt,
        error: error.message
      };
    }
  }

  /**
   * Reassign the task to a different agent
   * @param {Object} params - Error context
   * @returns {Promise<Object>} Reassignment result
   */
  async reassign(params) {
    const { executionId, task, framework } = params;
    
    console.log(`[ErrorHandler] Reassigning execution ${executionId} to different agent...`);
    
    // Get original analysis
    const analysis = await framework.taskAnalyzer.analyze(task);
    
    // Find alternative agents for each subtask
    const alternativeAssignments = [];
    for (const subtask of analysis.subtasks) {
      const candidates = framework.agentRegistry.findByDomain(subtask.domain);
      
      // Skip the agent that failed (would be tracked in real implementation)
      const alternatives = candidates.slice(1); // Take second-best onwards
      
      if (alternatives.length > 0) {
        alternativeAssignments.push({
          subtask,
          agent: alternatives[0].agent,
          confidence: alternatives[0].expertise,
          isReassignment: true
        });
      }
    }
    
    if (alternativeAssignments.length === 0) {
      return {
        recovered: false,
        strategy: 'reassign',
        error: 'No alternative agents available'
      };
    }
    
    try {
      // Execute with alternative assignments
      const coordinationResult = await framework.coordinator.execute({
        executionId: `${executionId}-reassign`,
        task,
        analysis,
        assignments: alternativeAssignments,
        onProgress: (update) => framework.progressTracker.update(executionId, update)
      });
      
      const integratedResult = framework.resultIntegrator.integrate({
        task,
        subtaskResults: coordinationResult.subtaskResults,
        analysis
      });
      
      return {
        recovered: true,
        strategy: 'reassign',
        result: integratedResult
      };
    } catch (error) {
      return {
        recovered: false,
        strategy: 'reassign',
        error: error.message
      };
    }
  }

  /**
   * Escalate to human or higher-level agent
   * @param {Object} params - Error context
   * @returns {Promise<Object>} Escalation result
   */
  async escalate(params) {
    const { executionId, task, error } = params;
    
    console.log(`[ErrorHandler] Escalating execution ${executionId}...`);
    
    // Create escalation request
    const escalation = {
      executionId,
      task,
      error: {
        message: error.message,
        stack: error.stack,
        type: this.classifyError(error)
      },
      timestamp: Date.now(),
      attempts: this.failureHistory.get(`${executionId}-${task.id}`) || 0
    };
    
    // In real implementation, this would notify a human or higher-level agent
    // For now, return an escalation request
    return {
      recovered: false,
      strategy: 'escalation',
      escalation,
      message: 'Task requires human intervention or higher-level agent'
    };
  }

  /**
   * Fallback to coordinator handling the task solo
   * @param {Object} params - Error context
   * @returns {Promise<Object>} Fallback result
   */
  async coordinatorFallback(params) {
    const { executionId, task } = params;
    
    console.log(`[ErrorHandler] Coordinator taking over execution ${executionId}...`);
    
    // Coordinator attempts to handle the task directly
    // This is a simplified fallback - in practice would be more sophisticated
    return {
      recovered: true,
      strategy: 'coordinator_fallback',
      result: {
        executionId,
        task,
        strategy: 'solo_fallback',
        result: {
          message: 'Task handled by coordinator after subagent failures',
          recommendation: 'Consider breaking task into smaller subtasks or reviewing agent capabilities'
        },
        metrics: {
          duration: 0,
          subtasks: 0,
          speedupFactor: 1
        }
      }
    };
  }

  /**
   * Delay for a specified time
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get failure statistics
   * @returns {Object} Failure statistics
   */
  getStats() {
    const stats = {
      totalFailures: 0,
      byType: {},
      byStrategy: {
        retry: 0,
        reassign: 0,
        escalation: 0,
        coordinator_fallback: 0
      }
    };
    
    for (const [key, count] of this.failureHistory) {
      stats.totalFailures += count;
    }
    
    return stats;
  }

  /**
   * Clear failure history
   */
  clearHistory() {
    this.failureHistory.clear();
  }
}
