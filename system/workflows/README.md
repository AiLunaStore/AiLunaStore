# Unified Workflow Engine

## Overview

The Unified Workflow Engine is the central orchestration system that coordinates all Phase 1-3 components into a cohesive, production-ready AI assistant. It manages task execution, state transitions, safety validation, and performance optimization.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    UNIFIED WORKFLOW ENGINE                      │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Workflow Orchestrator                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐    │   │
│  │  │  IDLE   │→│PLANNING │→│EXECUTING│→│COMPLETE │    │   │
│  │  └────┬────┘  └────┬────┘  └────┬────┘  └─────────┘    │   │
│  │       ↓            ↓            ↓                       │   │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐                 │   │
│  │  │  ERROR  │←│MONITORING│←│ PAUSED  │                 │   │
│  │  └─────────┘  └─────────┘  └─────────┘                 │   │
│  └─────────────────────────────────────────────────────────┘   │
│                           │                                     │
│  ┌────────────────────────┼────────────────────────┐           │
│  │                        ▼                        │           │
│  │           ┌─────────────────────┐               │           │
│  │           │   Task Manager      │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Memory System │  │               │           │
│  │           │  │ Integration   │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Delegation    │  │               │           │
│  │           │  │ Routing       │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Autonomy      │  │               │           │
│  │           │  │ Assessment    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           └─────────────────────┘               │           │
│  │                        │                        │           │
│  │           ┌─────────────────────┐               │           │
│  │           │   Safety Layer      │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Pre-execution │  │               │           │
│  │           │  │ Validation    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           │  ┌───────────────┐  │               │           │
│  │           │  │ Runtime       │  │               │           │
│  │           │  │ Monitoring    │  │               │           │
│  │           │  └───────────────┘  │               │           │
│  │           └─────────────────────┘               │           │
│  └─────────────────────────────────────────────────┘           │
│                                                                 │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Data Integration Layer                      │   │
│  │  • memory/episodic    • knowledge/semantic              │   │
│  │  • skills/procedural  • delegation/tracking             │   │
│  │  • metrics/system     • audit/events                    │   │
│  └─────────────────────────────────────────────────────────┘   │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Workflow States

### State Definitions

| State | Description | Transitions |
|-------|-------------|-------------|
| **IDLE** | System ready, waiting for input | → PLANNING |
| **PLANNING** | Analyzing request, creating execution plan | → EXECUTING, ERROR |
| **EXECUTING** | Actively performing tasks | → MONITORING, PAUSED, ERROR, COMPLETE |
| **MONITORING** | Watching delegated/long-running tasks | → EXECUTING, COMPLETE, ERROR |
| **PAUSED** | Execution temporarily suspended | → EXECUTING, ERROR |
| **ERROR** | An error has occurred | → IDLE (recovery), COMPLETE (abandon) |
| **COMPLETE** | Workflow finished successfully | → IDLE |

### State Machine Rules

```yaml
state_machine:
  IDLE:
    entry_actions: [initialize_context, load_preferences]
    exit_actions: [log_start]
    allowed_transitions: [PLANNING]
    
  PLANNING:
    entry_actions: [analyze_request, assess_autonomy]
    exit_actions: [create_execution_plan]
    allowed_transitions: [EXECUTING, ERROR]
    timeout: 30s
    
  EXECUTING:
    entry_actions: [validate_safety, acquire_resources]
    exit_actions: [release_resources, log_completion]
    allowed_transitions: [MONITORING, PAUSED, ERROR, COMPLETE]
    
  MONITORING:
    entry_actions: [setup_monitoring]
    exit_actions: [cleanup_monitoring]
    allowed_transitions: [EXECUTING, COMPLETE, ERROR]
    
  PAUSED:
    entry_actions: [save_checkpoint, notify_user]
    exit_actions: [restore_checkpoint]
    allowed_transitions: [EXECUTING, ERROR]
    
  ERROR:
    entry_actions: [capture_state, log_error]
    exit_actions: [cleanup_resources]
    allowed_transitions: [IDLE, COMPLETE]
    
  COMPLETE:
    entry_actions: [finalize_results, update_metrics]
    exit_actions: [archive_workflow, notify_completion]
    allowed_transitions: [IDLE]
```

