/**
 * Integrated Agent System Module
 * Bundled for production deployment
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load configurations
const loadConfig = (filename) => {
  try {
    const path = join(__dirname, '..', 'config', filename);
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch (error) {
    console.warn(`Failed to load config ${filename}:`, error.message);
    return {};
  }
};

// Configuration
const modelsConfig = loadConfig('models.json');
const agentsConfig = loadConfig('agents.json');
const strategiesConfig = loadConfig('strategies.json');
const fallbackChainsConfig = loadConfig('fallback-chains.json');

/**
 * Cost Tracker - Real-time spending tracking and budget management
 */
export class CostTracker {
  constructor(options = {}) {
    this.defaultBudget = options.defaultBudget || 10.00;
    this.alertThresholds = options.alertThresholds || [0.5, 0.8, 0.95];
    this.trackHistory = options.trackHistory !== false;
    this.maxHistorySize = options.maxHistorySize || 10000;
    
    this.budgets = new Map();
    this.globalSpend = 0;
    this.history = [];
    this.reservations = new Map();
    this.alertCallbacks = [];
    
    this.initBudget('default', { limit: this.defaultBudget });
  }

  initBudget(id, config = {}) {
    const budget = {
      id,
      limit: config.limit || this.defaultBudget,
      spent: 0,
      reserved: 0,
      alertsTriggered: new Set(),
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      metadata: config.metadata || {}
    };
    
    this.budgets.set(id, budget);
    return budget;
  }

  getBudget(id = 'default') {
    return this.budgets.get(id);
  }

  getRemainingBudget(id = 'default') {
    const budget = this.budgets.get(id);
    if (!budget) return 0;
    return budget.limit - budget.spent - budget.reserved;
  }

  canAfford(budgetId, cost) {
    const budget = this.budgets.get(budgetId || 'default');
    if (!budget) {
      return { affordable: false, reason: 'Budget not found' };
    }
    
    const available = budget.limit - budget.spent - budget.reserved;
    
    if (cost <= available) {
      return {
        affordable: true,
        available,
        cost,
        remainingAfter: available - cost
      };
    }
    
    return {
      affordable: false,
      reason: 'Insufficient budget',
      available,
      cost,
      shortfall: cost - available
    };
  }

  recordCost(budgetId, costRecord) {
    const budget = this.budgets.get(budgetId || 'default');
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }
    
    const { executionId, amount, model, agent, taskType } = costRecord;
    
    budget.spent += amount;
    budget.lastUpdated = Date.now();
    
    this.releaseReservation(executionId, amount);
    this.globalSpend += amount;
    
    if (this.trackHistory) {
      this.history.push({
        executionId,
        budgetId: budget.id,
        amount,
        model,
        agent,
        taskType,
        timestamp: Date.now()
      });
      
      if (this.history.length > this.maxHistorySize) {
        this.history = this.history.slice(-this.maxHistorySize);
      }
    }
    
    this.checkAlerts(budget);
    
