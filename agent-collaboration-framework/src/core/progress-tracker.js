/**
 * Progress Tracker - Monitors subagent completion and reports progress
 */
export class ProgressTracker {
  constructor(options = {}) {
    this.executions = new Map();
    this.options = {
      emitEvents: options.emitEvents ?? true,
      logLevel: options.logLevel || 'info',
      ...options
    };
  }

  /**
   * Start tracking a new execution
   * @param {string} executionId - Unique execution identifier
   * @param {Object[]} assignments - Subtask assignments
   */
  start(executionId, assignments) {
    const execution = {
      id: executionId,
      startedAt: Date.now(),
      assignments: assignments.map(a => ({
        subtaskId: a.subtask.id,
        agentId: a.agent.id,
        status: 'pending',
        startedAt: null,
        completedAt: null
      })),
      status: 'running',
      progress: 0,
      updates: []
    };
    
    this.executions.set(executionId, execution);
    
    this.log('info', `Execution ${executionId} started with ${assignments.length} subtasks`);
    
    return execution;
  }

  /**
   * Update progress for a subtask
   * @param {string} executionId - Execution identifier
   * @param {Object} update - Progress update
   */
  update(executionId, update) {
    const execution = this.executions.get(executionId);
    if (!execution) {
      this.log('warn', `Update for unknown execution: ${executionId}`);
      return;
    }
    
    // Store the update
    execution.updates.push({
      ...update,
      receivedAt: Date.now()
    });
    
    // Update assignment status
    const assignment = execution.assignments.find(
      a => a.subtaskId === update.subtaskId
    );
    
    if (assignment) {
      assignment.status = update.status;
      
      if (update.status === 'started' && !assignment.startedAt) {
        assignment.startedAt = update.timestamp || Date.now();
      }
      
      if (['completed', 'failed'].includes(update.status)) {
        assignment.completedAt = update.timestamp || Date.now();
      }
    }
    
    // Recalculate progress
    const completed = execution.assignments.filter(
      a => ['completed', 'failed'].includes(a.status)
    ).length;
    execution.progress = Math.round((completed / execution.assignments.length) * 100);
    
    this.log('debug', `Execution ${executionId}: ${execution.progress}% complete`);
    
    // Emit event if enabled
    if (this.options.emitEvents) {
      this.emit('progress', {
        executionId,
        progress: execution.progress,
        update
      });
    }
  }

  /**
   * Mark execution as complete
   * @param {string} executionId - Execution identifier
   */
  complete(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return;
    
    execution.status = 'completed';
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    execution.progress = 100;
    
    this.log('info', `Execution ${executionId} completed in ${execution.duration}ms`);
    
    if (this.options.emitEvents) {
      this.emit('complete', {
        executionId,
        execution: this.getExecution(executionId)
      });
    }
  }

  /**
   * Mark execution as failed
   * @param {string} executionId - Execution identifier
   * @param {Error} error - Error that caused failure
   */
  fail(executionId, error) {
    const execution = this.executions.get(executionId);
    if (!execution) return;
    
    execution.status = 'failed';
    execution.failedAt = Date.now();
    execution.error = error.message;
    
    this.log('error', `Execution ${executionId} failed: ${error.message}`);
    
    if (this.options.emitEvents) {
      this.emit('fail', {
        executionId,
        error: error.message,
        execution: this.getExecution(executionId)
      });
    }
  }

  /**
   * Get execution status
   * @param {string} executionId - Execution identifier
   * @returns {Object|null} Execution status
   */
  getExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return null;
    
    return {
      ...execution,
      summary: this.getSummary(executionId)
    };
  }

  /**
   * Get execution summary
   * @param {string} executionId - Execution identifier
   * @returns {Object} Summary statistics
   */
  getSummary(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return null;
    
    const assignments = execution.assignments;
    
    return {
      total: assignments.length,
      pending: assignments.filter(a => a.status === 'pending').length,
      running: assignments.filter(a => a.status === 'started').length,
      completed: assignments.filter(a => a.status === 'completed').length,
      failed: assignments.filter(a => a.status === 'failed').length,
      progress: execution.progress,
      duration: execution.duration || (Date.now() - execution.startedAt)
    };
  }

  /**
   * Get all active executions
   * @returns {Object[]} Active executions
   */
  getActiveExecutions() {
    return Array.from(this.executions.values())
      .filter(e => e.status === 'running')
      .map(e => this.getExecution(e.id));
  }

  /**
   * Get all executions
   * @returns {Object[]} All executions
   */
  getAllExecutions() {
    return Array.from(this.executions.keys()).map(id => this.getExecution(id));
  }

  /**
   * Clean up old executions
   * @param {number} maxAgeMs - Maximum age in milliseconds
   */
  cleanup(maxAgeMs = 24 * 60 * 60 * 1000) { // 24 hours default
    const cutoff = Date.now() - maxAgeMs;
    
    for (const [id, execution] of this.executions) {
      if (execution.startedAt < cutoff && execution.status !== 'running') {
        this.executions.delete(id);
        this.log('debug', `Cleaned up execution ${id}`);
      }
    }
  }

  /**
   * Log a message
   * @param {string} level - Log level
   * @param {string} message - Message to log
   */
  log(level, message) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[this.options.logLevel]) {
      console.log(`[ProgressTracker] [${level.toUpperCase()}] ${message}`);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  emit(event, data) {
    // In real implementation, this would use EventEmitter
    // For now, just log
    this.log('debug', `Event: ${event}`, data);
  }

  /**
   * Get statistics across all executions
   * @returns {Object} Statistics
   */
  getStats() {
    const executions = Array.from(this.executions.values());
    
    if (executions.length === 0) {
      return { total: 0 };
    }
    
    const completed = executions.filter(e => e.status === 'completed');
    const failed = executions.filter(e => e.status === 'failed');
    const running = executions.filter(e => e.status === 'running');
    
    const durations = completed.map(e => e.duration).filter(Boolean);
    
    return {
      total: executions.length,
      completed: completed.length,
      failed: failed.length,
      running: running.length,
      successRate: completed.length / executions.length,
      avgDuration: durations.length > 0 
        ? durations.reduce((a, b) => a + b, 0) / durations.length 
        : 0,
      maxDuration: durations.length > 0 ? Math.max(...durations) : 0,
      minDuration: durations.length > 0 ? Math.min(...durations) : 0
    };
  }
}
