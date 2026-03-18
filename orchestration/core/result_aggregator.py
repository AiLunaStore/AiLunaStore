"""
Result aggregation logic for combining outputs from multiple agents.
"""

from typing import Any, Dict, List, Optional
from dataclasses import dataclass
import json


@dataclass
class AgentOutput:
    """Output from a single agent."""
    agent: str
    task_id: str
    output: Any
    confidence: float = 1.0


class ResultAggregator:
    """
    Aggregates results from multiple agents into a coherent output.
    """
    
    def __init__(self):
        self.outputs: List[AgentOutput] = []
    
    def add_output(self, output: AgentOutput) -> None:
        """Add an agent output to the aggregation."""
        self.outputs.append(output)
    
    def aggregate(self, strategy: str = "concatenate") -> Any:
        """
        Aggregate all outputs using the specified strategy.
        
        Strategies:
        - concatenate: Join all outputs
        - merge: Merge dictionaries
        - prioritize: Use highest confidence output
        - synthesize: Create synthesized summary
        """
        if strategy == "concatenate":
            return self._concatenate()
        elif strategy == "merge":
            return self._merge()
        elif strategy == "prioritize":
            return self._prioritize()
        elif strategy == "synthesize":
            return self._synthesize()
        else:
            return self._concatenate()
    
    def _concatenate(self) -> Dict:
        """Concatenate all outputs into a structured format."""
        return {
            "aggregated": True,
            "strategy": "concatenate",
            "agent_count": len(self.outputs),
            "agents_used": list(set(o.agent for o in self.outputs)),
            "results": [
                {
                    "agent": o.agent,
                    "task_id": o.task_id,
                    "output": o.output,
                    "confidence": o.confidence
                }
                for o in self.outputs
            ]
        }
    
    def _merge(self) -> Dict:
        """Merge dictionary outputs."""
        merged = {
            "aggregated": True,
            "strategy": "merge",
            "agent_count": len(self.outputs),
            "agents_used": list(set(o.agent for o in self.outputs))
        }
        
        for output in self.outputs:
            if isinstance(output.output, dict):
                # Prefix keys with agent name to avoid collisions
                for key, value in output.output.items():
                    merged[f"{output.agent}_{key}"] = value
            else:
                merged[f"{output.agent}_output"] = output.output
        
        return merged
    
    def _prioritize(self) -> Any:
        """Use the output with highest confidence."""
        if not self.outputs:
            return None
        
        best = max(self.outputs, key=lambda o: o.confidence)
        return {
            "aggregated": True,
            "strategy": "prioritize",
            "selected_agent": best.agent,
            "confidence": best.confidence,
            "output": best.output,
            "all_agents": [
                {"agent": o.agent, "confidence": o.confidence}
                for o in self.outputs
            ]
        }
    
    def _synthesize(self) -> Dict:
        """
        Create a synthesized summary of all outputs.
        This would typically involve an LLM call in production.
        """
        # Group outputs by agent type
        by_agent = {}
        for output in self.outputs:
            if output.agent not in by_agent:
                by_agent[output.agent] = []
            by_agent[output.agent].append(output)
        
        synthesis = {
            "aggregated": True,
            "strategy": "synthesize",
            "agent_count": len(self.outputs),
            "agents_used": list(by_agent.keys()),
            "summary": self._generate_summary(by_agent),
            "details": {
                agent: [o.output for o in outputs]
                for agent, outputs in by_agent.items()
            }
        }
        
        return synthesis
    
    def _generate_summary(self, by_agent: Dict) -> str:
        """Generate a simple summary of agent outputs."""
        summaries = []
        
        for agent, outputs in by_agent.items():
            count = len(outputs)
            summaries.append(f"{agent}: {count} task(s) completed")
        
        return "; ".join(summaries)
    
    def get_agent_outputs(self, agent: str) -> List[AgentOutput]:
        """Get all outputs from a specific agent."""
        return [o for o in self.outputs if o.agent == agent]
    
    def get_confidence_score(self) -> float:
        """Calculate overall confidence score."""
        if not self.outputs:
            return 0.0
        
        return sum(o.confidence for o in self.outputs) / len(self.outputs)
    
    def has_conflicts(self) -> bool:
        """
        Check if there are conflicting outputs between agents.
        This is a simplified check - in production, use semantic comparison.
        """
        if len(self.outputs) < 2:
            return False
        
        # Check for direct contradictions in boolean outputs
        boolean_outputs = [
            o for o in self.outputs
            if isinstance(o.output, bool) or 
            (isinstance(o.output, dict) and "result" in o.output and isinstance(o.output["result"], bool))
        ]
        
        if len(boolean_outputs) >= 2:
            values = []
            for o in boolean_outputs:
                if isinstance(o.output, bool):
                    values.append(o.output)
                else:
                    values.append(o.output["result"])
            
            # If we have both True and False, there's a conflict
            if True in values and False in values:
                return True
        
        return False
    
    def resolve_conflicts(self) -> Dict:
        """
        Attempt to resolve conflicts between agent outputs.
        Returns resolution strategy and result.
        """
        if not self.has_conflicts():
            return {"resolved": True, "strategy": "no_conflict", "output": self.aggregate()}
        
        # Simple resolution: prioritize by confidence
        best = max(self.outputs, key=lambda o: o.confidence)
        
        return {
            "resolved": True,
            "strategy": "confidence_priority",
            "selected_agent": best.agent,
            "confidence": best.confidence,
            "conflicting_agents": [
                o.agent for o in self.outputs
                if o.agent != best.agent
            ],
            "output": best.output
        }
