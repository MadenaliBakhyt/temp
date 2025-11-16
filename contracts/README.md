# TokenFactory & SimpleSwap Smart Contracts

Production-ready Solidity smart contracts for creating ERC-20 tokens and swapping them at fixed rates on Ethereum testnets.

## 📋 Overview

This package contains three main smart contracts:

- **YourToken.sol**: ERC-20 token with capped supply, owner-controlled minting, and public burning
- **TokenFactory.sol**: Factory contract for deploying YourToken instances
- **SimpleSwap.sol**: Simple DEX for swapping listed tokens with ETH at fixed rates

## 🏗️ Architecture

```
┌─────────────────┐
│  TokenFactory   │  ← Users create tokens here
└────────┬────────┘
         │ deploys
         ▼
┌─────────────────┐
│   YourToken     │  ← ERC-20 with cap, mint, burn
└─────────────────┘

┌─────────────────┐
│   SimpleSwap    │  ← Users buy/sell tokens for ETH
└─────────────────┘
```

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- npm or yarn

### Installation

```bash
cd contracts
npm install
```

### Environment Setup

```bash
cp .env.example .env
```

Edit `.env` and add your values:

```env
PRIVATE_KEY=your-wallet-private-key
RPC_URL=https://eth-sepolia.g.alchemy.com/v2/YOUR-API-KEY
ETHERSCAN_API_KEY=your-etherscan-api-key
```

### Compile Contracts

```bash
npm run compile
```

### Run Tests

```bash
npm run test
```

### Deploy to Sepolia

```bash
npm run deploy:sepolia
```

### Copy ABIs to dApp

```bash
npm run copy-abis
```

### Verify Contracts on Etherscan

```bash
npm run verify:sepolia
```

## 📝 Contract Details

### YourToken

ERC-20 token with additional features:

- **Capped Supply**: Maximum supply enforced at deployment
- **Owner Minting**: Only owner can mint new tokens (up to cap)
- **Public Burning**: Anyone can burn their own tokens
- **Custom Decimals**: Configure decimals at deployment

**Constructor Parameters:**
```solidity
constructor(
    string memory name_,        // Token name (e.g., "My Token")
    string memory symbol_,      // Token symbol (e.g., "MTK")
    uint8 decimals_,           // Number of decimals (typically 18)
    uint256 initialSupply_,    // Initial supply to mint
    uint256 cap_,              // Maximum total supply
    address owner_             // Token owner address
)
```

**Key Functions:**
- `mint(address to, uint256 amount)`: Mint tokens (owner only)
- `burn(uint256 amount)`: Burn your tokens
- `burnFrom(address from, uint256 amount)`: Burn tokens from approved address

### TokenFactory

Factory for creating YourToken instances.

**Key Functions:**
- `createToken(name, symbol, decimals, initialSupply, cap)`: Deploy a new token
- `getAllTokens()`: Get all created token addresses
- `getMyTokens(address owner)`: Get tokens created by a specific owner
- `totalTokens()`: Get total number of created tokens

**Events:**
- `TokenCreated(owner, token, name, symbol, initialSupply)`

### SimpleSwap

Simple DEX for swapping tokens with ETH at fixed rates.

**Admin Functions (Owner Only):**
- `listToken(token, tokenPerEth, minEthLiquidity)`: List a new token
- `unlistToken(token)`: Unlist a token
- `setRate(token, newTokenPerEth)`: Update exchange rate
- `addLiquidity(token, tokenAmount)`: Add liquidity (payable for ETH)
- `withdraw(token, tokenAmount, ethAmount)`: Withdraw liquidity

**User Functions:**
- `buyToken(token)`: Buy tokens with ETH (payable)
- `sellToken(token, amount)`: Sell tokens for ETH (requires approval)
- `previewBuy(token, ethAmount)`: Calculate tokens for ETH amount
- `previewSell(token, tokenAmount)`: Calculate ETH for token amount

**View Functions:**
- `getListedTokens()`: Get all listed tokens
- `getTokenInfo(token)`: Get detailed token info (rate, liquidity, etc.)

**Events:**
- `Listed(token, tokenPerEth, minEthLiquidity)`
- `Unlisted(token)`
- `RateUpdated(token, newTokenPerEth)`
- `Bought(buyer, token, ethIn, tokensOut)`
- `Sold(seller, token, tokensIn, ethOut)`
- `LiquidityAdded(token, tokenAmount, ethAmount)`
- `LiquidityWithdrawn(token, tokenAmount, ethAmount)`

