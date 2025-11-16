# TokenFactory Frontend

> React + Vite + TypeScript frontend for TokenFactory & SimpleSwap dApp

## 🎯 Overview

Modern Web3 frontend built with:

- ✅ **React 18** + **Vite** - Fast development and build
- ✅ **TypeScript** - Full type safety
- ✅ **wagmi + viem** - Ethereum interactions
- ✅ **Tailwind CSS** - Modern styling
- ✅ **React Router** - Client-side routing
- ✅ **TanStack Query** - Data fetching and caching
- ✅ **SIWE** - Sign-In with Ethereum authentication

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- Deployed smart contracts (see `/contracts`)
- Running backend server (see `/server`)

### Installation

```bash
cd dapp
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
# Chain Configuration
VITE_CHAIN_ID=11155111
VITE_CHAIN_NAME=Sepolia

# Contract Addresses (from deployment)
VITE_FACTORY_ADDRESS=0x...
VITE_SWAP_ADDRESS=0x...

# Backend API URL
VITE_BACKEND_URL=http://localhost:3001/api

# The Graph Subgraph URL (optional)
VITE_SUBGRAPH_URL=https://api.studio.thegraph.com/query/...
```

### Copy ABIs

Before starting, copy contract ABIs from the contracts folder:

```bash
cd ../contracts
npm run copy-abis
```

This copies the ABIs to `dapp/src/abi/`.

### Start Development Server

```bash
npm run dev
```

The app will open at http://localhost:5173

## 📁 Project Structure

```
dapp/
├── src/
│   ├── components/          # Reusable UI components
│   │   ├── ConnectButton.tsx    • Wallet connection
│   │   ├── NetworkGuard.tsx     • Network validation
│   │   ├── TxToast.tsx          • Transaction notifications
│   │   ├── Layout.tsx           • Page layout & navigation
│   │   ├── TokenCard.tsx        • Token display
│   │   └── SwapForm.tsx         • Token swap interface
│   │
│   ├── pages/               # Page components
│   │   ├── Home.tsx             • Landing page
│   │   ├── CreateToken.tsx      • Token creation
│   │   ├── Swap.tsx             • Token swapping
│   │   ├── Balances.tsx         • View balances
│   │   ├── Admin.tsx            • Admin panel
│   │   ├── Profile.tsx          • User profile (SIWE)
│   │   └── Analytics.tsx        • The Graph analytics
│   │
│   ├── hooks/               # Custom React hooks
│   │   ├── useAuth.ts           • SIWE authentication
│   │   ├── useTokenFactory.ts   • Factory contract
│   │   ├── useSimpleSwap.ts     • Swap contract
│   │   └── useToken.ts          • ERC-20 operations
│   │
│   ├── lib/                 # Utilities & config
│   │   ├── wagmi.ts             • wagmi configuration
│   │   ├── contracts.ts         • Contract addresses
│   │   ├── format.ts            • Formatting utilities
│   │   ├── graph.ts             • The Graph queries
│   │   └── api.ts               • Backend API client
│   │
│   ├── types/               # TypeScript types
│   │   └── index.ts             • Type definitions
│   │
│   ├── abi/                 # Contract ABIs
│   │   ├── YourToken.json
│   │   ├── TokenFactory.json
│   │   └── SimpleSwap.json
│   │
│   ├── styles/              # Global styles
│   │   └── index.css            • Tailwind + custom styles
│   │
│   ├── App.tsx              # Root component
│   └── main.tsx             # Entry point
│
├── index.html               # HTML template
├── vite.config.ts           # Vite configuration
├── tailwind.config.js       # Tailwind configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies
```

## 🔧 Features

### Pages

**Home** (`/`)
- Project overview
- Feature cards
- Getting started info

**Create Token** (`/create`)
- Form to create ERC-20 tokens
- Input validation
- Transaction status

**Swap** (`/swap`)
- Select listed tokens
- Buy/sell interface
- Real-time preview
- Approval handling

**Balances** (`/balances`)
- ETH balance
- All token balances
- Clean UI

**Admin** (`/admin`)
- List new tokens
- Update exchange rates
- Add liquidity
- Owner-only access

**Profile** (`/profile`)
- SIWE authentication
- Edit nickname and avatar
- Profile management

