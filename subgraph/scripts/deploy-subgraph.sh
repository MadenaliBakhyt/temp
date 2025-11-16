#!/bin/bash

# Subgraph Deployment Script
# This script handles the complete deployment workflow

set -e

NETWORK=${1:-sepolia}
SUBGRAPH_NAME=${2:-tokenfactory-subgraph}

echo "🚀 Deploying subgraph: $SUBGRAPH_NAME to $NETWORK"
echo ""

# Step 1: Update ABIs
echo "Step 1: Updating ABIs..."
bash scripts/update-abis.sh
echo ""

# Step 2: Prepare configuration
echo "Step 2: Preparing configuration..."
bash scripts/prepare.sh "$NETWORK"
echo ""

# Step 3: Generate code
echo "Step 3: Generating TypeScript types..."
npm run codegen
echo ""

# Step 4: Build
echo "Step 4: Building subgraph..."
npm run build
echo ""

# Step 5: Deploy
echo "Step 5: Deploying to The Graph Studio..."
echo "⚠️  Make sure you've authenticated with: npm run auth"
echo ""
read -p "Press Enter to continue with deployment or Ctrl+C to cancel..."

npm run deploy

echo ""
echo "✅ Subgraph deployed successfully!"
echo "🔍 View your subgraph at: https://thegraph.com/studio/subgraph/$SUBGRAPH_NAME"
