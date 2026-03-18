#!/usr/bin/env node

/**
 * Test to check framework execution result structure
 */

import { CollaborationManager } from './backend/collaboration-integration.js';

async function testFrameworkResult() {
  console.log('Testing framework execution result structure...\n');
  
  const manager = new CollaborationManager({
    defaultBudget: 10.00
  });
  
  manager.registerAgentsWithFramework();
  
  const task = {
    id: 'test-task',
    description: 'Build a simple web page with HTML, CSS, and JavaScript.',
    complexity: 5
  };
  
  console.log('Executing task with collaboration...');
  const result = await manager.executeWithCollaboration(task, {
    budget: 2.00,
    strategy: 'balanced'
  });
  
  console.log('\nResult structure:');
  console.log(JSON.stringify(result, null, 2));
  
  console.log('\nKey fields:');
  console.log(`- success: ${result.success} (type: ${typeof result.success})`);
  console.log(`- collaborationMode: ${result.collaborationMode}`);
  console.log(`- duration: ${result.duration}ms`);
  console.log(`- speedupFactor: ${result.metrics?.speedupFactor}`);
  console.log(`- cost total: $${result.cost?.total}`);
  console.log(`- metrics.success: ${result.metrics?.success}`);
  
  console.log('\nFramework result metrics:');
  console.log(JSON.stringify(result.metrics, null, 2));
}

testFrameworkResult().catch(console.error);