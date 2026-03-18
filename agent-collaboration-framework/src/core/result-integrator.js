/**
 * Result Integrator - Combines subagent outputs into a cohesive final result
 */
export class ResultIntegrator {
  constructor(options = {}) {
    this.options = {
      conflictResolution: options.conflictResolution || 'priority', // priority, merge, or manual
      deduplicate: options.deduplicate ?? true,
      ...options
    };
  }

  /**
   * Integrate subtask results into a final result
   * @param {Object} params - Integration parameters
   * @returns {Object} Integrated result
   */
  integrate(params) {
    const { task, subtaskResults, analysis } = params;
    
    // Filter successful results
    const successful = subtaskResults.filter(r => r.success);
    const failed = subtaskResults.filter(r => !r.success);
    
    if (successful.length === 0) {
      return {
        success: false,
        error: 'All subtasks failed',
        failedSubtasks: failed.map(f => ({
          id: f.subtask.id,
          error: f.error
        }))
      };
    }
    
    // Extract findings from all subtasks
    const findings = this.extractFindings(successful);
    
    // Identify conflicts
    const conflicts = this.identifyConflicts(findings);
    
    // Resolve conflicts
    const resolved = this.resolveConflicts(conflicts, analysis);
    
    // Synthesize final solution
    const solution = this.synthesizeSolution(task, findings, resolved, analysis);
    
    // Generate summary
    const summary = this.generateSummary(task, successful, failed, solution);
    
    return {
      success: true,
      solution,
      summary,
      findings,
      conflicts: resolved,
      metadata: {
        totalSubtasks: subtaskResults.length,
        successfulSubtasks: successful.length,
        failedSubtasks: failed.length,
        domains: analysis.domains
      }
    };
  }

  /**
   * Extract findings from subtask results
   * @param {Object[]} results - Successful subtask results
   * @returns {Object[]} Extracted findings
   */
  extractFindings(results) {
    const findings = [];
    
    for (const result of results) {
      const { subtask, result: subtaskResult } = result;
      
      if (subtaskResult.findings) {
        for (const finding of subtaskResult.findings) {
          findings.push({
            ...finding,
            source: subtask.id,
            domain: subtask.domain,
            agent: result.agent,
            timestamp: Date.now()
          });
        }
      }
      
      // Also extract from output if structured
      if (subtaskResult.output) {
        findings.push({
          type: 'output',
          content: subtaskResult.output,
          source: subtask.id,
          domain: subtask.domain,
          agent: result.agent,
          priority: subtask.priority || 5
        });
      }
    }
    
    // Sort by priority
    return findings.sort((a, b) => (a.priority || 5) - (b.priority || 5));
  }

