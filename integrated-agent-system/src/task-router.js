import modelsConfig from '../config/models.json' assert { type: 'json' };
import agentsConfig from '../config/agents.json' assert { type: 'json' };
import strategiesConfig from '../config/strategies.json' assert { type: 'json' };

/**
 * Task Router - Classifies tasks and routes them to optimal agent+model combinations
 */
export class TaskRouter {
  constructor(options = {}) {
    this.models = options.models || modelsConfig.models;
    this.agents = options.agents || agentsConfig.agents;
    this.strategies = options.strategies || strategiesConfig.strategies;
    this.defaultStrategy = options.defaultStrategy || strategiesConfig.defaultStrategy;
    
    // Task classification patterns
    this.classificationPatterns = {
      coding: {
        keywords: ['code', 'implement', 'debug', 'fix', 'refactor', 'function', 'class', 'method', 'api', 'endpoint'],
        fileExtensions: ['.js', '.ts', '.py', '.java', '.cpp', '.go', '.rs'],
        minConfidence: 0.6
      },
      research: {
        keywords: ['research', 'find', 'search', 'analyze', 'compare', 'investigate', 'look up', 'documentation'],
        minConfidence: 0.5
      },
      planning: {
        keywords: ['plan', 'design', 'architecture', 'strategy', 'roadmap', 'structure', 'organize'],
        minConfidence: 0.6
      },
      ui: {
        keywords: ['ui', 'frontend', 'css', 'html', 'react', 'vue', 'angular', 'component', 'style', 'layout'],
        fileExtensions: ['.css', '.scss', '.html', '.jsx', '.tsx', '.vue'],
        minConfidence: 0.6
      },
      backend: {
        keywords: ['backend', 'server', 'database', 'api', 'endpoint', 'middleware', 'sql', 'query'],
        minConfidence: 0.6
      },
      integration: {
        keywords: ['integrate', 'test', 'deploy', 'ci/cd', 'pipeline', 'connect', 'combine'],
        minConfidence: 0.5
      }
    };
  }

  /**
   * Classify task and determine optimal routing
   * @param {Object} task - Task to classify and route
   * @param {Object} context - Context including budget and preferences
   * @returns {Object} Routing decision
   */
  classifyAndRoute(task, context = {}) {
    // Step 1: Classify task type
    const classification = this.classifyTask(task);
    
    // Step 2: Determine strategy
    const strategy = this.selectStrategy(classification, context);
    
    // Step 3: Select optimal agent
    const agentSelection = this.selectAgent(classification, strategy, context);
    
    // Step 4: Select optimal model for the agent
    const modelSelection = this.selectModel(agentSelection, strategy, context);
    
    // Step 5: Calculate estimated cost
    const estimatedCost = this.estimateCost(agentSelection, modelSelection, task);
    
    return {
      taskType: classification.taskType,
      confidence: classification.confidence,
      strategy: strategy.id,
      agent: agentSelection.id,
      agentName: agentSelection.name,
      model: modelSelection.id,
      modelName: modelSelection.name,
      estimatedCost,
      rationale: this.generateRationale(classification, strategy, agentSelection, modelSelection)
    };
  }

  /**
   * Classify task based on description and context
   */
  classifyTask(task) {
    const description = (task.description || '').toLowerCase();
    const context = task.context || {};
    
    const scores = {};
    
    // Score each task type based on keyword matches
    for (const [taskType, pattern] of Object.entries(this.classificationPatterns)) {
      let score = 0;
      let matches = 0;
      
      // Check keywords
      for (const keyword of pattern.keywords) {
        if (description.includes(keyword)) {
          score += 1;
          matches++;
        }
      }
      
      // Check file extensions in context
      if (pattern.fileExtensions && context.files) {
        for (const file of context.files) {
          for (const ext of pattern.fileExtensions) {
            if (file.endsWith(ext)) {
              score += 0.5;
            }
          }
        }
      }
      
      // Normalize score
      scores[taskType] = {
        score: score / pattern.keywords.length,
        matches,
        meetsThreshold: score / pattern.keywords.length >= pattern.minConfidence
      };
    }
    
    // Find best match
    let bestType = 'coding'; // default
    let bestScore = 0;
    
    for (const [taskType, data] of Object.entries(scores)) {
      if (data.score > bestScore && data.meetsThreshold) {
        bestScore = data.score;
        bestType = taskType;
      }
    }
    
    // Calculate confidence
    const confidence = Math.min(1, bestScore);
    
    return {
      taskType: bestType,
      confidence,
      allScores: scores,
      complexity: this.estimateComplexity(task)
    };
  }

  /**
   * Select strategy based on classification and context
   */
  selectStrategy(classification, context) {
    // Check for explicit strategy preference
    if (context.strategy && this.strategies[context.strategy]) {
      return this.strategies[context.strategy];
    }
    
    // Check strategy selection rules
    for (const rule of strategiesConfig.strategySelectionRules) {
      if (this.evaluateRule(rule, classification, context)) {
        return this.strategies[rule.strategy];
      }
    }
    
    // Check budget constraints
    if (context.budget !== undefined && context.budget < 1.0) {
      return this.strategies.economy;
    }
    
    // Default to task-type specific strategy
    const taskTypeStrategy = this.strategies[classification.taskType];
    if (taskTypeStrategy) {
      return taskTypeStrategy;
    }
    
    // Fall back to default
    return this.strategies[this.defaultStrategy];
  }

