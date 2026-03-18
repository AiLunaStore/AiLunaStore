/**
 * Cost Optimization Engine - Selects optimal agents based on quality/cost ratio
 */
export class OptimizationEngine {
  constructor(options = {}) {
    this.options = {
      defaultStrategy: options.defaultStrategy || 'balanced',
      qualityWeight: options.qualityWeight || 0.5,
      costWeight: options.costWeight || 0.5,
      speedWeight: options.speedWeight || 0.0,
      ...options
    };
    
    // Ensure weights sum to 1
    const totalWeight = this.options.qualityWeight + this.options.costWeight + this.options.speedWeight;
    if (totalWeight !== 1.0) {
      this.options.qualityWeight /= totalWeight;
      this.options.costWeight /= totalWeight;
      this.options.speedWeight /= totalWeight;
    }
  }

  /**
   * Select the optimal agent for a task
   * @param {Object} params - Selection parameters
   * @returns {Object} Selection result with agent and rationale
   */
  selectOptimalAgent(params) {
    const { task, budget, qualityRequired = 0, speedRequired = 0, agentRegistry, strategy } = params;
    
    const selectionStrategy = strategy || this.options.defaultStrategy;
    
    // Get candidate agents for the task domain
    const domain = this.inferDomain(task);
    const candidates = agentRegistry.findByDomain(domain);
    
    if (candidates.length === 0) {
      return {
        agent: null,
        rationale: 'No agents available for this domain',
        fallback: true
      };
    }
    
    // Filter by constraints
    const qualified = candidates.filter(({ agent }) => {
      if (qualityRequired > 0 && agent.quality < qualityRequired) return false;
      if (speedRequired > 0 && agent.speed < speedRequired) return false;
      if (budget && agent.costProfile?.estimatedCostPerTask > budget) return false;
      return true;
    });
    
    if (qualified.length === 0) {
      // No agents meet constraints - return best available with warning
      const bestAvailable = candidates[0];
      return {
        agent: bestAvailable.agent,
        rationale: `No agents meet constraints (budget: $${budget}, quality: ${qualityRequired}). Using best available.`,
        constraintViolation: true,
        estimatedCost: bestAvailable.agent.costProfile?.estimatedCostPerTask || 0
      };
    }
    
    // Score each candidate based on strategy
    const scored = qualified.map(({ agent, expertise }) => {
      const score = this.scoreAgent(agent, expertise, selectionStrategy, budget);
      return { agent, expertise, score };
    });
    
    // Sort by score descending
    scored.sort((a, b) => b.score - a.score);
    
    const winner = scored[0];
    
    return {
      agent: winner.agent,
      expertise: winner.expertise,
      score: winner.score,
      rationale: this.generateRationale(winner, selectionStrategy, budget),
      alternatives: scored.slice(1, 4).map(s => ({
        agentId: s.agent.id,
        name: s.agent.name,
        score: s.score,
        quality: s.agent.quality,
        cost: s.agent.costProfile?.estimatedCostPerTask
      })),
      estimatedCost: winner.agent.costProfile?.estimatedCostPerTask || 0,
      qualityCostRatio: winner.agent.qualityCostRatio || 0
    };
  }

  /**
   * Score an agent based on the selection strategy
   * @param {Object} agent - Agent to score
   * @param {number} expertise - Expertise level in domain
   * @param {string} strategy - Selection strategy
   * @param {number} budget - Budget constraint
   * @returns {number} Score
   */
  scoreAgent(agent, expertise, strategy, budget) {
    const cost = agent.costProfile?.estimatedCostPerTask || 0.01;
    
    switch (strategy) {
      case 'cheapest':
        // Lower cost is better
        return 1 / (cost + 0.001);
        
      case 'highest-quality':
        // Higher quality is better
        return agent.quality * expertise;
        
      case 'fastest':
        // Higher speed is better
        return agent.speed;
        
      case 'quality-per-dollar':
        // Maximize quality per dollar
        return (agent.quality * expertise) / cost;
        
      case 'balanced':
      default:
        // Weighted combination of quality, cost, and speed
        const qualityScore = (agent.quality / 10) * expertise;
        const costScore = budget ? (1 - (cost / budget)) : 0.5;
        const speedScore = agent.speed / 10;
        
        return (
          this.options.qualityWeight * qualityScore +
          this.options.costWeight * costScore +
          this.options.speedWeight * speedScore
        );
    }
  }

