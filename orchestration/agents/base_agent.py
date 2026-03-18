"""
Base agent class for all orchestration agents.
"""

from abc import ABC, abstractmethod
from typing import Any, Dict, Optional
from dataclasses import dataclass


@dataclass
class AgentResponse:
    """Standard response format for all agents."""
    success: bool
    output: Any
    latency_ms: int
    tokens_in: int
    tokens_out: int
    model_used: str
    error: Optional[str] = None


class BaseAgent(ABC):
    """
    Base class for all agents in the orchestration system.
    """
    
    def __init__(self, agent_type: str, config: Optional[Dict] = None):
        self.agent_type = agent_type
        self.config = config or {}
        self.model = self.config.get("model", "gpt-4o-mini")
        self.fallback_model = self.config.get("fallback_model")
        self.timeout_seconds = self.config.get("timeout_seconds", 30)
        self.max_tokens = self.config.get("max_tokens", 2000)
        self.temperature = self.config.get("temperature", 0.2)
    
    @abstractmethod
    async def execute(self, request: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Execute the agent's primary function.
        
        Args:
            request: The request to process
            context: Additional context
            
        Returns:
            AgentResponse with results
        """
        pass
    
    def get_system_prompt(self) -> str:
        """
        Get the system prompt for this agent.
        Override in subclasses.
        """
        return f"You are a {self.agent_type} agent. Process the request carefully."
    
    def format_request(self, request: str, context: Optional[Dict] = None) -> str:
        """
        Format the request for the model.
        Override in subclasses for custom formatting.
        """
        formatted = request
        
        if context:
            formatted += f"\n\nContext: {context}"
        
        return formatted
    
    def parse_response(self, response: str) -> Any:
        """
        Parse the model response.
        Override in subclasses for custom parsing.
        """
        return response
    
    def get_capabilities(self) -> list:
        """
        Get the capabilities of this agent.
        Override in subclasses.
        """
        return []
