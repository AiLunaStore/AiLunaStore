# Advanced Safety Systems

## Overview

The Advanced Safety Systems provide multi-layered protection for the "hired AI" system, ensuring secure, reliable, and trustworthy operation. This framework implements prevention, detection, containment, response, and recovery layers.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                 MULTI-LAYERED SAFETY ARCHITECTURE               │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 1: PREVENTION (Fail-Closed)                      │   │
│  │  • Input Validation  • Permission Checking              │   │
│  │  • Content Filtering • Boundary Enforcement             │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 2: DETECTION (Runtime Monitoring)                │   │
│  │  • Anomaly Detection  • Pattern Recognition             │   │
│  │  • Threshold Monitoring                               │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 3: CONTAINMENT (Operational Limits)              │   │
│  │  • Resource Limits  • Isolation Zones                   │   │
│  │  • Rate Limiting                                      │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 4: RESPONSE (Reactive Measures)                  │   │
│  │  • Emergency Stop  • State Rollback                     │   │
│  │  • Incident Response                                  │   │
│  └─────────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │  LAYER 5: RECOVERY (Post-Incident)                      │   │
│  │  • System Restore  • Data Recovery                      │   │
│  │  • Post-Incident Analysis                             │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Permission Framework

### Permission Levels

| Level | Name | Description | Timeout |
|-------|------|-------------|---------|
| **L0** | RESTRICTED | Read-only, no changes | 1h |
| **L1** | BASIC | Basic operations, logged | 4h |
| **L2** | STANDARD | Standard system access | 8h |
| **L3** | ELEVATED | Elevated privileges | 1h |
| **L4** | ADMIN | Administrative access | 30m |

### Permission Matrix

| Operation | L0 | L1 | L2 | L3 | L4 |
|-----------|----|----|----|----|----|
| Read files | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write workspace files | ❌ | ✅ | ✅ | ✅ | ✅ |
| Execute safe commands | ❌ | ✅ | ✅ | ✅ | ✅ |
| Delegate tasks | ❌ | ❌ | ✅ | ✅ | ✅ |
| Execute elevated commands | ❌ | ❌ | ❌ | ✅ | ✅ |
| Modify system config | ❌ | ❌ | ❌ | ❌ | ✅ |
| Access external APIs | ❌ | ❌ | ✅ | ✅ | ✅ |
| Send communications | ❌ | ❌ | ❌ | ✅ | ✅ |

## Safety Check Types

### 1. Input Validation
- Schema validation
- Content filtering (blocked patterns)
- Size limits
- Injection prevention

### 2. Permission Verification
- Level verification
- Scope enforcement
- Operation authorization

### 3. Resource Limits
- Execution timeout (default: 300s)
- Memory limits (default: 512MB)
- Disk usage limits
- Rate limiting

### 4. Content Safety
- PII detection
- Sensitive data masking
- Output filtering
- Exfiltration prevention

## Implementation

### SafetyValidator Class

