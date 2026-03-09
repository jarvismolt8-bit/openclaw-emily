#!/bin/bash

# Server Cleanup Script
# Usage: ./cleanup.sh [OPTION]
# Options:
#   --check          Check disk space and report status
#   --safe           Perform safe cleanup (logs > 7 days, cache, npm)
#   --aggressive     Perform aggressive cleanup (all logs, archive memory)
#   --archive-memory Archive memory files older than 30 days
#   --auto           Automatic mode for cron (cleans if > 85%)
#   --help           Show this help message

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
WORKSPACE="/root/.openclaw/workspace"
OPENCODE_DIR="/root/.local/share/opencode"
MEMORY_DIR="$WORKSPACE/memory"
ARCHIVE_DIR="$MEMORY_DIR/archive"
LOG_FILE="$WORKSPACE/cleanup.log"

# Thresholds
WARNING_THRESHOLD=80
CRITICAL_THRESHOLD=90
AUTO_CLEAN_THRESHOLD=85

# Space freed tracker
SPACE_FREED=0

# Functions
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

check_disk_space() {
    echo "=== Disk Space Check ==="
    df -h /
    echo ""
    
    # Get usage percentage
    USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    AVAILABLE=$(df / | tail -1 | awk '{print $4}')
    
    echo "Current Usage: ${USAGE}%"
    echo "Available: $AVAILABLE"
    
    if [ "$USAGE" -ge "$CRITICAL_THRESHOLD" ]; then
        echo -e "${RED}🚨 CRITICAL: Disk usage is ${USAGE}%!${NC}"
        return 2
    elif [ "$USAGE" -ge "$WARNING_THRESHOLD" ]; then
        echo -e "${YELLOW}⚠️  WARNING: Disk usage is ${USAGE}%${NC}"
        return 1
    else
        echo -e "${GREEN}✅ Healthy: Disk usage is ${USAGE}%${NC}"
        return 0
    fi
}

show_space_usage() {
    echo "=== Space Usage by Directory ==="
    du -sh /root/.openclaw/workspace /root/.local/share/opencode /root/.cache /root/.npm /var/www 2>/dev/null | sort -h
    echo ""
    
    echo "=== Detailed Breakdown ==="
    echo "OpenCode Logs: $(du -sh $OPENCODE_DIR/log 2>/dev/null | cut -f1)"
    echo "OpenCode Snapshots: $(du -sh $OPENCODE_DIR/snapshot 2>/dev/null | cut -f1)"
    echo "System Cache: $(du -sh /root/.cache 2>/dev/null | cut -f1)"
    echo "NPM Cache: $(du -sh /root/.npm 2>/dev/null | cut -f1)"
    echo "Workspace Memory: $(du -sh $MEMORY_DIR 2>/dev/null | cut -f1)"
}

