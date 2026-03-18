#!/usr/bin/env python3
"""
Cost Optimizer for Hired AI System - Phase 4
Intelligent model selection and cost optimization.
"""

from typing import Dict, List, Optional, Any
from dataclasses import dataclass
from datetime import datetime
import json
import os

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

@dataclass
class ModelInfo:
    name: str
    provider: str
    input_cost_per_1m: float
    output_cost_per_1m: float
    best_for: List[str]
    latency_profile: str
    quality_tier: str

class CostOptimizer:
    """Intelligent model selection for cost optimization."""
    
    MODEL_DATABASE = {
        "gpt-4o-mini": ModelInfo(
            name="GPT-4o-mini",
            provider="OpenAI",
            input_cost_per_1m=0.15,
            output_cost_per_1m=0.60,
            best_for=["triage", "simple", "format", "classify"],
            latency_profile="fast",
            quality_tier="basic"
        ),
        "deepseek-chat": ModelInfo(
            name="DeepSeek Chat",
            provider="DeepSeek",
            input_cost_per_1m=0.27,
            output_cost_per_1m=1.10,
            best_for=["implement", "analyze", "general", "code"],
            latency_profile="standard",
            quality_tier="standard"
        ),
        "claude-3.5-haiku": ModelInfo(
            name="Claude 3.5 Haiku",
            provider="Anthropic",
            input_cost_per_1m=0.25,
            output_cost_per_1m=1.25,
            best_for=["quick", "simple", "summarize"],
            latency_profile="fast",
            quality_tier="basic"
        ),
        "claude-3.5-sonnet": ModelInfo(
            name="Claude 3.5 Sonnet",
            provider="Anthropic",
            input_cost_per_1m=3.00,
            output_cost_per_1m=15.00,
            best_for=["plan", "review", "complex", "design"],
            latency_profile="standard",
            quality_tier="high"
        ),
        "gpt-5.1-codex": ModelInfo(
            name="GPT-5.1 Codex",
            provider="OpenAI",
            input_cost_per_1m=3.00,
            output_cost_per_1m=12.00,
            best_for=["code", "implement", "review", "debug"],
            latency_profile="standard",
            quality_tier="high"
        ),
        "gpt-5.4": ModelInfo(
            name="GPT-5.4",
            provider="OpenAI",
            input_cost_per_1m=5.00,
            output_cost_per_1m=15.00,
            best_for=["complex", "plan", "architect", "strategic"],
            latency_profile="slow",
            quality_tier="premium"
        ),
    }
    
    def __init__(self):
        self.selection_history = []
        self.usage_stats = self._load_usage_stats()
    
    def _load_usage_stats(self) -> Dict[str, Any]:
        """Load usage statistics from file."""
        stats_file = f"{WORKSPACE}/system/performance/usage/optimizer-stats.json"
        if os.path.exists(stats_file):
            try:
                with open(stats_file, 'r') as f:
                    return json.load(f)
            except:
                pass
        return {"selections": [], "total_cost": 0.0}
    
    def _save_usage_stats(self):
        """Save usage statistics to file."""
        stats_file = f"{WORKSPACE}/system/performance/usage/optimizer-stats.json"
        os.makedirs(os.path.dirname(stats_file), exist_ok=True)
        with open(stats_file, 'w') as f:
            json.dump(self.usage_stats, f, indent=2)
    
    def select_model(
        self,
        task_description: str,
        complexity: str = "moderate",
        quality_required: str = "standard",
        budget_constraint: str = "balanced",
        estimated_input_tokens: int = 1000,
        estimated_output_tokens: int = 500
    ) -> Dict[str, Any]:
        """Select the most cost-effective model for a task."""
        
        # Score each model
        candidates = []
        for model_id, model in self.MODEL_DATABASE.items():
            score = self._score_model(
                model, task_description, complexity, 
                quality_required, budget_constraint
            )
            estimated_cost = self._estimate_cost(
                model, estimated_input_tokens, estimated_output_tokens
            )
            candidates.append({
                "model_id": model_id,
                "model": model,
                "score": score,
                "estimated_cost": estimated_cost
            })
        
        # Sort by score (higher is better)
        candidates.sort(key=lambda x: x["score"], reverse=True)
        
        # Select best candidate
        best = candidates[0]
        
        # Record selection
        selection = {
            "timestamp": datetime.now().isoformat(),
            "task": task_description[:100],
            "complexity": complexity,
            "quality_required": quality_required,
            "selected_model": best["model_id"],
            "estimated_cost": best["estimated_cost"],
            "candidates_considered": len(candidates)
        }
        self.selection_history.append(selection)
        self.usage_stats["selections"].append(selection)
        self.usage_stats["total_cost"] += best["estimated_cost"]
        self._save_usage_stats()
        
        return {
            "model_id": best["model_id"],
            "model_name": best["model"].name,
            "provider": best["model"].provider,
            "estimated_cost": best["estimated_cost"],
            "confidence": best["score"] / 100,
            "alternatives": [
                {"model_id": c["model_id"], "cost": c["estimated_cost"]}
                for c in candidates[1:3]
            ]
        }
    
    def _score_model(
        self,
        model: ModelInfo,
        task_description: str,
        complexity: str,
        quality_required: str,
        budget_constraint: str
    ) -> float:
        """Score a model for a given task."""
        score = 50.0  # Base score
        
        # Complexity matching
        complexity_scores = {
            "simple": {"gpt-4o-mini": 20, "deepseek-chat": 10, "claude-3.5-haiku": 15},
            "moderate": {"deepseek-chat": 20, "gpt-5.1-codex": 10, "claude-3.5-sonnet": 5},
            "complex": {"gpt-5.4": 25, "claude-3.5-sonnet": 20, "gpt-5.1-codex": 15}
        }
        
        for model_id, bonus in complexity_scores.get(complexity, {}).items():
            if model_id in model.name.lower().replace(" ", "-") or model_id in model.name.lower().replace(" ", ""):
                score += bonus
        
        # Quality requirement matching
        quality_scores = {
            "basic": {"gpt-4o-mini": 15, "claude-3.5-haiku": 10},
            "standard": {"deepseek-chat": 15, "gpt-5.1-codex": 10},
            "high": {"claude-3.5-sonnet": 20, "gpt-5.1-codex": 15},
            "premium": {"gpt-5.4": 25, "claude-3.5-sonnet": 20}
        }
        
        for model_id, bonus in quality_scores.get(quality_required, {}).items():
            if model_id in model.name.lower().replace(" ", "-") or model_id in model.name.lower().replace(" ", ""):
                score += bonus
        
        # Budget constraint
        if budget_constraint == "strict":
            # Prefer cheaper models
            if model.input_cost_per_1m < 1.0:
                score += 15
            elif model.input_cost_per_1m > 3.0:
                score -= 20
        elif budget_constraint == "performance":
            # Prefer higher quality regardless of cost
            if model.quality_tier in ["high", "premium"]:
                score += 15
        
        # Task keyword matching
        task_lower = task_description.lower()
        for use_case in model.best_for:
            if use_case in task_lower:
                score += 10
        
        return max(0, min(100, score))
    
    def _estimate_cost(
        self,
        model: ModelInfo,
        input_tokens: int,
        output_tokens: int
    ) -> float:
        """Estimate cost for a model usage."""
        input_cost = (input_tokens / 1_000_000) * model.input_cost_per_1m
        output_cost = (output_tokens / 1_000_000) * model.output_cost_per_1m
        return round(input_cost + output_cost, 4)
    
    def get_model_comparison(self) -> List[Dict[str, Any]]:
        """Get comparison of all models."""
        comparison = []
        for model_id, model in self.MODEL_DATABASE.items():
            comparison.append({
                "model_id": model_id,
                "name": model.name,
                "provider": model.provider,
                "input_cost_per_1m": model.input_cost_per_1m,
                "output_cost_per_1m": model.output_cost_per_1m,
                "best_for": model.best_for,
                "quality_tier": model.quality_tier,
                "latency_profile": model.latency_profile
            })
        return comparison
    
    def get_stats(self) -> Dict[str, Any]:
        """Get optimizer statistics."""
        return {
            "total_selections": len(self.usage_stats.get("selections", [])),
            "total_estimated_cost": self.usage_stats.get("total_cost", 0),
            "recent_selections": self.selection_history[-10:],
            "model_database_size": len(self.MODEL_DATABASE)
        }


