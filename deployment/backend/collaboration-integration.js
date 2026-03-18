/**
 * Collaboration Integration Module
 * Integrates the Agent Collaboration Framework with Mission Control
 */

import { CostOptimizedFramework } from '/Users/levinolonan/.openclaw/workspace/agent-collaboration-framework-cost-optimized/src/index.js';

/**
 * Collaboration Manager
 * Manages parallel agent delegation and task decomposition
 */
export class CollaborationManager {
  constructor(options = {}) {
    // Initialize the collaboration framework
    this.framework = new CostOptimizedFramework({
      budget: {
        defaultLimit: options.defaultBudget || 10.00,
        alerts: [0.5, 0.8, 0.95]
      },
      thresholds: {
        complexity: 5,
        estimatedTimeMinutes: 3,
        subtaskCount: 3
      }
    });

    // Collaboration state
    this.activeCollaborations = new Map();
    this.collaborationHistory = [];
    this.performanceMetrics = {
      totalCollaborations: 0,
      successfulCollaborations: 0,
      averageSpeedup: 1.0,
      totalCostSavings: 0,
      parallelTasksExecuted: 0
    };

    // Agent specialization registry
    this.specializedAgents = this.initializeSpecializedAgents();

    // Coordination patterns
    this.coordinationPatterns = {
      parallel: 'parallel-independent',
      sequential: 'sequential-dependent',
      fanOutFanIn: 'fan-out-fan-in',
      pipeline: 'pipeline'
    };
  }

