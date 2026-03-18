/**
 * Result Integrator - Combines subagent outputs into a cohesive final result
 */
export class ResultIntegrator {
  constructor(options = {}) {
    this.options = {
      conflictResolution: options.conflictResolution || 'priority',
      deduplicate: options.deduplicate ?? true,
      ...options
    };
  }

  integrate(params) {
    const { task, subtaskResults, analysis } = params;
    
    const successful = subtaskResults.filter(r => r.success);
    const failed = subtaskResults.filter(r => !r.success);
    
    if (successful.length === 0) {
      return {
        success: false,
        error: 'All subtasks failed',
        failedSubtasks: failed.map(f => ({ id: f.subtask.id, error: f.error }))
      };
    }
    
    const findings = this.extractFindings(successful);
    const conflicts = this.identifyConflicts(findings);
    const resolved = this.resolveConflicts(conflicts, analysis);
    const solution = this.synthesizeSolution(task, findings, resolved, analysis);
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
    
    return findings.sort((a, b) => (a.priority || 5) - (b.priority || 5));
  }

  identifyConflicts(findings) {
    const conflicts = [];
    const byDomain = {};
    
    for (const finding of findings) {
      const key = finding.domain || 'general';
      if (!byDomain[key]) byDomain[key] = [];
      byDomain[key].push(finding);
    }
    
    for (const [domain, domainFindings] of Object.entries(byDomain)) {
      if (domainFindings.length < 2) continue;
      
      const recommendations = domainFindings.filter(f => f.type === 'recommendation');
      for (let i = 0; i < recommendations.length; i++) {
        for (let j = i + 1; j < recommendations.length; j++) {
          if (this.areOpposing(recommendations[i], recommendations[j])) {
            conflicts.push({
              type: 'opposing_recommendations',
              domain,
              findings: [recommendations[i], recommendations[j]],
              severity: 'high'
            });
          }
        }
      }
    }
    
    return conflicts;
  }

  areOpposing(rec1, rec2) {
    const opposites = [
      ['increase', 'decrease'],
      ['add', 'remove'],
      ['enable', 'disable'],
      ['upgrade', 'downgrade']
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

  resolveConflicts(conflicts, analysis) {
    return conflicts.map(conflict => {
      const resolution = { ...conflict, resolution: null, resolvedBy: null };
      
      switch (this.options.conflictResolution) {
        case 'priority':
          const sorted = conflict.findings.sort((a, b) => 
            (a.priority || 5) - (b.priority || 5)
          );
          resolution.resolution = sorted[0];
          resolution.resolvedBy = 'priority';
          break;
        default:
          resolution.resolvedBy = 'manual';
      }
      
      return resolution;
    });
  }

  synthesizeSolution(task, findings, resolved, analysis) {
    const byType = {};
    for (const finding of findings) {
      const type = finding.type || 'general';
      if (!byType[type]) byType[type] = [];
      byType[type].push(finding);
    }
    
    const components = [];
    
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
    
    const recommendations = [
      ...(byType.recommendation || []),
      ...(resolved.filter(r => r.resolution).map(r => r.resolution))
    ];
    
    if (recommendations.length > 0) {
      const uniqueRecs = this.options.deduplicate ? this.deduplicate(recommendations) : recommendations;
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
    
    return {
      title: `Solution for: ${task.description}`,
      summary: this.generateSolutionSummary(components),
      components,
      affectedDomains: analysis.domains,
      estimatedEffort: this.estimateEffort(components)
    };
  }

  deduplicate(recommendations) {
    const seen = new Set();
    return recommendations.filter(rec => {
      const key = (rec.content || rec.action || '').toLowerCase().trim();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  generateSolutionSummary(components) {
    const parts = components
      .filter(c => c.items && c.items.length > 0)
      .map(c => `${c.description}: ${c.items.length} item(s)`);
    return parts.join('; ') || 'No specific solution components identified';
  }

  estimateEffort(components) {
    const totalItems = components.reduce((sum, c) => sum + (c.items?.length || 0), 0);
    return {
      items: totalItems,
      estimatedMinutes: { min: totalItems * 5, max: totalItems * 15 },
      level: totalItems <= 2 ? 'low' : totalItems <= 5 ? 'medium' : 'high'
    };
  }

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