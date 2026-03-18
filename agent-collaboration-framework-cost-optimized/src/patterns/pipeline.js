/**
 * Pipeline Pattern - Output of one subtask feeds into the next
 */
export class PipelinePattern {
  async execute(params) {
    const { executionId, analysis, assignments, onProgress, timeoutMs } = params;
    const startTime = Date.now();
    const results = [];
    let pipelineData = null;
    
    const sortedSubtasks = this.topologicalSort(analysis);
    
    for (const subtask of sortedSubtasks) {
      const assignment = assignments.find(a => a.subtask.id === subtask.id);
      if (!assignment) continue;
      
      const { agent } = assignment;
      
      onProgress?.({
        executionId,
        subtaskId: subtask.id,
        status: 'started',
        agent: agent.id,
        timestamp: Date.now()
      });
      
      try {
        const result = await this.executeSubtask(subtask, agent, timeoutMs, pipelineData);
        pipelineData = result.output;
        
        onProgress?.({
          executionId,
          subtaskId: subtask.id,
          status: 'completed',
          agent: agent.id,
          timestamp: Date.now()
        });
        
        results.push({ subtask, agent: agent.id, result, success: true });
      } catch (error) {
        onProgress?.({
          executionId,
          subtaskId: subtask.id,
          status: 'failed',
          agent: agent.id,
          error: error.message,
          timestamp: Date.now()
        });
        
        results.push({ subtask, agent: agent.id, error: error.message, success: false });
        break;
      }
    }
    
    return {
      pattern: 'pipeline',
      subtaskResults: results,
      duration: Date.now() - startTime,
      completed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length,
      finalOutput: pipelineData
    };
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

  async executeSubtask(subtask, agent, timeoutMs, inputData) {
    return {
      subtaskId: subtask.id,
      agentId: agent.id,
      input: inputData,
      output: `Processed by ${agent.name}: ${subtask.description}`,
      findings: []
    };
  }
}