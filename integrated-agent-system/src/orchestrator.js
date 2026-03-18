import { TaskRouter } from './task-router.js';
import { CostTracker } from './cost-tracker.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { FallbackManager } from './fallback-manager.js';
import { ProgressiveRefinementPipeline } from './progressive-refinement-pipeline.js';
import { ConfidenceScorer } from './confidence-scorer.js';
import modelsConfig from '../config/models.json' assert { type: 'json' };
import agentsConfig from '../config/agents.json' assert { type: 'json' };
import strategiesConfig from '../config/strategies.json' assert { type: 'json' };
import fallbackChainsConfig from '../config/fallback-chains.json' assert { type: 'json' };

/**
 * Integrated Agent System Orchestrator
 * Main coordinator with confidence-based progressive refinement
 */
export class Orchestrator {
  constructor(options = {}) {
    // Load configurations
    this.models = modelsConfig.models;
    this.agents = agentsConfig.agents;
    this.strategies = strategiesConfig.strategies;
    this.fallbackChains = fallbackChainsConfig.fallbackChains;
    this.defaultStrategy = strategiesConfig.defaultStrategy;
    
    // Initialize components
    this.taskRouter = new TaskRouter({
      models: this.models,
      agents: this.agents,
      strategies: this.strategies,
      defaultStrategy: this.defaultStrategy
    });
    
    this.costTracker = new CostTracker({
      defaultBudget: options.defaultBudget || 10.00,
      alertThresholds: options.alertThresholds || [0.5, 0.8, 0.95]
    });
    
    this.performanceMonitor = new PerformanceMonitor();
    
    this.fallbackManager = new FallbackManager({
      fallbackChains: this.fallbackChains,
      globalSettings: fallbackChainsConfig.globalSettings
    });
    
    // NEW: Progressive refinement pipeline
    this.refinementPipeline = new ProgressiveRefinementPipeline({
      confidence: options.confidence || {
        cheapThreshold: 0.75,
        standardThreshold: 0.85,
        criticalThreshold: 0.90
      }
    });
    
    // NEW: Confidence scorer for direct use
    this.confidenceScorer = new ConfidenceScorer(options.confidence);
    
    // Execution mode: 'progressive' (new) or 'traditional' (old)
    this.executionMode = options.executionMode || 'progressive';
    
    // Execution tracking
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
    
    // Event handlers
    this.eventHandlers = {
      onTaskStart: [],
      onTaskComplete: [],
      onTaskError: [],
      onBudgetAlert: [],
      onFallback: [],
      onStageComplete: []  // NEW: Stage completion events
    };
  }

  /**
   * Execute a task through the integrated system
   * Uses progressive refinement by default
   */
  async execute(task, options = {}) {
    const executionId = this.generateExecutionId();
    const startTime = Date.now();
    
    try {
      // Initialize execution context
      const executionContext = this.initializeExecution(executionId, task, options);
      
      // Classify task
      const routing = this.taskRouter.classifyAndRoute(task, {
        strategy: options.strategy,
        budget: this.costTracker.getRemainingBudget(options.budgetId)
      });
      
      this.emit('onTaskStart', { executionId, task, routing });
      
      // Choose execution method based on mode
      let result;
      if (this.executionMode === 'progressive' && !options.skipProgressive) {
        result = await this.executeWithProgressiveRefinement(executionId, task, options);
      } else {
        result = await this.executeWithFallback(executionId, task, routing, executionContext);
      }
      
      // Record costs
      const actualCost = result.cost || result.actualCost || 0;
      this.costTracker.recordCost(options.budgetId || 'default', {
        executionId,
        amount: actualCost,
        model: result.model,
        agent: result.agent || 'progressive-pipeline',
        taskType: routing.taskType
      });
      
      // Record performance
      const duration = Date.now() - startTime;
      this.performanceMonitor.record({
        executionId,
        task,
        routing,
        result,
        duration,
        cost: actualCost
      });
      
      // Finalize execution
      const finalResult = this.finalizeExecution(executionId, task, result, {
        duration,
        cost: actualCost,
        routing
      });
      
      this.emit('onTaskComplete', { executionId, result: finalResult });
      
      return finalResult;
      
    } catch (error) {
      const duration = Date.now() - startTime;
      this.handleExecutionError(executionId, task, error, duration);
      throw error;
    }
  }

