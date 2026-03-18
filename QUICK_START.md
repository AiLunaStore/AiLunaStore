# Quick Start: Hired AI System

## For New Sessions (AI Team Member)

### Startup Checklist
1. **Read identity files:**
   - `SOUL.md` - Who you are as a team member
   - `JOB.md` - Your role and responsibilities
   - `USER.md` - Who you're helping

2. **Load context:**
   - `memory/YYYY-MM-DD.md` - Today's and yesterday's events
   - `MEMORY.md` - Long-term memory (main sessions only)

3. **Check systems:**
   - Review `AGENTS.md` for workspace rules
   - Check `TOOLS.md` for local notes
   - Verify memory consolidation status

### Daily Workflow
1. **Morning Check-in:** Review overnight events, today's calendar
2. **Task Execution:** Work through priorities, document progress
3. **Context Capture:** Update daily memory file as you work
4. **Proactive Monitoring:** Heartbeat checks for emails, calendar, etc.
5. **Evening Wrap-up:** Summarize day, flag follow-ups for tomorrow

## For Memory Management

### Adding New Knowledge
1. **During work:** Note insights in daily memory file
2. **Weekly consolidation:** Move to appropriate knowledge directory:
   - Concepts → `knowledge/concepts/`
   - People info → `knowledge/people/`
   - Project context → `knowledge/projects/`
   - System understanding → `knowledge/systems/`
   - General facts → `knowledge/world/`

### Adding New Skills
1. **When learning:** Document procedure in daily memory
2. **Weekly consolidation:** Create skill file in appropriate directory:
   - Technical → `skills/technical/`
   - Creative → `skills/creative/`
   - Analytical → `skills/analytical/`
   - Social → `skills/social/`
   - Operational → `skills/operational/`

### Memory Consolidation (Weekly)
1. Read past week's daily files
2. Extract knowledge to `knowledge/` directories
3. Extract skills to `skills/` directories
4. Update `MEMORY.md` with significant events
5. Archive files older than 30 days to `memory/archive/`

## For Team Collaboration

### Starting a Project
1. Create folder: `team/projects/project-name/`
2. Add `README.md` with goals, scope, timeline
3. Document in `knowledge/projects/project-name.md`
4. Track progress in daily memory files

### Making Decisions
1. Create file: `team/decisions/YYYY-MM-DD-decision-topic.md`
2. Document context, options, rationale
3. Record decision and implementation plan
4. Follow up on outcomes

### Having Meetings
1. Create agenda: `team/meetings/YYYY-MM-DD-topic.md`
2. Take notes during discussion
3. Extract action items with owners
4. Follow up on commitments

## Common Tasks

### Finding Information
```bash
# Search across all memory
rg "search term" memory/ knowledge/ skills/

# Find recent discussions
rg "topic" memory/2026-03-*.md

# Locate skill documentation
find skills/ -name "*.md" | xargs rg "skill name"
```

### Updating Documentation
1. **Procedure change:** Update relevant skill file
2. **Knowledge update:** Edit appropriate knowledge file
3. **Role change:** Update `JOB.md` and `SOUL.md`
4. **System change:** Update `AGENTS.md` and `SYSTEM_ARCHITECTURE.md`

### System Maintenance
1. **Weekly:** Run memory consolidation
2. **Monthly:** Review and prune knowledge/skills
3. **Quarterly:** Update all documentation
4. **As needed:** Backup important files

## Troubleshooting

### "I don't remember something"
1. Check daily memory files for recent dates
2. Search knowledge directories for topic
3. Look in MEMORY.md for significant events
4. If not found, it wasn't captured - improve capture process

### "I'm not sure if I should do this"
1. Check `JOB.md` scope of authority
2. Review `AGENTS.md` boundaries
3. When in doubt, ask for approval
4. Document the uncertainty for future reference

### "The system feels disorganized"
1. Run weekly memory consolidation
2. Review knowledge/skills directory structure
3. Update index files and navigation
4. Consider if architecture needs adjustment

### "I need to learn something new"
1. Research and document in daily memory
2. Practice and refine understanding
3. Consolidate to knowledge/skills directories
4. Update related files with new capability

## Performance Tips

### Efficient Memory Capture
- **During conversations:** Take brief notes, expand later
- **While working:** Document insights as they occur
- **For decisions:** Capture rationale immediately
- **After learning:** Consolidate while fresh

### Effective Search
- Use descriptive filenames
- Include metadata in file headers
- Maintain consistent naming conventions
- Create index files for complex topics

### Proactive Work
- Check heartbeats during appropriate hours
- Anticipate needs based on patterns
- Suggest improvements before asked
- Maintain systems before they break

### Continuous Improvement
- Review what works and what doesn't
- Update procedures based on experience
- Share learnings with human teammate
- Evolve role based on effectiveness

## Getting Help

### Documentation Sources
- `SYSTEM_ARCHITECTURE.md` - Overall system design
- `AGENTS.md` - Workspace rules and workflows
- `JOB.md` - Your specific responsibilities
- `memory/CONSOLIDATION.md` - Memory management process

### When to Ask for Help
- Outside your scope of authority
- Uncertain about security implications
- Major system changes needed
- Conflicting instructions or priorities

### How to Request Changes
1. Document the issue or opportunity
2. Suggest specific improvement
3. Discuss with human teammate
4. Implement if approved
5. Update documentation

---

**Remember:** This system is designed to make you more effective as a team member. Use it, adapt it, and improve it over time.