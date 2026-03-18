const EventEmitter = require('events');
const log = require('electron-log');

/**
 * AgentController - Manages agent lifecycle and task operations
 * Features:
 * - Start/stop/restart agents
 * - Fetch agent logs
 * - List and filter tasks
 * - Real-time updates
 */
class AgentController extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.serverUrl = options.serverUrl || 'http://localhost:8080';
    this.onAgentUpdate = options.onAgentUpdate || (() => {});
    this.onTaskUpdate = options.onTaskUpdate || (() => {});
    
    this.agents = new Map();
    this.tasks = new Map();
  }

  setServerUrl(url) {
    this.serverUrl = url;
  }

  async apiRequest(endpoint, options = {}) {
    // Support both /api/endpoint and /endpoint patterns
    const apiPath = endpoint.startsWith('/') ? endpoint : `/api${endpoint}`;
    const url = `${this.serverUrl}${apiPath}`;
    
    try {
      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          ...options.headers
        },
        ...options
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status} ${response.statusText}`);
      }
      
      return await response.json();
    } catch (err) {
      log.error(`API request failed: ${url}`, err);
      throw err;
    }
  }

  // Agent Management
  async listAgents() {
    try {
      const agents = await this.apiRequest('/agents');
      
      // Update local cache
      agents.forEach(agent => {
        this.agents.set(agent.id, agent);
      });
      
      return agents;
    } catch (err) {
      log.error('Failed to list agents:', err);
      return Array.from(this.agents.values());
    }
  }

  async startAgent(agentId) {
    try {
      const result = await this.apiRequest(`/agents/${agentId}/start`, {
        method: 'POST'
      });
      
      this.emit('agent-update', { id: agentId, status: 'running' });
      this.onAgentUpdate({ id: agentId, status: 'running' });
      
      return result;
    } catch (err) {
      log.error(`Failed to start agent ${agentId}:`, err);
      throw err;
    }
  }

  async stopAgent(agentId) {
    try {
      const result = await this.apiRequest(`/agents/${agentId}/stop`, {
        method: 'POST'
      });
      
      this.emit('agent-update', { id: agentId, status: 'stopped' });
      this.onAgentUpdate({ id: agentId, status: 'stopped' });
      
      return result;
    } catch (err) {
      log.error(`Failed to stop agent ${agentId}:`, err);
      throw err;
    }
  }

  async restartAgent(agentId) {
    try {
      await this.stopAgent(agentId);
      await new Promise(resolve => setTimeout(resolve, 1000));
      return await this.startAgent(agentId);
    } catch (err) {
      log.error(`Failed to restart agent ${agentId}:`, err);
      throw err;
    }
  }

  async getAgentStatus(agentId) {
    try {
      return await this.apiRequest(`/agents/${agentId}/status`);
    } catch (err) {
      log.error(`Failed to get agent status ${agentId}:`, err);
      return null;
    }
  }

  async getLogs(agentId, options = {}) {
    const { limit = 100, since, level } = options;
    
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit);
      if (since) params.append('since', since);
      if (level) params.append('level', level);
      
      return await this.apiRequest(`/agents/${agentId}/logs?${params}`);
    } catch (err) {
      log.error(`Failed to get logs for agent ${agentId}:`, err);
      return [];
    }
  }

  // Task Management
  async listTasks(options = {}) {
    const { limit = 50, offset = 0, status, agentId, since } = options;
    
    try {
      const params = new URLSearchParams();
      if (limit) params.append('limit', limit);
      if (offset) params.append('offset', offset);
      if (status) params.append('status', status);
      if (agentId) params.append('agentId', agentId);
      if (since) params.append('since', since);
      
      const tasks = await this.apiRequest(`/tasks?${params}`);
      
      // Update local cache
      tasks.forEach(task => {
        this.tasks.set(task.id, task);
      });
      
      return tasks;
    } catch (err) {
      log.error('Failed to list tasks:', err);
      return Array.from(this.tasks.values()).slice(offset, offset + limit);
    }
  }

  async getTask(taskId) {
    try {
      const task = await this.apiRequest(`/tasks/${taskId}`);
      this.tasks.set(taskId, task);
      return task;
    } catch (err) {
      log.error(`Failed to get task ${taskId}:`, err);
      return this.tasks.get(taskId);
    }
  }

  async cancelTask(taskId) {
    try {
      const result = await this.apiRequest(`/tasks/${taskId}/cancel`, {
        method: 'POST'
      });
      
      this.emit('task-update', { id: taskId, status: 'cancelled' });
      this.onTaskUpdate({ id: taskId, status: 'cancelled' });
      
      return result;
    } catch (err) {
      log.error(`Failed to cancel task ${taskId}:`, err);
      throw err;
    }
  }

  // Performance Metrics
  async getPerformanceMetrics(agentId, options = {}) {
    const { period = '1h' } = options;
    
    try {
      return await this.apiRequest(`/agents/${agentId}/metrics?period=${period}`);
    } catch (err) {
      log.error(`Failed to get metrics for agent ${agentId}:`, err);
      return null;
    }
  }

  async getSystemMetrics() {
    try {
      return await this.apiRequest('/system/metrics');
    } catch (err) {
      log.error('Failed to get system metrics:', err);
      return null;
    }
  }

  // Handle real-time updates from WebSocket
  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'agent:status':
        this.agents.set(message.data.id, message.data);
        this.emit('agent-update', message.data);
        this.onAgentUpdate(message.data);
        break;
        
      case 'agent:log':
        this.emit('agent-log', message.data);
        break;
        
      case 'task:update':
        this.tasks.set(message.data.id, message.data);
        this.emit('task-update', message.data);
        this.onTaskUpdate(message.data);
        break;
        
      case 'task:completed':
        this.tasks.set(message.data.id, message.data);
        this.emit('task-completed', message.data);
        this.onTaskUpdate(message.data);
        break;
        
      default:
        log.debug('Unknown WebSocket message type:', message.type);
    }
  }
}

module.exports = AgentController;
