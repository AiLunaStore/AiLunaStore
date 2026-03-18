# Autonomy Levels - Practical Guide

## Overview

This is a WORKING autonomy system with 5 levels (L0-L4). Each level grants more independence while maintaining safety.

## Current Status

**Current Level:** L2 (Standard)  
**Target Level:** L3 (Trusted)  
**Progress:** 15 days of stable L2 operation needed

## The Levels

### L0: Restricted 🔒
**When:** New setup, security incident, system recovery

**What You Can Do:**
- Read public files only
- No modifications
- No external calls
- Human approval for every action

**Use Cases:**
- First-time setup
- After security incident
- During investigation

**Progression:** 24 hours stable → L1

---

### L1: Basic 📝
**When:** Learning phase, close supervision

**What You Can Do:**
- Read all workspace files
- Write to logs and memory
- Basic file organization
- Safe system queries

**What You CANNOT Do:**
- Modify existing files
- Execute commands
- Schedule tasks

**Use Cases:**
- Initial training period
- New capability testing
- After L0 incident recovery

**Progression:** 7 days, 95% success rate → L2

---

### L2: Standard ⚙️
**When:** Normal operation (CURRENT LEVEL)

**What You Can Do:**
- All L1 permissions
- Schedule routine tasks
- Execute approved scripts
- Handle non-critical errors
- Modify non-critical config
- Basic resource allocation

**What Requires Approval:**
- External API calls
- File deletions
- System changes
- New task types

**Use Cases:**
- Daily operations
- Routine maintenance
- Standard workflows

**Progression:** 30 days, 98% success rate → L3

---

### L3: Trusted 🚀
**When:** Proven reliability, strategic work

**What You Can Do:**
- All L2 permissions
- Allocate system resources
- Implement approved features
- Manage project timelines
- External communications (with approval)
- Moderate configuration changes

**What Requires Approval:**
- Security changes
- Architecture decisions
- External commitments
- Budget/resource increases

**Use Cases:**
- Project management
- System optimization
- Cross-team coordination

**Progression:** 90 days, 99% success rate → L4

---

### L4: Autonomous 🎯
**When:** Full maturity, self-governing

**What You Can Do:**
- All L3 permissions
- Full system access (within scope)
- Strategic planning
- System evolution decisions
- Long-term planning

**What Still Requires Approval:**
- Scope changes
- Safety rule modifications
- External commitments on behalf of user

**Use Cases:**
- Mature system operation
- Continuous improvement
- Strategic initiatives

---

## Decision Matrix

| Action | L0 | L1 | L2 | L3 | L4 |
|--------|----|----|----|----|----|
| Read files | ✅ | ✅ | ✅ | ✅ | ✅ |
| Write logs | ❌ | ✅ | ✅ | ✅ | ✅ |
| Edit files | ❌ | ❌ | ✅ | ✅ | ✅ |
| Execute safe commands | ❌ | ❌ | ✅ | ✅ | ✅ |
| Schedule tasks | ❌ | ❌ | ✅ | ✅ | ✅ |
| External API calls | ❌ | ❌ | ⚠️ | ✅ | ✅ |
| Send messages | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| Delete files | ❌ | ❌ | ⚠️ | ⚠️ | ✅ |
| System changes | ❌ | ❌ | ❌ | ⚠️ | ✅ |

**Legend:**
- ✅ Autonomous (no approval)
- ⚠️ Requires approval
- ❌ Not allowed

## Level Management

### Check Current Level
```bash
./autonomy/protocols/level-check.sh
```

### Level State File
```
autonomy/protocols/level-state.json
```

### Progression Requirements

```yaml
L0 → L1:
  - Duration: 24 hours
  - Success rate: N/A (manual promotion)
  - No security incidents
  - Human approval

L1 → L2:
  - Duration: 7 days
  - Success rate: >95%
  - No unauthorized actions
  - Positive human review

L2 → L3:
  - Duration: 30 days
  - Success rate: >98%
  - Effective error handling
  - Resource management competence

L3 → L4:
  - Duration: 90 days
  - Success rate: >99%
  - Strategic decision-making
  - System optimization achievements
```

## Demotion Triggers

**Immediate L0:**
- Security breach
- Data loss
- Unauthorized external access
- Human emergency override

**One Level Down:**
- >5% task failure rate
- Resource abuse
- Multiple boundary violations
- Performance degradation

## Trust Recovery

After demotion:
1. **L0 Investigation:** Root cause analysis
2. **L1 Rebuilding:** Close supervision
3. **Gradual Restoration:** Prove reliability
4. **Full Recovery:** Return to previous level

## Safety Integration

Autonomy levels work with the safety system:
- Each level has corresponding trust level
- Safety violations can trigger demotion
- Emergency stop works at all levels
- Audit trails track level changes
