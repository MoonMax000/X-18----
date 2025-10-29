#!/bin/bash

# Apply migration 009 to Railway PostgreSQL database
# This script connects directly using railway connect

echo "Connecting to Railway PostgreSQL database..."
echo ""
echo "Paste the following SQL commands when psql connects:"
echo ""
cat apply-migration-009-now.sql
echo ""
echo "After pasting, type \\q to exit"
echo ""
echo "Starting Railway PostgreSQL connection..."

cd custom-backend && railway connect postgres
