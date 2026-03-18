"""
Fallback model routing for retries.
"""

from typing import Dict, List, Optional


class FallbackRouter:
    """
    Routes failed tasks to fallback models.
    """
    
    # Default fallback chains
    DEFAULT_CHAINS = {
        "coding": ["kimi-k2.5", "deepseek-coder", "gpt-4o-mini"],
        "research": ["deepseek-chat", "mixtral", "llama3"],
        "triage": ["gpt-4o-mini", "gpt-5-nano"],
        "orchestrator": ["deepseek-chat", "gpt-4o"],
        "planner": ["deepseek-reasoner", "claude-3.5-sonnet"],
        "automation": ["gpt-4o-mini", "gpt-4o"],
        "critique": ["gpt-4o-mini", "deepseek-chat"],
        "reviewer": ["gpt-5.1-codex", "claude-3.5-sonnet"]
    }
    
    def __init__(self, custom_chains: Optional[Dict[str, List[str]]] = None):
        self.chains = custom_chains or self.DEFAULT_CHAINS
    
    def get_fallback(self, agent_type: str, current_model: str) -> Optional[str]:
        """
        Get the next fallback model for an agent type.
        
        Args:
            agent_type: Type of agent (coding, research, etc.)
            current_model: Currently used model
            
        Returns:
            Fallback model name or None if no fallback available
        """
        chain = self.chains.get(agent_type, [])
        
        if not chain:
            return None
        
        try:
            current_index = chain.index(current_model)
            if current_index + 1 < len(chain):
                return chain[current_index + 1]
        except ValueError:
            # Current model not in chain, return first fallback
            if chain:
                return chain[0]
        
        return None
    
    def get_fallback_chain(self, agent_type: str, current_model: str) -> List[str]:
        """
        Get the full fallback chain starting from current model.
        
        Args:
            agent_type: Type of agent
            current_model: Currently used model
            
        Returns:
            List of fallback models in order
        """
        chain = self.chains.get(agent_type, [])
        
        try:
            current_index = chain.index(current_model)
            return chain[current_index + 1:]
        except ValueError:
            # Current model not in chain, return full chain
            return chain
    
    def get_primary_model(self, agent_type: str) -> Optional[str]:
        """
        Get the primary (first) model for an agent type.
        
        Args:
            agent_type: Type of agent
            
        Returns:
            Primary model name or None
        """
        chain = self.chains.get(agent_type, [])
        return chain[0] if chain else None
    
    def add_chain(self, agent_type: str, models: List[str]) -> None:
        """
        Add or update a fallback chain for an agent type.
        
        Args:
            agent_type: Type of agent
            models: Ordered list of models (primary first)
        """
        self.chains[agent_type] = models
    
    def get_all_chains(self) -> Dict[str, List[str]]:
        """Get all fallback chains."""
        return self.chains.copy()
    
    def estimate_cost_difference(self, agent_type: str, from_model: str, 
                                  to_model: str, token_count: int = 1000) -> Dict:
        """
        Estimate cost difference between models.
        
        Args:
            agent_type: Type of agent
            from_model: Original model
            to_model: Fallback model
            token_count: Estimated token count
            
        Returns:
            Cost comparison dict
        """
        # Simplified cost model (actual costs would come from config)
        cost_per_1k = {
            "kimi-k2.5": 0.006,
            "deepseek-coder": 0.002,
            "gpt-4o-mini": 0.0006,
            "deepseek-chat": 0.002,
            "mixtral": 0.0015,
            "llama3": 0.0009,
            "gpt-4o": 0.015,
            "deepseek-reasoner": 0.004,
            "claude-3.5-sonnet": 0.015,
            "gpt-5.1-codex": 0.03,
            "gpt-5-nano": 0.0004
        }
        
        from_cost = cost_per_1k.get(from_model, 0.01) * (token_count / 1000)
        to_cost = cost_per_1k.get(to_model, 0.01) * (token_count / 1000)
        
        return {
            "from_model": from_model,
            "to_model": to_model,
            "from_cost": from_cost,
            "to_cost": to_cost,
            "difference": to_cost - from_cost,
            "percent_change": ((to_cost - from_cost) / from_cost * 100) if from_cost > 0 else 0
        }
