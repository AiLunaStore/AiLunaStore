/**
 * Cost Tracker - Real-time spending tracking and budget management
 */
export class CostTracker {
  constructor(options = {}) {
    this.defaultBudget = options.defaultBudget || 10.00;
    this.alertThresholds = options.alertThresholds || [0.5, 0.8, 0.95];
    this.trackHistory = options.trackHistory !== false;
    this.maxHistorySize = options.maxHistorySize || 10000;
    
    // Budget storage
    this.budgets = new Map();
    this.globalSpend = 0;
    this.history = [];
    this.reservations = new Map();
    
    // Alert callbacks
    this.alertCallbacks = [];
    
    // Initialize default budget
    this.initBudget('default', { limit: this.defaultBudget });
  }

  /**
   * Initialize a budget
   */
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

  /**
   * Get budget status
   */
  getBudget(id = 'default') {
    return this.budgets.get(id);
  }

  /**
   * Get remaining budget
   */
  getRemainingBudget(id = 'default') {
    const budget = this.budgets.get(id);
    if (!budget) return 0;
    return budget.limit - budget.spent - budget.reserved;
  }

  /**
   * Check if a cost can be afforded
   */
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

  /**
   * Reserve budget for an execution
   */
  reserveBudget(executionId, amount) {
    this.reservations.set(executionId, {
      id: executionId,
      amount,
      reservedAt: Date.now()
    });
    
    // Add to default budget reserved amount
    const budget = this.budgets.get('default');
    if (budget) {
      budget.reserved += amount;
    }
    
    return true;
  }

  /**
   * Release reserved budget
   */
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

  /**
   * Record an actual cost
   */
  recordCost(budgetId, costRecord) {
    const budget = this.budgets.get(budgetId || 'default');
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found`);
    }
    
    const { executionId, amount, model, agent, taskType } = costRecord;
    
    // Update budget
    budget.spent += amount;
    budget.lastUpdated = Date.now();
    
    // Release reservation
    this.releaseReservation(executionId, amount);
    
    // Update global spend
    this.globalSpend += amount;
    
    // Add to history
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
      
      // Trim history if needed
      if (this.history.length > this.maxHistorySize) {
        this.history = this.history.slice(-this.maxHistorySize);
      }
    }
    
    // Check alerts
    this.checkAlerts(budget);
    
    return this.getBudgetStatus(budget.id);
  }

  /**
   * Check and trigger budget alerts
   */
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
          message: `Budget ${budget.id} at ${(utilization * 100).toFixed(1)}% ($${budget.spent.toFixed(4)} / $${budget.limit.toFixed(2)})`,
          timestamp: Date.now()
        };
        
        // Notify callbacks
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

  /**
   * Register alert callback
   */
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get budget status
   */
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
      isNearLimit: utilization >= 0.9,
      createdAt: budget.createdAt,
      lastUpdated: budget.lastUpdated
    };
  }

  /**
   * Get all budget statuses
   */
  getAllBudgets() {
    return Array.from(this.budgets.keys()).map(id => this.getBudgetStatus(id));
  }

  /**
   * Get spending history
   */
  getHistory(filters = {}) {
    let records = [...this.history];
    
    if (filters.budgetId) {
      records = records.filter(r => r.budgetId === filters.budgetId);
    }
    
    if (filters.model) {
      records = records.filter(r => r.model === filters.model);
    }
    
    if (filters.agent) {
      records = records.filter(r => r.agent === filters.agent);
    }
    
    if (filters.taskType) {
      records = records.filter(r => r.taskType === filters.taskType);
    }
    
    if (filters.since) {
      records = records.filter(r => r.timestamp >= filters.since);
    }
    
    if (filters.limit) {
      records = records.slice(-filters.limit);
    }
    
    return records;
  }

  /**
   * Get cost breakdown by dimension
   */
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
    
    // Calculate averages
    for (const key in breakdown) {
      breakdown[key].average = breakdown[key].total / breakdown[key].count;
    }
    
    return breakdown;
  }

  /**
   * Get system status
   */
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

  /**
   * Get cost report
   */
  getReport() {
    const status = this.getStatus();
    const modelBreakdown = this.getBreakdown('model');
    const agentBreakdown = this.getBreakdown('agent');
    const taskTypeBreakdown = this.getBreakdown('taskType');
    
    return {
      status,
      breakdowns: {
        byModel: modelBreakdown,
        byAgent: agentBreakdown,
        byTaskType: taskTypeBreakdown
      },
      budgets: this.getAllBudgets(),
      recentHistory: this.getHistory({ limit: 50 })
    };
  }

  /**
   * Adjust budget limit
   */
  adjustBudget(id, newLimit) {
    const budget = this.budgets.get(id);
    if (!budget) return null;
    
    budget.limit = newLimit;
    budget.lastUpdated = Date.now();
    budget.alertsTriggered.clear();
    
    return this.getBudgetStatus(id);
  }

  /**
   * Reset budget
   */
  resetBudget(id) {
    const budget = this.budgets.get(id);
    if (!budget) return;
    
    budget.spent = 0;
    budget.reserved = 0;
    budget.alertsTriggered.clear();
    budget.lastUpdated = Date.now();
  }

  /**
   * Delete budget
   */
  deleteBudget(id) {
    this.budgets.delete(id);
  }
}

export default CostTracker;
