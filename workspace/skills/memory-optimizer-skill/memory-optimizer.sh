#!/bin/bash
#
# Memory Optimizer for OpenClaw
# Prevents token bloat and implements progressive storage
#

# Note: removed 'set -e' to prevent script from exiting on non-critical errors

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE="${OPENCLAW_WORKSPACE:-$HOME/.openclaw/workspace}"
MEMORY_DIR="$WORKSPACE/memory"
BANK_DIR="$WORKSPACE/bank"
ARCHIVE_DIR="$MEMORY_DIR/archive"

# Token thresholds
MEMORY_MD_WARNING=2000
MEMORY_MD_CRITICAL=3000
DAILY_LOG_WARNING=1000
DAILY_LOG_CRITICAL=1500
TOTAL_WARNING=15000
TOTAL_CRITICAL=25000

# Archive threshold (days)
ARCHIVE_DAYS=30

# Functions
print_usage() {
    cat << EOF
Memory Optimizer for OpenClaw

Usage: $0 [OPTION]

Options:
  --audit          Check memory file sizes and token counts
  --compact        Run reflection/distillation on daily logs
  --archive        Archive daily logs older than $ARCHIVE_DAYS days
  --report         Generate detailed health report
  --optimize       Run full optimization (audit + compact + archive)
  --reflect        Run Python reflection script only
  --setup          Create initial directory structure
  --help           Show this help message

Examples:
  $0 --audit                    # Check memory health
  $0 --optimize                 # Full optimization
  $0 --compact                  # Distill daily logs only
  $0 --archive                  # Archive old logs

Environment Variables:
  OPENCLAW_WORKSPACE    Path to workspace (default: ~/.openclaw/workspace)
EOF
}

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[OK]${NC} $1"
}

# Estimate tokens (rough approximation: 1 token ≈ 4 characters)
estimate_tokens() {
    local file="$1"
    if [[ -f "$file" ]]; then
        local chars=$(wc -c < "$file")
        echo $((chars / 4))
    else
        echo 0
    fi
}

# Format number with commas
format_number() {
    echo "$1" | sed ':a;s/\B[0-9]\{3\}\>/,&/;ta'
}

# Check if required directories exist
check_directories() {
    if [[ ! -d "$WORKSPACE" ]]; then
        log_error "Workspace not found: $WORKSPACE"
        exit 1
    fi
    
    if [[ ! -d "$MEMORY_DIR" ]]; then
        log_warn "Memory directory not found: $MEMORY_DIR"
        log_info "Creating memory directory..."
        mkdir -p "$MEMORY_DIR"
    fi
    
    if [[ ! -d "$BANK_DIR" ]]; then
        log_warn "Bank directory not found: $BANK_DIR"
        log_info "Creating bank directory structure..."
        mkdir -p "$BANK_DIR/entities"
    fi
    
    if [[ ! -d "$ARCHIVE_DIR" ]]; then
        mkdir -p "$ARCHIVE_DIR"
    fi
}

