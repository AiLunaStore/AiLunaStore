/**
 * Budget Manager - Tracks spending, enforces limits, and generates cost reports
 */
export class BudgetManager {
  constructor(options = {}) {
    this.options = {
      defaultLimit: options.defaultLimit || 5.00, // $5.00 default
      alerts: options.alerts || [0.5, 0.8, 0.95], // Alert at 50%, 80%, 95%
      trackHistory: options.trackHistory !== false,
      historySize: options.historySize || 1000,
      ...options
    };
    
    // Budget state
    this.budgets = new Map(); // project/task -> budget state
    this.globalSpend = 0;
    this.history = [];
    this.alertCallbacks = [];
  }

  /**
   * Initialize a budget for a project or task
   * @param {string} id - Project or task ID
   * @param {Object} config - Budget configuration
   * @returns {Object} Budget state
   */
  initBudget(id, config = {}) {
    const budget = {
      id,
      limit: config.limit || this.options.defaultLimit,
      spent: 0,
      reserved: 0, // Reserved for pending tasks
      alerts: config.alerts || this.options.alerts,
      alertTriggered: new Set(),
      createdAt: Date.now(),
      lastUpdated: Date.now(),
      tasks: new Map(),
      metadata: config.metadata || {}
    };
    
    this.budgets.set(id, budget);
    return budget;
  }

  /**
   * Get budget state
   * @param {string} id - Budget ID
   * @returns {Object|undefined} Budget state
   */
  getBudget(id) {
    return this.budgets.get(id);
  }

  /**
   * Record a cost against a budget
   * @param {string} budgetId - Budget ID
   * @param {Object} cost - Cost details
   * @returns {Object} Updated budget state
   */
  recordCost(budgetId, cost) {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      throw new Error(`Budget ${budgetId} not found. Call initBudget() first.`);
    }
    
    const { amount, taskId, agentId, description } = cost;
    
    // Update budget
    budget.spent += amount;
    budget.lastUpdated = Date.now();
    
    // Track by task
    if (taskId) {
      if (!budget.tasks.has(taskId)) {
        budget.tasks.set(taskId, { spent: 0, costs: [] });
      }
      const task = budget.tasks.get(taskId);
      task.spent += amount;
      task.costs.push({
        amount,
        agentId,
        description,
        timestamp: Date.now()
      });
    }
    
    // Update global spend
    this.globalSpend += amount;
    
    // Record in history
    if (this.options.trackHistory) {
      this.history.push({
        budgetId,
        taskId,
        agentId,
        amount,
        description,
        timestamp: Date.now()
      });
      
      // Maintain history size
      if (this.history.length > this.options.historySize) {
        this.history = this.history.slice(-this.options.historySize);
      }
    }
    
    // Check alerts
    this.checkAlerts(budget);
    
