# TokenFactory Subgraph

> The Graph protocol indexer for TokenFactory & SimpleSwap dApp

## 📊 Overview

This subgraph indexes all on-chain events from the TokenFactory and SimpleSwap smart contracts, providing a GraphQL API for:

- **Token Creation**: Track all ERC-20 tokens created via the factory
- **Trading Activity**: Monitor all buy/sell swaps on the DEX
- **Liquidity Management**: Index liquidity additions, removals, and rate changes
- **User Analytics**: Aggregate user activity across all interactions
- **Protocol Statistics**: Global metrics for the entire protocol
- **Time-Series Data**: Daily aggregated statistics for charting

## 🏗️ Architecture

### Entities

The subgraph defines 7 main entity types:

1. **Token** - ERC-20 tokens with DEX listing info and aggregated stats
2. **User** - Wallet addresses with creation, trading, and liquidity stats
3. **Swap** - Individual buy/sell transactions
4. **LiquidityEvent** - Liquidity additions, removals, and delist events
5. **ProtocolStats** - Protocol-wide aggregated statistics (singleton)
6. **DailyStats** - Daily aggregated metrics for time-series analysis

### Event Handlers

**TokenFactory Events:**
- `TokenCreated` → Creates Token and updates User/Protocol stats

**SimpleSwap Events:**
- `Listed` → Marks token as listed, creates initial LiquidityEvent
- `Delisted` → Marks token as unlisted, creates delist LiquidityEvent
- `LiquidityAdded` → Updates token balances, creates LiquidityEvent
- `LiquidityRemoved` → Updates token balances, creates LiquidityEvent
- `RateUpdated` → Updates token exchange rate
- `Bought` → Creates Swap entity, updates all relevant stats
- `Sold` → Creates Swap entity, updates all relevant stats

## 🚀 Quick Start

### Prerequisites