  /**
   * Initialize specialized agents for different domains with MiniMax M2.7 as default
   */
  initializeSpecializedAgents() {
    // Updated pricing per 1M tokens (from requirements)
    const MINIMAX_M27_PRICING = { input: 0.30, output: 1.20 };
    const MINIMAX_M25_PRICING = { input: 0.30, output: 1.20 };
    const GEMINI_FLASH_LITE_PRICING = { input: 0.075, output: 0.30 };
    const DEEPSEEK_V32_PRICING = { input: 0.14, output: 0.28 };
    const DEEPSEEK_REASONER_PRICING = { input: 0.14, output: 0.28 }; // Same as V3.2 for DeepSeek
    const GPT_51_CODEX_PRICING = { input: 2.50, output: 10.00 }; // Estimated
    const CLAUDE_35_SONNET_PRICING = { input: 3.00, output: 15.00 }; // Estimated
    
    return {
      // 1. Code Specialist (MiniMax M2.7 → MiniMax M2.5 → DeepSeek V3.2)
      'coding-specialist': {
        id: 'coding-specialist',
        name: 'Code Specialist',
        description: 'Expert in programming, debugging, refactoring, and testing code',
        models: ['minimax/m2.7', 'minimax/m2.5', 'deepseek/deepseek-v3.2'],
        model: 'minimax/m2.7', // Primary model for backward compatibility
        inputCost: MINIMAX_M27_PRICING.input,
        outputCost: MINIMAX_M27_PRICING.output,
        quality: 9,
        speed: 8,
        domains: ['coding', 'debugging', 'refactoring', 'testing', 'programming'],
        capabilities: [
          'analyze_code',
          'debug_issues',
          'refactor_code',
          'write_tests',
          'optimize_algorithms',
          'review_pull_requests'
        ],
        expertise: {
          'coding': 0.95,
          'debugging': 0.95,
          'refactoring': 0.90,
          'testing': 0.90,
          'algorithms': 0.88,
          'code_review': 0.92
        },
        preferences: {
          taskTypes: ['code-analysis', 'debug', 'refactor', 'test'],
          maxConcurrentTasks: 3
        },
        costProfile: {
          avgInputTokens: 3000,
          avgOutputTokens: 2500,
          estimatedCostPerTask: 0.00135 // (3000/1M * 0.30) + (2500/1M * 1.20)
        }
      },
      
      // 2. UI/UX Specialist (MiniMax M2.7 → MiniMax M2.5 → DeepSeek V3.2)
      'ui-specialist': {
        id: 'ui-specialist',
        name: 'UI/UX Specialist',
        description: 'Expert in user interface design, user experience, frontend development, and Tailwind CSS',
        models: ['minimax/m2.7', 'minimax/m2.5', 'deepseek/deepseek-v3.2'],
        model: 'minimax/m2.7', // Primary model for backward compatibility
        inputCost: MINIMAX_M27_PRICING.input,
        outputCost: MINIMAX_M27_PRICING.output,
        quality: 9,
        speed: 8,
        domains: ['ui', 'ux', 'design', 'frontend', 'tailwind', 'css', 'html'],
        capabilities: [
          'analyze_dom_structure',
          'debug_event_listeners',
          'fix_css_issues',
          'optimize_rendering',
          'review_component_code',
          'identify_ui_bugs'
        ],
        expertise: {
          'ui': 0.95,
          'ux': 0.92,
          'design': 0.90,
          'frontend': 0.95,
          'tailwind': 0.94,
          'css': 0.96,
          'html': 0.95
        },
        preferences: {
          taskTypes: ['ui-analysis', 'frontend-debug', 'component-review'],
          maxConcurrentTasks: 3
        },
        costProfile: {
          avgInputTokens: 2800,
          avgOutputTokens: 2200,
          estimatedCostPerTask: 0.00126 // (2800/1M * 0.30) + (2200/1M * 1.20)
        }
      },
      
      // 3. Backend Specialist (MiniMax M2.7 → MiniMax M2.5 → DeepSeek V3.2)
      'backend-specialist': {
        id: 'backend-specialist',
        name: 'Backend Specialist',
        description: 'Expert in backend development, APIs, databases, and server-side logic',
        models: ['minimax/m2.7', 'minimax/m2.5', 'deepseek/deepseek-v3.2'],
        model: 'minimax/m2.7', // Primary model for backward compatibility
        inputCost: MINIMAX_M27_PRICING.input,
        outputCost: MINIMAX_M27_PRICING.output,
        quality: 9,
        speed: 8,
        domains: ['backend', 'api', 'database', 'server', 'node', 'express'],
        capabilities: [
          'analyze_api_endpoints',
          'debug_server_logic',
          'review_middleware',
          'optimize_routes',
          'fix_database_issues',
          'validate_rest_design'
        ],
        expertise: {
          'backend': 0.95,
          'api': 0.96,
          'database': 0.92,
          'server': 0.94,
          'node': 0.93,
          'express': 0.92
        },
        preferences: {
          taskTypes: ['api-analysis', 'server-debug', 'endpoint-review'],
          maxConcurrentTasks: 3
        },
        costProfile: {
          avgInputTokens: 3200,
          avgOutputTokens: 2600,
          estimatedCostPerTask: 0.00144 // (3200/1M * 0.30) + (2600/1M * 1.20)
        }
      },
      
      // 4. Research Specialist (Gemini Flash Lite → DeepSeek V3.2 → MiniMax M2.5)
      'research-specialist': {
        id: 'research-specialist',
        name: 'Research Specialist',
        description: 'Expert in research, analysis, planning, and strategy development',
        models: ['google/gemini-flash-lite', 'deepseek/deepseek-v3.2', 'minimax/m2.5'],
        model: 'google/gemini-flash-lite', // Primary model for backward compatibility
        inputCost: GEMINI_FLASH_LITE_PRICING.input,
        outputCost: GEMINI_FLASH_LITE_PRICING.output,
        quality: 8,
        speed: 9,
        domains: ['research', 'analysis', 'planning', 'strategy', 'investigation'],
        capabilities: [
          'conduct_research',
          'analyze_data',
          'develop_strategies',
          'create_plans',
          'synthesize_information',
          'generate_insights'
        ],
        expertise: {
          'research': 0.95,
          'analysis': 0.94,
          'planning': 0.92,
          'strategy': 0.91,
          'investigation': 0.93,
          'synthesis': 0.90
        },
        preferences: {
          taskTypes: ['research', 'analysis', 'planning'],
          maxConcurrentTasks: 4
        },
        costProfile: {
          avgInputTokens: 4000,
          avgOutputTokens: 3000,
          estimatedCostPerTask: 0.00048 // (4000/1M * 0.075) + (3000/1M * 0.30)
        }
      },
      
      // 5. Data Specialist (MiniMax M2.7 → MiniMax M2.5 → Gemini Flash Lite)
      'data-specialist': {
        id: 'data-specialist',
        name: 'Data Specialist',
        description: 'Expert in data analysis, statistics, visualization, and data processing',
        models: ['minimax/m2.7', 'minimax/m2.5', 'google/gemini-flash-lite'],
        model: 'minimax/m2.7', // Primary model for backward compatibility
        inputCost: MINIMAX_M27_PRICING.input,
        outputCost: MINIMAX_M27_PRICING.output,
        quality: 9,
        speed: 8,
        domains: ['data', 'analytics', 'statistics', 'visualization', 'processing'],
        capabilities: [
          'analyze_datasets',
          'create_visualizations',
          'perform_statistical_analysis',
          'process_data',
          'identify_trends',
          'generate_reports'
        ],
        expertise: {
          'data': 0.95,
          'analytics': 0.94,
          'statistics': 0.93,
          'visualization': 0.92,
          'processing': 0.91,
          'reporting': 0.90
        },
        preferences: {
          taskTypes: ['data-analysis', 'visualization', 'statistics'],
          maxConcurrentTasks: 3
        },
        costProfile: {
          avgInputTokens: 3500,
          avgOutputTokens: 2800,
          estimatedCostPerTask: 0.00147 // (3500/1M * 0.30) + (2800/1M * 1.20)
        }
      },
      
      // 6. Writing Specialist (Gemini Flash Lite → DeepSeek V3.2 → MiniMax M2.5)
      'writing-specialist': {
        id: 'writing-specialist',
        name: 'Writing Specialist',
        description: 'Expert in writing, content creation, documentation, and copywriting',
        models: ['google/gemini-flash-lite', 'deepseek/deepseek-v3.2', 'minimax/m2.5'],
        model: 'google/gemini-flash-lite', // Primary model for backward compatibility
        inputCost: GEMINI_FLASH_LITE_PRICING.input,
        outputCost: GEMINI_FLASH_LITE_PRICING.output,
        quality: 8,
        speed: 9,
        domains: ['writing', 'content', 'documentation', 'copy', 'communication'],
        capabilities: [
          'write_content',
          'create_documentation',
          'edit_copy',
          'proofread_text',
          'structure_information',
          'adapt_tone'
        ],
        expertise: {
          'writing': 0.95,
          'content': 0.94,
          'documentation': 0.93,
          'copy': 0.92,
          'communication': 0.91,
          'editing': 0.90
        },
        preferences: {
          taskTypes: ['writing', 'documentation', 'content-creation'],
          maxConcurrentTasks: 4
        },
        costProfile: {
          avgInputTokens: 3800,
          avgOutputTokens: 3200,
          estimatedCostPerTask: 0.00053 // (3800/1M * 0.075) + (3200/1M * 0.30)
        }
      },
      
      // 7. Planning Specialist (DeepSeek Reasoner → MiniMax M2.7 → Claude 3.5 Sonnet)
      'planning-specialist': {
        id: 'planning-specialist',
        name: 'Planning Specialist',
        description: 'Expert in planning, project management, coordination, and workflow design',
        models: ['deepseek/deepseek-reasoner', 'minimax/m2.7', 'anthropic/claude-3.5-sonnet'],
        model: 'deepseek/deepseek-reasoner', // Primary model for backward compatibility
        inputCost: DEEPSEEK_REASONER_PRICING.input,
        outputCost: DEEPSEEK_REASONER_PRICING.output,
        quality: 9,
        speed: 7,
        domains: ['planning', 'project-management', 'coordination', 'workflow', 'organization'],
        capabilities: [
          'create_plans',
          'manage_projects',
          'coordinate_tasks',
          'design_workflows',
          'allocate_resources',
          'track_progress'
        ],
        expertise: {
          'planning': 0.96,
          'project-management': 0.95,
          'coordination': 0.94,
          'workflow': 0.93,
          'organization': 0.92,
          'resource-allocation': 0.91
        },
        preferences: {
          taskTypes: ['planning', 'project-management', 'coordination'],
          maxConcurrentTasks: 2
        },
        costProfile: {
          avgInputTokens: 4200,
          avgOutputTokens: 3500,
          estimatedCostPerTask: 0.00088 // (4200/1M * 0.14) + (3500/1M * 0.28)
        }
      },
      
      // 8. Integration Specialist (DeepSeek V3.2 → MiniMax M2.7 → GPT-5.1 Codex)
      'integration-specialist': {
        id: 'integration-specialist',
        name: 'Integration Specialist',
        description: 'Expert in integration, deployment, DevOps, testing, and system coordination',
        models: ['deepseek/deepseek-v3.2', 'minimax/m2.7', 'openai/gpt-5.1-codex'],
        model: 'deepseek/deepseek-v3.2', // Primary model for backward compatibility
        inputCost: DEEPSEEK_V32_PRICING.input,
        outputCost: DEEPSEEK_V32_PRICING.output,
        quality: 9,
        speed: 8,
        domains: ['integration', 'deployment', 'devops', 'testing', 'system', 'coordination'],
        capabilities: [
          'integrate_components',
          'deploy_systems',
          'configure_devops',
          'test_integrations',
          'coordinate_systems',
          'validate_deployments'
        ],
        expertise: {
          'integration': 0.95,
          'deployment': 0.94,
          'devops': 0.93,
          'testing': 0.92,
          'system': 0.91,
          'coordination': 0.90
        },
        preferences: {
          taskTypes: ['integration', 'deployment', 'system-testing'],
          maxConcurrentTasks: 2
        },
        costProfile: {
          avgInputTokens: 3800,
          avgOutputTokens: 3000,
          estimatedCostPerTask: 0.00080 // (3800/1M * 0.14) + (3000/1M * 0.28)
        }
      },
      
      // 9. QA Specialist (MiniMax M2.7 → MiniMax M2.5 → Gemini Flash Lite)
      'qa-specialist': {
        id: 'qa-specialist',
        name: 'QA Specialist',
        description: 'Expert in testing, quality assurance, validation, and review processes',
        models: ['minimax/m2.7', 'minimax/m2.5', 'google/gemini-flash-lite'],
        model: 'minimax/m2.7', // Primary model for backward compatibility
        inputCost: MINIMAX_M27_PRICING.input,
        outputCost: MINIMAX_M27_PRICING.output,
        quality: 9,
        speed: 8,
        domains: ['testing', 'quality', 'validation', 'review', 'verification'],
        capabilities: [
          'test_functionality',
          'validate_quality',
          'review_code',
          'verify_requirements',
          'identify_bugs',
          'ensure_compliance'
        ],
        expertise: {
          'testing': 0.96,
          'quality': 0.95,
          'validation': 0.94,
          'review': 0.93,
          'verification': 0.92,
          'compliance': 0.91
        },
        preferences: {
          taskTypes: ['testing', 'quality-review', 'validation'],
          maxConcurrentTasks: 4
        },
        costProfile: {
          avgInputTokens: 2600,
          avgOutputTokens: 2000,
          estimatedCostPerTask: 0.00108 // (2600/1M * 0.30) + (2000/1M * 1.20)
        }
      }
    };
  }

