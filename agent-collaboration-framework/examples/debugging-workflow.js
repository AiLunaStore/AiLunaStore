/**
 * Example: Debugging a Desktop Application
 * 
 * This example demonstrates how to use the Agent Collaboration Framework
 * to debug a complex desktop application issue by delegating to multiple
 * specialized agents.
 */

import { CollaborationFramework } from '../src/index.js';

async function main() {
  console.log('=== Agent Collaboration Framework: Debugging Example ===\n');

  // Initialize the framework
  const framework = new CollaborationFramework({
    thresholds: {
      complexity: 5,
      estimatedTimeMinutes: 3,
      subtaskCount: 3
    }
  });

  // Define a complex debugging task
  const task = {
    id: 'debug-desktop-app-crash',
    description: 'Debug desktop application crash on startup - "Cannot read property of undefined"',
    context: {
      error: 'TypeError: Cannot read property \'config\' of undefined',
      stackTrace: `
        at App.initialize (app.js:45:23)
        at processTicksAndRejections (internal/process/task_queues.js:97:5)
      `,
      environment: 'macOS 15.3, Electron 28.0.0',
      logs: [
        '[INFO] App starting...',
        '[ERROR] Failed to load config',
        '[ERROR] Cannot read property \'config\' of undefined'
      ],
      recentChanges: [
        'Updated Electron to v28',
        'Refactored config loading',
        'Added new API endpoints'
      ]
    }
  };

  console.log('Task:', task.description);
  console.log('Context:', JSON.stringify(task.context, null, 2));
  console.log('\n--- Analyzing and delegating ---\n');

  try {
    // Execute with collaboration
    const result = await framework.execute(task);

    console.log('\n=== Results ===');
    console.log('Execution ID:', result.executionId);
    console.log('Strategy:', result.strategy);
    console.log('Duration:', result.metrics.duration, 'ms');
    console.log('Subtasks:', result.metrics.subtasks);
    console.log('Speedup Factor:', result.metrics.speedupFactor?.toFixed(2) || 'N/A');

    if (result.subtaskResults) {
      console.log('\n--- Subtask Results ---');
      for (const subtaskResult of result.subtaskResults) {
        console.log(`\n[${subtaskResult.subtask.domain}] ${subtaskResult.subtask.description}`);
        console.log(`  Agent: ${subtaskResult.agent}`);
        console.log(`  Status: ${subtaskResult.success ? '✓ Success' : '✗ Failed'}`);
        if (subtaskResult.result) {
          console.log(`  Output: ${subtaskResult.result.output}`);
        }
      }
    }

    if (result.result?.solution) {
      console.log('\n--- Integrated Solution ---');
      console.log('Title:', result.result.solution.title);
      console.log('Summary:', result.result.solution.summary);
      console.log('Affected Domains:', result.result.solution.affectedDomains.join(', '));
      console.log('Estimated Effort:', result.result.solution.estimatedEffort.level);
    }

    console.log('\n=== Framework Statistics ===');
    console.log(JSON.stringify(framework.getStats(), null, 2));

  } catch (error) {
    console.error('Execution failed:', error.message);
    console.error(error.stack);
  }
}

main().catch(console.error);
