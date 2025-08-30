#!/bin/bash

# Script to fix export syntax in controller files

echo "Fixing export syntax in controller files..."

# Function to fix a controller file
fix_controller_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Fix export syntax
    sed -E '
        # Fix export functionName = to export functionName =
        s/^export ([a-zA-Z_][a-zA-Z0-9_]*) =/export \1 =/
    ' "$file" > "$temp_file"
    
    # Move temporary file back to original
    mv "$temp_file" "$file"
}

# Process all controller files
for file in controllers/*.js; do
    if [ -f "$file" ]; then
        fix_controller_file "$file"
    fi
done

echo "Controller export syntax fixed!"
