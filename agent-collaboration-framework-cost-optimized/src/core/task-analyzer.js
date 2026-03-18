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

  async analyze(task) {
    const description = task.description.toLowerCase();
    const context = task.context || {};
    
    const domains = this.identifyDomains(description, context);
    const complexity = this.calculateComplexity(description, domains);
    const estimatedTimeMinutes = this.estimateTime(description, complexity, domains);
    const subtasks = this.decompose(task, domains);
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

  identifyDomains(description, context) {
    const domains = new Set();
    
    for (const [domain, keywords] of Object.entries(this.domainKeywords)) {
      for (const keyword of keywords) {
        if (description.includes(keyword)) {
          domains.add(domain);
          break;
        }
      }
    }
    
    if (context.error) {
      const errorLower = context.error.toLowerCase();
      if (errorLower.includes('undefined') || errorLower.includes('null')) {
        domains.add('debugging');
      }
      if (errorLower.includes('network') || errorLower.includes('connection')) {
        domains.add('network');
      }
      if (errorLower.includes('database') || errorLower.includes('query')) {
        domains.add('database');
      }
    }
    
    if (domains.size === 0 && description.includes('debug')) {
      domains.add('debugging');
    }
    
    return Array.from(domains);
  }

  calculateComplexity(description, domains) {
    let score = 5;
    
    for (const keyword of this.complexityIndicators.high) {
      if (description.includes(keyword)) score += 2;
    }
    for (const keyword of this.complexityIndicators.medium) {
      if (description.includes(keyword)) score += 1;
    }
    for (const keyword of this.complexityIndicators.low) {
      if (description.includes(keyword)) score -= 1;
    }
    
    score += domains.length * 0.5;
    
    return Math.max(1, Math.min(10, Math.round(score)));
  }

  estimateTime(description, complexity, domains) {
    let baseTime = complexity * 2;
    baseTime += domains.length * 3;
    
    if (description.includes('quick') || description.includes('simple')) {
      baseTime *= 0.5;
    }
    if (description.includes('complex') || description.includes('complicated')) {
      baseTime *= 1.5;
    }
    
    return Math.round(baseTime);
  }

  decompose(task, domains) {
    const subtasks = [];
    const description = task.description.toLowerCase();
    
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
    
    if (domains.includes('ui')) {
      subtasks.push({
        id: `${task.id}-ui-analysis`,
        type: 'analyze',
        domain: 'ui',
        description: `Analyze UI components and interactions`,
        priority: 2,
        estimatedMinutes: 4
      });
    }
    
    if (domains.includes('backend')) {
      subtasks.push({
        id: `${task.id}-backend-analysis`,
        type: 'analyze',
        domain: 'backend',
        description: `Analyze backend API and server logic`,
        priority: 2,
        estimatedMinutes: 5
      });
    }
    
    if (domains.includes('database')) {
      subtasks.push({
        id: `${task.id}-db-analysis`,
        type: 'analyze',
        domain: 'database',
        description: `Analyze database queries and schema`,
        priority: 2,
        estimatedMinutes: 4
      });
    }
    
    if (domains.includes('network')) {
      subtasks.push({
        id: `${task.id}-network-analysis`,
        type: 'analyze',
        domain: 'network',
        description: `Analyze network connectivity and CORS`,
        priority: 2,
        estimatedMinutes: 3
      });
    }
    
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

  mapDependencies(subtasks) {
    const graph = {};
    
    for (const subtask of subtasks) {
      graph[subtask.id] = {
        dependsOn: subtask.dependsOn || [],
        blocks: []
      };
    }
    
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

  identifyParallelizable(subtasks, dependencies) {
    const groups = [];
    const processed = new Set();
    
    const independent = subtasks.filter(st => !st.dependsOn || st.dependsOn.length === 0);
    
    if (independent.length > 0) {
      groups.push(independent.map(st => st.id));
      independent.forEach(st => processed.add(st.id));
    }
    
    let remaining = subtasks.filter(st => !processed.has(st.id));
    while (remaining.length > 0) {
      const ready = remaining.filter(st => {
        const deps = st.dependsOn || [];
        return deps.every(depId => processed.has(depId));
      });
      
      if (ready.length === 0) break;
      
      groups.push(ready.map(st => st.id));
      ready.forEach(st => processed.add(st.id));
      remaining = subtasks.filter(st => !processed.has(st.id));
    }
    
    return groups;
  }
}