# Audit memory files
run_audit() {
    log_info "Running memory audit..."
    echo ""
    
    local total_tokens=0
    local warning_count=0
    local critical_count=0
    
    # Check MEMORY.md
    local memory_md="$WORKSPACE/MEMORY.md"
    if [[ -f "$memory_md" ]]; then
        local tokens=$(estimate_tokens "$memory_md")
        total_tokens=$((total_tokens + tokens))
        
        local status="✓"
        local color="$GREEN"
        
        if [[ $tokens -gt $MEMORY_MD_CRITICAL ]]; then
            status="✗ CRITICAL"
            color="$RED"
            ((critical_count++))
        elif [[ $tokens -gt $MEMORY_MD_WARNING ]]; then
            status="⚠ WARNING"
            color="$YELLOW"
            ((warning_count++))
        fi
        
        printf "${color}%-12s${NC} %-20s %s\n" "$status" "MEMORY.md" "$(format_number $tokens) tokens"
    else
        log_warn "MEMORY.md not found"
    fi
    
    echo ""
    log_info "Daily logs:"
    
    # Check daily logs
    local daily_total=0
    local log_count=0
    
    # Find all daily log files
    local log_files=()
    for pattern in 2026 2025 2024; do
        for f in "$MEMORY_DIR"/${pattern}-*.md; do
            [[ -f "$f" ]] && log_files+=("$f")
        done
    done
    
    for log_file in "${log_files[@]}"; do
        
        local tokens=$(estimate_tokens "$log_file")
        daily_total=$((daily_total + tokens))
        ((log_count++))
        
        local basename=$(basename "$log_file")
        local status="✓"
        local color="$GREEN"
        
        if [[ $tokens -gt $DAILY_LOG_CRITICAL ]]; then
            status="✗"
            color="$RED"
            ((critical_count++))
        elif [[ $tokens -gt $DAILY_LOG_WARNING ]]; then
            status="⚠"
            color="$YELLOW"
            ((warning_count++))
        fi
        
        printf "${color}%-12s${NC} %-20s %s\n" "$status" "$basename" "$(format_number $tokens) tokens"
    done
    
    total_tokens=$((total_tokens + daily_total))
    
    echo ""
    log_info "Bank files:"
    
    # Check bank files
    local bank_total=0
    
    # Find all bank files
    local bank_files=()
    if [[ -d "$BANK_DIR" ]]; then
        for f in "$BANK_DIR"/*.md "$BANK_DIR"/**/*.md; do
            [[ -f "$f" ]] && bank_files+=("$f")
        done
    fi
    
    for bank_file in "${bank_files[@]}"; do
        local tokens=$(estimate_tokens "$bank_file")
        bank_total=$((bank_total + tokens))
        
        local basename=$(basename "$bank_file")
        printf "%-12s %-20s %s\n" "✓" "$basename" "$(format_number $tokens) tokens"
    done
    
    total_tokens=$((total_tokens + bank_total))
    
    # Summary
    echo ""
    echo "═══════════════════════════════════════════════════"
    
    local total_status="✓ HEALTHY"
    local total_color="$GREEN"
    
    if [[ $total_tokens -gt $TOTAL_CRITICAL ]]; then
        total_status="✗ CRITICAL"
        total_color="$RED"
        ((critical_count++))
    elif [[ $total_tokens -gt $TOTAL_WARNING ]]; then
        total_status="⚠ WARNING"
        total_color="$YELLOW"
        ((warning_count++))
    fi
    
    printf "${total_color}%-12s${NC} %-20s %s\n" "$total_status" "TOTAL" "$(format_number $total_tokens) tokens"
    echo "═══════════════════════════════════════════════════"
    
    # Recommendations
    echo ""
    if [[ $critical_count -gt 0 ]]; then
        log_error "$critical_count file(s) exceed CRITICAL threshold"
        log_info "Run: $0 --compact"
    elif [[ $warning_count -gt 0 ]]; then
        log_warn "$warning_count file(s) exceed WARNING threshold"
        log_info "Consider running: $0 --compact"
    else
        log_success "All files within healthy thresholds"
    fi
    
    # Log count
    if [[ $log_count -gt 30 ]]; then
        log_warn "$log_count daily logs found (>30 days)"
        log_info "Consider archiving: $0 --archive"
    fi
    
    return $critical_count
}

