const express = require('express');
const WebSocket = require('ws');
const http = require('http');
const cors = require('cors');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);
const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

const PORT = process.env.PORT || 8080;

// Enable CORS
app.use(cors());
app.use(express.json());

// Agent data store
let agents = [];
let metrics = {
  totalAgents: 0,
  activeAgents: 0,
  totalTokens: 0,
  successRate: 100
};

// WebSocket clients
const clients = new Set();

// Agent type definitions
const AGENT_TYPES = [
  { id: 'triage', name: 'Triage', model: 'GPT-5-nano', size: 80 },
  { id: 'planner', name: 'Planner', model: 'DeepSeek Reasoner', size: 100 },
  { id: 'implementer', name: 'Implementer', model: 'Kimi K2.5', size: 90 },
  { id: 'reviewer', name: 'Reviewer', model: 'GPT-5.1 Codex', size: 85 },
  { id: 'research', name: 'Research', model: 'DeepSeek V3', size: 75 },
  { id: 'creative', name: 'Creative', model: 'Claude 3.5 Haiku', size: 95 },
  { id: 'analytics', name: 'Analytics', model: 'GPT-4o-mini', size: 70 },
  { id: 'communication', name: 'Communication', model: 'GPT-4o-mini', size: 65 }
];

// Sample tasks for simulation fallback
const SAMPLE_TASKS = [
  'System health check',
  'Processing user request',
  'Analyzing data patterns',
  'Generating content',
  'Code review in progress',
  'Researching topic',
  'Waiting for input',
  'API integration',
  'Database optimization',
  'Error recovery'
];

// Parse OpenClaw sessions output
async function getOpenClawSessions() {
  try {
    const { stdout } = await execAsync('openclaw sessions_list --json 2>/dev/null || echo "[]"');
    return JSON.parse(stdout);
  } catch (error) {
    return [];
  }
}

// Parse OpenClaw subagents output
async function getOpenClawSubagents() {
  try {
    const { stdout } = await execAsync('openclaw subagents --json 2>/dev/null || echo "[]"');
    return JSON.parse(stdout);
  } catch (error) {
    return [];
  }
}

// Get agent status from OpenClaw
async function fetchAgentData() {
  try {
    const [sessions, subagents] = await Promise.all([
      getOpenClawSessions(),
      getOpenClawSubagents()
    ]);

    const now = new Date().toISOString();
    const newAgents = [];

    // Process sessions
    sessions.forEach((session, index) => {
      const agentType = AGENT_TYPES[index % AGENT_TYPES.length];
      const status = session.status === 'active' ? 'active' : 
                    session.status === 'thinking' ? 'thinking' : 'idle';
      
      newAgents.push({
        id: session.id || `session-${index}`,
        name: agentType.name,
        model: session.model || agentType.model,
        status: status,
        task: session.task || SAMPLE_TASKS[Math.floor(Math.random() * SAMPLE_TASKS.length)],
        tokens: session.tokens || Math.floor(Math.random() * 50000),
        duration: session.duration || `${Math.floor(Math.random() * 300)}s`,
        lastActivity: session.lastActivity || now,
        type: 'session'
      });
    });

    // Process subagents
    subagents.forEach((subagent, index) => {
      const agentType = AGENT_TYPES[(index + sessions.length) % AGENT_TYPES.length];
      const status = subagent.status === 'running' ? 'thinking' : 
                    subagent.status === 'completed' ? 'idle' : 'active';
      
      newAgents.push({
        id: subagent.id || `subagent-${index}`,
        name: `${agentType.name} (Sub)`,
        model: subagent.model || agentType.model,
        status: status,
        task: subagent.task || 'Subagent task',
        tokens: subagent.tokens || Math.floor(Math.random() * 10000),
        duration: subagent.duration || `${Math.floor(Math.random() * 60)}s`,
        lastActivity: subagent.lastActivity || now,
        type: 'subagent'
      });
    });

    // If no real data, use simulation
    if (newAgents.length === 0) {
      return generateSimulatedAgents();
    }

    return newAgents;
  } catch (error) {
    console.error('Error fetching agent data:', error.message);
    return generateSimulatedAgents();
  }
}

// Generate simulated agents for fallback
function generateSimulatedAgents() {
  const now = new Date().toISOString();
  return AGENT_TYPES.map((type, index) => ({
    id: type.id,
    name: type.name,
    model: type.model,
    status: ['active', 'thinking', 'idle', 'error'][Math.floor(Math.random() * 4)],
    task: SAMPLE_TASKS[Math.floor(Math.random() * SAMPLE_TASKS.length)],
    tokens: Math.floor(Math.random() * 50000),
    duration: `${Math.floor(Math.random() * 300)}s`,
    lastActivity: now,
    type: 'simulated'
  }));
}

// Calculate metrics
function calculateMetrics(agents) {
  const activeAgents = agents.filter(a => a.status === 'active' || a.status === 'thinking').length;
  const totalTokens = agents.reduce((sum, a) => sum + (a.tokens || 0), 0);
  const errorCount = agents.filter(a => a.status === 'error').length;
  const successRate = agents.length > 0 ? ((agents.length - errorCount) / agents.length * 100).toFixed(1) : 100;

  return {
    totalAgents: agents.length,
    activeAgents,
    totalTokens,
    successRate: parseFloat(successRate)
  };
}

// Update agent data
async function updateAgentData() {
  try {
    agents = await fetchAgentData();
    metrics = calculateMetrics(agents);
    
    // Broadcast to all connected clients
    const data = JSON.stringify({
      type: 'update',
      agents,
      metrics,
      timestamp: new Date().toISOString(),
      source: agents.some(a => a.type !== 'simulated') ? 'live' : 'simulated'
    });

    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });

    console.log(`[${new Date().toLocaleTimeString()}] Updated ${agents.length} agents (${metrics.activeAgents} active)`);
  } catch (error) {
    console.error('Error updating agent data:', error.message);
  }
}

// WebSocket connection handling
wss.on('connection', (ws) => {
  console.log('New WebSocket client connected');
  clients.add(ws);

  // Send initial data
  ws.send(JSON.stringify({
    type: 'init',
    agents,
    metrics,
    timestamp: new Date().toISOString(),
    source: agents.some(a => a.type !== 'simulated') ? 'live' : 'simulated'
  }));

  ws.on('close', () => {
    console.log('WebSocket client disconnected');
    clients.delete(ws);
  });

  ws.on('error', (error) => {
    console.error('WebSocket error:', error.message);
    clients.delete(ws);
  });
});

// REST API endpoints
app.get('/api/agents', (req, res) => {
  res.json({
    agents,
    metrics,
    timestamp: new Date().toISOString(),
    source: agents.some(a => a.type !== 'simulated') ? 'live' : 'simulated'
  });
});

app.get('/api/agents/:id', (req, res) => {
  const agent = agents.find(a => a.id === req.params.id);
  if (agent) {
    res.json(agent);
  } else {
    res.status(404).json({ error: 'Agent not found' });
  }
});

app.get('/api/metrics', (req, res) => {
  res.json({
    metrics,
    timestamp: new Date().toISOString()
  });
});

app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    websocketClients: clients.size
  });
});

// Start server
server.listen(PORT, () => {
  console.log(`🚀 Mission Control API server running on port ${PORT}`);
  console.log(`📊 REST API: http://localhost:${PORT}/api/agents`);
  console.log(`🔌 WebSocket: ws://localhost:${PORT}/ws`);
  
  // Initial data fetch
  updateAgentData();
  
  // Update every 5 seconds
  setInterval(updateAgentData, 5000);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});