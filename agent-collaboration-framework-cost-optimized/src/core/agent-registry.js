/**
 * Cost-Aware Agent Registry - Manages specialized agents with pricing and performance data
 */
export class AgentRegistry {
  constructor(options = {}) {
    this.agents = new Map();
    this.initialized = false;
    
    // Pricing data per 1M tokens (from OpenRouter)
    this.pricing = {
      'moonshot/kimi-k2.5': { input: 0.60, output: 3.00 },
      'openai/gpt-4o': { input: 2.50, output: 10.00 },
      'anthropic/claude-3.5-sonnet': { input: 3.00, output: 15.00 },
      'anthropic/claude-3.5-haiku': { input: 0.75, output: 3.75 },
      'deepseek/deepseek-chat': { input: 0.14, output: 0.14 }
    };
    
    // Register default agents if not disabled
    if (!options.skipDefaults) {
      this.registerDefaultAgents();
    }
  }

  /**
   * Register the default set of specialized agents with cost and quality data
   */
  registerDefaultAgents() {
    // UI/JavaScript Specialist - Kimi K2.5 (balanced quality/cost)
    this.register({
      id: 'ui-specialist',
      name: 'UI/JavaScript Specialist',
      description: 'Expert in HTML, CSS, JavaScript, DOM manipulation, and frontend frameworks',
      model: 'moonshot/kimi-k2.5',
      inputCost: 0.60,
      outputCost: 3.00,
      quality: 9,
      speed: 6,
      domains: ['ui', 'frontend', 'javascript', 'css', 'html'],
      capabilities: [
        'analyze_dom_structure',
        'debug_event_listeners',
        'fix_css_issues',
        'optimize_rendering',
        'review_component_code',
        'identify_ui_bugs'
      ],
      expertise: {
        'HTML/CSS': 0.95,
        'JavaScript': 0.95,
        'DOM API': 0.90,
        'React/Vue/Angular': 0.85,
        'Responsive Design': 0.90,
        'Accessibility': 0.80
      },
      preferences: {
        taskTypes: ['ui-analysis', 'frontend-debug', 'component-review'],
        maxConcurrentTasks: 3
      },
      costProfile: {
        avgInputTokens: 2000,
        avgOutputTokens: 1500,
        estimatedCostPerTask: 0.0069 // (2000/1M * 0.60) + (1500/1M * 3.00)
      }
    });

    // Backend/API Specialist - Kimi K2.5
    this.register({
      id: 'backend-specialist',
      name: 'Backend/API Specialist',
      description: 'Expert in Node.js, Express, WebSocket, REST APIs, and server-side logic',
      model: 'moonshot/kimi-k2.5',
      inputCost: 0.60,
      outputCost: 3.00,
      quality: 9,
      speed: 6,
      domains: ['backend', 'api', 'server', 'node', 'express', 'websocket'],
      capabilities: [
        'analyze_api_endpoints',
        'debug_server_logic',
        'review_middleware',
        'optimize_routes',
        'fix_websocket_issues',
        'validate_rest_design'
      ],
      expertise: {
        'Node.js': 0.95,
        'Express': 0.95,
        'WebSocket': 0.90,
        'REST API Design': 0.95,
        'Middleware': 0.90,
        'Authentication': 0.85
      },
      preferences: {
        taskTypes: ['api-analysis', 'server-debug', 'endpoint-review'],
        maxConcurrentTasks: 3
      },
      costProfile: {
        avgInputTokens: 2500,
        avgOutputTokens: 1800,
        estimatedCostPerTask: 0.0079
      }
    });

    // Database Specialist - DeepSeek Chat (cost-effective for structured tasks)
    this.register({
      id: 'database-specialist',
      name: 'Database Specialist',
      description: 'Expert in SQL, database schemas, queries, and migrations',
      model: 'deepseek/deepseek-chat',
      inputCost: 0.14,
      outputCost: 0.14,
      quality: 8,
      speed: 8,
      domains: ['database', 'sql', 'schema', 'query', 'migration'],
      capabilities: [
        'analyze_queries',
        'optimize_indexes',
        'review_schema_design',
        'debug_transactions',
        'suggest_migrations',
        'identify_n_plus_1'
      ],
      expertise: {
        'SQL': 0.95,
        'PostgreSQL': 0.95,
        'MySQL': 0.90,
        'MongoDB': 0.85,
        'Query Optimization': 0.95,
        'Schema Design': 0.90
      },
      preferences: {
        taskTypes: ['db-analysis', 'query-optimization', 'schema-review'],
        maxConcurrentTasks: 2
      },
      costProfile: {
        avgInputTokens: 3000,
        avgOutputTokens: 2000,
        estimatedCostPerTask: 0.0007
      }
    });

    // Network Specialist - DeepSeek Chat
    this.register({
      id: 'network-specialist',
      name: 'Network Specialist',
      description: 'Expert in CORS, firewall, connectivity, DNS, and network troubleshooting',
      model: 'deepseek/deepseek-chat',
      inputCost: 0.14,
      outputCost: 0.14,
      quality: 8,
      speed: 8,
      domains: ['network', 'cors', 'firewall', 'connectivity', 'dns'],
      capabilities: [
        'diagnose_cors_issues',
        'analyze_connectivity',
        'debug_dns_problems',
        'review_firewall_rules',
        'test_network_paths',
        'identify_timeouts'
      ],
      expertise: {
        'CORS': 0.95,
        'HTTP/HTTPS': 0.95,
        'DNS': 0.90,
        'Firewall': 0.85,
        'TCP/IP': 0.90,
        'WebSocket Connectivity': 0.90
      },
      preferences: {
        taskTypes: ['network-analysis', 'cors-debug', 'connectivity-test'],
        maxConcurrentTasks: 2
      },
      costProfile: {
        avgInputTokens: 1500,
        avgOutputTokens: 1000,
        estimatedCostPerTask: 0.00035
      }
    });

    // Integration Specialist - Claude 3.5 Haiku (fast, good for integration)
    this.register({
      id: 'integration-specialist',
      name: 'Integration Specialist',
      description: 'Expert in combining components, end-to-end testing, and deployment',
      model: 'anthropic/claude-3.5-haiku',
      inputCost: 0.75,
      outputCost: 3.75,
      quality: 7,
      speed: 8,
      domains: ['integration', 'testing', 'e2e', 'deployment', 'build'],
      capabilities: [
        'integrate_components',
        'design_e2e_tests',
        'validate_deployments',
        'coordinate_multi_domain',
        'synthesize_findings',
        'verify_end_to_end'
      ],
      expertise: {
        'Integration Testing': 0.95,
        'E2E Testing': 0.90,
        'CI/CD': 0.85,
        'Component Integration': 0.95,
        'System Testing': 0.90,
        'Deployment': 0.85
      },
      preferences: {
        taskTypes: ['integration', 'e2e-test', 'deployment-verify'],
        maxConcurrentTasks: 2
      },
      costProfile: {
        avgInputTokens: 2500,
        avgOutputTokens: 2000,
        estimatedCostPerTask: 0.0094
      }
    });

    // Debugging Specialist - Claude 3.5 Sonnet (highest quality for complex debugging)
    this.register({
      id: 'debugging-specialist',
      name: 'Debugging Specialist',
      description: 'Expert in error diagnosis, console logs, stack traces, and root cause analysis',
      model: 'anthropic/claude-3.5-sonnet',
      inputCost: 3.00,
      outputCost: 15.00,
      quality: 10,
      speed: 6,
      domains: ['debugging', 'error', 'diagnosis', 'analysis'],
      capabilities: [
        'analyze_stack_traces',
        'review_console_logs',
        'identify_root_cause',
        'trace_execution_flow',
        'reproduce_issues',
        'suggest_fixes'
      ],
      expertise: {
        'Error Analysis': 0.95,
        'Stack Trace Reading': 0.95,
        'Console Log Analysis': 0.95,
        'Root Cause Analysis': 0.95,
        'Issue Reproduction': 0.90,
        'Debugging Tools': 0.90
      },
      preferences: {
        taskTypes: ['diagnose', 'debug', 'analyze-error'],
        maxConcurrentTasks: 3
      },
      costProfile: {
        avgInputTokens: 4000,
        avgOutputTokens: 3000,
        estimatedCostPerTask: 0.057
      }
    });

    // GPT-4o Specialist - For tasks requiring cutting-edge capabilities
    this.register({
      id: 'gpt4o-specialist',
      name: 'GPT-4o Specialist',
      description: 'Advanced reasoning and multimodal capabilities for complex tasks',
      model: 'openai/gpt-4o',
      inputCost: 2.50,
      outputCost: 10.00,
      quality: 9,
      speed: 7,
      domains: ['reasoning', 'multimodal', 'complex-analysis', 'planning'],
      capabilities: [
        'complex_reasoning',
        'multimodal_analysis',
        'advanced_planning',
        'architecture_design',
        'system_analysis',
        'code_generation'
      ],
      expertise: {
        'Complex Reasoning': 0.95,
        'Architecture Design': 0.90,
        'System Analysis': 0.92,
        'Code Generation': 0.90,
        'Planning': 0.88,
        'Documentation': 0.85
      },
      preferences: {
        taskTypes: ['complex-analysis', 'architecture', 'planning'],
        maxConcurrentTasks: 2
      },
      costProfile: {
        avgInputTokens: 3500,
        avgOutputTokens: 2500,
        estimatedCostPerTask: 0.0338
      }
    });

    this.initialized = true;
  }