## 🧪 Testing

The test suite covers:

### TokenFactory Tests
- ✅ Token creation with various parameters
- ✅ Event emissions
- ✅ Token ownership
- ✅ Initial supply minting
- ✅ Input validation (empty name/symbol, cap validation)
- ✅ Custom decimals
- ✅ Token tracking (all tokens, tokens by owner)
- ✅ Multiple users creating tokens
- ✅ YourToken functionality (mint, burn, cap enforcement)

### SimpleSwap Tests
- ✅ Token listing/unlisting
- ✅ Rate updates
- ✅ Liquidity management (add/withdraw)
- ✅ Buying tokens with ETH
- ✅ Selling tokens for ETH
- ✅ Minimum liquidity enforcement
- ✅ Preview calculations
- ✅ Access control (owner-only functions)
- ✅ Reentrancy protection
- ✅ Edge cases and security

Run tests with coverage:

```bash
npm run coverage
```

## 🔒 Security Features

- **ReentrancyGuard**: Protects against reentrancy attacks on buy/sell/withdraw functions
- **Ownable**: Access control for admin functions
- **SafeERC20**: Safe token transfers
- **Input Validation**: Extensive checks on parameters
- **Minimum Liquidity**: Prevents liquidity drainage
- **Cap Enforcement**: Prevents over-minting

## 📊 Gas Optimization

- Optimized compiler settings (runs: 200, viaIR: true)
- Efficient storage layout
- Minimal loops in view functions
- Events for off-chain indexing

## 🌐 Network Support

- **Sepolia** (recommended): chainId 11155111
- **Goerli**: chainId 5
- **Localhost** (Hardhat Network): chainId 31337

## 📦 Scripts

| Command | Description |
|---------|-------------|
| `npm run compile` | Compile contracts |
| `npm run test` | Run test suite |
| `npm run coverage` | Generate coverage report |
| `npm run deploy:sepolia` | Deploy to Sepolia |
| `npm run deploy:goerli` | Deploy to Goerli |
| `npm run deploy:localhost` | Deploy to local network |
| `npm run verify:sepolia` | Verify on Sepolia Etherscan |
| `npm run copy-abis` | Copy ABIs to dApp |
| `npm run node` | Start local Hardhat node |
| `npm run clean` | Clean artifacts |

## 📄 Deployment Info

After deployment, contract addresses are saved to `/docs/deployments.json`:

```json
{
  "sepolia-11155111": {
    "network": "sepolia",
    "chainId": 11155111,
    "deployer": "0x...",
    "timestamp": "2024-01-01T00:00:00.000Z",
    "contracts": {
      "TokenFactory": {
        "address": "0x..."
      },
      "SimpleSwap": {
        "address": "0x...",
        "owner": "0x..."
      }
    }
  }
}
```

## 🔗 Integration

### Frontend Integration

1. Copy ABIs: `npm run copy-abis`
2. Update dApp environment variables with deployed addresses
3. Import ABIs: `import { TokenFactoryAbi } from './abi'`

### The Graph Integration

1. Update `subgraph/subgraph.yaml` with deployed contract addresses
2. Run `graph codegen` and `graph build`
3. Deploy subgraph to The Graph

## 📚 Additional Documentation

- [API Documentation](../docs/API.md)
- [Architecture Overview](../docs/ARCHITECTURE.md)
- [Deployment Info](../docs/deployments.json)

## 🛠️ Troubleshooting

### Compilation Errors

If you encounter compilation errors, try:

```bash
npm run clean
npm run compile
```

### Test Failures

Ensure you're using the correct Node.js version:

```bash
node --version  # Should be 20+
```

### Deployment Issues

1. Check your `.env` file has correct values
2. Ensure your wallet has enough testnet ETH
3. Verify RPC URL is working

Get testnet ETH:
- Sepolia: https://sepoliafaucet.com/
- Goerli: https://goerlifaucet.com/

## 📜 License

MIT

## 🤝 Contributing

This is a production-ready starter template. Feel free to customize for your needs!

## ⚠️ Security Notice

These contracts are for TESTNET USE ONLY. Before deploying to mainnet:

1. Get a professional security audit
2. Add comprehensive integration tests
3. Test on testnet thoroughly
4. Consider upgradability patterns
5. Review all admin functions
6. Set up multisig for admin operations

## 🔍 Verification

After deploying to testnets, verify your contracts on Etherscan:

```bash
npm run verify:sepolia
```

This makes your contract source code public and allows users to interact with it directly on Etherscan.
