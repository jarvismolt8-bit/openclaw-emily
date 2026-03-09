#!/bin/bash

# Memory File Size Management Script
# Enforces 5KB limit on memory files and compresses large ones

MEMORY_DIR="/root/.openclaw/workspace/memory"
MAX_SIZE_KB=5
COMPRESS_THRESHOLD_KB=3

# Function to check file size
check_file_size() {
    local file="$1"
    local size_kb=$(( $(du -k "$file" | cut -f1) ))
    echo "$size_kb"
}

# Function to truncate large files
truncate_large_file() {
    local file="$1"
    local size_kb=$2
    
    if [ $size_kb -gt $MAX_SIZE_KB ]; then
        echo "⚠️ Truncating large memory file: $file ($size_kb KB)"
        
        # Keep only the last 50 lines (most recent content)
        tail -n 50 "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
        
        # Add truncation notice
        echo -e "\n\n--- FILE TRUNCATED (was ${size_kb}KB, now $(check_file_size "$file")KB) ---" >> "$file"
        
        echo "✅ File truncated to $(check_file_size "$file") KB"
        return 0
    fi
    return 1
}

# Function to compress large files
compress_large_file() {
    local file="$1"
    local size_kb=$2
    
    if [ $size_kb -gt $COMPRESS_THRESHOLD_KB ]; then
        echo "🗜️ Compressing memory file: $file"
        gzip -f "$file"
        echo "✅ File compressed: ${file}.gz"
        return 0
    fi
    return 1
}

# Function to decompress files if needed
decompress_file() {
    local file="$1"
    
    if [[ "$file" == *.gz ]]; then
        echo "📂 Decompressing memory file: $file"
        gunzip -f "$file"
        echo "✅ File decompressed: ${file%.gz}"
    fi
}

echo "🧹 Starting memory file management..."
echo "Memory directory: $MEMORY_DIR"
echo "Max size: ${MAX_SIZE_KB}KB, Compress threshold: ${COMPRESS_THRESHOLD_KB}KB"
echo ""

# Process all memory files
processed_count=0
truncated_count=0
compressed_count=0

for file in "$MEMORY_DIR"/*.md "$MEMORY_DIR"/*.md.gz; do
    if [ -f "$file" ]; then
        ((processed_count++))
        
        # Decompress if needed
        if [[ "$file" == *.gz ]]; then
            decompress_file "$file"
            file="${file%.gz}"
        fi
        
        # Check file size
        size_kb=$(check_file_size "$file")
        echo "📄 Processing: $file (${size_kb}KB)"
        
        # Truncate if too large
        if truncate_large_file "$file" "$size_kb"; then
            ((truncated_count++))
        fi
        
        # Compress if large
        if compress_large_file "$file" "$size_kb"; then
            ((compressed_count++))
        fi
        
        echo ""
    fi
done

# Also check archived files
echo "📁 Checking archived files..."
for file in "$MEMORY_DIR"/archive/*.md "$MEMORY_DIR"/archive/*.md.gz; do
    if [ -f "$file" ]; then
        ((processed_count++))
        
        size_kb=$(check_file_size "$file")
        echo "📄 Processing archived: $(basename "$file") (${size_kb}KB)"
        
        if [ $size_kb -gt $COMPRESS_THRESHOLD_KB ]; then
            compress_large_file "$file" "$size_kb"
            ((compressed_count++))
        fi
    fi
done

echo "✅ Memory management complete!"
echo "📊 Summary:"
echo "   - Files processed: $processed_count"
echo "   - Files truncated: $truncated_count" 
echo "   - Files compressed: $compressed_count"
echo ""
echo "💡 Memory files now optimized for token efficiency!"