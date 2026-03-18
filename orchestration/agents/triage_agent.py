"""
Triage agent for classifying and routing requests.
Model: GPT-4o-mini or GPT-5-nano
"""

import time
from typing import Any, Dict, Optional
from .base_agent import BaseAgent, AgentResponse


class TriageAgent(BaseAgent):
    """
    Triage agent that classifies incoming requests and routes them appropriately.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        default_config = {
            "model": "gpt-4o-mini",
            "fallback_model": "gpt-5-nano",
            "timeout_seconds": 10,
            "max_tokens": 1000,
            "temperature": 0.1
        }
        if config:
            default_config.update(config)
        super().__init__("triage", default_config)
    
    def get_system_prompt(self) -> str:
        return """You are a Triage Agent. Your job is to classify incoming requests and route them to the appropriate agent.

Analyze the request and provide a structured classification:

1. Request Type: coding | research | automation | analysis | other
2. Priority: critical | high | medium | low
3. Complexity: simple | complex
4. Urgency: immediate | today | this_week | eventually
5. Required Capabilities: list of required capabilities

Output format (JSON):
{
    "request_type": "type",
    "priority": "priority",
    "complexity": "simple|complex",
    "urgency": "urgency",
    "capabilities_required": ["cap1", "cap2"],
    "routed_to": "agent_type",
    "rationale": "brief explanation"
}"""
    
    async def execute(self, request: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Execute triage on the request.
        
        Args:
            request: The user request
            context: Additional context (user, channel, etc.)
            
        Returns:
            AgentResponse with classification
        """
        start_time = time.time()
        
        # In real implementation, this would call the LLM
        # For now, we use rule-based classification
        classification = self._classify_request(request, context)
        
        latency = int((time.time() - start_time) * 1000)
        
        return AgentResponse(
            success=True,
            output=classification,
            latency_ms=latency,
            tokens_in=len(request.split()),
            tokens_out=200,
            model_used=self.model
        )
    
    def _classify_request(self, request: str, context: Optional[Dict] = None) -> Dict:
        """
        Classify the request using rule-based heuristics.
        In production, this would use an LLM.
        """
        request_lower = request.lower()
        
        # Determine request type
        if any(word in request_lower for word in ["code", "script", "function", "debug", "implement", "write code"]):
            request_type = "coding"
            routed_to = "coding"
            capabilities = ["code_writing", "debugging"]
        elif any(word in request_lower for word in ["search", "find", "research", "analyze", "look up", "information"]):
            request_type = "research"
            routed_to = "research"
            capabilities = ["web_search", "analysis"]
        elif any(word in request_lower for word in ["automate", "organize", "schedule", "backup", "monitor"]):
            request_type = "automation"
            routed_to = "automation"
            capabilities = ["scripting", "system_operations"]
        elif any(word in request_lower for word in ["review", "check", "verify", "audit"]):
            request_type = "analysis"
            routed_to = "research"
            capabilities = ["analysis", "verification"]
        else:
            request_type = "other"
            routed_to = "orchestrator"
            capabilities = ["general"]
        
        # Determine complexity
        word_count = len(request.split())
        has_multiple_parts = any(word in request_lower for word in ["and then", "also", "additionally", "next"])
        complexity = "complex" if word_count > 50 or has_multiple_parts else "simple"
        
        # Determine priority
        if any(word in request_lower for word in ["urgent", "asap", "emergency", "critical", "broken"]):
            priority = "critical"
            urgency = "immediate"
        elif any(word in request_lower for word in ["important", "needed", "required"]):
            priority = "high"
            urgency = "today"
        elif any(word in request_lower for word in ["when you can", "sometime", "eventually"]):
            priority = "low"
            urgency = "eventually"
        else:
            priority = "medium"
            urgency = "this_week"
        
        return {
            "request_type": request_type,
            "priority": priority,
            "complexity": complexity,
            "urgency": urgency,
            "capabilities_required": capabilities,
            "routed_to": routed_to,
            "rationale": f"Classified as {request_type} based on keywords and length"
        }
