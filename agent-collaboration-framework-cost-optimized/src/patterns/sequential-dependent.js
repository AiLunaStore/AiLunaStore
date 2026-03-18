/**
 * Sequential Dependent Pattern - Execute subtasks in dependency order
 */
export class SequentialDependentPattern {
  async execute(params) {
    const { executionId, analysis, assignments, onProgress, timeoutMs } = params;
    const { parallelizable } = analysis;
    const startTime = Date.now();
    const results = [];
    
    for (const level of parallelizable) {
      const levelAssignments = assignments.filter(a => level.includes(a.subtask.id));
      
      const levelPromises = levelAssignments.map(async (assignment) => {
        const { subtask, agent } = assignment;
        
        onProgress?.({
          executionId,
          subtaskId: subtask.id,
          status: 'started',
          agent: agent.id,
          timestamp: Date.now()
        });
        
        try {
          const result = await this.executeSubtask(subtask, agent, timeoutMs);
          
          onProgress?.({
            executionId,
            subtaskId: subtask.id,
            status: 'completed',
            agent: agent.id,
            timestamp: Date.now()
          });
          
          return { subtask, agent: agent.id, result, success: true };
        } catch (error) {
          onProgress?.({
            executionId,
            subtaskId: subtask.id,
            status: 'failed',
            agent: agent.id,
            error: error.message,
            timestamp: Date.now()
          });
          
          return { subtask, agent: agent.id, error: error.message, success: false };
        }
      });
      
      const levelResults = await Promise.all(levelPromises);
      results.push(...levelResults);
      
      const failed = levelResults.filter(r => !r.success);
      if (failed.length > 0) {
        const critical = failed.some(f => f.subtask.priority <= 2);
        if (critical) break;
      }
    }
    
    return {
      pattern: 'sequential-dependent',
      subtaskResults: results,
      duration: Date.now() - startTime,
      completed: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };
  }

  async executeSubtask(subtask, agent, timeoutMs) {
    return {
      subtaskId: subtask.id,
      agentId: agent.id,
      output: `Executed by ${agent.name}: ${subtask.description}`,
      findings: []
    };
  }
}