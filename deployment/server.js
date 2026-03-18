/**
 * Mission Control Integrated Server
 * Production-ready backend with WebSocket support, integrated agent system, and real-time monitoring
 */

// Load environment variables FIRST
import { config } from 'dotenv';
config({ path: '.env' });

// Now import other modules
import express from 'express';
import { WebSocketServer } from 'ws';
import http from 'http';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { RateLimiterMemory } from 'rate-limiter-flexible';
import winston from 'winston';
import cron from 'node-cron';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { IntegratedAgentSystem } from './backend/integrated-agent-system.js';
import OpenRouterClient from './backend/openrouter-client.js';

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

// Initialize Collaboration Manager
import { CollaborationManager } from './backend/collaboration-integration.js';
const collaborationManager = new CollaborationManager({
  defaultBudget: parseFloat(process.env.DEFAULT_BUDGET) || 10.00
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
  (async () => {
    try {
      sendToClient(ws, {
        type: 'init',
        data: {
          system: getSystemStatus(),
          agents: await getAgentData(),
          metrics: getDashboardMetrics(),
          collaboration: {
            stats: collaborationManager.getCollaborationStats(),
            agents: collaborationManager.getSpecializedAgents(),
            active: collaborationManager.getActiveCollaborations(),
            history: collaborationManager.getCollaborationHistory(10)
          },
          timestamp: Date.now()
        }
      });
    } catch (error) {
      logger.error('Error sending initial state:', error);
      sendToClient(ws, {
        type: 'error',
        error: 'Failed to load agent data'
      });
    }
  })();

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
      try {
        sendToClient(ws, {
          type: 'agents',
          data: await getAgentData()
        });
      } catch (error) {
        logger.error('Error getting agents:', error);
        sendToClient(ws, {
          type: 'error',
          error: 'Failed to fetch agent data'
        });
      }
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
      
    case 'get_collaboration_stats':
      try {
        sendToClient(ws, {
          type: 'collaboration_stats',
          data: collaborationManager.getCollaborationStats()
        });
      } catch (error) {
        logger.error('Error getting collaboration stats:', error);
        sendToClient(ws, {
          type: 'error',
          error: 'Failed to fetch collaboration statistics'
        });
      }
      break;
      
    case 'get_collaboration_agents':
      try {
        sendToClient(ws, {
          type: 'collaboration_agents',
          data: collaborationManager.getSpecializedAgents()
        });
      } catch (error) {
        logger.error('Error getting collaboration agents:', error);
        sendToClient(ws, {
          type: 'error',
          error: 'Failed to fetch specialized agents'
        });
      }
      break;
      
    case 'get_active_collaborations':
      try {
        sendToClient(ws, {
          type: 'active_collaborations',
          data: collaborationManager.getActiveCollaborations()
        });
      } catch (error) {
        logger.error('Error getting active collaborations:', error);
        sendToClient(ws, {
          type: 'error',
          error: 'Failed to fetch active collaborations'
        });
      }
      break;
      
    case 'execute_collaboration_task':
      try {
        const result = await collaborationManager.executeWithCollaboration(payload.task, payload.options || {});
        sendToClient(ws, {
          type: 'collaboration_result',
          data: result
        });
      } catch (error) {
        logger.error('Error executing collaboration task:', error);
        sendToClient(ws, {
          type: 'error',
          error: `Collaboration execution failed: ${error.message}`
        });
      }
      break;
      
    case 'analyze_collaboration_task':
      try {
        const analysis = collaborationManager.analyzeTaskForDecomposition(payload.task);
        sendToClient(ws, {
          type: 'collaboration_analysis',
          data: analysis
        });
      } catch (error) {
        logger.error('Error analyzing collaboration task:', error);
        sendToClient(ws, {
          type: 'error',
          error: `Task analysis failed: ${error.message}`
        });
      }
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

// Helper function to fetch OpenClaw agent data
async function fetchOpenClawAgents() {
  try {
    // Fetch OpenClaw sessions data
    const { exec } = await import('child_process');
    const { promisify } = await import('util');
    const execAsync = promisify(exec);
    
    // Get sessions data
    const sessionsResult = await execAsync('openclaw sessions --json');
    const sessionsData = JSON.parse(sessionsResult.stdout);
    
    // Get status data for more detailed agent info
    const statusResult = await execAsync('openclaw status --json');
    const statusData = JSON.parse(statusResult.stdout);
    
    // Process agents from status data
    const agents = [];
    let activeCount = 0;
    
    // Process each agent from status data
    if (statusData.agents && statusData.agents.agents) {
      statusData.agents.agents.forEach(agent => {
        // Find recent sessions for this agent
        const agentSessions = sessionsData.sessions?.filter(s => 
          s.agentId === agent.id && s.updatedAt
        ) || [];
        
        // Sort by most recent
        agentSessions.sort((a, b) => b.updatedAt - a.updatedAt);
        const mostRecentSession = agentSessions[0];
        
        // Determine status based on activity
        let status = 'idle';
        if (mostRecentSession) {
          const ageMs = Date.now() - mostRecentSession.updatedAt;
          if (ageMs < 30000) { // Active in last 30 seconds
            status = 'active';
            activeCount++;
          } else if (ageMs < 300000) { // Active in last 5 minutes
            status = 'thinking';
            activeCount++;
          }
        }
        
        // Get model from most recent session
        const model = mostRecentSession?.model || agent.id || 'unknown';
        
        // Get tasks completed (approximate from token usage)
        const tasksCompleted = agentSessions.filter(s => 
          s.totalTokens && s.totalTokens > 100
        ).length;
        
        agents.push({
          id: agent.id,
          name: agent.name || agent.id,
          status: status,
          model: model,
          tasksCompleted: tasksCompleted,
          currentTask: mostRecentSession?.key || null,
          lastActive: mostRecentSession?.updatedAt || null
        });
      });
    }
    
    // Also include subagents as separate agents
    const subagentSessions = sessionsData.sessions?.filter(s => 
      s.key && s.key.includes('subagent:') && s.updatedAt
    ) || [];
    
    subagentSessions.forEach(session => {
      const ageMs = Date.now() - session.updatedAt;
      let status = 'idle';
      if (ageMs < 30000) {
        status = 'active';
        activeCount++;
      } else if (ageMs < 300000) {
        status = 'thinking';
        activeCount++;
      }
      
      // Extract subagent ID from key
      const subagentId = session.key.split(':').pop() || session.sessionId;
      
      agents.push({
        id: `subagent-${subagentId}`,
        name: `Subagent ${subagentId.substring(0, 8)}`,
        status: status,
        model: session.model || 'unknown',
        tasksCompleted: session.totalTokens && session.totalTokens > 100 ? 1 : 0,
        currentTask: session.key || null,
        lastActive: session.updatedAt || null
      });
    });
    
    return {
      agents,
      activeCount,
      totalCount: agents.length
    };
    
  } catch (error) {
    logger.error('Error fetching OpenClaw agents:', error);
    
    // Fallback to simulation data
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
}

// Get agent data for dashboard
async function getAgentData() {
  return await fetchOpenClawAgents();
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
app.get('/api/agents', async (req, res) => {
  systemState.totalRequests++;
  try {
    res.json(await getAgentData());
  } catch (error) {
    logger.error('Error fetching agents:', error);
    res.status(500).json({ error: 'Failed to fetch agent data' });
  }
});

// Get specific agent
app.get('/api/agents/:id', async (req, res) => {
  systemState.totalRequests++;
  try {
    const agentsData = await getAgentData();
    const agent = agentsData.agents.find(a => a.id === req.params.id);
    
    if (agent) {
      res.json(agent);
    } else {
      res.status(404).json({ error: 'Agent not found' });
    }
  } catch (error) {
    logger.error('Error fetching agent:', error);
    res.status(500).json({ error: 'Failed to fetch agent data' });
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

// Collaboration Endpoints

// Get collaboration statistics
app.get('/api/collaboration/stats', (req, res) => {
  systemState.totalRequests++;
  try {
    res.json(collaborationManager.getCollaborationStats());
  } catch (error) {
    logger.error('Error getting collaboration stats:', error);
    res.status(500).json({ error: 'Failed to get collaboration statistics' });
  }
});

// Get specialized agents
app.get('/api/collaboration/agents', (req, res) => {
  systemState.totalRequests++;
  try {
    res.json(collaborationManager.getSpecializedAgents());
  } catch (error) {
    logger.error('Error getting specialized agents:', error);
    res.status(500).json({ error: 'Failed to get specialized agents' });
  }
});

// Get active collaborations
app.get('/api/collaboration/active', (req, res) => {
  systemState.totalRequests++;
  try {
    res.json(collaborationManager.getActiveCollaborations());
  } catch (error) {
    logger.error('Error getting active collaborations:', error);
    res.status(500).json({ error: 'Failed to get active collaborations' });
  }
});

// Get collaboration history
app.get('/api/collaboration/history', (req, res) => {
  systemState.totalRequests++;
  const { limit = 20 } = req.query;
  
  try {
    res.json(collaborationManager.getCollaborationHistory(parseInt(limit)));
  } catch (error) {
    logger.error('Error getting collaboration history:', error);
    res.status(500).json({ error: 'Failed to get collaboration history' });
  }
});

// Execute task with collaboration
app.post('/api/collaboration/execute', async (req, res) => {
  systemState.totalRequests++;
  const startTime = Date.now();
  
  try {
    const result = await collaborationManager.executeWithCollaboration(req.body.task, req.body.options || {});
    
    res.json({
      success: true,
      result,
      apiLatency: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Collaboration execution error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apiLatency: Date.now() - startTime
    });
  }
});

// Test collaboration system
app.post('/api/collaboration/test', async (req, res) => {
  systemState.totalRequests++;
  const startTime = Date.now();
  
  try {
    const testResults = await collaborationManager.testCollaboration();
    
    res.json({
      success: true,
      ...testResults,
      apiLatency: Date.now() - startTime
    });
  } catch (error) {
    logger.error('Collaboration test error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
      apiLatency: Date.now() - startTime
    });
  }
});

// Analyze task for decomposition
app.post('/api/collaboration/analyze', async (req, res) => {
  systemState.totalRequests++;
  
  try {
    const analysis = collaborationManager.analyzeTaskForDecomposition(req.body.task);
    res.json({
      success: true,
      analysis
    });
  } catch (error) {
    logger.error('Task analysis error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
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
setInterval(async () => {
  try {
    broadcastToAll({
      type: 'update',
      data: {
        agents: await getAgentData(),
        metrics: getDashboardMetrics(),
        system: getSystemStatus(),
        collaboration: {
          stats: collaborationManager.getCollaborationStats(),
          active: collaborationManager.getActiveCollaborations()
        },
        timestamp: Date.now()
      }
    });
  } catch (error) {
    logger.error('Error in periodic broadcast:', error);
  }
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
