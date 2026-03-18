import { TaskAnalyzer } from './core/task-analyzer.js';
import { AgentRegistry } from './core/agent-registry.js';
import { Coordinator } from './core/coordinator.js';
import { ProgressTracker } from './core/progress-tracker.js';
import { ResultIntegrator } from './core/result-integrator.js';
import { ErrorHandler } from './core/error-handler.js';
import { PerformanceTracker } from './core/performance-tracker.js';

/**
 * Main entry point for the Agent Collaboration Framework.
 * Orchestrates task decomposition, delegation, and result integration.
 */
export class CollaborationFramework {
  constructor(options = {}) {
    this.taskAnalyzer = new TaskAnalyzer(options.analyzer);
    this.agentRegistry = new AgentRegistry(options.registry);
    this.coordinator = new Coordinator(options.coordinator);
    this.progressTracker = new ProgressTracker(options.progress);
    this.resultIntegrator = new ResultIntegrator(options.integrator);
    this.errorHandler = new ErrorHandler(options.errorHandler);
    this.performanceTracker = new PerformanceTracker(options.performance);
    
    // Delegation thresholds
    this.thresholds = {
      complexity: options.thresholds?.complexity ?? 5,
      estimatedTimeMinutes: options.thresholds?.estimatedTimeMinutes ?? 3,
      subtaskCount: options.thresholds?.subtaskCount ?? 3
    };
  }

  /**
   * Execute a task, automatically deciding whether to delegate or handle solo
   * @param {Object} task - The task to execute
   * @param {string} task.id - Unique task identifier
   * @param {string} task.description - Task description
   * @param {Object} task.context - Additional context
   * @returns {Promise<Object>} Execution result with metrics
   */
  async execute(task) {
    const startTime = Date.now();
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    try {
      // Step 1: Analyze the task
      const analysis = await this.taskAnalyzer.analyze(task);
      
      // Step 2: Decide whether to delegate or work solo
      const shouldDelegate = this.shouldDelegate(analysis);
      
      if (!shouldDelegate) {
        // Work solo - return simple execution result
        return {
          executionId,
          task,
          strategy: 'solo',
          result: { message: 'Task executed solo (below delegation threshold)' },
          metrics: {
            duration: Date.now() - startTime,
            subtasks: 0,
            speedupFactor: 1
          }
        };
      }

      // Step 3: Match subtasks to agents
      const assignments = this.agentRegistry.matchAgents(analysis.subtasks);
      
      // Step 4: Track progress
      this.progressTracker.start(executionId, assignments);
      
      // Step 5: Execute using appropriate coordination pattern
      const coordinationResult = await this.coordinator.execute({
        executionId,
        task,
        analysis,
        assignments,
        onProgress: (update) => this.progressTracker.update(executionId, update)
      });
      
      // Step 6: Integrate results
      const integratedResult = this.resultIntegrator.integrate({
        task,
        subtaskResults: coordinationResult.subtaskResults,
        analysis
      });
      
      // Step 7: Track performance
      const duration = Date.now() - startTime;
      const metrics = this.performanceTracker.record({
        executionId,
        task,
        analysis,
        duration,
        coordinationResult,
        integratedResult
      });
      
      // Step 8: Mark completion
      this.progressTracker.complete(executionId);
      
      return {
        executionId,
        task,
        strategy: 'collaborative',
        result: integratedResult,
        subtaskResults: coordinationResult.subtaskResults,
        metrics: {
          duration,
          subtasks: analysis.subtasks.length,
          speedupFactor: metrics.speedupFactor,
          estimatedSoloTime: metrics.estimatedSoloTime,
          quality: metrics.quality,
          success: metrics.success
        }
      };
      
    } catch (error) {
      // Handle errors with fallback strategies
      const handled = await this.errorHandler.handle({
        executionId,
        error,
        task,
        framework: this
      });
      
      if (handled.recovered) {
        return handled.result;
      }
      
      throw error;
    }
  }

  /**
   * Determine if a task should be delegated based on thresholds
   * @param {Object} analysis - Task analysis result
   * @returns {boolean} Whether to delegate
   */
  shouldDelegate(analysis) {
    // Check complexity threshold
    if (analysis.complexity > this.thresholds.complexity) {
      return true;
    }
    
    // Check estimated time threshold
    if (analysis.estimatedTimeMinutes > this.thresholds.estimatedTimeMinutes) {
      return true;
    }
    
    // Check subtask count threshold
    if (analysis.subtasks.length > this.thresholds.subtaskCount) {
      return true;
    }
    
    // Check if multiple expertise domains are required
    const uniqueDomains = new Set(analysis.subtasks.map(s => s.domain));
    if (uniqueDomains.size > 1) {
      return true;
    }
    
    return false;
  }

  /**
   * Get current framework statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    return {
      thresholds: this.thresholds,
      performance: this.performanceTracker.getStats(),
      agents: this.agentRegistry.getAllAgents().map(a => ({
        id: a.id,
        name: a.name,
        assignments: a.assignmentCount || 0
      }))
    };
  }

  /**
   * Register a new specialized agent
   * @param {Object} agent - Agent definition
   */
  registerAgent(agent) {
    this.agentRegistry.register(agent);
  }

  /**
   * Update delegation thresholds
   * @param {Object} thresholds - New threshold values
   */
  updateThresholds(thresholds) {
    this.thresholds = { ...this.thresholds, ...thresholds };
  }
}

export { TaskAnalyzer, AgentRegistry, Coordinator, ProgressTracker, ResultIntegrator, ErrorHandler, PerformanceTracker };
export * from './patterns/index.js';
export * from './agents/index.js';
