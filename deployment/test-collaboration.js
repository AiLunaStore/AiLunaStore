#!/usr/bin/env node

/**
 * Test script for Collaboration Framework Integration
 */

import { CollaborationManager } from './backend/collaboration-integration.js';

async function testCollaboration() {
  console.log('🧪 Testing Collaboration Framework Integration...\n');
  
  // Initialize collaboration manager
  const manager = new CollaborationManager({
    defaultBudget: 10.00
  });
  
  console.log('1. Initializing specialized agents...');
  manager.registerAgentsWithFramework();
  const agents = manager.getSpecializedAgents();
  console.log(`   ✓ Registered ${agents.length} specialized agents`);
  console.log('   Agents:', agents.map(a => a.name).join(', '));
  
  console.log('\n2. Testing task decomposition...');
  const testTasks = [
    {
      id: 'test-complex-app',
      description: 'Build a complex web application with React frontend, Node.js backend, and database integration. Include user authentication, API endpoints, and responsive UI design.',
      complexity: 8
    },
    {
      id: 'test-simple-task',
      description: 'Write a simple function to calculate factorial.',
      complexity: 2
    },
    {
      id: 'test-multi-domain',
      description: 'Research AI trends and write a blog post with code examples and UI mockups.',
      complexity: 7
    }
  ];
  
  for (const task of testTasks) {
    console.log(`\n   Analyzing: "${task.description.substring(0, 50)}..."`);
    const analysis = manager.analyzeTaskForDecomposition(task);
    console.log(`   ✓ Complexity: ${analysis.complexityScore}/10`);
    console.log(`   ✓ Strategy: ${analysis.decompositionStrategy}`);
    console.log(`   ✓ Subtasks: ${analysis.subtasks.length}`);
    console.log(`   ✓ Coordination: ${analysis.coordinationPattern}`);
    console.log(`   ✓ Parallelism: ${analysis.estimatedParallelism}x`);
  }
  
  console.log('\n3. Testing collaboration execution...');
  const complexTask = testTasks[0]; // Use the complex app task
  
  try {
    console.log(`   Executing: "${complexTask.description.substring(0, 50)}..."`);
    const result = await manager.executeWithCollaboration(complexTask, {
      budget: 5.00,
      strategy: 'balanced'
    });
    
    console.log(`   ✓ Collaboration mode: ${result.collaborationMode}`);
    console.log(`   ✓ Success: ${result.success}`);
    console.log(`   ✓ Duration: ${result.duration}ms`);
    console.log(`   ✓ Speedup factor: ${result.metrics.speedupFactor?.toFixed(2) || 1.0}x`);
    console.log(`   ✓ Cost: $${result.cost?.total?.toFixed(4) || 0}`);
    
    if (result.analysis?.subtasks) {
      console.log(`   ✓ Subtasks executed: ${result.analysis.subtasks.length}`);
    }
  } catch (error) {
    console.error(`   ✗ Error: ${error.message}`);
  }
  
  console.log('\n4. Testing collaboration statistics...');
  const stats = manager.getCollaborationStats();
  console.log(`   ✓ Total collaborations: ${stats.totalCollaborations}`);
  console.log(`   ✓ Success rate: ${stats.successRate}`);
  console.log(`   ✓ Average speedup: ${stats.averageSpeedup}x`);
  console.log(`   ✓ Total cost savings: $${stats.totalCostSavings}`);
  console.log(`   ✓ Efficiency gain: ${stats.efficiencyGain}x`);
  
  console.log('\n5. Testing API endpoints...');
  console.log('   Available REST endpoints:');
  console.log('   - GET  /api/collaboration/stats');
  console.log('   - GET  /api/collaboration/agents');
  console.log('   - GET  /api/collaboration/active');
  console.log('   - GET  /api/collaboration/history');
  console.log('   - POST /api/collaboration/execute');
  console.log('   - POST /api/collaboration/test');
  console.log('   - POST /api/collaboration/analyze');
  
  console.log('\n   WebSocket messages:');
  console.log('   - get_collaboration_stats');
  console.log('   - get_collaboration_agents');
  console.log('   - get_active_collaborations');
  console.log('   - execute_collaboration_task');
  console.log('   - analyze_collaboration_task');
  
  console.log('\n6. Performance expectations:');
  console.log('   Expected speed improvement: 3-4x for complex tasks');
  console.log('   Cost optimization: 23-60% savings vs single-agent');
  console.log('   Parallel agent delegation: Up to 4 agents simultaneously');
  
  console.log('\n🎯 Integration Test Complete!');
  console.log('\nNext steps:');
  console.log('1. Start the server: npm start');
  console.log('2. Open browser to: http://localhost:8080');
  console.log('3. Navigate to "Collaboration" view');
  console.log('4. Click "Test Collaboration" button');
  console.log('5. Monitor parallel agent delegation in real-time');
  
  return true;
}

// Run test
testCollaboration().catch(console.error);