  /**
   * Register specialized agents with the framework
   */
  registerAgentsWithFramework() {
    Object.values(this.specializedAgents).forEach(agent => {
      this.framework.registerAgent({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        inputCost: agent.inputCost,
        outputCost: agent.outputCost,
        quality: agent.quality,
        speed: agent.speed,
        domains: agent.domains,
        capabilities: agent.capabilities,
        expertise: agent.expertise,
        preferences: agent.preferences,
        costProfile: agent.costProfile
      });
    });
    this.agentsRegistered = true;
  }

  /**
   * Analyze task for decomposition
   * @param {Object} task - Task to analyze
   * @returns {Object} Decomposition analysis
   */
  analyzeTaskForDecomposition(task) {
    const analysis = {
      taskId: task.id || `task-${Date.now()}`,
      originalTask: task,
      decompositionStrategy: null,
      subtasks: [],
      estimatedParallelism: 1,
      coordinationPattern: 'parallel',
      complexityScore: 0
    };

    // Analyze task description for domains
    const description = task.description?.toLowerCase() || '';
    const domains = this.identifyDomains(description);
    
    // Calculate complexity based on domains and description length
    analysis.complexityScore = this.calculateComplexity(description, domains);
    
    // Determine decomposition strategy
    if (domains.length > 1) {
      // Multiple domains = parallel decomposition
      analysis.decompositionStrategy = 'domain-based-parallel';
      analysis.coordinationPattern = 'parallel';
      analysis.estimatedParallelism = Math.min(domains.length, 4);
      
      // Create subtasks by domain
      domains.forEach(domain => {
        analysis.subtasks.push({
          id: `${analysis.taskId}-${domain}`,
          description: `${task.description} (${domain} focus)`,
          domain: domain,
          priority: 'medium',
          estimatedTimeMinutes: Math.max(1, Math.floor(5 / domains.length))
        });
      });
    } else if (description.length > 500 || analysis.complexityScore > 7) {
      // Complex single-domain task = sequential decomposition
      analysis.decompositionStrategy = 'complexity-based-sequential';
      analysis.coordinationPattern = 'sequential';
      analysis.estimatedParallelism = 1;
      
      // Break into phases
      const phases = ['analysis', 'implementation', 'review'];
      phases.forEach((phase, index) => {
        analysis.subtasks.push({
          id: `${analysis.taskId}-phase-${index + 1}`,
          description: `${task.description} - ${phase} phase`,
          domain: domains[0] || 'general',
          phase: phase,
          priority: index === 0 ? 'high' : 'medium',
          estimatedTimeMinutes: 2
        });
      });
    } else {
      // Simple task - no decomposition needed
      analysis.decompositionStrategy = 'none';
      analysis.coordinationPattern = 'solo';
      analysis.estimatedParallelism = 1;
      analysis.subtasks.push({
        id: `${analysis.taskId}-solo`,
        description: task.description,
        domain: domains[0] || 'general',
        priority: 'high',
        estimatedTimeMinutes: 3
      });
    }

    return analysis;
  }

