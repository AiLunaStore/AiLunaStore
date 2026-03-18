/**
 * Example: Feature Implementation
 * 
 * This example demonstrates how to use the Agent Collaboration Framework
 * to implement a new feature by breaking it down into parallel subtasks.
 */

import { CollaborationFramework } from '../src/index.js';

async function main() {
  console.log('=== Agent Collaboration Framework: Feature Implementation Example ===\n');

  const framework = new CollaborationFramework();

  // Define a feature implementation task
  const task = {
    id: 'implement-user-profile',
    description: 'Implement user profile page with avatar upload, bio editing, and social links',
    context: {
      requirements: [
        'Avatar upload with crop and resize',
        'Bio text editing (max 500 chars)',
        'Social media links (Twitter, GitHub, LinkedIn)',
        'Profile visibility settings'
      ],
      techStack: {
        frontend: 'React with Tailwind CSS',
        backend: 'Node.js with Express',
        database: 'PostgreSQL',
        storage: 'AWS S3'
      },
      existingCode: {
        hasUserModel: true,
        hasAuthMiddleware: true,
        hasFileUpload: false
      }
    }
  };

  console.log('Task:', task.description);
  console.log('Requirements:', task.context.requirements.join(', '));
  console.log('\n--- Analyzing and delegating ---\n');

  try {
    const result = await framework.execute(task);

    console.log('\n=== Results ===');
    console.log('Execution ID:', result.executionId);
    console.log('Strategy:', result.strategy);
    console.log('Duration:', result.metrics.duration, 'ms');
    console.log('Speedup Factor:', result.metrics.speedupFactor?.toFixed(2) || 'N/A');

    if (result.result?.solution) {
      console.log('\n--- Implementation Plan ---');
      const components = result.result.solution.components;
      
      for (const component of components) {
        console.log(`\n${component.type.toUpperCase()}:`);
        console.log(`  ${component.description}`);
        if (component.items) {
          for (const item of component.items) {
            console.log(`  - ${item.action || item.cause || item.description}`);
          }
        }
      }
    }

  } catch (error) {
    console.error('Execution failed:', error.message);
  }
}

main().catch(console.error);
