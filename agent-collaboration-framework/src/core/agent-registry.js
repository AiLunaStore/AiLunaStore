/**
 * Agent Registry - Manages specialized agents and their capabilities
 */
export class AgentRegistry {
  constructor(options = {}) {
    this.agents = new Map();
    this.initialized = false;
    
    // Register default agents if not disabled
    if (!options.skipDefaults) {
      this.registerDefaultAgents();
    }
  }

  /**
   * Register the default set of specialized agents
   */
  registerDefaultAgents() {
    // UI/JavaScript Specialist
    this.register({
      id: 'ui-specialist',
      name: 'UI/JavaScript Specialist',
      description: 'Expert in HTML, CSS, JavaScript, DOM manipulation, and frontend frameworks',
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
      }
    });

    // Backend/API Specialist
    this.register({
      id: 'backend-specialist',
      name: 'Backend/API Specialist',
      description: 'Expert in Node.js, Express, WebSocket, REST APIs, and server-side logic',
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
      }
    });

    // Database Specialist
    this.register({
      id: 'database-specialist',
      name: 'Database Specialist',
      description: 'Expert in SQL, database schemas, queries, and migrations',
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
      }
    });

    // Network Specialist
    this.register({
      id: 'network-specialist',
      name: 'Network Specialist',
      description: 'Expert in CORS, firewall, connectivity, DNS, and network troubleshooting',
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
      }
    });

    // Integration Specialist
    this.register({
      id: 'integration-specialist',
      name: 'Integration Specialist',
      description: 'Expert in combining components, end-to-end testing, and deployment',
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
      }
    });

    // Debugging Specialist
    this.register({
      id: 'debugging-specialist',
      name: 'Debugging Specialist',
      description: 'Expert in error diagnosis, console logs, stack traces, and root cause analysis',
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
    
    this.agents.set(agent.id, {
      ...agent,
      assignmentCount: 0,
      lastAssigned: null,
      registeredAt: Date.now()
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
   * Find agents by domain expertise
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
   * Match subtasks to the best agents
   * @param {Object[]} subtasks - Array of subtasks to assign
   * @returns {Object[]} Assignments with subtask and agent
   */
  matchAgents(subtasks) {
    const assignments = [];
    
    for (const subtask of subtasks) {
      const domain = subtask.domain;
      const candidates = this.findByDomain(domain);
      
      if (candidates.length === 0) {
        // No specialist available - use debugging specialist as fallback
        const fallback = this.agents.get('debugging-specialist');
        assignments.push({
          subtask,
          agent: fallback,
          confidence: 0.3,
          isFallback: true
        });
        continue;
      }
      
      // Select best available agent
      // Consider: expertise, current load, last assignment time
      const bestMatch = candidates[0];
      
      assignments.push({
        subtask,
        agent: bestMatch.agent,
        confidence: bestMatch.expertise,
        isFallback: false
      });
      
      // Update agent stats
      bestMatch.agent.assignmentCount++;
      bestMatch.agent.lastAssigned = Date.now();
    }
    
    return assignments;
  }

  /**
   * Get agent statistics
   * @returns {Object} Statistics by agent
   */
  getStats() {
    const stats = {};
    
    for (const [id, agent] of this.agents) {
      stats[id] = {
        name: agent.name,
        assignmentCount: agent.assignmentCount,
        lastAssigned: agent.lastAssigned,
        domains: agent.domains,
        avgExpertise: Object.values(agent.expertise).reduce((a, b) => a + b, 0) / 
                      Object.values(agent.expertise).length
      };
    }
    
    return stats;
  }

  /**
   * Reset all agent statistics
   */
  resetStats() {
    for (const agent of this.agents.values()) {
      agent.assignmentCount = 0;
      agent.lastAssigned = null;
    }
  }
}
