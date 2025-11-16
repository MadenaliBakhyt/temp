# Architecture Overview

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         FRONTEND (React)                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐ │
│  │   Create   │  │    Swap    │  │  Balances  │  │  Analytics │ │
│  │   Tokens   │  │   Tokens   │  │            │  │            │ │
│  └────────────┘  └────────────┘  └────────────┘  └────────────┘ │
│         │                │               │               │       │
│         └────────────────┴───────────────┴───────────────┘       │
│                          │                                       │
│                    wagmi/viem                                    │
└──────────────────────────┼───────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────┐
│                    ETHEREUM BLOCKCHAIN                          │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │  TokenFactory    │      │   SimpleSwap     │               │
│  │                  │      │                  │               │
│  │ • createToken()  │      │ • listToken()    │               │
│  │ • getAllTokens() │      │ • buyToken()     │               │
│  │ • getMyTokens()  │      │ • sellToken()    │               │
│  └────────┬─────────┘      └─────────┬────────┘               │
│           │                          │                         │
│           │ deploys                  │ uses                    │
│           ▼                          ▼                         │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │   YourToken      │◄─────│   YourToken      │               │
│  │   (Instance 1)   │      │   (Instance 2)   │               │
│  └──────────────────┘      └──────────────────┘               │
│           │                          │                         │
│           └──────────────────────────┘                         │
│                       │                                        │
│                   Emit Events                                  │
└───────────────────────┼────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                      THE GRAPH                                  │
│                                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                     Subgraph                              │  │
│  │  • Index TokenCreated, Bought, Sold events               │  │
│  │  • Store: Token, MarketStat, UserActivity, Trade        │  │
│  │  • Provide GraphQL API                                   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────────┐
│                    SIWE BACKEND                                 │
│                                                                 │
│  ┌──────────────────┐      ┌──────────────────┐               │
│  │   Auth Routes    │      │  Profile Routes  │               │
│  │                  │      │                  │               │
│  │ • POST /login    │      │ • POST /profile  │               │
│  │   (SIWE verify)  │      │ • GET /profile   │               │
│  └──────────────────┘      └─────────┬────────┘               │
│                                      │                         │
│                                      ▼                         │
│                            ┌──────────────────┐                │
│                            │   SQLite DB      │                │
│                            │  (via Prisma)    │                │
│                            │                  │                │
│                            │ • User profiles  │                │
│                            │ • Nicknames      │                │
│                            │ • Avatar URLs    │                │
│                            └──────────────────┘                │
└─────────────────────────────────────────────────────────────────┘
```

## Component Interactions

### 1. Token Creation Flow

```
User → Frontend → TokenFactory.createToken()
                      │
                      ├─► Deploy new YourToken
                      │   • Set owner to msg.sender
                      │   • Mint initialSupply
                      │   • Enforce cap
                      │
                      ├─► Store in allTokens[]
                      ├─► Store in tokensByOwner[]
                      │
                      └─► Emit TokenCreated event
                              │
                              └─► The Graph indexes event
```

### 2. Token Listing Flow (Admin)

```
Admin → Frontend → SimpleSwap.listToken()
                      │
                      ├─► Validate token address
                      ├─► Validate rate > 0
                      ├─► Create TokenInfo
                      ├─► Add to listedTokens[]
                      │
                      └─► Emit Listed event
                              │
                              └─► The Graph indexes event
```

### 3. Buy Flow

```
User → Frontend → SimpleSwap.buyToken{value: ethAmount}
                      │
                      ├─► Check token is listed
                      ├─► Calculate: tokensOut = ethIn * tokenPerEth / 1e18
                      ├─► Check token liquidity
                      │
                      ├─► Update pool balances:
                      │   • tokenBalance -= tokensOut
                      │   • ethBalance += ethIn
                      │
                      ├─► Transfer tokens to user
                      │
                      └─► Emit Bought event
                              │
                              └─► The Graph indexes event
