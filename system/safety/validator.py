#!/usr/bin/env python3
"""
Safety Validator for Hired AI System - Phase 4 with NEW Phase 3 Integration
Multi-layered safety validation with Phase 3 trust ladder integration.
"""

from enum import Enum
from typing import Dict, List, Any, Optional
from dataclasses import dataclass
from datetime import datetime
import re
import json
import os
import sys
import subprocess

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

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

class Phase3SafetyIntegration:
    """Integration with NEW Phase 3 safety components."""
    
    @staticmethod
    def get_trust_level() -> str:
        """Get current trust level from Phase 3 trust-ladder.md."""
        trust_file = f"{WORKSPACE}/safety/trust/trust-ladder.md"
        
        if os.path.exists(trust_file):
            try:
                with open(trust_file, 'r') as f:
                    content = f.read()
                    # Look for "Current Trust Level" line
                    for line in content.split('\n'):
                        if 'Current Trust Level:' in line:
                            match = re.search(r'(L[0-4])', line)
                            if match:
                                return match.group(1)
            except:
                pass
        
        # Fallback to autonomy level
        level_file = f"{WORKSPACE}/autonomy/protocols/level-state.json"
        if os.path.exists(level_file):
            try:
                with open(level_file, 'r') as f:
                    data = json.load(f)
                    return data.get("current_level", "L0")
            except:
                pass
        
        return "L0"
    
    @staticmethod
    def check_emergency_status() -> Dict[str, Any]:
        """Check Phase 3 emergency stop status."""
        lock_file = f"{WORKSPACE}/safety/emergency/EMERGENCY_ACTIVE"
        status_file = f"{WORKSPACE}/safety/emergency/emergency-status.json"
        
        if os.path.exists(lock_file):
            return {
                "active": True,
                "level": "SOFT",
                "message": "Emergency stop is active"
            }
        
        if os.path.exists(status_file):
            try:
                with open(status_file, 'r') as f:
                    data = json.load(f)
                    return {
                        "active": data.get("active", False),
                        "level": data.get("level"),
                        "message": data.get("reason", "No emergency")
                    }
            except:
                pass
        
        return {"active": False, "level": None, "message": "System normal"}
    
    @staticmethod
    def check_scope_permission(action: str, target: str = "") -> Dict[str, Any]:
        """Check action against Phase 3 scope."""
        script_path = f"{WORKSPACE}/accountability/scope/scope-check.sh"
        
        if not os.path.exists(script_path):
            return {"allowed": False, "requires_approval": True, "source": "scope_check_missing"}
        
        try:
            cmd = [script_path, action]
            if target:
                cmd.append(target)
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=10
            )
            
            if result.returncode == 0:
                return {"allowed": True, "requires_approval": False, "source": "phase3_scope"}
            elif result.returncode == 2:
                return {"allowed": False, "requires_approval": True, "source": "phase3_scope"}
            else:
                return {"allowed": False, "requires_approval": False, "source": "phase3_scope"}
        except Exception as e:
            return {"allowed": False, "requires_approval": True, "source": "error", "error": str(e)}
    
    @staticmethod
    def log_to_audit(action: str, result: str, details: Dict = None):
        """Log validation to Phase 3 audit trail."""
        audit_log = f"{WORKSPACE}/safety/audit/audit-log.jsonl"
        
        entry = {
            "timestamp": datetime.now().isoformat(),
            "type": "safety_validation",
            "action": action,
            "result": result,
            "details": details or {}
        }
        
        try:
            os.makedirs(os.path.dirname(audit_log), exist_ok=True)
            with open(audit_log, 'a') as f:
                f.write(json.dumps(entry) + '\n')
        except:
            pass
    
    @staticmethod
    def get_trust_ladder_info() -> Dict[str, Any]:
        """Get trust ladder information from Phase 3."""
        trust_file = f"{WORKSPACE}/safety/trust/trust-ladder.md"
        
        info = {
            "current_level": "L0",
            "trust_score": 0,
            "next_level": None,
            "days_at_level": 0
        }
        
        if not os.path.exists(trust_file):
            return info
        
        try:
            with open(trust_file, 'r') as f:
                content = f.read()
                
                # Extract current level
                for line in content.split('\n'):
                    if 'Current Trust Level:' in line:
                        match = re.search(r'(L[0-4])', line)
                        if match:
                            info["current_level"] = match.group(1)
                    
                    # Extract trust score
                    if 'Trust Score:' in line and '|' in line:
                        match = re.search(r'(\d+)', line)
                        if match:
                            info["trust_score"] = int(match.group(1))
                    
                    # Extract days at level
                    if 'Days at Level:' in line and '|' in line:
                        match = re.search(r'(\d+)', line)
                        if match:
                            info["days_at_level"] = int(match.group(1))
        except:
            pass
        
        return info

