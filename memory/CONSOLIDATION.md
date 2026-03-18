# Memory Consolidation Process

## Purpose
This document outlines the process for consolidating episodic memory (daily files) into semantic memory (knowledge/) and procedural memory (skills/).

## Three-Layer Memory System

### Layer 1: Episodic Memory (memory/YYYY-MM-DD.md)
- **What**: Raw daily experiences, conversations, events
- **Format**: Chronological logs with timestamps
- **Retention**: 30 days (archive older files)
- **Purpose**: Capture everything that happens

### Layer 2: Semantic Memory (knowledge/)
- **What**: Structured knowledge, concepts, relationships
- **Format**: Organized by topic (concepts/, people/, etc.)
- **Retention**: Permanent, evolving understanding
- **Purpose**: Store what you've learned and understood

### Layer 3: Procedural Memory (skills/)
- **What**: Skills, workflows, processes, how-to knowledge
- **Format**: Step-by-step procedures with examples
- **Retention**: Permanent, updated as skills evolve
- **Purpose**: Store how you do things

## Weekly Consolidation Process

### Step 1: Review Past Week (Sunday)
1. Read all daily files from the past 7 days
2. Identify patterns, themes, and significant events
3. Note recurring topics and learning moments

### Step 2: Extract Semantic Knowledge
For each significant insight:
1. **Conceptual**: Add to `knowledge/concepts/`
2. **People-related**: Update `knowledge/people/`
3. **Project-related**: Update `knowledge/projects/`
4. **System-related**: Update `knowledge/systems/`
5. **General knowledge**: Add to `knowledge/world/`

### Step 3: Extract Procedural Knowledge
For each skill or process learned:
1. **Technical skills**: Document in `skills/technical/`
2. **Creative processes**: Document in `skills/creative/`
3. **Analytical methods**: Document in `skills/analytical/`
4. **Social patterns**: Document in `skills/social/`
5. **Operational routines**: Document in `skills/operational/`

### Step 4: Update Long-term Memory (MEMORY.md)
1. Add significant life events and decisions
2. Update personal growth and lessons learned
3. Note changes in relationships or circumstances
4. Document major achievements or milestones

### Step 5: Archive and Cleanup
1. Move daily files older than 30 days to `memory/archive/`
2. Remove redundant or trivial entries
3. Update cross-references between files

## Monthly Review (Last Sunday of Month)
1. Review all knowledge and skills directories
2. Prune outdated information
3. Consolidate related concepts
4. Update index files and navigation
5. Backup the entire memory system

## Tools and Automation

### Memory Consolidation Script
Create `scripts/consolidate-memory.sh` to:
1. Generate weekly summary reports
2. Flag files needing attention
3. Create consolidation checklists

### Search and Cross-reference
Use `rg` (ripgrep) to find connections:
```bash
# Find all references to a person
rg "John Doe" memory/ knowledge/

# Find all discussions about a topic
rg "machine learning" memory/ knowledge/
```

## Quality Guidelines

1. **Be selective**: Not everything needs to be consolidated
2. **Add context**: Explain why something matters
3. **Link related content**: Use markdown links
4. **Date entries**: Note when knowledge was acquired
5. **Cite sources**: Reference where information came from
6. **Flag uncertainty**: Mark tentative understanding

## Benefits
- **Better recall**: Organized knowledge is easier to access
- **Pattern recognition**: See connections across time
- **Skill development**: Explicit procedures improve execution
- **Personal growth**: Track learning and evolution
- **Efficiency**: Less time searching, more time doing