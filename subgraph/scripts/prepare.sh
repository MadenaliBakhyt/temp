#!/bin/bash

# Subgraph preparation script
# This script reads deployed contract addresses and prepares the subgraph configuration

set -e

NETWORK=${1:-sepolia}
CONFIG_FILE="config/${NETWORK}.json"
DEPLOYMENTS_FILE="../contracts/docs/deployments.json"

echo "📋 Preparing subgraph for network: $NETWORK"

# Check if deployments file exists
if [ ! -f "$DEPLOYMENTS_FILE" ]; then
  echo "❌ Deployments file not found: $DEPLOYMENTS_FILE"
  echo "Please deploy contracts first: cd contracts && npm run deploy:${NETWORK}"
  exit 1
fi

# Extract addresses and start blocks from deployments file
FACTORY_ADDRESS=$(jq -r ".${NETWORK}.TokenFactory.address" "$DEPLOYMENTS_FILE")
SWAP_ADDRESS=$(jq -r ".${NETWORK}.SimpleSwap.address" "$DEPLOYMENTS_FILE")
FACTORY_START_BLOCK=$(jq -r ".${NETWORK}.TokenFactory.blockNumber" "$DEPLOYMENTS_FILE")
SWAP_START_BLOCK=$(jq -r ".${NETWORK}.SimpleSwap.blockNumber" "$DEPLOYMENTS_FILE")

# Validate addresses
if [ "$FACTORY_ADDRESS" = "null" ] || [ "$SWAP_ADDRESS" = "null" ]; then
  echo "❌ Contract addresses not found in deployments file"
  exit 1
fi

echo "✅ Found TokenFactory: $FACTORY_ADDRESS (block $FACTORY_START_BLOCK)"
echo "✅ Found SimpleSwap: $SWAP_ADDRESS (block $SWAP_START_BLOCK)"

# Update config file
cat > "$CONFIG_FILE" <<EOF
{
  "network": "$NETWORK",
  "factoryAddress": "$FACTORY_ADDRESS",
  "swapAddress": "$SWAP_ADDRESS",
  "factoryStartBlock": $FACTORY_START_BLOCK,
  "swapStartBlock": $SWAP_START_BLOCK
}
EOF

echo "✅ Updated $CONFIG_FILE"

# Generate subgraph.yaml from template
npm run prepare:${NETWORK}

echo "✅ Generated subgraph.yaml for $NETWORK"
echo ""
echo "🎯 Next steps:"
echo "  1. npm run codegen    # Generate TypeScript types"
echo "  2. npm run build      # Build the subgraph"
echo "  3. npm run deploy     # Deploy to The Graph Studio"
