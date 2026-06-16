# TokenFactory & SimpleSwap

> Full-stack Web3 dApp — ERC-20 token factory, fixed-rate DEX, SIWE authentication, on-chain analytics

**Network**: Sepolia Testnet · **Stack**: Solidity · Hardhat · React · wagmi · viem · Express · Prisma

---

## What This Does

| Feature | Description |
|---|---|
| Create Tokens | Deploy ERC-20 tokens with custom name, symbol, decimals, cap |
| Swap | Buy / sell tokens for ETH at fixed rates via SimpleSwap DEX |
| Balances | View ETH + token balances across all deployed tokens |
| Analytics | Live on-chain stats — no subgraph required |
| Admin | List tokens, set rates, manage DEX liquidity (owner only) |
| Profile | Sign-In with Ethereum (SIWE) + profile management |

---

## Setup From Scratch

### Prerequisites

- Node.js 20+
- MetaMask browser extension
- Sepolia ETH (get from [sepoliafaucet.com](https://sepoliafaucet.com/) — need ~0.2 ETH)
- Alchemy or Infura account (free) for RPC URL

---

## Part 1 — Smart Contracts

```bash
cd contracts
npm install
```

Create `contracts/.env`:

```env
PRIVATE_KEY=your_wallet_private_key_without_0x_prefix
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-ALCHEMY-KEY
ETHERSCAN_API_KEY=your_etherscan_api_key
```

> **Security**: Use a dedicated testnet wallet. Never use a mainnet wallet private key.

Run tests to verify everything works:

```bash
npm test
# Expected: 97 passing
```

Deploy to Sepolia:

```bash
npm run deploy:sepolia
```

The output will print both contract addresses. They are also saved to `docs/deployments.json`.

Copy ABIs to the frontend:

```bash
npm run copy-abis
```

---

## Part 2 — Frontend

```bash
cd dapp
npm install
```

Create `dapp/.env` (copy from `.env.example` and fill in):

```env
VITE_CHAIN_ID=11155111

# From docs/deployments.json after deployment
VITE_FACTORY_ADDRESS=0xYourTokenFactoryAddress
VITE_SWAP_ADDRESS=0xYourSimpleSwapAddress

VITE_BACKEND_URL=http://localhost:3001/api

# Optional — leave empty if not using subgraph
VITE_SUBGRAPH_URL=
```

Start the dev server:

```bash
npm run dev
# Opens at http://localhost:5173
```

---

## Part 3 — Backend (optional, needed for Profile/SIWE)

```bash
cd server
npm install
```

Create `server/.env`:

```env
PORT=3001
NODE_ENV=development
JWT_SECRET=generate_with__openssl_rand_hex_32
SESSION_EXPIRY=7d
CORS_ORIGIN=http://localhost:5173
DATABASE_URL=file:./dev.db
IPFS_MOCK=true
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

Set up the database and start:

```bash
npm run prisma:generate
npm run prisma:migrate
npm run dev
# Running at http://localhost:3001
```

---

## First-Time Workflow

After contracts are deployed and the frontend is running:

### 1. Create a Token
- Go to **Create Token**
- Fill: Name, Symbol, Decimals (18), Initial Supply, Cap
- Confirm in MetaMask (~500k gas)

### 2. List on DEX (Admin only)
- Go to **Admin**
- Select your token, set rate (e.g. `1000` = 1 ETH buys 1000 tokens)
- Set Min ETH Liquidity (e.g. `0.01`)
- Click **List Token** → confirm

### 3. Add Liquidity (Admin only)
Two-step process:
1. Enter token amount + ETH amount, click **1. Approve Tokens** → confirm
2. After approval confirms, click **2. Add Liquidity** → confirm

### 4. Swap
- Go to **Swap**
- Select your token
- Buy with ETH or sell tokens

---

## Common Errors

### "Transaction gas limit too high"
Your local code is outdated. Pull the latest:
```bash
git pull origin claude/run-contract-tests-W8ayd
cd dapp && npm run dev
```

### "Function not found on ABI"
`VITE_FACTORY_ADDRESS` or `VITE_SWAP_ADDRESS` is missing or wrong in `dapp/.env`.
Check `docs/deployments.json` for correct addresses.

### "token already listed"
The token is already on the DEX. Skip to **Add Liquidity**.

### addLiquidity reverts
You must **Approve** before adding token liquidity. Use the 2-step flow in the Admin panel.

### Backend won't start — port 3001 in use
```bash
# Windows
netstat -ano | findstr :3001
taskkill /PID <pid> /F

# Linux/Mac
lsof -ti:3001 | xargs kill -9
```

---

## Project Structure

```
temp/
├── contracts/          Solidity contracts + Hardhat
│   ├── contracts/        TokenFactory.sol, SimpleSwap.sol, YourToken.sol, TokenStaking.sol
│   ├── test/             97 tests
│   ├── scripts/          deploy.ts, verify.ts, copy-abis.ts
│   └── docs/             deployments.json
│
├── dapp/               React + Vite frontend
│   └── src/
│       ├── pages/        Home, CreateToken, Swap, Admin, Balances, Analytics, Profile
│       ├── components/   Layout, ConnectButton, SwapForm, TxToast
│       ├── hooks/        useTokenFactory, useSimpleSwap, useToken, useAuth
│       └── abi/          Contract ABIs (copied from contracts/)
│
├── server/             Express backend
│   └── src/
│       ├── routes/       auth.ts, profile.ts
│       ├── middleware/   auth, validation, errorHandler
│       └── db/           Prisma + SQLite
│
└── docs/
    └── deployments.json  Contract addresses per network
```

---

## Commands Reference

```bash
# Contracts
cd contracts
npm test                   # Run all 97 tests
npm run compile            # Compile Solidity
npm run deploy:sepolia     # Deploy to Sepolia
npm run verify:sepolia     # Verify on Etherscan
npm run copy-abis          # Copy ABIs to dapp/src/abi/

# Frontend
cd dapp
npm run dev                # Dev server (http://localhost:5173)
npm run build              # Production build
npm run type-check         # TypeScript check

# Backend
cd server
npm run dev                # Dev server (http://localhost:3001)
npm run prisma:studio      # Database GUI
npm run db:seed            # Seed sample data
```

---

## Gas Limits (Sepolia)

| Operation | Gas |
|---|---|
| Deploy TokenFactory | ~800k |
| Deploy SimpleSwap | ~1.2M |
| createToken | ~500k |
| listToken | ~200k |
| addLiquidity (approve) | ~100k |
| addLiquidity | ~300k |
| buyToken / sellToken | ~200k |

Total for full deployment: ~0.1 Sepolia ETH

---

## License

MIT
