/**
 * Coordinator - Orchestrates subtask execution using coordination patterns
 */
export class Coordinator {
  constructor(options = {}) {
    this.options = {
      defaultPattern: options.defaultPattern || 'fan-out-fan-in',
      timeoutMs: options.timeoutMs || 300000, // 5 minutes default
      retryAttempts: options.retryAttempts || 2,
      ...options
    };
    
    this.patterns = new Map();
    this.registerDefaultPatterns();
  }

  /**
   * Register default coordination patterns
   */
  registerDefaultPatterns() {
    this.registerPattern('parallel-independent', new ParallelIndependentPattern());
    this.registerPattern('sequential-dependent', new SequentialDependentPattern());
    this.registerPattern('fan-out-fan-in', new FanOutFanInPattern());
    this.registerPattern('pipeline', new PipelinePattern());
  }

  /**
   * Register a coordination pattern
   * @param {string} name - Pattern name
   * @param {Object} pattern - Pattern implementation
   */
  registerPattern(name, pattern) {
    this.patterns.set(name, pattern);
  }

  /**
   * Execute subtasks using the appropriate coordination pattern
   * @param {Object} params - Execution parameters
   * @returns {Promise<Object>} Execution results
   */
  async execute(params) {
    const { executionId, task, analysis, assignments, onProgress } = params;
    
    // Determine best pattern based on dependencies
    const pattern = this.selectPattern(analysis);
    
    // Execute with selected pattern
    const patternImpl = this.patterns.get(pattern);
    if (!patternImpl) {
      throw new Error(`Unknown coordination pattern: ${pattern}`);
    }
    
    return await patternImpl.execute({
      executionId,
      task,
      analysis,
      assignments,
      onProgress,
      timeoutMs: this.options.timeoutMs,
      retryAttempts: this.options.retryAttempts
    });
  }

  /**
   * Select the best coordination pattern based on task analysis
   * @param {Object} analysis - Task analysis result
   * @returns {string} Pattern name
   */
  selectPattern(analysis) {
    const { dependencies, subtasks, parallelizable } = analysis;
    
    // Check for pipeline pattern (sequential with data flow)
    const hasDataFlow = subtasks.some(st => 
      st.type === 'transform' || st.type === 'process'
    );
    if (hasDataFlow && subtasks.length > 1) {
      return 'pipeline';
    }
    
    // Check for sequential dependencies
    const hasDependencies = Object.values(dependencies).some(
      dep => dep.dependsOn.length > 0
    );
    if (hasDependencies && parallelizable.length > 1) {
      return 'sequential-dependent';
    }
    
    // Check for pure parallel (no dependencies)
    if (!hasDependencies && subtasks.length > 1) {
      return 'parallel-independent';
    }
    
    // Default to fan-out-fan-in for mixed scenarios
    return 'fan-out-fan-in';
  }
}

/**
 * Parallel Independent Pattern - Execute subtasks with no dependencies simultaneously
 */
class ParallelIndependentPattern {
  async execute(params) {
    const { executionId, assignments, onProgress, timeoutMs } = params;
    
    const startTime = Date.now();
    const results = [];
    
    // Execute all subtasks in parallel
    const promises = assignments.map(async (assignment) => {
      const { subtask, agent } = assignment;
      
      try {
        onProgress?.({
          executionId,
          subtaskId: subtask.id,
          status: 'started',
          agent: agent.id,
          timestamp: Date.now()
        });
        
        // Simulate subtask execution (in real implementation, this would delegate to agent)
        const result = await this.executeSubtask(subtask, agent, timeoutMs);
        
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
          success: true,
          duration: Date.now() - startTime
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
          success: false,
          duration: Date.now() - startTime
        };
      }
    });
    
    const subtaskResults = await Promise.all(promises);
    
    return {
      pattern: 'parallel-independent',
      subtaskResults,
      duration: Date.now() - startTime,
      completed: subtaskResults.filter(r => r.success).length,
      failed: subtaskResults.filter(r => !r.success).length
    };
  }

  async executeSubtask(subtask, agent, timeoutMs) {
    // In real implementation, this would spawn a subagent
    // For now, return a simulated result
    return {
      subtaskId: subtask.id,
      agentId: agent.id,
      output: `Executed by ${agent.name}: ${subtask.description}`,
      findings: []
    };
  }
}

/**
 * Sequential Dependent Pattern - Execute subtasks in dependency order
 */
class SequentialDependentPattern {
  async execute(params) {
    const { executionId, analysis, assignments, onProgress, timeoutMs } = params;
    const { parallelizable } = analysis;
    
    const startTime = Date.now();
    const results = [];
    
    // Execute each level in sequence
    for (const level of parallelizable) {
      const levelAssignments = assignments.filter(a => level.includes(a.subtask.id));
      
      // Execute this level in parallel
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
      });
      
      const levelResults = await Promise.all(levelPromises);
      results.push(...levelResults);
      
      // Check if any required task failed
      const failed = levelResults.filter(r => !r.success);
      if (failed.length > 0) {
        // Decide whether to continue or abort
        const critical = failed.some(f => f.subtask.priority <= 2);
        if (critical) {
          break;
        }
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

/**
 * Fan-Out/Fan-In Pattern - Coordinator delegates, then integrates results
 */
class FanOutFanInPattern {
  async execute(params) {
    const { executionId, task, analysis, assignments, onProgress, timeoutMs } = params;
    
    const startTime = Date.now();
    
    // Fan out: Execute all subtasks
    const parallelPattern = new ParallelIndependentPattern();
    const parallelResult = await parallelPattern.execute({
      executionId,
      assignments,
      onProgress,
      timeoutMs
    });
    
    // Fan in: Integration happens in ResultIntegrator
    return {
      pattern: 'fan-out-fan-in',
      subtaskResults: parallelResult.subtaskResults,
      duration: Date.now() - startTime,
      completed: parallelResult.completed,
      failed: parallelResult.failed
    };
  }
}

/**
 * Pipeline Pattern - Output of one subtask feeds into the next
 */
class PipelinePattern {
  async execute(params) {
    const { executionId, analysis, assignments, onProgress, timeoutMs } = params;
    
    const startTime = Date.now();
    const results = [];
    let pipelineData = null;
    
    // Sort subtasks by dependency order
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
        pipelineData = result.output; // Pass output to next stage
        
        onProgress?.({
          executionId,
          subtaskId: subtask.id,
          status: 'completed',
          agent: agent.id,
          timestamp: Date.now()
        });
        
        results.push({
          subtask,
          agent: agent.id,
          result,
          success: true
        });
      } catch (error) {
        onProgress?.({
          executionId,
          subtaskId: subtask.id,
          status: 'failed',
          agent: agent.id,
          error: error.message,
          timestamp: Date.now()
        });
        
        results.push({
          subtask,
          agent: agent.id,
          error: error.message,
          success: false
        });
        
        // Pipeline breaks on failure
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
