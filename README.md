# TokenFactory & SimpleSwap dApp

> Complete Web3 starter with ERC-20 token factory, DEX, SIWE authentication, and The Graph analytics

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.20-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0-orange)](https://openzeppelin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 🎯 Project Overview

A full-stack decentralized application where users can:

- ✅ **Create ERC-20 tokens** via a factory contract (custom decimals, cap, initial supply)
- ✅ **Swap tokens for ETH** at fixed rates via a simple DEX
- ✅ **Manage user profiles** with Sign-In with Ethereum (SIWE)
- 🔲 **View analytics** of on-chain activity via The Graph subgraph

**Target Network**: Sepolia Testnet (Goerli supported)

## 📁 Repository Structure

```
/crypto-dapp
├── /contracts          ✅ COMPLETE - Smart contracts (Solidity + Hardhat)
│   ├── /contracts         • YourToken.sol (ERC-20 with cap)
│   │                      • TokenFactory.sol (factory pattern)
│   │                      • SimpleSwap.sol (DEX with liquidity)
│   ├── /test              • Comprehensive test suite (50+ tests)
│   ├── /scripts           • Deploy, verify, copy-abis
│   └── README.md          • Full documentation
│
├── /dapp               🔲 TODO - React + Vite + TypeScript frontend
│   └── /src/abi           (ABIs will be copied here)
│
├── /server             ✅ COMPLETE - Express + SIWE backend
│   ├── /src               • Auth routes, profile routes
│   │                      • SIWE verification, JWT tokens
│   │                      • IPFS helper (mocked)
│   ├── /prisma            • SQLite database for profiles
│   └── README.md          • Full API documentation
│
├── /subgraph           🔲 TODO - The Graph indexing
│   └── schema.graphql     (GraphQL schema for analytics)
│
├── /docs               ✅ COMPLETE - Documentation
│   ├── deployments.json   • Contract addresses (populated on deploy)
│   ├── API.md             • Contract API reference
│   └── ARCHITECTURE.md    • System architecture diagrams
│
└── README.md           ✅ This file
```

## ✅ What's Been Completed

### Smart Contracts (Production-Ready)

All contracts are fully implemented, tested, and documented:

#### 1. **YourToken.sol** (~75 lines)
- ERC-20 token with capped supply
- Owner-controlled minting (up to cap)
- Public burning functionality
- Custom decimals support
- Based on OpenZeppelin 5.0

#### 2. **TokenFactory.sol** (~65 lines)
- Factory pattern for deploying tokens
- Tracks all created tokens
- Tracks tokens by owner
- Events for indexing

#### 3. **SimpleSwap.sol** (~300 lines)
- Simple DEX for token-ETH swaps
- Fixed exchange rates (admin-controlled)
- Buy/sell with automatic rate calculation
- Liquidity management (admin)
- Minimum liquidity enforcement
- ReentrancyGuard protection
- SafeERC20 for secure transfers

### Test Suite

**50+ comprehensive tests** covering:

✅ Token creation (happy paths + edge cases)
✅ Access control (owner/non-owner)
✅ Token listing/unlisting
✅ Liquidity management
✅ Buy/sell flows
✅ Rate updates
✅ Security (reentrancy, validation, caps)
✅ Edge cases (multiple users, consecutive ops)

### Scripts

✅ **deploy.ts** - Multi-network deployment with JSON output
✅ **verify.ts** - Automated Etherscan verification
✅ **copy-abis.ts** - Extract ABIs for frontend integration

### Smart Contract Documentation

✅ **README.md** - Complete setup guide
✅ **QUICKSTART.md** - 5-minute quick start
✅ **API.md** - Full contract API reference
✅ **ARCHITECTURE.md** - System architecture with diagrams
✅ **deployments.json** - Deployment tracking

### SIWE Backend (Production-Ready)

All backend services are fully implemented:

#### Authentication System (~150 lines)
- **SIWE Verification**: Cryptographic signature verification with ethers.js
- **JWT Sessions**: 7-day token expiry, configurable via environment
- **Session Storage**: Database tracking for logout functionality
- **Nonce Generation**: Cryptographically secure random nonces

#### Profile Management (~180 lines)
- **User Profiles**: Nickname (50 char max) and avatar URL
- **IPFS Integration**: Base64 upload with 5MB limit (mock + real IPFS ready)
- **Public Access**: View any profile by wallet address
- **Authenticated Updates**: Only owner can update their profile

#### Security & Middleware (~200 lines)
- **Helmet**: XSS, clickjacking, and other attack protections
- **CORS**: Configurable origin whitelist for production
- **Rate Limiting**: 100 requests per 15 minutes per IP
- **Zod Validation**: Type-safe request validation with detailed error messages
- **Error Handling**: Global error handler with development/production modes

#### Database (Prisma + SQLite)
- **User Model**: walletAddress (unique), nickname, avatarUrl, timestamps
- **Session Model**: token (unique), walletAddress, expiresAt
- **Migrations**: Automatic schema management
- **Seeding**: Sample data for testing

#### API Endpoints
```
Authentication:
  POST   /api/auth/login      - SIWE login
  POST   /api/auth/logout     - Invalidate session
  GET    /api/auth/verify     - Verify token
  GET    /api/auth/nonce      - Get nonce (optional)

Profile:
  GET    /api/profile/:address - Get public profile
  GET    /api/profile          - Get own profile (auth)
  POST   /api/profile          - Update profile (auth)
  POST   /api/profile/avatar   - Upload avatar (auth)
  DELETE /api/profile/avatar   - Remove avatar (auth)
```

### Backend Documentation

✅ **README.md** - Full API reference with examples
✅ **QUICKSTART.md** - 5-minute setup guide
✅ **ARCHITECTURE.md** - Request/response flow diagrams
✅ **requests.http** - Sample API requests for testing

## 🚀 Quick Start

### Smart Contracts

### Prerequisites

- Node.js 20+
- MetaMask wallet
- Sepolia testnet ETH ([get from faucet](https://sepoliafaucet.com/))

### Installation

```bash
cd contracts
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env`:
```env
PRIVATE_KEY=your-wallet-private-key-here
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### Compile & Test

```bash
npm run compile
npm run test
```

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

Output example:
```
🚀 Starting deployment...

📋 Deployment Info:
  Network: sepolia (chainId: 11155111)
  Deployer: 0x1234...
  Balance: 0.5 ETH

📦 Deploying TokenFactory...
  ✅ TokenFactory deployed to: 0xabcd...

📦 Deploying SimpleSwap...
  ✅ SimpleSwap deployed to: 0xef12...

📝 Deployment Summary:
============================================================
Network:        sepolia (11155111)
TokenFactory:   0xabcd...
SimpleSwap:     0xef12...
Deployer:       0x1234...
============================================================

💾 Deployment data saved to: /docs/deployments.json

✅ Deployment complete!
```

### Copy ABIs

```bash
npm run copy-abis
```

This copies contract ABIs to `../dapp/src/abi/` for frontend integration.

### Backend (SIWE Server)

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your JWT_SECRET and other configs

# Set up database
npm run prisma:generate
npm run prisma:migrate
npm run db:seed  # Optional: add sample users

# Start server
npm run dev
```

Server starts at: **http://localhost:3001**

Test it:
```bash
curl http://localhost:3001/health
```

See [server/README.md](./server/README.md) for full API documentation.

## 📋 Contract Features

### YourToken

```solidity
// Create a token
constructor(
    string name,           // "My Token"
    string symbol,         // "MTK"
    uint8 decimals,        // 18
    uint256 initialSupply, // 1000 tokens
    uint256 cap,           // 10000 tokens max
    address owner          // your address
)

// Functions
mint(address to, uint256 amount)  // owner only
burn(uint256 amount)               // anyone can burn their tokens
```

### TokenFactory

```solidity
// Create a new token
createToken(name, symbol, decimals, initialSupply, cap)
  → returns token address

// Query functions
getAllTokens() → address[]
getMyTokens(owner) → address[]
totalTokens() → uint256
```

### SimpleSwap

```solidity
// Admin functions (owner only)
listToken(token, tokenPerEth, minEthLiquidity)
unlistToken(token)
setRate(token, newTokenPerEth)
addLiquidity(token, tokenAmount) payable
withdraw(token, tokenAmount, ethAmount)

// User functions
buyToken(token) payable
sellToken(token, amount)
previewBuy(token, ethAmount) → tokens
previewSell(token, tokenAmount) → eth
```

## 🧪 Test Coverage

```
TokenFactory
  ✓ 20 tests covering:
    - Token creation
    - Event emissions
    - Ownership
    - Tracking
    - Edge cases

SimpleSwap
  ✓ 30+ tests covering:
    - Listing/unlisting
    - Liquidity management
    - Buy/sell flows
    - Access control
    - Security
    - Edge cases
```

Run tests:
```bash
cd contracts
npm run test
```

Expected: **All tests passing ✅**

## 🔒 Security Features

✅ **OpenZeppelin 5.0** - Battle-tested contracts
✅ **ReentrancyGuard** - Protection on buy/sell/withdraw
✅ **Ownable** - Access control for admin functions
✅ **SafeERC20** - Safe token transfers
✅ **Input Validation** - Extensive parameter checks
✅ **Cap Enforcement** - Prevents over-minting
✅ **Minimum Liquidity** - Prevents pool drainage

## 📊 Gas Optimization

- Compiler optimization: 200 runs, viaIR enabled
- Efficient storage layout
- Minimal loops in view functions
- Events for off-chain indexing

## 🌐 Network Support

| Network | Chain ID | Status | Faucet |
|---------|----------|--------|--------|
| Sepolia | 11155111 | ✅ Supported | [Get ETH](https://sepoliafaucet.com/) |
| Goerli | 5 | ✅ Supported | [Get ETH](https://goerlifaucet.com/) |
| Localhost | 31337 | ✅ Supported | `npx hardhat node` |

## 📚 Documentation

| Document | Description |
|----------|-------------|
| [contracts/README.md](./contracts/README.md) | Complete contracts guide |
| [contracts/QUICKSTART.md](./contracts/QUICKSTART.md) | 5-minute setup |
| [docs/API.md](./docs/API.md) | Full API reference |
| [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) | System architecture |
| [docs/deployments.json](./docs/deployments.json) | Deployment addresses |

## 🔄 Workflows

### Create Token Flow
```
User → TokenFactory.createToken()
  → Deploy YourToken with user as owner
  → Mint initial supply to user
  → Track in allTokens[] and tokensByOwner[]
  → Emit TokenCreated event
```

### Buy Token Flow
```
User → SimpleSwap.buyToken{value: 1 ETH}
  → Calculate: tokens = 1 ETH × rate
  → Transfer tokens to user
  → Add ETH to pool
  → Emit Bought event
```

### Sell Token Flow
```
User → 1. YourToken.approve(swap, amount)
       2. SimpleSwap.sellToken(token, amount)
  → Calculate: eth = amount ÷ rate
  → Check minimum liquidity
  → Transfer tokens from user
  → Transfer ETH to user
  → Emit Sold event
```

## 🛠️ Available Scripts (Contracts)

```bash
# Compilation
npm run compile          # Compile contracts
npm run clean            # Clean artifacts

# Testing
npm run test             # Run all tests
npm run coverage         # Test coverage report

# Deployment
npm run deploy:sepolia   # Deploy to Sepolia
npm run deploy:goerli    # Deploy to Goerli
npm run deploy:localhost # Deploy to local network

# Post-deployment
npm run verify:sepolia   # Verify on Etherscan
npm run copy-abis        # Copy ABIs to dApp

# Development
npm run node             # Start local Hardhat node
```

## 📦 Tech Stack

### Contracts
- **Solidity**: 0.8.24
- **Framework**: Hardhat 2.20+
- **Testing**: Chai + Ethers v6
- **Security**: OpenZeppelin 5.0
- **TypeScript**: 5.3+

### Frontend (TODO)
- React 18 + Vite
- wagmi + viem
- TypeScript

### Backend (TODO)
- Node.js 20 + Express
- SIWE authentication
- Prisma + SQLite

### Indexing (TODO)
- The Graph
- AssemblyScript mappings
- GraphQL API

## 🎯 Next Steps

### For Smart Contracts ✅
- [x] Implement YourToken
- [x] Implement TokenFactory
- [x] Implement SimpleSwap
- [x] Write comprehensive tests
- [x] Create deployment scripts
- [x] Write documentation
- [ ] Deploy to Sepolia (run `npm run deploy:sepolia`)
- [ ] Verify on Etherscan (run `npm run verify:sepolia`)

### For Backend ✅
- [x] Set up Express + TypeScript
- [x] Implement SIWE authentication
- [x] Implement JWT session management
- [x] Create profile management API
- [x] Set up Prisma + SQLite
- [x] Add IPFS helper (mock)
- [x] Add security middleware (Helmet, CORS, rate limiting)
- [x] Write API documentation
- [ ] Deploy to production (Vercel/Railway/Render)

### For Frontend 🔲
- [ ] Set up React + Vite + TypeScript
- [ ] Configure wagmi + viem
- [ ] Implement ConnectButton
- [ ] Create pages (Home, CreateToken, Swap, etc.)
- [ ] Integrate with smart contracts

### For Backend 🔲
- [ ] Set up Express + TypeScript
- [ ] Implement SIWE authentication
- [ ] Set up Prisma + SQLite
- [ ] Create profile endpoints
- [ ] (Optional) Add IPFS for avatars

### For The Graph 🔲
- [ ] Define GraphQL schema
- [ ] Write AssemblyScript mappings
- [ ] Deploy subgraph to The Graph
- [ ] Integrate GraphQL queries in frontend

## 💡 Usage Examples

See [docs/API.md](./docs/API.md) for detailed examples including:

- Creating tokens with the factory
- Listing tokens on the DEX
- Adding liquidity
- Buying and selling tokens
- Managing user profiles (SIWE)
- Querying analytics (The Graph)

## 🐛 Troubleshooting

### Common Issues

**"Insufficient funds for gas"**
- Get testnet ETH from [Sepolia Faucet](https://sepoliafaucet.com/)

**"Nonce too high"**
- Reset MetaMask: Settings → Advanced → Reset Account

**"Network mismatch"**
- Check RPC URL in `.env`
- Ensure MetaMask is on the correct network

**Tests failing?**
```bash
npm run clean
npm install
npm run compile
npm run test
```

## ⚠️ Security Notice

**TESTNET ONLY** - These contracts are for educational and testing purposes.

Before deploying to mainnet:
1. Get a professional security audit
2. Add comprehensive integration tests
3. Test thoroughly on testnets
4. Consider upgradability patterns
5. Set up multisig for admin operations
6. Review all admin functions
7. Add circuit breakers/pause mechanisms

## 📜 License

MIT License - see LICENSE file for details

## 🤝 Contributing

This is a production-ready starter template. Feel free to:
- Fork and customize for your needs
- Submit issues for bugs
- Propose improvements via PRs

## 📞 Support

- **Documentation**: See `/docs` folder
- **Contract Issues**: Check [contracts/README.md](./contracts/README.md)
- **Quick Help**: See [contracts/QUICKSTART.md](./contracts/QUICKSTART.md)

## 🎉 What You Get

✅ Production-ready smart contracts
✅ Comprehensive test suite (50+ tests)
✅ Automated deployment scripts
✅ Full documentation
✅ TypeScript support
✅ Gas-optimized code
✅ Security best practices
✅ Event-driven for indexing
✅ Multi-network support
✅ Etherscan verification

---

**Status**: Smart contracts complete and ready to deploy! 🚀

**Next**: Set up the frontend, backend, and subgraph to complete the full-stack dApp.

Built with ❤️ using Solidity, Hardhat, and OpenZeppelin