  /**
   * Register a new agent
   * @param {Object} agent - Agent definition
   */
  register(agent) {
    if (!agent.id) {
      throw new Error('Agent must have an id');
    }
    
    // Calculate quality/cost ratio if not provided
    if (!agent.qualityCostRatio && agent.quality && agent.costProfile?.estimatedCostPerTask) {
      agent.qualityCostRatio = agent.quality / agent.costProfile.estimatedCostPerTask;
    }
    
    this.agents.set(agent.id, {
      ...agent,
      assignmentCount: 0,
      lastAssigned: null,
      registeredAt: Date.now(),
      totalCostIncurred: 0,
      tasksCompleted: 0
    });
  }

  /**
   * Unregister an agent
   * @param {string} agentId - Agent ID to remove
   */
  unregister(agentId) {
    this.agents.delete(agentId);
  }

  /**
   * Get an agent by ID
   * @param {string} agentId - Agent ID
   * @returns {Object|undefined} Agent definition
   */
  getAgent(agentId) {
    return this.agents.get(agentId);
  }

  /**
   * Get all registered agents
   * @returns {Object[]} Array of agent definitions
   */
  getAllAgents() {
    return Array.from(this.agents.values());
  }

  /**
   * Find agents by domain expertise, sorted by expertise level
   * @param {string} domain - Domain to search for
   * @returns {Object[]} Matching agents sorted by expertise
   */
  findByDomain(domain) {
    const matches = [];
    
    for (const agent of this.agents.values()) {
      if (agent.domains.includes(domain)) {
        const expertise = agent.expertise[domain] || 
                         Object.entries(agent.expertise)
                           .filter(([k]) => k.toLowerCase().includes(domain))
                           .reduce((sum, [, v]) => sum + v, 0) / 
                           Object.entries(agent.expertise)
                             .filter(([k]) => k.toLowerCase().includes(domain)).length || 0.5;
        
        matches.push({ agent, expertise });
      }
    }
    
    // Sort by expertise score descending
    return matches.sort((a, b) => b.expertise - a.expertise);
  }