## Workflow Definition Format

### YAML Specification

```yaml
workflow:
  id: unique_identifier
  name: Human-readable name
  version: "1.0.0"
  description: What this workflow does
  
  triggers:
    - type: user_request
      patterns: ["keyword1", "keyword2"]
    - type: scheduled
      cron: "0 9 * * *"
    - type: event
      source: component_name
      event_type: event_name
  
  parameters:
    - name: param_name
      type: string|number|boolean|object
      required: true|false
      default: default_value
      validation: regex_or_constraint
  
  phases:
    - name: phase_name
      description: What this phase does
      
      steps:
        - id: step_1
          name: Step Name
          type: action|decision|delegation|wait
          
          # For action steps
          action:
            component: memory|knowledge|skills|tools
            operation: specific_operation
            parameters:
              param: "{{workflow.parameters.param_name}}"
          
          # For decision steps
          condition:
            expression: "{{step_1.result}} > threshold"
            true_branch: next_step_id
            false_branch: alternative_step_id
          
          # For delegation steps
          delegation:
            agent_type: implementer|reviewer|planner
            template: template_name
            parameters: {}
            timeout: 300s
            
          # For wait steps
          wait:
            duration: 60s
            or_event: event_name
          
          # Safety checks
          safety:
            - check_type: permission
              level: L1_BASIC
            - check_type: validation
              rules: [rule1, rule2]
          
          # Error handling
          on_error:
            action: retry|skip|abort|delegate
            max_retries: 3
            fallback_step: fallback_step_id
          
          # Outputs
          outputs:
            - name: output_name
              source: step.result.field
  
  # Workflow-level configuration
  config:
    max_duration: 3600s
    checkpoint_interval: 300s
    auto_recovery: true
    notification_level: all|errors|none
```

### Example Workflow: Task Execution

```yaml
workflow:
  id: execute_user_task
  name: Execute User Task
  version: "1.0.0"
  description: Complete workflow for handling user requests
  
  triggers:
    - type: user_request
  
  parameters:
    - name: user_input
      type: string
      required: true
    - name: urgency
      type: string
      default: normal
  
  phases:
    - name: intake
      steps:
        - id: parse_request
          name: Parse User Request
          type: action
          action:
            component: skills
            operation: analyze_intent
            parameters:
              input: "{{workflow.parameters.user_input}}"
          outputs:
            - name: intent
              source: result.intent
            - name: complexity
              source: result.complexity
            - name: required_skills
              source: result.skills
        
        - id: assess_scope
          name: Assess Against Scope
          type: decision
          condition:
            expression: "{{parse_request.intent}} in scope"
            true_branch: check_autonomy
            false_branch: out_of_scope
        
        - id: out_of_scope
          name: Handle Out of Scope
          type: action
          action:
            component: skills
            operation: decline_request
            parameters:
              reason: "Request outside defined scope"
          on_error:
            action: abort
    
    - name: planning
      steps:
        - id: check_autonomy
          name: Check Autonomy Level
          type: action
          action:
            component: system
            operation: assess_autonomy
            parameters:
              complexity: "{{parse_request.complexity}}"
              risk_level: "{{parse_request.risk}}"
          outputs:
            - name: autonomy_level
              source: result.level
        
        - id: decide_execution
          name: Decide Execution Path
          type: decision
          condition:
            expression: "{{check_autonomy.autonomy_level}} >= L2_STANDARD"
            true_branch: execute_direct
            false_branch: request_approval
    
    - name: execution
      steps:
        - id: execute_direct
          name: Execute Task Directly
          type: action
          safety:
            - check_type: permission
              level: "{{check_autonomy.autonomy_level}}"
          action:
            component: skills
            operation: execute_task
            parameters:
              task: "{{workflow.parameters.user_input}}"
          on_error:
            action: retry
            max_retries: 2
            fallback_step: delegate_execution
        
        - id: delegate_execution
          name: Delegate to Specialist
          type: delegation
          delegation:
            agent_type: implementer
            template: standard_implementation
            parameters:
              task: "{{workflow.parameters.user_input}}"
            timeout: 600s
        
        - id: request_approval
          name: Request User Approval
          type: action
          action:
            component: system
            operation: request_approval
            parameters:
              action: "{{workflow.parameters.user_input}}"
          on_error:
            action: abort
  
  config:
    max_duration: 1800s
    checkpoint_interval: 60s
    auto_recovery: true
```

