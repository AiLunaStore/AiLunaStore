"""
Self-critique layer for quality control.
Checks outputs for errors, hallucinations, and inconsistencies.
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from enum import Enum


class IssueSeverity(Enum):
    CRITICAL = "critical"
    MAJOR = "major"
    MINOR = "minor"
    INFO = "info"


@dataclass
class CritiqueIssue:
    """A single issue found during critique."""
    severity: IssueSeverity
    category: str
    description: str
    location: Optional[str] = None
    suggestion: Optional[str] = None


class SelfCritiqueLayer:
    """
    Self-critique layer that checks outputs for quality issues.
    Model: GPT-4o-mini or DeepSeek Chat
    """
    
    def __init__(self, config: Optional[Dict] = None):
        self.config = config or {}
        self.checks_enabled = {
            "logical_errors": True,
            "hallucinations": True,
            "incomplete_tasks": True,
            "inconsistencies": True,
            "code_quality": True,
            "factual_accuracy": True
        }
    
    async def critique(self, output: Any, context: Dict, 
                      task_type: str = "general") -> Dict:
        """
        Perform self-critique on output.
        
        Args:
            output: The output to critique
            context: Execution context
            task_type: Type of task (coding, research, etc.)
            
        Returns:
            Critique result with findings
        """
        issues = []
        
        # Run enabled checks
        if self.checks_enabled["logical_errors"]:
            issues.extend(self._check_logical_errors(output, task_type))
        
        if self.checks_enabled["hallucinations"]:
            issues.extend(self._check_hallucinations(output, task_type))
        
        if self.checks_enabled["incomplete_tasks"]:
            issues.extend(self._check_incomplete_tasks(output, context))
        
        if self.checks_enabled["inconsistencies"]:
            issues.extend(self._check_inconsistencies(output))
        
        if self.checks_enabled["code_quality"] and task_type == "coding":
            issues.extend(self._check_code_quality(output))
        
        if self.checks_enabled["factual_accuracy"] and task_type == "research":
            issues.extend(self._check_factual_accuracy(output))
        
        # Calculate overall quality score
        quality_score = self._calculate_quality_score(issues)
        
        # Determine if high-risk
        has_critical = any(i.severity == IssueSeverity.CRITICAL for i in issues)
        has_major = any(i.severity == IssueSeverity.MAJOR for i in issues)
        
        return {
            "quality_score": quality_score,
            "overall_assessment": "needs_review" if (has_critical or has_major) else "acceptable",
            "issues_found": len(issues),
            "critical_issues": len([i for i in issues if i.severity == IssueSeverity.CRITICAL]),
            "major_issues": len([i for i in issues if i.severity == IssueSeverity.MAJOR]),
            "minor_issues": len([i for i in issues if i.severity == IssueSeverity.MINOR]),
            "issues": [
                {
                    "severity": i.severity.value,
                    "category": i.category,
                    "description": i.description,
                    "location": i.location,
                    "suggestion": i.suggestion
                }
                for i in issues
            ],
            "recommendations": self._generate_recommendations(issues)
        }
    
    def _check_logical_errors(self, output: Any, task_type: str) -> List[CritiqueIssue]:
        """Check for logical errors in output."""
        issues = []
        
        if isinstance(output, dict):
            # Check for contradictory statements
            if "result" in output and "error" in output:
                if output["result"] and output["error"]:
                    issues.append(CritiqueIssue(
                        severity=IssueSeverity.CRITICAL,
                        category="logical_error",
                        description="Output contains both result and error - contradictory",
                        suggestion="Clarify whether the task succeeded or failed"
                    ))
            
            # Check for impossible values
            if "confidence" in output:
                confidence = output["confidence"]
                if confidence < 0 or confidence > 1:
                    issues.append(CritiqueIssue(
                        severity=IssueSeverity.MAJOR,
                        category="logical_error",
                        description=f"Confidence value {confidence} is outside valid range [0, 1]",
                        suggestion="Ensure confidence values are normalized"
                    ))
        
        if isinstance(output, str):
            # Check for contradictory statements in text
            contradictions = [
                ("always", "never"),
                ("all", "none"),
                ("definitely", "maybe"),
                ("certainly", "uncertain")
            ]
            
            output_lower = output.lower()
            for word1, word2 in contradictions:
                if word1 in output_lower and word2 in output_lower:
                    # Simple check - could be improved with NLP
                    if abs(output_lower.index(word1) - output_lower.index(word2)) < 200:
                        issues.append(CritiqueIssue(
                            severity=IssueSeverity.MINOR,
                            category="logical_error",
                            description=f"Potential contradiction: '{word1}' and '{word2}' used close together",
                            suggestion="Review for logical consistency"
                        ))
        
        return issues
    
    def _check_hallucinations(self, output: Any, task_type: str) -> List[CritiqueIssue]:
        """Check for potential hallucinations."""
        issues = []
        
        if isinstance(output, str):
            # Check for overly specific details without citations
            hallucination_indicators = [
                "I remember",
                "I know for a fact",
                "definitely happened",
                "certainly true",
                "without a doubt"
            ]
            
            for indicator in hallucination_indicators:
                if indicator.lower() in output.lower():
                    issues.append(CritiqueIssue(
                        severity=IssueSeverity.MINOR,
                        category="potential_hallucination",
                        description=f"Strong assertion without citation: '{indicator}'",
                        suggestion="Add source citations or qualify statements"
                    ))
            
            # Check for fabricated statistics
            import re
            stat_pattern = r'\d+\.?\d*\s*%|\d+\.?\d*\s*(million|billion|thousand)'
            stats = re.findall(stat_pattern, output)
            
            if stats and "source" not in output.lower() and "according to" not in output.lower():
                issues.append(CritiqueIssue(
                    severity=IssueSeverity.MAJOR,
                    category="potential_hallucination",
                    description=f"Statistics provided without sources: {stats[:3]}",
                    suggestion="Add citations for all statistics"
                ))
        
        return issues
    
    def _check_incomplete_tasks(self, output: Any, context: Dict) -> List[CritiqueIssue]:
        """Check for incomplete tasks."""
        issues = []
        
        # Check if output indicates incompleteness
        incomplete_indicators = [
            "to be continued",
            "not finished",
            "incomplete",
            "partial",
            "placeholder",
            "TODO",
            "FIXME",
            "coming soon"
        ]
        
        output_str = str(output).lower()
        for indicator in incomplete_indicators:
            if indicator in output_str:
                issues.append(CritiqueIssue(
                    severity=IssueSeverity.MAJOR,
                    category="incomplete_task",
                    description=f"Task appears incomplete: '{indicator}' found in output",
                    suggestion="Complete the task or document why it's incomplete"
                ))
        
        # Check against original requirements
        requirements = context.get("requirements", [])
        if requirements:
            for req in requirements:
                req_str = str(req).lower()
                if req_str not in output_str:
                    issues.append(CritiqueIssue(
                        severity=IssueSeverity.MAJOR,
                        category="incomplete_task",
                        description=f"Requirement not addressed: '{req}'",
                        suggestion="Ensure all requirements are met"
                    ))
        
        return issues
    
    def _check_inconsistencies(self, output: Any) -> List[CritiqueIssue]:
        """Check for internal inconsistencies."""
        issues = []
        
        if isinstance(output, dict):
            # Check for type mismatches
            for key, value in output.items():
                if key.endswith("_count") or key.endswith("_num"):
                    if not isinstance(value, (int, float)):
                        issues.append(CritiqueIssue(
                            severity=IssueSeverity.MINOR,
                            category="inconsistency",
                            description=f"Expected numeric value for '{key}', got {type(value).__name__}",
                            suggestion="Ensure consistent data types"
                        ))
                
                if key.endswith("_list") or key.endswith("_array"):
                    if not isinstance(value, list):
                        issues.append(CritiqueIssue(
                            severity=IssueSeverity.MINOR,
                            category="inconsistency",
                            description=f"Expected list for '{key}', got {type(value).__name__}",
                            suggestion="Ensure consistent data types"
                        ))
        
        return issues
    
    def _check_code_quality(self, output: Any) -> List[CritiqueIssue]:
        """Check code quality issues."""
        issues = []
        
        if isinstance(output, str):
            # Check for common code issues
            if "print(" in output and "logging" not in output.lower():
                issues.append(CritiqueIssue(
                    severity=IssueSeverity.MINOR,
                    category="code_quality",
                    description="Using print() instead of logging",
                    suggestion="Use proper logging for production code"
                ))
            
            if "except:" in output and "except Exception" not in output:
                issues.append(CritiqueIssue(
                    severity=IssueSeverity.MAJOR,
                    category="code_quality",
                    description="Bare except clause detected",
                    suggestion="Use specific exception types"
                ))
            
            if output.count("# TODO") > 2:
                issues.append(CritiqueIssue(
                    severity=IssueSeverity.MINOR,
                    category="code_quality",
                    description="Multiple TODO comments found",
                    suggestion="Address TODOs or create tickets"
                ))
        
        return issues
    
    def _check_factual_accuracy(self, output: Any) -> List[CritiqueIssue]:
        """Check for factual accuracy issues."""
        issues = []
        
        # This would typically involve fact-checking against sources
        # For now, we check for common red flags
        
        if isinstance(output, str):
            # Check for uncertain language in factual statements
            uncertain_language = [
                "I think",
                "probably",
                "maybe",
                "might be",
                "could be",
                "possibly"
            ]
            
            for phrase in uncertain_language:
                if phrase in output.lower():
                    issues.append(CritiqueIssue(
                        severity=IssueSeverity.INFO,
                        category="factual_uncertainty",
                        description=f"Uncertain language detected: '{phrase}'",
                        suggestion="Verify facts and use definitive language when certain"
                    ))
        
        return issues
    
    def _calculate_quality_score(self, issues: List[CritiqueIssue]) -> float:
        """Calculate overall quality score from issues."""
        if not issues:
            return 1.0
        
        # Weight by severity
        weights = {
            IssueSeverity.CRITICAL: 0.5,
            IssueSeverity.MAJOR: 0.2,
            IssueSeverity.MINOR: 0.05,
            IssueSeverity.INFO: 0.0
        }
        
        total_penalty = sum(weights.get(i.severity, 0.05) for i in issues)
        score = max(0.0, 1.0 - total_penalty)
        
        return round(score, 2)
    
    def _generate_recommendations(self, issues: List[CritiqueIssue]) -> List[str]:
        """Generate recommendations based on issues."""
        recommendations = []
        
        # Group by category
        by_category = {}
        for issue in issues:
            if issue.category not in by_category:
                by_category[issue.category] = []
            by_category[issue.category].append(issue)
        
        # Generate recommendations
        if "logical_error" in by_category:
            recommendations.append("Review output for logical consistency")
        
        if "potential_hallucination" in by_category:
            recommendations.append("Add source citations for factual claims")
        
        if "incomplete_task" in by_category:
            recommendations.append("Complete all requirements before finalizing")
        
        if "code_quality" in by_category:
            recommendations.append("Run code quality checks and address issues")
        
        if not recommendations and issues:
            recommendations.append("Review flagged issues and address as needed")
        
        return recommendations
