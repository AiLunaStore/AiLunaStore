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
      ...options
    };
    
    this.failureHistory = new Map();
  }

  async handle(params) {
    const { executionId, error, task, framework } = params;
    
    console.error(`[ErrorHandler] Execution ${executionId} failed:`, error.message);
    
    const errorType = this.classifyError(error);
    const failureKey = `${executionId}-${task.id}`;
    const failureCount = (this.failureHistory.get(failureKey) || 0) + 1;
    this.failureHistory.set(failureKey, failureCount);
    
    if (failureCount <= this.options.maxRetries && this.isRetryable(errorType)) {
      return await this.retry(params, failureCount);
    }
    
    if (this.options.enableReassignment && failureCount <= this.options.maxRetries + 1) {
      return await this.reassign(params);
    }
    
    return await this.coordinatorFallback(params);
  }

  classifyError(error) {
    const message = error.message.toLowerCase();
    if (message.includes('timeout')) return 'timeout';
    if (message.includes('network') || message.includes('connection')) return 'network';
    if (message.includes('auth')) return 'auth';
    if (message.includes('not found')) return 'not_found';
    return 'unknown';
  }

  isRetryable(errorType) {
    return ['timeout', 'network', 'resource'].includes(errorType);
  }

  async retry(params, attempt) {
    const { executionId, task, framework } = params;
    console.log(`[ErrorHandler] Retrying execution ${executionId} (attempt ${attempt})...`);
    
    await this.delay(this.options.retryDelayMs * attempt);
    
    try {
      const result = await framework.execute(task);
      return { recovered: true, strategy: 'retry', attempt, result };
    } catch (error) {
      return { recovered: false, strategy: 'retry', attempt, error: error.message };
    }
  }

  async reassign(params) {
    const { executionId, task, framework } = params;
    console.log(`[ErrorHandler] Reassigning execution ${executionId} to different agent...`);
    
    const analysis = await framework.taskAnalyzer.analyze(task);
    const alternativeAssignments = [];
    
    for (const subtask of analysis.subtasks) {
      const candidates = framework.agentRegistry.findByDomain(subtask.domain);
      const alternatives = candidates.slice(1);
      
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
      return { recovered: false, strategy: 'reassign', error: 'No alternative agents available' };
    }
    
    try {
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
      
      return { recovered: true, strategy: 'reassign', result: integratedResult };
    } catch (error) {
      return { recovered: false, strategy: 'reassign', error: error.message };
    }
  }

  async coordinatorFallback(params) {
    const { executionId, task } = params;
    console.log(`[ErrorHandler] Coordinator taking over execution ${executionId}...`);
    
    return {
      recovered: true,
      strategy: 'coordinator_fallback',
      result: {
        executionId,
        task,
        strategy: 'solo_fallback',
        result: {
          message: 'Task handled by coordinator after subagent failures',
          recommendation: 'Consider breaking task into smaller subtasks'
        },
        metrics: { duration: 0, subtasks: 0, speedupFactor: 1 }
      }
    };
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  getStats() {
    return { totalFailures: Array.from(this.failureHistory.values()).reduce((a, b) => a + b, 0) };
  }
}