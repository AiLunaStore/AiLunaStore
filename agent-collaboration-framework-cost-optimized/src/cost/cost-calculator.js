/**
 * Cost Calculator - Token estimation and cost prediction for tasks
 */
export class CostCalculator {
  constructor(options = {}) {
    this.options = {
      defaultInputTokens: options.defaultInputTokens || 2000,
      defaultOutputTokens: options.defaultOutputTokens || 1500,
      estimationConfidence: options.estimationConfidence || 0.8,
      ...options
    };
    
    // Token estimates by task type (based on historical data)
    this.taskTypeEstimates = {
      'debugging': { input: 3000, output: 2000, multiplier: 1.2 },
      'ui-analysis': { input: 2500, output: 1500, multiplier: 1.0 },
      'api-analysis': { input: 3000, output: 2000, multiplier: 1.1 },
      'db-analysis': { input: 3500, output: 2500, multiplier: 1.2 },
      'network-analysis': { input: 2000, output: 1200, multiplier: 0.9 },
      'integration': { input: 2500, output: 1800, multiplier: 1.0 },
      'diagnose': { input: 4000, output: 3000, multiplier: 1.5 },
      'analyze': { input: 2500, output: 1500, multiplier: 1.0 },
      'execute': { input: 2000, output: 1500, multiplier: 1.0 },
      'integrate': { input: 3000, output: 2500, multiplier: 1.2 }
    };
    
    // Context size multipliers
    this.contextMultipliers = {
      'small': 0.7,    // < 500 chars context
      'medium': 1.0,   // 500-2000 chars
      'large': 1.5,    // 2000-5000 chars
      'xlarge': 2.0    // > 5000 chars
    };
    
    // Complexity multipliers
    this.complexityMultipliers = {
      1: 0.5, 2: 0.6, 3: 0.7, 4: 0.8, 5: 1.0,
      6: 1.2, 7: 1.4, 8: 1.6, 9: 1.8, 10: 2.0
    };
  }

  /**
   * Estimate tokens for a task based on type and context
   * @param {Object} params - Estimation parameters
   * @returns {Object} Token estimate
   */
  estimateTokens(params) {
    const { taskType, complexity = 5, contextSize = 'medium', customInput, customOutput } = params;
    
    // Get base estimate for task type
    const baseEstimate = this.taskTypeEstimates[taskType] || 
                        this.taskTypeEstimates['execute'];
    
    // Apply multipliers
    const contextMultiplier = this.contextMultipliers[contextSize] || 1.0;
    const complexityMultiplier = this.complexityMultipliers[complexity] || 1.0;
    const totalMultiplier = contextMultiplier * complexityMultiplier * baseEstimate.multiplier;
    
    const input = customInput || Math.round(baseEstimate.input * totalMultiplier);
    const output = customOutput || Math.round(baseEstimate.output * totalMultiplier);
    
    return {
      input,
      output,
      total: input + output,
      confidence: this.calculateConfidence(taskType, contextSize, complexity),
      breakdown: {
        baseInput: baseEstimate.input,
        baseOutput: baseEstimate.output,
        contextMultiplier,
        complexityMultiplier,
        taskMultiplier: baseEstimate.multiplier
      }
    };
  }

  /**
   * Calculate confidence level for an estimate
   * @param {string} taskType - Type of task
   * @param {string} contextSize - Size of context
   * @param {number} complexity - Complexity score
   * @returns {number} Confidence score (0-1)
   */
  calculateConfidence(taskType, contextSize, complexity) {
    let confidence = this.options.estimationConfidence;
    
    // Reduce confidence for unknown task types
    if (!this.taskTypeEstimates[taskType]) {
      confidence -= 0.2;
    }
    
    // Reduce confidence for very large contexts
    if (contextSize === 'xlarge') {
      confidence -= 0.1;
    }
    
    // Reduce confidence for high complexity
    if (complexity > 7) {
      confidence -= 0.1;
    }
    
    return Math.max(0.5, confidence);
  }

