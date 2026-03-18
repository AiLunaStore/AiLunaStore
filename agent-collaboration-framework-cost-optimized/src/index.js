import { TaskAnalyzer } from './core/task-analyzer.js';
import { AgentRegistry } from './core/agent-registry.js';
import { Coordinator } from './core/coordinator.js';
import { ProgressTracker } from './core/progress-tracker.js';
import { ResultIntegrator } from './core/result-integrator.js';
import { ErrorHandler } from './core/error-handler.js';
import { PerformanceTracker } from './core/performance-tracker.js';
import { CostCalculator } from './cost/cost-calculator.js';
import { OptimizationEngine } from './cost/optimization-engine.js';
import { BudgetManager } from './cost/budget-manager.js';

/**
 * Cost-Optimized Collaboration Framework
 * Main entry point with integrated cost optimization, budget management, and efficiency tracking.
 */
export class CostOptimizedFramework {
  constructor(options = {}) {
    // Core components
    this.taskAnalyzer = new TaskAnalyzer(options.analyzer);
    this.agentRegistry = new AgentRegistry(options.registry);
    this.coordinator = new Coordinator(options.coordinator);
    this.progressTracker = new ProgressTracker(options.progress);
    this.resultIntegrator = new ResultIntegrator(options.integrator);
    this.errorHandler = new ErrorHandler(options.errorHandler);
    this.performanceTracker = new PerformanceTracker(options.performance);
    
    // Cost optimization components
    this.costCalculator = new CostCalculator(options.costCalculator);
    this.optimizationEngine = new OptimizationEngine(options.optimizationEngine);
    this.budgetManager = new BudgetManager(options.budget);
    
    // Delegation thresholds
    this.thresholds = {
      complexity: options.thresholds?.complexity ?? 5,
      estimatedTimeMinutes: options.thresholds?.estimatedTimeMinutes ?? 3,
      subtaskCount: options.thresholds?.subtaskCount ?? 3
    };
    
    // Cost tracking
    this.executionCosts = new Map();
    
    // Set up budget alerts
    this.budgetManager.onAlert((alert) => {
      console.warn(`[BUDGET ALERT] ${alert.message}`);
    });
  }