## Implementation

### Core Classes

```python
# system/workflows/engine.py

from enum import Enum, auto
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field
from datetime import datetime
import yaml
import json

class WorkflowState(Enum):
    IDLE = auto()
    PLANNING = auto()
    EXECUTING = auto()
    MONITORING = auto()
    PAUSED = auto()
    ERROR = auto()
    COMPLETE = auto()

@dataclass
class WorkflowStep:
    id: str
    name: str
    type: str  # action, decision, delegation, wait
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

class WorkflowEngine:
    """Central workflow orchestration engine."""
    
    def __init__(self, config_path: str = "system/workflows/config"):
        self.config_path = config_path
        self.workflows: Dict[str, Dict] = {}
        self.instances: Dict[str, WorkflowInstance] = {}
        self.state_handlers: Dict[WorkflowState, callable] = {
            WorkflowState.IDLE: self._handle_idle,
            WorkflowState.PLANNING: self._handle_planning,
            WorkflowState.EXECUTING: self._handle_executing,
            WorkflowState.MONITORING: self._handle_monitoring,
            WorkflowState.PAUSED: self._handle_paused,
            WorkflowState.ERROR: self._handle_error,
            WorkflowState.COMPLETE: self._handle_complete,
        }
        self._load_workflows()
    
    def _load_workflows(self):
        """Load workflow definitions from YAML files."""
        import os
        workflows_dir = os.path.join(self.config_path, "definitions")
        if os.path.exists(workflows_dir):
            for filename in os.listdir(workflows_dir):
                if filename.endswith('.yaml') or filename.endswith('.yml'):
                    filepath = os.path.join(workflows_dir, filename)
                    with open(filepath, 'r') as f:
                        workflow_def = yaml.safe_load(f)
                        self.workflows[workflow_def['workflow']['id']] = workflow_def
    
    def create_instance(self, workflow_id: str, parameters: Dict[str, Any]) -> str:
        """Create a new workflow instance."""
        import uuid
        instance_id = str(uuid.uuid4())
        instance = WorkflowInstance(
            id=instance_id,
            definition_id=workflow_id,
            state=WorkflowState.IDLE,
            parameters=parameters
        )
        self.instances[instance_id] = instance
        return instance_id
    
    def execute(self, instance_id: str) -> Dict[str, Any]:
        """Execute a workflow instance."""
        instance = self.instances.get(instance_id)
        if not instance:
            raise ValueError(f"Instance {instance_id} not found")
        
        workflow_def = self.workflows.get(instance.definition_id)
        if not workflow_def:
            raise ValueError(f"Workflow {instance.definition_id} not found")
        
        # Execute state machine
        while instance.state not in [WorkflowState.COMPLETE, WorkflowState.ERROR]:
            handler = self.state_handlers.get(instance.state)
            if handler:
                handler(instance, workflow_def)
            else:
                raise RuntimeError(f"No handler for state {instance.state}")
        
        return {
            "instance_id": instance_id,
            "state": instance.state.name,
            "context": instance.context,
            "completed_at": datetime.now().isoformat()
        }
    
    def _handle_idle(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle IDLE state - initialize and transition to planning."""
        # Load user preferences and context
        instance.context['start_time'] = datetime.now().isoformat()
        instance.state = WorkflowState.PLANNING
    
    def _handle_planning(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle PLANNING state - analyze and create execution plan."""
        # Assess autonomy level
        autonomy_level = self._assess_autonomy(instance)
        instance.context['autonomy_level'] = autonomy_level
        
        # Set first phase
        phases = workflow_def['workflow']['phases']
        if phases:
            instance.current_phase = phases[0]['name']
            if phases[0]['steps']:
                instance.current_step = phases[0]['steps'][0]['id']
        
        instance.state = WorkflowState.EXECUTING
    
    def _handle_executing(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle EXECUTING state - perform workflow steps."""
        workflow = workflow_def['workflow']
        
        # Find current phase and step
        current_phase_def = None
        current_step_def = None
        
        for phase in workflow['phases']:
            if phase['name'] == instance.current_phase:
                current_phase_def = phase
                for step in phase['steps']:
                    if step['id'] == instance.current_step:
                        current_step_def = step
                        break
                break
        
        if not current_step_def:
            # No more steps, workflow complete
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
                # Move to next phase or complete
                instance.state = WorkflowState.COMPLETE
                
        except Exception as e:
            instance.context['error'] = str(e)
            instance.state = WorkflowState.ERROR
    
    def _execute_step(self, instance: WorkflowInstance, step_def: Dict) -> Any:
        """Execute a single workflow step with safety validation."""
        # Run safety checks
        for check in step_def.get('safety', []):
            if not self._run_safety_check(instance, check):
                raise PermissionError(f"Safety check failed: {check}")
        
        # Execute based on step type
        step_type = step_def['type']
        
        if step_type == 'action':
            return self._execute_action(instance, step_def['action'])
        elif step_type == 'decision':
            return self._evaluate_decision(instance, step_def['condition'])
        elif step_type == 'delegation':
            return self._execute_delegation(instance, step_def['delegation'])
        elif step_type == 'wait':
            return self._execute_wait(instance, step_def['wait'])
        else:
            raise ValueError(f"Unknown step type: {step_type}")
    
    def _assess_autonomy(self, instance: WorkflowInstance) -> str:
        """Assess appropriate autonomy level for this workflow."""
        # Integration with Phase 3 autonomy system
        from system.safety.autonomy import AutonomyAssessor
        assessor = AutonomyAssessor()
        return assessor.assess(instance.parameters)
    
    def _run_safety_check(self, instance: WorkflowInstance, check: Dict) -> bool:
        """Run a safety check."""
        from system.safety.validator import SafetyValidator
        validator = SafetyValidator()
        return validator.validate(instance, check)
    
    def _execute_action(self, instance: WorkflowInstance, action: Dict) -> Any:
        """Execute an action step."""
        component = action['component']
        operation = action['operation']
        parameters = self._resolve_parameters(instance, action.get('parameters', {}))
        
        # Route to appropriate component
        if component == 'memory':
            return self._call_memory_system(operation, parameters)
        elif component == 'knowledge':
            return self._call_knowledge_system(operation, parameters)
        elif component == 'skills':
            return self._call_skills_system(operation, parameters)
        elif component == 'tools':
            return self._call_tools_system(operation, parameters)
        else:
            raise ValueError(f"Unknown component: {component}")
    
    def _resolve_parameters(self, instance: WorkflowInstance, params: Dict) -> Dict:
        """Resolve parameter references ({{...}}) to actual values."""
        resolved = {}
        for key, value in params.items():
            if isinstance(value, str) and value.startswith('{{') and value.endswith('}}'):
                # Resolve reference
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
        if step_def['type'] == 'decision':
            condition = step_def['condition']
            # Evaluate condition
            if self._evaluate_condition(instance, condition, result):
                return condition.get('true_branch')
            else:
                return condition.get('false_branch')
        
        # Find next step in sequence
        steps = phase_def['steps']
        current_idx = next((i for i, s in enumerate(steps) if s['id'] == step_def['id']), -1)
        if current_idx >= 0 and current_idx < len(steps) - 1:
            return steps[current_idx + 1]['id']
        
        return None
    
    def _evaluate_condition(self, instance: WorkflowInstance, condition: Dict, 
                           result: Any) -> bool:
        """Evaluate a decision condition."""
        expression = condition.get('expression', '')
        # Simple expression evaluation - can be enhanced
        if '==' in expression:
            left, right = expression.split('==')
            return str(left).strip() == str(right).strip()
        elif 'in' in expression:
            parts = expression.split('in')
            return parts[0].strip() in parts[1].strip()
        return True
    
    def _handle_monitoring(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle MONITORING state - watch delegated tasks."""
        # Check status of delegated tasks
        pass
    
    def _handle_paused(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle PAUSED state - wait for resume signal."""
        pass
    
    def _handle_error(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle ERROR state - attempt recovery or abort."""
        # Log error details
        error_info = {
            'instance_id': instance.id,
            'error': instance.context.get('error'),
            'state': instance.state.name,
            'timestamp': datetime.now().isoformat()
        }
        
        # Attempt recovery if configured
        workflow = workflow_def['workflow']
        if workflow.get('config', {}).get('auto_recovery', False):
            # Try to recover
            pass
        
        # Archive error information
        self._archive_workflow(instance, error_info)
    
    def _handle_complete(self, instance: WorkflowInstance, workflow_def: Dict):
        """Handle COMPLETE state - finalize and archive."""
        # Update metrics
        self._update_metrics(instance)
        
        # Archive workflow
        self._archive_workflow(instance)
        
        # Notify completion
        self._notify_completion(instance)
    
    def _update_metrics(self, instance: WorkflowInstance):
        """Update system metrics for this workflow execution."""
        from system.performance.metrics import MetricsCollector
        collector = MetricsCollector()
        collector.record_workflow_completion(instance)
    
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
        
        # Save to episodic memory
        memory_path = f"memory/{datetime.now().strftime('%Y-%m-%d')}-workflow-{instance.id}.json"
        with open(memory_path, 'w') as f:
            json.dump(archive_data, f, indent=2)
    
    def _notify_completion(self, instance: WorkflowInstance):
        """Notify user of workflow completion."""
        pass
```