  /**
   * Identify conflicts between findings
   * @param {Object[]} findings - All findings
   * @returns {Object[]} Identified conflicts
   */
  identifyConflicts(findings) {
    const conflicts = [];
    
    // Group findings by type/domain
    const byDomain = {};
    for (const finding of findings) {
      const key = finding.domain || 'general';
      if (!byDomain[key]) byDomain[key] = [];
      byDomain[key].push(finding);
    }
    
    // Check for contradictions within domains
    for (const [domain, domainFindings] of Object.entries(byDomain)) {
      if (domainFindings.length < 2) continue;
      
      // Look for opposing recommendations
      const recommendations = domainFindings.filter(f => f.type === 'recommendation');
      for (let i = 0; i < recommendations.length; i++) {
        for (let j = i + 1; j < recommendations.length; j++) {
          const rec1 = recommendations[i];
          const rec2 = recommendations[j];
          
          // Simple conflict detection: opposite actions
          if (this.areOpposing(rec1, rec2)) {
            conflicts.push({
              type: 'opposing_recommendations',
              domain,
              findings: [rec1, rec2],
              severity: 'high'
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  /**
   * Check if two recommendations are opposing
   * @param {Object} rec1 - First recommendation
   * @param {Object} rec2 - Second recommendation
   * @returns {boolean} Whether they oppose
   */
  areOpposing(rec1, rec2) {
    const opposites = [
      ['increase', 'decrease'],
      ['add', 'remove'],
      ['enable', 'disable'],
      ['upgrade', 'downgrade'],
      ['synchronous', 'asynchronous']
    ];
    
    const content1 = (rec1.content || rec1.action || '').toLowerCase();
    const content2 = (rec2.content || rec2.action || '').toLowerCase();
    
    for (const [opp1, opp2] of opposites) {
      if ((content1.includes(opp1) && content2.includes(opp2)) ||
          (content1.includes(opp2) && content2.includes(opp1))) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Resolve conflicts between findings
   * @param {Object[]} conflicts - Identified conflicts
   * @param {Object} analysis - Task analysis
   * @returns {Object[]} Resolved conflicts
   */
  resolveConflicts(conflicts, analysis) {
    const resolved = [];
    
    for (const conflict of conflicts) {
      const resolution = {
        ...conflict,
        resolution: null,
        resolvedBy: null
      };
      
      switch (this.options.conflictResolution) {
        case 'priority':
          // Choose based on priority
          const sorted = conflict.findings.sort((a, b) => 
            (a.priority || 5) - (b.priority || 5)
          );
          resolution.resolution = sorted[0];
          resolution.resolvedBy = 'priority';
          break;
          
        case 'domain':
          // Choose based on domain relevance to task
          const domainScores = conflict.findings.map(f => ({
            finding: f,
            score: analysis.domains.indexOf(f.domain)
          }));
          domainScores.sort((a, b) => a.score - b.score);
          resolution.resolution = domainScores[0].finding;
          resolution.resolvedBy = 'domain_relevance';
          break;
          
        case 'merge':
          // Try to merge both findings
          resolution.resolution = this.mergeFindings(conflict.findings);
          resolution.resolvedBy = 'merge';
          break;
          
        default:
          // Manual resolution required
          resolution.resolvedBy = 'manual';
      }
      
      resolved.push(resolution);
    }
    
    return resolved;
  }

  /**
   * Merge multiple findings into one
   * @param {Object[]} findings - Findings to merge
   * @returns {Object} Merged finding
   */
  mergeFindings(findings) {
    if (findings.length === 0) return null;
    if (findings.length === 1) return findings[0];
    
    return {
      type: 'merged',
      content: findings.map(f => f.content || f.action).join('; '),
      sources: findings.map(f => f.source),
      domains: [...new Set(findings.map(f => f.domain))],
      priority: Math.min(...findings.map(f => f.priority || 5))
    };
  }

  /**
   * Synthesize final solution from findings
   * @param {Object} task - Original task
   * @param {Object[]} findings - All findings
   * @param {Object[]} resolved - Resolved conflicts
   * @param {Object} analysis - Task analysis
   * @returns {Object} Synthesized solution
   */
  synthesizeSolution(task, findings, resolved, analysis) {
    // Group findings by type
    const byType = {};
    for (const finding of findings) {
      const type = finding.type || 'general';
      if (!byType[type]) byType[type] = [];
      byType[type].push(finding);
    }
    
    // Build solution components
    const components = [];
    
    // Root cause analysis
    if (byType.root_cause) {
      components.push({
        type: 'root_cause',
        description: 'Identified root causes',
        items: byType.root_cause.map(f => ({
          cause: f.content || f.description,
          domain: f.domain,
          confidence: f.confidence || 'medium'
        }))
      });
    }
    
    // Recommendations
    const recommendations = [
      ...(byType.recommendation || []),
      ...(resolved.filter(r => r.resolution).map(r => r.resolution))
    ];
    
    if (recommendations.length > 0) {
      // Deduplicate if enabled
      const uniqueRecs = this.options.deduplicate 
        ? this.deduplicate(recommendations)
        : recommendations;
      
      components.push({
        type: 'recommendations',
        description: 'Recommended actions',
        items: uniqueRecs.map(r => ({
          action: r.content || r.action,
          priority: r.priority || 5,
          domain: r.domain
        })).sort((a, b) => a.priority - b.priority)
      });
    }
    
    // Code changes
    if (byType.code_change) {
      components.push({
        type: 'code_changes',
        description: 'Suggested code modifications',
        items: byType.code_change.map(f => ({
          file: f.file,
          change: f.content || f.change,
          domain: f.domain
        }))
      });
    }
    
    // Build final solution object
    return {
      title: `Solution for: ${task.description}`,
      summary: this.generateSolutionSummary(components),
      components,
      affectedDomains: analysis.domains,
      estimatedEffort: this.estimateEffort(components),
      risks: this.identifyRisks(components)
    };
  }

  /**
   * Deduplicate recommendations
   * @param {Object[]} recommendations - Recommendations to dedupe
   * @returns {Object[]} Deduplicated recommendations
   */
  deduplicate(recommendations) {
    const seen = new Set();
    const unique = [];
    
    for (const rec of recommendations) {
      const key = (rec.content || rec.action || '').toLowerCase().trim();
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(rec);
      }
    }
    
    return unique;
  }

  /**
   * Generate a summary of the solution
   * @param {Object[]} components - Solution components
   * @returns {string} Summary text
   */
  generateSolutionSummary(components) {
    const parts = [];
    
    for (const component of components) {
      if (component.items && component.items.length > 0) {
        parts.push(`${component.description}: ${component.items.length} item(s)`);
      }
    }
    
    return parts.join('; ') || 'No specific solution components identified';
  }

  /**
   * Estimate effort required for solution
   * @param {Object[]} components - Solution components
   * @returns {Object} Effort estimate
   */
  estimateEffort(components) {
    let totalItems = 0;
    for (const component of components) {
      if (component.items) {
        totalItems += component.items.length;
      }
    }
    
    // Rough estimate: 5-15 minutes per item depending on complexity
    const minMinutes = totalItems * 5;
    const maxMinutes = totalItems * 15;
    
    return {
      items: totalItems,
      estimatedMinutes: { min: minMinutes, max: maxMinutes },
      level: totalItems <= 2 ? 'low' : totalItems <= 5 ? 'medium' : 'high'
    };
  }

  /**
   * Identify risks in the solution
   * @param {Object[]} components - Solution components
   * @returns {Object[]} Identified risks
   */
  identifyRisks(components) {
    const risks = [];
    
    // Check for cross-domain changes
    const domains = new Set();
    for (const component of components) {
      if (component.items) {
        for (const item of component.items) {
          if (item.domain) domains.add(item.domain);
        }
      }
    }
    
    if (domains.size > 2) {
      risks.push({
        type: 'cross_domain',
        description: 'Changes span multiple domains, requiring careful coordination',
        severity: 'medium'
      });
    }
    
    return risks;
  }

  /**
   * Generate overall summary
   * @param {Object} task - Original task
   * @param {Object[]} successful - Successful subtask results
   * @param {Object[]} failed - Failed subtask results
   * @param {Object} solution - Synthesized solution
   * @returns {Object} Summary
   */
  generateSummary(task, successful, failed, solution) {
    return {
      task: task.description,
      status: failed.length === 0 ? 'complete' : 'partial',
      completionRate: successful.length / (successful.length + failed.length),
      domainsInvolved: [...new Set(successful.map(s => s.subtask.domain))],
      keyFindings: solution.components.length,
      effort: solution.estimatedEffort,
      nextSteps: solution.components
        .find(c => c.type === 'recommendations')?.items
        .slice(0, 3)
        .map(i => i.action) || []
    };
  }
}
