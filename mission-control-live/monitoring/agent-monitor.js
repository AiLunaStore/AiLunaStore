#!/usr/bin/env node
/**
 * OpenClaw Agent Monitor
 * Node.js version for better JSON handling and API integration
 */

const { exec } = require('child_process');
const { promisify } = require('util');
const http = require('http');

const execAsync = promisify(exec);

// Configuration
const CONFIG = {
  apiUrl: process.env.API_URL || 'http://localhost:8080',
  updateInterval: parseInt(process.env.UPDATE_INTERVAL) || 5000,
  logLevel: process.env.LOG_LEVEL || 'info'
};

// Logger
const logger = {
  info: (msg) => console.log(`[${new Date().toISOString()}] ℹ️  ${msg}`),
  success: (msg) => console.log(`[${new Date().toISOString()}] ✅ ${msg}`),
  warn: (msg) => console.log(`[${new Date().toISOString()}] ⚠️  ${msg}`),
  error: (msg) => console.error(`[${new Date().toISOString()}] ❌ ${msg}`),
  debug: (msg) => CONFIG.logLevel === 'debug' && console.log(`[${new Date().toISOString()}] 🐛 ${msg}`)
};

// Execute OpenClaw command
async function runOpenClaw(command) {
  try {
    const { stdout } = await execAsync(`openclaw ${command} --json 2>/dev/null || echo "[]"`);
    return JSON.parse(stdout);
  } catch (error) {
    logger.debug(`OpenClaw command failed: ${error.message}`);
    return [];
  }
}

// Get active sessions
async function getSessions() {
  return runOpenClaw('sessions_list');
}

// Get subagents
async function getSubagents() {
  return runOpenClaw('subagents');
}

// Send data to API
async function sendToAPI(endpoint, data) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.apiUrl);
    const postData = JSON.stringify(data);
    
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let responseData = '';
      res.on('data', (chunk) => responseData += chunk);
      res.on('end', () => resolve(responseData));
    });
    
    req.on('error', (error) => reject(error));
    req.write(postData);
    req.end();
  });
}

// Fetch from API
async function fetchFromAPI(endpoint) {
  return new Promise((resolve, reject) => {
    const url = new URL(endpoint, CONFIG.apiUrl);
    
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
        }
      });
    }).on('error', (error) => reject(error));
  });
}

// Format duration
function formatDuration(seconds) {
  if (seconds < 60) return `${seconds}s`;
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  return `${Math.floor(seconds / 3600)}h ${Math.floor((seconds % 3600) / 60)}m`;
}

// Monitor mode
async function monitor() {
  logger.info('Starting agent monitor...');
  logger.info(`API endpoint: ${CONFIG.apiUrl}`);
  logger.info(`Update interval: ${CONFIG.updateInterval}ms`);
  
  // Check API health
  try {
    const health = await fetchFromAPI('/api/health');
    logger.success(`API server connected (uptime: ${formatDuration(Math.floor(health.uptime))})`);
  } catch (error) {
    logger.warn('API server not responding, will retry...');
  }
  
  // Continuous monitoring
  setInterval(async () => {
    try {
      const [sessions, subagents] = await Promise.all([
        getSessions(),
        getSubagents()
      ]);
      
      const totalAgents = sessions.length + subagents.length;
      const activeSessions = sessions.filter(s => s.status === 'active').length;
      const activeSubagents = subagents.filter(s => s.status === 'running').length;
      
      logger.info(`Agents: ${totalAgents} total (${sessions.length} sessions, ${subagents.length} subagents)`);
      logger.debug(`Active: ${activeSessions} sessions, ${activeSubagents} subagents`);
      
      // Log session details
      sessions.forEach(session => {
        logger.debug(`Session ${session.id}: ${session.status} (${session.model || 'unknown model'})`);
      });
      
      // Log subagent details
      subagents.forEach(subagent => {
        logger.debug(`Subagent ${subagent.id}: ${subagent.status} (${subagent.task || 'no task'})`);
      });
      
    } catch (error) {
      logger.error(`Monitor error: ${error.message}`);
    }
  }, CONFIG.updateInterval);
}

