/**
 * Mission Control Integrated Server
 * Production-ready backend with WebSocket support, integrated agent system, and real-time monitoring
 */

import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import winston from 'winston';
import { config } from 'dotenv';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { IntegratedAgentSystem } from './backend/integrated-agent-system.js';

// Load environment variables
config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configuration
const PORT = process.env.PORT || 8080;
const WS_PATH = process.env.WS_PATH || '/ws';
const NODE_ENV = process.env.NODE_ENV || 'production';
const CORS_ORIGINS = process.env.CORS_ORIGINS?.split(',') || ['http://localhost:3000', 'http://localhost:8081'];
const RATE_LIMIT_WINDOW = parseInt(process.env.RATE_LIMIT_WINDOW) || 60; // seconds
const RATE_LIMIT_MAX = parseInt(process.env.RATE_LIMIT_MAX) || 100;

// Initialize logger
const logger = winston.createLogger({
  level: NODE_ENV === 'production' ? 'info' : 'debug',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'mission-control' },
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

// Initialize Express app
const app = express();
const server = http.createServer(app);

// Security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", "ws:", "wss:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "blob:"]
    }
  }
}));

app.use(compression());
app.use(cors({
  origin: CORS_ORIGINS,
  credentials: true
}));

// Rate limiting
const rateLimiter = new RateLimiterMemory({
  keyPrefix: 'middleware',
  points: RATE_LIMIT_MAX,
  duration: RATE_LIMIT_WINDOW
});

const rateLimitMiddleware = async (req, res, next) => {
  try {
    await rateLimiter.consume(req.ip);
    next();
  } catch (rejRes) {
    res.status(429).json({
      error: 'Too Many Requests',
      retryAfter: Math.round(rejRes.msBeforeNext / 1000)
    });
  }
};

app.use(rateLimitMiddleware);
app.use(express.json({ limit: '10mb' }));
app.use(express.static(join(__dirname, 'frontend')));

// Initialize Integrated Agent System
const agentSystem = new IntegratedAgentSystem({
  defaultBudget: parseFloat(process.env.DEFAULT_BUDGET) || 10.00,
  alertThresholds: [0.5, 0.8, 0.95],
  maxHistorySize: 10000
});

// System state
const systemState = {
  startTime: Date.now(),
  totalRequests: 0,
  activeConnections: 0,
  wsClients: new Set(),
  metrics: {
    requestsPerMinute: 0,
    averageLatency: 0,
    errorRate: 0
  }
};

// WebSocket Server
const wss = new WebSocketServer({
  server,
  path: WS_PATH,
  perMessageDeflate: {
    zlibDeflateOptions: {
      chunkSize: 1024,
      memLevel: 7,
      level: 3
    },
    zlibInflateOptions: {
      chunkSize: 10 * 1024
    },
    clientNoContextTakeover: true,
    serverNoContextTakeover: true,
    serverMaxWindowBits: 10,
    concurrencyLimit: 10
  }
});

// WebSocket connection handler
wss.on('connection', (ws, req) => {
  const clientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  systemState.wsClients.add(ws);
  systemState.activeConnections++;
  
  logger.info(`WebSocket client connected: ${clientId}`, { 
    ip: req.socket.remoteAddress,
    userAgent: req.headers['user-agent']
  });

  // Send initial state
  sendToClient(ws, {
    type: 'init',
    data: {
      system: getSystemStatus(),
      agents: getAgentData(),
      metrics: getDashboardMetrics(),
      timestamp: Date.now()
    }
  });

  // Handle messages
  ws.on('message', async (message) => {
    try {
      const data = JSON.parse(message);
      await handleWebSocketMessage(ws, data, clientId);
    } catch (error) {
      logger.error('WebSocket message error:', error);
      sendToClient(ws, {
        type: 'error',
        error: 'Invalid message format'
      });
    }
  });

  // Handle close
  ws.on('close', (code, reason) => {
    systemState.wsClients.delete(ws);
    systemState.activeConnections--;
    logger.info(`WebSocket client disconnected: ${clientId}`, { code, reason });
  });

  // Handle errors
  ws.on('error', (error) => {
    logger.error(`WebSocket error for ${clientId}:`, error);
    systemState.wsClients.delete(ws);
    systemState.activeConnections--;
  });

  // Setup ping/pong for connection health
  ws.isAlive = true;
  ws.on('pong', () => {
    ws.isAlive = true;
  });
});

