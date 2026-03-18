#!/usr/bin/env python3
"""
Health Checker for Hired AI System - Phase 4 with NEW Phase 3 Integration
Multi-layer system monitoring with integration to Phase 3 components.
"""

from enum import Enum
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import subprocess
import json
import os
import sys

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

class CheckStatus(Enum):
    PASS = "pass"
    WARNING = "warning"
    CRITICAL = "critical"
    UNKNOWN = "unknown"

class CheckLayer(Enum):
    COMPONENT = "component"
    WORKFLOW = "workflow"
    INTEGRATION = "integration"
    SYSTEM = "system"
    PHASE3 = "phase3"

@dataclass
class CheckResult:
    check_id: str
    status: CheckStatus
    timestamp: datetime
    duration_ms: int
    message: str
    details: Dict[str, Any] = field(default_factory=dict)
    consecutive_failures: int = 0

@dataclass
class HealthCheck:
    id: str
    name: str
    description: str
    layer: CheckLayer
    category: str
    schedule_interval: int
    check_config: Dict[str, Any]
    thresholds: Dict[str, Any]
    actions: Dict[str, List[Dict]]
    last_run: Optional[datetime] = None
    last_result: Optional[CheckResult] = None
    failure_count: int = 0

class Phase3HealthIntegration:
    """Health checks for NEW Phase 3 components."""
    
    @staticmethod
    def check_autonomy_system() -> Dict[str, Any]:
        """Check Phase 3 autonomy system health."""
        results = {
            "heartbeat_script": False,
            "task_runner": False,
            "protocols": False,
            "overall": "unknown"
        }
        
        # Check heartbeat script
        heartbeat_script = f"{WORKSPACE}/autonomy/checks/heartbeat-check.sh"
        if os.path.exists(heartbeat_script) and os.access(heartbeat_script, os.X_OK):
            results["heartbeat_script"] = True
        
        # Check task runner
        task_runner = f"{WORKSPACE}/autonomy/tasks/task-runner.sh"
        if os.path.exists(task_runner) and os.access(task_runner, os.X_OK):
            results["task_runner"] = True
        
        # Check protocols
        protocols = [
            f"{WORKSPACE}/autonomy/protocols/autonomy-levels.md",
            f"{WORKSPACE}/autonomy/protocols/decision-matrix.md"
        ]
        results["protocols"] = all(os.path.exists(p) for p in protocols)
        
        # Overall status
        if all([results["heartbeat_script"], results["task_runner"], results["protocols"]]):
            results["overall"] = "healthy"
        elif results["heartbeat_script"] or results["task_runner"]:
            results["overall"] = "degraded"
        else:
            results["overall"] = "critical"
        
        return results
    
    @staticmethod
    def check_accountability_system() -> Dict[str, Any]:
        """Check Phase 3 accountability system health."""
        results = {
            "scope_checker": False,
            "error_reporting": False,
            "metrics": False,
            "overall": "unknown"
        }
        
        # Check scope checker
        scope_script = f"{WORKSPACE}/accountability/scope/scope-check.sh"
        if os.path.exists(scope_script) and os.access(scope_script, os.X_OK):
            results["scope_checker"] = True
        
        # Check error reporting
        error_script = f"{WORKSPACE}/accountability/errors/error-report.sh"
        if os.path.exists(error_script) and os.access(error_script, os.X_OK):
            results["error_reporting"] = True
        
        # Check metrics
        metrics_file = f"{WORKSPACE}/accountability/reviews/performance-metrics.json"
        if os.path.exists(metrics_file):
            results["metrics"] = True
        
        # Overall status
        if all([results["scope_checker"], results["error_reporting"]]):
            results["overall"] = "healthy"
        elif results["scope_checker"]:
            results["overall"] = "degraded"
        else:
            results["overall"] = "critical"
        
        return results
    
    @staticmethod
    def check_safety_system() -> Dict[str, Any]:
        """Check Phase 3 safety system health."""
        results = {
            "trust_system": False,
            "emergency_stop": False,
            "audit_trail": False,
            "overall": "unknown"
        }
        
        # Check trust system
        trust_script = f"{WORKSPACE}/safety/trust/trust-check.sh"
        trust_ladder = f"{WORKSPACE}/safety/trust/trust-ladder.md"
        if os.path.exists(trust_script) and os.path.exists(trust_ladder):
            results["trust_system"] = True
        
        # Check emergency stop
        emergency_script = f"{WORKSPACE}/safety/emergency/emergency-stop.sh"
        if os.path.exists(emergency_script) and os.access(emergency_script, os.X_OK):
            results["emergency_stop"] = True
        
        # Check audit trail
        audit_log = f"{WORKSPACE}/safety/audit/audit-log.jsonl"
        if os.path.exists(audit_log):
            results["audit_trail"] = True
        
        # Overall status
        if all([results["trust_system"], results["emergency_stop"]]):
            results["overall"] = "healthy"
        elif results["emergency_stop"]:
            results["overall"] = "degraded"
        else:
            results["overall"] = "critical"
        
        return results
    
    @staticmethod
    def check_phase3_integration() -> Dict[str, Any]:
        """Check integration between Phase 3 components."""
        results = {
            "autonomy_to_safety": False,
            "accountability_to_safety": False,
            "trust_to_autonomy": False,
            "overall": "unknown"
        }
        
        # Check autonomy references safety
        autonomy_readme = f"{WORKSPACE}/autonomy/README.md"
        if os.path.exists(autonomy_readme):
            with open(autonomy_readme, 'r') as f:
                content = f.read()
                if "safety" in content.lower():
                    results["autonomy_to_safety"] = True
        
        # Check accountability references scope
        accountability_readme = f"{WORKSPACE}/accountability/README.md"
        if os.path.exists(accountability_readme):
            with open(accountability_readme, 'r') as f:
                content = f.read()
                if "scope" in content.lower():
                    results["accountability_to_safety"] = True
        
        # Check trust ladder references autonomy
        trust_ladder = f"{WORKSPACE}/safety/trust/trust-ladder.md"
        if os.path.exists(trust_ladder):
            with open(trust_ladder, 'r') as f:
                content = f.read()
                if "autonomy" in content.lower() or "L0" in content or "L1" in content:
                    results["trust_to_autonomy"] = True
        
        # Overall status
        if all(results.values()):
            results["overall"] = "healthy"
        elif any([results["autonomy_to_safety"], results["accountability_to_safety"]]):
            results["overall"] = "degraded"
        else:
            results["overall"] = "critical"
        
        return results

