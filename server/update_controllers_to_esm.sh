#!/bin/bash

# Script to convert all controller files from CommonJS to ES modules

echo "Converting controller files to ES modules..."

# Function to update a controller file
update_controller_file() {
    local file="$1"
    echo "Processing: $file"
    
    # Create a temporary file
    temp_file="${file}.tmp"
    
    # Replace require statements with imports
    sed -E '
        # Replace const pool = require('../config/db') with import pool from '../config/db.js'
        s/const pool = require\('"'"'\.\.\/config\/db'"'"'\);/import pool from '"'"'..\/config\/db.js'"'"';/
        
        # Replace other require statements
        s/const bcrypt = require\('"'"'bcryptjs'"'"'\);/import bcrypt from '"'"'bcryptjs'"'"';/
        s/const \{ generateToken, verifyToken, isTokenExpired \} = require\('"'"'\.\.\/config\/jwt'"'"'\);/import { generateToken, verifyToken, isTokenExpired } from '"'"'..\/config\/jwt.js'"'"';/
        s/const jwt = require\('"'"'jsonwebtoken'"'"'\);/import jwt from '"'"'jsonwebtoken'"'"';/
        s/const moment = require\('"'"'moment-timezone'"'"'\);/import moment from '"'"'moment-timezone'"'"';/
        s/const cron = require\('"'"'node-cron'"'"'\);/import cron from '"'"'node-cron'"'"';/
        
        # Replace exports.functionName with export functionName
        s/exports\.([a-zA-Z_][a-zA-Z0-9_]*) =/export \1 =/
        
        # Replace module.exports = { ... } with export { ... }
        s/module\.exports = \{/export {/
    ' "$file" > "$temp_file"
    
    # Move temporary file back to original
    mv "$temp_file" "$file"
}

# Process all controller files
for file in controllers/*.js; do
    if [ -f "$file" ]; then
        update_controller_file "$file"
    fi
done

echo "Controller files conversion completed!"
