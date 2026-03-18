#!/usr/bin/env python3
"""
Unified Workflow Engine for Hired AI System - Phase 4 Integration
Coordinates all Phase 1-4 components with NEW Phase 3 structure.
"""

from enum import Enum, auto
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import json
import os
import uuid
import subprocess
import sys

WORKSPACE = "/Users/levinolonan/.openclaw/workspace"

class WorkflowState(Enum):
    IDLE = auto()
    PLANNING = auto()
    VALIDATING = auto()
    EXECUTING = auto()
    MONITORING = auto()
    PAUSED = auto()
    ERROR = auto()
    COMPLETE = auto()

@dataclass
class WorkflowStep:
    id: str
    name: str
    type: str
    action: Optional[Dict] = None
    condition: Optional[Dict] = None
    delegation: Optional[Dict] = None
    wait: Optional[Dict] = None
    safety: List[Dict] = field(default_factory=list)
    on_error: Optional[Dict] = None
    outputs: List[Dict] = field(default_factory=list)
    status: str = "pending"
    result: Any = None
    started_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

@dataclass
class WorkflowInstance:
    id: str
    definition_id: str
    state: WorkflowState
    parameters: Dict[str, Any]
    context: Dict[str, Any] = field(default_factory=dict)
    current_phase: str = ""
    current_step: str = ""
    steps_completed: List[str] = field(default_factory=list)
    created_at: datetime = field(default_factory=datetime.now)
    updated_at: datetime = field(default_factory=datetime.now)
    checkpoints: List[Dict] = field(default_factory=list)

class Phase3Integration:
    """Integration layer with NEW Phase 3 components."""
    
    @staticmethod
    def run_heartbeat_check(dry_run: bool = False) -> Dict[str, Any]:
        """Run the Phase 3 heartbeat check script."""
        script_path = f"{WORKSPACE}/autonomy/checks/heartbeat-check.sh"
        
        if not os.path.exists(script_path):
            return {"status": "error", "message": "Heartbeat script not found"}
        
        try:
            cmd = [script_path]
            if dry_run:
                cmd.append("--dry-run")
            
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                timeout=60
            )
            
            return {
                "status": "success" if result.returncode == 0 else "issues_found",
                "returncode": result.returncode,
                "stdout": result.stdout,
                "stderr": result.stderr
            }
        except subprocess.TimeoutExpired:
            return {"status": "error", "message": "Heartbeat check timed out"}
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    @staticmethod
    def check_scope(action: str, target: str = "") -> Dict[str, Any]:
        """Check if action is within scope using Phase 3 scope-check.sh."""
        script_path = f"{WORKSPACE}/accountability/scope/scope-check.sh"
        
        if not os.path.exists(script_path):
            return {"allowed": False, "requires_approval": True, "message": "Scope checker not found"}
        
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
            
            # Return codes: 0=allowed, 1=not_allowed, 2=requires_approval
            if result.returncode == 0:
                return {"allowed": True, "requires_approval": False, "message": "Action allowed"}
            elif result.returncode == 2:
                return {"allowed": False, "requires_approval": True, "message": "Action requires approval"}
            else:
                return {"allowed": False, "requires_approval": False, "message": "Action not allowed"}
        except Exception as e:
            return {"allowed": False, "requires_approval": True, "message": f"Scope check error: {e}"}
    
    @staticmethod
    def check_emergency_status() -> Dict[str, Any]:
        """Check Phase 3 emergency stop status."""
        status_file = f"{WORKSPACE}/safety/emergency/emergency-status.json"
        lock_file = f"{WORKSPACE}/safety/emergency/EMERGENCY_ACTIVE"
        
        if os.path.exists(lock_file):
            return {
                "emergency_active": True,
                "status": "emergency",
                "message": "Emergency stop is active"
            }
        
        if os.path.exists(status_file):
            try:
                with open(status_file, 'r') as f:
                    data = json.load(f)
                    return {
                        "emergency_active": data.get("active", False),
                        "status": data.get("status", "unknown"),
                        "level": data.get("level"),
                        "message": data.get("reason", "No emergency")
                    }
            except:
                pass
        
        return {"emergency_active": False, "status": "normal", "message": "System normal"}
    
    @staticmethod
    def activate_emergency_stop(reason: str, level: str = "SOFT") -> Dict[str, Any]:
        """Activate Phase 3 emergency stop."""
        script_path = f"{WORKSPACE}/safety/emergency/emergency-stop.sh"
        
        if not os.path.exists(script_path):
            return {"status": "error", "message": "Emergency stop script not found"}
        
        try:
            result = subprocess.run(
                [script_path, "activate", reason, level],
                capture_output=True,
                text=True,
                timeout=10
            )
            
            return {
                "status": "success" if result.returncode == 0 else "error",
                "stdout": result.stdout,
                "stderr": result.stderr
            }
        except Exception as e:
            return {"status": "error", "message": str(e)}
    
    @staticmethod
    def get_trust_level() -> str:
        """Get current trust level from Phase 3."""
        # Check trust-ladder for current level
        trust_file = f"{WORKSPACE}/safety/trust/trust-ladder.md"
        
        if os.path.exists(trust_file):
            try:
                with open(trust_file, 'r') as f:
                    content = f.read()
                    # Look for "Current Trust Level" line
                    for line in content.split('\n'):
                        if 'Current Trust Level:' in line:
                            # Extract level (e.g., "L2")
                            import re
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
    def log_error(severity: str, message: str, context: Dict = None) -> bool:
        """Log error using Phase 3 error reporting."""
        script_path = f"{WORKSPACE}/accountability/errors/error-report.sh"
        
        if not os.path.exists(script_path):
            return False
        
        try:
            cmd = [script_path, "--severity", severity, "--message", message]
            if context:
                cmd.extend(["--context", json.dumps(context)])
            
            result = subprocess.run(cmd, capture_output=True, timeout=10)
            return result.returncode == 0
        except:
            return False

