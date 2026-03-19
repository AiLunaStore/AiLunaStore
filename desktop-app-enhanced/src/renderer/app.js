/**
 * Mission Control - Renderer Process
 * Main application logic for the dashboard UI
 */

class MissionControlApp {
  constructor() {
    this.currentView = 'dashboard';
    this.serverStatus = { state: 'connecting' };
    this.agents = [];
    this.tasks = [];
    this.logs = [];
    this.updateInfo = null;
    this.tutorialStep = 1;
    this.charts = {};
    
    this.init();
  }

  async init() {
    await this.loadPreferences();
    this.setupEventListeners();
    this.setupIPCListeners();
    this.setupKeyboardShortcuts();
    this.renderCurrentView();
    
    // Initial data load
    await this.refreshAllData();
  }

  async loadPreferences() {
    const prefs = await window.electronAPI.prefs.getAll();
    
    // Apply theme
    if (prefs.theme && prefs.theme !== 'system') {
      document.documentElement.setAttribute('data-theme', prefs.theme);
    }
    
    // Apply sidebar state
    if (prefs.sidebarCollapsed) {
      document.getElementById('sidebar').classList.add('collapsed');
    }
    
    // Set active view
    if (prefs.activeView) {
      this.switchView(prefs.activeView);
    }
    
    // Populate settings
    document.getElementById('serverUrlInput').value = prefs.serverUrl || 'http://localhost:8080';
    document.getElementById('themeSelect').value = prefs.theme || 'system';
    document.getElementById('autoUpdate').checked = prefs.autoUpdate !== false;
    document.getElementById('enableNotifications').checked = prefs.notifications !== false;
    document.getElementById('minimizeToTray').checked = prefs.minimizeToTray || false;
    document.getElementById('appVersion').textContent = window.electronAPI.app.version;
  }

  setupEventListeners() {
    // Navigation - use event delegation for better performance
    const sidebar = document.getElementById('sidebar');
    if (sidebar) {
      sidebar.addEventListener('click', (e) => {
        const navItem = e.target.closest('.nav-item[data-view]');
        if (navItem) {
          const view = navItem.dataset.view;
          this.switchView(view);
        }
      });
    }

    // Also handle the old way for compatibility
    document.querySelectorAll('.nav-item[data-view]').forEach(item => {
      item.addEventListener('click', (e) => {
        e.stopPropagation();
        const view = item.dataset.view;
        this.switchView(view);
      });
    });

    // Sidebar toggle
    document.getElementById('sidebarToggle').addEventListener('click', () => {
      document.getElementById('sidebar').classList.toggle('collapsed');
      window.electronAPI.prefs.set('sidebarCollapsed', 
        document.getElementById('sidebar').classList.contains('collapsed')
      );
    });

    // Window controls
    document.getElementById('minimizeBtn').addEventListener('click', () => {
      window.electronAPI.window.minimize();
    });

    document.getElementById('maximizeBtn').addEventListener('click', () => {
      window.electronAPI.window.maximize();
    });

    document.getElementById('closeBtn').addEventListener('click', () => {
      window.electronAPI.window.close();
    });

    // Server status click
    document.getElementById('serverStatus').addEventListener('click', () => {
      this.showConnectionModal();
    });

    // Refresh buttons
    document.getElementById('refreshDashboard').addEventListener('click', () => this.refreshAllData());
    document.getElementById('refreshAgents').addEventListener('click', () => this.refreshAgents());
    document.getElementById('refreshTasks').addEventListener('click', () => this.refreshTasks());
    document.getElementById('refreshLogs').addEventListener('click', () => this.refreshLogs());

    // Reconnect button
    document.getElementById('reconnectBtn').addEventListener('click', () => {
      window.electronAPI.server.reconnect();
    });

    // Modal controls
    document.getElementById('closeConnectionModal').addEventListener('click', () => {
      document.getElementById('connectionModal').classList.remove('active');
    });

    document.getElementById('closeModalBtn').addEventListener('click', () => {
      document.getElementById('connectionModal').classList.remove('active');
    });

    document.getElementById('modalReconnectBtn').addEventListener('click', () => {
      window.electronAPI.server.reconnect();
      document.getElementById('connectionModal').classList.remove('active');
    });

    // Update modal
    document.getElementById('updateBtn').addEventListener('click', () => {
      this.showUpdateModal();
    });

    document.getElementById('closeUpdateModal').addEventListener('click', () => {
      document.getElementById('updateModal').classList.remove('active');
    });

    document.getElementById('downloadUpdateBtn').addEventListener('click', () => {
      // Trigger download via main process
      document.getElementById('updateProgressBar').style.display = 'block';
      document.getElementById('updateStatus').textContent = 'Downloading...';
    });

    document.getElementById('laterUpdateBtn').addEventListener('click', () => {
      document.getElementById('updateModal').classList.remove('active');
    });

    // Settings
    document.getElementById('saveServerSettings').addEventListener('click', () => {
      this.saveServerSettings();
    });

    document.getElementById('saveAppearanceSettings').addEventListener('click', () => {
      this.saveAppearanceSettings();
    });

    document.getElementById('saveNotificationSettings').addEventListener('click', () => {
      this.saveNotificationSettings();
    });

    document.getElementById('checkUpdatesBtn').addEventListener('click', () => {
      window.electronAPI.update.check();
      this.showToast('Checking for updates...', 'info');
    });

    // Tutorial
    document.getElementById('showTutorial').addEventListener('click', () => {
      this.startTutorial();
    });

    document.getElementById('tutorialNext').addEventListener('click', () => {
      this.nextTutorialStep();
    });

    document.getElementById('tutorialPrev').addEventListener('click', () => {
      this.prevTutorialStep();
    });

    document.getElementById('tutorialFinish').addEventListener('click', () => {
      this.finishTutorial();
    });

    document.getElementById('tutorialSkip').addEventListener('click', () => {
      this.finishTutorial();
    });

    // Task export
    document.getElementById('exportTasks').addEventListener('click', () => {
      this.exportTasks();
    });

    // External links
    document.getElementById('viewDocs').addEventListener('click', () => {
      window.electronAPI.system.openExternal('https://github.com/thizz23much/openclaw-mission-control');
    });

    document.getElementById('reportIssue').addEventListener('click', () => {
      window.electronAPI.system.openExternal('https://github.com/thizz23much/openclaw-mission-control/issues');
    });

    // Filter changes
    document.getElementById('taskFilter').addEventListener('change', () => {
      this.renderTasks();
    });

    document.getElementById('logAgentFilter').addEventListener('change', () => {
      this.renderLogs();
    });

    document.getElementById('logLevelFilter').addEventListener('change', () => {
      this.renderLogs();
    });
  }