  /**
   * Execute a task with cost optimization
   * @param {Object} task - The task to execute
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Execution result with cost metrics
   */
  async execute(task, options = {}) {
    const startTime = Date.now();
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Initialize budget for this execution
    const budgetId = options.budgetId || task.id || executionId;
    const budgetLimit = options.budget || task.budget || this.budgetManager.options.defaultLimit;
    
    if (!this.budgetManager.getBudget(budgetId)) {
      this.budgetManager.initBudget(budgetId, { limit: budgetLimit });
    }
    
    try {
      // Step 1: Analyze the task
      const analysis = await this.taskAnalyzer.analyze(task);
      
      // Step 2: Predict costs before execution
      const costPrediction = this.predictExecutionCost(analysis);
      
      // Step 3: Check if we can afford this execution
      const affordability = this.budgetManager.canAfford(budgetId, costPrediction.expected);
      if (!affordability.affordable) {
        return {
          executionId,
          task,
          strategy: 'rejected',
          reason: 'Insufficient budget',
          costPrediction,
          budgetStatus: this.budgetManager.getBudgetStatus(budgetId),
          metrics: {
            duration: Date.now() - startTime,
            cost: { predicted: costPrediction, actual: 0 }
          }
        };
      }
      
      // Step 4: Decide whether to delegate or work solo
      const shouldDelegate = this.shouldDelegate(analysis);
      
      if (!shouldDelegate) {
        // Work solo - minimal cost
        const soloCost = this.estimateSoloCost(task);
        this.budgetManager.recordCost(budgetId, {
          amount: soloCost,
          taskId: task.id,
          description: 'Solo execution (below delegation threshold)'
        });
        
        return {
          executionId,
          task,
          strategy: 'solo',
          result: { message: 'Task executed solo (below delegation threshold)' },
          costPrediction,
          budgetStatus: this.budgetManager.getBudgetStatus(budgetId),
          metrics: {
            duration: Date.now() - startTime,
            subtasks: 0,
            speedupFactor: 1,
            cost: {
              predicted: costPrediction,
              actual: soloCost,
              total: soloCost
            }
          }
        };
      }

      // Step 5: Optimize agent selection with budget constraints
      const optimizationResult = this.optimizationEngine.optimizeAssignments({
        subtasks: analysis.subtasks,
        budget: affordability.available,
        minQuality: options.minQuality || 0,
        agentRegistry: this.agentRegistry,
        strategy: options.strategy || 'balanced'
      });
      
      // Step 6: Reserve budget for execution
      const reserved = this.budgetManager.reserveBudget(budgetId, task.id, optimizationResult.totalCost);
      if (!reserved) {
        return {
          executionId,
          task,
          strategy: 'rejected',
          reason: 'Could not reserve sufficient budget',
          optimizationResult,
          budgetStatus: this.budgetManager.getBudgetStatus(budgetId),
          metrics: {
            duration: Date.now() - startTime,
            cost: { predicted: costPrediction, actual: 0 }
          }
        };
      }
      
      // Step 7: Track progress
      this.progressTracker.start(executionId, optimizationResult.assignments);
      
      // Step 8: Execute using appropriate coordination pattern
      const coordinationResult = await this.coordinator.execute({
        executionId,
        task,
        analysis,
        assignments: optimizationResult.assignments,
        onProgress: (update) => this.progressTracker.update(executionId, update)
      });
      
      // Step 9: Calculate actual costs
      const actualCosts = this.calculateActualCosts(coordinationResult, optimizationResult.assignments);
      
      // Step 10: Record costs against budget
      for (const cost of actualCosts.breakdown) {
        this.budgetManager.recordCost(budgetId, {
          amount: cost.amount,
          taskId: task.id,
          agentId: cost.agentId,
          description: cost.description
        });
        
        // Update agent cost stats
        this.agentRegistry.recordCost(cost.agentId, cost.amount);
      }
      
      // Release any unused reservation
      const totalActual = actualCosts.total;
      if (optimizationResult.totalCost > totalActual) {
        this.budgetManager.releaseReservation(budgetId, task.id, optimizationResult.totalCost - totalActual);
      }
      
      // Step 11: Integrate results
      const integratedResult = this.resultIntegrator.integrate({
        task,
        subtaskResults: coordinationResult.subtaskResults,
        analysis
      });
      
      // Step 12: Track performance
      const duration = Date.now() - startTime;
      const metrics = this.performanceTracker.record({
        executionId,
        task,
        analysis,
        duration,
        coordinationResult,
        integratedResult
      });
      
      // Step 13: Mark completion
      this.progressTracker.complete(executionId);
      
      // Calculate cost efficiency
      const qualityPerDollar = integratedResult.success ? 
        (metrics.quality.score / (totalActual || 0.001)) : 0;
      
      // Calculate savings vs naive approach (always using most expensive agent)
      const naiveCost = this.calculateNaiveCost(analysis);
      const savings = this.costCalculator.calculateSavings(totalActual, naiveCost);
      
      return {
        executionId,
        task,
        strategy: 'collaborative',
        result: integratedResult,
        subtaskResults: coordinationResult.subtaskResults,
        costPrediction,
        actualCosts,
        budgetStatus: this.budgetManager.getBudgetStatus(budgetId),
        optimization: {
          assignments: optimizationResult.assignments.map(a => ({
            subtaskId: a.subtask.id,
            agentId: a.agent.id,
            agentName: a.agent.name,
            estimatedCost: a.selection?.estimatedCost || a.costEstimate?.total
          })),
          totalEstimatedCost: optimizationResult.totalCost,
          withinBudget: optimizationResult.withinBudget
        },
        metrics: {
          duration,
          subtasks: analysis.subtasks.length,
          speedupFactor: metrics.speedupFactor,
          estimatedSoloTime: metrics.estimatedSoloTime,
          quality: metrics.quality,
          success: metrics.success,
          cost: {
            predicted: costPrediction.expected,
            actual: totalActual,
            total: totalActual,
            qualityPerDollar,
            savings
          }
        }
      };
      
    } catch (error) {
      // Release reservation on error
      this.budgetManager.releaseReservation(budgetId, task.id);
      
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
   * Predict execution cost before running
   * @param {Object} analysis - Task analysis
   * @returns {Object} Cost prediction
   */
  predictExecutionCost(analysis) {
    const predictions = [];
    
    for (const subtask of analysis.subtasks) {
      const tokenEstimate = this.costCalculator.estimateTokens({
        taskType: subtask.type,
        complexity: analysis.complexity,
        contextSize: 'medium'
      });
      
      predictions.push({
        subtaskId: subtask.id,
        domain: subtask.domain,
        tokens: tokenEstimate
      });
    }
    
    const totalTokens = predictions.reduce((sum, p) => sum + p.tokens.total, 0);
    
    // Estimate based on average agent costs
    const avgInputCost = 1.0; // Average per 1M tokens
    const avgOutputCost = 5.0; // Average per 1M tokens
    const avgInputRatio = 0.6; // 60% input tokens
    
    const estimatedInput = totalTokens * avgInputRatio;
    const estimatedOutput = totalTokens * (1 - avgInputRatio);
    
    const inputCost = (estimatedInput / 1000000) * avgInputCost;
    const outputCost = (estimatedOutput / 1000000) * avgOutputCost;
    const total = inputCost + outputCost;
    
    return {
      min: total * 0.7,
      expected: total,
      max: total * 1.3,
      range: `$${(total * 0.7).toFixed(4)} - $${(total * 1.3).toFixed(4)}`,
      subtaskPredictions: predictions,
      confidence: 0.75
    };
  }

  /**
   * Estimate cost for solo execution
   * @param {Object} task - Task
   * @returns {number} Estimated cost
   */
  estimateSoloCost(task) {
    // Solo execution uses a mid-tier agent
    const tokenEstimate = this.costCalculator.estimateTokens({
      taskType: this.costCalculator.inferTaskType(task),
      complexity: 5,
      contextSize: this.costCalculator.estimateContextSize(task)
    });
    
    // Assume Kimi K2.5 pricing for solo
    const inputCost = (tokenEstimate.input / 1000000) * 0.60;
    const outputCost = (tokenEstimate.output / 1000000) * 3.00;
    
    return inputCost + outputCost;
  }

  /**
   * Calculate actual costs from execution
   * @param {Object} coordinationResult - Execution result
   * @param {Object[]} assignments - Agent assignments
   * @returns {Object} Actual costs
   */
  calculateActualCosts(coordinationResult, assignments) {
    const breakdown = [];
    let total = 0;
    
    for (const result of coordinationResult.subtaskResults) {
      const assignment = assignments.find(a => a.subtask.id === result.subtask.id);
      if (!assignment) continue;
      
      // Use estimated cost as proxy for actual (in real implementation, would use actual token counts)
      const cost = assignment.costEstimate?.total || 0.01;
      
      breakdown.push({
        subtaskId: result.subtask.id,
        agentId: result.agent,
        agentName: assignment.agent.name,
        amount: cost,
        description: result.subtask.description,
        success: result.success
      });
      
      total += cost;
    }
    
    return {
      total,
      breakdown,
      byAgent: this.aggregateByAgent(breakdown)
    };
  }

  /**
   * Aggregate costs by agent
   * @param {Object[]} breakdown - Cost breakdown
   * @returns {Object} Aggregated costs
   */
  aggregateByAgent(breakdown) {
    const byAgent = {};
    
    for (const cost of breakdown) {
      if (!byAgent[cost.agentId]) {
        byAgent[cost.agentId] = {
          agentName: cost.agentName,
          total: 0,
          taskCount: 0
        };
      }
      byAgent[cost.agentId].total += cost.amount;
      byAgent[cost.agentId].taskCount++;
    }
    
    return byAgent;
  }

  /**
   * Calculate naive cost (always using most expensive agent)
   * @param {Object} analysis - Task analysis
   * @returns {number} Naive cost estimate
   */
  calculateNaiveCost(analysis) {
    // Most expensive agent is Claude 3.5 Sonnet at ~$0.057 per task
    const expensiveAgentCost = 0.057;
    return analysis.subtasks.length * expensiveAgentCost;
  }

  /**
   * Determine if a task should be delegated
   * @param {Object} analysis - Task analysis result
   * @returns {boolean} Whether to delegate
   */
  shouldDelegate(analysis) {
    if (analysis.complexity > this.thresholds.complexity) return true;
    if (analysis.estimatedTimeMinutes > this.thresholds.estimatedTimeMinutes) return true;
    if (analysis.subtasks.length > this.thresholds.subtaskCount) return true;
    
    const uniqueDomains = new Set(analysis.subtasks.map(s => s.domain));
    if (uniqueDomains.size > 1) return true;
    
    return false;
  }

  /**
   * Get current framework statistics including cost data
   * @returns {Object} Performance and cost statistics
   */
  getStats() {
    const performanceStats = this.performanceTracker.getStats();
    const budgetSummary = this.budgetManager.getGlobalSummary();
    const agentCostSummary = this.agentRegistry.getCostSummary();
    
    return {
      thresholds: this.thresholds,
      performance: performanceStats,
      budget: budgetSummary,
      agents: agentCostSummary,
      costEfficiency: {
        averageCostPerTask: budgetSummary.totalSpent / (performanceStats.executions?.total || 1),
        globalUtilization: budgetSummary.globalUtilization,
        bestValueAgent: agentCostSummary.bestValueAgent,
        cheapestAgent: agentCostSummary.cheapestAgent
      }
    };
  }

  /**
   * Get cost report for analysis
   * @returns {Object} Detailed cost report
   */
  getCostReport() {
    return {
      budgets: this.budgetManager.getAllBudgets(),
      efficiency: this.budgetManager.getEfficiencyReport(),
      agentStats: this.agentRegistry.getStats(),
      history: this.budgetManager.getHistory({ limit: 100 })
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

  /**
   * Get optimization recommendations for a task
   * @param {Object} task - Task to analyze
   * @returns {Object} Recommendations
   */
  getRecommendations(task) {
    const analysis = this.taskAnalyzer.analyze(task);
    const costPrediction = this.predictExecutionCost(analysis);
    
    return this.optimizationEngine.getRecommendations({
      task,
      budget: task.budget,
      agentRegistry: this.agentRegistry,
      currentSpend: 0
    });
  }
}

// Export all components
export { TaskAnalyzer, AgentRegistry, Coordinator, ProgressTracker, ResultIntegrator, ErrorHandler, PerformanceTracker };
export { CostCalculator, OptimizationEngine, BudgetManager };
export * from './patterns/index.js';
export * from './agents/index.js';
