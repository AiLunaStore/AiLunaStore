#!/usr/bin/env node

/**
 * Collaboration Framework Server
 * Runs on port 8081 to coordinate parallel specialist agents
 */

const http = require('http');
const WebSocket = require('ws');
const { exec } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

class CollaborationServer {
  constructor(port = 8081) {
    this.port = port;
    this.specialists = {
      'ui-ux': { status: 'idle', task: null, progress: 0 },
      'backend': { status: 'idle', task: null, progress: 0 },
      'integration': { status: 'idle', task: null, progress: 0 },
      'code': { status: 'idle', task: null, progress: 0 },
      'qa': { status: 'idle', task: null, progress: 0 }
    };
    this.tasks = new Map();
    this.wsServer = null;
    this.httpServer = null;
  }

  start() {
    this.httpServer = http.createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });

    this.wsServer = new WebSocket.Server({ server: this.httpServer });

    this.wsServer.on('connection', (ws) => {
      this.handleWebSocketConnection(ws);
    });

    this.httpServer.listen(this.port, () => {
      console.log(`Collaboration server running on port ${this.port}`);
      console.log('Available specialists:');
      Object.keys(this.specialists).forEach(specialist => {
        console.log(`  - ${specialist}`);
      });
    });
  }

  handleHttpRequest(req, res) {
    const { method, url } = req;
    
    if (method === 'GET' && url === '/status') {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        status: 'running',
        port: this.port,
        specialists: this.specialists,
        activeTasks: Array.from(this.tasks.values())
      }));
      return;
    }

    if (method === 'POST' && url === '/delegate') {
      let body = '';
      req.on('data', chunk => body += chunk);
      req.on('end', () => {
        try {
          const task = JSON.parse(body);
          this.delegateTask(task);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, taskId: task.id }));
        } catch (err) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }

    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Not found' }));
  }

  handleWebSocketConnection(ws) {
    console.log('New WebSocket connection');

    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        this.handleWebSocketMessage(ws, message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    });

    ws.on('close', () => {
      console.log('WebSocket connection closed');
    });

    // Send initial status
    ws.send(JSON.stringify({
      type: 'status',
      data: {
        specialists: this.specialists,
        serverTime: Date.now()
      }
    }));
  }

  handleWebSocketMessage(ws, message) {
    switch (message.type) {
      case 'register':
        this.registerSpecialist(ws, message.data);
        break;
      case 'progress':
        this.updateProgress(message.data);
        break;
      case 'complete':
        this.completeTask(message.data);
        break;
      default:
        console.log('Unknown message type:', message.type);
    }
  }

  registerSpecialist(ws, data) {
    const { specialist, capabilities } = data;
    
    if (this.specialists[specialist]) {
      this.specialists[specialist].ws = ws;
      this.specialists[specialist].capabilities = capabilities;
      console.log(`Specialist registered: ${specialist}`);
      
      ws.send(JSON.stringify({
        type: 'registered',
        data: { specialist, status: 'ready' }
      }));
    }
  }

  async delegateTask(task) {
    console.log(`Delegating task: ${task.id} - ${task.description}`);
    
    this.tasks.set(task.id, {
      ...task,
      status: 'delegating',
      startTime: Date.now(),
      assignedSpecialists: []
    });

    // Delegate to appropriate specialists based on task type
    const assignments = this.assignSpecialists(task);
    
    for (const assignment of assignments) {
      const { specialist, subtask } = assignment;
      
      if (this.specialists[specialist]?.ws) {
        this.specialists[specialist].status = 'working';
        this.specialists[specialist].task = task.id;
        this.specialists[specialist].progress = 0;
        
        const taskData = {
          taskId: task.id,
          subtaskId: `${task.id}-${specialist}`,
          description: subtask.description,
          data: subtask.data
        };

        this.specialists[specialist].ws.send(JSON.stringify({
          type: 'task',
          data: taskData
        }));

        const taskObj = this.tasks.get(task.id);
        taskObj.assignedSpecialists.push({
          specialist,
          subtaskId: taskData.subtaskId,
          status: 'assigned'
        });
        
        console.log(`Assigned ${subtask.description} to ${specialist}`);
      }
    }

    // Broadcast task delegation
    this.broadcast({
      type: 'task-delegated',
      data: {
        taskId: task.id,
        assignments
      }
    });
  }

  assignSpecialists(task) {
    const assignments = [];
    
    // UI/UX Specialist - Bubble visualization fixes
    if (task.type === 'bubble-fix' || task.description.includes('visualization')) {
      assignments.push({
        specialist: 'ui-ux',
        subtask: {
          description: 'Fix bubble visualization rendering glitches',
          data: { file: 'app.js', component: 'BubbleVisualization' }
        }
      });
    }
    
    // Backend Specialist - API integration
    if (task.type === 'api-fix' || task.description.includes('API') || task.description.includes('data')) {
      assignments.push({
        specialist: 'backend',
        subtask: {
          description: 'Fix API integration for live agent data',
          data: { file: 'agent-controller.js', endpoint: '/api/agents' }
        }
      });
    }
    
    // Integration Specialist - System connection
    if (task.type === 'integration-fix' || task.description.includes('WebSocket') || task.description.includes('connection')) {
      assignments.push({
        specialist: 'integration',
        subtask: {
          description: 'Fix WebSocket connection and system integration',
          data: { file: 'server-monitor.js', endpoint: '/ws' }
        }
      });
    }
    
    // Code Specialist - Data pipeline
    if (task.type === 'pipeline-fix' || task.description.includes('data pipeline')) {
      assignments.push({
        specialist: 'code',
        subtask: {
          description: 'Debug and fix data pipeline issues',
          data: { files: ['agent-controller.js', 'app.js'] }
        }
      });
    }
    
    // QA Specialist - Testing
    assignments.push({
      specialist: 'qa',
      subtask: {
        description: 'Test and validate all fixes',
        data: { taskId: task.id }
      }
    });
    
    return assignments;
  }

  updateProgress(data) {
    const { specialist, taskId, progress, message } = data;
    
    if (this.specialists[specialist]) {
      this.specialists[specialist].progress = progress;
      
      console.log(`Progress update - ${specialist}: ${progress}% - ${message}`);
      
      // Broadcast progress update
      this.broadcast({
        type: 'progress',
        data: { specialist, taskId, progress, message, timestamp: Date.now() }
      });
    }
  }

  completeTask(data) {
    const { specialist, taskId, result } = data;
    
    if (this.specialists[specialist]) {
      this.specialists[specialist].status = 'idle';
      this.specialists[specialist].task = null;
      this.specialists[specialist].progress = 0;
      
      console.log(`Task completed by ${specialist}:`, result);
      
      // Update task status
      const task = this.tasks.get(taskId);
      if (task) {
        const specialistAssignment = task.assignedSpecialists.find(a => a.specialist === specialist);
        if (specialistAssignment) {
          specialistAssignment.status = 'completed';
          specialistAssignment.result = result;
          specialistAssignment.completionTime = Date.now();
        }
        
        // Check if all specialists are done
        const allCompleted = task.assignedSpecialists.every(a => a.status === 'completed');
        if (allCompleted) {
          task.status = 'completed';
          task.completionTime = Date.now();
          task.duration = task.completionTime - task.startTime;
          
          console.log(`Task ${taskId} fully completed in ${task.duration}ms`);
          
          // Broadcast completion
          this.broadcast({
            type: 'task-completed',
            data: {
              taskId,
              duration: task.duration,
              results: task.assignedSpecialists.map(a => ({
                specialist: a.specialist,
                result: a.result
              }))
            }
          });
        }
      }
      
      // Broadcast specialist status change
      this.broadcast({
        type: 'specialist-status',
        data: { specialist, status: 'idle' }
      });
    }
  }

  broadcast(message) {
    const messageStr = JSON.stringify(message);
    
    this.wsServer.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(messageStr);
      }
    });
  }
}

// Start server if run directly
if (require.main === module) {
  const server = new CollaborationServer(8081);
  server.start();
}

module.exports = CollaborationServer;