  /**
   * Identify domains from task description
   * @param {string} description - Task description
   * @returns {string[]} Identified domains
   */
  identifyDomains(description) {
    const domains = [];
    const domainKeywords = {
      'coding': ['code', 'program', 'function', 'class', 'method', 'bug', 'debug', 'refactor'],
      'ui': ['ui', 'ux', 'design', 'interface', 'button', 'layout', 'tailwind', 'css'],
      'backend': ['backend', 'api', 'server', 'database', 'endpoint', 'route'],
      'research': ['research', 'analyze', 'study', 'investigate', 'find', 'search'],
      'writing': ['write', 'document', 'content', 'copy', 'article', 'blog'],
      'planning': ['plan', 'strategy', 'coordinate', 'organize', 'schedule'],
      'integration': ['integrate', 'connect', 'deploy', 'setup', 'configure'],
      'testing': ['test', 'qa', 'validate', 'verify', 'check']
    };

    Object.entries(domainKeywords).forEach(([domain, keywords]) => {
      if (keywords.some(keyword => description.includes(keyword))) {
        domains.push(domain);
      }
    });

    // Default to general if no specific domains found
    if (domains.length === 0) {
      domains.push('general');
    }

    return domains;
  }

  /**
   * Calculate task complexity
   * @param {string} description - Task description
   * @param {string[]} domains - Identified domains
   * @returns {number} Complexity score (1-10)
   */
  calculateComplexity(description, domains) {
    let score = 1;
    
    // Length factor
    if (description.length > 1000) score += 3;
    else if (description.length > 500) score += 2;
    else if (description.length > 200) score += 1;
    
    // Domain factor
    score += Math.min(domains.length, 3);
    
    // Technical keywords factor
    const technicalKeywords = ['complex', 'multiple', 'integrate', 'system', 'architecture', 'refactor'];
    const technicalCount = technicalKeywords.filter(keyword => description.includes(keyword)).length;
    score += Math.min(technicalCount, 2);
    
    return Math.min(score, 10);
  }

