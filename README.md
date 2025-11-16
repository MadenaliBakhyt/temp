# TokenFactory & SimpleSwap dApp

> Complete Web3 starter with ERC-20 token factory, DEX, SIWE authentication, and The Graph analytics

[![Solidity](https://img.shields.io/badge/Solidity-0.8.24-blue)](https://soliditylang.org/)
[![Hardhat](https://img.shields.io/badge/Hardhat-2.20-yellow)](https://hardhat.org/)
[![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.0-orange)](https://openzeppelin.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](https://opensource.org/licenses/MIT)

## 🎯 What This Project Does

A production-ready full-stack decentralized application where users can:

- ✅ **Create ERC-20 tokens** via a factory contract (custom decimals, cap, initial supply)
- ✅ **Swap tokens for ETH** at fixed rates via a simple DEX
- ✅ **Manage user profiles** with Sign-In with Ethereum (SIWE)
- ✅ **View analytics** of on-chain activity via The Graph subgraph

**Target Network**: Sepolia Testnet (Goerli also supported)

---

## 🚀 Quick Start - Run Everything in 10 Minutes

Choose your preferred method:

### Option 1: Docker (Fastest - Recommended for Testing)

```bash
# 1. Clone the repository
git clone <your-repo-url>
cd temp

# 2. Start all services
docker-compose -f docker-compose.dev.yml up

# 3. Access the application
# Frontend: http://localhost:5173
# Backend: http://localhost:3001
# Contracts: Running on local Hardhat node
```

**Note**: Docker setup runs on a local blockchain. For Sepolia testnet deployment, use Option 2.

### Option 2: Manual Setup (Full Control)

Follow the step-by-step guide below for complete setup on Sepolia testnet.

---

## 📋 Prerequisites - What You Need Before Starting

### Required Software

| Tool | Version | Download | Purpose |
|------|---------|----------|---------|
| **Node.js** | 20+ | [nodejs.org](https://nodejs.org/) | Run JavaScript/TypeScript |
| **Git** | Latest | [git-scm.com](https://git-scm.com/) | Clone repository |
| **MetaMask** | Latest | [metamask.io](https://metamask.io/) | Crypto wallet |

### Required Accounts (Free)

| Service | Purpose | Sign Up |
|---------|---------|---------|
| **Alchemy** or **Infura** | Ethereum RPC provider | [alchemy.com](https://www.alchemy.com/) |
| **Etherscan** | Contract verification | [etherscan.io/apis](https://etherscan.io/apis) |
| **The Graph Studio** | Subgraph hosting | [thegraph.com/studio](https://thegraph.com/studio/) |

### Required Testnet Assets

- **Sepolia ETH**: Get free testnet ETH from [sepoliafaucet.com](https://sepoliafaucet.com/)
  - You'll need ~0.5 ETH for contract deployment and testing
  - Get your wallet address from MetaMask

### Verify Prerequisites

Check that everything is installed:

```bash
node --version    # Should show v20.x.x or higher
npm --version     # Should show 9.x.x or higher
git --version     # Should show 2.x.x or higher
```

---

## 🎬 Complete Setup Guide - From Zero to Running

### Step 1: Clone and Navigate

```bash
# Clone the repository
git clone <your-repo-url>
cd temp

# Verify you have all folders
ls -la
# You should see: contracts/, server/, dapp/, subgraph/, docs/
```

---

## 🔧 Part 1: Smart Contracts Setup (15 minutes)

### Step 1.1: Install Contract Dependencies

```bash
cd contracts
npm install
```

**Expected output**: `added 500+ packages` (this may take 2-3 minutes)

### Step 1.2: Create Environment File

```bash
cp .env.example .env
```

Edit the `.env` file:

```bash
# Open with your editor (VS Code, nano, vim, etc.)
nano .env
# or
code .env
```

Fill in these values:

```env
# Your wallet private key (from MetaMask: Settings > Security & Privacy > Show Private Key)
# ⚠️ NEVER share this or commit to git! Only use for testnet!
PRIVATE_KEY=your_64_character_private_key_here

# Get from Alchemy.com: Create App > Sepolia > View Key > HTTPS URL
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY

# Get from Etherscan.io: My API Keys > Add
ETHERSCAN_API_KEY=your_etherscan_api_key_here
```

**Security Note**: Never use your mainnet wallet private key! Create a new wallet for testing.

### Step 1.3: Test Compilation

```bash
npm run compile
```

**Expected output**:
```
Compiled 15 Solidity files successfully
```

### Step 1.4: Run Tests

```bash
npm test
```

**Expected output**: 50+ passing tests (takes 10-20 seconds)

```
  TokenFactory
    ✓ should create token (1234ms)
    ✓ should track tokens by owner
    ...

  50 passing (15s)
```

### Step 1.5: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

**Expected output**:
```
🚀 Starting deployment...

📋 Deployment Info:
  Network: sepolia (chainId: 11155111)
  Deployer: 0x1234...
  Balance: 0.5 ETH

📦 Deploying TokenFactory...
  ✅ TokenFactory deployed to: 0xABCD1234...

📦 Deploying SimpleSwap...
  ✅ SimpleSwap deployed to: 0xEF567890...

💾 Deployment data saved to: docs/deployments.json

✅ Deployment complete!
```

**IMPORTANT**: Save these addresses! You'll need them for the next steps.

### Step 1.6: Verify Contracts (Optional but Recommended)

```bash
npm run verify:sepolia
```

This makes your contracts readable on Etherscan.

### Step 1.7: Copy ABIs for Frontend

```bash
npm run copy-abis
```

This copies contract interfaces to the frontend folder.

**✅ Contracts Complete!** You now have working smart contracts on Sepolia.

---

## 🖥️ Part 2: Backend Setup (10 minutes)

### Step 2.1: Navigate and Install

```bash
# From the contracts folder, go back and into server
cd ../server
npm install
```

### Step 2.2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:

```bash
nano .env
# or
code .env
```

Fill in:

```env
# Server configuration
PORT=3001
NODE_ENV=development

# JWT Secret - Generate a random 32+ character string
# Use this command to generate: openssl rand -hex 32
JWT_SECRET=your_random_secret_key_at_least_32_characters_long
SESSION_EXPIRY=7d

# CORS - Allow frontend to connect
CORS_ORIGIN=http://localhost:5173,http://localhost:3000

# Database (SQLite for local development)
DATABASE_URL=file:./dev.db

# IPFS Configuration (mock mode for development)
IPFS_MOCK=true
IPFS_STORAGE_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2.3: Set Up Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations to create database tables
npm run prisma:migrate

# (Optional) Seed with sample data
npm run db:seed
```

**Expected output**:
```
✔ Generated Prisma Client
✔ Database migrations applied
✔ Seeded database with 3 sample users
```

### Step 2.4: Start Backend Server

```bash
npm run dev
```

**Expected output**:
```
🚀 Server running on http://localhost:3001
📊 Environment: development
🔒 CORS enabled for: http://localhost:5173
```

**Test it**: Open a new terminal and run:

```bash
curl http://localhost:3001/health
```

**Expected response**: `{"status":"healthy","timestamp":"2024-..."}`

**✅ Backend Complete!** Leave this terminal running and open a new one for the next steps.

---

## 🎨 Part 3: Frontend Setup (5 minutes)

### Step 3.1: Navigate and Install

```bash
# Open a NEW terminal (keep backend running in the other)
cd dapp  # or cd ../dapp if coming from server/
npm install
```

### Step 3.2: Create Environment File

```bash
cp .env.example .env
```

Edit `.env`:

```bash
nano .env
# or
code .env
```

Fill in with your deployed contract addresses:

```env
# Network Configuration
VITE_CHAIN_ID=11155111

# Contract Addresses (from your deployment in Part 1)
# Check contracts/docs/deployments.json for these addresses
VITE_FACTORY_ADDRESS=0xYourTokenFactoryAddressHere
VITE_SWAP_ADDRESS=0xYourSimpleSwapAddressHere

# Backend API URL
VITE_BACKEND_URL=http://localhost:3001/api

# The Graph Subgraph (leave empty for now, we'll add in Part 4)
VITE_SUBGRAPH_URL=

# WalletConnect Project ID (optional - for mobile wallet support)
# Get from https://cloud.walletconnect.com/
VITE_WALLETCONNECT_PROJECT_ID=
```

**How to get contract addresses**:

```bash
# View deployed addresses
cat ../contracts/docs/deployments.json
```

Copy the addresses from the `sepolia` section.

### Step 3.3: Start Frontend

```bash
npm run dev
```

**Expected output**:
```
  VITE v5.0.0  ready in 500 ms

  ➜  Local:   http://localhost:5173/
  ➜  Network: use --host to expose
  ➜  press h to show help
```

### Step 3.4: Test the Application

1. **Open browser**: Go to http://localhost:5173
2. **Connect wallet**: Click "Connect Wallet" in top right
3. **Switch to Sepolia**: If prompted, switch network in MetaMask
4. **Sign in**: Sign the SIWE message
5. **Test token creation**:
   - Go to "Create Token"
   - Fill in: Name="Test Token", Symbol="TEST", Decimals=18, Initial=1000, Cap=10000
   - Click "Create Token"
   - Confirm in MetaMask
   - Wait for confirmation

**✅ Frontend Complete!** You now have a working dApp interface.

---

## 📊 Part 4: Subgraph Setup (20 minutes)

### Step 4.1: Create The Graph Studio Account

1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Connect your wallet (same wallet you used for deployment)
3. Click "Create a Subgraph"
4. Name: `tokenfactory-subgraph`
5. Click "Create Subgraph"
6. Copy your **Deploy Key** (you'll need this in a moment)

### Step 4.2: Navigate and Install

```bash
# Open a NEW terminal
cd subgraph  # or cd ../subgraph
npm install
```

### Step 4.3: Authenticate

```bash
npm run auth
```

When prompted, paste your **Deploy Key** from The Graph Studio.

### Step 4.4: Prepare Configuration

```bash
# This automatically reads your deployed contract addresses
bash scripts/prepare.sh sepolia
```

**Expected output**:
```
📋 Preparing subgraph for network: sepolia
✅ Found TokenFactory: 0xABCD... (block 123456)
✅ Found SimpleSwap: 0xEF56... (block 123457)
✅ Updated config/sepolia.json
✅ Generated subgraph.yaml for sepolia
```

### Step 4.5: Build and Deploy

```bash
# Generate TypeScript types
npm run codegen

# Build the subgraph
npm run build

# Deploy to The Graph Studio
npm run deploy
```

**Expected output**:
```
✔ Build completed: build/schema.graphql
✔ Apply migrations: Migrations successfully applied.
✔ Deploy to The Graph Studio

Build completed: QmABC123...

Deployed to https://thegraph.com/studio/subgraph/tokenfactory-subgraph

Subgraph endpoints:
Queries (HTTP): https://api.studio.thegraph.com/query/<ID>/tokenfactory-subgraph/v0.0.1
```

### Step 4.6: Wait for Sync

1. Go to The Graph Studio dashboard
2. Wait for "Synced" status (may take 5-10 minutes)
3. Once synced, you'll see indexed entities

### Step 4.7: Update Frontend with Subgraph URL

```bash
cd ../dapp
nano .env  # or code .env
```

Add the Subgraph URL:

```env
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<ID>/tokenfactory-subgraph/v0.0.1
```

Restart the frontend (Ctrl+C in the frontend terminal, then `npm run dev` again).

**✅ Subgraph Complete!** Your dApp now has real-time analytics.

---

## ✅ Verification Checklist

Make sure everything is working:

### Backend (Terminal 1)

```bash
cd server
npm run dev
# Should show: 🚀 Server running on http://localhost:3001
```

### Frontend (Terminal 2)

```bash
cd dapp
npm run dev
# Should show: ➜  Local:   http://localhost:5173/
```

### Browser Tests

Open http://localhost:5173 and verify:

- [ ] ✅ Page loads without errors
- [ ] ✅ "Connect Wallet" button works
- [ ] ✅ MetaMask opens and connects
- [ ] ✅ Network shows "Sepolia"
- [ ] ✅ SIWE sign-in works
- [ ] ✅ Can navigate to all pages (Home, Create Token, Swap, Admin, Profile, Analytics)

### Test Full Flow

1. **Create a token**:
   ```
   Go to "Create Token"
   Fill: Name="MyToken", Symbol="MTK", Decimals=18, Initial=1000, Cap=10000
   Click "Create Token"
   Confirm in MetaMask
   Wait for success message
   ```

2. **List token on DEX** (Admin only - you're the deployer):
   ```
   Go to "Admin"
   Enter your token address (copy from success message)
   Set rate: e.g., 1000 (means 1 ETH = 1000 tokens)
   Enter liquidity: e.g., 0.1 ETH worth of tokens
   Click "List Token"
   Confirm approvals and listing in MetaMask
   ```

3. **Test swap**:
   ```
   Go to "Swap"
   Select your token
   Enter amount: e.g., 0.01 ETH
   Click "Buy"
   Confirm in MetaMask
   Check your balance updated
   ```

4. **Check analytics**:
   ```
   Go to "Analytics"
   Should see your token listed
   Should see your swap transaction
   ```

---

## 🎯 What You Can Do Now

### For Users

- **Create ERC-20 Tokens**: Navigate to "Create Token" page
- **Trade Tokens**: Buy/sell listed tokens on "Swap" page
- **Manage Profile**: Set nickname and avatar on "Profile" page
- **View Analytics**: See all activity on "Analytics" page

### For Admins (Contract Deployer)

- **List Tokens**: Add tokens to the DEX on "Admin" page
- **Manage Liquidity**: Add/remove liquidity
- **Update Rates**: Change exchange rates
- **Delist Tokens**: Remove tokens from DEX

### View on Blockchain

- **Etherscan**: https://sepolia.etherscan.io/address/YOUR_CONTRACT_ADDRESS
- **The Graph Studio**: https://thegraph.com/studio/subgraph/tokenfactory-subgraph

---

## 📁 Project Structure

```
temp/
├── contracts/          Smart contracts (Solidity + Hardhat)
│   ├── contracts/         • YourToken.sol, TokenFactory.sol, SimpleSwap.sol
│   ├── test/              • 50+ comprehensive tests
│   ├── scripts/           • deploy.ts, verify.ts, copy-abis.ts
│   └── docs/              • deployments.json (contract addresses)
│
├── server/             Backend (Express + SIWE + Prisma)
│   ├── src/               • Auth routes, profile routes, middleware
│   ├── prisma/            • Database schema and migrations
│   └── uploads/           • User avatar storage (mock IPFS)
│
├── dapp/               Frontend (React + Vite + wagmi)
│   ├── src/
│   │   ├── pages/         • Home, CreateToken, Swap, Admin, Profile, Analytics
│   │   ├── components/    • ConnectButton, Layout, SwapForm, etc.
│   │   ├── hooks/         • useAuth, useTokenFactory, useSimpleSwap, useToken
│   │   └── abi/           • Contract ABIs (copied from contracts/)
│   └── public/            • Static assets
│
├── subgraph/           The Graph indexer (AssemblyScript)
│   ├── schema.graphql     • GraphQL schema (6 entities)
│   ├── src/               • Event handlers for indexing
│   ├── scripts/           • Deployment automation
│   └── config/            • Network configurations
│
└── docs/               Documentation
    ├── API.md             • Contract API reference
    ├── ARCHITECTURE.md    • System architecture
    └── deployments.json   • Deployed contract addresses
```

---

## 🛠️ Common Commands Reference

### Contracts

```bash
cd contracts

# Development
npm run compile              # Compile contracts
npm test                     # Run tests
npm run coverage             # Test coverage report

# Deployment
npm run deploy:sepolia       # Deploy to Sepolia
npm run deploy:goerli        # Deploy to Goerli
npm run verify:sepolia       # Verify on Etherscan
npm run copy-abis            # Copy ABIs to frontend

# Local testing
npm run node                 # Start local Hardhat node
npm run deploy:localhost     # Deploy to local node
```

### Backend

```bash
cd server

# Development
npm run dev                  # Start dev server (hot reload)
npm run build                # Build for production
npm start                    # Start production server

# Database
npm run prisma:generate      # Generate Prisma client
npm run prisma:migrate       # Run migrations
npm run prisma:studio        # Open database GUI
npm run db:seed              # Seed sample data
npm run db:reset             # Reset database

# Testing
npm test                     # Run tests
```

### Frontend

```bash
cd dapp

# Development
npm run dev                  # Start dev server (hot reload)
npm run build                # Build for production
npm run preview              # Preview production build

# Linting
npm run lint                 # Run ESLint
```

### Subgraph

```bash
cd subgraph

# Setup
npm run auth                 # Authenticate with The Graph Studio
bash scripts/prepare.sh sepolia  # Prepare config from deployed contracts

# Build & Deploy
npm run codegen              # Generate TypeScript types
npm run build                # Build subgraph
npm run deploy               # Deploy to The Graph Studio

# Local development
npm run create:local         # Create on local Graph Node
npm run deploy:local         # Deploy to local Graph Node
```

---

## 🐳 Alternative: Run Everything with Docker

If you prefer Docker (local blockchain only):

### Development Mode (Hot Reload)

```bash
# Start everything
docker-compose -f docker-compose.dev.yml up

# Access:
# - Frontend: http://localhost:5173
# - Backend: http://localhost:3001
# - Local blockchain: http://localhost:8545

# Stop everything
docker-compose -f docker-compose.dev.yml down
```

### Production Mode

```bash
# Build and start
docker-compose up -d

# Access:
# - Frontend: http://localhost
# - Backend: http://localhost:3001

# Stop
docker-compose down
```

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

---

## 🔧 Troubleshooting

### "Insufficient funds for gas"

**Problem**: Not enough Sepolia ETH

**Solution**: Get more from [sepoliafaucet.com](https://sepoliafaucet.com/)

### "Network mismatch" in MetaMask

**Problem**: Wrong network selected

**Solution**: Switch to Sepolia in MetaMask network dropdown

### Backend won't start - "Port 3001 already in use"

**Problem**: Another process using port 3001

**Solution**:
```bash
# Find and kill the process
lsof -ti:3001 | xargs kill -9

# Or change port in server/.env
PORT=3002
```

### Frontend shows "Contract not found"

**Problem**: ABIs not copied or wrong addresses

**Solution**:
```bash
# Copy ABIs again
cd contracts
npm run copy-abis

# Verify addresses in dapp/.env match contracts/docs/deployments.json
cat contracts/docs/deployments.json
```

### Subgraph not syncing

**Problem**: Wrong contract addresses or start blocks

**Solution**:
```bash
cd subgraph
# Regenerate config
bash scripts/prepare.sh sepolia
# Redeploy
npm run build && npm run deploy
```

### MetaMask transaction fails

**Problem**: Various reasons

**Solutions**:
- Check you have enough Sepolia ETH
- Reset MetaMask account: Settings → Advanced → Reset Account
- Increase gas limit in MetaMask

### Database errors in backend

**Problem**: Database schema issues

**Solution**:
```bash
cd server
# Reset database
rm -rf prisma/dev.db
npm run prisma:migrate
npm run db:seed
```

---

## 📚 Additional Documentation

| Document | Description |
|----------|-------------|
| [contracts/README.md](./contracts/README.md) | Smart contracts deep dive |
| [server/README.md](./server/README.md) | Backend API reference |
| [dapp/README.md](./dapp/README.md) | Frontend architecture |
| [subgraph/README.md](./subgraph/README.md) | Subgraph deployment guide |
| [subgraph/QUERIES.md](./subgraph/QUERIES.md) | 50+ GraphQL query examples |
| [DOCKER.md](./DOCKER.md) | Docker deployment guide |
| [DEPLOYMENT.md](./DEPLOYMENT.md) | Production deployment guide |

---

## 🎓 Learning Resources

### Understanding the Code

- **Smart Contracts**: Read [contracts/README.md](./contracts/README.md) for contract architecture
- **Backend Auth**: See [server/src/routes/auth.ts](./server/src/routes/auth.ts) for SIWE implementation
- **Frontend Hooks**: Check [dapp/src/hooks/](./dapp/src/hooks/) for contract interaction patterns
- **Subgraph Indexing**: Review [subgraph/src/](./subgraph/src/) for event handling

### External Documentation

- **Solidity**: https://docs.soliditylang.org/
- **Hardhat**: https://hardhat.org/docs
- **React + Vite**: https://vitejs.dev/guide/
- **wagmi**: https://wagmi.sh/
- **The Graph**: https://thegraph.com/docs/
- **SIWE**: https://docs.login.xyz/

---

## 🌟 Tech Stack

### Smart Contracts
- **Solidity** 0.8.24 - Smart contract language
- **Hardhat** 2.20+ - Development environment
- **OpenZeppelin** 5.0 - Security-audited contract libraries
- **Ethers.js** v6 - Ethereum interactions
- **Chai** - Testing framework

### Frontend
- **React** 18 - UI framework
- **Vite** 5 - Build tool (super fast)
- **TypeScript** 5.3+ - Type safety
- **wagmi** 2.5+ - Ethereum React hooks
- **viem** 2.7+ - Ethereum utilities
- **Tailwind CSS** - Utility-first styling
- **React Router** - Client-side routing
- **TanStack Query** - Data caching

### Backend
- **Node.js** 20 - Runtime
- **Express** - Web framework
- **TypeScript** 5.3+ - Type safety
- **Prisma** - Database ORM
- **SQLite** - Database (dev) / PostgreSQL (prod)
- **SIWE** - Ethereum authentication
- **JWT** - Session tokens
- **Helmet** - Security headers
- **Zod** - Runtime validation

### Indexing
- **The Graph** - Decentralized indexing
- **AssemblyScript** - Mapping language
- **GraphQL** - Query language

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Reverse proxy / static hosting

---

## ⚠️ Important Notes

### Security

- **Testnet Only**: These contracts are for educational purposes
- **Private Keys**: NEVER commit `.env` files or share private keys
- **Mainnet Warning**: Do NOT deploy to mainnet without:
  - Professional security audit
  - Thorough testing
  - Understanding all code
  - Proper key management

### Gas Costs (Sepolia Testnet)

Estimated gas usage:
- Deploy TokenFactory: ~800,000 gas
- Deploy SimpleSwap: ~1,200,000 gas
- Create Token: ~500,000 gas
- List Token: ~200,000 gas
- Buy/Sell: ~100,000 gas

Total for full deployment: ~0.3 Sepolia ETH

### Rate Limits

- **Backend API**: 100 requests per 15 minutes per IP
- **The Graph**: 1000 queries per day (free tier)

---

## 🤝 Contributing

Contributions welcome! This is a starter template - customize it for your needs.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing`)
5. Open a Pull Request

---

## 📄 License

MIT License - see [LICENSE](./LICENSE) file for details

---

## 🎉 What You've Built

✅ **3 Smart Contracts** with comprehensive tests (50+)
✅ **Backend API** with SIWE authentication
✅ **React Frontend** with 7 pages and wallet integration
✅ **The Graph Subgraph** for real-time analytics
✅ **Docker Setup** for easy deployment
✅ **Full Documentation** for every component

**Total**: 130+ files, 7,000+ lines of production-ready code

---

## 🚀 Next Steps

Now that everything is running:

1. **Customize**: Modify contracts, add features, change UI
2. **Deploy to Production**: See [DEPLOYMENT.md](./DEPLOYMENT.md)
3. **Add Features**: Implement your own ideas
4. **Learn**: Study the code to understand Web3 development
5. **Build**: Create your own dApp using this as a template

---

**Built with ❤️ using Solidity, React, Express, The Graph, and Docker**

**Questions?** Check the [Troubleshooting](#-troubleshooting) section or open an issue.

Happy Building! 🎉
