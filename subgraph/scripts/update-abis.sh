#!/bin/bash

# ABI Update Script
# This script copies ABIs from the contracts directory

set -e

CONTRACTS_DIR="../contracts/abis"
ABIS_DIR="./abis"

echo "📋 Updating ABIs from contracts directory"

# Check if contracts ABIs exist
if [ ! -d "$CONTRACTS_DIR" ]; then
  echo "❌ Contracts ABIs directory not found: $CONTRACTS_DIR"
  echo "Please compile contracts first: cd contracts && npm run compile"
  exit 1
fi

# Create ABIs directory if it doesn't exist
mkdir -p "$ABIS_DIR"

# Copy ABIs
echo "Copying TokenFactory.json..."
cp "$CONTRACTS_DIR/TokenFactory.json" "$ABIS_DIR/"

echo "Copying SimpleSwap.json..."
cp "$CONTRACTS_DIR/SimpleSwap.json" "$ABIS_DIR/"

echo "Copying YourToken.json..."
cp "$CONTRACTS_DIR/YourToken.json" "$ABIS_DIR/"

echo "✅ ABIs updated successfully"