  /**
   * Generate rationale for agent selection
   * @param {Object} selection - Selected agent with score
   * @param {string} strategy - Selection strategy
   * @param {number} budget - Budget constraint
   * @returns {string} Human-readable rationale
   */
  generateRationale(selection, strategy, budget) {
    const { agent, score } = selection;
    const cost = agent.costProfile?.estimatedCostPerTask || 0;
    
    const parts = [];
    
    switch (strategy) {
      case 'cheapest':
        parts.push(`Selected ${agent.name} as the cheapest option ($${cost.toFixed(4)})`);
        break;
      case 'highest-quality':
        parts.push(`Selected ${agent.name} for highest quality (score: ${agent.quality}/10)`);
        break;
      case 'fastest':
        parts.push(`Selected ${agent.name} for fastest execution (speed: ${agent.speed}/10)`);
        break;
      case 'quality-per-dollar':
        parts.push(`Selected ${agent.name} for best quality/cost ratio (${agent.qualityCostRatio?.toFixed(2) || 'N/A'})`);
        break;
      case 'balanced':
      default:
        parts.push(`Selected ${agent.name} with balanced score ${score.toFixed(3)}`);
        parts.push(`(Quality: ${agent.quality}/10, Cost: $${cost.toFixed(4)}, Speed: ${agent.speed}/10)`);
    }
    
    if (budget) {
      const withinBudget = cost <= budget ? 'within' : 'exceeds';
      parts.push(`Cost ${withinBudget} budget ($${budget.toFixed(2)})`);
    }
    
    return parts.join('. ');
  }

  /**
   * Create a fallback chain for task execution
   * @param {Object} params - Chain parameters
   * @returns {Object[]} Ordered list of agents to try
   */
  createFallbackChain(params) {
    const { task, agentRegistry, strategy = 'cheap-to-expensive', maxAgents = 3 } = params;
    
    const domain = this.inferDomain(task);
    const candidates = agentRegistry.findByDomain(domain);
    
    if (candidates.length === 0) {
      return [];
    }
    
    // Sort based on strategy
    let sorted;
    switch (strategy) {
      case 'cheap-to-expensive':
        sorted = candidates.sort((a, b) => {
          const costA = a.agent.costProfile?.estimatedCostPerTask || Infinity;
          const costB = b.agent.costProfile?.estimatedCostPerTask || Infinity;
          return costA - costB;
        });
        break;
        
      case 'fast-to-slow':
        sorted = candidates.sort((a, b) => b.agent.speed - a.agent.speed);
        break;
        
      case 'quality-descending':
        sorted = candidates.sort((a, b) => b.agent.quality - a.agent.quality);
        break;
        
      case 'balanced':
      default:
        // Sort by quality/cost ratio
        sorted = candidates.sort((a, b) => {
          const ratioA = a.agent.qualityCostRatio || 0;
          const ratioB = b.agent.qualityCostRatio || 0;
          return ratioB - ratioA;
        });
    }
    
    // Return top N agents
    return sorted.slice(0, maxAgents).map(({ agent, expertise }) => ({
      id: agent.id,
      name: agent.name,
      model: agent.model,
      quality: agent.quality,
      speed: agent.speed,
      estimatedCost: agent.costProfile?.estimatedCostPerTask || 0,
      expertise,
      rationale: this.getChainRationale(agent, strategy)
    }));
  }

  /**
   * Get rationale for chain position
   * @param {Object} agent - Agent
   * @param {string} strategy - Chain strategy
   * @returns {string} Rationale
   */
  getChainRationale(agent, strategy) {
    switch (strategy) {
      case 'cheap-to-expensive':
        return `Cheapest option at $${agent.costProfile?.estimatedCostPerTask?.toFixed(4) || 'N/A'}`;
      case 'fast-to-slow':
        return `Fastest option with speed ${agent.speed}/10`;
      case 'quality-descending':
        return `Highest quality at ${agent.quality}/10`;
      case 'balanced':
      default:
        return `Best value with quality/cost ratio ${agent.qualityCostRatio?.toFixed(2) || 'N/A'}`;
    }
  }

