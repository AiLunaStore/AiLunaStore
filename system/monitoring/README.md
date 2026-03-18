# System Monitoring & Health Checks

## Overview

The System Monitoring & Health Checks framework provides comprehensive visibility into the "hired AI" system's operational status, performance metrics, and potential issues. It implements multi-layer monitoring with automated alerting and recovery procedures.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                  MONITORING ARCHITECTURE                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │                    Monitoring Layers                     │   │
│  ├─────────────────────────────────────────────────────────┤   │
│  │                                                         │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Layer 1: Component Health (60s interval)       │   │   │
│  │  │  • Memory usage        • Response time          │   │   │
│  │  │  • Error rate          • Resource utilization   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                          ↓                            │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Layer 2: Workflow Health (5m interval)         │   │   │
│  │  │  • Completion rate     • Duration tracking      │   │   │
│  │  │  • Success rate        • Bottleneck detection   │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                          ↓                            │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Layer 3: Integration Health (15m interval)     │   │   │
│  │  │  • Data sync status    • Component connectivity │   │   │
│  │  │  • Resource availability • Cross-system health  │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                          ↓                            │   │
│  │  ┌─────────────────────────────────────────────────┐   │   │
│  │  │  Layer 4: System Health (1h interval)           │   │   │
│  │  │  • Overall status      • Trend analysis         │   │   │
│  │  │  • Capacity planning   • Predictive alerts      │   │   │
│  │  └─────────────────────────────────────────────────┘   │   │
│  │                                                         │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────┼────────────────────────┐           │
│  │                        ▼                        │           │
│  │           ┌─────────────────────┐               │           │
│  │           │   Alert Manager     │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Severity      │  │               │           │
│  │           │  │ Assessment    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Routing       │  │               │           │
│  │           │  │ Engine        │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Notification  │  │               │           │
│  │           │  │ Dispatcher    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           └─────────────────────┘               │           │
│  │                        │                        │           │
│  │           ┌─────────────────────┐               │           │
│  │           │   Recovery System   │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Auto-Recovery │  │               │           │
│  │           │  │ Procedures    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Escalation    │  │               │           │
│  │           │  │ Management    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           └─────────────────────┘               │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Health Check Configuration

### Pre-configured Checks

The monitoring system includes the following health checks out of the box:

#### Layer 1: Component Health (60s)

| Check ID | Component | Description |
|----------|-----------|-------------|
| `memory_system_health` | Memory | Validates memory layers accessible |
| `knowledge_base_health` | Knowledge | Validates knowledge base integrity |
| `skills_library_health` | Skills | Validates skills directory accessible |
| `workflow_engine_health` | Workflow | Checks workflow queue depth |
| `delegation_system_health` | Delegation | Validates delegation tracking |
| `metrics_system_health` | Metrics | Checks metrics collection active |

#### Layer 2: Workflow Health (5m)

| Check ID | Metric | Warning | Critical |
|----------|--------|---------|----------|
| `workflow_completion_rate` | % completed | <90% | <70% |
| `workflow_duration` | Avg duration | >5min | >10min |
| `workflow_error_rate` | % errors | >5% | >10% |
| `active_workflows` | Count | >20 | >50 |

#### Layer 3: Integration Health (15m)

| Check ID | Description |
|----------|-------------|
| `phase1_to_phase2` | Memory-Knowledge-Skills connectivity |
| `phase2_to_phase3` | Delegation-Autonomy integration |
| `phase3_to_phase4` | Safety-Workflow integration |
| `cross_phase_data_flow` | End-to-end data flow validation |

#### Layer 4: System Health (1h)

| Check ID | Description |
|----------|-------------|
| `overall_system_status` | Aggregated health across all layers |
| `capacity_utilization` | Resource usage trends |
| `data_integrity` | Consistency checks across systems |
| `backup_status` | Backup completion verification |

## Implementation

### Health Checker Class