  /**
   * Select optimal agent based on classification and strategy
   */
  selectAgent(classification, strategy, context) {
    const taskType = classification.taskType;
    
    // Get agents that can handle this task type
    const eligibleAgents = Object.values(this.agents).filter(agent => 
      agent.domains.includes(taskType) || 
      (strategy.preferredAgents && strategy.preferredAgents.includes(agent.id))
    );
    
    if (eligibleAgents.length === 0) {
      // Fall back to general coding specialist
      return this.agents['coding-specialist'];
    }
    
    // Score each agent based on strategy weights
    const scoredAgents = eligibleAgents.map(agent => {
      const qualityScore = agent.quality / 10;
      const costScore = 1 / (agent.costProfile?.estimatedCostPerTask || 0.01);
      const speedScore = agent.speed / 10;
      
      const weightedScore = 
        strategy.weights.quality * qualityScore +
        strategy.weights.cost * (costScore / 100) +
        strategy.weights.speed * speedScore;
      
      return { agent, score: weightedScore };
    });
    
    // Sort by score descending
    scoredAgents.sort((a, b) => b.score - a.score);
    
    return scoredAgents[0].agent;
  }

  /**
   * Select optimal model for the agent
   */
  selectModel(agentSelection, strategy, context) {
    const primaryModelId = agentSelection.primaryModel;
    const primaryModel = this.models[primaryModelId];
    
    if (!primaryModel) {
      throw new Error(`Model ${primaryModelId} not found`);
    }
    
    // Check if primary model meets strategy constraints
    if (strategy.constraints.minQuality && 
        primaryModel.capabilities.coding < strategy.constraints.minQuality) {
      // Find fallback model that meets constraints
      for (const fallbackId of agentSelection.fallbackChain) {
        const fallbackModel = this.models[fallbackId];
        if (fallbackModel && fallbackModel.capabilities.coding >= strategy.constraints.minQuality) {
          return fallbackModel;
        }
      }
    }
    
    return primaryModel;
  }

  /**
   * Estimate cost for the selected agent+model combination
   */
  estimateCost(agent, model, task) {
    const baseInput = agent.costProfile?.avgInputTokens || 2000;
    const baseOutput = agent.costProfile?.avgOutputTokens || 1500;
    
    // Adjust for task complexity
    const complexity = task.complexity || this.estimateComplexity(task);
    const multiplier = 0.5 + (complexity / 10);
    
    const inputTokens = baseInput * multiplier;
    const outputTokens = baseOutput * multiplier;
    
    const inputCost = (inputTokens / 1000000) * model.pricing.inputPer1M;
    const outputCost = (outputTokens / 1000000) * model.pricing.outputPer1M;
    
    return inputCost + outputCost;
  }

  /**
   * Estimate task complexity (1-10 scale)
   */
  estimateComplexity(task) {
    const description = (task.description || '').toLowerCase();
    
    let complexity = 5; // Base complexity
    
    // Adjust based on keywords
    const complexityIndicators = {
      high: ['complex', 'difficult', 'architecture', 'redesign', 'migration', 'optimization'],
      medium: ['implement', 'create', 'add', 'update', 'modify', 'fix'],
      low: ['simple', 'quick', 'update', 'change', 'tweak', 'minor']
    };
    
    for (const keyword of complexityIndicators.high) {
      if (description.includes(keyword)) complexity += 2;
    }
    for (const keyword of complexityIndicators.medium) {
      if (description.includes(keyword)) complexity += 1;
    }
    for (const keyword of complexityIndicators.low) {
      if (description.includes(keyword)) complexity -= 1;
    }
    
    // Cap at 1-10
    return Math.max(1, Math.min(10, complexity));
  }

  /**
   * Evaluate a strategy selection rule
   */
  evaluateRule(rule, classification, context) {
    // Simple rule evaluation - can be expanded
    if (rule.condition.includes('task.type')) {
      const taskTypeMatch = rule.condition.match(/task\.type\s*==\s*['"](\w+)['"]/);
      if (taskTypeMatch) {
        return classification.taskType === taskTypeMatch[1];
      }
    }
    
    if (rule.condition.includes('budget.remaining')) {
      return context.budget !== undefined && context.budget < 1.0;
    }
    
    return false;
  }

  /**
   * Generate human-readable rationale for routing decision
   */
  generateRationale(classification, strategy, agent, model) {
    const parts = [];
    
    parts.push(`Classified as "${classification.taskType}" task (confidence: ${(classification.confidence * 100).toFixed(0)}%)`);
    parts.push(`Using "${strategy.name}" strategy (quality: ${strategy.weights.quality}, cost: ${strategy.weights.cost}, speed: ${strategy.weights.speed})`);
    parts.push(`Selected ${agent.name} with ${model.name}`);
    parts.push(`Agent quality: ${agent.quality}/10, Model SWE-bench: ${model.performance.sweBench}%`);
    
    return parts.join('. ');
  }

  /**
   * Get routing statistics
   */
  getStats() {
    return {
      models: Object.keys(this.models).length,
      agents: Object.keys(this.agents).length,
      strategies: Object.keys(this.strategies).length,
      classificationPatterns: Object.keys(this.classificationPatterns)
    };
  }
}

export default TaskRouter;