```

### 4. Sell Flow

```
User → Frontend → 1. YourToken.approve(swap, amount)
                  2. SimpleSwap.sellToken(token, amount)
                      │
                      ├─► Check token is listed
                      ├─► Calculate: ethOut = tokensIn * 1e18 / tokenPerEth
                      ├─► Check ETH liquidity
                      ├─► Check minEthLiquidity
                      │
                      ├─► Update pool balances:
                      │   • tokenBalance += tokensIn
                      │   • ethBalance -= ethOut
                      │
                      ├─► Transfer tokens from user
                      ├─► Transfer ETH to user
                      │
                      └─► Emit Sold event
                              │
                              └─► The Graph indexes event
```

### 5. SIWE Authentication Flow

```
User → Frontend → 1. Request SIWE message
                  2. Sign with wallet
                  3. POST /login {message, signature}
                      │
                      ├─► Backend verifies signature
                      ├─► Extract wallet address
                      ├─► Generate JWT/session
                      │
                      └─► Return auth token
                              │
                              └─► Frontend stores token
                                  │
                                  └─► Use for profile operations
```

### 6. Analytics Flow

```
The Graph Subgraph → GraphQL API → Frontend
        │
        ├─► Query: totalTokensCreated
        ├─► Query: topTokensByVolume
        ├─► Query: recentTrades
        ├─► Query: userActivity
        │
        └─► Frontend renders charts/tables
```

## Data Flow Diagram

```
┌──────────┐
│  Wallet  │
└────┬─────┘
     │
     ▼
┌──────────────────────────────────────────────┐
│            Smart Contracts                   │
│  ┌─────────────┐  ┌────────────────────┐    │
│  │ TokenFactory│  │   SimpleSwap       │    │
│  └──────┬──────┘  └──────┬─────────────┘    │
│         │                │                   │
│         ├── Events ──────┤                   │
└─────────┼────────────────┼───────────────────┘
          │                │
          ▼                ▼
    ┌──────────────────────────┐
    │      The Graph           │
    │    (Event Indexer)       │
    └──────────┬───────────────┘
               │
               ▼
    ┌──────────────────────┐
    │   GraphQL API        │
    └──────────┬───────────┘
               │
               ▼
    ┌──────────────────────┐
    │   Frontend (React)   │
    └──────────────────────┘
```

## Contract Relationships

```
TokenFactory
    │
    ├─► YourToken (Instance 1)
    │       │
    │       ├─► ERC20 (OpenZeppelin)
    │       └─► Ownable (OpenZeppelin)
    │
    ├─► YourToken (Instance 2)
    │       │
    │       └─► ...
    │
    └─► YourToken (Instance N)

SimpleSwap
    │
    ├─► Ownable (OpenZeppelin)
    ├─► ReentrancyGuard (OpenZeppelin)
    │
    └─► Uses YourToken instances
            │
            └─► IERC20 interface
```

## State Management

### TokenFactory State

```solidity
address[] public allTokens;
mapping(address => address[]) public tokensByOwner;
```

**Invariants:**
- Each token in `allTokens` exists in exactly one `tokensByOwner` array
- Token addresses are unique
- Tokens cannot be removed (immutable history)

### SimpleSwap State

```solidity
mapping(address => TokenInfo) public tokens;
address[] public listedTokens;

struct TokenInfo {
    bool isListed;
    uint256 tokenPerEth;
    uint256 minEthLiquidity;
    uint256 tokenBalance;
    uint256 ethBalance;
}
```

**Invariants:**
- `tokenBalance` = actual token balance in contract
- `ethBalance` <= contract's ETH balance
- `ethBalance` >= `minEthLiquidity` (enforced on sell/withdraw)
- `isListed == true` ⟺ token exists in `listedTokens[]`

### YourToken State

```solidity
uint8 private immutable _decimals;
uint256 public immutable cap;
// + ERC20 state (balances, allowances, totalSupply)
```

**Invariants:**
- `totalSupply() <= cap` (always)
- `cap` is immutable
- `decimals` is immutable

## Security Model

### Access Control Layers

```
┌─────────────────────────────────────────┐
│ Layer 1: Network (Testnet Only)        │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Layer 2: Smart Contract Access         │
│  • Owner-only functions (Ownable)      │
│  • Token approval pattern (ERC20)      │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Layer 3: Reentrancy Protection         │
│  • ReentrancyGuard on critical fns     │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Layer 4: Business Logic Validation     │
│  • Cap enforcement                      │
│  • Liquidity minimums                   │
│  • Rate validation                      │
│  • Balance checks                       │
└─────────────────────────────────────────┘
           │
           ▼
