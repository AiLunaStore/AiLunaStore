import { CoordinationPattern } from './base-pattern.js';

/**
 * Pipeline Pattern
 * Output of one subtask feeds into the next
 * 
 * Use case: Data transformation or processing chains
 * Example: Parse logs → Analyze patterns → Generate report
 */
export class PipelinePattern extends CoordinationPattern {
  constructor(options = {}) {
    super(options);
    this.options = {
      stopOnFailure: options.stopOnFailure ?? true,
      passData: options.passData ?? true,
      timeoutMs: options.timeoutMs || 300000,
      ...options
    };
  }

  async execute(params) {
    this.validateParams(params, ['analysis', 'assignments', 'executionId']);
    
    const { executionId, analysis, assignments, onProgress, timeoutMs } = params;
    const startTime = Date.now();
    const results = [];
    let pipelineData = null;
    
    // Sort subtasks by dependency order
    const sortedSubtasks = this.topologicalSort(analysis);
    
    for (const subtask of sortedSubtasks) {
      const assignment = assignments.find(a => a.subtask.id === subtask.id);
      if (!assignment) continue;
      
      const result = await this.executeSubtask(
        assignment, 
        executionId, 
        onProgress, 
        timeoutMs, 
        pipelineData
      );
      
      results.push(result);
      
      if (result.success) {
        // Pass output to next stage
        pipelineData = result.result?.output || null;
      } else if (this.options.stopOnFailure) {
        // Pipeline breaks on failure
        break;
      }
    }
    
    const duration = Date.now() - startTime;
    const successful = results.filter(r => r.success);
    
    return {
      pattern: 'pipeline',
      subtaskResults: results,
      duration,
      completed: successful.length,
      failed: results.length - successful.length,
      successRate: results.length > 0 ? successful.length / results.length : 0,
      finalOutput: pipelineData
    };
  }

  async executeSubtask(assignment, executionId, onProgress, timeoutMs, inputData) {
    const { subtask, agent } = assignment;
    
    onProgress?.({
      executionId,
      subtaskId: subtask.id,
      status: 'started',
      agent: agent.id,
      timestamp: Date.now()
    });

    try {
      const result = await this.simulateSubtaskExecution(subtask, agent, timeoutMs, inputData);
      
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

  async simulateSubtaskExecution(subtask, agent, timeoutMs, inputData) {
    const executionTime = (subtask.estimatedMinutes || 5) * 1000;
    
    return new Promise((resolve) => {
      setTimeout(() => {
        const output = inputData 
          ? `Processed by ${agent.name}: ${subtask.description} (received: ${inputData.substring(0, 50)}...)`
          : `Processed by ${agent.name}: ${subtask.description}`;
        
        resolve({
          subtaskId: subtask.id,
          agentId: agent.id,
          input: inputData,
          output,
          findings: []
        });
      }, Math.min(executionTime, 100));
    });
  }

  topologicalSort(analysis) {
    const { subtasks, dependencies } = analysis;
    const visited = new Set();
    const result = [];
    
    const visit = (subtask) => {
      if (visited.has(subtask.id)) return;
      visited.add(subtask.id);
      
      const deps = dependencies[subtask.id]?.dependsOn || [];
      for (const depId of deps) {
        const dep = subtasks.find(s => s.id === depId);
        if (dep) visit(dep);
      }
      
      result.push(subtask);
    };
    
    for (const subtask of subtasks) {
      visit(subtask);
    }
    
    return result;
  }
}
