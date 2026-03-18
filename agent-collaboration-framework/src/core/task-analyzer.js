/**
 * Task Analyzer - Decomposes tasks into subtasks with dependency mapping
 */
export class TaskAnalyzer {
  constructor(options = {}) {
    this.domainKeywords = {
      ui: ['html', 'css', 'javascript', 'dom', 'frontend', 'react', 'vue', 'angular', 'component', 'button', 'form', 'style', 'layout', 'responsive'],
      backend: ['node', 'express', 'api', 'server', 'endpoint', 'middleware', 'route', 'controller', 'service', 'websocket', 'rest'],
      database: ['sql', 'database', 'schema', 'query', 'migration', 'table', 'index', 'join', 'transaction', 'postgres', 'mysql', 'mongodb'],
      network: ['cors', 'firewall', 'connectivity', 'dns', 'http', 'https', 'proxy', 'vpn', 'port', 'socket', 'connection', 'timeout'],
      integration: ['test', 'testing', 'integration', 'e2e', 'combine', 'connect', 'merge', 'deploy', 'build', 'ci', 'cd'],
      debugging: ['debug', 'error', 'bug', 'crash', 'stack trace', 'console', 'log', 'exception', 'breakpoint', 'diagnose']
    };
    
    this.complexityIndicators = {
      high: ['refactor', 'redesign', 'architecture', 'migration', 'optimization', 'performance', 'security', 'authentication', 'authorization'],
      medium: ['implement', 'create', 'add', 'update', 'modify', 'fix', 'debug', 'test'],
      low: ['update', 'change', 'tweak', 'adjust', 'format', 'style', 'comment', 'document']
    };
  }

  /**
   * Analyze a task and decompose it into subtasks
   * @param {Object} task - Task to analyze
   * @returns {Object} Analysis result with subtasks and dependencies
   */
  async analyze(task) {
    const description = task.description.toLowerCase();
    const context = task.context || {};
    
    // Identify domains involved
    const domains = this.identifyDomains(description, context);
    
    // Calculate complexity score
    const complexity = this.calculateComplexity(description, domains);
    
    // Estimate time
    const estimatedTimeMinutes = this.estimateTime(description, complexity, domains);
    
    // Decompose into subtasks
    const subtasks = this.decompose(task, domains);
    
    // Map dependencies
    const dependencies = this.mapDependencies(subtasks);
    
    return {
      originalTask: task,
      domains,
      complexity,
      estimatedTimeMinutes,
      subtasks,
      dependencies,
      parallelizable: this.identifyParallelizable(subtasks, dependencies),
      requiresIntegration: subtasks.length > 1
    };
  }

