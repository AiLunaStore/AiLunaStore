import { CoordinationPattern } from './base-pattern.js';

/**
 * Sequential Dependent Pattern
 * Execute subtasks in order where each depends on the previous
 * 
 * Use case: Tasks that must be completed in sequence
 * Example: Diagnose → Fix → Test workflow
 */
export class SequentialDependentPattern extends CoordinationPattern {
  constructor(options = {}) {
    super(options);
    this.options = {
      stopOnFailure: options.stopOnFailure ?? true,
      timeoutMs: options.timeoutMs || 300000,
      ...options
    };
  }

  async execute(params) {
    this.validateParams(params, ['analysis', 'assignments', 'executionId']);
    
    const { executionId, analysis, assignments, onProgress, timeoutMs } = params;
    const { parallelizable } = analysis;
    
    const startTime = Date.now();
    const results = [];
    
    // Execute each level in sequence
    for (const level of parallelizable) {
      const levelAssignments = assignments.filter(a => level.includes(a.subtask.id));
      
      // Execute this level in parallel
      const levelPromises = levelAssignments.map(async (assignment) => {
        return this.executeSubtask(assignment, executionId, onProgress, timeoutMs);
      });
      
      const levelResults = await Promise.all(levelPromises);
      results.push(...levelResults);
      
      // Check if any required task failed
      const failed = levelResults.filter(r => !r.success);
      if (failed.length > 0 && this.options.stopOnFailure) {
        const critical = failed.some(f => f.subtask.priority <= 2);
        if (critical) {
          break;
        }
      }
    }
    
    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success);
    
    return {
      pattern: 'sequential-dependent',
      subtaskResults: results,
      duration,
      completed: successful.length,
      failed: results.length - successful.length,
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
    const executionTime = (subtask.estimatedMinutes || 5) * 1000;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          subtaskId: subtask.id,
          agentId: agent.id,
          output: `Executed by ${agent.name}: ${subtask.description}`,
          findings: []
        });
      }, Math.min(executionTime, 100));
    });
  }
}