    return this.getBudgetStatus(budget.id);
  }

  releaseReservation(executionId, amount = null) {
    const reservation = this.reservations.get(executionId);
    if (!reservation) return false;
    
    const releaseAmount = amount !== null ? amount : reservation.amount;
    
    const budget = this.budgets.get('default');
    if (budget) {
      budget.reserved = Math.max(0, budget.reserved - releaseAmount);
    }
    
    if (amount === null || amount >= reservation.amount) {
      this.reservations.delete(executionId);
    } else {
      reservation.amount -= amount;
    }
    
    return true;
  }

  checkAlerts(budget) {
    const utilization = budget.spent / budget.limit;
    
    for (const threshold of this.alertThresholds) {
      if (utilization >= threshold && !budget.alertsTriggered.has(threshold)) {
        budget.alertsTriggered.add(threshold);
        
        const alert = {
          type: 'budget-alert',
          budgetId: budget.id,
          threshold: threshold * 100,
          utilization: utilization * 100,
          spent: budget.spent,
          limit: budget.limit,
          remaining: budget.limit - budget.spent,
          message: `Budget ${budget.id} at ${(utilization * 100).toFixed(1)}%`,
          timestamp: Date.now()
        };
        
        for (const callback of this.alertCallbacks) {
          try {
            callback(alert);
          } catch (error) {
            console.error('Alert callback error:', error);
          }
        }
      }
    }
  }

  getBudgetStatus(id = 'default') {
    const budget = this.budgets.get(id);
    if (!budget) return null;
    
    const remaining = budget.limit - budget.spent;
    const utilization = budget.spent / budget.limit;
    const available = remaining - budget.reserved;
    
    return {
      id: budget.id,
      limit: budget.limit,
      spent: budget.spent,
      reserved: budget.reserved,
      remaining,
      available,
      utilization: utilization * 100,
      isOverBudget: budget.spent > budget.limit,
      isNearLimit: utilization >= 0.9
    };
  }

  getAllBudgets() {
    return Array.from(this.budgets.keys()).map(id => this.getBudgetStatus(id));
  }

  getBreakdown(dimension = 'model') {
    const breakdown = {};
    
    for (const record of this.history) {
      const key = record[dimension] || 'unknown';
      if (!breakdown[key]) {
        breakdown[key] = { total: 0, count: 0 };
      }
      breakdown[key].total += record.amount;
      breakdown[key].count++;
    }
    
    for (const key in breakdown) {
      breakdown[key].average = breakdown[key].total / breakdown[key].count;
    }
    
    return breakdown;
  }

  getStatus() {
    const budgets = this.getAllBudgets();
    const totalLimit = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalReserved = budgets.reduce((sum, b) => sum + b.reserved, 0);
    
    return {
      budgetCount: budgets.length,
      totalLimit,
      totalSpent,
      totalReserved,
      totalRemaining: totalLimit - totalSpent,
      globalUtilization: totalLimit > 0 ? (totalSpent / totalLimit) * 100 : 0,
      globalSpend: this.globalSpend,
      activeReservations: this.reservations.size,
      historySize: this.history.length
    };
  }

  getReport() {
    const status = this.getStatus();
    
    return {
      status,
      breakdowns: {
        byModel: this.getBreakdown('model'),
        byAgent: this.getBreakdown('agent'),
        byTaskType: this.getBreakdown('taskType')
      },
      budgets: this.getAllBudgets(),
      recentHistory: this.history.slice(-50)
    };
  }

  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }
}

/**
 * Performance Monitor - Tracks quality, speed, and cost metrics
 */
export class PerformanceMonitor {
  constructor(options = {}) {
    this.metrics = [];
    this.maxMetricsSize = options.maxMetricsSize || 5000;
    
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
    
    this.qualityThreshold = options.qualityThreshold || 0.7;
  }

  record(data) {
    const { executionId, task, routing, result, duration, cost } = data;
    
    const metric = {
      executionId,
      timestamp: Date.now(),
      taskType: routing?.taskType || 'unknown',
      model: result?.model || 'unknown',
      agent: result?.agent || 'unknown',
      duration,
      cost,
      qualityScore: result?.qualityScore || 0,
      success: result?.success !== false,
      fallbackUsed: result?.fallbackUsed || false,
      complexity: task?.complexity || 5
    };
    
    this.metrics.push(metric);
    if (this.metrics.length > this.maxMetricsSize) {
      this.metrics.shift();
    }
    
    this.updateStats(metric);
    
    return metric;
  }

  updateStats(metric) {
    const { overall, byModel, byAgent, byTaskType } = this.stats;
    
    overall.totalExecutions++;
    if (metric.success) {
      overall.successfulExecutions++;
    } else {
      overall.failedExecutions++;
    }
    overall.totalCost += metric.cost;
    overall.totalDuration += metric.duration;
    
    this.updateGroupStats(byModel, metric.model, metric);
    this.updateGroupStats(byAgent, metric.agent, metric);
    this.updateGroupStats(byTaskType, metric.taskType, metric);
  }

