#!/usr/bin/env python3
"""
Budget Manager for Hired AI System - Phase 4
Tracks and controls API usage budgets.
"""

from typing import Dict, Any, List
from datetime import datetime, timedelta
import json
import os

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

class BudgetManager:
    """Manage and track API usage budgets."""
    
    def __init__(self, daily_budget: float = 10.0):
        self.daily_budget = daily_budget
        self.current_usage = 0.0
        self.usage_history = []
        self.alert_thresholds = [0.5, 0.8, 0.95, 1.0]
        self.alerts_triggered = set()
        self._load_today_usage()
    
    def _load_today_usage(self):
        """Load today's usage from file."""
        today = datetime.now().strftime('%Y-%m-%d')
        usage_file = f"{WORKSPACE}/system/performance/usage/{today}.json"
        
        if os.path.exists(usage_file):
            try:
                with open(usage_file, 'r') as f:
                    data = json.load(f)
                    self.current_usage = data.get('total_cost', 0.0)
                    self.usage_history = data.get('history', [])
            except:
                pass
    
    def _save_usage(self):
        """Save usage data to file."""
        today = datetime.now().strftime('%Y-%m-%d')
        usage_file = f"{WORKSPACE}/system/performance/usage/{today}.json"
        
        os.makedirs(os.path.dirname(usage_file), exist_ok=True)
        
        data = {
            'date': today,
            'total_cost': self.current_usage,
            'daily_budget': self.daily_budget,
            'history': self.usage_history[-100:]  # Keep last 100 entries
        }
        
        with open(usage_file, 'w') as f:
            json.dump(data, f, indent=2)
    
    def record_usage(self, model: str, input_tokens: int, output_tokens: int, 
                     cost: float, task_type: str):
        """Record API usage."""
        entry = {
            'timestamp': datetime.now().isoformat(),
            'model': model,
            'input_tokens': input_tokens,
            'output_tokens': output_tokens,
            'cost': cost,
            'task_type': task_type
        }
        
        self.usage_history.append(entry)
        self.current_usage += cost
        
        # Check alert thresholds
        self._check_budget_alerts()
        
        # Save to file
        self._save_usage()
    
    def _check_budget_alerts(self):
        """Check and trigger budget alerts."""
        usage_ratio = self.current_usage / self.daily_budget
        
        for threshold in self.alert_thresholds:
            if usage_ratio >= threshold and threshold not in self.alerts_triggered:
                self._trigger_budget_alert(threshold, usage_ratio)
                self.alerts_triggered.add(threshold)
    
    def _trigger_budget_alert(self, threshold: float, usage_ratio: float):
        """Trigger budget alert."""
        severity = 'info' if threshold < 0.8 else 'warning' if threshold < 0.95 else 'critical'
        
        alert = {
            'timestamp': datetime.now().isoformat(),
            'type': 'budget_alert',
            'severity': severity,
            'threshold': threshold,
            'usage_ratio': usage_ratio,
            'current_usage': self.current_usage,
            'daily_budget': self.daily_budget,
            'message': f"Budget {threshold*100:.0f}% exhausted ({self.current_usage:.2f}/{self.daily_budget:.2f})"
        }
        
        # Log alert
        alert_file = f"{WORKSPACE}/system/performance/alerts/{datetime.now().strftime('%Y-%m-%d')}.jsonl"
        os.makedirs(os.path.dirname(alert_file), exist_ok=True)
        
        with open(alert_file, 'a') as f:
            f.write(json.dumps(alert) + '\n')
    
    def get_status(self) -> Dict[str, Any]:
        """Get current budget status."""
        usage_ratio = self.current_usage / self.daily_budget if self.daily_budget > 0 else 0
        
        return {
            'daily_budget': self.daily_budget,
            'current_usage': self.current_usage,
            'remaining': self.daily_budget - self.current_usage,
            'usage_ratio': usage_ratio,
            'percentage_used': usage_ratio * 100,
            'status': 'healthy' if usage_ratio < 0.8 else 'warning' if usage_ratio < 0.95 else 'critical',
            'alerts_triggered': list(self.alerts_triggered)
        }
    
    def can_execute(self, estimated_cost: float) -> bool:
        """Check if there's budget for an operation."""
        return (self.current_usage + estimated_cost) <= self.daily_budget
    
    def get_usage_breakdown(self) -> Dict[str, Any]:
        """Get usage breakdown by model and task type."""
        by_model = {}
        by_task = {}
        
        for entry in self.usage_history:
            model = entry['model']
            task = entry['task_type']
            cost = entry['cost']
            
            by_model[model] = by_model.get(model, 0) + cost
            by_task[task] = by_task.get(task, 0) + cost
        
        return {
            'by_model': by_model,
            'by_task_type': by_task,
            'total_calls': len(self.usage_history)
        }
    
    def get_historical_usage(self, days: int = 7) -> List[Dict[str, Any]]:
        """Get historical usage for the past N days."""
        history = []
        
        for i in range(days):
            date = (datetime.now() - timedelta(days=i)).strftime('%Y-%m-%d')
            usage_file = f"{WORKSPACE}/system/performance/usage/{date}.json"
            
            if os.path.exists(usage_file):
                try:
                    with open(usage_file, 'r') as f:
                        data = json.load(f)
                        history.append({
                            'date': date,
                            'total_cost': data.get('total_cost', 0),
                            'daily_budget': data.get('daily_budget', self.daily_budget)
                        })
                except:
                    pass
            else:
                history.append({
                    'date': date,
                    'total_cost': 0,
                    'daily_budget': self.daily_budget
                })
        
        return history


if __name__ == '__main__':
    print("=" * 60)
    print("Budget Manager")
    print("=" * 60)
    
    budget = BudgetManager(daily_budget=10.0)
    
    # Record some usage
    print("\n🧪 Recording Usage:")
    usage_data = [
        ("deepseek-chat", 1000, 500, 0.05, "implementation"),
        ("claude-3.5-sonnet", 2000, 1000, 0.20, "planning"),
        ("gpt-4o-mini", 500, 200, 0.01, "triage"),
    ]
    
    for model, input_tok, output_tok, cost, task in usage_data:
        budget.record_usage(model, input_tok, output_tok, cost, task)
        print(f"  {model}: ${cost:.2f} for {task}")
    
    # Get status
    print("\n📊 Budget Status:")
    status = budget.get_status()
    print(f"  Daily Budget: ${status['daily_budget']:.2f}")
    print(f"  Current Usage: ${status['current_usage']:.2f}")
    print(f"  Remaining: ${status['remaining']:.2f}")
    print(f"  Percentage Used: {status['percentage_used']:.1f}%")
    print(f"  Status: {status['status']}")
    
    # Check if we can execute
    print("\n🧪 Checking Budget:")
    can_run = budget.can_execute(0.50)
    print(f"  Can execute $0.50 task: {can_run}")
    
    # Get breakdown
    print("\n📊 Usage Breakdown:")
    breakdown = budget.get_usage_breakdown()
    print(f"  By Model: {breakdown['by_model']}")
    print(f"  By Task: {breakdown['by_task_type']}")
    
    print("\n✅ Budget Manager Ready")
