/**
 * Configuration Validation Script
 */

import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const configDir = join(__dirname, '..', 'config');

const loadJSON = (filename) => {
  try {
    const content = readFileSync(join(configDir, filename), 'utf8');
    return JSON.parse(content);
  } catch (error) {
    console.error(`❌ Failed to load ${filename}:`, error.message);
    return null;
  }
};

const validateModels = (config) => {
  console.log('Validating models.json...');
  
  if (!config.models || Object.keys(config.models).length === 0) {
    console.error('❌ No models defined');
    return false;
  }
  
  let valid = true;
  
  for (const [id, model] of Object.entries(config.models)) {
    if (!model.name) {
      console.error(`❌ Model ${id}: missing name`);
      valid = false;
    }
    if (!model.pricing?.inputPer1M || !model.pricing?.outputPer1M) {
      console.error(`❌ Model ${id}: missing pricing`);
      valid = false;
    }
    if (!model.performance?.sweBench) {
      console.error(`❌ Model ${id}: missing performance metrics`);
      valid = false;
    }
  }
  
  if (valid) {
    console.log(`✓ ${Object.keys(config.models).length} models validated`);
  }
  
  return valid;
};

const validateAgents = (config) => {
  console.log('Validating agents.json...');
  
  if (!config.agents || Object.keys(config.agents).length === 0) {
    console.error('❌ No agents defined');
    return false;
  }
  
  let valid = true;
  
  for (const [id, agent] of Object.entries(config.agents)) {
    if (!agent.name) {
      console.error(`❌ Agent ${id}: missing name`);
      valid = false;
    }
    if (!agent.primaryModel) {
      console.error(`❌ Agent ${id}: missing primaryModel`);
      valid = false;
    }
    if (!agent.domains || agent.domains.length === 0) {
      console.error(`❌ Agent ${id}: missing domains`);
      valid = false;
    }
  }
  
  if (valid) {
    console.log(`✓ ${Object.keys(config.agents).length} agents validated`);
  }
  
  return valid;
};

const validateStrategies = (config) => {
  console.log('Validating strategies.json...');
  
  if (!config.strategies || Object.keys(config.strategies).length === 0) {
    console.error('❌ No strategies defined');
    return false;
  }
  
  let valid = true;
  
  for (const [id, strategy] of Object.entries(config.strategies)) {
    if (!strategy.weights) {
      console.error(`❌ Strategy ${id}: missing weights`);
      valid = false;
    }
  }
  
  if (valid) {
    console.log(`✓ ${Object.keys(config.strategies).length} strategies validated`);
  }
  
  return valid;
};

const validateFallbackChains = (config) => {
  console.log('Validating fallback-chains.json...');
  
  if (!config.fallbackChains || Object.keys(config.fallbackChains).length === 0) {
    console.error('❌ No fallback chains defined');
    return false;
  }
  
  let valid = true;
  
  for (const [type, chain] of Object.entries(config.fallbackChains)) {
    if (!chain.steps || chain.steps.length === 0) {
      console.error(`❌ Fallback chain ${type}: no steps defined`);
      valid = false;
    }
  }
  
  if (valid) {
    console.log(`✓ ${Object.keys(config.fallbackChains).length} fallback chains validated`);
  }
  
  return valid;
};

const main = () => {
  console.log('🔍 Validating configuration...\n');
  
  const models = loadJSON('models.json');
  const agents = loadJSON('agents.json');
  const strategies = loadJSON('strategies.json');
  const fallbackChains = loadJSON('fallback-chains.json');
  
  if (!models || !agents || !strategies || !fallbackChains) {
    console.error('\n❌ Configuration validation failed');
    process.exit(1);
  }
  
  const results = [
    validateModels(models),
    validateAgents(agents),
    validateStrategies(strategies),
    validateFallbackChains(fallbackChains)
  ];
  
  if (results.every(r => r)) {
    console.log('\n✅ All configuration files are valid');
    process.exit(0);
  } else {
    console.error('\n❌ Configuration validation failed');
    process.exit(1);
  }
};

main();
