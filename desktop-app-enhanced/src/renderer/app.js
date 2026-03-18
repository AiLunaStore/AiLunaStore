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
        <span class="agent-type">${agent.type || 'Unknown'}</span>
      </div>
    `).join('');

    // Full grid
    grid.innerHTML = this.agents.map(agent => `
      <div class="agent-card" data-agent-id="${agent.id}">
        <div class="agent-card-header">
          <span class="agent-card-icon">🤖</span>
          <div class="agent-card-title">
            <h4>${agent.name || agent.id}</h4>
            <span>${agent.type || 'Unknown type'}</span>
          </div>
          <span class="badge badge-${agent.status === 'running' ? 'success' : agent.status === 'error' ? 'error' : 'warning'}">
            ${agent.status}
          </span>
        </div>
        <div class="card-body">
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
        </div>
        <div class="card-footer">
          <button class="btn btn-primary" onclick="app.controlAgent('${agent.id}', 'start')" ${agent.status === 'running' ? 'disabled' : ''}>
            Start
          </button>
          <button class="btn btn-secondary" onclick="app.controlAgent('${agent.id}', 'stop')" ${agent.status !== 'running' ? 'disabled' : ''}>
            Stop
          </button>
          <button class="btn btn-secondary" onclick="app.controlAgent('${agent.id}', 'restart')">
            Restart
          </button>
        </div>
      </div>
    `).join('');
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
    const activeCount = this.agents.filter(a => a.status === 'running').length;
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
    }
  }
}

// Initialize app
const app = new MissionControlApp();