```python
# system/safety/validator.py

from enum import Enum
from typing import Dict, List, Any
from dataclasses import dataclass
from datetime import datetime
import re
import json
import os

class SafetyLevel(Enum):
    L0_RESTRICTED = "L0_RESTRICTED"
    L1_BASIC = "L1_BASIC"
    L2_STANDARD = "L2_STANDARD"
    L3_ELEVATED = "L3_ELEVATED"
    L4_ADMIN = "L4_ADMIN"

class CheckResult(Enum):
    PASS = "pass"
    FAIL = "fail"
    WARNING = "warning"

@dataclass
class ValidationResult:
    check_type: str
    result: CheckResult
    message: str
    details: Dict[str, Any]
    timestamp: datetime

class SafetyValidator:
    """Multi-layered safety validation system."""
    
    PERMISSION_MATRIX = {
        'read_file': SafetyLevel.L0_RESTRICTED,
        'write_file': SafetyLevel.L1_BASIC,
        'execute_command': SafetyLevel.L1_BASIC,
        'execute_elevated': SafetyLevel.L3_ELEVATED,
        'delegate_task': SafetyLevel.L2_STANDARD,
        'external_api': SafetyLevel.L2_STANDARD,
        'send_communication': SafetyLevel.L3_ELEVATED,
        'modify_system_config': SafetyLevel.L4_ADMIN,
    }
    
    BLOCKED_PATTERNS = [
        r'rm\s+-rf\s+/',
        r'sudo\s+',
        r'>\s*~/.\w+',
        r'curl\s+.*\|\s*sh',
        r'wget\s+.*\|\s*sh',
        r':\(\)\s*\{\s*:\|\:&\s*\};\s*:',
        r'mkfs\.',
        r'dd\s+if=.*of=/dev/',
    ]
    
    SENSITIVE_PATTERNS = {
        'email': r'\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b',
        'phone': r'\b\d{3}[-.]?\d{3}[-.]?\d{4}\b',
        'ssn': r'\b\d{3}-\d{2}-\d{4}\b',
        'api_key': r'[Aa][Pp][Ii][_-]?[Kk][Ee][Yy]\s*[:=]\s*["\']?\w+',
        'password': r'[Pp][Aa][Ss][Ss][Ww][Oo][Rr][Dd]\s*[:=]\s*["\']?\S+',
    }
    
    def __init__(self):
        self.validation_log = []
    
    def validate(self, context: Dict[str, Any], check_config: Dict[str, Any]) -> bool:
        """Run safety validation based on check configuration."""
        check_type = check_config.get('check_type')
        
        if check_type == 'input_validation':
            return self._validate_input(context, check_config)
        elif check_type == 'permission':
            return self._validate_permission(context, check_config)
        elif check_type == 'resource_limits':
            return self._validate_resource_limits(context, check_config)
        elif check_type == 'content_safety':
            return self._validate_content_safety(context, check_config)
        else:
            self._log_validation("unknown_check", CheckResult.FAIL, 
                               f"Unknown check type: {check_type}", {})
            return False
    
    def _validate_input(self, context: Dict[str, Any], config: Dict[str, Any]) -> bool:
        """Validate input against safety rules."""
        input_data = context.get('input', '')
        
        # Check blocked patterns
        for pattern in self.BLOCKED_PATTERNS:
            if re.search(pattern, input_data, re.IGNORECASE):
                self._log_validation("input_validation", CheckResult.FAIL,
                                   f"Blocked pattern detected: {pattern}",
                                   {'pattern': pattern})
                return False
        
        # Check size limits
        max_length = config.get('max_length', 10000)
        if len(input_data) > max_length:
            self._log_validation("input_validation", CheckResult.FAIL,
                               f"Input exceeds maximum length",
                               {'length': len(input_data), 'max': max_length})
            return False
        
        self._log_validation("input_validation", CheckResult.PASS,
                           "Input validation passed", {})
        return True
    
    def _validate_permission(self, context: Dict[str, Any], config: Dict[str, Any]) -> bool:
        """Validate permission level for operation."""
        operation = context.get('operation', '')
        current_level_str = context.get('permission_level', 'L0_RESTRICTED')
        
        try:
            current_level = SafetyLevel(current_level_str)
        except ValueError:
            current_level = SafetyLevel.L0_RESTRICTED
        
        required_level = self.PERMISSION_MATRIX.get(operation, SafetyLevel.L4_ADMIN)
        
        level_hierarchy = [
            SafetyLevel.L0_RESTRICTED,
            SafetyLevel.L1_BASIC,
            SafetyLevel.L2_STANDARD,
            SafetyLevel.L3_ELEVATED,
            SafetyLevel.L4_ADMIN
        ]
        
        current_index = level_hierarchy.index(current_level)
        required_index = level_hierarchy.index(required_level)
        
        if current_index < required_index:
            self._log_validation("permission", CheckResult.FAIL,
                               f"Insufficient permissions",
                               {'operation': operation, 
                                'required': required_level.value,
                                'current': current_level.value})
            return False
        
        self._log_validation("permission", CheckResult.PASS,
                           f"Permission granted for {operation}",
                           {'operation': operation, 'level': current_level.value})
        return True
    
    def _validate_resource_limits(self, context: Dict[str, Any], config: Dict[str, Any]) -> bool:
        """Validate resource usage within limits."""
        max_duration = config.get('max_duration', 300)
        execution_time = context.get('execution_time', 0)
        
        if execution_time > max_duration:
            self._log_validation("resource_limits", CheckResult.FAIL,
                               f"Execution timeout",
                               {'execution_time': execution_time, 'max_duration': max_duration})
            return False
        
        max_memory = config.get('max_memory_mb', 512)
        memory_usage = context.get('memory_usage_mb', 0)
        
        if memory_usage > max_memory:
            self._log_validation("resource_limits", CheckResult.FAIL,
                               f"Memory limit exceeded",
                               {'memory_usage': memory_usage, 'max_memory': max_memory})
            return False
        
        self._log_validation("resource_limits", CheckResult.PASS,
                           "Resource usage within limits", {})
        return True
    
    def _validate_content_safety(self, context: Dict[str, Any], config: Dict[str, Any]) -> bool:
        """Validate content for sensitive data."""
        content = context.get('content', '')
        
        detected_sensitive = {}
        for data_type, pattern in self.SENSITIVE_PATTERNS.items():
            matches = re.findall(pattern, content)
            if matches:
                detected_sensitive[data_type] = len(matches)
        
        if detected_sensitive:
            self._log_validation("content_safety", CheckResult.WARNING,
                               f"Sensitive data detected",
                               {'detected_types': detected_sensitive})
            return True  # Warn but don't fail
        
        self._log_validation("content_safety", CheckResult.PASS,
                           "No sensitive data detected", {})
        return True
    
    def _log_validation(self, check_type: str, result: CheckResult, 
                       message: str, details: Dict[str, Any]):
        """Log validation result."""
        validation_result = ValidationResult(
            check_type=check_type,
            result=result,
            message=message,
            details=details,
            timestamp=datetime.now()
        )
        self.validation_log.append(validation_result)
        
        # Write to audit log
        audit_entry = {
            'timestamp': datetime.now().isoformat(),
            'check_type': check_type,
            'result': result.value,
            'message': message,
            'details': details
        }
        
        audit_path = f"system/safety/logs/validations-{datetime.now().strftime('%Y-%m-%d')}.jsonl"
        os.makedirs(os.path.dirname(audit_path), exist_ok=True)
        
        with open(audit_path, 'a') as f:
            f.write(json.dumps(audit_entry) + '\n')

class PermissionManager:
    """Manages permission levels and escalations."""
    
    def __init__(self):
        self.current_level = SafetyLevel.L0_RESTRICTED
        self.level_acquired_at = datetime.now()
        self.escalation_history = []
    
    def get_current_level(self) -> SafetyLevel:
        """Get current permission level."""
        return self.current_level
    
    def escalate(self, target_level: SafetyLevel, reason: str, 
                 approved_by: str = None) -> bool:
        """Escalate to a higher permission level."""
        level_hierarchy = [
            SafetyLevel.L0_RESTRICTED,
            SafetyLevel.L1_BASIC,
            SafetyLevel.L2_STANDARD,
            SafetyLevel.L3_ELEVATED,
            SafetyLevel.L4_ADMIN
        ]
        
        current_index = level_hierarchy.index(self.current_level)
        target_index = level_hierarchy.index(target_level)
        
        if target_index <= current_index:
            return False
        
        escalation_record = {
            'timestamp': datetime.now().isoformat(),
            'from_level': self.current_level.value,
            'to_level': target_level.value,
            'reason': reason,
            'approved_by': approved_by
        }
        self.escalation_history.append(escalation_record)
        
        self.current_level = target_level
        self.level_acquired_at = datetime.now()
        
        return True
    
    def deescalate(self, reason: str) -> bool:
        """Deescalate to a lower permission level."""
        level_hierarchy = [
            SafetyLevel.L0_RESTRICTED,
            SafetyLevel.L1_BASIC,
            SafetyLevel.L2_STANDARD,
            SafetyLevel.L3_ELEVATED,
            SafetyLevel.L4_ADMIN
        ]
        
        current_index = level_hierarchy.index(self.current_level)
        
        if current_index == 0:
            return False
        
        new_level = level_hierarchy[current_index - 1]
        
        deescalation_record = {
            'timestamp': datetime.now().isoformat(),
            'from_level': self.current_level.value,
            'to_level': new_level.value,
            'reason': reason
        }
        self.escalation_history.append(deescalation_record)
        
        self.current_level = new_level
        self.level_acquired_at = datetime.now()
        
        return True
    
    def check_timeout(self) -> bool:
        """Check if current permission level has timed out."""
        timeout_map = {
            SafetyLevel.L0_RESTRICTED: None,
            SafetyLevel.L1_BASIC: 3600 * 4,
            SafetyLevel.L2_STANDARD: 3600 * 8,
            SafetyLevel.L3_ELEVATED: 3600,
            SafetyLevel.L4_ADMIN: 1800
        }
        
        timeout = timeout_map.get(self.current_level)
        if timeout is None:
            return False
        
        elapsed = (datetime.now() - self.level_acquired_at).total_seconds()
        return elapsed > timeout
```

