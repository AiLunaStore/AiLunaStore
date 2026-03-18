# Session Management Protocol

## Purpose
Ensure continuity and memory preservation across session boundaries when `/new`, `/stop`, `/reset` commands are used.

## Problem
When user issues `/new`, `/stop`, or `/reset` commands:
1. Current session context is lost
2. Orchestrator starts fresh
3. Recent conversation history disappears from immediate context
4. Risk of losing important decisions or instructions

## Solution: Three-Layer Memory Integration

### Immediate Actions on Session Commands
1. **Detect session termination command** (`/new`, `/stop`, `/reset`)
2. **Quick summary to episodic memory** - Write key points to `memory/YYYY-MM-DD.md`
3. **Flag important items** - Mark decisions, instructions, TODOs
4. **Prepare for next session** - Ensure memory files are up to date

### Session Startup Routine (Enhanced)
When new session starts:
1. **Read today's episodic memory** (`memory/YYYY-MM-DD.md`)
2. **Read yesterday's episodic memory** (for context)
3. **Check for "session continuation" flags** in memory
4. **Resume from last significant point**

### Specific Protocols

#### `/new` Command
**Before session ends:**
1. Write "Session ended via /new command" to episodic memory
2. Summarize last 5-10 minutes of conversation
3. Note any pending tasks or decisions
4. Update `MEMORY.md` if significant learning occurred

**New session startup:**
1. Read the summary from previous session
2. Check if conversation needs to continue
3. Reference: "As we were discussing before /new..."

#### `/stop` Command  
**Before session ends:**
1. Write "Session stopped via /stop command"
2. More comprehensive summary (last 15-30 minutes)
3. Document all decisions and action items
4. Update relevant knowledge/skills files

**Next interaction:**
1. Full context recovery from memory
2. "Welcome back. Before we stopped, we were discussing..."

#### `/reset` Command
**Before reset:**
1. Write "Context reset via /reset command"
2. Document reason for reset if known
3. Save critical information that shouldn't be lost
4. Note: "User requested fresh context"

**After reset:**
1. Acknowledge fresh start
2. Reference memory if needed: "According to my records..."
3. Don't assume continuity unless user references it

## Implementation

### Memory Markers
Use special markers in episodic memory:
```
--- SESSION BOUNDARY ---
Command: /new
Time: 2026-03-15 23:08 PDT
Summary: Discussed orchestrator efficiency, memory system, session management
Pending: Add orchestrator efficiency guidelines to docs
---
```

### Quick Summary Template
```
## Session End Summary
- **Command:** [ /new | /stop | /reset ]
- **Time:** [timestamp]
- **Last Topics:** [bullet points]
- **Decisions:** [key decisions made]
- **Actions Needed:** [TODOs]
- **Continuation Point:** [where to resume]
```

### Orchestrator Behavior
1. **Be proactive about memory** - Write frequently during conversation
2. **Anticipate session end** - If conversation is wrapping up, prepare summary
3. **Use references** - "This is documented in memory/2026-03-15.md#session-xyz"
4. **Recover gracefully** - "I see we were discussing X before the /new command"

## Examples

### Before `/new`:
**User:** "Yeah when I type /new or /stop make sure you remember what happened before a new session"

**Orchestrator actions:**
1. Write to `memory/2026-03-15.md`:
   ```
   **23:08** - User instruction: "When I type /new or /stop make sure you remember what happened before a new session"
   - Need to implement session management protocol
   - Ensure continuity across session boundaries
   - Document in skills/operational/session-management.md
   ```
2. Create this skill file
3. Update system to handle session commands

### After `/new`:
**Orchestrator:** "Welcome back. Before the /new command, you asked me to ensure memory continuity across sessions. I've implemented a session management protocol documented in `skills/operational/session-management.md`. What would you like to work on next?"

## Integration with Three-Layer Memory

### Episodic Memory
- Raw session logs with boundary markers
- Quick summaries at session end
- Continuation points

### Semantic Memory  
- `knowledge/concepts/session-continuity.md`
- `knowledge/systems/session-management.md`
- General principles and patterns

### Procedural Memory (this file)
- Specific protocols for handling session commands
- Step-by-step procedures
- Templates and examples

## Quality Checks
1. **Test session transitions** - Simulate /new, /stop, /reset
2. **Verify memory persistence** - Ensure information survives
3. **User confirmation** - "Does this match what we were discussing?"
4. **Continuous improvement** - Refine based on actual usage

## Success Metrics
1. **Continuity accuracy** - Correctly resume conversations
2. **Memory completeness** - No important information lost
3. **User satisfaction** - Feels like continuous interaction
4. **Efficiency** - Quick recovery without re-explaining

## Related Files
- `AGENTS.md` - Session startup routine
- `memory/CONSOLIDATION.md` - Memory maintenance
- `delegation/templates/triage-template.md` - Quick decision making
- `JOB.md` - Team member responsibilities

## Last Updated
2026-03-15 - Created in response to user request for session continuity