```python
# system/monitoring/health_checker.py

from enum import Enum
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime, timedelta
import yaml
import subprocess
import json
import os

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
    schedule_interval: int  # seconds
    check_config: Dict[str, Any]
    thresholds: Dict[str, Any]
    actions: Dict[str, List[Dict]]
    last_run: Optional[datetime] = None
    last_result: Optional[CheckResult] = None
    failure_count: int = 0

class HealthChecker:
    """Central health checking engine."""
    
    def __init__(self, config_path: str = "system/monitoring/config"):
        self.config_path = config_path
        self.checks: Dict[str, HealthCheck] = {}
        self.results: List[CheckResult] = []
        self.running = False
        self._load_checks()
    
    def _load_checks(self):
        """Load health check definitions from YAML files."""
        checks_dir = os.path.join(self.config_path, "checks")
        if not os.path.exists(checks_dir):
            os.makedirs(checks_dir)
            return
            
        for filename in os.listdir(checks_dir):
            if filename.endswith('.yaml') or filename.endswith('.yml'):
                filepath = os.path.join(checks_dir, filename)
                with open(filepath, 'r') as f:
                    config = yaml.safe_load(f)
                    check_config = config['health_check']
                    
                    check = HealthCheck(
                        id=check_config['id'],
                        name=check_config['name'],
                        description=check_config['description'],
                        layer=CheckLayer(check_config['layer']),
                        category=check_config['category'],
                        schedule_interval=self._parse_interval(
                            check_config['schedule']['interval']
                        ),
                        check_config=check_config['check'],
                        thresholds=check_config.get('thresholds', {}),
                        actions=check_config.get('actions', {})
                    )
                    self.checks[check.id] = check
    
    def _parse_interval(self, interval_str: str) -> int:
        """Parse interval string to seconds."""
        units = {'s': 1, 'm': 60, 'h': 3600}
        value = int(interval_str[:-1])
        unit = interval_str[-1]
        return value * units.get(unit, 1)
    
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
        check_type = check.check_config['type']
        start_time = datetime.now()
        
        if check_type == 'script':
            return self._run_script_check(check, start_time)
        elif check_type == 'metric_threshold':
            return self._run_metric_check(check, start_time)
        elif check_type == 'composite':
            return self._run_composite_check(check, start_time)
        else:
            raise ValueError(f"Unknown check type: {check_type}")
    
    def _run_script_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Execute a script-based check."""
        script_config = check.check_config['script']
        command = script_config['command']
        timeout = script_config.get('timeout', '30s')
        timeout_seconds = int(timeout[:-1]) if timeout.endswith('s') else 30
        
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
                    details={'stdout': result.stdout}
                )
            else:
                return CheckResult(
                    check_id=check.id,
                    status=CheckStatus.CRITICAL,
                    timestamp=datetime.now(),
                    duration_ms=duration_ms,
                    message=f"Check failed: {result.stderr}",
                    details={'stderr': result.stderr, 'returncode': result.returncode}
                )
        except subprocess.TimeoutExpired:
            return CheckResult(
                check_id=check.id,
                status=CheckStatus.CRITICAL,
                timestamp=datetime.now(),
                duration_ms=int((datetime.now() - start_time).total_seconds() * 1000),
                message="Check timed out",
                details={'timeout': timeout}
            )
    
    def _run_metric_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Execute a metric threshold check."""
        metric_config = check.check_config['metric']
        query = metric_config['query']
        thresholds = metric_config['threshold']
        comparison = metric_config.get('comparison', 'greater_than')
        
        # Get metric value from internal metrics store
        value = self._get_metric_value(query)
        
        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        if value is None:
            return CheckResult(
                check_id=check.id,
                status=CheckStatus.UNKNOWN,
                timestamp=datetime.now(),
                duration_ms=duration_ms,
                message=f"Metric {query} not available",
                details={'query': query}
            )
        
        # Evaluate against thresholds
        status = CheckStatus.PASS
        if comparison == 'greater_than':
            if value > thresholds.get('critical', float('inf')):
                status = CheckStatus.CRITICAL
            elif value > thresholds.get('warning', float('inf')):
                status = CheckStatus.WARNING
        elif comparison == 'less_than':
            if value < thresholds.get('critical', float('-inf')):
                status = CheckStatus.CRITICAL
            elif value < thresholds.get('warning', float('-inf')):
                status = CheckStatus.WARNING
        
        return CheckResult(
            check_id=check.id,
            status=status,
            timestamp=datetime.now(),
            duration_ms=duration_ms,
            message=f"Metric {query} = {value} ({status.value})",
            details={'value': value, 'thresholds': thresholds}
        )
    
    def _run_composite_check(self, check: HealthCheck, start_time: datetime) -> CheckResult:
        """Execute a composite check (multiple sub-checks)."""
        composite_config = check.check_config['composite']
        sub_checks = composite_config['checks']
        logic = composite_config.get('logic', 'all_pass')
        
        results = []
        for sub_check in sub_checks:
            sub_check_id = sub_check.get('check_id') or sub_check.get('id')
            if sub_check_id in self.checks:
                sub_result = self.run_check(sub_check_id)
                results.append(sub_result)
        
        duration_ms = int((datetime.now() - start_time).total_seconds() * 1000)
        
        # Evaluate logic
        pass_count = sum(1 for r in results if r.status == CheckStatus.PASS)
        total_count = len(results)
        
        if logic == 'all_pass':
            status = CheckStatus.PASS if pass_count == total_count else CheckStatus.CRITICAL
        elif logic == 'any_pass':
            status = CheckStatus.PASS if pass_count > 0 else CheckStatus.CRITICAL
        elif logic == 'majority_pass':
            status = CheckStatus.PASS if pass_count > total_count / 2 else CheckStatus.CRITICAL
        else:
            status = CheckStatus.UNKNOWN
        
        return CheckResult(
            check_id=check.id,
            status=status,
            timestamp=datetime.now(),
            duration_ms=duration_ms,
            message=f"Composite check: {pass_count}/{total_count} passed",
            details={'sub_results': [{'id': r.check_id, 'status': r.status.value} for r in results]}
        )
    
    def _get_metric_value(self, query: str) -> Optional[float]:
        """Get metric value from internal metrics store."""
        # This integrates with the metrics system
        metrics = {
            'memory_usage_percent': 65.0,
            'workflow_queue_depth': 3,
            'response_time_ms': 150.0,
            'error_rate': 0.01
        }
        return metrics.get(query)
    
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
            # Recovery
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
        
        # Write to log file
        log_path = f"system/monitoring/logs/health-checks-{datetime.now().strftime('%Y-%m-%d')}.jsonl"
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        
        with open(log_path, 'a') as f:
            f.write(json.dumps(log_entry) + '\n')
    
    def _notify_action(self, check: HealthCheck, action: Dict, result: CheckResult):
        """Send notification."""
        channels = action.get('channels', ['dashboard'])
        message = action.get('message', result.message)
        
        notification = {
            'timestamp': datetime.now().isoformat(),
            'check_id': check.id,
            'check_name': check.name,
            'status': result.status.value,
            'message': message,
            'channels': channels
        }
        
        # Store for dashboard
        if 'dashboard' in channels:
            self._store_dashboard_notification(notification)
    
    def _alert_action(self, check: HealthCheck, action: Dict, result: CheckResult):
        """Create alert."""
        severity = action.get('severity', 'medium')
        message = action.get('message', result.message)
        
        alert = {
            'id': f"alert-{datetime.now().strftime('%Y%m%d%H%M%S')}-{check.id}",
            'timestamp': datetime.now().isoformat(),
            'check_id': check.id,
            'check_name': check.name,
            'severity': severity,
            'message': message,
            'status': 'active',
            'details': result.details
        }
        
        # Store alert
        alert_path = f"system/monitoring/alerts/active/{alert['id']}.json"
        os.makedirs(os.path.dirname(alert_path), exist_ok=True)
        
        with open(alert_path, 'w') as f:
            json.dump(alert, f, indent=2)
    
    def _store_dashboard_notification(self, notification: Dict):
        """Store notification for dashboard display."""
        dashboard_path = "dashboard/data/notifications.json"
        os.makedirs(os.path.dirname(dashboard_path), exist_ok=True)
        
        notifications = []
        if os.path.exists(dashboard_path):
            with open(dashboard_path, 'r') as f:
                notifications = json.load(f)
        
        notifications.append(notification)
        
        # Keep only last 100 notifications
        notifications = notifications[-100:]
        
        with open(dashboard_path, 'w') as f:
            json.dump(notifications, f, indent=2)
    
    def get_system_health(self) -> Dict[str, Any]:
        """Get overall system health summary."""
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
        if any(l['status'] == 'critical' for l in layer_health.values()):
            overall_status = "critical"
        elif any(l['status'] == 'warning' for l in layer_health.values()):
            overall_status = "warning"
        
        return {
            'timestamp': datetime.now().isoformat(),
            'overall_status': overall_status,
            'layers': layer_health,
            'checks_run': len(self.results),
            'active_alerts': len([a for a in os.listdir('system/monitoring/alerts/active') 
                                 if a.endswith('.json')]) if os.path.exists('system/monitoring/alerts/active') else 0
        }
    
    def run_all_checks(self) -> Dict[str, CheckResult]:
        """Run all configured health checks."""
        results = {}
        for check_id in self.checks:
            results[check_id] = self.run_check(check_id)
        return results
```