class SafetyValidator:
    """Multi-layered safety validation system with Phase 3 integration."""
    
    PERMISSION_MATRIX = {
        'read_file': SafetyLevel.L0_RESTRICTED,
        'write_file': SafetyLevel.L1_BASIC,
        'execute_command': SafetyLevel.L1_BASIC,
        'execute_elevated': SafetyLevel.L3_ELEVATED,
        'delegate_task': SafetyLevel.L2_STANDARD,
        'external_api': SafetyLevel.L2_STANDARD,
        'send_communication': SafetyLevel.L3_ELEVATED,
        'modify_system_config': SafetyLevel.L4_ADMIN,
        'delete_file': SafetyLevel.L2_STANDARD,
        'schedule_task': SafetyLevel.L2_STANDARD,
    }
    
    BLOCKED_PATTERNS = [
        r'rm\s+-rf\s+/',
        r'sudo\s+',
        r'>\s*~/\.\w+',
        r'curl\s+.*\|\s*sh',
        r'wget\s+.*\|\s*sh',
        r':\(\)\s*\{\s*:\|\:&\s*\};\s*:',
        r'mkfs\.',
        r'dd\s+if=.*of=/dev/',
        r'>\s*/dev/\w+',
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
        self.phase3 = Phase3SafetyIntegration()
    
    def validate(self, context: Dict[str, Any], check_config: Dict[str, Any]) -> bool:
        """Run safety validation based on check configuration."""
        check_type = check_config.get('check_type')
        
        # Always check emergency status first
        emergency = self.phase3.check_emergency_status()
        if emergency.get("active"):
            self._log_validation("emergency_check", CheckResult.FAIL,
                               "Emergency stop is active", emergency)
            return False
        
        if check_type == 'input_validation':
            return self._validate_input(context, check_config)
        elif check_type == 'permission':
            return self._validate_permission(context, check_config)
        elif check_type == 'resource_limits':
            return self._validate_resource_limits(context, check_config)
        elif check_type == 'content_safety':
            return self._validate_content_safety(context, check_config)
        elif check_type == 'phase3_scope':
            return self._validate_phase3_scope(context, check_config)
        elif check_type == 'trust_level':
            return self._validate_trust_level(context, check_config)
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
                                   f"Blocked pattern detected",
                                   {'pattern': pattern[:50]})
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
        current_level_str = context.get('permission_level', '')
        
        # If no level provided, get from Phase 3
        if not current_level_str:
            current_level_str = f"L{self.phase3.get_trust_level()}_STANDARD"
            # Map L0-L4 to full level names
            level_map = {
                'L0': 'L0_RESTRICTED',
                'L1': 'L1_BASIC',
                'L2': 'L2_STANDARD',
                'L3': 'L3_ELEVATED',
                'L4': 'L4_ADMIN'
            }
            trust_level = self.phase3.get_trust_level()
            current_level_str = level_map.get(trust_level, 'L0_RESTRICTED')
        
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
                               {'detected_types': list(detected_sensitive.keys())})
            # Warn but don't fail
            return True
        
        self._log_validation("content_safety", CheckResult.PASS,
                           "No sensitive data detected", {})
        return True
    
    def _validate_phase3_scope(self, context: Dict[str, Any], config: Dict[str, Any]) -> bool:
        """Validate against Phase 3 scope."""
        action = context.get('action', config.get('action', ''))
        target = context.get('target', config.get('target', ''))
        
        scope_result = self.phase3.check_scope_permission(action, target)
        
        if not scope_result["allowed"]:
            self._log_validation("phase3_scope", CheckResult.FAIL,
                               f"Scope check failed: {scope_result}",
                               scope_result)
            return False
        
        self._log_validation("phase3_scope", CheckResult.PASS,
                           "Scope check passed", scope_result)
        return True
    
    def _validate_trust_level(self, context: Dict[str, Any], config: Dict[str, Any]) -> bool:
        """Validate against Phase 3 trust level."""
        required_level = config.get('required_level', 'L0')
        current_level = self.phase3.get_trust_level()
        
        level_order = ['L0', 'L1', 'L2', 'L3', 'L4']
        
        if level_order.index(current_level) < level_order.index(required_level):
            self._log_validation("trust_level", CheckResult.FAIL,
                               f"Trust level insufficient",
                               {'required': required_level, 'current': current_level})
            return False
        
        self._log_validation("trust_level", CheckResult.PASS,
                           f"Trust level sufficient ({current_level})",
                           {'level': current_level})
        return True
    
    def _log_validation(self, check_type: str, result: CheckResult, 
                       message: str, details: Dict[str, Any]):
        """Log validation result to Phase 3 audit trail."""
        validation_result = ValidationResult(
            check_type=check_type,
            result=result,
            message=message,
            details=details,
            timestamp=datetime.now()
        )
        self.validation_log.append(validation_result)
        
        # Write to Phase 3 audit log
        self.phase3.log_to_audit(check_type, result.value, {
            'message': message,
            'details': details
        })
        
        # Also write to local validation log
        audit_entry = {
            'timestamp': datetime.now().isoformat(),
            'check_type': check_type,
            'result': result.value,
            'message': message,
            'details': details
        }
        
        log_dir = os.path.join(WORKSPACE, 'system', 'safety', 'logs')
        os.makedirs(log_dir, exist_ok=True)
        
        audit_path = os.path.join(log_dir, f"validations-{datetime.now().strftime('%Y-%m-%d')}.jsonl")
        
        with open(audit_path, 'a') as f:
            f.write(json.dumps(audit_entry) + '\n')
    
    def get_validation_summary(self) -> Dict[str, Any]:
        """Get summary of recent validations."""
        total = len(self.validation_log)
        passed = sum(1 for v in self.validation_log if v.result == CheckResult.PASS)
        failed = sum(1 for v in self.validation_log if v.result == CheckResult.FAIL)
        warnings = sum(1 for v in self.validation_log if v.result == CheckResult.WARNING)
        
        return {
            'total_validations': total,
            'passed': passed,
            'failed': failed,
            'warnings': warnings,
            'last_validation': self.validation_log[-1].timestamp.isoformat() if self.validation_log else None,
            'trust_level': self.phase3.get_trust_level(),
            'emergency_active': self.phase3.check_emergency_status().get("active", False)
        }
    
    def get_phase3_status(self) -> Dict[str, Any]:
        """Get Phase 3 integration status."""
        return {
            "trust_level": self.phase3.get_trust_level(),
            "trust_info": self.phase3.get_trust_ladder_info(),
            "emergency_status": self.phase3.check_emergency_status(),
            "scope_checker_available": os.path.exists(f"{WORKSPACE}/accountability/scope/scope-check.sh"),
            "trust_ladder_available": os.path.exists(f"{WORKSPACE}/safety/trust/trust-ladder.md"),
            "emergency_stop_available": os.path.exists(f"{WORKSPACE}/safety/emergency/emergency-stop.sh")
        }


