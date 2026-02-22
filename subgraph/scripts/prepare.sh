#!/bin/bash
# Subgraph preparation script
# Reads deployed contract addresses and prepares subgraph configuration

set -e

NETWORK=${1:-sepolia}
CONFIG_FILE="config/${NETWORK}.json"
DEPLOYMENTS_FILE="../docs/deployments.json"

echo "📋 Preparing subgraph for network: $NETWORK"

# Check if deployments file exists
if [ ! -f "$DEPLOYMENTS_FILE" ]; then
  echo "❌ Deployments file not found: $DEPLOYMENTS_FILE"
  echo "Please deploy contracts first: cd contracts && npm run deploy:${NETWORK}"
  exit 1
fi

# Detect the correct key in deployments.json
# Your deployments.json uses keys like: "sepolia-11155111"
CHAIN_ID_DEFAULT=""
case "$NETWORK" in
  sepolia) CHAIN_ID_DEFAULT="11155111" ;;
  goerli)  CHAIN_ID_DEFAULT="5" ;;
  localhost) CHAIN_ID_DEFAULT="31337" ;;
  *) CHAIN_ID_DEFAULT="" ;;
esac

DEPLOY_KEY=""
if [ -n "$CHAIN_ID_DEFAULT" ]; then
  DEPLOY_KEY="${NETWORK}-${CHAIN_ID_DEFAULT}"
fi

# If key not found, try fallback: find first key that matches "${NETWORK}-"
if ! jq -e ".\"${DEPLOY_KEY}\"" "$DEPLOYMENTS_FILE" >/dev/null 2>&1; then
  DEPLOY_KEY=$(jq -r "keys[] | select(startswith(\"${NETWORK}-\"))" "$DEPLOYMENTS_FILE" | head -n 1)
fi

if [ -z "$DEPLOY_KEY" ] || [ "$DEPLOY_KEY" = "null" ]; then
  echo "❌ Could not find deployments entry for network '$NETWORK' in $DEPLOYMENTS_FILE"
  echo "   Expected a key like '${NETWORK}-<chainId>' (e.g., 'sepolia-11155111')"
  echo "   Available keys:"
  jq -r 'keys[]' "$DEPLOYMENTS_FILE" | sed 's/^/   - /'
  exit 1
fi

echo "🔎 Using deployments key: $DEPLOY_KEY"

# Extract addresses from your deployments.json structure
FACTORY_ADDRESS=$(jq -r ".\"${DEPLOY_KEY}\".contracts.TokenFactory.address" "$DEPLOYMENTS_FILE")
SWAP_ADDRESS=$(jq -r ".\"${DEPLOY_KEY}\".contracts.SimpleSwap.address" "$DEPLOYMENTS_FILE")

# Try to get start blocks if present (not present in your file -> fallback to 0)
FACTORY_START_BLOCK=$(jq -r ".\"${DEPLOY_KEY}\".contracts.TokenFactory.blockNumber // .\"${DEPLOY_KEY}\".TokenFactory.blockNumber // 0" "$DEPLOYMENTS_FILE")
SWAP_START_BLOCK=$(jq -r ".\"${DEPLOY_KEY}\".contracts.SimpleSwap.blockNumber // .\"${DEPLOY_KEY}\".SimpleSwap.blockNumber // 0" "$DEPLOYMENTS_FILE")

# Validate addresses
if [ -z "$FACTORY_ADDRESS" ] || [ "$FACTORY_ADDRESS" = "null" ] || \
   [ -z "$SWAP_ADDRESS" ] || [ "$SWAP_ADDRESS" = "null" ]; then
  echo "❌ Contract addresses not found in deployments file"
  echo "   Looked for:"
  echo "   - .\"${DEPLOY_KEY}\".contracts.TokenFactory.address"
  echo "   - .\"${DEPLOY_KEY}\".contracts.SimpleSwap.address"
  exit 1
fi

echo "✅ Found TokenFactory: $FACTORY_ADDRESS (start block $FACTORY_START_BLOCK)"
echo "✅ Found SimpleSwap:   $SWAP_ADDRESS (start block $SWAP_START_BLOCK)"

# Update config file
mkdir -p "$(dirname "$CONFIG_FILE")"
cat > "$CONFIG_FILE" <<EOF
{
  "network": "$NETWORK",
  "deploymentsKey": "$DEPLOY_KEY",
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