  /**
   * Execute task with collaboration
   * @param {Object} task - Task to execute
   * @param {Object} options - Execution options
   * @returns {Promise<Object>} Collaboration result
   */
  async executeWithCollaboration(task, options = {}) {
    const collaborationId = `collab-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const startTime = Date.now();
    
    // Register agents if not already done
    if (!this.agentsRegistered) {
      this.registerAgentsWithFramework();
      this.agentsRegistered = true;
    }

    // Analyze task for decomposition
    const analysis = this.analyzeTaskForDecomposition(task);
    
    // Track collaboration
    this.activeCollaborations.set(collaborationId, {
      id: collaborationId,
      task,
      analysis,
      status: 'analyzing',
      startTime,
      subtaskAssignments: new Map(),
      results: []
    });

    // Determine execution strategy
    let result;
    if (analysis.decompositionStrategy === 'none') {
      // Solo execution
      result = await this.executeSolo(task, options);
      result.collaborationMode = 'solo';
    } else {
      // Collaborative execution
      result = await this.executeCollaborative(task, analysis, options);
      result.collaborationMode = analysis.coordinationPattern;
      
      // Update performance metrics
      this.updatePerformanceMetrics(result);
    }

    // Record collaboration
    const duration = Date.now() - startTime;
    const collaborationRecord = {
      id: collaborationId,
      taskId: task.id,
      collaborationMode: result.collaborationMode,
      analysis,
      result,
      duration,
      timestamp: Date.now()
    };

    this.collaborationHistory.push(collaborationRecord);
    this.activeCollaborations.delete(collaborationId);

    // Keep history manageable
    if (this.collaborationHistory.length > 100) {
      this.collaborationHistory = this.collaborationHistory.slice(-100);
    }

    return {
      ...result,
      collaborationId,
      analysis,
      duration
    };
  }

  /**
   * Execute task solo (no collaboration)
   */
  async executeSolo(task, options) {
    const startTime = Date.now();
    
    // Use framework's solo execution
    const result = await this.framework.execute(task, {
      ...options,
      strategy: 'economy'
    });

    const duration = Date.now() - startTime;
    
    return {
      success: result.result?.success || result.metrics?.success || true,
      result: result.result,
      metrics: {
        ...result.metrics,
        duration,
        speedupFactor: 1.0,
        collaborationGain: 0
      },
      cost: result.metrics.cost
    };
  }

  /**
   * Execute task collaboratively
   */
  async executeCollaborative(task, analysis, options) {
    const startTime = Date.now();
    
    // Prepare collaborative task
    const collaborativeTask = {
      ...task,
      id: `${task.id || 'task'}-collab`,
      description: task.description,
      complexity: analysis.complexityScore,
      subtasks: analysis.subtasks
    };

    // Execute with framework
    const frameworkResult = await this.framework.execute(collaborativeTask, {
      ...options,
      strategy: options.strategy || 'balanced'
    });

    const duration = Date.now() - startTime;
    
    // Calculate speedup factor
    const estimatedSoloTime = frameworkResult.metrics.estimatedSoloTime || 
      (analysis.subtasks.length * 30000); // Assume 30 seconds per subtask if done sequentially
    const speedupFactor = duration > 0 ? estimatedSoloTime / Math.max(duration, 100) : 1.0;
    
    // Calculate collaboration gain
    const collaborationGain = Math.max(0, speedupFactor - 1);

    return {
      success: frameworkResult.result?.success || frameworkResult.metrics?.success || true,
      result: frameworkResult.result,
      subtaskResults: frameworkResult.subtaskResults,
      metrics: {
        ...frameworkResult.metrics,
        duration,
        speedupFactor,
        collaborationGain,
        parallelism: analysis.estimatedParallelism,
        subtaskCount: analysis.subtasks.length
      },
      cost: frameworkResult.metrics.cost,
      optimization: frameworkResult.optimization
    };
  }

  /**
   * Update performance metrics
   */
  updatePerformanceMetrics(result) {
    this.performanceMetrics.totalCollaborations++;
    
    if (result.success) {
      this.performanceMetrics.successfulCollaborations++;
    }
    
    if (result.metrics.speedupFactor && isFinite(result.metrics.speedupFactor)) {
      // Update rolling average of speedup
      const currentAvg = this.performanceMetrics.averageSpeedup;
      const total = this.performanceMetrics.successfulCollaborations;
      this.performanceMetrics.averageSpeedup = 
        (currentAvg * (total - 1) + Math.min(result.metrics.speedupFactor, 100)) / total; // Cap at 100x
    }
    
    if (result.metrics.cost?.savings) {
      this.performanceMetrics.totalCostSavings += result.metrics.cost.savings;
    }
    
    if (result.metrics.parallelism) {
      this.performanceMetrics.parallelTasksExecuted += result.metrics.parallelism;
    }
  }

  /**
   * Get collaboration statistics
   */
  getCollaborationStats() {
    const successRate = this.performanceMetrics.totalCollaborations > 0
      ? (this.performanceMetrics.successfulCollaborations / this.performanceMetrics.totalCollaborations) * 100
      : 0;

    return {
      ...this.performanceMetrics,
      successRate: `${successRate.toFixed(1)}%`,
      averageSpeedup: this.performanceMetrics.averageSpeedup.toFixed(2),
      totalCostSavings: typeof this.performanceMetrics.totalCostSavings === 'number' 
        ? this.performanceMetrics.totalCostSavings.toFixed(4) 
        : '0.0000',
      efficiencyGain: (this.performanceMetrics.averageSpeedup - 1).toFixed(2)
    };
  }

  /**
   * Get active collaborations
   */
  getActiveCollaborations() {
    return Array.from(this.activeCollaborations.values()).map(collab => ({
      id: collab.id,
      taskId: collab.task.id,
      status: collab.status,
      progress: this.calculateProgress(collab),
      startTime: collab.startTime,
      duration: Date.now() - collab.startTime,
      subtaskCount: collab.analysis.subtasks.length
    }));
  }

  /**
   * Calculate progress percentage
   */
  calculateProgress(collaboration) {
    if (!collaboration.subtaskAssignments.size) return 0;
    
    const total = collaboration.analysis.subtasks.length;
    const completed = Array.from(collaboration.subtaskAssignments.values())
      .filter(assignment => assignment.status === 'completed').length;
    
    return Math.round((completed / total) * 100);
  }

  /**
   * Get collaboration history
   */
  getCollaborationHistory(limit = 20) {
    return this.collaborationHistory
      .slice(-limit)
      .map(record => ({
        id: record.id,
        taskId: record.taskId,
        mode: record.collaborationMode,
        duration: record.duration,
        success: record.result.success,
        speedupFactor: record.result.metrics?.speedupFactor || 1.0,
        cost: record.result.cost?.total || 0,
        timestamp: record.timestamp
      }));
  }

  /**
   * Get specialized agents
   */
  getSpecializedAgents() {
    return Object.values(this.specializedAgents).map(agent => ({
      id: agent.id,
      name: agent.name,
      model: agent.model, // Single model for backward compatibility
      models: agent.models || [agent.model], // Array of models in fallback chain
      domains: agent.domains,
      quality: agent.quality,
      speed: agent.speed,
      costPerTask: agent.costProfile?.estimatedCostPerTask,
      inputCost: agent.inputCost,
      outputCost: agent.outputCost,
      capabilities: agent.capabilities,
      expertise: Object.keys(agent.expertise || {})
    }));
  }

  /**
   * Test collaboration with sample tasks
   */
  async testCollaboration() {
    const testTasks = [
      {
        id: 'test-complex-app',
        description: 'Build a complex web application with React frontend, Node.js backend, and database integration. Include user authentication, API endpoints, and responsive UI design.',
        complexity: 8
      },
      {
        id: 'test-research-report',
        description: 'Research and write a comprehensive report on AI agent collaboration frameworks. Include market analysis, technical comparison, and implementation recommendations.',
        complexity: 7
      },
      {
        id: 'test-debug-system',
        description: 'Debug a production system with multiple issues: API timeouts, database connection errors, and frontend rendering problems. Provide fix recommendations.',
        complexity: 9
      }
    ];

    const results = [];
    
    for (const task of testTasks) {
      console.log(`Testing collaboration on: ${task.description.substring(0, 50)}...`);
      
      const result = await this.executeWithCollaboration(task, {
        budget: 5.00,
        strategy: 'balanced'
      });
      
      results.push({
        taskId: task.id,
        collaborationMode: result.collaborationMode,
        success: result.success,
        duration: result.duration,
        speedupFactor: result.metrics.speedupFactor || 1.0,
        cost: result.cost?.total || 0,
        subtaskCount: result.analysis?.subtasks?.length || 1
      });
      
      // Brief pause between tests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    return {
      testResults: results,
      summary: {
        totalTests: results.length,
        successfulTests: results.filter(r => r.success).length,
        averageSpeedup: results.reduce((sum, r) => sum + (r.speedupFactor || 1), 0) / results.length,
        averageCost: results.reduce((sum, r) => sum + (r.cost || 0), 0) / results.length,
        totalSubtasks: results.reduce((sum, r) => sum + (r.subtaskCount || 1), 0)
      }
    };
  }
}