class HealthChecker:
    """Central health checking engine with Phase 3 integration."""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'config')
        self.config_path = config_path
        self.checks: Dict[str, HealthCheck] = {}
        self.results: List[CheckResult] = []
        self.phase3 = Phase3HealthIntegration()
        self.running = False
        self._load_default_checks()
    
    def _load_default_checks(self):
        """Load default health checks including Phase 3."""
        default_checks = [
            # Phase 1 checks
            {
                'id': 'memory_system_health',
                'name': 'Memory System Health',
                'description': 'Validates memory layers are accessible',
                'layer': 'component',
                'category': 'memory',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'script',
                    'script': {
                        'command': f'test -d {WORKSPACE}/memory/',
                        'timeout': '10s'
                    }
                },
                'thresholds': {
                    'critical': {'consecutive_failures': 2}
                },
                'actions': {
                    'on_critical': [{'type': 'log', 'level': 'error'}]
                }
            },
            {
                'id': 'knowledge_base_health',
                'name': 'Knowledge Base Health',
                'description': 'Validates knowledge base is accessible',
                'layer': 'component',
                'category': 'knowledge',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'script',
                    'script': {
                        'command': f'test -d {WORKSPACE}/knowledge/',
                        'timeout': '10s'
                    }
                },
                'thresholds': {
                    'critical': {'consecutive_failures': 2}
                },
                'actions': {
                    'on_critical': [{'type': 'log', 'level': 'error'}]
                }
            },
            # Phase 3 checks
            {
                'id': 'phase3_autonomy_health',
                'name': 'Phase 3 Autonomy System',
                'description': 'Checks Phase 3 autonomy components',
                'layer': 'phase3',
                'category': 'autonomy',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'phase3_autonomy'
                },
                'thresholds': {
                    'warning': {'consecutive_failures': 1},
                    'critical': {'consecutive_failures': 2}
                },
                'actions': {
                    'on_warning': [{'type': 'log', 'level': 'warning'}],
                    'on_critical': [{'type': 'log', 'level': 'critical'}]
                }
            },
            {
                'id': 'phase3_accountability_health',
                'name': 'Phase 3 Accountability System',
                'description': 'Checks Phase 3 accountability components',
                'layer': 'phase3',
                'category': 'accountability',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'phase3_accountability'
                },
                'thresholds': {
                    'warning': {'consecutive_failures': 1},
                    'critical': {'consecutive_failures': 2}
                },
                'actions': {
                    'on_warning': [{'type': 'log', 'level': 'warning'}],
                    'on_critical': [{'type': 'log', 'level': 'critical'}]
                }
            },
            {
                'id': 'phase3_safety_health',
                'name': 'Phase 3 Safety System',
                'description': 'Checks Phase 3 safety components',
                'layer': 'phase3',
                'category': 'safety',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'phase3_safety'
                },
                'thresholds': {
                    'warning': {'consecutive_failures': 1},
                    'critical': {'consecutive_failures': 1}
                },
                'actions': {
                    'on_warning': [{'type': 'log', 'level': 'warning'}],
                    'on_critical': [{'type': 'log', 'level': 'critical'}]
                }
            },
            {
                'id': 'phase3_integration_health',
                'name': 'Phase 3 Integration Health',
                'description': 'Checks integration between Phase 3 components',
                'layer': 'phase3',
                'category': 'integration',
                'schedule_interval': 120,
                'check_config': {
                    'type': 'phase3_integration'
                },
                'thresholds': {
                    'warning': {'consecutive_failures': 2},
                    'critical': {'consecutive_failures': 3}
                },
                'actions': {
                    'on_warning': [{'type': 'log', 'level': 'warning'}]
                }
            },
            # Phase 4 checks
            {
                'id': 'workflow_engine_health',
                'name': 'Workflow Engine Health',
                'description': 'Validates workflow engine is operational',
                'layer': 'component',
                'category': 'workflows',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'script',
                    'script': {
                        'command': f'test -f {WORKSPACE}/system/workflows/engine.py',
                        'timeout': '10s'
                    }
                },
                'thresholds': {
                    'critical': {'consecutive_failures': 3}
                },
                'actions': {
                    'on_critical': [{'type': 'log', 'level': 'error'}]
                }
            },
            {
                'id': 'safety_system_health',
                'name': 'Safety System Health',
                'description': 'Validates safety system is operational',
                'layer': 'component',
                'category': 'safety',
                'schedule_interval': 60,
                'check_config': {
                    'type': 'script',
                    'script': {
                        'command': f'test -f {WORKSPACE}/system/safety/validator.py',
                        'timeout': '10s'
                    }
                },
                'thresholds': {
                    'critical': {'consecutive_failures': 1}
                },
                'actions': {
                    'on_critical': [{'type': 'log', 'level': 'critical'}]
                }
            },
        ]
        
        for check_config in default_checks:
            check = HealthCheck(
                id=check_config['id'],
                name=check_config['name'],
                description=check_config['description'],
                layer=CheckLayer(check_config['layer']),
                category=check_config['category'],
                schedule_interval=check_config['schedule_interval'],
                check_config=check_config['check_config'],
                thresholds=check_config.get('thresholds', {}),
                actions=check_config.get('actions', {})
            )
            self.checks[check.id] = check
    
    def run_check(self, check_id: str) -> CheckResult:
        """Execute a single health check."""
        check = self.checks.get(check_id)
        if not check:
            raise ValueError(f"Check {check_id} not found")
        
        start_time = datetime.now()
        
        try:
            result = self._execute_check_logic(check)
        except Exception as e:
            result = CheckResult(
                check_id=check_id,
                status=CheckStatus.CRITICAL,
                timestamp=datetime.now(),
                duration_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                message=f"Check execution failed: {str(e)}",
                details={'error': str(e)}
            )
        
        # Update check state
        check.last_run = datetime.now()
        check.last_result = result
        
        if result.status in [CheckStatus.WARNING, CheckStatus.CRITICAL]:
            check.failure_count += 1
            result.consecutive_failures = check.failure_count
        else:
            check.failure_count = 0
        
        # Store result
        self.results.append(result)
        
        # Evaluate thresholds and trigger actions
        self._evaluate_thresholds(check, result)
        
        return result
    
    def _execute_check_logic(self, check: HealthCheck) -> CheckResult:
        """Execute the check logic based on type."""
        check_type = check.check_config.get('type')
        start_time = datetime.now()
        
        if check_type == 'script':
            return self._run_script_check(check, start_time)
        elif check_type == 'phase3_autonomy':
            return self._run_phase3_autonomy_check(check, start_time)
        elif check_type == 'phase3_accountability':
            return self._run_phase3_accountability_check(check, start_time)
        elif check_type == 'phase3_safety':
            return self._run_phase3_safety_check(check, start_time)
        elif check_type == 'phase3_integration':
            return self._run_phase3_integration_check(check, start_time)
        else:
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            return CheckResult(
                check_id=check.id,
                status=CheckStatus.UNKNOWN,
                timestamp=datetime.now(),
                duration_ms=duration_ms,
                message=f"Unknown check type: {check_type}",
                details={}
            )
    
    def _run_script_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Execute a script-based check."""
        script_config = check.check_config.get('script', {})
        command = script_config.get('command', '')
        timeout_str = script_config.get('timeout', '30s')
        timeout_seconds = int(timeout_str[:-1]) if timeout_str.endswith('s') else 30
        
        try:
            result = subprocess.run(
                command,
                shell=True,
                capture_output=True,
                text=True,
                timeout=timeout_seconds
            )
            
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            
            if result.returncode == 0:
                return CheckResult(
                    check_id=check.id,
                    status=CheckStatus.PASS,
                    timestamp=datetime.now(),
                    duration_ms=duration_ms,
                    message="Check passed",
                    details={}
                )
            else:
                return CheckResult(
                    check_id=check.id,
                    status=CheckStatus.CRITICAL,
                    timestamp=datetime.now(),
                    duration_ms=duration_ms,
                    message=f"Check failed with return code {result.returncode}",
                    details={'returncode': result.returncode}
                )
        except subprocess.TimeoutExpired:
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            return CheckResult(
                check_id=check.id,
                status=CheckStatus.CRITICAL,
                timestamp=datetime.now(),
                duration_ms=duration_ms,
                message="Check timed out",
                details={'timeout': timeout_seconds}
            )
        except Exception as e:
            duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
            return CheckResult(
                check_id=check.id,
                status=CheckStatus.CRITICAL,
                timestamp=datetime.now(),
                duration_ms=duration_ms,
                message=f"Check error: {str(e)}",
                details={'error': str(e)}
            )
    
    def _run_phase3_autonomy_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Check Phase 3 autonomy system."""
        results = self.phase3.check_autonomy_system()
        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        status_map = {
            "healthy": CheckStatus.PASS,
            "degraded": CheckStatus.WARNING,
            "critical": CheckStatus.CRITICAL
        }
        
        return CheckResult(
            check_id=check.id,
            status=status_map.get(results["overall"], CheckStatus.UNKNOWN),
            timestamp=datetime.now(),
            duration_ms=duration_ms,
            message=f"Autonomy system: {results['overall']}",
            details=results
        )
    
    def _run_phase3_accountability_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Check Phase 3 accountability system."""
        results = self.phase3.check_accountability_system()
        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        status_map = {
            "healthy": CheckStatus.PASS,
            "degraded": CheckStatus.WARNING,
            "critical": CheckStatus.CRITICAL
        }
        
        return CheckResult(
            check_id=check.id,
            status=status_map.get(results["overall"], CheckStatus.UNKNOWN),
            timestamp=datetime.now(),
            duration_ms=duration_ms,
            message=f"Accountability system: {results['overall']}",
            details=results
        )
    
    def _run_phase3_safety_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Check Phase 3 safety system."""
        results = self.phase3.check_safety_system()
        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        status_map = {
            "healthy": CheckStatus.PASS,
            "degraded": CheckStatus.WARNING,
            "critical": CheckStatus.CRITICAL
        }
        
        return CheckResult(
            check_id=check.id,
            status=status_map.get(results["overall"], CheckStatus.UNKNOWN),
            timestamp=datetime.now(),
            duration_ms=duration_ms,
            message=f"Safety system: {results['overall']}",
            details=results
        )
    
    def _run_phase3_integration_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Check Phase 3 integration."""
        results = self.phase3.check_phase3_integration()
        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        status_map = {
            "healthy": CheckStatus.PASS,
            "degraded": CheckStatus.WARNING,
            "critical": CheckStatus.CRITICAL
        }
        
        return CheckResult(
            check_id=check.id,
            status=status_map.get(results["overall"], CheckStatus.UNKNOWN),
            timestamp=datetime.now(),
            duration_ms=duration_ms,
            message=f"Phase 3 integration: {results['overall']}",
            details=results
        )
    
    def _evaluate_thresholds(self, check: HealthCheck, result: CheckResult):
        """Evaluate check result against thresholds and trigger actions."""
        thresholds = check.thresholds
        actions = check.actions
        
        if result.status == CheckStatus.CRITICAL:
            critical_threshold = thresholds.get('critical', {})
            required_failures = critical_threshold.get('consecutive_failures', 3)
            
            if result.consecutive_failures >= required_failures:
                self._trigger_actions(check, actions.get('on_critical', []), result)
                
        elif result.status == CheckStatus.WARNING:
            warning_threshold = thresholds.get('warning', {})
            required_failures = warning_threshold.get('consecutive_failures', 2)
            
            if result.consecutive_failures >= required_failures:
                self._trigger_actions(check, actions.get('on_warning', []), result)
                
        elif result.status == CheckStatus.PASS and check.failure_count == 0:
            self._trigger_actions(check, actions.get('on_recovery', []), result)
    
    def _trigger_actions(self, check: HealthCheck, actions: List[Dict], result: CheckResult):
        """Trigger configured actions for a check result."""
        for action in actions:
            action_type = action.get('type')
            
            if action_type == 'log':
                self._log_action(check, action, result)
            elif action_type == 'notify':
                self._notify_action(check, action, result)
            elif action_type == 'alert':
                self._alert_action(check, action, result)
    
    def _log_action(self, check: HealthCheck, action: Dict, result: CheckResult):
        """Log an action."""
        level = action.get('level', 'info')
        message = action.get('message', result.message)
        
        log_entry = {
            'timestamp': datetime.now().isoformat(),
            'level': level,
            'check_id': check.id,
            'check_name': check.name,
            'status': result.status.value,
            'message': message,
            'details': result.details
        }
        
        log_dir = os.path.join(WORKSPACE, 'system', 'monitoring', 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        log_path = os.path.join(log_dir, f"health-checks-{datetime.now().strftime('%Y-%m-%d')}.jsonl")
        
        with open(log_path, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def _notify_action(self, check: HealthCheck, action: Dict, result: CheckResult):
        """Send notification."""
        pass
    
    def _alert_action(self, check: HealthCheck, action: Dict, result: CheckResult):
        """Create alert."""
        pass
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health summary including Phase 3."""
        layer_health = {}
        
        for layer in CheckLayer:
            layer_checks = [c for c in self.checks.values() if c.layer == layer]
            if layer_checks:
                critical_count = sum(1 for c in layer_checks 
                                   if c.last_result and c.last_result.status == CheckStatus.CRITICAL)
                warning_count = sum(1 for c in layer_checks 
                                  if c.last_result and c.last_result.status == CheckStatus.WARNING)
                
                if critical_count > 0:
                    status = "critical"
                elif warning_count > 0:
                    status = "warning"
                else:
                    status = "healthy"
                
                layer_health[layer.value] = {
                    'status': status,
                    'total_checks': len(layer_checks),
                    'critical': critical_count,
                    'warning': warning_count
                }
        
        overall_status = "healthy"
        if any(l.get('status') == 'critical' for l in layer_health.values()):
            overall_status = "critical"
        elif any(l.get('status') == 'warning' for l in layer_health.values()):
            overall_status = "warning"
        
        # Count active alerts
        alerts_dir = os.path.join(os.path.dirname(__file__), 'alerts', 'active')
        active_alerts = 0
        if os.path.exists(alerts_dir):
            active_alerts = len([f for f in os.listdir(alerts_dir) if f.endswith('.json')])
        
        # Phase 3 specific status
        phase3_status = {
            "autonomy": self.phase3.check_autonomy_system()["overall"],
            "accountability": self.phase3.check_accountability_system()["overall"],
            "safety": self.phase3.check_safety_system()["overall"],
            "integration": self.phase3.check_phase3_integration()["overall"]
        }
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall_status': overall_status,
            'layers': layer_health,
            'phase3': phase3_status,
            'checks_run': len(self.results),
            'active_alerts': active_alerts
        }
    
    def run_all_checks(self) -> Dict[str, CheckResult]:
        """Run all configured health checks."""
        results = {}
        for check_id in self.checks:
            results[check_id] = self.run_check(check_id)
        return results


if __name__ == '__main__':
    checker = HealthChecker()
    
    print("=" * 60)
    print("Health Checker with Phase 3 Integration")
    print("=" * 60)
    
    # Run all checks
    print("\n🏥 Running all health checks...")
    results = checker.run_all_checks()
    
    for check_id, result in results.items():
        status_icon = "✓" if result.status == CheckStatus.PASS else "⚠" if result.status == CheckStatus.WARNING else "✗"
        print(f"  {status_icon} {check_id}: {result.status.value}")
    
    # Get system health
    print("\n📊 System Health Summary:")
    health = checker.get_system_health()
    print(f"  Overall Status: {health['overall_status'].upper()}")
    print(f"  Checks Run: {health['checks_run']}")
    print(f"  Active Alerts: {health['active_alerts']}")
    
    print("\n  Phase 3 Status:")
    for component, status in health['phase3'].items():
        icon = "✓" if status == "healthy" else "⚠" if status == "degraded" else "✗"
        print(f"    {icon} {component}: {status}")
    
    print("\n✅ Health Check Complete")
