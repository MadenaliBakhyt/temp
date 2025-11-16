# 🚀 Complete Deployment Guide

> Step-by-step guide to deploy the entire TokenFactory & SimpleSwap dApp

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Smart Contracts Deployment](#1-smart-contracts-deployment)
3. [Backend Deployment](#2-backend-deployment)
4. [Subgraph Deployment](#3-subgraph-deployment)
5. [Frontend Deployment](#4-frontend-deployment)
6. [Docker Deployment](#5-docker-deployment-alternative)
7. [Post-Deployment](#6-post-deployment)
8. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### Required Tools

- **Node.js** 20+ ([Download](https://nodejs.org/))
- **Git** ([Download](https://git-scm.com/))
- **MetaMask** ([Install](https://metamask.io/))
- **Sepolia Testnet ETH** ([Faucet](https://sepoliafaucet.com/))

### Required Accounts

- **Alchemy/Infura** account for RPC ([Alchemy](https://www.alchemy.com/))
- **Etherscan** API key ([Get one](https://etherscan.io/apis))
- **The Graph Studio** account ([Sign up](https://thegraph.com/studio/))
- **WalletConnect** project ID (optional) ([Get one](https://cloud.walletconnect.com/))

### Estimated Time

- ⏱️ **Smart Contracts**: 15 minutes
- ⏱️ **Backend**: 10 minutes
- ⏱️ **Subgraph**: 20 minutes
- ⏱️ **Frontend**: 10 minutes
- **Total**: ~55 minutes

---

## 1. Smart Contracts Deployment

### Step 1.1: Install Dependencies

```bash
cd contracts
npm install
```

### Step 1.2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
PRIVATE_KEY=your-wallet-private-key-here
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### Step 1.3: Compile Contracts

```bash
npm run compile
```

Expected output:
```
Compiled 15 Solidity files successfully
```

### Step 1.4: Run Tests (Optional but Recommended)

```bash
npm run test
```

Expected: 50+ tests passing ✅

### Step 1.5: Deploy to Sepolia

```bash
npm run deploy:sepolia
```

**Important**: Save the output! You'll need these addresses:
```
TokenFactory:   0xABCD1234...
SimpleSwap:     0xEF567890...
```

These are automatically saved to `docs/deployments.json`.

### Step 1.6: Verify on Etherscan

```bash
npm run verify:sepolia
```

### Step 1.7: Copy ABIs for Frontend

```bash
npm run copy-abis
```

This copies ABIs to `../dapp/src/abi/` for frontend integration.

---

## 2. Backend Deployment

### Step 2.1: Install Dependencies

```bash
cd ../server
npm install
```

### Step 2.2: Configure Environment

```bash
cp .env.example .env
```

Edit `.env`:
```env
# Server
PORT=3001
NODE_ENV=production

# JWT
JWT_SECRET=your-random-secret-key-here-min-32-chars
SESSION_EXPIRY=7d

# CORS
CORS_ORIGIN=https://your-frontend-domain.com,http://localhost:5173

# Database
DATABASE_URL=file:./data/dev.db

# IPFS (optional - uses mock by default)
IPFS_MOCK=true
IPFS_STORAGE_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### Step 2.3: Set Up Database

```bash
npm run prisma:generate
npm run prisma:migrate
```

### Step 2.4: Test Locally

```bash
npm run dev
```

Test the health endpoint:
```bash
curl http://localhost:3001/health
```

Expected: `{"status":"healthy","timestamp":"..."}`

### Step 2.5: Deploy to Production

#### Option A: Railway

1. Go to [Railway](https://railway.app/)
2. Create new project from GitHub repo
3. Add environment variables from `.env`
4. Deploy automatically on push

#### Option B: Render

1. Go to [Render](https://render.com/)
2. Create new Web Service
3. Connect GitHub repo
4. Build command: `cd server && npm install && npx prisma generate && npm run build`
5. Start command: `cd server && npm start`
6. Add environment variables

#### Option C: Vercel (Serverless)

```bash
npm install -g vercel
vercel
```

Note: Add `vercel.json` for serverless configuration.

**Important**: Save your backend URL for frontend configuration:
```
https://your-backend.railway.app
```

---

## 3. Subgraph Deployment

### Step 3.1: Install Dependencies

```bash
cd ../subgraph
npm install
```

### Step 3.2: Authenticate with The Graph

```bash
npm run auth
```

Enter your deploy key from [The Graph Studio](https://thegraph.com/studio/).

### Step 3.3: Prepare Configuration

The deployment script automatically reads contract addresses from `contracts/docs/deployments.json`:

```bash
bash scripts/prepare.sh sepolia
```

This will:
1. Read deployed contract addresses
2. Update `config/sepolia.json`
3. Generate `subgraph.yaml` from template

### Step 3.4: Build Subgraph

```bash
npm run codegen
npm run build
```

### Step 3.5: Deploy to The Graph Studio

```bash
npm run deploy
```

Or use the automated script:
```bash
bash scripts/deploy-subgraph.sh sepolia
```

### Step 3.6: Publish to Network (Optional)

1. Go to [The Graph Studio](https://thegraph.com/studio/)
2. Find your subgraph
3. Click "Publish"
4. Pay the gas fee to publish to the decentralized network

**Important**: Save your subgraph query URL:
```
https://api.studio.thegraph.com/query/<ID>/tokenfactory-subgraph/v1.0.0
```

---

## 4. Frontend Deployment

### Step 4.1: Configure Environment

```bash
cd ../dapp
```

Create `.env`:
```env
# Chain Configuration
VITE_CHAIN_ID=11155111

# Contract Addresses (from contracts deployment)
VITE_FACTORY_ADDRESS=0xABCD1234...
VITE_SWAP_ADDRESS=0xEF567890...

# Backend URL (from backend deployment)
VITE_BACKEND_URL=https://your-backend.railway.app/api

# The Graph Subgraph URL (from subgraph deployment)
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/<ID>/tokenfactory-subgraph/v1.0.0

# WalletConnect (optional)
VITE_WALLETCONNECT_PROJECT_ID=your-project-id
```

### Step 4.2: Install Dependencies

```bash
npm install
```

### Step 4.3: Test Locally

```bash
npm run dev
```

Open http://localhost:5173 and test:
- ✅ Wallet connection
- ✅ Network switching to Sepolia
- ✅ Token creation
- ✅ Token swapping

### Step 4.4: Build for Production

```bash
npm run build
```

### Step 4.5: Deploy to Production

#### Option A: Vercel (Recommended)

```bash
npm install -g vercel
vercel
```

Or connect via [Vercel Dashboard](https://vercel.com/new).

#### Option B: Netlify

```bash
npm install -g netlify-cli
netlify deploy --prod
```

#### Option C: GitHub Pages

```bash
npm run build
# Deploy dist/ folder to gh-pages branch
```

**Important**: Save your frontend URL:
```
https://your-app.vercel.app
```

### Step 4.6: Update Backend CORS

Update backend `.env` with your frontend URL:
```env
CORS_ORIGIN=https://your-app.vercel.app,http://localhost:5173
```

Redeploy backend after updating CORS.

---

## 5. Docker Deployment (Alternative)

If you prefer Docker deployment for everything:

### Step 5.1: Configure Environment

```bash
cp .env.docker.example .env.docker
```

Edit `.env.docker` with your contract addresses and secrets.

### Step 5.2: Deploy with Docker Compose

```bash
# Production deployment
docker-compose up -d

# Or development mode
docker-compose -f docker-compose.dev.yml up
```

Access:
- Frontend: http://localhost
- Backend: http://localhost:3001

See [DOCKER.md](./DOCKER.md) for complete Docker documentation.

---

## 6. Post-Deployment

### Step 6.1: Verify All Components

| Component | Endpoint | Expected |
|-----------|----------|----------|
| Contracts | Etherscan | ✅ Verified contracts visible |
| Backend | `GET /health` | `{"status":"healthy"}` |
| Subgraph | Studio Dashboard | ✅ Synced to latest block |
| Frontend | Root URL | ✅ Homepage loads |

### Step 6.2: Test End-to-End Flow

1. **Connect Wallet**
   - Open frontend
   - Click "Connect Wallet"
   - Switch to Sepolia if needed

2. **Create a Token**
   - Navigate to "Create Token"
   - Fill in token details
   - Submit transaction
   - Verify on Etherscan

3. **List Token on DEX**
   - Navigate to "Admin"
   - Enter token address
   - Set exchange rate
   - Add liquidity
   - Submit transaction

4. **Test Swap**
   - Navigate to "Swap"
   - Select token
   - Enter amount
   - Buy/sell tokens

5. **Verify Analytics**
   - Navigate to "Analytics"
   - Check if token appears
   - Verify swap data

### Step 6.3: Monitor Subgraph

Check The Graph Studio dashboard for:
- ✅ Indexing status
- ✅ Current block synced
- ✅ Query count
- ✅ No indexing errors

### Step 6.4: Update Documentation

Update your repository with:
- Contract addresses
- Backend URL
- Frontend URL
- Subgraph URL

---

## 7. Environment Variables Summary

### Contracts (.env)
```env
PRIVATE_KEY=...
RPC_URL=...
ETHERSCAN_API_KEY=...
```

### Backend (.env)
```env
PORT=3001
NODE_ENV=production
JWT_SECRET=...
CORS_ORIGIN=...
DATABASE_URL=...
```

### Subgraph (config/sepolia.json)
```json
{
  "network": "sepolia",
  "factoryAddress": "0x...",
  "swapAddress": "0x...",
  "factoryStartBlock": 123456,
  "swapStartBlock": 123457
}
```

### Frontend (.env)
```env
VITE_CHAIN_ID=11155111
VITE_FACTORY_ADDRESS=0x...
VITE_SWAP_ADDRESS=0x...
VITE_BACKEND_URL=https://...
VITE_SUBGRAPH_URL=https://...
```

---

## Troubleshooting

### Smart Contracts

**Error: Insufficient funds**
- Get more Sepolia ETH from faucet
- Check deployer balance: `npx hardhat balance`

**Error: Network mismatch**
- Verify RPC_URL in `.env`
- Check network in Hardhat config

**Verification fails**
- Wait 1-2 minutes after deployment
- Ensure Etherscan API key is valid
- Check contract was deployed on Sepolia

### Backend

**Port already in use**
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9
```

**Database errors**
```bash
# Reset database
rm -rf prisma/dev.db
npm run prisma:migrate
```

**CORS errors**
- Check CORS_ORIGIN matches frontend URL
- Ensure no trailing slashes

### Subgraph

**Failed to fetch ABIs**
```bash
# Copy ABIs manually
bash scripts/update-abis.sh
```

**Indexing errors**
- Check contract addresses in config
- Verify start blocks are correct
- Review event signatures in subgraph.yaml

**Build fails**
```bash
# Clear cache
rm -rf build generated
npm run codegen
npm run build
```

### Frontend

**RPC errors**
- Check VITE_CHAIN_ID matches network
- Verify contract addresses are correct

**Contract not found**
- Ensure ABIs are copied: `cd contracts && npm run copy-abis`
- Check VITE_FACTORY_ADDRESS and VITE_SWAP_ADDRESS

**SIWE login fails**
- Check VITE_BACKEND_URL is correct
- Verify backend is running
- Check CORS configuration

---

## 🎉 Success Checklist

- [ ] Smart contracts deployed and verified on Sepolia
- [ ] Backend API running and accessible
- [ ] Subgraph deployed and syncing
- [ ] Frontend deployed and connected to all services
- [ ] End-to-end flow tested (create → list → swap)
- [ ] Analytics showing data from subgraph
- [ ] All environment variables documented
- [ ] CORS configured correctly
- [ ] Production secrets secured

---

## 📚 Additional Resources

- [Hardhat Documentation](https://hardhat.org/docs)
- [The Graph Documentation](https://thegraph.com/docs/)
- [wagmi Documentation](https://wagmi.sh/)
- [Vercel Deployment](https://vercel.com/docs)
- [Railway Deployment](https://docs.railway.app/)

---

## 🔄 Update Workflow

When you make changes to contracts:

1. **Deploy new contracts**: `cd contracts && npm run deploy:sepolia`
2. **Copy ABIs**: `npm run copy-abis`
3. **Update subgraph config**: `cd ../subgraph && bash scripts/prepare.sh sepolia`
4. **Deploy subgraph**: `npm run build && npm run deploy`
5. **Update frontend .env** with new addresses
6. **Rebuild and redeploy frontend**: `cd ../dapp && npm run build && vercel --prod`

---

Built with ❤️ - Happy Deploying! 🚀
