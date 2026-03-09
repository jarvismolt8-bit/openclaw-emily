#!/bin/bash

# Skill Optimizer - Switch between full and essential skill versions
# Reduces token usage by loading only essential operations

SKILLS_DIR="/root/.openclaw/workspace/skills"
USE_ESSENTIAL=false

# Function to check if task is simple
is_simple_task() {
    local task="$1"
    
    # Simple task patterns (basic CRUD operations)
    if [[ "$task" =~ ^(add|view|list|show|filter) ]] || \
       [[ "$task" =~ ^(create|read) ]] || \
       [[ "$task" =~ ^(done|complete|finish) ]]; then
        return 0
    fi
    
    # Complex task patterns (require full context)
    if [[ "$task" =~ ^(explain|describe|analyze|debug|troubleshoot) ]] || \
       [[ "$task" =~ (config|setup|install|deploy) ]] || \
       [[ "$task" =~ (why|how|what|when|where) ]]; then
        return 1
    fi
    
    # Default to simple for most operations
    return 0
}

# Function to switch skill version
switch_skill_version() {
    local skill="$1"
    local use_essential="$2"
    
    local full_skill="$SKILLS_DIR/$skill/SKILL.md"
    local essential_skill="$SKILLS_DIR/$skill/SKILL-ESSENTIAL.md"
    
    if [ "$use_essential" = true ]; then
        # Use essential version if it exists
        if [ -f "$essential_skill" ]; then
            echo "$essential_skill"
            return 0
        fi
    fi
    
    # Fall back to full version
    if [ -f "$full_skill" ]; then
        echo "$full_skill"
        return 0
    fi
    
    return 1
}

# Main function
optimize_skill_loading() {
    local task="$1"
    
    # Determine if we should use essential version
    if is_simple_task "$task"; then
        USE_ESSENTIAL=true
        echo "🎯 Using ESSENTIAL skill version for: $task"
    else
        USE_ESSENTIAL=false
        echo "📚 Using FULL skill version for: $task"
    fi
    
    # Key skills to optimize
    local optimized_skills=("task-skill" "cashflow-skill")
    
    for skill in "${optimized_skills[@]}"; do
        local skill_file=$(switch_skill_version "$skill" "$USE_ESSENTIAL")
        if [ -n "$skill_file" ]; then
            # Create symbolic link to preferred version
            ln -sf "$skill_file" "$SKILLS_DIR/$skill/SKILL-ACTIVE.md"
            echo "  ✅ $skill: $(basename "$skill_file")"
        fi
    done
}

# Auto-optimize based on task complexity
if [ $# -eq 1 ]; then
    optimize_skill_loading "$1"
else
    echo "Usage: $0 \"task description\""
    echo "Example: $0 \"add task pay bills\""
    exit 1
fi