  /**
   * NEW: Execute with progressive refinement
   * Tries cheap model first, escalates based on confidence
   */
  async executeWithProgressiveRefinement(executionId, task, options) {
    console.log(`\n🎯 Executing with progressive refinement: ${task.id}`);
    
    // Check if task should use progressive refinement
    const shouldUseProgressive = this.shouldUseProgressive(task, options);
    
    if (!shouldUseProgressive) {
      console.log('   Using traditional fallback chain (task type not suitable for progressive)');
      const routing = this.taskRouter.classifyAndRoute(task, options);
      return this.executeWithFallback(executionId, task, routing, {});
    }
    
    // Execute through progressive refinement pipeline
    const result = await this.refinementPipeline.execute(task, options);
    
    // Emit stage events for monitoring
    for (const stage of result.stages) {
      this.emit('onStageComplete', {
        executionId,
        stage: stage.stage,
        model: stage.model,
        confidence: stage.confidence,
        passed: stage.passed,
        cost: stage.cost
      });
    }
    
    return {
      ...result,
      agent: 'progressive-pipeline',
      progressive: true,
      stages: result.stages
    };
  }

  /**
   * Determine if task should use progressive refinement
   */
  shouldUseProgressive(task, options) {
    // Always use progressive for coding tasks
    const taskType = this.taskRouter.classifyTask(task).taskType;
    if (taskType === 'coding' || taskType === 'implementation') {
      return true;
    }
    
    // Use progressive for UI/backend tasks
    if (taskType === 'ui' || taskType === 'backend') {
      return true;
    }
    
    // Skip progressive for research/planning (better suited for single-model)
    if (taskType === 'research' || taskType === 'planning') {
      return false;
    }
    
    // Check explicit override
    if (options.useProgressive !== undefined) {
      return options.useProgressive;
    }
    
    return true;
  }

  /**
   * Traditional execution with fallback chain
   */
  async executeWithFallback(executionId, task, routing, context) {
    const fallbackChain = this.fallbackManager.getFallbackChain(routing.taskType);
    let lastError = null;
    
    for (const fallbackStep of fallbackChain) {
      try {
        const result = await this.executeTaskWithAgent(
          executionId,
          task,
          fallbackStep,
          context
        );
        
        // Check quality threshold
        if (result.qualityScore >= fallbackChainsConfig.globalSettings.qualityThreshold) {
          return {
            ...result,
            fallbackUsed: fallbackStep !== fallbackChain[0],
            fallbackChain: fallbackChain.map(f => f.model),
            model: fallbackStep.model,
            agent: fallbackStep.agent
          };
        }
        
        this.emit('onFallback', {
          executionId,
          reason: 'quality_threshold',
          from: fallbackStep,
          to: fallbackChain[fallbackChain.indexOf(fallbackStep) + 1]
        });
        
      } catch (error) {
        lastError = error;
        
        this.emit('onFallback', {
          executionId,
          reason: 'error',
          error: error.message,
          from: fallbackStep,
          to: fallbackChain[fallbackChain.indexOf(fallbackStep) + 1]
        });
        
        continue;
      }
    }
    
    throw new Error(`All fallback options exhausted for task ${task.id}. Last error: ${lastError?.message}`);
  }

  /**
   * Execute task with specific agent/model
   */
  async executeTaskWithAgent(executionId, task, fallbackStep, context) {
    const model = this.models[fallbackStep.model];
    const agent = this.agents[fallbackStep.agent];
    
    const executionTime = this.simulateExecutionTime(model);
    const tokenUsage = this.estimateTokenUsage(task, agent);
    const actualCost = this.calculateCost(model, tokenUsage);
    const qualityScore = this.simulateQualityScore(model, agent, task);
    
    return {
      success: true,
      output: `Executed ${task.description} using ${model.name}`,
      model: fallbackStep.model,
      agent: fallbackStep.agent,
      actualCost,
      qualityScore,
      tokenUsage,
      executionTime,
      timestamp: Date.now()
    };
  }

  /**
   * NEW: Calculate confidence for a result
   */
  calculateConfidence(result, task) {
    return this.confidenceScorer.calculateConfidence(result, task);
  }

  /**
   * NEW: Get progressive refinement statistics
   */
  getProgressiveStats() {
    return this.refinementPipeline.getStats();
  }

  /**
   * NEW: Update confidence thresholds based on learning
   */
  updateConfidenceThresholds() {
    this.refinementPipeline.updateThresholds();
    return this.confidenceScorer.getThresholds();
  }

