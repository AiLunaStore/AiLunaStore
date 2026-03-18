/**
 * Performance Tracker - Collects metrics on speedup, quality, cost, and success rate
 */
export class PerformanceTracker {
  constructor(options = {}) {
    this.options = {
      trackTokenUsage: options.trackTokenUsage ?? true,
      trackTiming: options.trackTiming ?? true,
      historySize: options.historySize || 1000,
      ...options
    };
    
    this.executions = [];
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalDuration: 0,
      totalSubtasks: 0,
      tokenUsage: { input: 0, output: 0, total: 0 },
      totalCost: 0
    };
  }

  record(params) {
    const { executionId, task, analysis, duration, coordinationResult, integratedResult } = params;
    
    const estimatedSoloTime = analysis.subtasks.reduce(
      (sum, st) => sum + (st.estimatedMinutes || 5) * 60000, 0
    );
    
    const speedupFactor = duration > 0 ? estimatedSoloTime / duration : 1;
    const quality = this.calculateQuality(coordinationResult, integratedResult);
    const tokenUsage = this.estimateTokenUsage(task, analysis, coordinationResult);
    
    const execution = {
      executionId,
      timestamp: Date.now(),
      task: { id: task.id, description: task.description, complexity: analysis.complexity },
      metrics: { duration, estimatedSoloTime, speedupFactor, quality, tokenUsage, subtaskCount: analysis.subtasks.length },
      success: integratedResult.success
    };
    
    this.executions.push(execution);
    
    if (this.executions.length > this.options.historySize) {
      this.executions = this.executions.slice(-this.options.historySize);
    }
    
    this.updateAggregateMetrics(execution);
    return execution.metrics;
  }

  calculateQuality(coordinationResult, integratedResult) {
    const total = coordinationResult.subtaskResults.length;
    const successful = coordinationResult.completed;
    const failed = coordinationResult.failed;
    
    const completionRate = total > 0 ? successful / total : 0;
    const successRate = integratedResult.success ? completionRate : 0;
    let score = successRate * 100 - failed * 10;
    
    return {
      score: Math.max(0, Math.min(100, Math.round(score))),
      completionRate: Math.round(completionRate * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      failedSubtasks: failed
    };
  }

  estimateTokenUsage(task, analysis, coordinationResult) {
    const baseTokens = 500;
    const complexityMultiplier = analysis.complexity * 100;
    const subtaskTokens = analysis.subtasks.length * 300;
    const resultTokens = coordinationResult.subtaskResults.length * 200;
    
    const input = baseTokens + complexityMultiplier + subtaskTokens;
    const output = resultTokens + (analysis.complexity * 150);
    
    return { estimated: true, input, output, total: input + output };
  }

  updateAggregateMetrics(execution) {
    this.metrics.totalExecutions++;
    if (execution.success) {
      this.metrics.successfulExecutions++;
    } else {
      this.metrics.failedExecutions++;
    }
    
    this.metrics.totalDuration += execution.metrics.duration;
    this.metrics.totalSubtasks += execution.metrics.subtaskCount;
    
    if (this.options.trackTokenUsage) {
      this.metrics.tokenUsage.input += execution.metrics.tokenUsage.input;
      this.metrics.tokenUsage.output += execution.metrics.tokenUsage.output;
      this.metrics.tokenUsage.total += execution.metrics.tokenUsage.total;
    }
  }

  getStats() {
    if (this.metrics.totalExecutions === 0) {
      return { executions: 0, message: 'No executions recorded yet' };
    }
    
    const recentExecutions = this.executions.slice(-100);
    const avgDuration = recentExecutions.reduce((sum, e) => sum + e.metrics.duration, 0) / recentExecutions.length;
    const avgSpeedup = recentExecutions.reduce((sum, e) => sum + e.metrics.speedupFactor, 0) / recentExecutions.length;
    const avgQuality = recentExecutions.reduce((sum, e) => sum + e.metrics.quality.score, 0) / recentExecutions.length;
    
    return {
      executions: {
        total: this.metrics.totalExecutions,
        successful: this.metrics.successfulExecutions,
        failed: this.metrics.failedExecutions,
        successRate: Math.round((this.metrics.successfulExecutions / this.metrics.totalExecutions) * 100) / 100
      },
      timing: {
        totalDuration: this.metrics.totalDuration,
        avgDuration: Math.round(avgDuration),
        avgSpeedupFactor: Math.round(avgSpeedup * 100) / 100
      },
      quality: { avgScore: Math.round(avgQuality), totalSubtasks: this.metrics.totalSubtasks },
      cost: {
        totalTokens: this.metrics.tokenUsage.total,
        avgTokensPerExecution: Math.round(this.metrics.tokenUsage.total / this.metrics.totalExecutions)
      }
    };
  }

  getHistory(limit = 100) {
    return this.executions.slice(-limit);
  }

  reset() {
    this.executions = [];
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalDuration: 0,
      totalSubtasks: 0,
      tokenUsage: { input: 0, output: 0, total: 0 },
      totalCost: 0
    };
  }
}