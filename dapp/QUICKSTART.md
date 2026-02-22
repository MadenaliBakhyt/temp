   # Quick Start Guide - TokenFactory Frontend

## 🚀 Get Started in 5 Minutes

### 1. Install Dependencies

```bash
cd dapp
npm install
```

### 2. Copy Contract ABIs

```bash
cd ../contracts
npm run copy-abis
cd ../dapp
```

This copies the contract ABIs from the contracts folder.

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your deployed contract addresses:

```env
VITE_FACTORY_ADDRESS=0xYourFactoryAddress
VITE_SWAP_ADDRESS=0xYourSwapAddress
VITE_BACKEND_URL=http://localhost:3001/api
```

### 4. Start Development Server

```bash
npm run dev
```

App opens at http://localhost:5173

## ✅ You're Ready!

The frontend should now be running with:

- ✅ Wallet connection (MetaMask)
- ✅ All pages accessible
- ✅ Contract interactions ready
- ✅ SIWE authentication ready

## 🎯 Next Steps

1. **Connect Wallet** - Click "Connect MetaMask" button
2. **Create a Token** - Go to "Create Token" page
3. **List Token** (Admin) - Go to "Admin" panel
4. **Swap Tokens** - Go to "Swap" page

## 🔍 Troubleshooting

**No contract addresses?**
```bash
# Deploy contracts first
cd ../contracts
npm run deploy:sepolia
# Then copy the addresses to dapp/.env
```

**ABIs not found?**
```bash
cd ../contracts
npm run copy-abis
```

**Backend not running?**
```bash
cd ../server
npm run dev
```

**Wrong network?**
- Make sure MetaMask is on Sepolia testnet
- Click "Switch Network" button in the app

## 📚 Documentation

- [Full README](./README.md) - Complete documentation
- [Root README](../README.md) - Project overview
- [Contract Docs](../contracts/README.md) - Smart contracts
- [Backend Docs](../server/README.md) - SIWE backend

Happy building! 🎉