# Archive old logs
run_archive() {
    log_info "Archiving logs older than $ARCHIVE_DAYS days..."
    
    local archived_count=0
    local cutoff_date=$(date -d "$ARCHIVE_DAYS days ago" +%Y-%m-%d 2>/dev/null || date -v-${ARCHIVE_DAYS}d +%Y-%m-%d)
    
    for log_file in "$MEMORY_DIR"/*.md; do
        [[ -f "$log_file" ]] || continue
        
        local basename=$(basename "$log_file")
        
        # Extract date from filename (YYYY-MM-DD.md)
        if [[ "$basename" =~ ^([0-9]{4}-[0-9]{2}-[0-9]{2})\.md$ ]]; then
            local file_date="${BASH_REMATCH[1]}"
            
            if [[ "$file_date" < "$cutoff_date" ]]; then
                log_info "Archiving: $basename"
                
                # Compress and move
                gzip -c "$log_file" > "$ARCHIVE_DIR/$basename.gz"
                rm "$log_file"
                
                ((archived_count++))
            fi
        fi
    done
    
    if [[ $archived_count -gt 0 ]]; then
        log_success "Archived $archived_count log(s) to $ARCHIVE_DIR"
    else
        log_info "No logs to archive"
    fi
}

# Run reflection/compact
run_compact() {
    log_info "Running memory compaction..."
    
    local script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    local reflect_script="$script_dir/reflect.py"
    
    if [[ ! -f "$reflect_script" ]]; then
        log_error "Reflection script not found: $reflect_script"
        exit 1
    fi
    
    # Check if Python is available
    if ! command -v python3 &> /dev/null; then
        log_error "Python 3 is required but not installed"
        exit 1
    fi
    
    log_info "Running reflection script..."
    python3 "$reflect_script" --workspace "$WORKSPACE"
    
    if [[ $? -eq 0 ]]; then
        log_success "Compaction completed"
    else
        log_error "Compaction failed"
        exit 1
    fi
}

# Generate health report
run_report() {
    log_info "Generating memory health report..."
    
    local report_file="$WORKSPACE/memory-health-report-$(date +%Y%m%d).md"
    
    {
        echo "# Memory Health Report"
        echo ""
        echo "**Generated:** $(date '+%Y-%m-%d %H:%M:%S')"
        echo "**Workspace:** $WORKSPACE"
        echo ""
        echo "## Summary"
        echo ""
        
        # Run audit and capture output
        $0 --audit 2>&1 | tee /dev/tty
        
        echo ""
        echo "## Details"
        echo ""
        echo "### File Listing"
        echo ""
        echo "| File | Tokens | Status |"
        echo "|------|--------|--------|"
        
        # List all memory files
        local memory_files=()
        [[ -f "$WORKSPACE/MEMORY.md" ]] && memory_files+=("$WORKSPACE/MEMORY.md")
        for f in "$MEMORY_DIR"/*.md; do
            [[ -f "$f" ]] && memory_files+=("$f")
        done
        
        for file in "${memory_files[@]}"; do
            local tokens=$(estimate_tokens "$file")
            local basename=$(basename "$file")
            local status="✓"
            
            if [[ "$basename" == "MEMORY.md" ]]; then
                if [[ $tokens -gt $MEMORY_MD_CRITICAL ]]; then
                    status="✗"
                elif [[ $tokens -gt $MEMORY_MD_WARNING ]]; then
                    status="⚠"
                fi
            else
                if [[ $tokens -gt $DAILY_LOG_CRITICAL ]]; then
                    status="✗"
                elif [[ $tokens -gt $DAILY_LOG_WARNING ]]; then
                    status="⚠"
                fi
            fi
            
            echo "| $basename | $(format_number $tokens) | $status |"
        done
        
        echo ""
        echo "## Recommendations"
        echo ""
        
        # Add recommendations based on audit
        local critical_count=0
        
        local memory_tokens=$(estimate_tokens "$WORKSPACE/MEMORY.md")
        if [[ $memory_tokens -gt $MEMORY_MD_CRITICAL ]]; then
            echo "- **CRITICAL:** MEMORY.md exceeds critical threshold ($(format_number $memory_tokens) tokens)"
            echo "  - Action: Move non-core facts to bank/entities/"
            echo "  - Keep only essential, always-relevant information"
            ((critical_count++))
        elif [[ $memory_tokens -gt $MEMORY_MD_WARNING ]]; then
            echo "- **WARNING:** MEMORY.md getting large ($(format_number $memory_tokens) tokens)"
            echo "  - Action: Review and archive outdated information"
        fi
        
        echo ""
        echo "---"
        echo ""
        echo "*Run \`./memory-optimizer.sh --optimize\` to apply fixes*"
        
    } > "$report_file"
    
    echo ""
    log_success "Report saved to: $report_file"
}

# Setup directory structure
run_setup() {
    log_info "Setting up memory optimizer..."
    
    # Create directories
    mkdir -p "$MEMORY_DIR"
    mkdir -p "$ARCHIVE_DIR"
    mkdir -p "$BANK_DIR/entities"
    
    # Create bank files if they don't exist
    if [[ ! -f "$BANK_DIR/opinions.md" ]]; then
        cat > "$BANK_DIR/opinions.md" << 'EOF'
# Tracked Opinions

## Format
- Statement: Description of opinion/preference
- Confidence: 0.0-1.0 (certainty level)
- Evidence: File references (memory/YYYY-MM-DD.md#LXX)
- Last Updated: Date

## Entities

EOF
        log_success "Created: $BANK_DIR/opinions.md"
    fi
    
    if [[ ! -f "$BANK_DIR/world.md" ]]; then
        cat > "$BANK_DIR/world.md" << 'EOF'
# World Facts

## Objective Facts
- Facts about the world, systems, configurations
- Not about specific people/agents
- Stable, durable information

EOF
        log_success "Created: $BANK_DIR/world.md"
    fi
    
    # Create .gitkeep for entities
    touch "$BANK_DIR/entities/.gitkeep"
    
    log_success "Setup complete!"
    log_info "Next steps:"
    echo "  1. Run: $0 --audit"
    echo "  2. Review your MEMORY.md and daily logs"
    echo "  3. Run: $0 --optimize"
}

# Run full optimization
run_optimize() {
    log_info "Starting full memory optimization..."
    echo ""
    
    check_directories
    
    echo "Step 1/3: Audit"
    run_audit
    local audit_status=$?
    
    echo ""
    echo "Step 2/3: Compact"
    run_compact
    
    echo ""
    echo "Step 3/3: Archive"
    run_archive
    
    echo ""
    log_success "Optimization complete!"
    
    # Final audit
    echo ""
    log_info "Post-optimization status:"
    run_audit
}

# Main
main() {
    case "${1:-}" in
        --audit)
            check_directories
            run_audit
            ;;
        --compact)
            check_directories
            run_compact
            ;;
        --archive)
            check_directories
            run_archive
            ;;
        --report)
            check_directories
            run_report
            ;;
        --optimize)
            run_optimize
            ;;
        --reflect)
            check_directories
            run_compact
            ;;
        --setup)
            run_setup
            ;;
        --help|-h)
            print_usage
            ;;
        "")
            print_usage
            exit 1
            ;;
        *)
            log_error "Unknown option: $1"
            print_usage
            exit 1
            ;;
    esac
}

main "$@"
