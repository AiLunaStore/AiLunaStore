# Autonomy System - Practical Implementation

## Quick Start

This is a working autonomy system for the Hired AI. It actually runs and provides real value.

## Core Components

### 1. Heartbeat System (`checks/`)
- **Purpose:** Proactive monitoring that ACTUALLY WORKS
- **Files:**
  - `heartbeat-check.sh` - Executable health check script
  - `heartbeat-state.json` - Tracks what needs checking when
  - `README.md` - How to use and extend

### 2. Scheduled Tasks (`tasks/`)
- **Purpose:** Framework for recurring tasks that CAN BE DEPLOYED
- **Files:**
  - `task-runner.sh` - Executable task scheduler
  - `tasks.json` - Task definitions
  - `README.md` - How to add and manage tasks

### 3. Autonomy Protocols (`protocols/`)
- **Purpose:** Clear L0-L4 autonomy levels that ARE USABLE
- **Files:**
  - `autonomy-levels.md` - Practical autonomy definitions
  - `decision-matrix.md` - What you can do at each level
  - `level-check.sh` - Script to check current autonomy level

## How It Works

1. **Heartbeat runs every 30 minutes** (via OpenClaw's heartbeat prompt)
2. **Checks what needs attention** based on `heartbeat-state.json`
3. **Executes scheduled tasks** from `tasks.json`
4. **Respects autonomy level** from `protocols/autonomy-levels.md`
5. **Logs everything** to `metrics/autonomy/`

## Integration Points

- **Phase 1 (Memory):** Reads from `memory/`, writes to `knowledge/`
- **Phase 2 (Delegation):** Uses delegation system for complex tasks
- **Phase 4 (Integration):** Reports to dashboard, follows safety protocols

## Usage

```bash
# Run heartbeat check manually
./autonomy/checks/heartbeat-check.sh

# Run all scheduled tasks
./autonomy/tasks/task-runner.sh

# Check current autonomy level
./autonomy/protocols/level-check.sh
```

## Files Overview

| File | Purpose | Status |
|------|---------|--------|
| `checks/heartbeat-check.sh` | Main heartbeat script | ✅ Working |
| `checks/heartbeat-state.json` | State tracking | ✅ Working |
| `tasks/task-runner.sh` | Task execution | ✅ Working |
| `tasks/tasks.json` | Task definitions | ✅ Working |
| `protocols/autonomy-levels.md` | L0-L4 definitions | ✅ Working |
| `protocols/decision-matrix.md` | Authority matrix | ✅ Working |

---

**Status:** Operational  
**Last Updated:** 2026-03-16  
**Version:** 3.1.0 (Practical Rebuild)