  updateGroupStats(groups, key, metric) {
    if (!groups[key]) {
      groups[key] = {
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
    
    const group = groups[key];
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
      byTaskType: this.calculateGroupStats(byTaskType)
    };
  }

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

  getQualityAnalysis() {
    const successful = this.metrics.filter(m => m.success);
    const highQuality = this.metrics.filter(m => m.qualityScore >= this.qualityThreshold);
    
    return {
      overallQuality: this.metrics.length > 0 ?
        this.metrics.reduce((sum, m) => sum + m.qualityScore, 0) / this.metrics.length : 0,
      highQualityRate: this.metrics.length > 0 ?
        (highQuality.length / this.metrics.length) * 100 : 0
    };
  }

  getCostComparison() {
    // Kimi K2.5 pricing: $0.60 input, $3.00 output per 1M tokens
    // Average task: 2000 input, 1500 output tokens
    const kimiCostPerTask = (2000 / 1000000) * 0.60 + (1500 / 1000000) * 3.00;
    
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
}

/**
 * Task Router - Classifies tasks and routes to appropriate agents
 */
export class TaskRouter {
  constructor(options = {}) {
    this.models = options.models || modelsConfig.models || {};
    this.agents = options.agents || agentsConfig.agents || {};
    this.strategies = options.strategies || strategiesConfig.strategies || {};
    this.defaultStrategy = options.defaultStrategy || strategiesConfig.defaultStrategy || 'balanced';
  }

  classifyTask(task) {
    const description = (task.description || '').toLowerCase();
    
    // Task type detection patterns
    const patterns = {
      coding: /\b(code|implement|function|class|debug|refactor|program|script|api|endpoint)\b/,
      research: /\b(research|find|search|analyze|investigate|compare|study|look up)\b/,
      planning: /\b(plan|design|architecture|strategy|roadmap|structure|organize)\b/,
      ui: /\b(ui|interface|component|frontend|html|css|react|vue|angular|design)\b/,
      backend: /\b(backend|database|server|api|endpoint|auth|middleware|model)\b/,
      integration: /\b(integrate|connect|combine|merge|deploy|test|ci|cd)\b/
    };
    
    for (const [type, pattern] of Object.entries(patterns)) {
      if (pattern.test(description)) {
        return { taskType: type, confidence: 0.8 };
      }
    }
    
    return { taskType: 'general', confidence: 0.5 };
  }

  classifyAndRoute(task, options = {}) {
    const classification = this.classifyTask(task);
    const strategyName = options.strategy || this.selectStrategy(task, classification);
    const strategy = this.strategies[strategyName] || this.strategies[this.defaultStrategy];
    
    // Find best agent for task type
    const suitableAgents = Object.entries(this.agents)
      .filter(([_, agent]) => agent.domains?.includes(classification.taskType))
      .map(([id, agent]) => ({ id, ...agent }));
    
    const selectedAgent = suitableAgents.length > 0 
      ? suitableAgents[0] 
      : { id: 'orchestrator', ...this.agents['orchestrator'] };
    
    return {
      taskType: classification.taskType,
      confidence: classification.confidence,
      strategy: strategyName,
      agent: selectedAgent.id,
      model: selectedAgent.primaryModel,
      estimatedCost: selectedAgent.costProfile?.estimatedCostPerTask || 0.001
    };
  }

  selectStrategy(task, classification) {
    const rules = strategiesConfig.strategySelectionRules || [];
    
    for (const rule of rules) {
      // Simple rule evaluation
      if (rule.condition.includes(classification.taskType)) {
        return rule.strategy;
      }
    }
    
    return this.defaultStrategy;
  }
}

/**
 * Fallback Manager - Handles model fallback chains
 */
export class FallbackManager {
  constructor(options = {}) {
    this.fallbackChains = options.fallbackChains || fallbackChainsConfig.fallbackChains || {};
    this.globalSettings = options.globalSettings || fallbackChainsConfig.globalSettings || {};
    this.stats = new Map();
  }

  getFallbackChain(taskType) {
    const chain = this.fallbackChains[taskType];
    if (!chain) {
      // Return default chain
      return [
        { model: 'deepseek-v3.2', agent: 'orchestrator' },
        { model: 'minimax-m2.5', agent: 'coding-specialist' },
        { model: 'claude-sonnet', agent: 'coding-specialist' }
      ];
    }
    return chain.steps || [];
  }

  recordFallback(taskType, reason, attempt) {
    const key = `${taskType}-${reason}`;
    const current = this.stats.get(key) || { count: 0, attempts: [] };
    current.count++;
    current.attempts.push(attempt);
    this.stats.set(key, current);
  }

  getStats() {
    return Object.fromEntries(this.stats);
  }
}

/**
 * Orchestrator - Main task execution coordinator
 */
export class Orchestrator {
  constructor(options = {}) {
    this.taskRouter = new TaskRouter(options);
    this.costTracker = new CostTracker(options);
    this.performanceMonitor = new PerformanceMonitor(options);
    this.fallbackManager = new FallbackManager(options);
    
    this.models = modelsConfig.models || {};
    this.agents = agentsConfig.agents || {};
    
    this.activeExecutions = new Map();
    this.executionHistory = [];
    this.maxHistorySize = options.maxHistorySize || 1000;
    
    this.eventHandlers = {
      onTaskStart: [],
      onTaskComplete: [],
      onTaskError: [],
      onBudgetAlert: [],
      onFallback: []
    };
    
    this.executionMode = options.executionMode || 'progressive';
  }

  async execute(task, options = {}) {
    const executionId = `exec-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    try {
      const routing = this.taskRouter.classifyAndRoute(task, options);
      this.emit('onTaskStart', { executionId, task, routing });
      
      const result = await this.executeWithFallback(executionId, task, routing);
      
      const duration = Date.now() - startTime;
      this.costTracker.recordCost(options.budgetId || 'default', {
        executionId,
        amount: result.actualCost,
        model: result.model,
        agent: result.agent,
        taskType: routing.taskType
      });
      
      this.performanceMonitor.record({
        executionId,
        task,
        routing,
        result,
        duration,
        cost: result.actualCost
      });
      
      const finalResult = {
        executionId,
        task,
        result,
        metrics: {
          duration,
          cost: result.actualCost,
          model: result.model,
          agent: result.agent,
          qualityScore: result.qualityScore
        },
        routing,
        timestamp: Date.now()
      };
      
      this.executionHistory.push(finalResult);
      if (this.executionHistory.length > this.maxHistorySize) {
        this.executionHistory.shift();
      }
      
      this.emit('onTaskComplete', { executionId, result: finalResult });
      
      return finalResult;
      
    } catch (error) {
      this.emit('onTaskError', { executionId, task, error: error.message });
      throw error;
    }
  }

  async executeWithFallback(executionId, task, routing) {
    const fallbackChain = this.fallbackManager.getFallbackChain(routing.taskType);
    let lastError = null;
    
    for (const fallbackStep of fallbackChain) {
      try {
        const result = await this.executeTaskWithAgent(executionId, task, fallbackStep);
        
        if (result.qualityScore >= 0.7) {
          return {
            ...result,
            fallbackUsed: fallbackStep !== fallbackChain[0],
            model: fallbackStep.model,
            agent: fallbackStep.agent
          };
        }
        
        this.emit('onFallback', {
          executionId,
          reason: 'quality_threshold',
          from: fallbackStep
        });
        
      } catch (error) {
        lastError = error;
        this.emit('onFallback', {
          executionId,
          reason: 'error',
          error: error.message,
          from: fallbackStep
        });
        continue;
      }
    }
    
    throw new Error(`All fallback options exhausted. Last error: ${lastError?.message}`);
  }

  async executeTaskWithAgent(executionId, task, fallbackStep) {
    const model = this.models[fallbackStep.model];
    const agent = this.agents[fallbackStep.agent];
    
    if (!model || !agent) {
      throw new Error(`Invalid model or agent: ${fallbackStep.model}/${fallbackStep.agent}`);
    }
    
    // Simulate execution (in production, this would call actual model APIs)
    const executionTime = (10000 / (model.performance?.speed || 5)) * (0.8 + Math.random() * 0.4);
    const tokenUsage = this.estimateTokenUsage(task, agent);
    const actualCost = this.calculateCost(model, tokenUsage);
    const qualityScore = this.simulateQualityScore(model, agent, task);
    
    // Simulate async execution
    await new Promise(resolve => setTimeout(resolve, 100));
    
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

  estimateTokenUsage(task, agent) {
    const baseInput = agent.costProfile?.avgInputTokens || 2000;
    const baseOutput = agent.costProfile?.avgOutputTokens || 1500;
    const complexity = task.complexity || 5;
    
    return {
      input: Math.round(baseInput * (0.5 + complexity / 10)),
      output: Math.round(baseOutput * (0.5 + complexity / 10))
    };
  }

  calculateCost(model, tokenUsage) {
    const inputCost = (tokenUsage.input / 1000000) * (model.pricing?.inputPer1M || 0.14);
    const outputCost = (tokenUsage.output / 1000000) * (model.pricing?.outputPer1M || 0.28);
    return inputCost + outputCost;
  }

  simulateQualityScore(model, agent, task) {
    const baseQuality = (model.performance?.sweBench || 70) / 100;
    const domain = task.domain || 'general';
    const expertise = agent.expertise?.[domain] || 0.8;
    const variance = (Math.random() - 0.5) * 0.1;
    
    return Math.min(1, Math.max(0, baseQuality * expertise + variance));
  }

  setExecutionMode(mode) {
    if (mode === 'progressive' || mode === 'traditional') {
      this.executionMode = mode;
      return true;
    }
    return false;
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
    if (filters.limit) {
      history = history.slice(-filters.limit);
    }
    
    return history;
  }
}

/**
 * Integrated Agent System - Main entry point
 */
export class IntegratedAgentSystem {
  constructor(options = {}) {
    this.orchestrator = new Orchestrator(options);
    
    this.setupEventHandlers();
  }

  async execute(task, options = {}) {
    return this.orchestrator.execute(task, options);
  }

  getStatus() {
    return this.orchestrator.getStatus();
  }

  getDashboardData() {
    const costReport = this.orchestrator.costTracker.getReport();
    const perfReport = this.orchestrator.performanceMonitor.getSummary();
    const comparison = this.orchestrator.performanceMonitor.getCostComparison();
    const quality = this.orchestrator.performanceMonitor.getQualityAnalysis();
    
    return {
      currentSpending: costReport.status.totalSpent,
      totalBudget: costReport.status.totalLimit,
      budgetUtilization: costReport.status.globalUtilization / 100,
      totalExecutions: perfReport.overall.totalExecutions,
      successRate: perfReport.overall.successRate,
      avgCostPerTask: perfReport.overall.averageCost,
      costSavings: comparison.savings,
      savingsPercent: comparison.savingsPercent,
      avgDuration: perfReport.overall.averageDuration,
      avgQuality: quality.overallQuality,
      byModel: costReport.breakdowns.byModel,
      byAgent: costReport.breakdowns.byAgent,
      byTaskType: costReport.breakdowns.byTaskType,
      budgets: costReport.budgets,
      recentHistory: costReport.recentHistory,
      agentPerformance: perfReport.byAgent,
      modelPerformance: perfReport.byModel
    };
  }

  getCostReport() {
    return this.orchestrator.costTracker.getReport();
  }

  getPerformanceReport() {
    return {
      summary: this.orchestrator.performanceMonitor.getSummary(),
      quality: this.orchestrator.performanceMonitor.getQualityAnalysis(),
      comparison: this.orchestrator.performanceMonitor.getCostComparison()
    };
  }

  setupEventHandlers() {
    this.orchestrator.on('onBudgetAlert', (data) => {
      console.warn(`[BUDGET ALERT] ${data.type}:`, data);
    });
  }

  on(event, handler) {
    this.orchestrator.on(event, handler);
  }
}

export default IntegratedAgentSystem;