- Node.js 16+
- npm or yarn
- Deployed TokenFactory & SimpleSwap contracts
- The Graph Studio account (https://thegraph.com/studio/)

### Installation

```bash
# Install dependencies
npm install

# Authenticate with The Graph Studio (first time only)
npm run auth
# Enter your deploy key when prompted
```

### Configuration

1. **Deploy Contracts First**

   Make sure you've deployed the smart contracts:
   ```bash
   cd ../contracts
   npm run deploy:sepolia
   ```

2. **Update Network Configuration**

   The deployment script automatically reads from `contracts/docs/deployments.json`:
   ```bash
   bash scripts/prepare.sh sepolia
   ```

   Or manually update `config/sepolia.json`:
   ```json
   {
     "network": "sepolia",
     "factoryAddress": "0x...",
     "swapAddress": "0x...",
     "factoryStartBlock": 123456,
     "swapStartBlock": 123457
   }
   ```

### Build & Deploy

#### Automated Deployment

```bash
# Deploy to Sepolia
bash scripts/deploy-subgraph.sh sepolia

# Deploy to Goerli
bash scripts/deploy-subgraph.sh goerli
```

#### Manual Steps

```bash
# 1. Update ABIs from contracts
bash scripts/update-abis.sh

# 2. Prepare configuration
bash scripts/prepare.sh sepolia

# 3. Generate TypeScript types
npm run codegen

# 4. Build the subgraph
npm run build

# 5. Deploy to The Graph Studio
npm run deploy
```

## 📝 Example Queries

### Get All Tokens

```graphql
{
  tokens(first: 10, orderBy: createdAt, orderDirection: desc) {
    id
    name
    symbol
    decimals
    creator {
      id
    }
    isListed
    totalBuyVolume
    totalSellVolume
  }
}
```

### Get Token Details with Recent Swaps

```graphql
{
  token(id: "0x...") {
    name
    symbol
    isListed
    tokenPerEth
    ethBalance
    tokenBalance
    swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
      type
      user {
        id
      }
      ethAmount
      tokenAmount
      timestamp
    }
  }
}
```

### Get User Activity

```graphql
{
  user(id: "0x...") {
    tokensCreated {
      name
      symbol
      createdAt
    }
    totalBuys
    totalSells
    totalBuyVolume
    totalSellVolume
    totalLiquidityAdded
    swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
      type
      token {
        symbol
      }
      ethAmount
      tokenAmount
    }
  }
}
```

### Get Protocol Statistics

```graphql
{
  protocolStats(id: "1") {
    totalTokensCreated
    totalTokensListed
    totalSwaps
    totalVolumeETH
    totalUsers
    totalTraders
    currentTotalLiquidityETH
  }
}
```

### Get Daily Stats for Charts

```graphql
{
  dailyStats(
    first: 30
    orderBy: date
    orderDirection: desc
  ) {
    date
    tokensCreated
    swaps
    volumeETH
    liquidityAddedETH
    activeUsers
  }
}
```

### Search Listed Tokens

```graphql
{
  tokens(
    where: { isListed: true }
    orderBy: totalBuyVolume
    orderDirection: desc
  ) {
    id
    name
    symbol
    tokenPerEth
    ethBalance
    tokenBalance
    totalBuyCount
    totalSellCount
  }
}
```

### Get Recent Liquidity Events

```graphql
{
  liquidityEvents(
    first: 10
    orderBy: timestamp
    orderDirection: desc
  ) {
    type
    token {
      name
      symbol
    }
    provider {
      id
    }
    ethAmount
    tokenAmount
    timestamp
  }
}
```

## 🔧 Development

### Project Structure

```
subgraph/
├── schema.graphql              # GraphQL schema definitions
├── subgraph.yaml               # Generated config (gitignored)
├── subgraph.template.yaml      # Template for config generation
├── package.json                # Dependencies and scripts
├── tsconfig.json               # TypeScript configuration
├── src/
│   ├── token-factory.ts        # TokenFactory event handlers
│   ├── simple-swap.ts          # SimpleSwap event handlers
│   └── utils.ts                # Helper functions
├── config/
│   ├── sepolia.json           # Sepolia network config
│   └── goerli.json            # Goerli network config
└── scripts/
    ├── prepare.sh             # Prepare subgraph config
    ├── update-abis.sh         # Copy ABIs from contracts
    └── deploy-subgraph.sh     # Complete deployment workflow
```

### Local Development

For local development with Graph Node:

```bash
# Start Graph Node (requires Docker)
# See: https://github.com/graphprotocol/graph-node

# Create local subgraph
npm run create:local

# Deploy to local node
npm run deploy:local

# Query at http://localhost:8000/subgraphs/name/tokenfactory-subgraph
```

### Testing

```bash
# Run Matchstick tests (coming soon)
npm test
```

## 📚 Schema Reference

### Token

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Token contract address (lowercase) |
| `name` | String! | Token name |
| `symbol` | String! | Token symbol |
| `decimals` | Int! | Token decimals |
| `initialSupply` | BigInt! | Initial minted supply |
| `cap` | BigInt! | Maximum supply cap |
| `creator` | User! | Token creator |
| `isListed` | Boolean! | Listed on DEX |
| `tokenPerEth` | BigInt | Exchange rate (if listed) |
| `ethBalance` | BigInt | DEX ETH liquidity |
| `tokenBalance` | BigInt | DEX token liquidity |
| `totalBuyVolume` | BigInt! | Cumulative buy volume (ETH) |
| `totalSellVolume` | BigInt! | Cumulative sell volume (ETH) |
| `swaps` | [Swap!]! | All swaps for this token |

### User

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Wallet address (lowercase) |
| `tokensCreated` | [Token!]! | Tokens created by user |
| `totalTokensCreated` | Int! | Count of tokens created |
| `totalBuys` | Int! | Count of buy transactions |
| `totalSells` | Int! | Count of sell transactions |
| `totalBuyVolume` | BigInt! | Cumulative buy volume (ETH) |
| `totalSellVolume` | BigInt! | Cumulative sell volume (ETH) |
| `totalLiquidityAdded` | BigInt! | Cumulative liquidity added (ETH) |
| `swaps` | [Swap!]! | All user swaps |

### Swap

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Transaction hash + log index |
| `token` | Token! | Token being swapped |
| `user` | User! | User performing swap |
| `type` | SwapType! | BUY or SELL |
| `ethAmount` | BigInt! | ETH amount |
| `tokenAmount` | BigInt! | Token amount |
| `timestamp` | BigInt! | Block timestamp |

### ProtocolStats

| Field | Type | Description |
|-------|------|-------------|
| `id` | ID! | Always "1" (singleton) |
| `totalTokensCreated` | Int! | All tokens created |
| `totalTokensListed` | Int! | Currently listed tokens |
| `totalSwaps` | Int! | All swap transactions |
| `totalVolumeETH` | BigInt! | Total trading volume (ETH) |
| `totalUsers` | Int! | Unique wallet addresses |
| `currentTotalLiquidityETH` | BigInt! | Current total liquidity |

## 🌐 Deployment Targets

### The Graph Studio (Recommended)

1. Create subgraph at https://thegraph.com/studio/
2. Authenticate: `npm run auth`
3. Deploy: `bash scripts/deploy-subgraph.sh sepolia`
4. Publish to decentralized network via Studio UI

### Hosted Service (Deprecated)

The Graph Hosted Service is being sunset. Use Studio instead.

### Self-Hosted Graph Node

For enterprise deployments, run your own Graph Node:
- https://github.com/graphprotocol/graph-node

## 🔍 Monitoring & Debugging

### Check Sync Status

Query the subgraph meta:
```graphql
{
  _meta {
    block {
      number
      hash
    }
    deployment
    hasIndexingErrors
  }
}
```

### View Indexing Errors

Check The Graph Studio dashboard for:
- Indexing status
- Sync progress
- Error logs
- Query analytics

### Common Issues

**Subgraph fails to sync:**
- Check contract addresses in config
- Verify start blocks are correct
- Ensure ABIs match deployed contracts

**Missing data:**
- Check if events are being emitted on-chain
- Verify event signatures match ABI
- Review handler logic in mappings

**Build errors:**
- Run `npm run codegen` after schema changes
- Update ABIs: `bash scripts/update-abis.sh`
- Clear cache: `rm -rf build generated`

## 📊 Integration with Frontend

Update your frontend `.env`:

```bash
# Add your subgraph endpoint
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<YOUR_SUBGRAPH_ID>/tokenfactory-subgraph/v1.0.0
```

Example frontend query:

```typescript
import { request, gql } from 'graphql-request';

const SUBGRAPH_URL = import.meta.env.VITE_SUBGRAPH_URL;

const query = gql`
  {
    tokens(first: 10, orderBy: createdAt, orderDirection: desc) {
      id
      name
      symbol
      isListed
    }
  }
`;

const data = await request(SUBGRAPH_URL, query);
```

## 🔐 Security Considerations

- Subgraph code is public and immutable after deployment
- No sensitive data should be indexed
- All addresses are lowercase normalized
- BigInt used for token amounts to prevent overflow
- Null checks for optional fields

## 📄 License

MIT

## 🤝 Contributing

Contributions welcome! Please:

1. Fork the repository
2. Create a feature branch
3. Add tests for new functionality
4. Submit a pull request

## 📞 Support

- [The Graph Discord](https://discord.gg/graphprotocol)
- [Documentation](https://thegraph.com/docs/)
- [GitHub Issues](https://github.com/yourusername/tokenfactory-subgraph/issues)

---

Built with [The Graph](https://thegraph.com/) 📊
