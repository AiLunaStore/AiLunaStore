/**
 * Mission Control Dashboard JavaScript
 * Real-time cost visualization and monitoring
 */

class MissionControlDashboard {
  constructor() {
    this.data = {
      budgets: [],
      agents: [],
      history: [],
      currentSpending: 0,
      totalBudget: 0,
      alerts: []
    };
    
    this.charts = {};
    this.updateInterval = null;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.startDataUpdates();
    this.renderInitialState();
  }

  setupEventListeners() {
    // Handle visibility change to pause/resume updates
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.stopDataUpdates();
      } else {
        this.startDataUpdates();
      }
    });
  }

  startDataUpdates() {
    // Simulate data updates (in real implementation, this would fetch from API)
    this.updateInterval = setInterval(() => this.fetchData(), 2000);
    this.fetchData(); // Initial fetch
  }

  stopDataUpdates() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  async fetchData() {
    // In real implementation, this would fetch from the framework API
    // For demo purposes, we'll simulate the data structure
    
    try {
      // Simulate API call
      const mockData = this.generateMockData();
      this.updateDashboard(mockData);
      this.updateConnectionStatus(true);
    } catch (error) {
      console.error('Failed to fetch data:', error);
      this.updateConnectionStatus(false);
    }
  }

  generateMockData() {
    // Generate realistic mock data for demonstration
    const agents = [
      { id: 'ui-specialist', name: 'UI Specialist', model: 'moonshot/kimi-k2.5', quality: 9, speed: 6, costPerTask: 0.0069, tasks: 12, totalCost: 0.0828 },
      { id: 'backend-specialist', name: 'Backend Specialist', model: 'moonshot/kimi-k2.5', quality: 9, speed: 6, costPerTask: 0.0079, tasks: 8, totalCost: 0.0632 },
      { id: 'database-specialist', name: 'Database Specialist', model: 'deepseek/deepseek-chat', quality: 8, speed: 8, costPerTask: 0.0007, tasks: 15, totalCost: 0.0105 },
      { id: 'network-specialist', name: 'Network Specialist', model: 'deepseek/deepseek-chat', quality: 8, speed: 8, costPerTask: 0.00035, tasks: 6, totalCost: 0.0021 },
      { id: 'integration-specialist', name: 'Integration Specialist', model: 'anthropic/claude-3.5-haiku', quality: 7, speed: 8, costPerTask: 0.0094, tasks: 5, totalCost: 0.047 },
      { id: 'debugging-specialist', name: 'Debugging Specialist', model: 'anthropic/claude-3.5-sonnet', quality: 10, speed: 6, costPerTask: 0.057, tasks: 3, totalCost: 0.171 },
      { id: 'gpt4o-specialist', name: 'GPT-4o Specialist', model: 'openai/gpt-4o', quality: 9, speed: 7, costPerTask: 0.0338, tasks: 2, totalCost: 0.0676 }
    ];

    const totalSpent = agents.reduce((sum, a) => sum + a.totalCost, 0);
    const budgetLimit = 5.00;
    
    return {
      currentSpending: totalSpent,
      totalBudget: budgetLimit,
      budgetUtilization: (totalSpent / budgetLimit) * 100,
      qualityPerDollar: 85.5,
      costSavings: 0.45,
      savingsPercent: 23.5,
      avgCostPerTask: totalSpent / 51,
      totalExecutions: 51,
      successRate: 94,
      bestValueAgent: 'database-specialist',
      agents: agents.map(a => ({
        ...a,
        valueScore: (a.quality / a.costPerTask).toFixed(2)
      })),
      budgets: [
        { id: 'project-1', name: 'Project Alpha', limit: 2.00, spent: 0.85 },
        { id: 'project-2', name: 'Project Beta', limit: 1.50, spent: 0.32 },
        { id: 'project-3', name: 'Project Gamma', limit: 1.50, spent: 0.12 }
      ],
      alerts: totalSpent > budgetLimit * 0.8 ? [
        { type: 'warning', title: 'Budget Alert', message: 'Spending at 85% of total budget' }
      ] : []
    };
  }

  updateDashboard(data) {
    this.data = { ...this.data, ...data };
    
    this.updateOverviewCards();
    this.updateBudgetProgress();
    this.updateAgentsTable();
    this.updateEfficiencyMetrics();
    this.updateAlerts();
    this.updateCharts();
  }

  updateOverviewCards() {
    document.getElementById('currentSpending').textContent = `$${this.data.currentSpending.toFixed(4)}`;
    document.getElementById('budgetUtilization').textContent = `${this.data.budgetUtilization.toFixed(1)}%`;
    document.getElementById('qualityPerDollar').textContent = this.data.qualityPerDollar.toFixed(2);
    document.getElementById('costSavings').textContent = `$${this.data.costSavings.toFixed(2)}`;
    document.getElementById('savingsPercent').textContent = `${this.data.savingsPercent}% vs naive`;
    
    // Update utilization bar
    const utilizationBar = document.getElementById('utilizationBar');
    utilizationBar.style.width = `${Math.min(this.data.budgetUtilization, 100)}%`;
    
    // Color code the bar
    utilizationBar.className = 'progress-fill';
    if (this.data.budgetUtilization > 90) {
      utilizationBar.classList.add('danger');
    } else if (this.data.budgetUtilization > 70) {
      utilizationBar.classList.add('warning');
    }
  }

  updateBudgetProgress() {
    const container = document.getElementById('budgetContainer');
    container.innerHTML = '';
    
    for (const budget of this.data.budgets) {
      const utilization = (budget.spent / budget.limit) * 100;
      const budgetEl = document.createElement('div');
      budgetEl.className = 'budget-item';
      
      let fillClass = '';
      if (utilization > 90) fillClass = 'danger';
      else if (utilization > 70) fillClass = 'warning';
      
      budgetEl.innerHTML = `
        <div class="budget-header">
          <span class="budget-name">${budget.name}</span>
          <span class="budget-amount">$${budget.spent.toFixed(2)} / $${budget.limit.toFixed(2)}</span>
        </div>
        <div class="budget-progress">
          <div class="budget-fill ${fillClass}" style="width: ${Math.min(utilization, 100)}%">
            <span class="budget-percentage">${utilization.toFixed(0)}%</span>
          </div>
        </div>
      `;
      
      container.appendChild(budgetEl);
    }
  }

  updateAgentsTable() {
    const tbody = document.getElementById('agentsTableBody');
    tbody.innerHTML = '';
    
    for (const agent of this.data.agents) {
      const row = document.createElement('tr');
      
      const qualityClass = agent.quality >= 9 ? 'high' : agent.quality >= 7 ? 'medium' : 'low';
      const speedClass = agent.speed >= 8 ? 'fast' : agent.speed >= 6 ? 'medium' : 'slow';
      
      row.innerHTML = `
        <td><strong>${agent.name}</strong></td>
        <td><code>${agent.model}</code></td>
        <td><span class="quality-badge ${qualityClass}">${agent.quality}/10</span></td>
        <td><span class="speed-badge ${speedClass}">${agent.speed}/10</span></td>
        <td>$${agent.costPerTask.toFixed(4)}</td>
        <td>${agent.tasks}</td>
        <td>$${agent.totalCost.toFixed(4)}</td>
        <td><strong>${agent.valueScore}</strong></td>
      `;
      
      tbody.appendChild(row);
    }
  }

  updateEfficiencyMetrics() {
    document.getElementById('avgCostPerTask').textContent = `$${this.data.avgCostPerTask.toFixed(4)}`;
    document.getElementById('totalExecutions').textContent = this.data.totalExecutions;
    document.getElementById('successRate').textContent = `${this.data.successRate}%`;
    
    const bestAgent = this.data.agents.find(a => a.id === this.data.bestValueAgent);
    document.getElementById('bestValueAgent').textContent = bestAgent ? bestAgent.name : '--';
  }

  updateAlerts() {
    const container = document.getElementById('alertsContainer');
    
    if (this.data.alerts.length === 0) {
      container.innerHTML = '<div class="alert-placeholder">No active alerts</div>';
      return;
    }
    
    container.innerHTML = '';
    for (const alert of this.data.alerts) {
      const alertEl = document.createElement('div');
      alertEl.className = `alert ${alert.type}`;
      alertEl.innerHTML = `
        <div class="alert-icon">${alert.type === 'warning' ? '⚠️' : alert.type === 'danger' ? '🚨' : 'ℹ️'}</div>
        <div class="alert-content">
          <div class="alert-title">${alert.title}</div>
          <div class="alert-message">${alert.message}</div>
        </div>
      `;
      container.appendChild(alertEl);
    }
  }

  updateCharts() {
    this.drawCostChart();
    this.drawHistoryChart();
  }

  drawCostChart() {
    const canvas = document.getElementById('costChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw bar chart for agent costs
    const agents = this.data.agents;
    const maxCost = Math.max(...agents.map(a => a.totalCost));
    const barWidth = (width - 100) / agents.length;
    const chartHeight = height - 80;
    
    // Draw axes
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(50, 20);
    ctx.lineTo(50, height - 40);
    ctx.lineTo(width - 20, height - 40);
    ctx.stroke();
    
    // Draw bars
    agents.forEach((agent, index) => {
      const barHeight = (agent.totalCost / maxCost) * chartHeight;
      const x = 60 + index * barWidth;
      const y = height - 40 - barHeight;
      
      // Gradient
      const gradient = ctx.createLinearGradient(0, y, 0, height - 40);
      gradient.addColorStop(0, '#3b82f6');
      gradient.addColorStop(1, '#8b5cf6');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(x, y, barWidth - 10, barHeight);
      
      // Label
      ctx.fillStyle = '#94a3b8';
      ctx.font = '10px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(agent.name.split(' ')[0], x + (barWidth - 10) / 2, height - 25);
      
      // Value
      ctx.fillStyle = '#f8fafc';
      ctx.font = 'bold 11px sans-serif';
      ctx.fillText(`$${agent.totalCost.toFixed(2)}`, x + (barWidth - 10) / 2, y - 5);
    });
  }

  drawHistoryChart() {
    const canvas = document.getElementById('historyChart');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    ctx.clearRect(0, 0, width, height);
    
    // Simulate history data
    const historyPoints = 20;
    const data = [];
    let cumulative = 0;
    for (let i = 0; i < historyPoints; i++) {
      cumulative += Math.random() * 0.05;
      data.push(cumulative);
    }
    
    const maxValue = data[data.length - 1] * 1.1;
    const chartHeight = height - 60;
    
    // Draw grid
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
      const y = 30 + (chartHeight / 4) * i;
      ctx.beginPath();
      ctx.moveTo(50, y);
      ctx.lineTo(width - 20, y);
      ctx.stroke();
    }
    
    // Draw line
    ctx.strokeStyle = '#22c55e';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
      const x = 50 + (index / (historyPoints - 1)) * (width - 70);
      const y = 30 + chartHeight - (value / maxValue) * chartHeight;
      
      if (index === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    });
    
    ctx.stroke();
    
    // Draw area under line
    ctx.fillStyle = 'rgba(34, 197, 94, 0.1)';
    ctx.lineTo(50 + (data.length - 1) / (historyPoints - 1) * (width - 70), 30 + chartHeight);
    ctx.lineTo(50, 30 + chartHeight);
    ctx.closePath();
    ctx.fill();
    
    // Labels
    ctx.fillStyle = '#94a3b8';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(`$${maxValue.toFixed(2)}`, 45, 35);
    ctx.fillText('$0.00', 45, 30 + chartHeight);
  }

  updateConnectionStatus(connected) {
    const indicator = document.getElementById('connectionStatus');
    const text = document.getElementById('connectionText');
    
    if (connected) {
      indicator.classList.add('connected');
      text.textContent = 'Connected';
    } else {
      indicator.classList.remove('connected');
      text.textContent = 'Disconnected';
    }
  }

  renderInitialState() {
    // Render empty state
    this.updateOverviewCards();
    this.updateBudgetProgress();
    this.updateAgentsTable();
    this.updateEfficiencyMetrics();
    this.updateAlerts();
  }
}

// Initialize dashboard when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  window.dashboard = new MissionControlDashboard();
});