┌─────────────────────────────────────────┐
│ Layer 5: Safe Transfer Patterns        │
│  • SafeERC20 for token transfers       │
│  • Call pattern for ETH transfers      │
└─────────────────────────────────────────┘
```

### Trust Boundaries

```
Untrusted:
  • User inputs
  • External contract calls
  • Token contracts (even though we deploy them)

Partially Trusted:
  • SimpleSwap owner (admin)
  • YourToken owner (per-token admin)

Trusted:
  • OpenZeppelin contracts
  • Solidity compiler
  • EVM
```

## Event-Driven Architecture

All state changes emit events for:

1. **Frontend UI Updates**: Real-time feedback
2. **The Graph Indexing**: Analytics and history
3. **Audit Trail**: Transparency and debugging

```
Contract State Change
    │
    ├─► Emit Event
    │       │
    │       ├─► Frontend listens
    │       │       └─► Update UI
    │       │
    │       └─► The Graph indexes
    │               └─► Update entities
    │
    └─► Transaction receipt
```

## Scaling Considerations

### Current Architecture

- **Pattern**: Factory for token creation
- **Liquidity**: Centralized pools in SimpleSwap
- **Storage**: On-chain (expensive)
- **Queries**: The Graph (off-chain indexing)

### Future Improvements

1. **Decentralized Liquidity**: Uniswap-style AMM
2. **Upgrade Patterns**: Proxy contracts
3. **Cross-chain**: Bridge integration
4. **Layer 2**: Deploy to Optimism/Arbitrum

## Integration Points

### Frontend → Contracts

```typescript
// Using wagmi + viem
import { useContractWrite } from 'wagmi';
import { TokenFactoryAbi } from './abi';

const { write } = useContractWrite({
  address: FACTORY_ADDRESS,
  abi: TokenFactoryAbi.abi,
  functionName: 'createToken',
});
```

### The Graph → Frontend

```typescript
// GraphQL query
const query = gql`
  query GetTokens {
    tokens(first: 10, orderBy: totalCreated, orderDirection: desc) {
      id
      name
      symbol
      creator
    }
  }
`;
```

### Backend → Contracts (SIWE Verification)

```typescript
import { SiweMessage } from 'siwe';
import { ethers } from 'ethers';

// Verify signature
const message = new SiweMessage(body.message);
await message.verify({ signature: body.signature });
```

## Deployment Strategy

```
1. Deploy Contracts
   ├─► TokenFactory
   └─► SimpleSwap
       │
       └─► Save addresses to deployments.json

2. Copy ABIs
   └─► Run copy-abis script

3. Deploy Subgraph
   ├─► Update subgraph.yaml with addresses
   ├─► Run graph codegen
   ├─► Run graph build
   └─► Run graph deploy

4. Configure Backend
   ├─► Set up database (Prisma migrate)
   └─► Start server

5. Configure Frontend
   ├─► Update .env with addresses
   └─► Start dev server

6. Test End-to-End
   ├─► Create token
   ├─► List token (admin)
   ├─► Add liquidity (admin)
   ├─► Buy/sell tokens
   └─► Check analytics
```

## Technology Stack Summary

| Layer | Technology | Purpose |
|-------|-----------|---------|
| Smart Contracts | Solidity 0.8.24 | Core business logic |
| Development | Hardhat | Compilation, testing, deployment |
| Testing | Chai + Ethers | Contract testing |
| Security | OpenZeppelin | Battle-tested contracts |
| Indexing | The Graph | Event indexing & querying |
| Frontend | React 18 + Vite | User interface |
| Wallet | wagmi + viem | Blockchain interactions |
| Backend | Express + TypeScript | SIWE authentication |
| Database | SQLite + Prisma | Profile storage |
| Network | Sepolia/Goerli | Ethereum testnets |
