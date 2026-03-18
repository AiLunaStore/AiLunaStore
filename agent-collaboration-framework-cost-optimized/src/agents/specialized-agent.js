/**
 * Specialized Agent class with cost and quality metrics
 */
import { BaseAgent } from './base-agent.js';

export class SpecializedAgent extends BaseAgent {
  constructor(config) {
    super(config);
    this.model = config.model;
    this.inputCost = config.inputCost;
    this.outputCost = config.outputCost;
    this.quality = config.quality;
    this.speed = config.speed;
    this.domains = config.domains || [];
    this.expertise = config.expertise || {};
    this.costProfile = config.costProfile || {};
    this.qualityCostRatio = config.qualityCostRatio || 0;
  }

  getCostEstimate(inputTokens, outputTokens) {
    const input = (inputTokens / 1000000) * this.inputCost;
    const output = (outputTokens / 1000000) * this.outputCost;
    return { input, output, total: input + output };
  }

  getExpertiseLevel(domain) {
    return this.expertise[domain] || 0.5;
  }
}