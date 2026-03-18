import { WebSocketServer } from 'ws';
import { EventEmitter } from 'events';

/**
 * WebSocket Bridge for Integrated Agent System
 * Connects the agent system to Mission Control dashboard
 */
export class WebSocketBridge extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.port = options.port || 8082;
    this.clients = new Set();
    this.server = null;
    this.agentSystem = null;
    
    // Heartbeat interval
    this.heartbeatInterval = setInterval(() => {
      this.broadcastHeartbeat();
    }, 5000);
  }

  /**
   * Connect to an IntegratedAgentSystem instance
   */
  connectToAgentSystem(agentSystem) {
    this.agentSystem = agentSystem;
    
    // Listen to agent system events
    agentSystem.on('onTaskStart', (data) => {
      this.broadcastEvent('task-start', data);
    });
    
    agentSystem.on('onTaskComplete', (data) => {
      this.broadcastEvent('task-complete', data);
    });
    
    agentSystem.on('onStageComplete', (data) => {
      this.broadcastEvent('stage-complete', data);
    });
    
    agentSystem.on('onBudgetAlert', (data) => {
      this.broadcastEvent('budget-alert', data);
    });
    
    agentSystem.on('onFallback', (data) => {
      this.broadcastEvent('fallback', data);
    });
    
    // Also listen to cost tracker events
    agentSystem.costTracker.on('costUpdated', (data) => {
      this.broadcastEvent('cost-updated', data);
    });
    
    agentSystem.costTracker.on('budgetAlert', (data) => {
      this.broadcastEvent('budget-alert-detailed', data);
    });
    
    console.log(`[WebSocket Bridge] Connected to agent system`);
  }

  /**
   * Start the WebSocket server
   */
  start() {
    if (this.server) {
      console.warn('[WebSocket Bridge] Server already running');
      return;
    }

    this.server = new WebSocketServer({ port: this.port });
    
    this.server.on('connection', (ws) => {
      console.log(`[WebSocket Bridge] New client connected`);
      this.clients.add(ws);
      
      // Send initial data
      this.sendInitialData(ws);
      
      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleClientMessage(ws, message);
        } catch (error) {
          console.error('[WebSocket Bridge] Error parsing message:', error);
        }
      });
      
      ws.on('close', () => {
        console.log(`[WebSocket Bridge] Client disconnected`);
        this.clients.delete(ws);
      });
      
      ws.on('error', (error) => {
        console.error(`[WebSocket Bridge] Client error:`, error);
        this.clients.delete(ws);
      });
    });
    
    this.server.on('error', (error) => {
      console.error(`[WebSocket Bridge] Server error:`, error);
    });
    
    console.log(`[WebSocket Bridge] Server started on port ${this.port}`);
  }

  /**
   * Send initial data to a new client
   */
  sendInitialData(ws) {
    if (!this.agentSystem) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Agent system not connected'
      }));
      return;
    }
    
    const dashboardData = this.agentSystem.getDashboardData();
    const status = this.agentSystem.getStatus();
    
    ws.send(JSON.stringify({
      type: 'init',
      data: {
        dashboard: dashboardData,
        systemStatus: status,
        timestamp: new Date().toISOString()
      }
    }));
  }

  /**
   * Broadcast event to all connected clients
   */
  broadcastEvent(type, data) {
    const message = JSON.stringify({
      type: 'event',
      event: type,
      data: data,
      timestamp: new Date().toISOString()
    });
    
    this.broadcast(message);
  }

  /**
   * Broadcast system status update
   */
  broadcastSystemStatus() {
    if (!this.agentSystem) return;
    
    const dashboardData = this.agentSystem.getDashboardData();
    const status = this.agentSystem.getStatus();
    
    const message = JSON.stringify({
      type: 'status-update',
      data: {
        dashboard: dashboardData,
        systemStatus: status
      },
      timestamp: new Date().toISOString()
    });
    
    this.broadcast(message);
  }

  /**
   * Broadcast heartbeat
   */
  broadcastHeartbeat() {
    const message = JSON.stringify({
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      clients: this.clients.size
    });
    
    this.broadcast(message);
  }

  /**
   * Broadcast to all clients
   */
  broadcast(message) {
    this.clients.forEach(client => {
      if (client.readyState === 1) { // OPEN
        try {
          client.send(message);
        } catch (error) {
          console.error('[WebSocket Bridge] Error broadcasting to client:', error);
        }
      }
    });
  }

  /**
   * Handle client messages
   */
  handleClientMessage(ws, message) {
    switch (message.type) {
      case 'request-dashboard':
        this.sendDashboardData(ws);
        break;
        
      case 'request-status':
        this.sendSystemStatus(ws);
        break;
        
      case 'execute-task':
        this.handleExecuteTask(message, ws);
        break;
        
      case 'update-config':
        this.handleUpdateConfig(message, ws);
        break;
        
      default:
        console.warn(`[WebSocket Bridge] Unknown message type: ${message.type}`);
    }
  }

  /**
   * Send dashboard data to specific client
   */
  sendDashboardData(ws) {
    if (!this.agentSystem) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Agent system not connected'
      }));
      return;
    }
    
    const dashboardData = this.agentSystem.getDashboardData();
    
    ws.send(JSON.stringify({
      type: 'dashboard-data',
      data: dashboardData,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Send system status to specific client
   */
  sendSystemStatus(ws) {
    if (!this.agentSystem) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Agent system not connected'
      }));
      return;
    }
    
    const status = this.agentSystem.getStatus();
    
    ws.send(JSON.stringify({
      type: 'system-status',
      data: status,
      timestamp: new Date().toISOString()
    }));
  }

  /**
   * Handle task execution request
   */
  async handleExecuteTask(message, ws) {
    if (!this.agentSystem) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Agent system not connected'
      }));
      return;
    }
    
    try {
      const { task, options } = message;
      
      // Send acknowledgement
      ws.send(JSON.stringify({
        type: 'task-acknowledged',
        taskId: options?.executionId || Date.now(),
        timestamp: new Date().toISOString()
      }));
      
      // Execute the task
      const result = await this.agentSystem.execute(task, options);
      
      // Send result
      ws.send(JSON.stringify({
        type: 'task-result',
        data: result,
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('[WebSocket Bridge] Error executing task:', error);
      
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Handle configuration update
   */
  handleUpdateConfig(message, ws) {
    if (!this.agentSystem) {
      ws.send(JSON.stringify({
        type: 'error',
        message: 'Agent system not connected'
      }));
      return;
    }
    
    try {
      const { config } = message;
      
      // Update agent system configuration
      // This would need to be implemented based on config structure
      console.log('[WebSocket Bridge] Configuration update:', config);
      
      ws.send(JSON.stringify({
        type: 'config-updated',
        timestamp: new Date().toISOString()
      }));
      
    } catch (error) {
      console.error('[WebSocket Bridge] Error updating config:', error);
      
      ws.send(JSON.stringify({
        type: 'error',
        message: error.message,
        timestamp: new Date().toISOString()
      }));
    }
  }

  /**
   * Stop the WebSocket server
   */
  stop() {
    if (this.server) {
      this.server.close();
      this.server = null;
    }
    
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
    
    this.clients.clear();
    console.log('[WebSocket Bridge] Server stopped');
  }

  /**
   * Get server status
   */
  getStatus() {
    return {
      port: this.port,
      clients: this.clients.size,
      connectedToAgentSystem: !!this.agentSystem,
      serverRunning: !!this.server
    };
  }
}