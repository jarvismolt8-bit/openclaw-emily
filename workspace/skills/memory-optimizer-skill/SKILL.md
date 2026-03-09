---
name: memory-optimizer-skill
description: Optimize OpenClaw memory by preventing token bloat, enabling progressive storage, and implementing structured recall. Prevents memory files from growing from 2k to 20k+ tokens.
---

# Memory Optimizer Skill

This skill prevents token bloat in OpenClaw memory files and implements progressive storage patterns for better recall and context management.

## The Problem

Over time, OpenClaw memory files grow uncontrollably:
- Daily logs accumulate without distillation
- MEMORY.md becomes bloated with outdated information  
- Total memory can grow from 2k → 20k+ tokens
- No structured way to recall important information

## The Solution

**Progressive Storage Architecture:**

```
Daily Logs → ## Retain Sections → bank/ Entities → MEMORY.md Core
```

1. **Daily logs** capture raw activity (`memory/YYYY-MM-DD.md`)
2. **## Retain sections** distill key facts from daily logs
3. **bank/ entities** store durable facts about people, places, concepts
4. **MEMORY.md** contains only core, always-relevant information

## When to Use This Skill

- Memory audit (weekly recommended)
- Before/after compaction
- When token counts exceed thresholds
- Setting up new memory structure

## Quick Commands

```bash
# Audit memory sizes
./memory-optimizer.sh --audit

# Compact daily logs (create ## Retain sections)
./memory-optimizer.sh --compact

# Full optimization (audit + compact + report)
./memory-optimizer.sh --optimize

# Archive old logs (>30 days)
./memory-optimizer.sh --archive

# Generate health report
./memory-optimizer.sh --report

# View all options
./memory-optimizer.sh --help
```

## Token Thresholds

| File Type | Healthy | Warning | Critical |
|-----------|---------|---------|----------|
| MEMORY.md | < 2000 | 2000-3000 | > 3000 |
| Daily log | < 1000 | 1000-1500 | > 1500 |
| Total memory | < 15000 | 15000-25000 | > 25000 |

**Action required when:**
- Any file exceeds "Warning" threshold
- Total memory exceeds "Critical" threshold
- Daily logs older than 30 days not archived

## Progressive Storage Pattern

### 1. Daily Logs Structure

Raw daily notes in `memory/YYYY-MM-DD.md`:

```markdown
# Daily Memory - 2026-02-18

## Activity Log
[Raw conversation and activity notes]

## Retain
- W @OpenClaw: Fixed memory compaction issue by updating config
- B @Kevin: Prefers concise responses, technical background
- O(c=0.9) @Kevin: Values efficiency and clean code
```

### 2. ## Retain Section Format

Prefix codes for structured facts:

| Prefix | Meaning | Example |
|--------|---------|---------|
| `W` | World fact (objective) | `W @Server: Running Ubuntu 22.04` |
| `B` | Biographical (user/agent) | `B @Kevin: Software engineer, Manila` |
| `O(c=X)` | Opinion with confidence | `O(c=0.95) @Kevin: Prefers async communication` |
| `S` | Summary/Observation | `S: Project X completed successfully` |

**Confidence levels (c=X):**
- 0.95-1.0: Very certain (explicitly stated multiple times)
- 0.75-0.94: Likely (stated once or inferred strongly)
- 0.50-0.74: Uncertain (single mention, might change)
- < 0.50: Guess (inferred from context)

### 3. Bank/ Folder Structure

```
workspace/
├── memory/
│   ├── 2026-02-18.md          # Daily logs
│   └── archive/               # Archived old logs
├── bank/
│   ├── entities/              # Entity pages
│   │   ├── Kevin.md
│   │   ├── OpenClaw.md
│   │   └── Server.md
│   ├── opinions.md            # Tracked opinions with confidence
│   └── world.md               # Objective facts about the world
└── MEMORY.md                  # Core memory (always loaded)
```

### 4. Entity Pages Format

`bank/entities/Kevin.md`:

```markdown
# Kevin

## Identity
- Name: Kevin
- Location: Manila, Philippines
- Role: User

## Facts
- Software engineer with technical background
- Uses OpenClaw for automation and AI tasks
- Timezone: Asia/Manila (UTC+8)

## Preferences
- Prefers concise responses
- Values efficiency and clean code
- Active in mornings (Philippine time)

## Projects
- Building Emily (OpenClaw agent)
- Cashflow Manager web app
- GOG Skill integration

## Last Updated
2026-02-18
```

### 5. Opinions Tracking

`bank/opinions.md`:

```markdown
# Tracked Opinions

## Kevin

### Communication Preferences
- Statement: "Prefers concise responses (<1500 chars)"
- Confidence: 0.95
- Evidence: 
  - memory/2026-02-10.md#L23
  - memory/2026-02-15.md#L45
- Last Updated: 2026-02-18

### Technical Style
- Statement: "Values clean, efficient code"
- Confidence: 0.90
- Evidence:
  - memory/2026-02-12.md#L12
- Last Updated: 2026-02-15
```