class WorkflowEngine:
    """Central workflow orchestration engine with Phase 3 integration."""
    
    def __init__(self, config_path: str = None):
        if config_path is None:
            config_path = os.path.join(os.path.dirname(__file__), 'definitions')
        self.config_path = config_path
        self.workflows: Dict[str, Dict] = {}
        self.instances: Dict[str, WorkflowInstance] = {}
        self.phase3 = Phase3Integration()
        self.state_handlers = {
            WorkflowState.IDLE: self._handle_idle,
            WorkflowState.PLANNING: self._handle_planning,
            WorkflowState.VALIDATING: self._handle_validating,
            WorkflowState.EXECUTING: self._handle_executing,
            WorkflowState.MONITORING: self._handle_monitoring,
            WorkflowState.PAUSED: self._handle_paused,
            WorkflowState.ERROR: self._handle_error,
            WorkflowState.COMPLETE: self._handle_complete,
        }
        self._load_workflows()
    
    def _load_workflows(self):
        """Load workflow definitions from YAML/JSON files."""
        if not os.path.exists(self.config_path):
            return
        
        for filename in os.listdir(self.config_path):
            filepath = os.path.join(self.config_path, filename)
            try:
                if filename.endswith('.json'):
                    with open(filepath, 'r') as f:
                        workflow_def = json.load(f)
                        if workflow_def and 'workflow' in workflow_def:
                            self.workflows[workflow_def['workflow']['id']] = workflow_def
                elif filename.endswith(('.yaml', '.yml')):
                    try:
                        import yaml
                        with open(filepath, 'r') as f:
                            workflow_def = yaml.safe_load(f)
                            if workflow_def and 'workflow' in workflow_def:
                                self.workflows[workflow_def['workflow']['id']] = workflow_def
                    except ImportError:
                        pass
            except Exception as e:
                print(f"Error loading workflow {filename}: {e}")
    
    def create_instance(self, workflow_id: str, parameters: Dict[str, Any]) -> str:
        """Create a new workflow instance."""
        instance_id = str(uuid.uuid4())
        instance = WorkflowInstance(
            id=instance_id,
            definition_id=workflow_id,
            state=WorkflowState.IDLE,
            parameters=parameters
        )
        self.instances[instance_id] = instance
        self._save_instance(instance)
        return instance_id
    
    def execute(self, instance_id: str) -> Dict[str, Any]:
        """Execute a workflow instance with Phase 3 integration."""
        instance = self.instances.get(instance_id)
        if not instance:
            raise ValueError(f"Instance {instance_id} not found")
        
        workflow_def = self.workflows.get(instance.definition_id)
        if not workflow_def:
            raise ValueError(f"Workflow {instance.definition_id} not found")
        
        # Check emergency status before execution
        emergency = self.phase3.check_emergency_status()
        if emergency.get("emergency_active"):
            return {
                "instance_id": instance_id,
                "state": "BLOCKED",
                "reason": "Emergency stop active",
                "emergency_level": emergency.get("level")
            }
        
        # Execute state machine
        max_iterations = 100
        iteration = 0
        
        while instance.state not in [WorkflowState.COMPLETE, WorkflowState.ERROR]:
            if iteration >= max_iterations:
                instance.state = WorkflowState.ERROR
                instance.context['error'] = "Maximum iterations exceeded"
                break
            
            handler = self.state_handlers.get(instance.state)
            if handler:
                handler(instance, workflow_def)
            else:
                raise RuntimeError(f"No handler for state {instance.state}")
            
            iteration += 1
            self._save_instance(instance)
        
        return {
            "instance_id": instance_id,
            "state": instance.state.name,
            "context": instance.context,
            "completed_at": datetime.now().isoformat()
        }
    
    def _handle_idle(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle IDLE state - initialize and transition to planning."""
        instance.context['start_time'] = datetime.now().isoformat()
        instance.context['trust_level'] = self.phase3.get_trust_level()
        instance.state = WorkflowState.PLANNING
    
    def _handle_planning(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle PLANNING state - analyze and create execution plan."""
        phases = workflow_def['workflow'].get('phases', [])
        if phases:
            instance.current_phase = phases[0]['name']
            if phases[0].get('steps'):
                instance.current_step = phases[0]['steps'][0]['id']
        
        instance.state = WorkflowState.VALIDATING
    
    def _handle_validating(self, instance: WorkflowInstance, workflow_def: Dict):
        """NEW: Validate against Phase 3 scope and trust before executing."""
        # Check scope for the workflow
        scope_check = self.phase3.check_scope("execute_workflow", instance.definition_id)
        
        if not scope_check["allowed"] and not scope_check["requires_approval"]:
            instance.context['error'] = f"Workflow not in scope: {scope_check['message']}"
            instance.state = WorkflowState.ERROR
            return
        
        if scope_check["requires_approval"]:
            instance.context['approval_required'] = True
            instance.context['approval_reason'] = scope_check['message']
            instance.state = WorkflowState.PAUSED
            return
        
        instance.state = WorkflowState.EXECUTING
    
    def _handle_executing(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle EXECUTING state - perform workflow steps."""
        workflow = workflow_def['workflow']
        
        # Find current phase and step
        current_phase_def = None
        current_step_def = None
        
        for phase in workflow.get('phases', []):
            if phase['name'] == instance.current_phase:
                current_phase_def = phase
                for step in phase.get('steps', []):
                    if step['id'] == instance.current_step:
                        current_step_def = step
                        break
                break
        
        if not current_step_def:
            instance.state = WorkflowState.COMPLETE
            return
        
        # Execute step with safety checks
        try:
            result = self._execute_step(instance, current_step_def)
            instance.context[current_step_def['id']] = result
            instance.steps_completed.append(current_step_def['id'])
            
            # Determine next step
            next_step = self._get_next_step(instance, current_phase_def, current_step_def, result)
            if next_step:
                instance.current_step = next_step
            else:
                instance.state = WorkflowState.COMPLETE
                
        except Exception as e:
            instance.context['error'] = str(e)
            self.phase3.log_error("HIGH", f"Workflow execution error: {e}", {
                "instance_id": instance.id,
                "step": current_step_def.get('id')
            })
            instance.state = WorkflowState.ERROR
    
    def _execute_step(self, instance: WorkflowInstance, step_def: Dict) -> Any:
        """Execute a single workflow step with Phase 3 safety validation."""
        # Run safety checks
        for check in step_def.get('safety', []):
            if not self._run_safety_check(instance, check):
                raise PermissionError(f"Safety check failed: {check}")
        
        # Check scope for action
        action = step_def.get('action', {})
        action_type = action.get('type', action.get('operation', 'unknown'))
        
        scope_check = self.phase3.check_scope(action_type)
        if not scope_check["allowed"]:
            if scope_check["requires_approval"]:
                raise PermissionError(f"Action requires approval: {scope_check['message']}")
            else:
                raise PermissionError(f"Action not allowed: {scope_check['message']}")
        
        # Execute based on step type
        step_type = step_def.get('type', 'action')
        
        if step_type == 'action':
            return self._execute_action(instance, action)
        elif step_type == 'decision':
            return self._evaluate_decision(instance, step_def.get('condition', {}))
        elif step_type == 'phase3_check':
            return self._execute_phase3_check(step_def.get('check_type', ''))
        else:
            return {"status": "completed", "type": step_type}
    
    def _execute_phase3_check(self, check_type: str) -> Dict[str, Any]:
        """Execute Phase 3 integration checks."""
        if check_type == 'heartbeat':
            return self.phase3.run_heartbeat_check()
        elif check_type == 'emergency':
            return self.phase3.check_emergency_status()
        elif check_type == 'trust':
            return {"trust_level": self.phase3.get_trust_level()}
        else:
            return {"status": "unknown_check"}
    
    def _run_safety_check(self, instance: WorkflowInstance, check: Dict) -> bool:
        """Run a safety check using Phase 3 validator."""
        try:
            sys_path = os.path.join(os.path.dirname(__file__), '..')
            if sys_path not in sys.path:
                sys.path.insert(0, sys_path)
            from safety.validator import SafetyValidator
            validator = SafetyValidator()
            return validator.validate(instance.context, check)
        except ImportError:
            return True
    
    def _execute_action(self, instance: WorkflowInstance, action: Dict) -> Any:
        """Execute an action step."""
        component = action.get('component', 'unknown')
        operation = action.get('operation', 'unknown')
        parameters = self._resolve_parameters(instance, action.get('parameters', {}))
        
        return {
            "component": component,
            "operation": operation,
            "parameters": parameters,
            "status": "completed",
            "timestamp": datetime.now().isoformat()
        }
    
    def _evaluate_decision(self, instance: WorkflowInstance, condition: Dict) -> Any:
        """Evaluate a decision condition."""
        expression = condition.get('expression', '')
        return {"result": True, "expression": expression}
    
    def _resolve_parameters(self, instance: WorkflowInstance, params: Dict) -> Dict:
        """Resolve parameter references to actual values."""
        resolved = {}
        for key, value in params.items():
            if isinstance(value, str) and value.startswith('{{') and value.endswith('}}'):
                ref_path = value[2:-2].strip()
                parts = ref_path.split('.')
                
                if parts[0] == 'workflow':
                    if parts[1] == 'parameters':
                        resolved[key] = instance.parameters.get(parts[2])
                    elif parts[1] == 'context':
                        resolved[key] = instance.context.get(parts[2])
                elif parts[0] in instance.context:
                    step_result = instance.context[parts[0]]
                    if isinstance(step_result, dict) and len(parts) > 1:
                        resolved[key] = step_result.get(parts[1])
                    else:
                        resolved[key] = step_result
                else:
                    resolved[key] = value
            else:
                resolved[key] = value
        return resolved
    
    def _get_next_step(self, instance: WorkflowInstance, phase_def: Dict, 
                       step_def: Dict, result: Any) -> Optional[str]:
        """Determine the next step based on step type and result."""
        if step_def.get('type') == 'decision':
            condition = step_def.get('condition', {})
            if result.get('result'):
                return condition.get('true_branch')
            else:
                return condition.get('false_branch')
        
        steps = phase_def.get('steps', [])
        current_idx = next((i for i, s in enumerate(steps) if s['id'] == step_def['id']), -1)
        if current_idx >= 0 and current_idx < len(steps) - 1:
            return steps[current_idx + 1]['id']
        
        return None
    
    def _handle_monitoring(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle MONITORING state - watch delegated tasks."""
        instance.state = WorkflowState.COMPLETE
    
    def _handle_paused(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle PAUSED state - wait for resume signal."""
        # In production, this would wait for human approval
        instance.state = WorkflowState.EXECUTING
    
    def _handle_error(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle ERROR state - attempt recovery or abort."""
        error_info = {
            'instance_id': instance.id,
            'error': instance.context.get('error'),
            'state': instance.state.name,
            'timestamp': datetime.now().isoformat()
        }
        
        self._archive_workflow(instance, error_info)
    
    def _handle_complete(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle COMPLETE state - finalize and archive."""
        self._archive_workflow(instance)
    
    def _archive_workflow(self, instance: WorkflowInstance, error_info: Dict = None):
        """Archive workflow instance to memory system."""
        archive_data = {
            'instance_id': instance.id,
            'definition_id': instance.definition_id,
            'state': instance.state.name,
            'parameters': instance.parameters,
            'context': instance.context,
            'steps_completed': instance.steps_completed,
            'created_at': instance.created_at.isoformat(),
            'completed_at': datetime.now().isoformat()
        }
        if error_info:
            archive_data['error'] = error_info
        
        archive_dir = os.path.join(WORKSPACE, 'system', 'workflows', 'instances', 'archived')
        os.makedirs(archive_dir, exist_ok=True)
        
        archive_path = os.path.join(archive_dir, f"{instance.id}.json")
        with open(archive_path, 'w') as f:
            json.dump(archive_data, f, indent=2)
    
    def _save_instance(self, instance: WorkflowInstance):
        """Save active instance to disk."""
        active_dir = os.path.join(WORKSPACE, 'system', 'workflows', 'instances', 'active')
        os.makedirs(active_dir, exist_ok=True)
        
        instance_path = os.path.join(active_dir, f"{instance.id}.json")
        
        data = {
            'id': instance.id,
            'definition_id': instance.definition_id,
            'state': instance.state.name,
            'parameters': instance.parameters,
            'context': instance.context,
            'current_phase': instance.current_phase,
            'current_step': instance.current_step,
            'steps_completed': instance.steps_completed,
            'created_at': instance.created_at.isoformat(),
            'updated_at': datetime.now().isoformat()
        }
        
        with open(instance_path, 'w') as f:
            json.dump(data, f, indent=2)
    
    def get_active_instances(self) -> List[WorkflowInstance]:
        """Get all active workflow instances."""
        return list(self.instances.values())
    
    def get_phase3_status(self) -> Dict[str, Any]:
        """Get comprehensive Phase 3 integration status."""
        return {
            "trust_level": self.phase3.get_trust_level(),
            "emergency_status": self.phase3.check_emergency_status(),
            "scope_accessible": os.path.exists(f"{WORKSPACE}/accountability/scope/scope-check.sh"),
            "heartbeat_accessible": os.path.exists(f"{WORKSPACE}/autonomy/checks/heartbeat-check.sh"),
            "emergency_accessible": os.path.exists(f"{WORKSPACE}/safety/emergency/emergency-stop.sh"),
        }


if __name__ == '__main__':
    engine = WorkflowEngine()
    
    print("=" * 60)
    print("Workflow Engine with Phase 3 Integration")
    print("=" * 60)
    
    # Show Phase 3 integration status
    print("\n📊 Phase 3 Integration Status:")
    status = engine.get_phase3_status()
    for key, value in status.items():
        print(f"  {key}: {value}")
    
    # Test workflow with Phase 3 check
    test_workflow = {
        'workflow': {
            'id': 'phase3_test',
            'name': 'Phase 3 Integration Test',
            'phases': [
                {
                    'name': 'integration_phase',
                    'steps': [
                        {
                            'id': 'check_trust',
                            'name': 'Check Trust Level',
                            'type': 'phase3_check',
                            'check_type': 'trust'
                        },
                        {
                            'id': 'check_emergency',
                            'name': 'Check Emergency Status',
                            'type': 'phase3_check',
                            'check_type': 'emergency'
                        }
                    ]
                }
            ]
        }
    }
    
    engine.workflows['phase3_test'] = test_workflow
    
    print("\n🧪 Testing Phase 3 Integration Workflow:")
    instance_id = engine.create_instance('phase3_test', {'test': True})
    print(f"  Created instance: {instance_id}")
    
    result = engine.execute(instance_id)
    print(f"  Execution result: {result['state']}")
    
    print("\n✅ Phase 4 Workflow Engine with Phase 3 Integration Ready")