  /**
   * Find agents by domain with cost constraints
   * @param {string} domain - Domain to search for
   * @param {Object} constraints - Cost and quality constraints
   * @returns {Object[]} Matching agents sorted by quality/cost ratio
   */
  findByDomainWithConstraints(domain, constraints = {}) {
    const { maxCost, minQuality = 0, preferSpeed = false } = constraints;
    
    let matches = this.findByDomain(domain);
    
    // Filter by constraints
    matches = matches.filter(({ agent }) => {
      if (minQuality && agent.quality < minQuality) return false;
      if (maxCost && agent.costProfile?.estimatedCostPerTask > maxCost) return false;
      return true;
    });
    
    // Sort by preference
    if (preferSpeed) {
      matches.sort((a, b) => b.agent.speed - a.agent.speed);
    } else {
      // Default: sort by quality/cost ratio
      matches.sort((a, b) => {
        const ratioA = a.agent.qualityCostRatio || 0;
        const ratioB = b.agent.qualityCostRatio || 0;
        return ratioB - ratioA;
      });
    }
    
    return matches;
  }

  /**
   * Get cost estimate for using an agent
   * @param {string} agentId - Agent ID
   * @param {Object} taskEstimate - Optional task-specific token estimate
   * @returns {Object} Cost estimate
   */
  getCostEstimate(agentId, taskEstimate = null) {
    const agent = this.agents.get(agentId);
    if (!agent) return null;
    
    if (taskEstimate) {
      const inputCost = (taskEstimate.input / 1000000) * agent.inputCost;
      const outputCost = (taskEstimate.output / 1000000) * agent.outputCost;
      return {
        input: inputCost,
        output: outputCost,
        total: inputCost + outputCost,
        confidence: taskEstimate.confidence || 0.7
      };
    }
    
    return {
      input: (agent.costProfile.avgInputTokens / 1000000) * agent.inputCost,
      output: (agent.costProfile.avgOutputTokens / 1000000) * agent.outputCost,
      total: agent.costProfile.estimatedCostPerTask,
      confidence: 0.8
    };
  }

