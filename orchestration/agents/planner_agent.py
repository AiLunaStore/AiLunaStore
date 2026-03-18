"""
Planner agent for generating structured task plans.
Model: DeepSeek Reasoner
"""

import time
import json
from typing import Any, Dict, List, Optional
from .base_agent import BaseAgent, AgentResponse


class PlannerAgent(BaseAgent):
    """
    Planner agent that generates structured task plans with parallel execution paths.
    """
    
    def __init__(self, config: Optional[Dict] = None):
        default_config = {
            "model": "deepseek-reasoner",
            "fallback_model": "claude-3.5-sonnet",
            "timeout_seconds": 20,
            "max_tokens": 4000,
            "temperature": 0.3
        }
        if config:
            default_config.update(config)
        super().__init__("planner", default_config)
    
    def get_system_prompt(self) -> str:
        return """You are a Planner Agent. Your job is to break down complex requests into structured task plans.

Create a task graph that identifies:
1. Individual tasks needed
2. Which tasks can run in parallel
3. Dependencies between tasks
4. Estimated token usage for each task

Output format (JSON):
{
    "plan_id": "PLN-YYYYMMDD-###",
    "goal": "clear description of the goal",
    "tasks": [
        {
            "id": "task_id",
            "agent": "research|coding|automation",
            "type": "task_type",
            "description": "what to do",
            "parallel": true|false,
            "depends_on": ["task_id1", "task_id2"],
            "estimated_tokens": 1000
        }
    ],
    "parallel_groups": [
        ["task_id1", "task_id2"],
        ["task_id3"]
    ]
}

Rules:
- Tasks with no dependencies should be marked parallel=true
- Group parallel tasks together in parallel_groups
- Be specific about what each task should accomplish
- Estimate tokens based on task complexity"""
    
    async def execute(self, request: str, context: Optional[Dict] = None) -> AgentResponse:
        """
        Generate a task plan for the request.
        
        Args:
            request: The user request
            context: Additional context including triage results
            
        Returns:
            AgentResponse with task plan
        """
        start_time = time.time()
        
        # In real implementation, this would call the LLM
        # For now, we generate a template plan
        plan = self._generate_plan(request, context)
        
        latency = int((time.time() - start_time) * 1000)
        
        return AgentResponse(
            success=True,
            output=plan,
            latency_ms=latency,
            tokens_in=len(request.split()),
            tokens_out=500,
            model_used=self.model
        )
    
    def _generate_plan(self, request: str, context: Optional[Dict] = None) -> Dict:
        """
        Generate a task plan.
        In production, this would use an LLM.
        """
        request_lower = request.lower()
        
        # Determine task structure based on request type
        if "code" in request_lower or "script" in request_lower:
            return self._generate_coding_plan(request, context)
        elif "research" in request_lower or "search" in request_lower:
            return self._generate_research_plan(request, context)
        elif "organize" in request_lower or "automate" in request_lower:
            return self._generate_automation_plan(request, context)
        else:
            return self._generate_generic_plan(request, context)
    
    def _generate_coding_plan(self, request: str, context: Optional[Dict] = None) -> Dict:
        """Generate a plan for coding tasks."""
        return {
            "plan_id": self._generate_plan_id(),
            "goal": f"Implement solution for: {request[:100]}",
            "tasks": [
                {
                    "id": "research",
                    "agent": "research",
                    "type": "research",
                    "description": "Research best practices and approaches",
                    "parallel": True,
                    "depends_on": [],
                    "estimated_tokens": 1500
                },
                {
                    "id": "design",
                    "agent": "coding",
                    "type": "design",
                    "description": "Design the code structure and interfaces",
                    "parallel": True,
                    "depends_on": [],
                    "estimated_tokens": 2000
                },
                {
                    "id": "implement",
                    "agent": "coding",
                    "type": "implementation",
                    "description": "Write the actual code",
                    "parallel": False,
                    "depends_on": ["research", "design"],
                    "estimated_tokens": 4000
                },
                {
                    "id": "test",
                    "agent": "coding",
                    "type": "testing",
                    "description": "Create tests and verify functionality",
                    "parallel": False,
                    "depends_on": ["implement"],
                    "estimated_tokens": 2000
                }
            ],
            "parallel_groups": [
                ["research", "design"],
                ["implement"],
                ["test"]
            ]
        }
    
    def _generate_research_plan(self, request: str, context: Optional[Dict] = None) -> Dict:
        """Generate a plan for research tasks."""
        return {
            "plan_id": self._generate_plan_id(),
            "goal": f"Research and analyze: {request[:100]}",
            "tasks": [
                {
                    "id": "search",
                    "agent": "research",
                    "type": "search",
                    "description": "Search for relevant information",
                    "parallel": True,
                    "depends_on": [],
                    "estimated_tokens": 2000
                },
                {
                    "id": "gather",
                    "agent": "research",
                    "type": "data_collection",
                    "description": "Collect data from multiple sources",
                    "parallel": True,
                    "depends_on": [],
                    "estimated_tokens": 2000
                },
                {
                    "id": "analyze",
                    "agent": "research",
                    "type": "analysis",
                    "description": "Analyze and synthesize findings",
                    "parallel": False,
                    "depends_on": ["search", "gather"],
                    "estimated_tokens": 3000
                },
                {
                    "id": "summarize",
                    "agent": "research",
                    "type": "summarization",
                    "description": "Create final summary",
                    "parallel": False,
                    "depends_on": ["analyze"],
                    "estimated_tokens": 1500
                }
            ],
            "parallel_groups": [
                ["search", "gather"],
                ["analyze"],
                ["summarize"]
            ]
        }
    
    def _generate_automation_plan(self, request: str, context: Optional[Dict] = None) -> Dict:
        """Generate a plan for automation tasks."""
        return {
            "plan_id": self._generate_plan_id(),
            "goal": f"Automate task: {request[:100]}",
            "tasks": [
                {
                    "id": "assess",
                    "agent": "automation",
                    "type": "assessment",
                    "description": "Assess current state and requirements",
                    "parallel": True,
                    "depends_on": [],
                    "estimated_tokens": 1000
                },
                {
                    "id": "script",
                    "agent": "automation",
                    "type": "scripting",
                    "description": "Create automation script",
                    "parallel": False,
                    "depends_on": ["assess"],
                    "estimated_tokens": 2000
                },
                {
                    "id": "test",
                    "agent": "automation",
                    "type": "testing",
                    "description": "Test automation in safe environment",
                    "parallel": False,
                    "depends_on": ["script"],
                    "estimated_tokens": 1000
                },
                {
                    "id": "deploy",
                    "agent": "automation",
                    "type": "deployment",
                    "description": "Deploy automation",
                    "parallel": False,
                    "depends_on": ["test"],
                    "estimated_tokens": 500
                }
            ],
            "parallel_groups": [
                ["assess"],
                ["script"],
                ["test"],
                ["deploy"]
            ]
        }
    
    def _generate_generic_plan(self, request: str, context: Optional[Dict] = None) -> Dict:
        """Generate a generic plan for unknown task types."""
        return {
            "plan_id": self._generate_plan_id(),
            "goal": f"Process request: {request[:100]}",
            "tasks": [
                {
                    "id": "analyze",
                    "agent": "research",
                    "type": "analysis",
                    "description": "Analyze the request",
                    "parallel": True,
                    "depends_on": [],
                    "estimated_tokens": 1500
                },
                {
                    "id": "execute",
                    "agent": "coding",
                    "type": "execution",
                    "description": "Execute the task",
                    "parallel": False,
                    "depends_on": ["analyze"],
                    "estimated_tokens": 3000
                }
            ],
            "parallel_groups": [
                ["analyze"],
                ["execute"]
            ]
        }
    
    def _generate_plan_id(self) -> str:
        """Generate a unique plan ID."""
        from datetime import datetime
        date_str = datetime.utcnow().strftime("%Y%m%d")
        import random
        seq = random.randint(1, 999)
        return f"PLN-{date_str}-{seq:03d}"
