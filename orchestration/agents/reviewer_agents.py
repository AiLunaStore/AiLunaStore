"""
Critique and reviewer agents.
"""

import time
from typing import Any, Dict, Optional
from .base_agent import BaseAgent, AgentResponse


class CritiqueAgent(BaseAgent):
    """
    Self-critique agent for quality control.
    Model: GPT-4o-mini or DeepSeek Chat
    """
    
    def __init__(self, config: Optional[Dict] = None):
        default_config = {
            "model": "gpt-4o-mini",
            "fallback_model": "deepseek-chat",
            "timeout_seconds": 15,
            "max_tokens": 2000,
            "temperature": 0.2
        }
        if config:
            default_config.update(config)
        super().__init__("critique", default_config)
    
    def get_system_prompt(self) -> str:
        return """You are a Critique Agent. Your job is to review outputs for quality issues.

Check for:
1. Logical errors
2. Hallucinated information
3. Incomplete tasks
4. Inconsistencies
5. Code quality issues (if applicable)
6. Factual accuracy (if applicable)

Be thorough but constructive. Provide specific feedback."""
    
    async def execute(self, request: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Execute critique on the provided output.
        
        Args:
            request: The output to critique (as string or JSON)
            context: Additional context including task_type
            
        Returns:
            AgentResponse with critique results
        """
        start_time = time.time()
        
        # In real implementation, this would call the LLM
        # For now, we return a template critique
        task_type = context.get("task_type", "general") if context else "general"
        
        critique_result = {
            "quality_score": 0.85,
            "overall_assessment": "acceptable",
            "issues_found": 2,
            "critical_issues": 0,
            "major_issues": 1,
            "minor_issues": 1,
            "issues": [
                {
                    "severity": "major",
                    "category": "completeness",
                    "description": "Some edge cases not addressed",
                    "suggestion": "Add error handling for edge cases"
                },
                {
                    "severity": "minor",
                    "category": "documentation",
                    "description": "Could use more inline comments",
                    "suggestion": "Add comments for complex logic"
                }
            ],
            "recommendations": [
                "Review flagged issues",
                "Add more comprehensive error handling"
            ]
        }
        
        latency = int((time.time() - start_time) * 1000)
        
        return AgentResponse(
            success=True,
            output=critique_result,
            latency_ms=latency,
            tokens_in=len(str(request).split()),
            tokens_out=400,
            model_used=self.model
        )


class ReviewerAgent(BaseAgent):
    """
    Final reviewer agent for high-risk outputs.
    Model: GPT-5.1 Codex
    """
    
    def __init__(self, config: Optional[Dict] = None):
        default_config = {
            "model": "gpt-5.1-codex",
            "fallback_model": "claude-3.5-sonnet",
            "timeout_seconds": 30,
            "max_tokens": 4000,
            "temperature": 0.1
        }
        if config:
            default_config.update(config)
        super().__init__("reviewer", default_config)
    
    def get_system_prompt(self) -> str:
        return """You are a Final Reviewer Agent. Your job is to verify high-risk outputs.

Verify:
1. Correctness - Is the output accurate?
2. Reasoning validity - Is the logic sound?
3. Code quality - Is the code well-written? (if applicable)
4. Task completeness - Are all requirements met?

Provide final approval or request changes with specific feedback."""
    
    async def execute(self, request: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Execute final review.
        
        Args:
            request: The output to review
            context: Additional context including critique results
            
        Returns:
            AgentResponse with review results
        """
        start_time = time.time()
        
        # In real implementation, this would call the LLM
        # For now, we return a template review
        review_result = {
            "verified": True,
            "approval": "approved",
            "findings": {
                "correctness": "verified",
                "reasoning": "sound",
                "quality": "acceptable",
                "completeness": "all_requirements_met"
            },
            "suggestions": [
                "Consider adding more test cases",
                "Documentation could be expanded"
            ],
            "confidence": 0.92
        }
        
        latency = int((time.time() - start_time) * 1000)
        
        return AgentResponse(
            success=True,
            output=review_result,
            latency_ms=latency,
            tokens_in=len(str(request).split()),
            tokens_out=600,
            model_used=self.model
        )
