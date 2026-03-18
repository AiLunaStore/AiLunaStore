import { CoordinationPattern } from './base-pattern.js';

/**
 * Parallel Independent Pattern
 * Execute subtasks with no dependencies simultaneously
 * 
 * Use case: Multiple independent analysis tasks that can run in parallel
 * Example: UI analysis, backend analysis, and database analysis for a bug
 */
export class ParallelIndependentPattern extends CoordinationPattern {
  constructor(options = {}) {
    super(options);
    this.options = {
      maxConcurrency: options.maxConcurrency || 10,
      timeoutMs: options.timeoutMs || 300000,
      ...options
    };
  }

  async execute(params) {
    this.validateParams(params, ['assignments', 'executionId']);
    
    const { executionId, assignments, onProgress, timeoutMs } = params;
    const startTime = Date.now();
    
    // Execute all subtasks in parallel with concurrency limit
    const results = await this.runWithConcurrencyLimit(
      assignments,
      async (assignment) => this.executeSubtask(assignment, executionId, onProgress, timeoutMs),
      this.options.maxConcurrency
    );
    
    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success);
    const failed = results.filter(r => !r.success);
    
    return {
      pattern: 'parallel-independent',
      subtaskResults: results,
      duration,
      completed: successful.length,
      failed: failed.length,
      successRate: results.length > 0 ? successful.length / results.length : 0
    };
  }

  async executeSubtask(assignment, executionId, onProgress, timeoutMs) {
    const { subtask, agent } = assignment;
    
    onProgress?.({
      executionId,
      subtaskId: subtask.id,
      status: 'started',
      agent: agent.id,
      timestamp: Date.now()
    });

    try {
      // In real implementation, this would spawn a subagent
      const result = await this.simulateSubtaskExecution(subtask, agent, timeoutMs);
      
      onProgress?.({
        executionId,
        subtaskId: subtask.id,
        status: 'completed',
        agent: agent.id,
        timestamp: Date.now()
      });

      return {
        subtask,
        agent: agent.id,
        result,
        success: true
      };
    } catch (error) {
      onProgress?.({
        executionId,
        subtaskId: subtask.id,
        status: 'failed',
        agent: agent.id,
        error: error.message,
        timestamp: Date.now()
      });

      return {
        subtask,
        agent: agent.id,
        error: error.message,
        success: false
      };
    }
  }

  async simulateSubtaskExecution(subtask, agent, timeoutMs) {
    // Simulate execution time based on estimated minutes
    const executionTime = (subtask.estimatedMinutes || 5) * 1000; // Convert to ms
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          subtaskId: subtask.id,
          agentId: agent.id,
          output: `Executed by ${agent.name}: ${subtask.description}`,
          findings: this.generateMockFindings(subtask, agent)
        });
      }, Math.min(executionTime, 100)); // Cap at 100ms for simulation
    });
  }

  generateMockFindings(subtask, agent) {
    // Generate mock findings based on subtask type
    const findings = [];
    
    if (subtask.type === 'diagnose') {
      findings.push({
        type: 'root_cause',
        description: `Potential root cause identified by ${agent.name}`,
        confidence: 'high',
        priority: 1
      });
    }
    
    if (subtask.type === 'analyze') {
      findings.push({
        type: 'finding',
        description: `Analysis complete for ${subtask.domain}`,
        priority: 2
      });
    }
    
    return findings;
  }

  async runWithConcurrencyLimit(items, fn, limit) {
    const results = [];
    const executing = [];
    
    for (let i = 0; i < items.length; i++) {
      const promise = fn(items[i]).then(result => ({ index: i, result }));
      results.push(promise);
      
      if (executing.length >= limit) {
        await Promise.race(executing);
      }
      
      executing.push(promise);
      promise.then(() => {
        const index = executing.indexOf(promise);
        if (index > -1) executing.splice(index, 1);
      });
    }
    
    const settled = await Promise.all(results);
    return settled.map(s => s.result);
  }
}
