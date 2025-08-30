#!/bin/bash

# Script to fix all export statements in the codebase

echo "Fixing all export statements..."

# Function to fix exports in a file
fix_exports() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Fix export syntax for function declarations
    sed -E '
        # Fix export functionName = to export const functionName =
        s/^export ([a-zA-Z_][a-zA-Z0-9_]*) =/export const \1 =/
    ' "$file" > "$temp_file"
    
    # Move temporary file back to original
    mv "$temp_file" "$file"
}

# Process all JavaScript files
find . -name "*.js" -not -path "./node_modules/*" -not -path "./.git/*" | while read file; do
    if [ -f "$file" ]; then
        fix_exports "$file"
    fi
done

echo "All export statements fixed!"
