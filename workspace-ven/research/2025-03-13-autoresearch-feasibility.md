# Research: AutoResearch by Karpathy

Date: 2025-03-13

## Task
Explore https://github.com/karpathy/autoresearch and assess its feasibility for autonomous AI research.

## Overview

**AutoResearch** is an experimental project by Andrej Karpathy that enables **autonomous AI research** by letting an AI agent modify and run LLM training experiments overnight.

### Core Concept
- Give an AI agent a small but real LLM training setup
- The agent autonomously modifies `train.py` (the training code)
- Each experiment runs for a **fixed 5-minute time budget**
- Agent keeps improvements, discards failures, repeats
- Morning: log of experiments and (hopefully) a better model

### Files in Repo
- `prepare.py` — Data prep, tokenizer training, utilities (fixed, never modified)
- `train.py` — Full GPT model, optimizer (Muon + AdamW), training loop (**agent modifies this**)
- `program.md` — Instructions/baseline for the agent (human-edited)
- `pyproject.toml` — Dependencies

## How It Works

1. **Setup**: Install `uv`, sync dependencies, download data, train tokenizer (~2 min)
2. **Manual test**: Run `uv run train.py` (~5 min) to verify setup
3. **Autonomous mode**: Start an AI agent (Claude/Codex/etc.) in the repo with permissions disabled
4. **Agent workflow**:
   - Reads `program.md` for instructions
   - Modifies `train.py` (architecture, hyperparams, optimizers, etc.)
   - Runs training for exactly 5 minutes (wall clock)
   - Evaluates validation bits per byte (val_bpb) — lower is better
   - Keeps changes that improve metric, discards others
   - Repeats overnight (~100 experiments possible in 5 minutes each)

### Fixed Design Decisions
- **Single file modification** (`train.py`) — keeps scope manageable, diffs reviewable
- **Fixed time budget** — 5 minutes regardless of model/compute → experiments directly comparable
- **Self-contained** — No external deps beyond PyTorch, no distributed training

## Requirements

- **Hardware**: Single NVIDIA GPU (tested on H100, but can be tuned for smaller GPUs)
- **Software**: Python 3.10+, `uv` package manager
- **AI Agent**: Claude Code, Codex, or any agent capable of editing/running Python
- **Permissions**: Agent must have permission to modify `train.py` and execute training

## Feasibility Assessment

### ✅ **Strengths**

1. **Simple architecture** — Only one file to modify, easy to track changes
2. **Time-boxed experiments** — Fair comparison across different architectures/hyperparams
3. **Autonomous loop** — Can run overnight unattended
4. **Self-contained** — Minimal dependencies, easy to set up
5. **MIT licensed** — Open source, permissive
6. **Forks exist** for macOS, Windows, MLX (Apple Silicon)
7. **Karpathy's reputation** — Built by a respected researcher, likely quality code

### ⚠️ **Challenges**

1. **Hardware requirement**: Needs NVIDIA GPU; H100 optimized (may be slow on consumer GPUs)
2. **5-minute limit**: Very short training window; may not converge meaningful models for larger architectures
3. **Metric limitations**: val_bpb is simple; may not capture all desiderata (sample quality, diversity, etc.)
4. **Agent reliability**: Depends on agent's ability to propose meaningful modifications; risk of random search
5. **No built-in orchestration**: Need to manage agent setup, permissions, logging manually
6. **Tuning required** for smaller GPUs (recommendations provided but non-trivial)
7. **Single-threaded research**: One agent, one modification at a time (though you could run multiple instances)

### 📊 **Practical Feasibility**

**For personal/local use**:
- **If you have an NVIDIA GPU**: Feasible but likely slow (5 min/train on H100; on RTX 4090 maybe 10-20 min?); use forks for Mac/Windows
- **If you only have CPU**: Not practical (would take hours for 5 min equivalent)
- **If you want meaningful results**: Need to define what "improvement" means beyond val_bpb; may need custom evaluation

**For research automation**:
- **Novelty**: The concept is interesting but not entirely new (NAS, AutoML, hyperparam optimization)
- **Advantage**: Uses LLM agent to propose changes (more creative than grid search)
- **Risk**: LLM may propose ineffective or nonsensical changes; needs good `program.md` instructions

**For OpenClaw integration**:
- Could wrap this as a skill: `autoresearch start` / `autoresearch status`
- Would require GPU access from the agent
- Could combine with `research-artifacts` to log experiments

## Comparison with Similar Tools

| Feature | AutoResearch | NAS/ AutoML | crawl4ai (different domain) |
|---------|--------------|-------------|----------------------------|
| **Domain** | LLM training | Model search | Web crawling |
| **Automation** | LLM agent proposes | Algorithmic search | Manual |
| **Time budget** | Fixed 5 min | Variable | N/A |
| **Single file** | Yes (train.py) | Config files | N/A |
| **Hardware** | Single GPU | Varies | CPU/network |
| **Output** | Modified model | Best model | Scraped data |

## Installation & Setup

```bash
# 1. Install uv
curl -LsSf https://astral.sh/uv/install.sh | sh

# 2. Clone and install deps
git clone https://github.com/karpathy/autoresearch
cd autoresearch
uv sync

# 3. Prepare data (~2 min)
uv run prepare.py

# 4. Test manual run (~5 min)
uv run train.py
```

Then prompt agent:
```
Hi have a look at program.md and let's kick off a new experiment!
```

Agent will start autonomous loop.

## Recommendations

### **Who should use AutoResearch?**
- Researchers with spare GPU time who want to experiment with autonomous LLM development
- Developers curious about AI-driven code modification
- Anyone interested in the future of automated research (it's more a prototype/experiment)

### **Who should NOT use it?**
- People expecting dramatic model improvements overnight (unlikely in 5 min experiments)
- Those without suitable GPU hardware
- Those needing production-ready models (this is experimental)

### **For OpenClaw Consideration**
- It's a **standalone repo**, not a library to integrate
- Could be **orchestrated** by OpenClaw agents as a skill
- Would require GPU access in the agent's environment
- Not a core skill for OpenClaw unless you're specifically into autonomous ML research

## Conclusion

**Feasibility**: Technically feasible if you have an NVIDIA GPU and are willing to spend time tuning for your hardware. The concept works but may yield marginal improvements due to the 5-minute constraint.

**Research value**: High as a prototype of autonomous AI research; low for practical model improvement.

**Integration potential**: Could be wrapped as a skill but niche; most OpenClaw users would prefer other web/coding skills.

**Overall**: Interesting experiment, but not broadly useful. Suitable for tinkering by those with GPU resources and curiosity about auto-ML.

## Resources
- Repo: https://github.com/karpathy/autoresearch
- Tweet context: https://x.com/karpathy/status/2029701092347630069
- Dummy's guide: https://x.com/hooeem/status/2030720614752039185
- Forks: See README for macOS/Windows/MLX adaptations