  /**
   * Match subtasks to the best agents with cost awareness
   * @param {Object[]} subtasks - Array of subtasks to assign
   * @param {Object} options - Matching options including budget constraints
   * @returns {Object[]} Assignments with subtask, agent, and cost info
   */
  matchAgents(subtasks, options = {}) {
    const { budget, minQuality = 0, strategy = 'balanced' } = options;
    const assignments = [];
    let remainingBudget = budget;
    
    for (const subtask of subtasks) {
      const domain = subtask.domain;
      const constraints = {
        minQuality,
        maxCost: remainingBudget ? remainingBudget / subtasks.length : undefined
      };
      
      const candidates = this.findByDomainWithConstraints(domain, constraints);
      
      if (candidates.length === 0) {
        // No specialist available within constraints - use debugging specialist as fallback
        const fallback = this.agents.get('debugging-specialist');
        const costEstimate = this.getCostEstimate('debugging-specialist');
        
        assignments.push({
          subtask,
          agent: fallback,
          confidence: 0.3,
          isFallback: true,
          costEstimate,
          qualityCostRatio: fallback?.qualityCostRatio || 0
        });
        
        if (remainingBudget) {
          remainingBudget -= costEstimate?.total || 0;
        }
        continue;
      }
      
      // Select best agent based on strategy
      let bestMatch;
      switch (strategy) {
        case 'cheapest':
          bestMatch = candidates.reduce((min, curr) => 
            (curr.agent.costProfile?.estimatedCostPerTask || Infinity) < 
            (min.agent.costProfile?.estimatedCostPerTask || Infinity) ? curr : min
          );
          break;
        case 'highest-quality':
          bestMatch = candidates[0]; // Already sorted by quality/cost, but first has highest expertise
          break;
        case 'fastest':
          bestMatch = candidates.reduce((fastest, curr) => 
            curr.agent.speed > fastest.agent.speed ? curr : fastest
          );
          break;
        case 'balanced':
        default:
          bestMatch = candidates[0]; // Already sorted by quality/cost ratio
      }
      
      const costEstimate = this.getCostEstimate(bestMatch.agent.id);
      
      assignments.push({
        subtask,
        agent: bestMatch.agent,
        confidence: bestMatch.expertise,
        isFallback: false,
        costEstimate,
        qualityCostRatio: bestMatch.agent.qualityCostRatio || 0
      });
      
      // Update agent stats
      bestMatch.agent.assignmentCount++;
      bestMatch.agent.lastAssigned = Date.now();
      
      if (remainingBudget) {
        remainingBudget -= costEstimate?.total || 0;
      }
    }
    
    return assignments;
  }

