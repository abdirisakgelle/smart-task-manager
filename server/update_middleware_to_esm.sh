#!/bin/bash

# Script to convert all middleware files from CommonJS to ES modules

echo "Converting middleware files to ES modules..."

# Function to update a middleware file
update_middleware_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Replace require statements with imports
    sed -E '
        # Replace require statements for config files
        s/const \{ ([^}]+) \} = require\('"'"'\.\.\/config\/([a-zA-Z]+)'"'"'\);/import { \1 } from '"'"'..\/config\/\2.js'"'"';/
        s/const ([a-zA-Z_][a-zA-Z0-9_]*) = require\('"'"'\.\.\/config\/([a-zA-Z]+)'"'"'\);/import \1 from '"'"'..\/config\/\2.js'"'"';/
        
        # Replace other require statements
        s/const pool = require\('"'"'\.\.\/config\/db'"'"'\);/import pool from '"'"'..\/config\/db.js'"'"';/
        s/const bcrypt = require\('"'"'bcryptjs'"'"'\);/import bcrypt from '"'"'bcryptjs'"'"';/
        s/const jwt = require\('"'"'jsonwebtoken'"'"'\);/import jwt from '"'"'jsonwebtoken'"'"';/
        
        # Replace exports.functionName with export functionName
        s/exports\.([a-zA-Z_][a-zA-Z0-9_]*) =/export \1 =/
        
        # Replace module.exports = { ... } with export { ... }
        s/module\.exports = \{/export {/
    ' "$file" > "$temp_file"
    
    # Move temporary file back to original
    mv "$temp_file" "$file"
}

# Process all middleware files
for file in middleware/*.js; do
    if [ -f "$file" ]; then
        update_middleware_file "$file"
    fi
done

echo "Middleware files conversion completed!"
