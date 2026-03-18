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
      tokenUsage: {
        input: 0,
        output: 0,
        total: 0
      }
    };
  }

  /**
   * Record metrics for an execution
   * @param {Object} params - Execution data
   * @returns {Object} Calculated metrics
   */
  record(params) {
    const { executionId, task, analysis, duration, coordinationResult, integratedResult } = params;
    
    // Calculate estimated solo time (sum of all subtask times)
    const estimatedSoloTime = analysis.subtasks.reduce(
      (sum, st) => sum + (st.estimatedMinutes || 5) * 60000, // Convert to ms
      0
    );
    
    // Calculate speedup factor
    const speedupFactor = duration > 0 ? estimatedSoloTime / duration : 1;
    
    // Calculate quality score
    const quality = this.calculateQuality(coordinationResult, integratedResult);
    
    // Estimate token usage (rough approximation)
    const tokenUsage = this.estimateTokenUsage(task, analysis, coordinationResult);
    
    // Record execution data
    const execution = {
      executionId,
      timestamp: Date.now(),
      task: {
        id: task.id,
        description: task.description,
        complexity: analysis.complexity
      },
      metrics: {
        duration,
        estimatedSoloTime,
        speedupFactor,
        quality,
        tokenUsage,
        subtaskCount: analysis.subtasks.length,
        successfulSubtasks: coordinationResult.completed,
        failedSubtasks: coordinationResult.failed
      },
      success: integratedResult.success
    };
    
    this.executions.push(execution);
    
    // Maintain history size
    if (this.executions.length > this.options.historySize) {
      this.executions = this.executions.slice(-this.options.historySize);
    }
    
    // Update aggregate metrics
    this.updateAggregateMetrics(execution);
    
    return execution.metrics;
  }

  /**
   * Calculate quality score for an execution
   * @param {Object} coordinationResult - Coordination results
   * @param {Object} integratedResult - Integration results
   * @returns {Object} Quality metrics
   */
  calculateQuality(coordinationResult, integratedResult) {
    const total = coordinationResult.subtaskResults.length;
    const successful = coordinationResult.completed;
    const failed = coordinationResult.failed;
    
    // Completion rate
    const completionRate = total > 0 ? successful / total : 0;
    
    // Success rate (includes integration success)
    const successRate = integratedResult.success ? completionRate : 0;
    
    // Calculate score (0-100)
    let score = successRate * 100;
    
    // Penalize failures
    score -= failed * 10;
    
    // Ensure score is within bounds
    score = Math.max(0, Math.min(100, score));
    
    return {
      score: Math.round(score),
      completionRate: Math.round(completionRate * 100) / 100,
      successRate: Math.round(successRate * 100) / 100,
      failedSubtasks: failed
    };
  }

  /**
   * Estimate token usage for an execution
   * @param {Object} task - Original task
   * @param {Object} analysis - Task analysis
   * @param {Object} coordinationResult - Coordination results
   * @returns {Object} Token usage estimate
   */
  estimateTokenUsage(task, analysis, coordinationResult) {
    // Rough estimation based on task complexity and subtasks
    // In real implementation, this would use actual token counts
    
    const baseTokens = 500; // Base overhead
    const complexityMultiplier = analysis.complexity * 100;
    const subtaskTokens = analysis.subtasks.length * 300;
    const resultTokens = coordinationResult.subtaskResults.length * 200;
    
    const input = baseTokens + complexityMultiplier + subtaskTokens;
    const output = resultTokens + (analysis.complexity * 150);
    
    return {
      estimated: true,
      input,
      output,
      total: input + output
    };
  }

  /**
   * Update aggregate metrics
   * @param {Object} execution - Execution record
   */
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

  /**
   * Get current statistics
   * @returns {Object} Performance statistics
   */
  getStats() {
    if (this.metrics.totalExecutions === 0) {
      return {
        executions: 0,
        message: 'No executions recorded yet'
      };
    }
    
    const recentExecutions = this.executions.slice(-100); // Last 100
    
    // Calculate averages from recent executions
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
      quality: {
        avgScore: Math.round(avgQuality),
        totalSubtasks: this.metrics.totalSubtasks
      },
      cost: {
        totalTokens: this.metrics.tokenUsage.total,
        avgTokensPerExecution: Math.round(this.metrics.tokenUsage.total / this.metrics.totalExecutions)
      },
      recent: {
        count: recentExecutions.length,
        avgDuration: Math.round(avgDuration),
        avgSpeedup: Math.round(avgSpeedup * 100) / 100,
        avgQuality: Math.round(avgQuality)
      }
    };
  }

  /**
   * Get speedup analysis
   * @returns {Object} Speedup statistics
   */
  getSpeedupAnalysis() {
    if (this.executions.length === 0) {
      return { message: 'No data available' };
    }
    
    const speedups = this.executions.map(e => e.metrics.speedupFactor);
    
    return {
      avg: Math.round(speedups.reduce((a, b) => a + b, 0) / speedups.length * 100) / 100,
      min: Math.round(Math.min(...speedups) * 100) / 100,
      max: Math.round(Math.max(...speedups) * 100) / 100,
      median: Math.round(this.calculateMedian(speedups) * 100) / 100,
      byComplexity: this.groupByComplexity()
    };
  }

  /**
   * Group speedup by task complexity
   * @returns {Object} Speedup by complexity
   */
  groupByComplexity() {
    const byComplexity = {};
    
    for (const execution of this.executions) {
      const complexity = execution.task.complexity;
      if (!byComplexity[complexity]) {
        byComplexity[complexity] = [];
      }
      byComplexity[complexity].push(execution.metrics.speedupFactor);
    }
    
    const result = {};
    for (const [complexity, speedups] of Object.entries(byComplexity)) {
      result[complexity] = {
        count: speedups.length,
        avg: Math.round(speedups.reduce((a, b) => a + b, 0) / speedups.length * 100) / 100
      };
    }
    
    return result;
  }

  /**
   * Calculate median value
   * @param {number[]} values - Array of numbers
   * @returns {number} Median
   */
  calculateMedian(values) {
    if (values.length === 0) return 0;
    
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    
    if (sorted.length % 2 === 0) {
      return (sorted[mid - 1] + sorted[mid]) / 2;
    }
    
    return sorted[mid];
  }

  /**
   * Get execution history
   * @param {number} limit - Maximum number of records
   * @returns {Object[]} Execution records
   */
  getHistory(limit = 100) {
    return this.executions.slice(-limit);
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.executions = [];
    this.metrics = {
      totalExecutions: 0,
      successfulExecutions: 0,
      failedExecutions: 0,
      totalDuration: 0,
      totalSubtasks: 0,
      tokenUsage: {
        input: 0,
        output: 0,
        total: 0
      }
    };
  }
}
