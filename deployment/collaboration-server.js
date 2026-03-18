#!/usr/bin/env node

/**
 * Collaboration Server
 * Standalone server for collaboration framework on port 8081
 */

import { config } from 'dotenv';
config({ path: '.env' });

import express from 'express';
import cors from 'cors';
import { CollaborationManager } from './backend/collaboration-integration.js';

// Configuration
const PORT = process.env.COLLABORATION_PORT || 8081;
const NODE_ENV = process.env.NODE_ENV || 'production';

// Initialize Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Initialize collaboration manager
console.log('🚀 Initializing Collaboration Manager with MiniMax M2.7...');
const collaborationManager = new CollaborationManager({
  defaultBudget: 25.00
});

// Register agents with framework
collaborationManager.registerAgentsWithFramework();
console.log('✅ Collaboration Manager initialized');

// API Routes

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy', timestamp: new Date().toISOString() });
});

// Get collaboration statistics
app.get('/api/collaboration/stats', (req, res) => {
  try {
    const stats = collaborationManager.getCollaborationStats();
    res.json(stats);
  } catch (error) {
    console.error('Error getting collaboration stats:', error);
    res.status(500).json({ error: 'Failed to get collaboration stats' });
  }
});

// Get specialized agents
app.get('/api/collaboration/agents', (req, res) => {
  try {
    const agents = collaborationManager.getSpecializedAgents();
    res.json(agents);
  } catch (error) {
    console.error('Error getting specialized agents:', error);
    res.status(500).json({ error: 'Failed to get specialized agents' });
  }
});

// Get active collaborations
app.get('/api/collaboration/active', (req, res) => {
  try {
    const active = collaborationManager.getActiveCollaborations();
    res.json(active);
  } catch (error) {
    console.error('Error getting active collaborations:', error);
    res.status(500).json({ error: 'Failed to get active collaborations' });
  }
});

// Get collaboration history
app.get('/api/collaboration/history', (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const history = collaborationManager.getCollaborationHistory(limit);
    res.json(history);
  } catch (error) {
    console.error('Error getting collaboration history:', error);
    res.status(500).json({ error: 'Failed to get collaboration history' });
  }
});

// Execute collaboration task
app.post('/api/collaboration/execute', async (req, res) => {
  try {
    const { task, options } = req.body;
    
    if (!task || !task.description) {
      return res.status(400).json({ error: 'Task description is required' });
    }
    
    console.log(`📋 Executing collaboration task: ${task.description.substring(0, 50)}...`);
    
    const result = await collaborationManager.executeWithCollaboration(task, options || {});
    
    res.json({
      success: true,
      result,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error executing collaboration task:', error);
    res.status(500).json({ 
      error: 'Failed to execute collaboration task',
      details: error.message 
    });
  }
});

// Analyze task for decomposition
app.post('/api/collaboration/analyze', (req, res) => {
  try {
    const { task } = req.body;
    
    if (!task || !task.description) {
      return res.status(400).json({ error: 'Task description is required' });
    }
    
    const analysis = collaborationManager.analyzeTaskForDecomposition(task);
    
    res.json({
      success: true,
      analysis,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error analyzing task:', error);
    res.status(500).json({ 
      error: 'Failed to analyze task',
      details: error.message 
    });
  }
});

// Test collaboration
app.post('/api/collaboration/test', async (req, res) => {
  try {
    console.log('🧪 Running collaboration test...');
    
    const testResult = await collaborationManager.testCollaboration();
    
    res.json({
      success: true,
      testResult,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error running collaboration test:', error);
    res.status(500).json({ 
      error: 'Failed to run collaboration test',
      details: error.message 
    });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Collaboration Server running on port ${PORT}`);
  console.log(`📊 API available at http://localhost:${PORT}/api/collaboration/`);
  console.log(`🌐 Environment: ${NODE_ENV}`);
  
  // Log initialized agents
  const agents = collaborationManager.getSpecializedAgents();
  console.log(`🤖 ${agents.length} specialized agents initialized:`);
  
  agents.forEach(agent => {
    console.log(`   • ${agent.name} (${agent.model}) - ${agent.domains.join(', ')}`);
  });
});

// Handle graceful shutdown
process.on('SIGTERM', () => {
  console.log('🛑 Received SIGTERM, shutting down gracefully...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('🛑 Received SIGINT, shutting down gracefully...');
  process.exit(0);
});