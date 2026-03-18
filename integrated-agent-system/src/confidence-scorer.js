/**
 * Confidence Scoring System
 * Calculates confidence scores for model outputs (0-1 scale)
 */
export class ConfidenceScorer {
  constructor(options = {}) {
    this.thresholds = {
      cheap: options.cheapThreshold || 0.75,
      standard: options.standardThreshold || 0.85,
      critical: options.criticalThreshold || 0.90,
      ...options.thresholds
    };
    
    // Scoring weights
    this.weights = {
      completeness: 0.25,
      codeQuality: 0.25,
      errorDetection: 0.20,
      testCoverage: 0.15,
      documentation: 0.10,
      consistency: 0.05
    };
  }

  /**
   * Calculate confidence score for a result
   * @param {Object} result - Model execution result
   * @param {Object} task - Original task
   * @returns {Object} Confidence score and breakdown
   */
  calculateConfidence(result, task) {
    const metrics = this.analyzeResult(result, task);
    
    // Calculate weighted score
    let totalScore = 0;
    let totalWeight = 0;
    
    for (const [metric, score] of Object.entries(metrics)) {
      const weight = this.weights[metric] || 0;
      totalScore += score * weight;
      totalWeight += weight;
    }
    
    const confidence = totalWeight > 0 ? totalScore / totalWeight : 0.5;
    
    return {
      overall: Math.min(1, Math.max(0, confidence)),
      metrics,
      threshold: this.getThresholdForTask(task),
      passed: confidence >= this.getThresholdForTask(task)
    };
  }

  /**
   * Analyze result for various quality metrics
   */
  analyzeResult(result, task) {
    const output = result.output || '';
    const taskType = this.inferTaskType(task);
    
    return {
      completeness: this.scoreCompleteness(output, taskType),
      codeQuality: this.scoreCodeQuality(output, taskType),
      errorDetection: this.scoreErrorDetection(output),
      testCoverage: this.scoreTestCoverage(output, taskType),
      documentation: this.scoreDocumentation(output, taskType),
      consistency: this.scoreConsistency(output, taskType)
    };
  }

