import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AgentRegistry } from '../src/core/agent-registry.js';

describe('AgentRegistry', () => {
  describe('default agents', () => {
    const registry = new AgentRegistry();

    it('should register all default agents', () => {
      const agents = registry.getAllAgents();
      assert.strictEqual(agents.length, 6);
    });

    it('should have UI specialist', () => {
      const agent = registry.getAgent('ui-specialist');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'UI/JavaScript Specialist');
      assert.ok(agent.domains.includes('ui'));
    });

    it('should have backend specialist', () => {
      const agent = registry.getAgent('backend-specialist');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'Backend/API Specialist');
      assert.ok(agent.domains.includes('backend'));
    });

    it('should have database specialist', () => {
      const agent = registry.getAgent('database-specialist');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'Database Specialist');
      assert.ok(agent.domains.includes('database'));
    });

    it('should have network specialist', () => {
      const agent = registry.getAgent('network-specialist');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'Network Specialist');
      assert.ok(agent.domains.includes('network'));
    });

    it('should have integration specialist', () => {
      const agent = registry.getAgent('integration-specialist');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'Integration Specialist');
      assert.ok(agent.domains.includes('integration'));
    });

    it('should have debugging specialist', () => {
      const agent = registry.getAgent('debugging-specialist');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'Debugging Specialist');
      assert.ok(agent.domains.includes('debugging'));
    });
  });

  describe('findByDomain', () => {
    const registry = new AgentRegistry();

    it('should find agents by domain', () => {
      const matches = registry.findByDomain('ui');
      assert.ok(matches.length > 0);
      assert.ok(matches.every(m => m.agent.domains.includes('ui')));
    });

    it('should sort by expertise', () => {
      const matches = registry.findByDomain('backend');
      if (matches.length > 1) {
        for (let i = 1; i < matches.length; i++) {
          assert.ok(matches[i-1].expertise >= matches[i].expertise);
        }
      }
    });
  });

  describe('matchAgents', () => {
    const registry = new AgentRegistry();

    it('should match subtasks to agents', () => {
      const subtasks = [
        { id: 'st-1', domain: 'ui', description: 'Fix UI' },
        { id: 'st-2', domain: 'backend', description: 'Fix API' }
      ];

      const assignments = registry.matchAgents(subtasks);

      assert.strictEqual(assignments.length, 2);
      assert.ok(assignments[0].agent);
      assert.ok(assignments[1].agent);
    });

    it('should use fallback for unknown domains', () => {
      const subtasks = [
        { id: 'st-1', domain: 'unknown-domain', description: 'Mystery task' }
      ];

      const assignments = registry.matchAgents(subtasks);

      assert.strictEqual(assignments.length, 1);
      assert.strictEqual(assignments[0].agent.id, 'debugging-specialist');
      assert.strictEqual(assignments[0].isFallback, true);
    });
  });

  describe('register/unregister', () => {
    it('should register custom agent', () => {
      const registry = new AgentRegistry({ skipDefaults: true });
      
      registry.register({
        id: 'custom-agent',
        name: 'Custom Agent',
        domains: ['custom'],
        capabilities: ['custom-task'],
        expertise: { custom: 0.9 }
      });

      const agent = registry.getAgent('custom-agent');
      assert.ok(agent);
      assert.strictEqual(agent.name, 'Custom Agent');
    });

    it('should unregister agent', () => {
      const registry = new AgentRegistry({ skipDefaults: true });
      
      registry.register({
        id: 'temp-agent',
        name: 'Temp Agent',
        domains: ['temp'],
        capabilities: [],
        expertise: {}
      });

      assert.ok(registry.getAgent('temp-agent'));
      
      registry.unregister('temp-agent');
      assert.strictEqual(registry.getAgent('temp-agent'), undefined);
    });
  });
});