  /**
   * Optimize task assignments for a set of subtasks
   * @param {Object} params - Optimization parameters
   * @returns {Object} Optimized assignments
   */
  optimizeAssignments(params) {
    const { subtasks, budget, minQuality, agentRegistry, strategy } = params;
    
    const assignments = [];
    let remainingBudget = budget;
    let totalCost = 0;
    
    for (const subtask of subtasks) {
      // Calculate per-subtask budget
      const subtaskBudget = remainingBudget ? 
        remainingBudget / (subtasks.length - assignments.length) : 
        undefined;
      
      const selection = this.selectOptimalAgent({
        task: subtask,
        budget: subtaskBudget,
        qualityRequired: minQuality,
        agentRegistry,
        strategy
      });
      
      if (selection.agent) {
        assignments.push({
          subtask,
          agent: selection.agent,
          selection
        });
        
        const cost = selection.estimatedCost;
        totalCost += cost;
        
        if (remainingBudget) {
          remainingBudget -= cost;
        }
      }
    }
    
    return {
      assignments,
      totalCost,
      remainingBudget: remainingBudget || 0,
      withinBudget: !budget || totalCost <= budget,
      strategy
    };
  }

  /**
   * Infer domain from task
   * @param {Object} task - Task object
   * @returns {string} Domain
   */
  inferDomain(task) {
    const description = task.description?.toLowerCase() || '';
    
    if (description.includes('ui') || description.includes('frontend') || description.includes('css') || description.includes('html')) {
      return 'ui';
    }
    if (description.includes('api') || description.includes('backend') || description.includes('server')) {
      return 'backend';
    }
    if (description.includes('database') || description.includes('sql') || description.includes('query')) {
      return 'database';
    }
    if (description.includes('network') || description.includes('cors') || description.includes('connection')) {
      return 'network';
    }
    if (description.includes('integrate') || description.includes('test')) {
      return 'integration';
    }
    if (description.includes('debug') || description.includes('error') || description.includes('fix')) {
      return 'debugging';
    }
    
    return task.domain || 'debugging';
  }

  /**
   * Compare different strategies for a task
   * @param {Object} params - Comparison parameters
   * @returns {Object} Comparison results
   */
  compareStrategies(params) {
    const { task, budget, agentRegistry } = params;
    
    const strategies = ['cheapest', 'highest-quality', 'fastest', 'quality-per-dollar', 'balanced'];
    const results = [];
    
    for (const strategy of strategies) {
      const selection = this.selectOptimalAgent({
        task,
        budget,
        agentRegistry,
        strategy
      });
      
      results.push({
        strategy,
        agentId: selection.agent?.id,
        agentName: selection.agent?.name,
        quality: selection.agent?.quality,
        speed: selection.agent?.speed,
        estimatedCost: selection.estimatedCost,
        qualityCostRatio: selection.qualityCostRatio,
        rationale: selection.rationale,
        constraintViolation: selection.constraintViolation || false
      });
    }
    
    return results;
  }

  /**
   * Get optimization recommendations
   * @param {Object} params - Recommendation parameters
   * @returns {Object[]} Recommendations
   */
  getRecommendations(params) {
    const { task, budget, agentRegistry, currentSpend = 0 } = params;
    
    const recommendations = [];
    const remainingBudget = budget ? budget - currentSpend : undefined;
    
    // Check if budget is tight
    if (remainingBudget !== undefined && remainingBudget < 1.0) {
      recommendations.push({
        type: 'budget-warning',
        message: `Budget is tight ($${remainingBudget.toFixed(2)} remaining). Consider using cheaper agents.`,
        severity: 'warning'
      });
    }
    
    // Get optimal selection for different strategies
    const strategies = this.compareStrategies({ task, budget: remainingBudget, agentRegistry });
    
    // Find best value option
    const bestValue = strategies.reduce((best, current) => 
      (current.qualityCostRatio || 0) > (best.qualityCostRatio || 0) ? current : best
    );
    
    recommendations.push({
      type: 'best-value',
      message: `Best value: ${bestValue.agentName} using '${bestValue.strategy}' strategy`,
      details: bestValue,
      severity: 'info'
    });
    
    // Check for significant cost differences
    const costs = strategies.map(s => s.estimatedCost).filter(c => c > 0);
    const minCost = Math.min(...costs);
    const maxCost = Math.max(...costs);
    
    if (maxCost > minCost * 3) {
      recommendations.push({
        type: 'cost-variance',
        message: `Large cost variance (${(maxCost/minCost).toFixed(1)}x). Cheapest: $${minCost.toFixed(4)}, Most expensive: $${maxCost.toFixed(4)}`,
        severity: 'info'
      });
    }
    
    return recommendations;
  }
}