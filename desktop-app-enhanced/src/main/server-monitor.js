const EventEmitter = require('events');
const log = require('electron-log');

/**
 * ServerMonitor - Monitors connection to OpenClaw backend server
 * Features:
 * - Visual status indicator (connected/connecting/disconnected)
 * - Automatic reconnection with exponential backoff
 * - Health metrics collection
 * - WebSocket connection for real-time updates
 */
class ServerMonitor extends EventEmitter {
  constructor(options = {}) {
    super();
    
    this.serverUrl = options.serverUrl || 'http://localhost:8080';
    this.pingInterval = options.pingInterval || 30000; // 30 seconds
    this.maxRetries = options.maxRetries || 10;
    this.baseRetryDelay = options.baseRetryDelay || 1000; // 1 second
    this.maxRetryDelay = options.maxRetryDelay || 60000; // 1 minute
    
    this.state = 'disconnected'; // 'connected', 'connecting', 'disconnected'
    this.retryCount = 0;
    this.pingTimer = null;
    this.ws = null;
    this.metrics = {
      latency: null,
      lastPing: null,
      uptime: 0,
      reconnections: 0
    };
    
    this.onStatusChange = options.onStatusChange || (() => {});
    this.onMetrics = options.onMetrics || (() => {});
  }

  start() {
    log.info('Starting server monitor...');
    this.connect();
  }

  stop() {
    log.info('Stopping server monitor...');
    this.clearPingTimer();
    this.disconnectWebSocket();
    this.setState('disconnected');
  }

  async connect() {
    if (this.state === 'connected' || this.state === 'connecting') {
      return;
    }

    this.setState('connecting');
    
    try {
      await this.performHealthCheck();
      this.onConnectSuccess();
    } catch (err) {
      this.onConnectFailure(err);
    }
  }

  async performHealthCheck() {
    const startTime = Date.now();

    try {
      // Use Node's built-in fetch (available in Electron 28+) or fallback to electron.net
      const healthUrl = `${this.serverUrl}/api/health`;
      log.info('Performing health check to:', healthUrl);

      const response = await this.fetchWithTimeout(healthUrl, { timeout: 10000 });
      
      if (!response.ok) {
        throw new Error(`Health check failed: ${response.status}`);
      }
      
      const data = await response.json();
      const latency = Date.now() - startTime;
      
      this.metrics.latency = latency;
      this.metrics.lastPing = new Date().toISOString();
      
      return { ...data, latency };
    } catch (err) {
      throw new Error(`Health check failed: ${err.message}`);
    }
  }

  async fetchWithTimeout(url, options = {}) {
    const { timeout = 10000 } = options;

    // Use Node.js native fetch (available in Electron 28+/Node 18+)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      const response = await fetch(url, {
        signal: controller.signal,
        headers: {
          'Accept': 'application/json'
        }
      });

      clearTimeout(timeoutId);

      return {
        ok: response.ok,
        status: response.status,
        json: () => response.json()
      };
    } catch (err) {
      clearTimeout(timeoutId);
      throw err;
    }
  }

  onConnectSuccess() {
    log.info('Server connection established');
    this.retryCount = 0;
    this.setState('connected');
    this.metrics.reconnections++;
    
    // Start ping interval
    this.startPingTimer();
    
    // Connect WebSocket for real-time updates
    this.connectWebSocket();
  }

  onConnectFailure(err) {
    log.warn('Server connection failed:', err.message);
    this.setState('disconnected');

    // Schedule retry with exponential backoff
    if (this.retryCount < this.maxRetries) {
      const delay = Math.min(
        this.baseRetryDelay * Math.pow(2, this.retryCount),
        this.maxRetryDelay
      );

      log.info(`Retrying connection in ${delay}ms (attempt ${this.retryCount + 1}/${this.maxRetries})`);

      setTimeout(() => {
        this.retryCount++;
        this.connect();
      }, delay);
    } else {
      log.error('Max retries exceeded. Switching to simulation mode.');
      this.enableSimulationMode();
    }
  }

  enableSimulationMode() {
    log.info('Enabling simulation mode');
    this.setState('simulation');
    this.metrics = {
      latency: 0,
      lastPing: new Date().toISOString(),
      uptime: 0,
      reconnections: this.metrics.reconnections,
      mode: 'simulation'
    };

    // Emit simulation status
    this.emit('status-change', this.getStatus());
    this.onStatusChange(this.getStatus());

    // Continue trying to connect in background
    setTimeout(() => {
      this.retryCount = 0;
      this.connect();
    }, 60000); // Retry every minute in background
  }

  setState(newState) {
    if (this.state !== newState) {
      const oldState = this.state;
      this.state = newState;
      
      log.info(`Server state: ${oldState} -> ${newState}`);
      
      const status = this.getStatus();
      this.emit('status-change', status);
      this.onStatusChange(status);
    }
  }

  getStatus() {
    return {
      state: this.state,
      url: this.serverUrl,
      ...this.metrics,
      retryCount: this.retryCount
    };
  }

  startPingTimer() {
    this.clearPingTimer();
    
    this.pingTimer = setInterval(async () => {
      try {
        const health = await this.performHealthCheck();
        
        // Emit metrics
        this.emit('metrics', this.metrics);
        this.onMetrics(this.metrics);
        
        // Check if we were disconnected and now connected
        if (this.state !== 'connected') {
          this.setState('connected');
        }
      } catch (err) {
        log.warn('Ping failed:', err.message);
        
        if (this.state === 'connected') {
          this.setState('disconnected');
          // Try to reconnect
          this.connect();
        }
      }
    }, this.pingInterval);
  }

  clearPingTimer() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  
  connectWebSocket() {
    // WebSocket connection for real-time updates
    try {
      const wsUrl = this.serverUrl.replace(/^http/, 'ws') + '/ws';
      const WebSocket = require('ws');
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.on('open', () => {
        log.info('WebSocket connected to', wsUrl);
        // Subscribe to agent updates
        this.ws.send(JSON.stringify({ type: 'subscribe', topic: 'agents' }));
      });
      
      this.ws.on('message', (data) => {
        try {
          const message = JSON.parse(data);
          this.emit('ws-message', message);
          
          // Handle different message types
          if (message.type === 'agent:update') {
            this.emit('agent-update', message.data);
          } else if (message.type === 'task:update') {
            this.emit('task-update', message.data);
          }
        } catch (err) {
          log.error('Failed to parse WebSocket message:', err);
        }
      });
      
      this.ws.on('error', (err) => {
        log.error('WebSocket error:', err);
      });
      
      this.ws.on('close', () => {
        log.info('WebSocket disconnected');
        // Attempt to reconnect WebSocket
        setTimeout(() => {
          if (this.state === 'connected') {
            this.connectWebSocket();
          }
        }, 5000);
      });
    } catch (err) {
      log.error('Failed to connect WebSocket:', err);
    }
  }

  disconnectWebSocket() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  async reconnect() {
    log.info('Manual reconnect requested');
    this.stop();
    this.retryCount = 0;
    await this.connect();
  }

  setServerUrl(url) {
    log.info(`Server URL changed: ${this.serverUrl} -> ${url}`);
    this.serverUrl = url;
    this.reconnect();
  }
}

module.exports = ServerMonitor;