## Integration with OpenClaw

### AGENTS.md Updates

Add to your `AGENTS.md`:

```markdown
## Memory Maintenance Rules

1. **Always use ## Retain sections** in daily logs for key facts
2. **Update entity pages** when learning new facts about @mentions
3. **Track opinions** with confidence levels and evidence
4. **Run optimizer weekly**: `./memory-optimizer.sh --optimize`
5. **Never exceed thresholds** - compact before files get too large

### When Writing Memory:
- Raw notes → Activity Log section
- Key facts → ## Retain section with prefixes (W, B, O, S)
- Entity facts → Update bank/entities/*.md
- Core preferences → Update MEMORY.md
```

### Heartbeat Integration

Add to `HEARTBEAT.md`:

```markdown
## Memory Check (Weekly)

- [ ] Check memory token counts
- [ ] Run: `/root/.openclaw/workspace/skills/memory-optimizer-skill/memory-optimizer.sh --audit`
- [ ] If warning: Run compaction
- [ ] Archive logs older than 30 days
```

### Cron Job (Optional)

Schedule weekly optimization:

```bash
# Add to crontab (runs Sundays at 9 AM)
0 9 * * 0 cd /root/.openclaw/workspace/skills/memory-optimizer-skill && ./memory-optimizer.sh --optimize >> /var/log/memory-optimizer.log 2>&1
```

## Manual Memory Writing Guide

### Writing Daily Logs

```markdown
# Daily Memory - 2026-02-18

## Activity Log
Had a long discussion about database schema. Kevin wants to use PostgreSQL 
with Prisma. We talked about normalization vs performance. He prefers 
normalized schema for data integrity.

## Retain
- W @Database: Using PostgreSQL with Prisma ORM
- B @Kevin: Prefers normalized database schema
- O(c=0.85) @Kevin: Values data integrity over raw performance
- S: Database schema discussion completed
```

### Writing Entity Pages

When you learn new facts about an entity:

1. Check if entity page exists in `bank/entities/`
2. If not, create it from template
3. Add new facts to appropriate section
4. Update "Last Updated" date

### Writing Opinions

When tracking preferences/opinions:

1. Add to `bank/opinions.md` with confidence level
2. Include evidence (file + line references)
3. Update confidence when new evidence arrives
4. Mark contradictions with lower confidence

## Best Practices

### DO:
- ✓ Use ## Retain sections consistently
- ✓ Include confidence levels for opinions
- ✓ Link evidence with file#line references
- ✓ Update entity pages when facts change
- ✓ Run optimizer weekly
- ✓ Archive old logs
- ✓ Keep MEMORY.md focused on core facts only

### DON'T:
- ✗ Dump everything into MEMORY.md
- ✗ Let daily logs grow beyond 1500 tokens
- ✗ Track opinions without evidence
- ✗ Mix raw notes with distilled facts
- ✗ Skip confidence levels on opinions

## Troubleshooting

### "Token count exceeded threshold"

Run compaction:
```bash
./memory-optimizer.sh --compact
```

### "Daily logs getting too large"

1. Use ## Retain sections more actively
2. Archive old logs: `./memory-optimizer.sh --archive`
3. Move durable facts to entity pages

### "Can't recall old information"

1. Check bank/entities/ for entity pages
2. Review bank/opinions.md for tracked preferences
3. Use memory_search tool with specific queries
4. Ensure ## Retain sections exist in daily logs

### "Conflicting information"

Update opinions.md with:
- Lower confidence on old opinion
- Higher confidence on new opinion  
- Evidence for both
- Note about contradiction

## Migration Guide

### From Unstructured Memory

1. Run audit: `./memory-optimizer.sh --audit`
2. Review bloated files
3. Manually create ## Retain sections for recent logs
4. Run: `./memory-optimizer.sh --compact`
5. Review generated bank/ structure
6. Clean up MEMORY.md (keep only core facts)

### Setting Up New Agent

1. Create directory structure:
   ```bash
   mkdir -p bank/entities memory/archive
   ```
2. Copy templates from this skill
3. Update AGENTS.md with memory rules
4. Set up heartbeat checks
5. Run initial audit

## Script Reference

### memory-optimizer.sh

Main optimization script with commands:
- `--audit`: Check token sizes and health
- `--compact`: Run distillation and compaction
- `--archive`: Archive old daily logs
- `--report`: Generate detailed health report
- `--optimize`: Run full optimization (all steps)
- `--help`: Show usage information

### reflect.py

Python script for:
- Parsing daily logs
- Extracting structured facts
- Generating ## Retain sections
- Updating entity pages
- Tracking opinions with confidence

## References

- OpenClaw Memory Docs: https://docs.openclaw.ai/concepts/memory
- Letta/MemGPT: "core memory blocks" + "archival memory"
- Hindsight: "retain / recall / reflect" pattern
- SQLite FTS5: For local full-text search

---

**Remember: The goal is to keep memory lean, structured, and highly recallable.**