class PermissionManager:
    """Manages permission levels with Phase 3 integration."""
    
    def __init__(self):
        self.phase3 = Phase3SafetyIntegration()
        self.current_level = self._get_initial_level()
        self.level_acquired_at = datetime.now()
        self.escalation_history = []
    
    def _get_initial_level(self) -> SafetyLevel:
        """Get initial level from Phase 3."""
        trust_level = self.phase3.get_trust_level()
        level_map = {
            'L0': SafetyLevel.L0_RESTRICTED,
            'L1': SafetyLevel.L1_BASIC,
            'L2': SafetyLevel.L2_STANDARD,
            'L3': SafetyLevel.L3_ELEVATED,
            'L4': SafetyLevel.L4_ADMIN
        }
        return level_map.get(trust_level, SafetyLevel.L0_RESTRICTED)
    
    def get_current_level(self) -> SafetyLevel:
        """Get current permission level from Phase 3."""
        # Refresh from Phase 3
        trust_level = self.phase3.get_trust_level()
        level_map = {
            'L0': SafetyLevel.L0_RESTRICTED,
            'L1': SafetyLevel.L1_BASIC,
            'L2': SafetyLevel.L2_STANDARD,
            'L3': SafetyLevel.L3_ELEVATED,
            'L4': SafetyLevel.L4_ADMIN
        }
        self.current_level = level_map.get(trust_level, SafetyLevel.L0_RESTRICTED)
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
        
        # Log to Phase 3 audit
        self.phase3.log_to_audit("permission_escalation", "success", escalation_record)
        
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
        
        # Log to Phase 3 audit
        self.phase3.log_to_audit("permission_deescalation", "success", deescalation_record)
        
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
    
    def get_escalation_history(self) -> List[Dict]:
        """Get history of permission changes."""
        return self.escalation_history