  /**
   * Score completeness (0-1)
   */
  scoreCompleteness(output, taskType) {
    if (taskType === 'coding') {
      // Check for complete implementation indicators
      let score = 0.5; // Base score
      
      // Has function/class definitions
      if (/function\s+\w+|class\s+\w+|const\s+\w+\s*=/.test(output)) score += 0.15;
      
      // Has return statements
      if (/return\s+/.test(output)) score += 0.10;
      
      // Has error handling
      if (/try\s*{|catch|throw|error/i.test(output)) score += 0.10;
      
      // Has imports/exports
      if (/import|export|require|module\.exports/.test(output)) score += 0.10;
      
      // Reasonable length (not too short)
      if (output.length > 200) score += 0.05;
      
      return Math.min(1, score);
    }
    
    if (taskType === 'research') {
      // Check for comprehensive research
      let score = 0.5;
      
      // Multiple sources mentioned
      const sourceMatches = output.match(/\b(source|reference|according to|study|paper|doc)\b/gi);
      if (sourceMatches && sourceMatches.length >= 3) score += 0.20;
      else if (sourceMatches && sourceMatches.length >= 1) score += 0.10;
      
      // Has comparisons
      if (/\b(vs|versus|compared to|difference|better|worse)\b/i.test(output)) score += 0.15;
      
      // Has conclusions
      if (/\b(conclusion|summary|in conclusion|therefore|thus)\b/i.test(output)) score += 0.15;
      
      return Math.min(1, score);
    }
    
    // Default for other task types
    return output.length > 100 ? 0.7 : 0.5;
  }

  /**
   * Score code quality (0-1)
   */
  scoreCodeQuality(output, taskType) {
    if (taskType !== 'coding') return 0.8; // Neutral for non-coding
    
    let score = 0.5;
    
    // Good naming conventions
    if (/[a-z][a-zA-Z0-9]*|[A-Z][a-zA-Z0-9]*/.test(output)) score += 0.10;
    
    // Has comments
    if (/\/\/|\/\*|\*|#/.test(output)) score += 0.10;
    
    // Proper indentation (simplified check)
    if (/^\s{2,}|^\t/m.test(output)) score += 0.10;
    
    // No obvious anti-patterns
    if (!/var\s+|eval\s*\(|with\s*\(/.test(output)) score += 0.10;
    
    // Uses modern syntax
    if (/const\s+|let\s+|async|await|=>/.test(output)) score += 0.10;
    
    return Math.min(1, score);
  }

  /**
   * Score error detection (0-1)
   */
  scoreErrorDetection(output) {
    let score = 0.5;
    
    // Mentions potential issues
    if (/\b(error|warning|caution|note|important|consider)\b/i.test(output)) score += 0.15;
    
    // Identifies edge cases
    if (/\b(edge case|corner case|boundary|null|undefined|empty)\b/i.test(output)) score += 0.15;
    
    // Suggests validation
    if (/\b(validate|check|verify|assert|test)\b/i.test(output)) score += 0.10;
    
    // No obvious errors in the output itself
    if (!/\b(syntax error|undefined is not|cannot read|typeerror)\b/i.test(output)) score += 0.10;
    
    return Math.min(1, score);
  }

  /**
   * Score test coverage indicators (0-1)
   */
  scoreTestCoverage(output, taskType) {
    if (taskType !== 'coding') return 0.8;
    
    let score = 0.3; // Lower base - tests are often separate
    
    // Includes test cases
    if (/\b(test|it\(|describe\(|expect\(|assert|mock)\b/.test(output)) score += 0.40;
    
    // Mentions testing approach
    if (/\b(unit test|integration test|test case|coverage)\b/i.test(output)) score += 0.20;
    
    // Has example usage
    if (/\b(example|usage|demo)\b/i.test(output)) score += 0.10;
    
    return Math.min(1, score);
  }

  /**
   * Score documentation quality (0-1)
   */
  scoreDocumentation(output, taskType) {
    let score = 0.5;
    
    // Has JSDoc/docstrings
    if (/\/\*\*|@param|@returns|@example/.test(output)) score += 0.25;
    
    // Has inline comments
    if (/\/\/.*\w+/.test(output)) score += 0.15;
    
    // Has README-style documentation
    if (/\b(README|# |## |### )/.test(output)) score += 0.10;
    
    // Explains approach
    if (/\b(approach|solution|implementation|design)\b/i.test(output)) score += 0.10;
    
    return Math.min(1, score);
  }

  /**
   * Score consistency (0-1)
   */
  scoreConsistency(output, taskType) {
    let score = 0.7; // Higher base
    
    // Consistent naming style
    const camelCase = (output.match(/\b[a-z][a-zA-Z0-9]*[A-Z]/g) || []).length;
    const snakeCase = (output.match(/\b[a-z]+_[a-z_]+\b/g) || []).length;
    
    if (camelCase > 0 && snakeCase > 0) {
      // Mixed styles - minor penalty
      score -= 0.10;
    }
    
    // Consistent formatting
    const lines = output.split('\n');
    const indentedLines = lines.filter(l => l.startsWith(' ') || l.startsWith('\t')).length;
    if (indentedLines / lines.length > 0.5) {
      score += 0.10; // Good indentation consistency
    }
    
    return Math.min(1, Math.max(0, score));
  }

  /**
   * Get appropriate threshold for task
   */
  getThresholdForTask(task) {
    if (task.critical) return this.thresholds.critical;
    if (task.complexity >= 8) return this.thresholds.standard;
    return this.thresholds.cheap;
  }

  /**
   * Infer task type from task
   */
  inferTaskType(task) {
    const desc = (task.description || '').toLowerCase();
    
    if (/\b(code|implement|function|class|debug|fix)\b/.test(desc)) return 'coding';
    if (/\b(research|find|search|analyze|compare)\b/.test(desc)) return 'research';
    if (/\b(plan|design|architecture|strategy)\b/.test(desc)) return 'planning';
    if (/\b(ui|css|html|frontend|component)\b/.test(desc)) return 'ui';
    if (/\b(api|backend|server|database)\b/.test(desc)) return 'backend';
    
    return 'general';
  }

  /**
   * Update thresholds based on performance
   */
  updateThresholds(performance) {
    // Adjust thresholds based on historical success rates
    if (performance.cheapSuccessRate > 0.9) {
      this.thresholds.cheap = Math.min(0.9, this.thresholds.cheap + 0.02);
    } else if (performance.cheapSuccessRate < 0.6) {
      this.thresholds.cheap = Math.max(0.5, this.thresholds.cheap - 0.02);
    }
    
    if (performance.standardSuccessRate > 0.9) {
      this.thresholds.standard = Math.min(0.95, this.thresholds.standard + 0.01);
    } else if (performance.standardSuccessRate < 0.7) {
      this.thresholds.standard = Math.max(0.7, this.thresholds.standard - 0.01);
    }
  }

  /**
   * Get current thresholds
   */
  getThresholds() {
    return { ...this.thresholds };
  }
}

export default ConfidenceScorer;