  setupIPCListeners() {
    // Server status
    window.electronAPI.server.onStatusChange((status) => {
      this.serverStatus = status;
      this.updateServerStatusUI(status);
    });

    window.electronAPI.server.onMetrics((metrics) => {
      this.updateMetricsUI(metrics);
    });

    // Agent updates
    window.electronAPI.agent.onUpdate((update) => {
      this.showToast(`Agent ${update.id} is now ${update.status}`, 'info');
      this.refreshAgents();
    });

    // Task updates
    window.electronAPI.task.onUpdate((update) => {
      this.refreshTasks();
    });

    // Update events
    window.electronAPI.update.onAvailable((info) => {
      this.updateInfo = info;
      document.getElementById('updateBtn').style.display = 'flex';
      this.showToast(`Update available: v${info.version}`, 'info');
    });

    window.electronAPI.update.onProgress((progress) => {
      const percent = Math.round(progress.percent);
      document.getElementById('updateProgressFill').style.width = `${percent}%`;
      document.getElementById('updateStatus').textContent = `Downloading... ${percent}%`;
    });

    window.electronAPI.update.onDownloaded((info) => {
      document.getElementById('updateStatus').textContent = 'Ready to install';
      document.getElementById('downloadUpdateBtn').textContent = 'Install & Restart';
      document.getElementById('downloadUpdateBtn').onclick = () => {
        window.electronAPI.update.install();
      };
      this.showToast('Update ready to install', 'success');
    });

    window.electronAPI.update.onError((error) => {
      this.showToast(`Update error: ${error}`, 'error');
    });

    // Tutorial
    window.electronAPI.tutorial.onStart(() => {
      this.startTutorial();
    });
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      // Ctrl/Cmd + number for view switching
      if ((e.ctrlKey || e.metaKey) && e.key >= '1' && e.key <= '5') {
        const views = ['dashboard', 'agents', 'tasks', 'performance', 'logs'];
        const index = parseInt(e.key) - 1;
        if (views[index]) {
          this.switchView(views[index]);
        }
      }

      // Ctrl/Cmd + R to refresh
      if ((e.ctrlKey || e.metaKey) && e.key === 'r') {
        e.preventDefault();
        this.refreshAllData();
      }

      // Ctrl/Cmd + , for settings
      if ((e.ctrlKey || e.metaKey) && e.key === ',') {
        e.preventDefault();
        this.switchView('settings');
      }

      // Escape to close modals
      if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
          modal.classList.remove('active');
        });
      }
    });
  }

  switchView(viewName) {
    try {
      // Update nav
      document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === viewName);
      });

      // Update view
      document.querySelectorAll('.view').forEach(view => {
        view.classList.toggle('active', view.id === `${viewName}View`);
      });

      this.currentView = viewName;

      // Save preference (fire and forget)
      if (window.electronAPI && window.electronAPI.prefs) {
        window.electronAPI.prefs.set('activeView', viewName).catch(() => {});
      }

      // View-specific initialization
      if (viewName === 'performance') {
        setTimeout(() => this.initCharts(), 100);
      }
    } catch (err) {
      console.error('Error switching view:', err);
    }
  }

  updateServerStatusUI(status) {
    const led = document.getElementById('statusLed');
    const text = document.getElementById('statusText');

    if (!led || !text) return;

    led.className = 'status-led';

    switch (status.state) {
      case 'connected':
        led.classList.add('connected');
        text.textContent = 'Online';
        break;
      case 'connecting':
        led.classList.add('connecting');
        text.textContent = 'Connecting...';
        break;
      case 'disconnected':
        led.classList.add('disconnected');
        text.textContent = 'Offline';
        break;
      case 'simulation':
        led.classList.add('simulation');
        text.textContent = 'Simulation';
        break;
      default:
        text.textContent = 'Unknown';
    }

    // Update dashboard
    const serverBadge = document.getElementById('serverBadge');
    if (serverBadge) {
      serverBadge.textContent = status.state;
      const badgeClass = status.state === 'connected' ? 'success' :
                        status.state === 'connecting' ? 'warning' :
                        status.state === 'simulation' ? 'info' : 'error';
      serverBadge.className = `badge badge-${badgeClass}`;
    }

    const serverUrl = document.getElementById('serverUrl');
    if (serverUrl) serverUrl.textContent = status.url || '-';

    const reconnections = document.getElementById('reconnections');
    if (reconnections) reconnections.textContent = status.reconnections || 0;
  }

  updateMetricsUI(metrics) {
    if (metrics.latency) {
      document.getElementById('serverLatency').textContent = `${metrics.latency}ms`;
      document.getElementById('statAvgLatency').textContent = `${metrics.latency}ms`;
    }
    if (metrics.lastPing) {
      document.getElementById('lastPing').textContent = new Date(metrics.lastPing).toLocaleTimeString();
    }
  }

  async refreshAllData() {
    await Promise.all([
      this.refreshAgents(),
      this.refreshTasks(),
      this.refreshLogs()
    ]);
  }

  async refreshAgents() {
    try {
      this.agents = await window.electronAPI.agent.list();
      this.renderAgents();
      this.updateAgentCounts();
      
      // Update bubble visualization if it exists
      if (this.bubbleVisualization && this.currentView === 'agents') {
        this.bubbleVisualization.updateFromAgents(this.agents);
      }
    } catch (err) {
      console.error('Failed to refresh agents:', err);
    }
  }

  async refreshTasks() {
    try {
      this.tasks = await window.electronAPI.task.list({ limit: 50 });
      this.renderTasks();
      this.updateTaskCounts();
    } catch (err) {
      console.error('Failed to refresh tasks:', err);
    }
  }

  async refreshLogs() {
    // Logs would be fetched from the main process
    this.renderLogs();
  }

  renderAgents() {
    const grid = document.getElementById('agentsGrid');
    const dashboardList = document.getElementById('dashboardAgentList');

    if (this.agents.length === 0) {
      grid.innerHTML = '<p class="empty-state">No agents found</p>';
      dashboardList.innerHTML = '<p class="empty-state">No agents connected</p>';
      return;
    }

    // Dashboard list (top 5)
    dashboardList.innerHTML = this.agents.slice(0, 5).map(agent => `
      <div class="agent-item">
        <span class="agent-status ${agent.status}"></span>
        <span class="agent-name">${agent.name || agent.id}</span>
        <span class="agent-type">${agent.model || agent.type || 'Unknown'}</span>
      </div>
    `).join('');

    // Full grid
    grid.innerHTML = this.agents.map(agent => {
      // Determine badge class based on status
      let badgeClass = 'info';
      if (agent.status === 'active') badgeClass = 'success';
      else if (agent.status === 'thinking') badgeClass = 'warning';
      else if (agent.status === 'idle') badgeClass = 'info';
      else if (agent.status === 'error') badgeClass = 'error';
      
      return `
      <div class="agent-card" data-agent-id="${agent.id}">
        <div class="agent-card-header">
          <span class="agent-card-icon">🤖</span>
          <div class="agent-card-title">
            <h4>${agent.name || agent.id}</h4>
            <span>${agent.model || agent.type || 'Unknown type'}</span>
          </div>
          <span class="badge badge-${badgeClass}">
            ${agent.status}
          </span>
        </div>
        <div class="card-body">
          <div class="metric-row">
            <span class="metric-label">Model:</span>
            <span class="metric-value">${agent.model || 'Unknown'}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Tasks Completed:</span>
            <span class="metric-value">${agent.tasksCompleted || 0}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Uptime:</span>
            <span class="metric-value">${agent.uptime || '0h'}</span>
          </div>
          <div class="metric-row">
            <span class="metric-label">Last Active:</span>
            <span class="metric-value">${agent.lastActive ? new Date(agent.lastActive).toLocaleString() : 'Never'}</span>
          </div>
          ${agent.parentId ? `
          <div class="metric-row">
            <span class="metric-label">Parent:</span>
            <span class="metric-value">${agent.parentId}</span>
          </div>
          ` : ''}
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" onclick="app.controlAgent('${agent.id}', 'start')" ${agent.status === 'active' ? 'disabled' : ''}>
            Start
          </button>
          <button class="btn btn-secondary" onclick="app.controlAgent('${agent.id}', 'stop')" ${agent.status !== 'active' ? 'disabled' : ''}>
            Stop
          </button>
          <button class="btn btn-secondary" onclick="app.controlAgent('${agent.id}', 'restart')">
            Restart
          </button>
        </div>
      </div>
    `}).join('');
  }

  renderTasks() {
    const filter = document.getElementById('taskFilter').value;
    const timeline = document.getElementById('taskTimeline');
    const dashboardList = document.getElementById('dashboardTaskList');

    let filteredTasks = this.tasks;
    if (filter !== 'all') {
      filteredTasks = this.tasks.filter(t => t.status === filter);
    }

    if (filteredTasks.length === 0) {
      timeline.innerHTML = '<p class="empty-state">No tasks found</p>';
      dashboardList.innerHTML = '<p class="empty-state">No recent tasks</p>';
      return;
    }

    // Dashboard list (top 5)
    dashboardList.innerHTML = filteredTasks.slice(0, 5).map(task => `
      <div class="task-item">
        <span class="badge badge-${task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : task.status === 'running' ? 'warning' : 'info'}">
          ${task.status}
        </span>
        <span class="task-name">${task.name || task.id}</span>
        <span class="task-time">${task.timestamp ? new Date(task.timestamp).toLocaleTimeString() : ''}</span>
      </div>
    `).join('');

    // Full timeline
    timeline.innerHTML = filteredTasks.map((task, index) => `
      <div class="timeline-item">
        <div class="timeline-marker">
          <div class="timeline-dot" style="background: ${this.getStatusColor(task.status)}"></div>
          ${index < filteredTasks.length - 1 ? '<div class="timeline-line"></div>' : ''}
        </div>
        <div class="timeline-content">
          <div class="timeline-header">
            <span class="timeline-title">${task.name || task.id}</span>
            <span class="timeline-time">${task.timestamp ? new Date(task.timestamp).toLocaleString() : ''}</span>
          </div>
          <div class="timeline-body">
            <span class="badge badge-${task.status === 'completed' ? 'success' : task.status === 'failed' ? 'error' : task.status === 'running' ? 'warning' : 'info'}">
              ${task.status}
            </span>
            ${task.agentId ? `<span class="log-agent">via ${task.agentId}</span>` : ''}
            ${task.description ? `<p>${task.description}</p>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  renderLogs() {
    const agentFilter = document.getElementById('logAgentFilter').value;
    const levelFilter = document.getElementById('logLevelFilter').value;
    const container = document.getElementById('logsContainer');

    let filteredLogs = this.logs;
    if (agentFilter !== 'all') {
      filteredLogs = filteredLogs.filter(l => l.agentId === agentFilter);
    }
    if (levelFilter !== 'all') {
      filteredLogs = filteredLogs.filter(l => l.level === levelFilter);
    }

    if (filteredLogs.length === 0) {
      container.innerHTML = '<p class="empty-state">No logs found</p>';
      return;
    }

    container.innerHTML = filteredLogs.map(log => `
      <div class="log-entry">
        <span class="log-time">${new Date(log.timestamp).toLocaleTimeString()}</span>
        <span class="log-level ${log.level}">${log.level}</span>
        <span class="log-message">${log.message}</span>
        ${log.agentId ? `<span class="log-agent">[${log.agentId}]</span>` : ''}
      </div>
    `).join('');

    // Auto-scroll to bottom
    container.scrollTop = container.scrollHeight;
  }

  updateAgentCounts() {
    const activeCount = this.agents.filter(a => a.status === 'active' || a.status === 'thinking').length;
    document.getElementById('agentCount').textContent = this.agents.length;
    document.getElementById('activeAgentCount').textContent = activeCount;
  }

  updateTaskCounts() {
    const today = new Date().toDateString();
    const todayTasks = this.tasks.filter(t => 
      t.timestamp && new Date(t.timestamp).toDateString() === today
    );
    const completedTasks = this.tasks.filter(t => t.status === 'completed');
    const successRate = this.tasks.length > 0 
      ? Math.round((completedTasks.length / this.tasks.length) * 100) 
      : 0;

    document.getElementById('taskCount').textContent = this.tasks.length;
    document.getElementById('recentTaskCount').textContent = this.tasks.length;
    document.getElementById('statTasksToday').textContent = todayTasks.length;
    document.getElementById('statSuccessRate').textContent = `${successRate}%`;
  }

  getStatusColor(status) {
    const colors = {
      completed: 'var(--color-success)',
      failed: 'var(--color-error)',
      running: 'var(--color-warning)',
      pending: 'var(--color-info)'
    };
    return colors[status] || 'var(--text-muted)';
  }

  async controlAgent(agentId, action) {
    try {
      switch (action) {
        case 'start':
          await window.electronAPI.agent.start(agentId);
          break;
        case 'stop':
          await window.electronAPI.agent.stop(agentId);
          break;
        case 'restart':
          await window.electronAPI.agent.restart(agentId);
          break;
      }
      this.showToast(`Agent ${action}ed successfully`, 'success');
      setTimeout(() => this.refreshAgents(), 1000);
    } catch (err) {
      this.showToast(`Failed to ${action} agent: ${err.message}`, 'error');
    }
  }

  showConnectionModal() {
    const status = this.serverStatus;
    document.getElementById('modalStatus').textContent = status.state;
    document.getElementById('modalUrl').textContent = status.url || '-';
    document.getElementById('modalLatency').textContent = status.latency ? `${status.latency}ms` : '-';
    document.getElementById('modalLastPing').textContent = status.lastPing 
      ? new Date(status.lastPing).toLocaleString() 
      : '-';
    document.getElementById('modalRetries').textContent = status.retryCount || 0;
    document.getElementById('connectionModal').classList.add('active');
  }

  showUpdateModal() {
    if (this.updateInfo) {
      document.getElementById('currentVersion').textContent = window.electronAPI.app.version;
      document.getElementById('newVersion').textContent = this.updateInfo.version;
      document.getElementById('updateModal').classList.add('active');
    }
  }

  startTutorial() {
    this.tutorialStep = 1;
    document.getElementById('tutorialOverlay').style.display = 'flex';
    this.updateTutorialUI();
  }

  nextTutorialStep() {
    if (this.tutorialStep < 5) {
      this.tutorialStep++;
      this.updateTutorialUI();
    }
  }

  prevTutorialStep() {
    if (this.tutorialStep > 1) {
      this.tutorialStep--;
      this.updateTutorialUI();
    }
  }

  updateTutorialUI() {
    document.querySelectorAll('.tutorial-step').forEach((step, index) => {
      step.classList.toggle('active', index + 1 === this.tutorialStep);
    });

    document.querySelectorAll('.dot').forEach((dot, index) => {
      dot.classList.toggle('active', index + 1 === this.tutorialStep);
    });

    document.getElementById('tutorialPrev').style.display = this.tutorialStep === 1 ? 'none' : 'block';
    document.getElementById('tutorialNext').style.display = this.tutorialStep === 5 ? 'none' : 'block';
    document.getElementById('tutorialFinish').style.display = this.tutorialStep === 5 ? 'block' : 'none';
  }

  finishTutorial() {
    document.getElementById('tutorialOverlay').style.display = 'none';
    window.electronAPI.tutorial.complete();
  }

  async saveServerSettings() {
    const url = document.getElementById('serverUrlInput').value;
    await window.electronAPI.server.setUrl(url);
    this.showToast('Server settings saved', 'success');
  }

  async saveAppearanceSettings() {
    const theme = document.getElementById('themeSelect').value;
    const minimizeToTray = document.getElementById('minimizeToTray').checked;

    await window.electronAPI.prefs.set('theme', theme);
    await window.electronAPI.prefs.set('minimizeToTray', minimizeToTray);

    if (theme === 'system') {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', theme);
    }

    this.showToast('Appearance settings saved', 'success');
  }

  async saveNotificationSettings() {
    const notifications = document.getElementById('enableNotifications').checked;
    const autoUpdate = document.getElementById('autoUpdate').checked;

    await window.electronAPI.prefs.set('notifications', notifications);
    await window.electronAPI.prefs.set('autoUpdate', autoUpdate);

    this.showToast('Notification settings saved', 'success');
  }

  async exportTasks() {
    const format = 'json'; // Could be made selectable
    const result = await window.electronAPI.task.export(format);
    if (result.success) {
      this.showToast(`Tasks exported to ${result.path}`, 'success');
    }
  }

  showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = 'toast';
    
    const icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    toast.innerHTML = `
      <span class="toast-icon">${icons[type]}</span>
      <div class="toast-content">
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close">×</button>
    `;

    toast.querySelector('.toast-close').addEventListener('click', () => {
      toast.remove();
    });

    container.appendChild(toast);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      toast.remove();
    }, 5000);
  }

  initCharts() {
    // Simple canvas-based charts
    this.drawTokenChart();
    this.drawLatencyChart();
  }

  drawTokenChart() {
    const canvas = document.getElementById('tokenChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    // Sample data - would be replaced with real data
    const data = [30, 45, 35, 50, 40, 60, 55, 70, 65, 80, 75, 90];
    const max = Math.max(...data);
    const barWidth = (width / data.length) - 10;

    data.forEach((value, index) => {
      const barHeight = (value / max) * (height - 40);
      const x = index * (barWidth + 10) + 5;
      const y = height - barHeight - 20;

      // Draw bar
      ctx.fillStyle = 'var(--color-primary)';
      ctx.fillRect(x, y, barWidth, barHeight);

      // Draw label
      ctx.fillStyle = 'var(--text-muted)';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${index + 1}h`, x + barWidth / 2, height - 5);
    });
  }

  drawLatencyChart() {
    const canvas = document.getElementById('latencyChart');
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const width = canvas.width = canvas.offsetWidth;
    const height = canvas.height = canvas.offsetHeight;

    ctx.clearRect(0, 0, width, height);

    // Sample data
    const data = [120, 135, 128, 142, 130, 125, 138, 145, 132, 128, 140, 135];
    const max = Math.max(...data);
    const min = Math.min(...data);
    const range = max - min;

    ctx.beginPath();
    ctx.strokeStyle = 'var(--color-success)';
    ctx.lineWidth = 2;

    data.forEach((value, index) => {
      const x = (index / (data.length - 1)) * (width - 40) + 20;
      const y = height - 40 - ((value - min) / range) * (height - 60);

      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });

    ctx.stroke();

    // Draw area under line
    ctx.lineTo(width - 20, height - 40);
    ctx.lineTo(20, height - 40);
    ctx.closePath();
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.fill();
  }

  renderCurrentView() {
    // Initial render of current view
    if (this.currentView === 'dashboard') {
      this.updateServerStatusUI(this.serverStatus);
    } else if (this.currentView === 'agents') {
      this.initBubbleVisualization();
    }
  }

  initBubbleVisualization() {
    // Initialize bubble visualization
    this.bubbleVisualization = new BubbleVisualization();
    
    // Set up event listeners for bubble view
    document.getElementById('toggleViewBtn').addEventListener('click', () => {
      this.toggleAgentView();
    });
    
    document.getElementById('agentStatusFilter').addEventListener('change', () => {
      this.refreshAgents();
    });
    
    // Initial render
    setTimeout(() => {
      if (this.currentView === 'agents') {
        this.bubbleVisualization.init();
      }
    }, 100);
  }

  toggleAgentView() {
    const bubbleContainer = document.getElementById('bubbleContainer');
    const agentsGrid = document.getElementById('agentsGrid');
    const toggleBtn = document.getElementById('toggleViewBtn');
    
    if (bubbleContainer.style.display !== 'none') {
      // Switch to list view
      bubbleContainer.style.display = 'none';
      agentsGrid.style.display = 'grid';
      toggleBtn.textContent = '🌀 Bubble View';
    } else {
      // Switch to bubble view
      bubbleContainer.style.display = 'flex';
      agentsGrid.style.display = 'none';
      toggleBtn.textContent = '📋 List View';
      this.bubbleVisualization.init();
    }
  }
}

// Bubble Visualization Class
class BubbleVisualization {
  constructor() {
    this.canvas = document.getElementById('bubbleCanvas');
    this.ctx = this.canvas.getContext('2d');
    this.agents = [];
    this.bubbles = [];
    this.connections = [];
    this.isDragging = false;
    this.dragOffset = { x: 0, y: 0 };
    this.scale = 1;
    this.offset = { x: 0, y: 0 };
    this.animationId = null;
    
    this.initEventListeners();
    this.resizeCanvas();
  }

  init() {
    this.resizeCanvas();
    // Get agents from the global app instance
    if (typeof app !== 'undefined' && app.agents) {
      this.updateFromAgents(app.agents);
    } else {
      // Fallback to empty array if app not available
      this.updateFromAgents([]);
    }
    this.animate();
  }

  initEventListeners() {
    // Canvas interactions
    this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
    this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
    this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
    this.canvas.addEventListener('wheel', this.handleWheel.bind(this));
    
    // Touch events for mobile
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this));
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this));
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this));
    
    // Window resize
    window.addEventListener('resize', () => {
      this.resizeCanvas();
      this.render();
    });
  }

  resizeCanvas() {
    const container = this.canvas.parentElement;
    this.canvas.width = container.clientWidth;
    this.canvas.height = container.clientHeight;
    this.render();
  }

  updateFromAgents(agents) {
    // Filter agents based on selected filter
    const filter = document.getElementById('agentStatusFilter').value;
    let filteredAgents = agents;
    
    switch (filter) {
      case 'active':
        filteredAgents = agents.filter(a => a.status === 'active' || a.status === 'thinking');
        break;
      case 'active-only':
        filteredAgents = agents.filter(a => a.status === 'active');
        break;
      case 'thinking-only':
        filteredAgents = agents.filter(a => a.status === 'thinking');
        break;
      // 'all' shows all agents
    }
    
    this.agents = filteredAgents;
    this.createBubbles();
    this.createConnections();
    this.updateInfoDisplay();
    this.render();
  }

  createBubbles() {
    this.bubbles = [];
    
    // Calculate bubble positions using force-directed layout
    const centerX = this.canvas.width / 2;
    const centerY = this.canvas.height / 2;
    
    // Group agents by hierarchy
    const mainAgents = this.agents.filter(a => !a.id.includes('subagent-'));
    const subagents = this.agents.filter(a => a.id.includes('subagent-'));
    
    // Position main agents in a circle
    const radius = Math.min(this.canvas.width, this.canvas.height) * 0.3;
    const angleStep = (2 * Math.PI) / Math.max(mainAgents.length, 1);
    
    mainAgents.forEach((agent, index) => {
      const angle = index * angleStep;
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      
      // Calculate bubble size based on importance/activity
      const size = this.calculateBubbleSize(agent);
      const color = this.getStatusColor(agent.status);
      
      this.bubbles.push({
        id: agent.id,
        x,
        y,
        radius: size,
        color,
        agent,
        isDragging: false,
        targetX: x,
        targetY: y
      });
    });
    
    // Position subagents around their parent agents
    subagents.forEach(subagent => {
      const parentId = this.findParentId(subagent.id);
      const parentBubble = this.bubbles.find(b => b.id === parentId);
      
      if (parentBubble) {
        // Position subagent in orbit around parent
        const angle = Math.random() * 2 * Math.PI;
        const distance = parentBubble.radius + 80; // Minimum distance from parent
        const x = parentBubble.x + distance * Math.cos(angle);
        const y = parentBubble.y + distance * Math.sin(angle);
        
        const size = this.calculateBubbleSize(subagent);
        const color = this.getStatusColor(subagent.status);
        
        this.bubbles.push({
          id: subagent.id,
          x,
          y,
          radius: size,
          color,
          agent: subagent,
          isDragging: false,
          targetX: x,
          targetY: y,
          parentId
        });
      }
    });
  }

  createConnections() {
    this.connections = [];
    
    // Create connections between parent and subagents
    this.bubbles.forEach(bubble => {
      if (bubble.parentId) {
        const parentBubble = this.bubbles.find(b => b.id === bubble.parentId);
        if (parentBubble) {
          this.connections.push({
            from: parentBubble,
            to: bubble,
            color: this.getConnectionColor(parentBubble.agent.status, bubble.agent.status)
          });
        }
      }
    });
  }

  calculateBubbleSize(agent) {
    // Base size on importance/activity level
    const baseSize = 40;
    const importance = agent.importance || 0.5;
    const activityMultiplier = agent.status === 'active' ? 1.2 : 
                              agent.status === 'thinking' ? 1.1 : 0.8;
    
    return baseSize * importance * activityMultiplier;
  }

  getStatusColor(status) {
    switch (status) {
      case 'active': return '#22c55e'; // green
      case 'thinking': return '#eab308'; // yellow
      case 'idle': return '#94a3b8'; // gray
      default: return '#6366f1'; // primary
    }
  }

  getConnectionColor(parentStatus, childStatus) {
    // Make connection more visible if either agent is active
    if (parentStatus === 'active' || childStatus === 'active') {
      return 'rgba(34, 197, 94, 0.4)'; // green with opacity
    } else if (parentStatus === 'thinking' || childStatus === 'thinking') {
      return 'rgba(234, 179, 8, 0.4)'; // yellow with opacity
    }
    return 'rgba(148, 163, 184, 0.2)'; // gray with opacity
  }

  findParentId(subagentId) {
    // Find the subagent in our agents list
    const subagent = this.agents.find(a => a.id === subagentId);
    if (!subagent) return null;
    
    // Try to extract parent from currentTask field
    // Format: agent:main:subagent:uuid or similar
    if (subagent.currentTask) {
      const taskParts = subagent.currentTask.split(':');
      if (taskParts.length >= 2) {
        // The parent is usually the second part (e.g., "main" in "agent:main:subagent:uuid")
        return taskParts[1];
      }
    }
    
    // Fallback: check if it's a subagent of "main" by default
    // Most subagents in OpenClaw are created by the main agent
    if (subagentId.startsWith('subagent-')) {
      return 'main';
    }
    
    return null;
  }

  updateInfoDisplay() {
    const activeCount = this.agents.filter(a => a.status === 'active' || a.status === 'thinking').length;
    document.getElementById('activeAgentCount').textContent = activeCount;
    document.getElementById('totalAgentCount').textContent = this.agents.length;
  }

  handleMouseDown(e) {
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.scale - this.offset.x;
    const y = (e.clientY - rect.top) / this.scale - this.offset.y;
    
    // Check if clicking on a bubble
    for (let i = this.bubbles.length - 1; i >= 0; i--) {
      const bubble = this.bubbles[i];
      const distance = Math.sqrt((x - bubble.x) ** 2 + (y - bubble.y) ** 2);
      
      if (distance <= bubble.radius) {
        this.isDragging = true;
        bubble.isDragging = true;
        this.dragOffset.x = x - bubble.x;
        this.dragOffset.y = y - bubble.y;
        return;
      }
    }
    
    // If not clicking on a bubble, start panning
    this.isDragging = true;
    this.dragStart = { x: e.clientX, y: e.clientY };
    this.offsetStart = { ...this.offset };
  }

  handleMouseMove(e) {
    if (!this.isDragging) return;
    
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / this.scale;
    const y = (e.clientY - rect.top) / this.scale;
    
    // Find the bubble being dragged
    const draggingBubble = this.bubbles.find(b => b.isDragging);
    
    if (draggingBubble) {
      draggingBubble.x = x - this.offset.x - this.dragOffset.x;
      draggingBubble.y = y - this.offset.y - this.dragOffset.y;
    } else {
      // Pan the view
      this.offset.x = this.offsetStart.x + (e.clientX - this.dragStart.x) / this.scale;
      this.offset.y = this.offsetStart.y + (e.clientY - this.dragStart.y) / this.scale;
    }
    
    this.render();
  }

  handleMouseUp() {
    this.isDragging = false;
    this.bubbles.forEach(bubble => {
      bubble.isDragging = false;
    });
  }

  handleWheel(e) {
    e.preventDefault();
    
    const rect = this.canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    
    const zoomFactor = 0.1;
    const oldScale = this.scale;
    
    if (e.deltaY < 0) {
      // Zoom in
      this.scale = Math.min(this.scale * (1 + zoomFactor), 3);
    } else {
      // Zoom out
      this.scale = Math.max(this.scale * (1 - zoomFactor), 0.5);
    }
    
    // Adjust offset to zoom toward mouse position
    const scaleRatio = this.scale / oldScale;
    this.offset.x = mouseX / oldScale - (mouseX / this.scale - this.offset.x) * scaleRatio;
    this.offset.y = mouseY / oldScale - (mouseY / this.scale - this.offset.y) * scaleRatio;
    
    this.render();
  }

  handleTouchStart(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseDown(touch);
    }
  }

  handleTouchMove(e) {
    e.preventDefault();
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      this.handleMouseMove(touch);
    }
  }

  handleTouchEnd(e) {
    e.preventDefault();
    this.handleMouseUp();
  }

  render() {
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Save context state
    this.ctx.save();
    
    // Apply scale and offset
    this.ctx.translate(this.offset.x * this.scale, this.offset.y * this.scale);
    this.ctx.scale(this.scale, this.scale);
    
    // Draw connections first (behind bubbles)
    this.connections.forEach(connection => {
      this.drawConnection(connection);
    });
    
    // Draw bubbles
    this.bubbles.forEach(bubble => {
      this.drawBubble(bubble);
    });
    
    // Restore context state
    this.ctx.restore();
  }

  drawConnection(connection) {
    const { from, to, color } = connection;
    
    this.ctx.beginPath();
    this.ctx.moveTo(from.x, from.y);
    this.ctx.lineTo(to.x, to.y);
    this.ctx.strokeStyle = color;
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
  }

  
  // Performance optimization for bubble rendering
  drawBubble(bubble) {
    const { x, y, radius, color, agent } = bubble;
    const ctx = this.ctx;
    
    // Save context state
    ctx.save();
    
    // Draw bubble with smooth edges
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    // Add subtle shadow for depth
    ctx.shadowColor = 'rgba(0, 0, 0, 0.2)';
    ctx.shadowBlur = 10;
    ctx.shadowOffsetX = 2;
    ctx.shadowOffsetY = 2;
    
    // Draw border
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.stroke();
    
    // Reset shadow
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    
    // Draw agent info
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Inter, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(agent.name || agent.id, x, y);
    
    // Draw status indicator
    const statusColor = {
      'active': '#10b981',
      'thinking': '#f59e0b',
      'idle': '#6b7280',
      'error': '#ef4444'
    }[agent.status] || '#6b7280';
    
    ctx.fillStyle = statusColor;
    ctx.beginPath();
    ctx.arc(x + radius - 5, y - radius + 5, 4, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
  }

  animate() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    const animateFrame = () => {
      this.applyForces();
      this.render();
      this.animationId = requestAnimationFrame(animateFrame);
    };
    
    this.animationId = requestAnimationFrame(animateFrame);
  }

  applyForces() {
    // Simple force-directed layout
    const repulsionForce = 100;
    const attractionForce = 0.1;
    const damping = 0.9;
    
    // Apply repulsion between all bubbles
    for (let i = 0; i < this.bubbles.length; i++) {
      const bubble1 = this.bubbles[i];
      
      for (let j = i + 1; j < this.bubbles.length; j++) {
        const bubble2 = this.bubbles[j];
        
        const dx = bubble2.x - bubble1.x;
        const dy = bubble2.y - bubble1.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const minDistance = bubble1.radius + bubble2.radius + 20;
        
        if (distance < minDistance && distance > 0) {
          const force = repulsionForce / (distance * distance);
          const fx = force * dx / distance;
          const fy = force * dy / distance;
          
          bubble1.x -= fx;
          bubble1.y -= fy;
          bubble2.x += fx;
          bubble2.y += fy;
        }
      }
    }
    
    // Apply attraction for parent-child relationships
    this.connections.forEach(connection => {
      const { from, to } = connection;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const targetDistance = from.radius + to.radius + 80;
      
      if (distance > targetDistance) {
        const force = attractionForce * (distance - targetDistance);
        const fx = force * dx / distance;
        const fy = force * dy / distance;
        
        from.x += fx * 0.5;
        from.y += fy * 0.5;
        to.x -= fx * 0.5;
        to.y -= fy * 0.5;
      }
    });
    
    // Apply damping and move toward target positions
    this.bubbles.forEach(bubble => {
      if (!bubble.isDragging) {
        const dx = bubble.targetX - bubble.x;
        const dy = bubble.targetY - bubble.y;
        
        bubble.x += dx * 0.1;
        bubble.y += dy * 0.1;
        
        // Apply boundary constraints
        const padding = 50;
        bubble.x = Math.max(padding, Math.min(this.canvas.width / this.scale - padding, bubble.x));
        bubble.y = Math.max(padding, Math.min(this.canvas.height / this.scale - padding, bubble.y));
      }
      
      // Apply velocity damping
      bubble.x *= damping;
      bubble.y *= damping;
    });
  }
}

// Initialize app
const app = new MissionControlApp();
