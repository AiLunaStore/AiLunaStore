import { describe, it } from 'node:test';
import assert from 'node:assert';
import { TaskAnalyzer } from '../src/core/task-analyzer.js';

describe('TaskAnalyzer', () => {
  const analyzer = new TaskAnalyzer();

  describe('analyze', () => {
    it('should analyze a simple task', async () => {
      const task = {
        id: 'test-1',
        description: 'Fix CSS bug in header'
      };

      const result = await analyzer.analyze(task);

      assert.ok(result.domains.includes('ui'));
      assert.ok(result.complexity >= 1 && result.complexity <= 10);
      assert.ok(Array.isArray(result.subtasks));
      assert.ok(result.subtasks.length > 0);
    });

    it('should identify multiple domains for complex tasks', async () => {
      const task = {
        id: 'test-2',
        description: 'Debug API endpoint that queries database and renders UI'
      };

      const result = await analyzer.analyze(task);

      assert.ok(result.domains.length > 1);
      assert.ok(result.domains.includes('backend') || result.domains.includes('api'));
      assert.ok(result.domains.includes('database') || result.domains.includes('ui'));
    });

    it('should calculate complexity based on keywords', async () => {
      const simpleTask = {
        id: 'test-3',
        description: 'Update button color'
      };

      const complexTask = {
        id: 'test-4',
        description: 'Refactor authentication architecture with security hardening'
      };

      const simpleResult = await analyzer.analyze(simpleTask);
      const complexResult = await analyzer.analyze(complexTask);

      assert.ok(complexResult.complexity > simpleResult.complexity);
    });

    it('should map dependencies correctly', async () => {
      const task = {
        id: 'test-5',
        description: 'Debug and fix crash'
      };

      const result = await analyzer.analyze(task);

      assert.ok(result.dependencies);
      assert.ok(Array.isArray(result.parallelizable));
      
      // Integration task should depend on others
      const integrateTask = result.subtasks.find(st => st.type === 'integrate');
      if (integrateTask) {
        assert.ok(integrateTask.dependsOn);
        assert.ok(integrateTask.dependsOn.length > 0);
      }
    });
  });

  describe('identifyDomains', () => {
    it('should identify UI domain from keywords', () => {
      const domains = analyzer.identifyDomains('fix react component styling', {});
      assert.ok(domains.includes('ui'));
    });

    it('should identify backend domain from keywords', () => {
      const domains = analyzer.identifyDomains('update express middleware', {});
      assert.ok(domains.includes('backend'));
    });

    it('should identify database domain from keywords', () => {
      const domains = analyzer.identifyDomains('optimize sql query', {});
      assert.ok(domains.includes('database'));
    });

    it('should identify debugging domain from error context', () => {
      const domains = analyzer.identifyDomains('something broke', {
        error: 'Cannot read property of undefined'
      });
      assert.ok(domains.includes('debugging'));
    });
  });

  describe('calculateComplexity', () => {
    it('should return base complexity for neutral tasks', () => {
      const score = analyzer.calculateComplexity('do something', []);
      assert.ok(score >= 1 && score <= 10);
    });

    it('should increase complexity for refactoring tasks', () => {
      const score = analyzer.calculateComplexity('refactor codebase', []);
      assert.ok(score > 5);
    });

    it('should increase complexity with more domains', () => {
      const score1 = analyzer.calculateComplexity('task', ['ui']);
      const score2 = analyzer.calculateComplexity('task', ['ui', 'backend', 'database']);
      assert.ok(score2 > score1);
    });
  });
});
