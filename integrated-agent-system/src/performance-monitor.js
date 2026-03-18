/**
 * Performance Monitor - Tracks quality, speed, and cost metrics
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.metrics = [];
    this.maxMetricsSize = options.maxMetricsSize || 5000;
    
    // Aggregated statistics
    this.stats = {
      byModel: {},
      byAgent: {},
      byTaskType: {},
      overall: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalCost: 0,
        totalDuration: 0
      }
    };
    
    // Quality tracking
    this.qualityThreshold = options.qualityThreshold || 0.7;
  }

  /**
   * Record a performance metric
   */
  record(data) {
    const { executionId, task, routing, result, duration, cost } = data;
    
    const metric = {
      executionId,
      timestamp: Date.now(),
      taskType: routing.taskType,
      model: result.model,
      agent: result.agent,
      duration,
      cost,
      qualityScore: result.qualityScore,
      success: result.success !== false,
      fallbackUsed: result.fallbackUsed || false,
      complexity: task.complexity || 5
    };
    
    // Store metric
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics.shift();
    }
    
    // Update aggregated stats
    this.updateStats(metric);
    
    return metric;
  }

  /**
   * Update aggregated statistics
   */
  updateStats(metric) {
    const { overall, byModel, byAgent, byTaskType } = this.stats;
    
    // Overall stats
    overall.totalExecutions++;
    if (metric.success) {
      overall.successfulExecutions++;
    } else {
      overall.failedExecutions++;
    }
    overall.totalCost += metric.cost;
    overall.totalDuration += metric.duration;
    
    // By model
    if (!byModel[metric.model]) {
      byModel[metric.model] = this.initializeStatsGroup();
    }
    this.updateStatsGroup(byModel[metric.model], metric);
    
    // By agent
    if (!byAgent[metric.agent]) {
      byAgent[metric.agent] = this.initializeStatsGroup();
    }
    this.updateStatsGroup(byAgent[metric.agent], metric);
    
    // By task type
    if (!byTaskType[metric.taskType]) {
      byTaskType[metric.taskType] = this.initializeStatsGroup();
    }
    this.updateStatsGroup(byTaskType[metric.taskType], metric);
  }

  /**
   * Initialize a stats group
   */
  initializeStatsGroup() {
    return {
      count: 0,
      successes: 0,
      failures: 0,
      totalCost: 0,
      totalDuration: 0,
      totalQuality: 0,
      fallbackCount: 0,
      minDuration: Infinity,
      maxDuration: 0,
      minCost: Infinity,
      maxCost: 0
    };
  }

  /**
   * Update a stats group with a metric
   */
  updateStatsGroup(group, metric) {
    group.count++;
    if (metric.success) {
      group.successes++;
    } else {
      group.failures++;
    }
    group.totalCost += metric.cost;
    group.totalDuration += metric.duration;
    group.totalQuality += metric.qualityScore;
    if (metric.fallbackUsed) {
      group.fallbackCount++;
    }
    group.minDuration = Math.min(group.minDuration, metric.duration);
    group.maxDuration = Math.max(group.maxDuration, metric.duration);
    group.minCost = Math.min(group.minCost, metric.cost);
    group.maxCost = Math.max(group.maxCost, metric.cost);
  }

  /**
   * Get performance summary
   */
  getSummary() {
    const { overall, byModel, byAgent, byTaskType } = this.stats;
    
    return {
      overall: {
        ...overall,
        successRate: overall.totalExecutions > 0 ? 
          (overall.successfulExecutions / overall.totalExecutions) * 100 : 0,
        averageCost: overall.totalExecutions > 0 ? 
          overall.totalCost / overall.totalExecutions : 0,
        averageDuration: overall.totalExecutions > 0 ? 
          overall.totalDuration / overall.totalExecutions : 0
      },
      byModel: this.calculateGroupStats(byModel),
      byAgent: this.calculateGroupStats(byAgent),
      byTaskType: this.calculateGroupStats(byTaskType),
      recentMetrics: this.getRecentMetrics(10)
    };
  }

  /**
   * Calculate stats for each group
   */
  calculateGroupStats(groups) {
    const result = {};
    
    for (const [key, group] of Object.entries(groups)) {
      result[key] = {
        count: group.count,
        successRate: group.count > 0 ? (group.successes / group.count) * 100 : 0,
        averageCost: group.count > 0 ? group.totalCost / group.count : 0,
        averageDuration: group.count > 0 ? group.totalDuration / group.count : 0,
        averageQuality: group.count > 0 ? group.totalQuality / group.count : 0,
        fallbackRate: group.count > 0 ? (group.fallbackCount / group.count) * 100 : 0,
        minDuration: group.minDuration === Infinity ? 0 : group.minDuration,
        maxDuration: group.maxDuration,
        minCost: group.minCost === Infinity ? 0 : group.minCost,
        maxCost: group.maxCost,
        totalCost: group.totalCost
      };
    }
    
    return result;
  }

  /**
   * Get recent metrics
   */
  getRecentMetrics(count = 10) {
    return this.metrics.slice(-count);
  }

  /**
   * Get metrics filtered by criteria
   */
  getMetrics(filters = {}) {
    let filtered = [...this.metrics];
    
    if (filters.model) {
      filtered = filtered.filter(m => m.model === filters.model);
    }
    
    if (filters.agent) {
      filtered = filtered.filter(m => m.agent === filters.agent);
    }
    
    if (filters.taskType) {
      filtered = filtered.filter(m => m.taskType === filters.taskType);
    }
    
    if (filters.success !== undefined) {
      filtered = filtered.filter(m => m.success === filters.success);
    }
    
    if (filters.since) {
      filtered = filtered.filter(m => m.timestamp >= filters.since);
    }
    
    if (filters.limit) {
      filtered = filtered.slice(-filters.limit);
    }
    
    return filtered;
  }

  /**
   * Get quality analysis
   */
  getQualityAnalysis() {
    const successful = this.metrics.filter(m => m.success);
    const highQuality = this.metrics.filter(m => m.qualityScore >= this.qualityThreshold);
    
    return {
      overallQuality: this.metrics.length > 0 ?
        this.metrics.reduce((sum, m) => sum + m.qualityScore, 0) / this.metrics.length : 0,
      highQualityRate: this.metrics.length > 0 ?
        (highQuality.length / this.metrics.length) * 100 : 0,
      qualityByModel: this.calculateQualityByDimension('model'),
      qualityByAgent: this.calculateQualityByDimension('agent'),
      qualityByTaskType: this.calculateQualityByDimension('taskType')
    };
  }

  /**
   * Calculate quality by dimension
   */
  calculateQualityByDimension(dimension) {
    const byDimension = {};
    
    for (const metric of this.metrics) {
      const key = metric[dimension];
      if (!byDimension[key]) {
        byDimension[key] = { total: 0, count: 0 };
      }
      byDimension[key].total += metric.qualityScore;
      byDimension[key].count++;
    }
    
    const result = {};
    for (const [key, data] of Object.entries(byDimension)) {
      result[key] = data.count > 0 ? data.total / data.count : 0;
    }
    
    return result;
  }

  /**
   * Get efficiency metrics (quality per dollar)
   */
  getEfficiencyMetrics() {
    const byModel = {};
    const byAgent = {};
    
    for (const metric of this.metrics) {
      if (metric.cost > 0) {
        // By model
        if (!byModel[metric.model]) {
          byModel[metric.model] = { totalQuality: 0, totalCost: 0, count: 0 };
        }
        byModel[metric.model].totalQuality += metric.qualityScore;
        byModel[metric.model].totalCost += metric.cost;
        byModel[metric.model].count++;
        
        // By agent
        if (!byAgent[metric.agent]) {
          byAgent[metric.agent] = { totalQuality: 0, totalCost: 0, count: 0 };
        }
        byAgent[metric.agent].totalQuality += metric.qualityScore;
        byAgent[metric.agent].totalCost += metric.cost;
        byAgent[metric.agent].count++;
      }
    }
    
    // Calculate efficiency (quality per dollar)
    const modelEfficiency = {};
    for (const [model, data] of Object.entries(byModel)) {
      modelEfficiency[model] = data.totalCost > 0 ? data.totalQuality / data.totalCost : 0;
    }
    
    const agentEfficiency = {};
    for (const [agent, data] of Object.entries(byAgent)) {
      agentEfficiency[agent] = data.totalCost > 0 ? data.totalQuality / data.totalCost : 0;
    }
    
    return {
      byModel: modelEfficiency,
      byAgent: agentEfficiency,
      mostEfficientModel: this.findMostEfficient(modelEfficiency),
      mostEfficientAgent: this.findMostEfficient(agentEfficiency)
    };
  }

  /**
   * Find most efficient option
   */
  findMostEfficient(efficiencyMap) {
    let best = null;
    let bestScore = 0;
    
    for (const [key, score] of Object.entries(efficiencyMap)) {
      if (score > bestScore) {
        bestScore = score;
        best = key;
      }
    }
    
    return { name: best, score: bestScore };
  }

  /**
   * Get comparison with old Kimi-only system
   */
  getCostComparison() {
    // Kimi K2.5 pricing: $0.60 input, $3.00 output per 1M tokens
    // Average task: 2000 input, 1500 output tokens
    const kimiCostPerTask = (2000 / 1000000) * 0.60 + (1500 / 1000000) * 3.00; // ~$0.0057
    
    const totalTasks = this.stats.overall.totalExecutions;
    const kimiTotalCost = totalTasks * kimiCostPerTask;
    const actualTotalCost = this.stats.overall.totalCost;
    
    const savings = kimiTotalCost - actualTotalCost;
    const savingsPercent = kimiTotalCost > 0 ? (savings / kimiTotalCost) * 100 : 0;
    
    return {
      kimiOnlyCost: kimiTotalCost,
      optimizedCost: actualTotalCost,
      savings,
      savingsPercent,
      perTaskAverage: {
        kimi: kimiCostPerTask,
        optimized: totalTasks > 0 ? actualTotalCost / totalTasks : 0
      }
    };
  }

  /**
   * Get performance trends over time
   */
  getTrends(timeWindow = 24 * 60 * 60 * 1000) { // Default 24 hours
    const now = Date.now();
    const cutoff = now - timeWindow;
    
    const recent = this.metrics.filter(m => m.timestamp >= cutoff);
    
    // Group by hour
    const byHour = {};
    for (const metric of recent) {
      const hour = Math.floor(metric.timestamp / (60 * 60 * 1000));
      if (!byHour[hour]) {
        byHour[hour] = [];
      }
      byHour[hour].push(metric);
    }
    
    const trends = [];
    for (const [hour, metrics] of Object.entries(byHour).sort()) {
      const avgCost = metrics.reduce((sum, m) => sum + m.cost, 0) / metrics.length;
      const avgDuration = metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length;
      const avgQuality = metrics.reduce((sum, m) => sum + m.qualityScore, 0) / metrics.length;
      const successRate = (metrics.filter(m => m.success).length / metrics.length) * 100;
      
      trends.push({
        hour: parseInt(hour),
        count: metrics.length,
        avgCost,
        avgDuration,
        avgQuality,
        successRate
      });
    }
    
    return trends;
  }

  /**
   * Reset all metrics
   */
  reset() {
    this.metrics = [];
    this.stats = {
      byModel: {},
      byAgent: {},
      byTaskType: {},
      overall: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalCost: 0,
        totalDuration: 0
      }
    };
  }
}

export default PerformanceMonitor;