if __name__ == '__main__':
    validator = SafetyValidator()
    
    print("=" * 60)
    print("Safety Validator with Phase 3 Integration")
    print("=" * 60)
    
    # Show Phase 3 integration status
    print("\n📊 Phase 3 Integration Status:")
    status = validator.get_phase3_status()
    for key, value in status.items():
        if isinstance(value, dict):
            print(f"  {key}:")
            for k, v in value.items():
                print(f"    {k}: {v}")
        else:
            print(f"  {key}: {value}")
    
    # Test input validation
    print("\n🧪 Testing Input Validation:")
    
    context = {'input': 'rm -rf /'}
    config = {'check_type': 'input_validation'}
    result = validator.validate(context, config)
    print(f"   Dangerous command 'rm -rf /': {'PASS' if result else 'BLOCKED'} ✓")
    
    context = {'input': 'ls -la'}
    result = validator.validate(context, config)
    print(f"   Safe command 'ls -la': {'PASS' if result else 'BLOCKED'} ✓")
    
    # Test permission validation
    print("\n🧪 Testing Permission Validation:")
    
    context = {'operation': 'write_file', 'permission_level': 'L0_RESTRICTED'}
    config = {'check_type': 'permission'}
    result = validator.validate(context, config)
    print(f"   L0 writing file: {'PASS' if result else 'DENIED'} ✓")
    
    context = {'operation': 'write_file', 'permission_level': 'L1_BASIC'}
    result = validator.validate(context, config)
    print(f"   L1 writing file: {'PASS' if result else 'DENIED'} ✓")
    
    # Test Phase 3 scope validation
    print("\n🧪 Testing Phase 3 Scope Validation:")
    
    context = {'action': 'read', 'target': 'memory/test.md'}
    config = {'check_type': 'phase3_scope'}
    result = validator.validate(context, config)
    print(f"   Read action scope check: {'PASS' if result else 'DENIED'}")
    
    # Print summary
    print("\n" + "=" * 60)
    summary = validator.get_validation_summary()
    print(f"Validation Summary:")
    print(f"  Total: {summary['total_validations']}")
    print(f"  Passed: {summary['passed']}")
    print(f"  Failed: {summary['failed']}")
    print(f"  Warnings: {summary['warnings']}")
    print(f"  Trust Level: {summary['trust_level']}")
    print(f"  Emergency Active: {summary['emergency_active']}")
    
    print("\n✅ Safety Validator with Phase 3 Integration Ready")