  /**
   * Identify domains involved in the task
   * @param {string} description - Task description
   * @param {Object} context - Task context
   * @returns {string[]} Array of domain identifiers
   */
  identifyDomains(description, context) {
    const domains = new Set();
    
    // Check description for domain keywords
    for (const [domain, keywords] of Object.entries(this.domainKeywords)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          domains.add(domain);
          break;
        }
      }
    }
    
    // Check context for additional hints
    if (context.error) {
      const errorLower = context.error.toLowerCase();
      if (errorLower.includes('undefined') || errorLower.includes('null') || errorLower.includes('cannot read')) {
        domains.add('debugging');
      }
      if (errorLower.includes('network') || errorLower.includes('connection') || errorLower.includes('cors')) {
        domains.add('network');
      }
      if (errorLower.includes('database') || errorLower.includes('query') || errorLower.includes('sql')) {
        domains.add('database');
      }
    }
    
    // If no domains identified, default to debugging for error-related tasks
    if (domains.size === 0 && description.includes('debug')) {
      domains.add('debugging');
    }
    
    return Array.from(domains);
  }

  /**
   * Calculate complexity score (1-10)
   * @param {string} description - Task description
   * @param {string[]} domains - Identified domains
   * @returns {number} Complexity score
   */
  calculateComplexity(description, domains) {
    let score = 5; // Base complexity
    
    // Adjust based on keywords
    for (const keyword of this.complexityIndicators.high) {
      if (description.includes(keyword)) score += 2;
    }
    for (const keyword of this.complexityIndicators.medium) {
      if (description.includes(keyword)) score += 1;
    }
    for (const keyword of this.complexityIndicators.low) {
      if (description.includes(keyword)) score -= 1;
    }
    
    // Adjust based on number of domains
    score += domains.length * 0.5;
    
    // Cap at 1-10 range
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  /**
   * Estimate time to complete task in minutes
   * @param {string} description - Task description
   * @param {number} complexity - Complexity score
   * @param {string[]} domains - Identified domains
   * @returns {number} Estimated minutes
   */
  estimateTime(description, complexity, domains) {
    // Base time based on complexity
    let baseTime = complexity * 2;
    
    // Adjust for domains
    baseTime += domains.length * 3;
    
    // Check for time indicators in description
    if (description.includes('quick') || description.includes('simple')) {
      baseTime *= 0.5;
    }
    if (description.includes('complex') || description.includes('complicated')) {
      baseTime *= 1.5;
    }
    
    return Math.round(baseTime);
  }

  /**
   * Decompose task into subtasks
   * @param {Object} task - Original task
   * @param {string[]} domains - Identified domains
   * @returns {Object[]} Array of subtasks
   */
  decompose(task, domains) {
    const subtasks = [];
    const description = task.description.toLowerCase();
    
    // Common decomposition patterns
    if (description.includes('debug') || description.includes('fix')) {
      subtasks.push({
        id: `${task.id}-diagnose`,
        type: 'diagnose',
        domain: 'debugging',
        description: `Diagnose root cause of: ${task.description}`,
        priority: 1,
        estimatedMinutes: 5
      });
    }
    
    if (domains.includes('ui') || description.includes('frontend') || description.includes('ui')) {
      subtasks.push({
        id: `${task.id}-ui-analysis`,
        type: 'analyze',
        domain: 'ui',
        description: `Analyze UI components and interactions`,
        priority: 2,
        estimatedMinutes: 4
      });
    }
    
    if (domains.includes('backend') || description.includes('api') || description.includes('server')) {
      subtasks.push({
        id: `${task.id}-backend-analysis`,
        type: 'analyze',
        domain: 'backend',
        description: `Analyze backend API and server logic`,
        priority: 2,
        estimatedMinutes: 5
      });
    }
    
    if (domains.includes('database') || description.includes('database') || description.includes('query')) {
      subtasks.push({
        id: `${task.id}-db-analysis`,
        type: 'analyze',
        domain: 'database',
        description: `Analyze database queries and schema`,
        priority: 2,
        estimatedMinutes: 4
      });
    }
    
    if (domains.includes('network') || description.includes('network') || description.includes('cors')) {
      subtasks.push({
        id: `${task.id}-network-analysis`,
        type: 'analyze',
        domain: 'network',
        description: `Analyze network connectivity and CORS`,
        priority: 2,
        estimatedMinutes: 3
      });
    }
    
    // Always add integration subtask if multiple domains
    if (domains.length > 1 || subtasks.length > 1) {
      subtasks.push({
        id: `${task.id}-integrate`,
        type: 'integrate',
        domain: 'integration',
        description: `Integrate findings and provide solution`,
        priority: 10,
        estimatedMinutes: 3,
        dependsOn: subtasks.filter(st => st.type !== 'integrate').map(st => st.id)
      });
    }
    
    // If no subtasks created, create a generic one
    if (subtasks.length === 0) {
      subtasks.push({
        id: `${task.id}-main`,
        type: 'execute',
        domain: domains[0] || 'debugging',
        description: task.description,
        priority: 1,
        estimatedMinutes: 5
      });
    }
    
    return subtasks;
  }

  /**
   * Map dependencies between subtasks
   * @param {Object[]} subtasks - Array of subtasks
   * @returns {Object} Dependency graph
   */
  mapDependencies(subtasks) {
    const graph = {};
    
    for (const subtask of subtasks) {
      graph[subtask.id] = {
        dependsOn: subtask.dependsOn || [],
        blocks: []
      };
    }
    
    // Build reverse dependencies
    for (const subtask of subtasks) {
      if (subtask.dependsOn) {
        for (const depId of subtask.dependsOn) {
          if (graph[depId]) {
            graph[depId].blocks.push(subtask.id);
          }
        }
      }
    }
    
    return graph;
  }

  /**
   * Identify which subtasks can run in parallel
   * @param {Object[]} subtasks - Array of subtasks
   * @param {Object} dependencies - Dependency graph
   * @returns {string[][]} Groups of parallelizable subtask IDs
   */
  identifyParallelizable(subtasks, dependencies) {
    const groups = [];
    const processed = new Set();
    
    // Find all subtasks with no dependencies
    const independent = subtasks.filter(st => 
      !st.dependsOn || st.dependsOn.length === 0
    );
    
    if (independent.length > 0) {
      groups.push(independent.map(st => st.id));
      independent.forEach(st => processed.add(st.id));
    }
    
    // Find subsequent levels
    let remaining = subtasks.filter(st => !processed.has(st.id));
    while (remaining.length > 0) {
      const ready = remaining.filter(st => {
        const deps = st.dependsOn || [];
        return deps.every(depId => processed.has(depId));
      });
      
      if (ready.length === 0) {
        // Circular dependency or error
        break;
      }
      
      groups.push(ready.map(st => st.id));
      ready.forEach(st => processed.add(st.id));
      remaining = subtasks.filter(st => !processed.has(st.id));
    }
    
    return groups;
  }
}