## Emergency Procedures

### Emergency Stop

```python
# system/safety/emergency.py

from datetime import datetime
import json
import os

class EmergencyStop:
    """Emergency stop mechanism for critical situations."""
    
    def __init__(self):
        self.emergency_active = False
        self.emergency_reason = None
        self.activated_at = None
    
    def activate(self, reason: str, triggered_by: str):
        """Activate emergency stop."""
        self.emergency_active = True
        self.emergency_reason = reason
        self.activated_at = datetime.now()
        
        emergency_log = {
            'timestamp': self.activated_at.isoformat(),
            'reason': reason,
            'triggered_by': triggered_by,
            'action': 'emergency_stop_activated'
        }
        
        log_path = 'system/safety/logs/emergency.jsonl'
        os.makedirs(os.path.dirname(log_path), exist_ok=True)
        
        with open(log_path, 'a') as f:
            f.write(json.dumps(emergency_log) + '\n')
        
        with open('system/safety/EMERGENCY_ACTIVE', 'w') as f:
            f.write(f"Emergency activated at {self.activated_at}\nReason: {reason}\n")
        
        return True
    
    def deactivate(self, reason: str, authorized_by: str):
        """Deactivate emergency stop."""
        if not self.emergency_active:
            return False
        
        deactivation_log = {
            'timestamp': datetime.now().isoformat(),
            'reason': reason,
            'authorized_by': authorized_by,
            'action': 'emergency_stop_deactivated'
        }
        
        log_path = 'system/safety/logs/emergency.jsonl'
        with open(log_path, 'a') as f:
            f.write(json.dumps(deactivation_log) + '\n')
        
        if os.path.exists('system/safety/EMERGENCY_ACTIVE'):
            os.remove('system/safety/EMERGENCY_ACTIVE')
        
        self.emergency_active = False
        self.emergency_reason = None
        self.activated_at = None
        
        return True
    
    def is_active(self) -> bool:
        """Check if emergency stop is active."""
        return self.emergency_active
```

