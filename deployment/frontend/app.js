/**
 * Mission Control Frontend Application
 * Real-time dashboard for Integrated Agent System
 */

class MissionControlApp {
  constructor() {
    this.ws = null;
    this.reconnectInterval = 3000;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.currentView = 'dashboard';
    this.data = {
      agents: [],
      metrics: {},
      system: {},
      history: [],
      collaboration: {
        stats: {},
        agents: [],
        active: [],
        history: []
      }
    };
    this.charts = {};
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupCollaborationListeners();
    this.connectWebSocket();
    this.startPeriodicUpdates();
  }

  // WebSocket Connection
  connectWebSocket() {
    const wsUrl = localStorage.getItem('wsUrl') || 'ws://localhost:8080/ws';
    
    try {
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        this.updateConnectionStatus('connected');
        this.showToast('Connected to Mission Control', 'success');
      };
      
      this.ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          this.handleWebSocketMessage(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };
      
      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.updateConnectionStatus('disconnected');
        this.attemptReconnect();
      };
      
      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
        this.updateConnectionStatus('error');
      };
    } catch (error) {
      console.error('Failed to create WebSocket:', error);
      this.attemptReconnect();
    }
  }

  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.showToast('Failed to connect after multiple attempts', 'error');
      return;
    }
    
    this.reconnectAttempts++;
    this.updateConnectionStatus('connecting');
    
    setTimeout(() => {
      console.log(`Reconnecting... attempt ${this.reconnectAttempts}`);
      this.connectWebSocket();
    }, this.reconnectInterval);
  }

  handleWebSocketMessage(message) {
    switch (message.type) {
      case 'init':
      case 'update':
        this.updateData(message.data);
        this.render();
        break;
        
      case 'agents':
        this.data.agents = message.data;
        this.renderAgents();
        break;
        
      case 'metrics':
        this.data.metrics = message.data;
        this.renderMetrics();
        break;
        
      case 'task_result':
        this.handleTaskResult(message.data);
        break;
        
      case 'collaboration_stats':
        this.data.collaboration.stats = message.data;
        this.renderCollaborationStats();
        break;
        
      case 'collaboration_agents':
        this.data.collaboration.agents = message.data;
        this.renderSpecializedAgents();
        break;
        
      case 'active_collaborations':
        this.data.collaboration.active = message.data;
        this.renderActiveCollaborations();
        break;
        
      case 'collaboration_result':
        this.handleCollaborationResult(message.data);
        break;
        
      case 'collaboration_analysis':
        this.handleCollaborationAnalysis(message.data);
        break;
        
      case 'error':
        this.showToast(message.error, 'error');
        break;
        
      case 'pong':
        // Connection is alive
        break;
    }
  }

  sendMessage(type, payload = {}) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  // Data Management
  updateData(newData) {
    if (newData.agents) this.data.agents = newData.agents;
    if (newData.metrics) this.data.metrics = newData.metrics;
    if (newData.system) this.data.system = newData.system;
    if (newData.collaboration) this.data.collaboration = newData.collaboration;
  }

  // UI Rendering
  render() {
    this.renderMetrics();
    this.renderAgents();
    this.renderActivity();
    this.updateConnectionStatus(this.data.system.status === 'healthy' ? 'connected' : 'disconnected');
    
    // Render collaboration data if available
    if (this.data.collaboration) {
      this.renderCollaborationStats();
      this.renderSpecializedAgents();
      this.renderActiveCollaborations();
      this.renderCollaborationHistory();
    }
  }

  renderMetrics() {
    const m = this.data.metrics;
    
    // Update metric values
    this.updateElement('currentSpending', `$${(m.currentSpending || 0).toFixed(4)}`);
    this.updateElement('totalBudget', `$${(m.totalBudget || 10).toFixed(2)}`);
    this.updateElement('costSavings', `$${(m.costSavings || 0).toFixed(4)}`);
    this.updateElement('savingsPercent', `${(m.savingsPercent || 0).toFixed(1)}%`);
    this.updateElement('successRate', `${(m.successRate || 100).toFixed(1)}%`);
    this.updateElement('avgQuality', (m.avgQuality || 0).toFixed(1));
    this.updateElement('totalExecutions', m.totalExecutions || 0);
    this.updateElement('avgDuration', `${Math.round(m.avgDuration || 0)}ms`);
    
    // Update budget progress
    const budgetProgress = document.getElementById('budgetProgress');
    if (budgetProgress) {
      const utilization = (m.budgetUtilization || 0) * 100;
      budgetProgress.style.width = `${Math.min(utilization, 100)}%`;
      budgetProgress.className = 'progress-fill';
      if (utilization > 95) budgetProgress.classList.add('danger');
      else if (utilization > 80) budgetProgress.classList.add('warning');
    }
    
    // Update badges
    this.updateBadge('savingsBadge', `${(m.savingsPercent || 0).toFixed(0)}%`, m.savingsPercent > 30 ? 'success' : '');
    this.updateBadge('successBadge', `${(m.successRate || 100).toFixed(0)}%`, m.successRate > 95 ? 'success' : '');
    this.updateBadge('qualityBadge', (m.avgQuality || 0).toFixed(1), m.avgQuality > 8 ? 'success' : '');
  }

  renderAgents() {
    const agents = this.data.agents.agents || [];
    const container = document.getElementById('dashboardAgents');
    const listContainer = document.getElementById('agentsList');
    
    if (container) {
      container.innerHTML = agents.slice(0, 4).map(agent => this.createAgentCard(agent)).join('');
    }
    
    if (listContainer) {
      listContainer.innerHTML = agents.map(agent => this.createAgentCard(agent)).join('');
    }
    
    // Update badge
    const badge = document.getElementById('agentBadge');
    if (badge) {
      badge.textContent = this.data.agents.activeCount || 0;
      badge.style.display = (this.data.agents.activeCount || 0) > 0 ? 'block' : 'none';
    }
  }

  createAgentCard(agent) {
    const statusClass = agent.status || 'idle';
    const statusText = {
      active: 'Active',
      thinking: 'Thinking',
      idle: 'Idle',
      error: 'Error'
    }[statusClass] || 'Idle';
    
    return `
      <div class="agent-card">
        <div class="agent-header">
          <div class="agent-avatar">🤖</div>
          <div class="agent-info">
            <h4>${agent.name}</h4>
            <span>${agent.model}</span>
          </div>
          <span class="agent-status ${statusClass}">
            <span class="agent-status-dot"></span>
            ${statusText}
          </span>
        </div>
        <div class="agent-metrics">
          <div class="agent-metric">
            <span class="agent-metric-label">Tasks</span>
            <span class="agent-metric-value">${agent.tasksCompleted || 0}</span>
          </div>
          <div class="agent-metric">
            <span class="agent-metric-label">Current</span>
            <span class="agent-metric-value">${agent.currentTask || 'None'}</span>
          </div>
        </div>
      </div>
    `;
  }

  renderActivity() {
    const history = this.data.metrics.recentHistory || [];
    const container = document.getElementById('recentActivity');
    
    if (!container) return;
    
    if (history.length === 0) {
      container.innerHTML = '<div class="activity-item"><div class="activity-content"><div class="activity-title">No recent activity</div></div></div>';
      return;
    }
    
    container.innerHTML = history.slice(-5).reverse().map(item => {
      const isSuccess = !item.error;
      return `
        <div class="activity-item">
          <div class="activity-icon ${isSuccess ? 'success' : 'error'}">
            ${isSuccess ? '✓' : '✗'}
          </div>
          <div class="activity-content">
            <div class="activity-title">${item.taskType || 'Task'} - ${item.agent || 'Unknown'}</div>
            <div class="activity-meta">${item.model || 'Unknown model'} • ${new Date(item.timestamp).toLocaleTimeString()}</div>
          </div>
          <div class="activity-cost">$${(item.amount || 0).toFixed(4)}</div>
        </div>
      `;
    }).join('');
  }

  // Event Handlers
  setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', (e) => {
        e.preventDefault();
        const view = item.dataset.view;
        this.switchView(view);
      });
    });
    
    // Sidebar toggle
    const sidebarToggle = document.getElementById('sidebarToggle');
    if (sidebarToggle) {
      sidebarToggle.addEventListener('click', () => {
        document.getElementById('sidebar').classList.toggle('collapsed');
      });
    }
    
    // Strategy buttons
    document.querySelectorAll('.strategy-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.strategy-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.sendMessage('set_strategy', { mode: btn.dataset.strategy });
      });
    });
    
    // Quality slider
    const qualitySlider = document.getElementById('qualitySlider');
    if (qualitySlider) {
      qualitySlider.addEventListener('input', (e) => {
        const value = parseInt(e.target.value);
        const label = value < 33 ? 'Economy' : value < 66 ? 'Balanced' : 'Quality';
        document.getElementById('sliderValue').textContent = label;
      });
    }
    
    // Budget input
    const budgetInput = document.getElementById('budgetInput');
    if (budgetInput) {
      budgetInput.addEventListener('change', (e) => {
        this.sendMessage('update_budget', { limit: parseFloat(e.target.value) });
      });
    }
    
    // New task modal
    const newTaskBtn = document.getElementById('newTaskBtn');
    const closeTaskModal = document.getElementById('closeTaskModal');
    const cancelTask = document.getElementById('cancelTask');
    const submitTask = document.getElementById('submitTask');
    
    if (newTaskBtn) {
      newTaskBtn.addEventListener('click', () => {
        document.getElementById('newTaskModal').classList.add('active');
      });
    }
    
    if (closeTaskModal) {
      closeTaskModal.addEventListener('click', () => this.closeTaskModal());
    }
    
    if (cancelTask) {
      cancelTask.addEventListener('click', () => this.closeTaskModal());
    }
    
    if (submitTask) {
      submitTask.addEventListener('click', () => this.submitTask());
    }
    
    // Task complexity slider
    const taskComplexity = document.getElementById('taskComplexity');
    if (taskComplexity) {
      taskComplexity.addEventListener('input', (e) => {
        document.getElementById('complexityValue').textContent = e.target.value;
      });
    }
    
    // Refresh button
    const refreshBtn = document.getElementById('refreshBtn');
    if (refreshBtn) {
      refreshBtn.addEventListener('click', () => {
        this.sendMessage('get_metrics');
        this.showToast('Data refreshed', 'success');
      });
    }
    
    // Filter tabs
    document.querySelectorAll('.tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        this.filterAgents(tab.dataset.filter);
      });
    });
    
    // View all links
    document.querySelectorAll('.view-all').forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        this.switchView(link.dataset.view);
      });
    });
    
    // Close modal on backdrop click
    document.querySelectorAll('.modal').forEach(modal => {
      modal.addEventListener('click', (e) => {
        if (e.target === modal) {
          modal.classList.remove('active');
        }
      });
    });
  }

  switchView(viewName) {
    // Update nav
    document.querySelectorAll('.nav-item').forEach(item => {
      item.classList.toggle('active', item.dataset.view === viewName);
    });
    
    // Update view
    document.querySelectorAll('.view').forEach(view => {
      view.classList.toggle('active', view.id === viewName + 'View');
    });
    
    // Update title
    const titles = {
      dashboard: 'Dashboard',
      agents: 'Agents',
      collaboration: 'Collaboration',
      costs: 'Cost Analysis',
      performance: 'Performance',
      history: 'History',
      settings: 'Settings'
    };
    document.getElementById('pageTitle').textContent = titles[viewName] || viewName;
    
    this.currentView = viewName;
    
    // Load view-specific data
    if (viewName === 'costs') {
      this.renderCostsView();
    } else if (viewName === 'performance') {
      this.renderPerformanceView();
    } else if (viewName === 'history') {
      this.renderHistoryView();
    } else if (viewName === 'collaboration') {
      // Request collaboration data if not already loaded
      if (!this.data.collaboration.stats) {
        this.sendMessage('get_collaboration_stats');
      }
      if (!this.data.collaboration.agents.length) {
        this.sendMessage('get_collaboration_agents');
      }
      if (!this.data.collaboration.active.length) {
        this.sendMessage('get_active_collaborations');
      }
    }
  }

  // Task Management
  closeTaskModal() {
    document.getElementById('newTaskModal').classList.remove('active');
    document.getElementById('taskDescription').value = '';
  }

  submitTask() {
    const description = document.getElementById('taskDescription').value;
    if (!description.trim()) {
      this.showToast('Please enter a task description', 'error');
      return;
    }
    
    const task = {
      id: `task-${Date.now()}`,
      description,
      complexity: parseInt(document.getElementById('taskComplexity').value),
      domain: document.getElementById('taskDomain').value,
      strategy: document.getElementById('taskStrategy').value,
      budget: parseFloat(document.getElementById('taskBudget').value)
    };
    
    this.sendMessage('execute_task', task);
    this.closeTaskModal();
    this.showToast('Task submitted', 'success');
  }

  handleTaskResult(result) {
    if (result.success) {
      this.showToast(`Task completed in ${result.duration}ms`, 'success');
    } else {
      this.showToast(`Task failed: ${result.error}`, 'error');
    }
  }

  // View-specific rendering
  renderCostsView() {
    const m = this.data.metrics;
    
    // Model cost breakdown
    const modelChart = document.getElementById('modelCostChart');
    if (modelChart && m.byModel) {
      modelChart.innerHTML = this.createBarChart(m.byModel);
    }
    
    // Task type cost breakdown
    const taskTypeChart = document.getElementById('taskTypeCostChart');
    if (taskTypeChart && m.byTaskType) {
      taskTypeChart.innerHTML = this.createBarChart(m.byTaskType);
    }
    
    // Cost breakdown list
    const breakdownList = document.getElementById('costBreakdown');
    if (breakdownList && m.byModel) {
      const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444'];
      breakdownList.innerHTML = Object.entries(m.byModel).map(([key, data], i) => `
        <div class="breakdown-item">
          <div class="breakdown-label">
            <div class="breakdown-color" style="background: ${colors[i % colors.length]}"></div>
            <span>${key}</span>
          </div>
          <span class="breakdown-value">$${(data.total || 0).toFixed(4)}</span>
        </div>
      `).join('');
    }
  }

  renderPerformanceView() {
    const m = this.data.metrics;
    
    // Model performance table
    const table = document.getElementById('modelPerformanceTable');
    if (table && m.modelPerformance) {
      const tbody = table.querySelector('tbody');
      tbody.innerHTML = Object.entries(m.modelPerformance).map(([model, perf]) => `
        <tr>
          <td>${model}</td>
          <td>${(perf.successRate || 0).toFixed(1)}%</td>
          <td>$${(perf.averageCost || 0).toFixed(4)}</td>
          <td>${Math.round(perf.averageDuration || 0)}ms</td>
          <td>${(perf.averageQuality || 0).toFixed(1)}</td>
        </tr>
      `).join('');
    }
    
    // Progressive stats
    const progressiveStats = document.getElementById('progressiveStats');
    if (progressiveStats && m.progressiveStats) {
      const ps = m.progressiveStats;
      progressiveStats.innerHTML = `
        <div class="efficiency-list">
          <div class="breakdown-item">
            <span>Total Stages</span>
            <span class="breakdown-value">${ps.learning?.totalStages || 0}</span>
          </div>
          <div class="breakdown-item">
            <span>Avg Stages/Task</span>
            <span class="breakdown-value">${(ps.avgStages || 0).toFixed(2)}</span>
          </div>
        </div>
      `;
    }
  }

  renderHistoryView() {
    const history = this.data.metrics.recentHistory || [];
    const container = document.getElementById('historyList');
    
    if (!container) return;
    
    container.innerHTML = history.slice().reverse().map(item => `
      <div class="history-item">
        <div class="activity-icon ${item.error ? 'error' : 'success'}">
          ${item.error ? '✗' : '✓'}
        </div>
        <div class="activity-content">
          <div class="activity-title">${item.taskType || 'Task'} - ${item.agent || 'Unknown'}</div>
          <div class="activity-meta">${item.model || 'Unknown'} • ${new Date(item.timestamp).toLocaleString()}</div>
        </div>
        <div class="activity-cost">$${(item.amount || 0).toFixed(4)}</div>
      </div>
    `).join('');
  }

  createBarChart(data) {
    if (!data || Object.keys(data).length === 0) {
      return '<div style="text-align: center; color: var(--text-muted);">No data</div>';
    }
    
    const max = Math.max(...Object.values(data).map(d => d.total || d));
    const colors = ['#6366f1', '#8b5cf6', '#10b981', '#f59e0b', '#ef4444', '#3b82f6'];
    
    return `
      <div style="display: flex; flex-direction: column; gap: 8px; width: 100%;">
        ${Object.entries(data).map(([key, value], i) => {
          const val = value.total || value;
          const pct = (val / max * 100).toFixed(1);
          return `
            <div style="display: flex; align-items: center; gap: 12px;">
              <span style="width: 100px; font-size: 12px; color: var(--text-secondary); white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${key}</span>
              <div style="flex: 1; height: 24px; background: var(--bg-primary); border-radius: 4px; overflow: hidden;">
                <div style="width: ${pct}%; height: 100%; background: ${colors[i % colors.length]}; border-radius: 4px; transition: width 0.3s ease;"></div>
              </div>
              <span style="width: 60px; text-align: right; font-size: 12px; font-weight: 500;">$${val.toFixed(3)}</span>
            </div>
          `;
        }).join('')}
      </div>
    `;
  }

  // Utility Methods
  updateElement(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  updateBadge(id, value, className) {
    const el = document.getElementById(id);
    if (el) {
      el.textContent = value;
      el.className = 'metric-badge ' + className;
    }
  }

  updateConnectionStatus(status) {
    const dot = document.getElementById('statusDot');
    const text = document.getElementById('statusText');
    
    if (!dot || !text) return;
    
    dot.className = 'status-dot ' + status;
    
    const labels = {
      connected: 'Connected',
      disconnected: 'Disconnected',
      connecting: 'Connecting...',
      error: 'Error'
    };
    text.textContent = labels[status] || status;
  }

  filterAgents(filter) {
    const agents = this.data.agents.agents || [];
    const container = document.getElementById('agentsList');
    
    if (!container) return;
    
    const filtered = filter === 'all' ? agents : agents.filter(a => a.status === filter);
    container.innerHTML = filtered.map(agent => this.createAgentCard(agent)).join('');
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;
    
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <div class="toast-title">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
      <div class="toast-message">${message}</div>
    `;
    
    container.appendChild(toast);
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => toast.remove(), 300);
    }, 5000);
  }

  startPeriodicUpdates() {
    // Ping to keep connection alive
    setInterval(() => {
      this.sendMessage('ping');
    }, 30000);
  }

  // Collaboration Rendering Methods
  renderCollaborationStats() {
    const stats = this.data.collaboration.stats;
    const container = document.getElementById('collaborationStats');
    
    if (!container || !stats) return;
    
    container.innerHTML = `
      <div class="stat-card">
        <div class="stat-label">Total Collaborations</div>
        <div class="stat-value">${stats.totalCollaborations || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Success Rate</div>
        <div class="stat-value">${stats.successRate || '0%'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Avg Speedup</div>
        <div class="stat-value">${stats.averageSpeedup || '1.0'}x</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Cost Savings</div>
        <div class="stat-value">$${stats.totalCostSavings || '0.0000'}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Parallel Tasks</div>
        <div class="stat-value">${stats.parallelTasksExecuted || 0}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Efficiency Gain</div>
        <div class="stat-value">${stats.efficiencyGain || '0.0'}x</div>
      </div>
    `;
    
    // Update collaboration badge
    const badge = document.getElementById('collaborationBadge');
    if (badge) {
      const activeCount = this.data.collaboration.active?.length || 0;
      badge.textContent = activeCount;
      badge.style.display = activeCount > 0 ? 'block' : 'none';
    }
  }

  renderSpecializedAgents() {
    const agents = this.data.collaboration.agents || [];
    const container = document.getElementById('specializedAgents');
    
    if (!container) return;
    
    container.innerHTML = agents.map(agent => `
      <div class="specialized-agent">
        <div class="agent-header">
          <div class="agent-name">${agent.name}</div>
          <div class="agent-domains">${agent.domains.join(', ')}</div>
        </div>
        <div class="agent-stats">
          <div class="stat">
            <span class="stat-label">Quality:</span>
            <span class="stat-value">${agent.quality}/10</span>
          </div>
          <div class="stat">
            <span class="stat-label">Speed:</span>
            <span class="stat-value">${agent.speed}/10</span>
          </div>
          <div class="stat">
            <span class="stat-label">Cost:</span>
            <span class="stat-value">$${agent.costPerTask.toFixed(4)}</span>
          </div>
        </div>
        <div class="agent-models">
          <span class="model-tag">${agent.models[0]}</span>
          ${agent.models.length > 1 ? `<span class="model-tag">+${agent.models.length - 1}</span>` : ''}
        </div>
      </div>
    `).join('');
  }

  renderActiveCollaborations() {
    const active = this.data.collaboration.active || [];
    const container = document.getElementById('activeCollaborations');
    
    if (!container) return;
    
    if (active.length === 0) {
      container.innerHTML = '<div class="empty-state">No active collaborations</div>';
      return;
    }
    
    container.innerHTML = active.map(collab => `
      <div class="active-collab">
        <div class="collab-header">
          <div class="collab-id">${collab.id.substring(0, 8)}...</div>
          <div class="collab-status ${collab.status}">${collab.status}</div>
        </div>
        <div class="collab-progress">
          <div class="progress-bar">
            <div class="progress-fill" style="width: ${collab.progress || 0}%"></div>
          </div>
          <span class="progress-text">${collab.progress || 0}%</span>
        </div>
        <div class="collab-details">
          <div class="detail">
            <span class="detail-label">Duration:</span>
            <span class="detail-value">${Math.round(collab.duration / 1000)}s</span>
          </div>
          <div class="detail">
            <span class="detail-label">Subtasks:</span>
            <span class="detail-value">${collab.subtaskCount}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  renderCollaborationHistory() {
    const history = this.data.collaboration.history || [];
    const container = document.getElementById('collaborationHistory');
    
    if (!container) return;
    
    container.innerHTML = history.map(record => `
      <tr>
        <td>${record.taskId}</td>
        <td><span class="mode-tag ${record.mode}">${record.mode}</span></td>
        <td>${Math.round(record.duration / 1000)}s</td>
        <td>${record.speedupFactor.toFixed(2)}x</td>
        <td>$${record.cost.toFixed(4)}</td>
        <td><span class="status-badge ${record.success ? 'success' : 'error'}">${record.success ? '✓' : '✗'}</span></td>
      </tr>
    `).join('');
  }

  handleCollaborationResult(result) {
    if (result.success) {
      const speedup = result.metrics?.speedupFactor || 1.0;
      const message = `Collaboration completed with ${speedup.toFixed(2)}x speedup`;
      this.showToast(message, 'success');
    } else {
      this.showToast('Collaboration failed', 'error');
    }
  }

  handleCollaborationAnalysis(analysis) {
    const subtasks = analysis.subtasks || [];
    const message = `Task analyzed: ${subtasks.length} subtask${subtasks.length !== 1 ? 's' : ''} identified`;
    this.showToast(message, 'info');
  }

  // Setup collaboration event listeners
  setupCollaborationListeners() {
    const testBtn = document.getElementById('testCollaborationBtn');
    const analyzeBtn = document.getElementById('analyzeTaskBtn');
    
    if (testBtn) {
      testBtn.addEventListener('click', () => {
        this.sendMessage('execute_collaboration_task', {
          task: {
            id: 'test-collaboration',
            description: 'Test collaboration system with parallel agent delegation',
            complexity: 7
          },
          options: {
            budget: 3.00,
            strategy: 'balanced'
          }
        });
        this.showToast('Running collaboration test...', 'info');
      });
    }
    
    if (analyzeBtn) {
      analyzeBtn.addEventListener('click', () => {
        const description = prompt('Enter task description to analyze:');
        if (description) {
          this.sendMessage('analyze_collaboration_task', {
            task: {
              id: 'analysis-' + Date.now(),
              description,
              complexity: 5
            }
          });
        }
      });
    }
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.app = new MissionControlApp();
});