// Snapshot mode
async function snapshot() {
  try {
    const [sessions, subagents] = await Promise.all([
      getSessions(),
      getSubagents()
    ]);
    
    const data = {
      timestamp: new Date().toISOString(),
      sessions,
      subagents,
      summary: {
        totalSessions: sessions.length,
        totalSubagents: subagents.length,
        totalAgents: sessions.length + subagents.length,
        activeSessions: sessions.filter(s => s.status === 'active').length,
        activeSubagents: subagents.filter(s => s.status === 'running').length
      }
    };
    
    console.log(JSON.stringify(data, null, 2));
  } catch (error) {
    logger.error(`Snapshot error: ${error.message}`);
    process.exit(1);
  }
}

// Health check
async function health() {
  try {
    const health = await fetchFromAPI('/api/health');
    logger.success('API server is healthy');
    console.log(JSON.stringify(health, null, 2));
  } catch (error) {
    logger.error(`Health check failed: ${error.message}`);
    process.exit(1);
  }
}

// Fetch and display agents
async function agents() {
  try {
    const data = await fetchFromAPI('/api/agents');
    
    console.log('\n📊 Agent Status\n');
    console.log(`Total Agents: ${data.metrics?.totalAgents || 0}`);
    console.log(`Active: ${data.metrics?.activeAgents || 0}`);
    console.log(`Total Tokens: ${(data.metrics?.totalTokens || 0).toLocaleString()}`);
    console.log(`Success Rate: ${(data.metrics?.successRate || 100).toFixed(1)}%`);
    console.log(`\nData Source: ${data.source || 'unknown'}`);
    console.log(`Last Update: ${data.timestamp || 'unknown'}`);
    
    console.log('\n📋 Agent Details:\n');
    (data.agents || []).forEach(agent => {
      const statusEmoji = {
        active: '🟢',
        thinking: '🟡',
        idle: '⚪',
        error: '🔴'
      }[agent.status] || '⚪';
      
      console.log(`${statusEmoji} ${agent.name}`);
      console.log(`   Model: ${agent.model}`);
      console.log(`   Status: ${agent.status}`);
      console.log(`   Task: ${agent.task || 'None'}`);
      console.log(`   Tokens: ${(agent.tokens || 0).toLocaleString()}`);
      console.log(`   Duration: ${agent.duration || '0s'}`);
      console.log('');
    });
  } catch (error) {
    logger.error(`Failed to fetch agents: ${error.message}`);
    process.exit(1);
  }
}

// Usage
function usage() {
  console.log(`
OpenClaw Agent Monitor (Node.js)

Usage: node agent-monitor.js [command]

Commands:
    monitor     Continuous monitoring mode (default)
    snapshot    Get single snapshot of agent data
    agents      Fetch and display agents from API
    health      Check API server health
    help        Show this help message

Environment Variables:
    API_URL         API server URL (default: http://localhost:8080)
    UPDATE_INTERVAL Update interval in ms (default: 5000)
    LOG_LEVEL       Log level: debug, info (default: info)

Examples:
    node agent-monitor.js monitor
    node agent-monitor.js snapshot > agents.json
    API_URL=http://localhost:3000 node agent-monitor.js health
`);
}

// Main
const command = process.argv[2] || 'monitor';

switch (command) {
  case 'monitor':
    monitor();
    break;
  case 'snapshot':
    snapshot();
    break;
  case 'agents':
    agents();
    break;
  case 'health':
    health();
    break;
  case 'help':
  case '--help':
  case '-h':
    usage();
    break;
  default:
    logger.error(`Unknown command: ${command}`);
    usage();
    process.exit(1);
}