// WebSocket message handler
async function handleWebSocketMessage(ws, data, clientId) {
  const { type, payload } = data;
  
  switch (type) {
    case 'ping':
      sendToClient(ws, { type: 'pong', timestamp: Date.now() });
      break;
      
    case 'get_agents':
      sendToClient(ws, {
        type: 'agents',
        data: getAgentData()
      });
      break;
      
    case 'get_metrics':
      sendToClient(ws, {
        type: 'metrics',
        data: getDashboardMetrics()
      });
      break;
      
    case 'execute_task':
      const result = await executeTask(payload);
      sendToClient(ws, {
        type: 'task_result',
        data: result
      });
      break;
      
    case 'set_strategy':
      agentSystem.orchestrator.setExecutionMode(payload.mode);
      broadcastToAll({
        type: 'strategy_updated',
        data: { mode: payload.mode }
      });
      break;
      
    case 'update_budget':
      // Update budget configuration
      broadcastToAll({
        type: 'budget_updated',
        data: payload
      });
      break;
      
    default:
      sendToClient(ws, {
        type: 'error',
        error: `Unknown message type: ${type}`
      });
  }
}

// Send message to specific client
function sendToClient(ws, data) {
  if (ws.readyState === 1) { // WebSocket.OPEN
    ws.send(JSON.stringify(data));
  }
}

// Broadcast to all connected clients
function broadcastToAll(data) {
  const message = JSON.stringify(data);
  systemState.wsClients.forEach(ws => {
    if (ws.readyState === 1) {
      ws.send(message);
    }
  });
}

// Execute task through agent system
async function executeTask(taskData) {
  const startTime = Date.now();
  
  try {
    const result = await agentSystem.execute({
      id: taskData.id || `task-${Date.now()}`,
      description: taskData.description,
      complexity: taskData.complexity || 5,
      domain: taskData.domain || 'general'
    }, {
      strategy: taskData.strategy || 'balanced',
      budget: taskData.budget
    });
    
    return {
      success: true,
      result,
      duration: Date.now() - startTime
    };
  } catch (error) {
    logger.error('Task execution error:', error);
    return {
      success: false,
      error: error.message,
      duration: Date.now() - startTime
    };
  }
}

// Get agent data for dashboard
function getAgentData() {
  const status = agentSystem.getStatus();
  const dashboardData = agentSystem.getDashboardData();
  
  return {
    agents: Object.entries(status.agents || {}).map(([id, agent]) => ({
      id,
      name: agent.name || id,
      status: agent.status || 'idle',
      model: agent.primaryModel || 'unknown',
      tasksCompleted: agent.tasksCompleted || 0,
      currentTask: agent.currentTask || null,
      lastActive: agent.lastActive || null
    })),
    activeCount: status.activeExecutions || 0,
    totalCount: Object.keys(status.agents || {}).length
  };
}

// Get dashboard metrics
function getDashboardMetrics() {
  const dashboardData = agentSystem.getDashboardData();
  const perfReport = agentSystem.getPerformanceReport();
  
  return {
    // Cost metrics
    currentSpending: dashboardData.currentSpending || 0,
    totalBudget: dashboardData.totalBudget || 10.00,
    budgetUtilization: dashboardData.budgetUtilization || 0,
    avgCostPerTask: dashboardData.avgCostPerTask || 0,
    costSavings: dashboardData.costSavings || 0,
    savingsPercent: dashboardData.savingsPercent || 0,
    
    // Performance metrics
    totalExecutions: dashboardData.totalExecutions || 0,
    successRate: dashboardData.successRate || 100,
    avgDuration: dashboardData.avgDuration || 0,
    avgQuality: dashboardData.avgQuality || 0,
    
    // Progressive refinement stats
    progressiveStats: dashboardData.progressiveStats || {
      learning: { totalStages: 0, avgStages: 0 },
      thresholds: {},
      avgStages: 0
    },
    
    // Breakdowns
    byModel: dashboardData.byModel || {},
    byAgent: dashboardData.byAgent || {},
    byTaskType: dashboardData.byTaskType || {},
    
    // Recent activity
    recentHistory: (dashboardData.recentHistory || []).slice(-20),
    
    // Agent performance
    agentPerformance: dashboardData.agentPerformance || {},
    modelPerformance: dashboardData.modelPerformance || {}
  };
}

