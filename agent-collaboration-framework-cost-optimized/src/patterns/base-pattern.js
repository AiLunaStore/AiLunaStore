/**
 * Base class for coordination patterns
 */
export class CoordinationPattern {
  constructor(options = {}) {
    this.options = options;
  }

  async execute(params) {
    throw new Error('execute() must be implemented by subclass');
  }

  validateParams(params, required) {
    for (const param of required) {
      if (!(param in params)) {
        throw new Error(`Missing required parameter: ${param}`);
      }
    }
  }
}