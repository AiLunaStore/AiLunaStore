/**
 * Example: Code Refactoring
 * 
 * This example demonstrates how to use the Agent Collaboration Framework
 * to refactor code with parallel analysis from multiple specialists.
 */

import { CollaborationFramework } from '../src/index.js';

async function main() {
  console.log('=== Agent Collaboration Framework: Refactoring Example ===\n');

  const framework = new CollaborationFramework({
    thresholds: {
      complexity: 4, // Lower threshold for refactoring tasks
      estimatedTimeMinutes: 2,
      subtaskCount: 2
    }
  });

  // Define a refactoring task
  const task = {
    id: 'refactor-auth-module',
    description: 'Refactor authentication module to use JWT instead of session-based auth',
    context: {
      currentImplementation: 'Express session with Redis store',
      targetImplementation: 'JWT with refresh token rotation',
      codebase: {
        files: [
          'src/auth/session.js',
          'src/middleware/auth.js',
          'src/routes/login.js',
          'src/routes/logout.js'
        ],
        tests: 'test/auth.test.js'
      },
      constraints: [
        'Maintain backward compatibility for 30 days',
        'Update all API documentation',
        'Add migration guide for clients'
      ]
    }
  };

  console.log('Task:', task.description);
  console.log('Files to refactor:', task.context.codebase.files.join(', '));
  console.log('\n--- Analyzing and delegating ---\n');

  try {
    const result = await framework.execute(task);

    console.log('\n=== Results ===');
    console.log('Strategy:', result.strategy);
    console.log('Duration:', result.metrics.duration, 'ms');

    if (result.subtaskResults) {
      console.log('\n--- Analysis Results by Domain ---');
      
      const byDomain = {};
      for (const sr of result.subtaskResults) {
        const domain = sr.subtask.domain;
        if (!byDomain[domain]) byDomain[domain] = [];
        byDomain[domain].push(sr);
      }

      for (const [domain, results] of Object.entries(byDomain)) {
        console.log(`\n[${domain.toUpperCase()}]`);
        for (const r of results) {
          console.log(`  ${r.success ? '✓' : '✗'} ${r.subtask.description}`);
        }
      }
    }

    if (result.result?.solution) {
      console.log('\n--- Refactoring Plan ---');
      console.log('Summary:', result.result.solution.summary);
      console.log('Risks:', result.result.solution.risks.map(r => r.description).join(', ') || 'None identified');
    }

  } catch (error) {
    console.error('Execution failed:', error.message);
  }
}

main().catch(console.error);