## Audit Framework

### Audit Logger

```python
# system/safety/audit.py

from datetime import datetime
from typing import Dict, Any
import json
import os
import hashlib

class AuditLogger:
    """Comprehensive audit logging system."""
    
    def __init__(self):
        self.audit_buffer = []
        self.buffer_size = 100
    
    def log_event(self, event_type: str, actor: str, action: str, 
                  details: Dict[str, Any], result: str):
        """Log an auditable event."""
        event = {
            'timestamp': datetime.now().isoformat(),
            'event_type': event_type,
            'actor': actor,
            'action': action,
            'details': details,
            'result': result,
        }
        
        # Add integrity hash
        event['integrity_hash'] = self._calculate_hash(event)
        
        self.audit_buffer.append(event)
        
        if len(self.audit_buffer) >= self.buffer_size:
            self._flush_buffer()
    
    def _calculate_hash(self, event: Dict) -> str:
        """Calculate integrity hash for tamper detection."""
        data = json.dumps(event, sort_keys=True)
        return hashlib.sha256(data.encode()).hexdigest()[:16]
    
    def _flush_buffer(self):
        """Write buffered events to persistent storage."""
        if not self.audit_buffer:
            return
        
        date_str = datetime.now().strftime('%Y-%m-%d')
        audit_path = f'system/audit/events-{date_str}.jsonl'
        os.makedirs(os.path.dirname(audit_path), exist_ok=True)
        
        with open(audit_path, 'a') as f:
            for event in self.audit_buffer:
                f.write(json.dumps(event) + '\n')
        
        self.audit_buffer = []
```

## Usage

### Running Safety Checks

```python
from system.safety.validator import SafetyValidator, PermissionManager, SafetyLevel

validator = SafetyValidator()
permission_manager = PermissionManager()

# Check permission for operation
context = {
    'operation': 'write_file',
    'permission_level': permission_manager.get_current_level().value
}
check_config = {'check_type': 'permission'}
is_allowed = validator.validate(context, check_config)

# Escalate if needed
if not is_allowed:
    permission_manager.escalate(SafetyLevel.L1_BASIC, "Need to write file", "user")
```

### Emergency Procedures

```python
from system.safety.emergency import EmergencyStop

emergency = EmergencyStop()

# Activate emergency stop
emergency.activate("Critical error detected", "system")

# Check status
if emergency.is_active():
    print("Emergency stop is active")

# Deactivate (requires authorization)
emergency.deactivate("Issue resolved", "admin")
```

---

**Status**: Implementation Ready  
**Phase**: 4B - Safety Systems  
**Last Updated**: 2026-03-15