  /**
   * NEW: Switch execution mode
   */
  setExecutionMode(mode) {
    if (mode === 'progressive' || mode === 'traditional') {
      this.executionMode = mode;
      return true;
    }
    return false;
  }

  // ... (rest of the methods remain the same)
  initializeExecution(executionId, task, options) {
    const context = {
      executionId,
      task,
      options,
      startTime: Date.now(),
      status: 'initializing'
    };
    
    this.activeExecutions.set(executionId, context);
    return context;
  }

  finalizeExecution(executionId, task, result, metrics) {
    const finalResult = {
      executionId,
      task,
      result,
      metrics: {
        duration: metrics.duration,
        cost: metrics.cost,
        model: result.model,
        agent: result.agent,
        fallbackUsed: result.fallbackUsed,
        qualityScore: result.qualityScore || result.confidence?.overall,
        progressive: result.progressive || false,
        stages: result.stages
      },
      routing: metrics.routing,
      timestamp: Date.now()
    };
    
    this.executionHistory.push(finalResult);
    if (this.executionHistory.length > this.maxHistorySize) {
      this.executionHistory.shift();
    }
    
    this.activeExecutions.delete(executionId);
    
    return finalResult;
  }

  handleBudgetExceeded(executionId, task, budgetCheck, startTime) {
    const result = {
      executionId,
      task,
      success: false,
      error: 'Budget exceeded',
      budgetStatus: budgetCheck,
      metrics: {
        duration: Date.now() - startTime,
        cost: 0
      }
    };
    
    this.emit('onBudgetAlert', {
      executionId,
      type: 'budget_exceeded',
      budgetCheck
    });
    
    return result;
  }

  handleExecutionError(executionId, task, error, duration) {
    this.activeExecutions.delete(executionId);
    
    this.emit('onTaskError', {
      executionId,
      task,
      error: error.message,
      duration
    });
  }

  on(event, handler) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].push(handler);
    }
  }

  emit(event, data) {
    if (this.eventHandlers[event]) {
      for (const handler of this.eventHandlers[event]) {
        try {
          handler(data);
        } catch (error) {
          console.error(`Error in ${event} handler:`, error);
        }
      }
    }
  }

  getStatus() {
    return {
      activeExecutions: this.activeExecutions.size,
      totalExecutions: this.executionHistory.length,
      costStatus: this.costTracker.getStatus(),
      performance: this.performanceMonitor.getSummary(),
      progressive: this.getProgressiveStats(),
      executionMode: this.executionMode,
      models: Object.keys(this.models),
      agents: Object.keys(this.agents)
    };
  }

  getHistory(filters = {}) {
    let history = [...this.executionHistory];
    
    if (filters.model) {
      history = history.filter(h => h.result.model === filters.model);
    }
    
    if (filters.agent) {
      history = history.filter(h => h.result.agent === filters.agent);
    }
    
    if (filters.taskType) {
      history = history.filter(h => h.routing.taskType === filters.taskType);
    }
    
    if (filters.progressive !== undefined) {
      history = history.filter(h => h.result.progressive === filters.progressive);
    }
    
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return history;
  }

  generateExecutionId() {
    return `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  simulateExecutionTime(model) {
    const baseTime = 10000 / model.performance.speed;
    return baseTime * (0.8 + Math.random() * 0.4);
  }

  estimateTokenUsage(task, agent) {
    const baseInput = agent.costProfile?.avgInputTokens || 2000;
    const baseOutput = agent.costProfile?.avgOutputTokens || 1500;
    const complexity = task.complexity || 5;
    const inputMultiplier = 0.5 + (complexity / 10);
    const outputMultiplier = 0.5 + (complexity / 10);
    
    return {
      input: Math.round(baseInput * inputMultiplier),
      output: Math.round(baseOutput * outputMultiplier)
    };
  }

  calculateCost(model, tokenUsage) {
    const inputCost = (tokenUsage.input / 1000000) * model.pricing.inputPer1M;
    const outputCost = (tokenUsage.output / 1000000) * model.pricing.outputPer1M;
    return inputCost + outputCost;
  }

  simulateQualityScore(model, agent, task) {
    const baseQuality = model.performance.sweBench / 100;
    const domain = task.domain || 'general';
    const expertise = agent.expertise[domain] || 0.8;
    const variance = (Math.random() - 0.5) * 0.1;
    
    return Math.min(1, Math.max(0, baseQuality * expertise + variance));
  }
}

export default Orchestrator;