if __name__ == '__main__':
    optimizer = CostOptimizer()
    
    print("=" * 60)
    print("Cost Optimizer - Model Selection Engine")
    print("=" * 60)
    
    # Test model selection
    test_tasks = [
        {
            "description": "Summarize this document",
            "complexity": "simple",
            "quality": "basic"
        },
        {
            "description": "Implement a new feature",
            "complexity": "moderate",
            "quality": "standard"
        },
        {
            "description": "Design system architecture",
            "complexity": "complex",
            "quality": "high"
        }
    ]
    
    print("\n🧪 Testing Model Selection:")
    for task in test_tasks:
        result = optimizer.select_model(
            task_description=task["description"],
            complexity=task["complexity"],
            quality_required=task["quality"]
        )
        print(f"\n  Task: {task['description']}")
        print(f"    Selected: {result['model_name']}")
        print(f"    Est. Cost: ${result['estimated_cost']:.4f}")
        print(f"    Confidence: {result['confidence']:.1%}")
    
    print("\n📊 Optimizer Stats:")
    stats = optimizer.get_stats()
    print(f"  Total Selections: {stats['total_selections']}")
    print(f"  Total Est. Cost: ${stats['total_estimated_cost']:.4f}")
    
    print("\n✅ Cost Optimizer Ready")
