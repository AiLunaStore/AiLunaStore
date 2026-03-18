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

  update(executionId, update) {
    const execution = this.executions.get(executionId);
    if (!execution) {
      this.log('warn', `Update for unknown execution: ${executionId}`);
      return;
    }
    
    execution.updates.push({ ...update, receivedAt: Date.now() });
    
    const assignment = execution.assignments.find(a => a.subtaskId === update.subtaskId);
    if (assignment) {
      assignment.status = update.status;
      if (update.status === 'started' && !assignment.startedAt) {
        assignment.startedAt = update.timestamp || Date.now();
      }
      if (['completed', 'failed'].includes(update.status)) {
        assignment.completedAt = update.timestamp || Date.now();
      }
    }
    
    const completed = execution.assignments.filter(
      a => ['completed', 'failed'].includes(a.status)
    ).length;
    execution.progress = Math.round((completed / execution.assignments.length) * 100);
    
    this.log('debug', `Execution ${executionId}: ${execution.progress}% complete`);
  }

  complete(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return;
    
    execution.status = 'completed';
    execution.completedAt = Date.now();
    execution.duration = execution.completedAt - execution.startedAt;
    execution.progress = 100;
    
    this.log('info', `Execution ${executionId} completed in ${execution.duration}ms`);
  }

  fail(executionId, error) {
    const execution = this.executions.get(executionId);
    if (!execution) return;
    
    execution.status = 'failed';
    execution.failedAt = Date.now();
    execution.error = error.message;
    
    this.log('error', `Execution ${executionId} failed: ${error.message}`);
  }

  getExecution(executionId) {
    const execution = this.executions.get(executionId);
    if (!execution) return null;
    return { ...execution, summary: this.getSummary(executionId) };
  }

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

  getActiveExecutions() {
    return Array.from(this.executions.values())
      .filter(e => e.status === 'running')
      .map(e => this.getExecution(e.id));
  }

  log(level, message) {
    const levels = { debug: 0, info: 1, warn: 2, error: 3 };
    if (levels[level] >= levels[this.options.logLevel]) {
      console.log(`[ProgressTracker] [${level.toUpperCase()}] ${message}`);
    }
  }

  getStats() {
    const executions = Array.from(this.executions.values());
    if (executions.length === 0) return { total: 0 };
    
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
      avgDuration: durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length : 0
    };
  }
}