cleanup_opencode_logs() {
    echo "=== Cleaning OpenCode Logs ==="
    
    if [ -d "$OPENCODE_DIR/log" ]; then
        # Count files to be deleted
        COUNT=$(find "$OPENCODE_DIR/log" -name "*.log" -type f -mtime +7 | wc -l)
        
        if [ "$COUNT" -gt 0 ]; then
            # Calculate size before deletion
            SIZE=$(find "$OPENCODE_DIR/log" -name "*.log" -type f -mtime +7 -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
            
            # Delete files
            find "$OPENCODE_DIR/log" -name "*.log" -type f -mtime +7 -delete
            
            log "Deleted $COUNT old log files (~$SIZE)"
            echo -e "${GREEN}✅ Deleted $COUNT old log files (~$SIZE)${NC}"
        else
            echo "No old log files to clean"
        fi
    fi
}

cleanup_system_cache() {
    echo "=== Cleaning System Cache ==="
    
    # Clear files not accessed in 7 days
    if [ -d "/root/.cache" ]; then
        COUNT=$(find /root/.cache -type f -atime +7 2>/dev/null | wc -l)
        
        if [ "$COUNT" -gt 0 ]; then
            SIZE=$(find /root/.cache -type f -atime +7 -exec du -ch {} + 2>/dev/null | tail -1 | cut -f1)
            find /root/.cache -type f -atime +7 -delete 2>/dev/null
            log "Cleared system cache (~$SIZE)"
            echo -e "${GREEN}✅ Cleared system cache (~$SIZE)${NC}"
        else
            echo "No old cache files to clean"
        fi
    fi
    
    # Clear browser automation caches
    if [ -d "/root/.cache/puppeteer" ] || [ -d "/root/.cache/ms-playwright" ]; then
        SIZE=$(du -sh /root/.cache/puppeteer /root/.cache/ms-playwright 2>/dev/null | awk '{sum+=$1} END {print sum}')
        rm -rf /root/.cache/puppeteer/* /root/.cache/ms-playwright/* 2>/dev/null
        log "Cleared browser automation caches"
        echo -e "${GREEN}✅ Cleared browser caches${NC}"
    fi
}

cleanup_npm_cache() {
    echo "=== Cleaning NPM Cache ==="
    
    if command -v npm &> /dev/null; then
        # Get size before cleanup
        SIZE=$(du -sh /root/.npm 2>/dev/null | cut -f1)
        
        # Clean cache
        npm cache clean --force 2>&1 | grep -v "npm warn"
        
        log "Cleaned NPM cache (was ~$SIZE)"
        echo -e "${GREEN}✅ Cleaned NPM cache (was ~$SIZE)${NC}"
    else
        echo "NPM not found"
    fi
}

archive_memory_files() {
    echo "=== Archiving Old Memory Files ==="
    
    if [ -d "$MEMORY_DIR" ]; then
        # Create archive directory
        mkdir -p "$ARCHIVE_DIR"
        
        # Find files older than 30 days
        OLD_FILES=$(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f -mtime +30)
        
        if [ -n "$OLD_FILES" ]; then
            # Create archive with timestamp
            ARCHIVE_NAME="memory_$(date +%Y%m%d).tar.gz"
            
            # Archive files
            tar -czf "$ARCHIVE_DIR/$ARCHIVE_NAME" -C "$MEMORY_DIR" $(echo "$OLD_FILES" | sed 's|'$MEMORY_DIR'/||g')
            
            # Remove archived files
            echo "$OLD_FILES" | xargs rm -f
            
            ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR/$ARCHIVE_NAME" | cut -f1)
            log "Archived old memory files to $ARCHIVE_NAME (~$ARCHIVE_SIZE)"
            echo -e "${GREEN}✅ Archived old memory files (~$ARCHIVE_SIZE)${NC}"
        else
            echo "No old memory files to archive"
        fi
    fi
}

safe_cleanup() {
    echo -e "${YELLOW}Starting Safe Cleanup...${NC}"
    echo ""
    
    cleanup_opencode_logs
    cleanup_system_cache
    cleanup_npm_cache
    
    echo ""
    echo -e "${GREEN}✅ Safe cleanup complete!${NC}"
    echo ""
    check_disk_space
}

aggressive_cleanup() {
    echo -e "${RED}🚨 Starting Aggressive Cleanup...${NC}"
    echo ""
    
    # Safe cleanup first
    cleanup_opencode_logs
    cleanup_system_cache
    cleanup_npm_cache
    
    # Archive all memory files (not just old ones)
    echo "=== Archiving ALL Memory Files ==="
    if [ -d "$MEMORY_DIR" ]; then
        mkdir -p "$ARCHIVE_DIR"
        
        # Count files
        FILE_COUNT=$(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f | wc -l)
        
        if [ "$FILE_COUNT" -gt 0 ]; then
            ARCHIVE_NAME="memory_full_$(date +%Y%m%d_%H%M).tar.gz"
            tar -czf "$ARCHIVE_DIR/$ARCHIVE_NAME" -C "$MEMORY_DIR" $(find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f | sed 's|'$MEMORY_DIR'/||g')
            find "$MEMORY_DIR" -maxdepth 1 -name "*.md" -type f -delete
            
            ARCHIVE_SIZE=$(du -sh "$ARCHIVE_DIR/$ARCHIVE_NAME" | cut -f1)
            log "Archived all memory files ($FILE_COUNT files, ~$ARCHIVE_SIZE)"
            echo -e "${GREEN}✅ Archived all memory files ($FILE_COUNT files)${NC}"
        fi
    fi
    
    # Clear all logs (not just old ones)
    echo "=== Clearing ALL OpenCode Logs ==="
    if [ -d "$OPENCODE_DIR/log" ]; then
        COUNT=$(find "$OPENCODE_DIR/log" -name "*.log" -type f | wc -l)
        if [ "$COUNT" -gt 0 ]; then
            rm -rf "$OPENCODE_DIR/log/*"
            log "Cleared all $COUNT log files"
            echo -e "${GREEN}✅ Cleared all $COUNT log files${NC}"
        fi
    fi
    
    echo ""
    echo -e "${GREEN}✅ Aggressive cleanup complete!${NC}"
    echo ""
    check_disk_space
}

auto_cleanup() {
    echo "=== Automatic Cleanup Check ==="
    
    USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
    
    if [ "$USAGE" -ge "$AUTO_CLEAN_THRESHOLD" ]; then
        echo -e "${YELLOW}⚠️  Disk usage is ${USAGE}%. Running safe cleanup...${NC}"
        log "Auto-triggered cleanup at ${USAGE}% usage"
        safe_cleanup
        
        # Check if still critical
        USAGE_AFTER=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
        if [ "$USAGE_AFTER" -ge "$CRITICAL_THRESHOLD" ]; then
            echo -e "${RED}🚨 Still critical after cleanup! Manual intervention needed.${NC}"
            log "WARNING: Still critical after auto-cleanup (${USAGE_AFTER}%)"
        fi
    else
        echo -e "${GREEN}✅ Disk usage is ${USAGE}%. No cleanup needed.${NC}"
    fi
}

# Main
main() {
    case "${1:-}" in
        --check)
            check_disk_space
            echo ""
            show_space_usage
            ;;
        --safe)
            safe_cleanup
            ;;
        --aggressive)
            aggressive_cleanup
            ;;
        --archive-memory)
            archive_memory_files
            ;;
        --auto)
            auto_cleanup
            ;;
        --help|-h)
            echo "Server Cleanup Script"
            echo ""
            echo "Usage: $0 [OPTION]"
            echo ""
            echo "Options:"
            echo "  --check          Check disk space and report status"
            echo "  --safe           Perform safe cleanup (logs > 7 days, cache, npm)"
            echo "  --aggressive     Perform aggressive cleanup (all logs, archive memory)"
            echo "  --archive-memory Archive memory files older than 30 days"
            echo "  --auto           Automatic mode for cron (cleans if > 85%)"
            echo "  --help           Show this help message"
            echo ""
            echo "Examples:"
            echo "  $0 --check       # Check current status"
            echo "  $0 --safe        # Run safe cleanup"
            echo "  $0 --auto        # Automatic cleanup (for cron)"
            ;;
        *)
            echo "Server Cleanup Tool"
            echo ""
            check_disk_space
            echo ""
            show_space_usage
            echo ""
            echo "Run with --help for usage information"
            ;;
    esac
}

# Create log directory if needed
touch "$LOG_FILE"

main "$@"
