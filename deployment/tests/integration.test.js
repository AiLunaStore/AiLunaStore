/**
 * Integration Tests for Mission Control
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { app, server } from '../server.js';
import request from 'supertest';

describe('Mission Control API', () => {
  let agent;

  beforeAll(() => {
    agent = request(app);
  });

  afterAll((done) => {
    server.close(done);
  });

  describe('Health Check', () => {
    it('should return healthy status', async () => {
      const res = await agent.get('/api/health');
      expect(res.status).toBe(200);
      expect(res.body.status).toBe('healthy');
      expect(res.body).toHaveProperty('uptime');
      expect(res.body).toHaveProperty('version');
    });
  });

  describe('System Status', () => {
    it('should return system status', async () => {
      const res = await agent.get('/api/status');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('system');
      expect(res.body).toHaveProperty('agentSystem');
    });
  });

  describe('Agents', () => {
    it('should list all agents', async () => {
      const res = await agent.get('/api/agents');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('agents');
      expect(res.body).toHaveProperty('activeCount');
      expect(res.body).toHaveProperty('totalCount');
      expect(Array.isArray(res.body.agents)).toBe(true);
    });

    it('should return 404 for unknown agent', async () => {
      const res = await agent.get('/api/agents/unknown-agent');
      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Agent not found');
    });
  });

  describe('Metrics', () => {
    it('should return dashboard metrics', async () => {
      const res = await agent.get('/api/metrics');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('currentSpending');
      expect(res.body).toHaveProperty('totalBudget');
      expect(res.body).toHaveProperty('successRate');
      expect(res.body).toHaveProperty('byModel');
    });
  });

  describe('Costs', () => {
    it('should return cost report', async () => {
      const res = await agent.get('/api/costs');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('breakdowns');
      expect(res.body).toHaveProperty('budgets');
    });
  });

  describe('Performance', () => {
    it('should return performance report', async () => {
      const res = await agent.get('/api/performance');
      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('summary');
      expect(res.body).toHaveProperty('quality');
      expect(res.body).toHaveProperty('comparison');
    });
  });

  describe('History', () => {
    it('should return execution history', async () => {
      const res = await agent.get('/api/history');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('should respect limit parameter', async () => {
      const res = await agent.get('/api/history?limit=10');
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });
  });

  describe('Task Execution', () => {
    it('should execute a task', async () => {
      const task = {
        id: 'test-task-1',
        description: 'Test task execution',
        complexity: 5,
        strategy: 'balanced',
        budget: 1.00
      };

      const res = await agent
        .post('/api/execute')
        .send(task);

      expect(res.status).toBe(200);
      expect(res.body).toHaveProperty('success');
      expect(res.body).toHaveProperty('result');
      expect(res.body).toHaveProperty('duration');
    });

    it('should handle missing description', async () => {
      const task = {
        id: 'test-task-2',
        complexity: 5
      };

      const res = await agent
        .post('/api/execute')
        .send(task);

      // Should still work with defaults
      expect(res.status).toBe(200);
    });
  });

  describe('Configuration', () => {
    it('should update configuration', async () => {
      const config = {
        strategy: 'quality',
        budget: 20.00
      };

      const res = await agent
        .post('/api/config')
        .send(config);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.config.strategy).toBe('quality');
    });
  });
});

describe('Integrated Agent System', () => {
  it('should calculate cost savings correctly', async () => {
    const res = await request(app).get('/api/performance');
    expect(res.body.comparison).toHaveProperty('savings');
    expect(res.body.comparison).toHaveProperty('savingsPercent');
    expect(typeof res.body.comparison.savings).toBe('number');
    expect(typeof res.body.comparison.savingsPercent).toBe('number');
  });

  it('should track budget utilization', async () => {
    const res = await request(app).get('/api/metrics');
    expect(typeof res.body.budgetUtilization).toBe('number');
    expect(res.body.budgetUtilization).toBeGreaterThanOrEqual(0);
    expect(res.body.budgetUtilization).toBeLessThanOrEqual(100);
  });
});
