#!/bin/bash

# GitHub Skill Helper Script
# Usage: ./github.sh [command] [repo] [message]
# 
# Commands:
#   status <repo>      - Show git status for a repo
#   status-all         - Show status for all repos
#   add <repo>         - Stage all changes
#   commit <repo>      - Commit with message (requires message as 3rd arg)
#   push <repo>       - Push changes
#   pull <repo>       - Pull changes
#   quick <repo>      - Stage, commit, push all at once
#   diff <repo>       - Show changes
#   log <repo>        - Show recent commits
#
# Repos:
#   workspace         - /root/.openclaw/workspace/
#   cashflow          - /var/www/cashflow-manager/
#   find-your-seat    - /var/www/find-your-seat/

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Repository paths
REPOS=(
  "workspace:/root/.openclaw/workspace"
  "cashflow:/var/www/cashflow-manager"
  "find-your-seat:/var/www/find-your-seat"
)

# Get repo path by name
get_repo_path() {
  local repo_name="$1"
  for repo in "${REPOS[@]}"; do
    if [[ "$repo" == "$repo_name:"* ]]; then
      echo "${repo#*:}"
      return 0
    fi
  done
  return 1
}

# List available repos
list_repos() {
  echo -e "${BLUE}Available Repositories:${NC}"
  for repo in "${REPOS[@]}"; do
    name="${repo%%:*}"
    path="${repo#*:}"
    echo "  - $name: $path"
  done
}

# Check git status
cmd_status() {
  local repo_name="$1"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  echo -e "${BLUE}=== $repo_name ($repo_path) ===${NC}"
  git -C "$repo_path" status
}

# Status all repos
cmd_status_all() {
  echo -e "${BLUE}=== Git Status for All Repositories ===${NC}"
  echo ""
  
  for repo in "${REPOS[@]}"; do
    name="${repo%%:*}"
    path="${repo#*:}"
    
    if [[ -d "$path/.git" ]]; then
      echo -e "${GREEN}📦 $name${NC}"
      echo "   Path: $path"
      
      # Check for changes
      status=$(git -C "$path" status --short 2>/dev/null | wc -l)
      if [[ "$status" -gt 0 ]]; then
        echo -e "   ${YELLOW}Changes: $status file(s)${NC}"
        git -C "$path" status --short | head -5
        if [[ "$status" -gt 5 ]]; then
          echo "   ... and $((status - 5)) more"
        fi
      else
        echo -e "   ${GREEN}Clean - no changes${NC}"
      fi
      echo ""
    else
      echo -e "${RED}✗ $name - Not a git repository${NC}"
      echo ""
    fi
  done
}

# Stage all changes
cmd_add() {
  local repo_name="$1"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  echo -e "${YELLOW}Staging changes in $repo_name...${NC}"
  git -C "$repo_path" add .
  echo -e "${GREEN}✓ Changes staged${NC}"
}

# Commit changes
cmd_commit() {
  local repo_name="$1"
  local message="$2"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  if [[ -z "$message" ]]; then
    echo -e "${RED}Error: Commit message required${NC}"
    echo "Usage: github.sh commit <repo> \"<message>\""
    return 1
  fi
  
  echo -e "${YELLOW}Committing to $repo_name...${NC}"
  git -C "$repo_path" commit -m "$message"
  echo -e "${GREEN}✓ Committed${NC}"
}

# Push changes
cmd_push() {
  local repo_name="$1"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  echo -e "${YELLOW}Pushing $repo_name to remote...${NC}"
  git -C "$repo_path" push
  echo -e "${GREEN}✓ Pushed${NC}"
}

# Pull changes
cmd_pull() {
  local repo_name="$1"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  echo -e "${YELLOW}Pulling $repo_name from remote...${NC}"
  git -C "$repo_path" pull
  echo -e "${GREEN}✓ Pulled${NC}"
}

# Quick: add, commit, push
cmd_quick() {
  local repo_name="$1"
  local message="$2"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  if [[ -z "$message" ]]; then
    echo -e "${RED}Error: Commit message required${NC}"
    echo "Usage: github.sh quick <repo> \"<message>\""
    return 1
  fi
  
  echo -e "${BLUE}=== Quick Commit: $repo_name ===${NC}"
  
  # Stage
  echo -e "${YELLOW}1. Staging changes...${NC}"
  git -C "$repo_path" add .
  
  # Commit
  echo -e "${YELLOW}2. Committing...${NC}"
  git -C "$repo_path" commit -m "$message"
  
  # Push
  echo -e "${YELLOW}3. Pushing to remote...${NC}"
  git -C "$repo_path" push
  
  echo -e "${GREEN}✓ Done!${NC}"
}

# Show diff
cmd_diff() {
  local repo_name="$1"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  echo -e "${BLUE}=== Diff for $repo_name ===${NC}"
  git -C "$repo_path" diff
}

# Show log
cmd_log() {
  local repo_name="$1"
  local repo_path
  
  repo_path=$(get_repo_path "$repo_name") || {
    echo -e "${RED}Unknown repository: $repo_name${NC}"
    list_repos
    return 1
  }
  
  echo -e "${BLUE}=== Recent Commits: $repo_name ===${NC}"
  git -C "$repo_path" log --oneline -10
}

# Show help
show_help() {
  echo "GitHub Skill Helper Script"
  echo ""
  echo "Usage: $0 <command> [repo] [message]"
  echo ""
  echo "Commands:"
  echo "  status <repo>      Show git status for a repo"
  echo "  status-all         Show status for all repos"
  echo "  add <repo>         Stage all changes"
  echo "  commit <repo>      Commit with message (requires message)"
  echo "  push <repo>        Push changes"
  echo "  pull <repo>       Pull changes"
  echo "  quick <repo>       Stage, commit, push all at once"
  echo "  diff <repo>       Show changes"
  echo "  log <repo>        Show recent commits"
  echo ""
  echo "Repositories:"
  for repo in "${REPOS[@]}"; do
    name="${repo%%:*}"
    echo "  - $name"
  done
  echo ""
  echo "Examples:"
  echo "  $0 status workspace"
  echo "  $0 status-all"
  echo "  $0 quick workspace \"feat: add new feature\""
  echo "  $0 commit cashflow \"fix: resolve login bug\""
}

# Main
COMMAND="${1:-}"
REPO="${2:-}"
MESSAGE="${3:-}"

case "$COMMAND" in
  status)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_status "$REPO"
    ;;
  status-all)
    cmd_status_all
    ;;
  add)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_add "$REPO"
    ;;
  commit)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_commit "$REPO" "$MESSAGE"
    ;;
  push)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_push "$REPO"
    ;;
  pull)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_pull "$REPO"
    ;;
  quick)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_quick "$REPO" "$MESSAGE"
    ;;
  diff)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_diff "$REPO"
    ;;
  log)
    [[ -z "$REPO" ]] && { echo "Error: repo required"; exit 1; }
    cmd_log "$REPO"
    ;;
  help|-h|--help)
    show_help
    ;;
  *)
    echo "GitHub Skill Helper"
    echo ""
    cmd_status_all
    echo ""
    echo "Run '$0 help' for usage information"
    ;;
esac
