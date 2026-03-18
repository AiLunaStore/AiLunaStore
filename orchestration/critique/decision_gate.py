"""
Review decision gate - determines if high-level verification is needed.
"""

from typing import Any, Dict
from enum import Enum


class RiskLevel(Enum):
    LOW = "low_risk"
    HIGH = "high_risk"


class ReviewDecisionGate:
    """
    Decision gate that determines if output requires high-level verification.
    
    Output format:
        REVIEW_DECISION: low_risk | high_risk
        REASON: short explanation
    """
    
    # High risk criteria
    HIGH_RISK_INDICATORS = {
        "generated_code": [
            "def ",
            "class ",
            "function",
            "import ",
            "code",
            "script",
            "implementation"
        ],
        "complex_reasoning": [
            "therefore",
            "consequently",
            "implies",
            "logical conclusion",
            "deduction"
        ],
        "financial_calculations": [
            "$",
            "USD",
            "cost",
            "budget",
            "revenue",
            "profit",
            "financial"
        ],
        "technical_calculations": [
            "calculate",
            "compute",
            "algorithm",
            "formula",
            "equation"
        ],
        "factual_research": [
            "according to",
            "research shows",
            "studies indicate",
            "data suggests"
        ]
    }
    
    # Low risk criteria (all must be true for low risk)
    LOW_RISK_INDICATORS = {
        "summarization": [
            "summary",
            "overview",
            "in summary",
            "to summarize"
        ],
        "formatting": [
            "format",
            "structure",
            "organize",
            "arrange"
        ],
        "simple_explanation": [
            "explain",
            "description",
            "overview",
            "introduction"
        ]
    }
    
    def __init__(self, config: Dict = None):
        self.config = config or {}
        self.critique_threshold = self.config.get("critique_threshold", 0.7)
    
    def decide(self, output: Any, critique_result: Dict, 
               task_type: str = "general") -> Dict:
        """
        Make a review decision based on output and critique.
        
        Args:
            output: The output to evaluate
            critique_result: Result from self-critique
            task_type: Type of task
            
        Returns:
            Decision result with REVIEW_DECISION and REASON
        """
        reasons = []
        
        # Check critique quality score
        quality_score = critique_result.get("quality_score", 1.0)
        if quality_score < self.critique_threshold:
            reasons.append(f"Quality score ({quality_score}) below threshold")
        
        # Check for critical issues in critique
        critical_issues = critique_result.get("critical_issues", 0)
        if critical_issues > 0:
            reasons.append(f"{critical_issues} critical issues found")
        
        # Check high risk indicators
        high_risk_matches = self._check_high_risk_indicators(output, task_type)
        if high_risk_matches:
            reasons.extend([f"High risk: {m}" for m in high_risk_matches[:2]])
        
        # Check if generated code
        if self._is_generated_code(output):
            reasons.append("Generated code requires verification")
        
        # Check if complex reasoning
        if self._is_complex_reasoning(output):
            reasons.append("Complex reasoning requires verification")
        
        # Check if financial/technical calculations
        if self._is_calculation(output):
            reasons.append("Calculations require verification")
        
        # Make decision
        if reasons:
            risk_level = RiskLevel.HIGH
            reason = "; ".join(reasons[:3])  # Top 3 reasons
        else:
            risk_level = RiskLevel.LOW
            reason = "No high-risk indicators detected"
        
        return {
            "REVIEW_DECISION": risk_level.value,
            "REASON": reason,
            "quality_score": quality_score,
            "critical_issues": critical_issues,
            "high_risk_indicators": len(high_risk_matches),
            "task_type": task_type
        }
    
    def _check_high_risk_indicators(self, output: Any, task_type: str) -> list:
        """Check for high risk indicators in output."""
        matches = []
        output_str = str(output).lower()
        
        for category, indicators in self.HIGH_RISK_INDICATORS.items():
            for indicator in indicators:
                if indicator.lower() in output_str:
                    matches.append(category)
                    break  # Only count each category once
        
        return matches
    
    def _is_generated_code(self, output: Any) -> bool:
        """Check if output contains generated code."""
        if not isinstance(output, str):
            if isinstance(output, dict):
                output = str(output.get("code", output.get("output", "")))
            else:
                output = str(output)
        
        output_lower = output.lower()
        
        # Check for code patterns
        code_patterns = [
            "def ",
            "class ",
            "import ",
            "return ",
            "if __name__",
            "const ",
            "function",
            "=>",
            "{}",
            ";"
        ]
        
        code_indicators = sum(1 for p in code_patterns if p in output)
        return code_indicators >= 3
    
    def _is_complex_reasoning(self, output: Any) -> bool:
        """Check if output contains complex reasoning."""
        output_str = str(output).lower()
        
        # Check for reasoning indicators
        reasoning_patterns = [
            "therefore",
            "because",
            "consequently",
            "as a result",
            "this implies",
            "logical conclusion",
            "reasoning",
            "analysis shows"
        ]
        
        reasoning_count = sum(1 for p in reasoning_patterns if p in output_str)
        return reasoning_count >= 2
    
    def _is_calculation(self, output: Any) -> bool:
        """Check if output contains calculations."""
        output_str = str(output).lower()
        
        # Check for calculation indicators
        calc_patterns = [
            "calculate",
            "computation",
            "formula",
            "equation",
            "=",
            "+",
            "*",
            "/",
            "sum",
            "total",
            "average"
        ]
        
        calc_count = sum(1 for p in calc_patterns if p in output_str)
        return calc_count >= 3
    
    def _is_low_risk(self, output: Any) -> bool:
        """Check if output is clearly low risk."""
        output_str = str(output).lower()
        
        # Check for low risk indicators
        low_risk_count = 0
        for category, indicators in self.LOW_RISK_INDICATORS.items():
            for indicator in indicators:
                if indicator in output_str:
                    low_risk_count += 1
                    break
        
        # Must have at least 2 low risk indicators
        return low_risk_count >= 2
    
    def format_decision(self, decision: Dict) -> str:
        """
        Format decision in standard output format.
        
        Returns:
            Formatted string with REVIEW_DECISION and REASON
        """
        return f"""REVIEW_DECISION: {decision['REVIEW_DECISION']}
REASON: {decision['REASON']}"""
    
    def should_review(self, decision: Dict) -> bool:
        """
        Quick check if review is needed.
        
        Returns:
            True if high risk (needs review), False otherwise
        """
        return decision.get("REVIEW_DECISION") == RiskLevel.HIGH.value