// Get system status
function getSystemStatus() {
  const uptime = Date.now() - systemState.startTime;
  
  return {
    status: 'healthy',
    uptime,
    uptimeFormatted: formatUptime(uptime),
    version: '2.0.0',
    nodeEnv: NODE_ENV,
    activeConnections: systemState.activeConnections,
    totalRequests: systemState.totalRequests,
    timestamp: Date.now()
  };
}

// Format uptime
function formatUptime(ms) {
  const seconds = Math.floor(ms / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days}d ${hours % 24}h`;
  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

// REST API Routes

// Health check
app.get('/api/health', (req, res) => {
  systemState.totalRequests++;
  res.json(getSystemStatus());
});

// Get system status
app.get('/api/status', (req, res) => {
  systemState.totalRequests++;
  res.json({
    system: getSystemStatus(),
    agentSystem: agentSystem.getStatus()
  });
});

// Get agents
app.get('/api/agents', (req, res) => {
  systemState.totalRequests++;
  res.json(getAgentData());
});

// Get specific agent
app.get('/api/agents/:id', (req, res) => {
  systemState.totalRequests++;
  const agents = getAgentData().agents;
  const agent = agents.find(a => a.id === req.params.id);
  
  if (agent) {
    res.json(agent);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

// Get dashboard metrics
app.get('/api/metrics', (req, res) => {
  systemState.totalRequests++;
  res.json(getDashboardMetrics());
});

// Get cost report
app.get('/api/costs', (req, res) => {
  systemState.totalRequests++;
  res.json(agentSystem.getCostReport());
});

// Get performance report
app.get('/api/performance', (req, res) => {
  systemState.totalRequests++;
  res.json(agentSystem.getPerformanceReport());
});

// Execute task
app.post('/api/execute', async (req, res) => {
  systemState.totalRequests++;
  const startTime = Date.now();
  
  try {
    const result = await executeTask(req.body);
    res.json({
      ...result,
      apiLatency: Date.now() - startTime
    });
  } catch (error) {
    logger.error('API execute error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apiLatency: Date.now() - startTime
    });
  }
});

// Update configuration
app.post('/api/config', (req, res) => {
  systemState.totalRequests++;
  const { strategy, budget } = req.body;
  
  if (strategy) {
    agentSystem.orchestrator.setExecutionMode(strategy);
  }
  
  res.json({
    success: true,
    config: {
      strategy: agentSystem.orchestrator.executionMode,
      budget
    }
  });
});

// Get execution history
app.get('/api/history', (req, res) => {
  systemState.totalRequests++;
  const { limit = 50, model, agent, taskType } = req.query;
  
  const history = agentSystem.orchestrator.getHistory({
    limit: parseInt(limit),
    model,
    agent,
    taskType
  });
  
  res.json(history);
});

// Catch-all for SPA
app.get('*', (req, res) => {
  res.sendFile(join(__dirname, 'frontend', 'index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Express error:', err);
  res.status(500).json({
    error: NODE_ENV === 'production' ? 'Internal server error' : err.message
  });
});

// Periodic broadcasts
setInterval(() => {
  broadcastToAll({
    type: 'update',
    data: {
      agents: getAgentData(),
      metrics: getDashboardMetrics(),
      system: getSystemStatus(),
      timestamp: Date.now()
    }
  });
}, 5000); // Update every 5 seconds

// Connection health check
const healthCheckInterval = setInterval(() => {
  systemState.wsClients.forEach(ws => {
    if (!ws.isAlive) {
      ws.terminate();
      return;
    }
    ws.isAlive = false;
    ws.ping();
  });
}, 30000); // Check every 30 seconds

// Cleanup on shutdown
function gracefulShutdown() {
  logger.info('Shutting down gracefully...');
  
  clearInterval(healthCheckInterval);
  
  // Close all WebSocket connections
  systemState.wsClients.forEach(ws => {
    ws.close(1000, 'Server shutting down');
  });
  
  // Close server
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
  
  // Force exit after 10 seconds
  setTimeout(() => {
    logger.error('Forced shutdown');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', gracefulShutdown);
process.on('SIGINT', gracefulShutdown);

// Start server
server.listen(PORT, () => {
  logger.info(`🚀 Mission Control Integrated Server v2.0.0`);
  logger.info(`📡 REST API: http://localhost:${PORT}/api`);
  logger.info(`🔌 WebSocket: ws://localhost:${PORT}${WS_PATH}`);
  logger.info(`🌍 Environment: ${NODE_ENV}`);
});

export { app, server, wss };