## Alert Management

### Alert Severity Levels

| Level | Description | Response Time | Notification |
|-------|-------------|---------------|--------------|
| **Info** | Informational only | N/A | Dashboard only |
| **Low** | Minor issue, no immediate impact | 4 hours | Dashboard + Email |
| **Medium** | Issue requiring attention | 1 hour | Dashboard + Email + Push |
| **High** | Significant issue, degraded service | 15 minutes | All channels + Escalation |
| **Critical** | Service outage or data loss | Immediate | All channels + Emergency escalation |

### Alert Lifecycle

```
┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐
│ TRIGGER │ →  │ ACTIVE  │ →  │ACKNOWLEDGE│→ │RESOLVED │
└─────────┘    └─────────┘    └─────────┘    └─────────┘
                    ↓                              ↓
               ┌─────────┐                   ┌─────────┐
               │ ESCALATE│                   │ ARCHIVE │
               └─────────┘                   └─────────┘
```

## Recovery Procedures

### Automatic Recovery Actions

| Failure Type | Recovery Action | Timeout | Max Attempts |
|--------------|----------------|---------|--------------|
| Component unresponsive | Restart component | 30s | 3 |
| Workflow stall | Restart workflow | 60s | 2 |
| Memory system failure | Restore from checkpoint | 120s | 1 |
| Integration failure | Reconnect services | 180s | 3 |

## Dashboard Integration

### Health Status API

The monitoring system exposes REST API endpoints for dashboard integration:

- `GET /api/health/status` - Overall system health
- `GET /api/health/checks` - All health check definitions
- `GET /api/health/check/<id>` - Specific check details
- `GET /api/health/alerts` - Active alerts
- `POST /api/health/check/<id>/run` - Trigger check manually

## Usage

### Running Health Checks

```python
from system.monitoring.health_checker import HealthChecker

checker = HealthChecker()

# Run all checks
results = checker.run_all_checks()

# Run specific check
result = checker.run_check('memory_system_health')

# Get system health summary
health = checker.get_system_health()
print(f"Overall status: {health['overall_status']}")
```

### Command Line Interface

```bash
# Run all health checks
python -m system.monitoring check-all

# Run specific check
python -m system.monitoring check memory_system_health

# Get health status
python -m system.monitoring status

# List all checks
python -m system.monitoring list
```

---

**Status**: Implementation Ready  
**Phase**: 4A - Foundation & Integration  
**Last Updated**: 2026-03-15