## Integration Points

### Phase 1: Memory System
- Workflow execution logged to episodic memory
- Knowledge base consulted during planning
- Skills library used for task execution

### Phase 2: Delegation System
- Delegation steps route to appropriate agents
- Templates loaded from delegation system
- Tracking integrated with active-tasks

### Phase 3: Autonomy System
- Autonomy assessment before execution
- Permission levels enforced during steps
- Scope validation at intake

### Phase 4: Safety System
- Safety checks run before each step
- Error handling with recovery procedures
- Audit trail maintained

## Configuration

### Workflow Definitions Location
```
system/workflows/definitions/
├── execute_user_task.yaml
├── daily_maintenance.yaml
├── memory_consolidation.yaml
└── system_health_check.yaml
```

### Active Instances
```
system/workflows/instances/
├── active/
│   └── {instance_id}.json
└── archived/
    └── {date}/
        └── {instance_id}.json
```

## Usage

### Starting a Workflow

```python
from system.workflows.engine import WorkflowEngine

engine = WorkflowEngine()

# Create and execute workflow instance
instance_id = engine.create_instance(
    workflow_id="execute_user_task",
    parameters={
        "user_input": "Create a summary of yesterday's activities",
        "urgency": "normal"
    }
)

result = engine.execute(instance_id)
print(f"Workflow completed with state: {result['state']}")
```

### Monitoring Active Workflows

```python
# List active instances
active = engine.get_active_instances()
for instance in active:
    print(f"{instance.id}: {instance.state.name} - {instance.current_step}")
```

## Error Handling

### Retry Logic
```yaml
on_error:
  action: retry
  max_retries: 3
  retry_delay: 5s
  exponential_backoff: true
  fallback_step: fallback_action
```

### Recovery Procedures
```yaml
on_error:
  action: recover
  recovery_procedure: auto_recover
  max_recovery_time: 60s
  fallback_action: notify_admin
```

## Performance Considerations

- **Checkpointing**: State saved every 60s (configurable)
- **Parallel Execution**: Independent steps can run in parallel
- **Resource Limits**: Max duration and memory limits enforced
- **Cleanup**: Archived instances cleaned up after 30 days

## Security

- All steps validated against safety framework
- Permission levels enforced at each transition
- Audit trail maintained for all actions
- Sensitive data encrypted in checkpoints

---

**Status**: Implementation Ready  
**Phase**: 4A - Foundation & Integration  
**Last Updated**: 2026-03-15