  /**
   * Predict cost for a task with a specific agent
   * @param {Object} params - Prediction parameters
   * @returns {Object} Cost prediction
   */
  predictCost(params) {
    const { task, agentId, agentRegistry, taskType } = params;
    
    // Determine task type from task or subtask
    const type = taskType || this.inferTaskType(task);
    
    // Get complexity from task analysis or estimate
    const complexity = task.analysis?.complexity || 5;
    
    // Determine context size
    const contextSize = this.estimateContextSize(task);
    
    // Get token estimate
    const tokenEstimate = this.estimateTokens({
      taskType: type,
      complexity,
      contextSize
    });
    
    // Get agent cost estimate
    const agentCost = agentRegistry.getCostEstimate(agentId, tokenEstimate);
    
    if (!agentCost) {
      return {
        error: `Agent ${agentId} not found`,
        estimatedCost: 0,
        confidence: 0
      };
    }
    
    // Calculate range (±20% for uncertainty)
    const uncertainty = 0.2;
    const minCost = agentCost.total * (1 - uncertainty);
    const maxCost = agentCost.total * (1 + uncertainty);
    
    return {
      estimatedCost: agentCost.total,
      minCost,
      maxCost,
      confidence: tokenEstimate.confidence * agentCost.confidence,
      tokenEstimate,
      agentCost,
      range: `$${minCost.toFixed(4)} - $${maxCost.toFixed(4)}`
    };
  }

  /**
   * Predict costs for multiple agents
   * @param {Object} params - Prediction parameters
   * @returns {Object[]} Cost predictions for each agent
   */
  predictCostsForAgents(params) {
    const { task, agentIds, agentRegistry } = params;
    
    return agentIds.map(agentId => {
      const prediction = this.predictCost({ task, agentId, agentRegistry });
      return {
        agentId,
        ...prediction
      };
    }).sort((a, b) => a.estimatedCost - b.estimatedCost);
  }

  /**
   * Infer task type from task description
   * @param {Object} task - Task object
   * @returns {string} Task type
   */
  inferTaskType(task) {
    const description = task.description?.toLowerCase() || '';
    
    if (description.includes('debug') || description.includes('fix') || description.includes('error')) {
      return 'debugging';
    }
    if (description.includes('ui') || description.includes('frontend') || description.includes('css')) {
      return 'ui-analysis';
    }
    if (description.includes('api') || description.includes('backend') || description.includes('server')) {
      return 'api-analysis';
    }
    if (description.includes('database') || description.includes('sql') || description.includes('query')) {
      return 'db-analysis';
    }
    if (description.includes('network') || description.includes('cors') || description.includes('connection')) {
      return 'network-analysis';
    }
    if (description.includes('integrate') || description.includes('combine') || description.includes('merge')) {
      return 'integration';
    }
    if (description.includes('analyze') || description.includes('review')) {
      return 'analyze';
    }
    
    return 'execute';
  }

  /**
   * Estimate context size from task
   * @param {Object} task - Task object
   * @returns {string} Context size category
   */
  estimateContextSize(task) {
    const context = task.context || {};
    let totalLength = 0;
    
    // Sum up all string values in context
    for (const value of Object.values(context)) {
      if (typeof value === 'string') {
        totalLength += value.length;
      } else if (Array.isArray(value)) {
        totalLength += JSON.stringify(value).length;
      } else if (typeof value === 'object') {
        totalLength += JSON.stringify(value).length;
      }
    }
    
    if (totalLength < 500) return 'small';
    if (totalLength < 2000) return 'medium';
    if (totalLength < 5000) return 'large';
    return 'xlarge';
  }

