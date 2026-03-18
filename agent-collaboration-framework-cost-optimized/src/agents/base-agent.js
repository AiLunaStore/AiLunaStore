/**
 * Base Agent class
 */
export class BaseAgent {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.description = config.description;
    this.capabilities = config.capabilities || [];
  }

  async execute(task) {
    throw new Error('execute() must be implemented by subclass');
  }

  hasCapability(capability) {
    return this.capabilities.includes(capability);
  }
}