#!/bin/bash

# Script to fix route imports to use correct ES module syntax

echo "Fixing route imports..."

# Function to fix imports in a route file
fix_route_imports() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Fix controller imports to use namespace import
    sed -E '
        # Fix import controllerName from '../controllers/controllerName.js' to import * as controllerName from '../controllers/controllerName.js'
        s/import ([a-zA-Z_][a-zA-Z0-9_]*) from '"'"'\.\.\/controllers\/([a-zA-Z]+)Controller\.js'"'"';/import * as \1 from '"'"'..\/controllers\/\2Controller.js'"'"';/
    ' "$file" > "$temp_file"
    
    # Move temporary file back to original
    mv "$temp_file" "$file"
}

# Process all route files
for file in routes/*.js; do
    if [ -f "$file" ]; then
        fix_route_imports "$file"
    fi
done

echo "Route imports fixed!"