  /**
   * Calculate total estimated cost for a set of subtasks
   * @param {Object[]} assignments - Subtask assignments with agents
   * @returns {Object} Total cost estimate
   */
  calculateTotalCost(assignments) {
    let totalMin = 0;
    let totalMax = 0;
    let totalExpected = 0;
    let totalConfidence = 0;
    
    const byAgent = {};
    
    for (const assignment of assignments) {
      const cost = assignment.costEstimate;
      if (!cost) continue;
      
      const uncertainty = 0.2;
      const min = cost.total * (1 - uncertainty);
      const max = cost.total * (1 + uncertainty);
      
      totalMin += min;
      totalMax += max;
      totalExpected += cost.total;
      totalConfidence += cost.confidence || 0.8;
      
      // Track by agent
      const agentId = assignment.agent?.id;
      if (agentId) {
        if (!byAgent[agentId]) {
          byAgent[agentId] = {
            agentName: assignment.agent.name,
            count: 0,
            totalCost: 0
          };
        }
        byAgent[agentId].count++;
        byAgent[agentId].totalCost += cost.total;
      }
    }
    
    const avgConfidence = assignments.length > 0 ? totalConfidence / assignments.length : 0;
    
    return {
      min: totalMin,
      max: totalMax,
      expected: totalExpected,
      confidence: avgConfidence,
      range: `$${totalMin.toFixed(4)} - $${totalMax.toFixed(4)}`,
      byAgent
    };
  }

  /**
   * Calculate quality/cost ratio for an assignment
   * @param {Object} assignment - Assignment with agent and cost
   * @returns {number} Quality per dollar
   */
  calculateQualityPerDollar(assignment) {
    const quality = assignment.agent?.quality || 5;
    const cost = assignment.costEstimate?.total || 0.01;
    return quality / cost;
  }

  /**
   * Compare cost efficiency of different agent combinations
   * @param {Object[]} options - Array of assignment options
   * @returns {Object[]} Options sorted by efficiency
   */
  compareEfficiency(options) {
    return options.map(option => {
      const totalCost = option.assignments.reduce(
        (sum, a) => sum + (a.costEstimate?.total || 0), 0
      );
      const avgQuality = option.assignments.reduce(
        (sum, a) => sum + (a.agent?.quality || 5), 0
      ) / option.assignments.length;
      const qualityPerDollar = avgQuality / (totalCost || 0.01);
      
      return {
        ...option,
        totalCost,
        avgQuality,
        qualityPerDollar,
        efficiency: qualityPerDollar
      };
    }).sort((a, b) => b.efficiency - a.efficiency);
  }

  /**
   * Estimate tokens from actual text
   * @param {string} text - Text to estimate
   * @returns {number} Estimated token count
   */
  estimateTokensFromText(text) {
    // Rough approximation: ~4 characters per token for English
    return Math.ceil(text.length / 4);
  }

  /**
   * Calculate actual cost from token usage
   * @param {Object} tokenUsage - Actual token usage
   * @param {Object} pricing - Pricing per 1M tokens
   * @returns {Object} Actual cost
   */
  calculateActualCost(tokenUsage, pricing) {
    const inputCost = (tokenUsage.input / 1000000) * pricing.input;
    const outputCost = (tokenUsage.output / 1000000) * pricing.output;
    
    return {
      input: inputCost,
      output: outputCost,
      total: inputCost + outputCost,
      inputTokens: tokenUsage.input,
      outputTokens: tokenUsage.output
    };
  }

  /**
   * Get cost savings from optimization
   * @param {number} optimizedCost - Cost with optimization
   * @param {number} naiveCost - Cost without optimization (e.g., always using most expensive)
   * @returns {Object} Savings metrics
   */
  calculateSavings(optimizedCost, naiveCost) {
    const absoluteSavings = naiveCost - optimizedCost;
    const percentageSavings = naiveCost > 0 ? (absoluteSavings / naiveCost) * 100 : 0;
    
    return {
      absolute: absoluteSavings,
      percentage: percentageSavings,
      optimizedCost,
      naiveCost,
      summary: `Saved $${absoluteSavings.toFixed(4)} (${percentageSavings.toFixed(1)}%)`
    };
  }
}