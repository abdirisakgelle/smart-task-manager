#!/bin/bash

# Script to convert all route files from CommonJS to ES modules

echo "Converting route files to ES modules..."

# Function to update a route file
update_route_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Replace require statements with imports
    sed -E '
        # Replace const express = require('express') with import express from 'express'
        s/const express = require\('"'"'express'"'"'\);/import express from '"'"'express'"'"';/
        
        # Replace const router = express.Router() with const router = express.Router()
        s/const router = express\.Router\(\);/const router = express.Router();/
        
        # Replace require statements for controllers
        s/const ([a-zA-Z]+)Controller = require\('"'"'\.\.\/controllers\/([a-zA-Z]+)Controller'"'"'\);/import \1Controller from '"'"'..\/controllers\/\2Controller.js'"'"';/
        
        # Replace require statements for middleware
        s/const \{ ([^}]+) \} = require\('"'"'\.\.\/middleware\/([a-zA-Z]+)'"'"'\);/import { \1 } from '"'"'..\/middleware\/\2.js'"'"';/
        
        # Replace module.exports = router with export default router
        s/module\.exports = router;/export default router;/
    ' "$file" > "$temp_file"
    
    # Move temporary file back to original
    mv "$temp_file" "$file"
}

# Process all route files
for file in routes/*.js; do
    if [ -f "$file" ]; then
        update_route_file "$file"
    fi
done

echo "Route files conversion completed!"
