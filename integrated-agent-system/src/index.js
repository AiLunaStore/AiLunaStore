import { Orchestrator } from './orchestrator.js';
import { TaskRouter } from './task-router.js';
import { CostTracker } from './cost-tracker.js';
import { PerformanceMonitor } from './performance-monitor.js';
import { FallbackManager } from './fallback-manager.js';
import { ProgressiveRefinementPipeline } from './progressive-refinement-pipeline.js';
import { ConfidenceScorer } from './confidence-scorer.js';

/**
 * Integrated Agent System
 * A unified system for intelligent task routing, cost optimization, and performance monitoring
 * with confidence-based progressive refinement
 */
export class IntegratedAgentSystem {
  constructor(options = {}) {
    this.orchestrator = new Orchestrator(options);
    this.taskRouter = new TaskRouter(options);
    this.costTracker = new CostTracker(options);
    this.performanceMonitor = new PerformanceMonitor(options);
    this.fallbackManager = new FallbackManager(options);
    this.refinementPipeline = new ProgressiveRefinementPipeline(options);
    this.confidenceScorer = new ConfidenceScorer(options.confidence);
    
    // Connect components
    this.setupEventHandlers();
  }

  /**
   * Execute a task through the integrated system
   * Uses progressive refinement by default
   */
  async execute(task, options = {}) {
    return this.orchestrator.execute(task, options);
  }

  /**
   * Execute with explicit progressive refinement
   */
  async executeProgressive(task, options = {}) {
    return this.orchestrator.execute(task, { 
      ...options, 
      useProgressive: true 
    });
  }

  /**
   * Execute with traditional fallback chain
   */
  async executeTraditional(task, options = {}) {
    return this.orchestrator.execute(task, { 
      ...options, 
      skipProgressive: true 
    });
  }

  /**
   * Calculate confidence for a result
   */
  calculateConfidence(result, task) {
    return this.confidenceScorer.calculateConfidence(result, task);
  }

  /**
   * Get comprehensive system status
   */
  getStatus() {
    return {
      orchestrator: this.orchestrator.getStatus(),
      costTracker: this.costTracker.getStatus(),
      performanceMonitor: this.performanceMonitor.getSummary(),
      fallbackManager: this.fallbackManager.getStats(),
      progressive: this.refinementPipeline.getStats()
    };
  }

  /**
   * Get progressive refinement statistics
   */
  getProgressiveStats() {
    return this.refinementPipeline.getStats();
  }

  /**
   * Update confidence thresholds based on learning
   */
  updateConfidenceThresholds() {
    return this.orchestrator.updateConfidenceThresholds();
  }

  /**
   * Switch execution mode
   */
  setExecutionMode(mode) {
    return this.orchestrator.setExecutionMode(mode);
  }

  /**
   * Get full cost report
   */
  getCostReport() {
    return this.costTracker.getReport();
  }

  /**
   * Get performance report
   */
  getPerformanceReport() {
    return {
      summary: this.performanceMonitor.getSummary(),
      quality: this.performanceMonitor.getQualityAnalysis(),
      efficiency: this.performanceMonitor.getEfficiencyMetrics(),
      comparison: this.performanceMonitor.getCostComparison(),
      trends: this.performanceMonitor.getTrends(),
      progressive: this.refinementPipeline.getStats()
    };
  }

  /**
   * Get Mission Control dashboard data
   */
  getDashboardData() {
    const costReport = this.costTracker.getReport();
    const perfReport = this.performanceMonitor.getSummary();
    const comparison = this.performanceMonitor.getCostComparison();
    const progressiveStats = this.refinementPipeline.getStats();
    
    return {
      // Overview metrics
      currentSpending: costReport.status.totalSpent,
      totalBudget: costReport.status.totalLimit,
      budgetUtilization: costReport.status.globalUtilization,
      totalExecutions: perfReport.overall.totalExecutions,
      successRate: perfReport.overall.successRate,
      
      // Cost metrics
      avgCostPerTask: perfReport.overall.averageCost,
      costSavings: comparison.savings,
      savingsPercent: comparison.savingsPercent,
      
      // Performance metrics
      avgDuration: perfReport.overall.averageDuration,
      avgQuality: this.performanceMonitor.getQualityAnalysis().overallQuality,
      
      // Progressive refinement stats
      progressiveStats: {
        learning: progressiveStats.learning,
        thresholds: progressiveStats.thresholds,
        avgStages: progressiveStats.totalExecutions > 0 
          ? progressiveStats.totalCost / progressiveStats.totalExecutions 
          : 0
      },
      
      // Breakdowns
      byModel: costReport.breakdowns.byModel,
      byAgent: costReport.breakdowns.byAgent,
      byTaskType: costReport.breakdowns.byTaskType,
      
      // Budgets
      budgets: costReport.budgets,
      
      // Recent activity
      recentHistory: costReport.recentHistory,
      
      // Agent performance
      agentPerformance: perfReport.byAgent,
      modelPerformance: perfReport.byModel
    };
  }

  /**
   * Set up event handlers between components
   */
  setupEventHandlers() {
    this.orchestrator.on('onTaskStart', (data) => {
      // Could trigger real-time updates
    });
    
    this.orchestrator.on('onTaskComplete', (data) => {
      this.performanceMonitor.record({
        executionId: data.executionId,
        ...data
      });
    });
    
    this.orchestrator.on('onBudgetAlert', (data) => {
      console.warn(`[BUDGET ALERT] ${data.type}:`, data);
    });
    
    this.orchestrator.on('onFallback', (data) => {
      this.fallbackManager.recordFallback(
        data.taskType || 'unknown',
        data.reason,
        data.attempt || 0
      );
    });
    
    // NEW: Stage completion events
    this.orchestrator.on('onStageComplete', (data) => {
      // Track stage metrics
    });
  }

  /**
   * Register event handler
   */
  on(event, handler) {
    this.orchestrator.on(event, handler);
  }
}

// Export all components
export { 
  Orchestrator, 
  TaskRouter, 
  CostTracker, 
  PerformanceMonitor, 
  FallbackManager,
  ProgressiveRefinementPipeline,
  ConfidenceScorer
};

// Default export
export default IntegratedAgentSystem;