    return this.getBudgetStatus(budgetId);
  }

  /**
   * Reserve budget for a pending task
   * @param {string} budgetId - Budget ID
   * @param {string} taskId - Task ID
   * @param {number} amount - Amount to reserve
   * @returns {boolean} Whether reservation was successful
   */
  reserveBudget(budgetId, taskId, amount) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return false;
    
    const available = budget.limit - budget.spent - budget.reserved;
    
    if (amount > available) {
      return false; // Insufficient budget
    }
    
    budget.reserved += amount;
    
    if (!budget.tasks.has(taskId)) {
      budget.tasks.set(taskId, { spent: 0, reserved: 0, costs: [] });
    }
    budget.tasks.get(taskId).reserved = amount;
    
    return true;
  }

  /**
   * Release reserved budget
   * @param {string} budgetId - Budget ID
   * @param {string} taskId - Task ID
   * @param {number} amount - Amount to release (or all if not specified)
   */
  releaseReservation(budgetId, taskId, amount = null) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return;
    
    const task = budget.tasks.get(taskId);
    if (!task) return;
    
    const releaseAmount = amount !== null ? amount : task.reserved;
    budget.reserved -= releaseAmount;
    task.reserved -= releaseAmount;
  }

  /**
   * Check and trigger budget alerts
   * @param {Object} budget - Budget state
   */
  checkAlerts(budget) {
    const utilization = budget.spent / budget.limit;
    
    for (const threshold of budget.alerts) {
      if (utilization >= threshold && !budget.alertTriggered.has(threshold)) {
        budget.alertTriggered.add(threshold);
        
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
        
        // Call registered callbacks
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
   * Register an alert callback
   * @param {Function} callback - Callback function for alerts
   */
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  /**
   * Get budget status
   * @param {string} budgetId - Budget ID
   * @returns {Object} Budget status
   */
  getBudgetStatus(budgetId) {
    const budget = this.budgets.get(budgetId);
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
      taskCount: budget.tasks.size,
      createdAt: budget.createdAt,
      lastUpdated: budget.lastUpdated
    };
  }

  /**
   * Get all budget statuses
   * @returns {Object[]} Array of budget statuses
   */
  getAllBudgets() {
    return Array.from(this.budgets.keys()).map(id => this.getBudgetStatus(id));
  }

  /**
   * Check if a task can be afforded within budget
   * @param {string} budgetId - Budget ID
   * @param {number} estimatedCost - Estimated cost
   * @returns {Object} Affordability check result
   */
  canAfford(budgetId, estimatedCost) {
    const budget = this.budgets.get(budgetId);
    if (!budget) {
      return { affordable: false, reason: 'Budget not found' };
    }
    
    const available = budget.limit - budget.spent - budget.reserved;
    
    if (estimatedCost <= available) {
      return {
        affordable: true,
        available,
        estimatedCost,
        remainingAfter: available - estimatedCost
      };
    }
    
    return {
      affordable: false,
      reason: 'Insufficient budget',
      available,
      estimatedCost,
      shortfall: estimatedCost - available
    };
  }

  /**
   * Get spending report for a budget
   * @param {string} budgetId - Budget ID
   * @returns {Object} Spending report
   */
  getSpendingReport(budgetId) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;
    
    // Aggregate by agent
    const byAgent = {};
    for (const task of budget.tasks.values()) {
      for (const cost of task.costs) {
        if (!byAgent[cost.agentId]) {
          byAgent[cost.agentId] = { total: 0, count: 0 };
        }
        byAgent[cost.agentId].total += cost.amount;
        byAgent[cost.agentId].count++;
      }
    }
    
    // Calculate averages
    for (const agentId in byAgent) {
      byAgent[agentId].average = byAgent[agentId].total / byAgent[agentId].count;
    }
    
    // Task breakdown
    const taskBreakdown = Array.from(budget.tasks.entries()).map(([taskId, task]) => ({
      taskId,
      spent: task.spent,
      reserved: task.reserved || 0,
      costCount: task.costs.length
    }));
    
    return {
      budgetId,
      summary: this.getBudgetStatus(budgetId),
      byAgent,
      taskBreakdown,
      totalTasks: budget.tasks.size
    };
  }

  /**
   * Generate cost efficiency report
   * @param {string} budgetId - Budget ID (optional, all if not specified)
   * @returns {Object} Efficiency report
   */
  getEfficiencyReport(budgetId = null) {
    const budgets = budgetId ? [this.budgets.get(budgetId)].filter(Boolean) : 
                               Array.from(this.budgets.values());
    
    let totalSpent = 0;
    let totalLimit = 0;
    let totalTasks = 0;
    
    for (const budget of budgets) {
      totalSpent += budget.spent;
      totalLimit += budget.limit;
      totalTasks += budget.tasks.size;
    }
    
    const globalUtilization = totalLimit > 0 ? totalSpent / totalLimit : 0;
    
    // Calculate cost per task
    const costPerTask = totalTasks > 0 ? totalSpent / totalTasks : 0;
    
    return {
      summary: {
        totalBudgets: budgets.length,
        totalSpent,
        totalLimit,
        totalRemaining: totalLimit - totalSpent,
        globalUtilization: globalUtilization * 100,
        totalTasks,
        costPerTask
      },
      budgets: budgets.map(b => this.getBudgetStatus(b.id)),
      recommendations: this.generateRecommendations(budgets)
    };
  }

  /**
   * Generate optimization recommendations
   * @param {Object[]} budgets - Budget states
   * @returns {Object[]} Recommendations
   */
  generateRecommendations(budgets) {
    const recommendations = [];
    
    // Check for over-budget projects
    const overBudget = budgets.filter(b => b.spent > b.limit);
    if (overBudget.length > 0) {
      recommendations.push({
        type: 'over-budget',
        severity: 'critical',
        message: `${overBudget.length} budget(s) are over limit`,
        budgets: overBudget.map(b => b.id)
      });
    }
    
    // Check for near-limit budgets
    const nearLimit = budgets.filter(b => {
      const utilization = b.spent / b.limit;
      return utilization >= 0.9 && utilization <= 1.0;
    });
    if (nearLimit.length > 0) {
      recommendations.push({
        type: 'near-limit',
        severity: 'warning',
        message: `${nearLimit.length} budget(s) are near limit (>90%)`,
        budgets: nearLimit.map(b => b.id)
      });
    }
    
    // Check for underutilized budgets
    const underutilized = budgets.filter(b => {
      const utilization = b.spent / b.limit;
      return utilization < 0.3 && b.tasks.size > 5;
    });
    if (underutilized.length > 0) {
      recommendations.push({
        type: 'underutilized',
        severity: 'info',
        message: `${underutilized.length} budget(s) may be over-allocated`,
        budgets: underutilized.map(b => b.id)
      });
    }
    
    return recommendations;
  }

  /**
   * Get spending history
   * @param {Object} filters - Filter options
   * @returns {Object[]} Spending records
   */
  getHistory(filters = {}) {
    let records = this.history;
    
    if (filters.budgetId) {
      records = records.filter(r => r.budgetId === filters.budgetId);
    }
    
    if (filters.taskId) {
      records = records.filter(r => r.taskId === filters.taskId);
    }
    
    if (filters.agentId) {
      records = records.filter(r => r.agentId === filters.agentId);
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
   * Adjust budget limit
   * @param {string} budgetId - Budget ID
   * @param {number} newLimit - New limit
   * @returns {Object} Updated budget status
   */
  adjustLimit(budgetId, newLimit) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return null;
    
    budget.limit = newLimit;
    budget.lastUpdated = Date.now();
    
    // Re-check alerts
    budget.alertTriggered.clear();
    this.checkAlerts(budget);
    
    return this.getBudgetStatus(budgetId);
  }

  /**
   * Reset a budget (clear spending but keep limit)
   * @param {string} budgetId - Budget ID
   */
  resetBudget(budgetId) {
    const budget = this.budgets.get(budgetId);
    if (!budget) return;
    
    budget.spent = 0;
    budget.reserved = 0;
    budget.alertTriggered.clear();
    budget.tasks.clear();
    budget.lastUpdated = Date.now();
  }

  /**
   * Delete a budget
   * @param {string} budgetId - Budget ID
   */
  deleteBudget(budgetId) {
    this.budgets.delete(budgetId);
  }

  /**
   * Get global spending summary
   * @returns {Object} Global summary
   */
  getGlobalSummary() {
    const budgets = Array.from(this.budgets.values());
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
      globalSpend: this.globalSpend
    };
  }
}