**Analytics** (`/analytics`)
- The Graph integration
- Market statistics
- Trading history

### Components

**ConnectButton**
- Multi-wallet support (MetaMask, WalletConnect)
- Connection state
- Address display

**NetworkGuard**
- Validates correct network (Sepolia)
- Switch network prompt
- Error handling

**TxToast**
- Transaction notifications
- Pending/confirming/success states
- Etherscan links

**Layout**
- Navigation menu
- Connect button
- Sign in/out
- Footer

**TokenCard**
- Token information display
- Supply and cap
- Owner info
- Etherscan link

**SwapForm**
- Buy/sell toggle
- Amount input
- Preview calculation
- Approval flow
- Transaction handling

### Hooks

**useAuth**
- SIWE authentication
- Profile management
- Session handling

**useTokenFactory**
- Create tokens
- List all tokens
- List user tokens

**useSimpleSwap**
- Buy/sell tokens
- List listed tokens
- Get token info
- Admin functions

**useToken**
- Token metadata
- Balance queries
- Approve/allowance

## 🎨 Styling

Built with Tailwind CSS for:

- Responsive design
- Custom color palette
- Utility classes
- Component styles

Custom classes:
- `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-danger`
- `.card`
- `.input`, `.label`
- `.text-gradient`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `VITE_CHAIN_ID` | Network chain ID (11155111 for Sepolia) | Yes |
| `VITE_FACTORY_ADDRESS` | TokenFactory contract address | Yes |
| `VITE_SWAP_ADDRESS` | SimpleSwap contract address | Yes |
| `VITE_BACKEND_URL` | SIWE backend API URL | Yes |
| `VITE_SUBGRAPH_URL` | The Graph subgraph URL | No |
| `VITE_WALLETCONNECT_PROJECT_ID` | WalletConnect project ID | No |

## 🔨 Available Scripts

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run preview          # Preview production build

# Code Quality
npm run lint             # Run ESLint
npm run type-check       # TypeScript type checking
```

## 🌐 Deployment

### Build for Production

```bash
npm run build
```

Output will be in `dist/` folder.

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Deploy to Netlify

```bash
# Install Netlify CLI
npm i -g netlify-cli

# Deploy
netlify deploy --prod
```

### Environment Variables on Deploy

Make sure to set environment variables in your deployment platform:

- Vercel: Project Settings → Environment Variables
- Netlify: Site Settings → Build & Deploy → Environment

## 🔗 Integration

### With Smart Contracts

1. Deploy contracts to Sepolia (see `/contracts`)
2. Run `cd ../contracts && npm run copy-abis`
3. Update `.env` with contract addresses
4. Contracts are now integrated!

### With Backend (SIWE)

1. Start backend server (see `/server`)
2. Update `VITE_BACKEND_URL` in `.env`
3. Backend API is now connected!

### With The Graph

1. Deploy subgraph (see `/subgraph`)
2. Update `VITE_SUBGRAPH_URL` in `.env`
3. Analytics will load automatically!

## 🐛 Troubleshooting

### Wallet Not Connecting

- Make sure MetaMask is installed
- Try refreshing the page
- Check console for errors

### Wrong Network

- Click "Switch Network" button
- Or manually switch to Sepolia in MetaMask

### Contracts Not Found

- Verify contract addresses in `.env`
- Run `npm run copy-abis` from contracts folder
- Check that contracts are deployed

### Transaction Failing

- Ensure you have enough testnet ETH
- Check if you're on the correct network
- Verify contract addresses

## 📚 Learn More

- [wagmi Documentation](https://wagmi.sh/)
- [viem Documentation](https://viem.sh/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [SIWE](https://login.xyz/)

## 🎯 Production Checklist

- [ ] Update all contract addresses in `.env`
- [ ] Configure backend URL
- [ ] Set up The Graph subgraph (optional)
- [ ] Add WalletConnect project ID
- [ ] Test on testnet thoroughly
- [ ] Run `npm run build` successfully
- [ ] Set up environment variables on hosting platform
- [ ] Configure custom domain (optional)
- [ ] Enable HTTPS
- [ ] Test production build

## 📄 License

MIT

---

Built with ❤️ using React, wagmi, and Vite