  /**
   * Create a fallback chain for a task
   * @param {string} domain - Domain expertise needed
   * @param {Object} options - Chain options
   * @returns {Object[]} Ordered list of agents (cheap to expensive)
   */
  createFallbackChain(domain, options = {}) {
    const { minQuality = 0 } = options;
    const candidates = this.findByDomain(domain);
    
    // Filter by minimum quality
    const qualified = candidates.filter(({ agent }) => agent.quality >= minQuality);
    
    // Sort by cost (cheapest first)
    return qualified
      .sort((a, b) => {
        const costA = a.agent.costProfile?.estimatedCostPerTask || Infinity;
        const costB = b.agent.costProfile?.estimatedCostPerTask || Infinity;
        return costA - costB;
      })
      .map(({ agent }) => ({
        id: agent.id,
        name: agent.name,
        model: agent.model,
        quality: agent.quality,
        speed: agent.speed,
        estimatedCost: agent.costProfile?.estimatedCostPerTask || 0
      }));
  }

  /**
   * Update agent cost statistics after task completion
   * @param {string} agentId - Agent ID
   * @param {number} actualCost - Actual cost incurred
   */
  recordCost(agentId, actualCost) {
    const agent = this.agents.get(agentId);
    if (agent) {
      agent.totalCostIncurred = (agent.totalCostIncurred || 0) + actualCost;
      agent.tasksCompleted = (agent.tasksCompleted || 0) + 1;
      agent.averageCost = agent.totalCostIncurred / agent.tasksCompleted;
    }
  }

  /**
   * Get agent statistics including cost data
   * @returns {Object} Statistics by agent
   */
  getStats() {
    const stats = {};
    
    for (const [id, agent] of this.agents) {
      stats[id] = {
        name: agent.name,
        model: agent.model,
        quality: agent.quality,
        speed: agent.speed,
        assignmentCount: agent.assignmentCount,
        tasksCompleted: agent.tasksCompleted || 0,
        totalCostIncurred: agent.totalCostIncurred || 0,
        averageCost: agent.averageCost || agent.costProfile?.estimatedCostPerTask || 0,
        qualityCostRatio: agent.qualityCostRatio || 0,
        lastAssigned: agent.lastAssigned,
        domains: agent.domains,
        avgExpertise: Object.values(agent.expertise).reduce((a, b) => a + b, 0) / 
                      Object.values(agent.expertise).length
      };
    }
    
    return stats;
  }

  /**
   * Get cost summary across all agents
   * @returns {Object} Cost summary
   */
  getCostSummary() {
    const agents = this.getAllAgents();
    const totalEstimatedCost = agents.reduce(
      (sum, a) => sum + (a.costProfile?.estimatedCostPerTask || 0), 
      0
    );
    const totalActualCost = agents.reduce(
      (sum, a) => sum + (a.totalCostIncurred || 0), 
      0
    );
    
    return {
      totalAgents: agents.length,
      totalEstimatedCost,
      totalActualCost,
      averageQuality: agents.reduce((sum, a) => sum + a.quality, 0) / agents.length,
      averageSpeed: agents.reduce((sum, a) => sum + a.speed, 0) / agents.length,
      cheapestAgent: agents.reduce((min, a) => 
        (a.costProfile?.estimatedCostPerTask || Infinity) < 
        (min?.costProfile?.estimatedCostPerTask || Infinity) ? a : min, null)?.id,
      mostExpensiveAgent: agents.reduce((max, a) => 
        (a.costProfile?.estimatedCostPerTask || 0) > 
        (max?.costProfile?.estimatedCostPerTask || 0) ? a : max, null)?.id,
      bestValueAgent: agents.reduce((best, a) => 
        (a.qualityCostRatio || 0) > (best?.qualityCostRatio || 0) ? a : best, null)?.id
    };
  }

  /**
   * Reset all agent statistics
   */
  resetStats() {
    for (const agent of this.agents.values()) {
      agent.assignmentCount = 0;
      agent.lastAssigned = null;
      agent.totalCostIncurred = 0;
      agent.tasksCompleted = 0;
      agent.averageCost = undefined;
    }
  }
}