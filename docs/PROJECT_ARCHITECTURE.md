# TokenFactory: Comprehensive Project Architecture Document

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [System Overview](#2-system-overview)
3. [Technology Stack](#3-technology-stack)
4. [Monorepo Structure](#4-monorepo-structure)
5. [Smart Contract Layer](#5-smart-contract-layer)
6. [Backend Server (API Layer)](#6-backend-server-api-layer)
7. [Frontend Application (dApp)](#7-frontend-application-dapp)
8. [Subgraph (Indexing Layer)](#8-subgraph-indexing-layer)
9. [Data Flow & Sequence Diagrams](#9-data-flow--sequence-diagrams)
10. [Authentication Architecture](#10-authentication-architecture)
11. [Database Design](#11-database-design)
12. [API Reference](#12-api-reference)
13. [Smart Contract Interfaces](#13-smart-contract-interfaces)
14. [Infrastructure & Deployment](#14-infrastructure--deployment)
15. [Security Architecture](#15-security-architecture)
16. [Component Interaction Diagrams](#16-component-interaction-diagrams)

---

## 1. Executive Summary

**TokenFactory** is a full-stack decentralized application (dApp) that enables users to create, deploy, trade, and manage custom ERC-20 tokens on the Ethereum blockchain. The platform combines on-chain smart contracts with an off-chain backend, a React-based frontend, and a Graph Protocol subgraph for blockchain data indexing.

### Core Capabilities

| Capability | Description |
|---|---|
| **Token Creation** | Users deploy custom ERC-20 tokens with configurable name, symbol, decimals, initial supply, and maximum cap via a factory contract |
| **Token Trading (DEX)** | A simple decentralized exchange (SimpleSwap) allows users to buy and sell listed tokens at admin-defined fixed exchange rates |
| **Token Staking** | Users can stake tokens and earn proportional rewards over time using the Synthetix reward distribution model |
| **User Profiles** | Wallet-based user profiles with nicknames, avatars stored on IPFS, authenticated via Sign-In with Ethereum (SIWE) |
| **Analytics Dashboard** | On-chain activity (token creation, trades, liquidity events) is indexed by The Graph and visualized in the frontend |

### Key Metrics

- **Blockchain Network**: Ethereum Sepolia Testnet (Chain ID: 11155111)
- **Architecture Pattern**: Monorepo with 4 independent modules
- **Smart Contracts**: 4 Solidity contracts (Solidity ^0.8.24)
- **API Endpoints**: 8 RESTful endpoints
- **Frontend Pages**: 7 pages with 10+ reusable components

---

## 2. System Overview

### High-Level Architecture Diagram

```
+------------------------------------------------------------------+
|                         USER (Browser + Wallet)                   |
|                    MetaMask / WalletConnect / Injected             |
+-------------------+-------------------+---------------------------+
                    |                   |
          [HTTPS/WSS]           [JSON-RPC / EIP-1193]
                    |                   |
    +---------------v------+    +-------v-----------------------+
    |   BACKEND SERVER     |    |   ETHEREUM BLOCKCHAIN         |
    |   (Express.js API)   |    |   (Sepolia Testnet)           |
    |                      |    |                               |
    |  - SIWE Auth         |    |  +-------------------------+  |
    |  - JWT Sessions      |    |  | TokenFactory Contract   |  |
    |  - User Profiles     |    |  | (creates ERC-20 tokens) |  |
    |  - Avatar Upload     |    |  +-------------------------+  |
    |  (IPFS/Local)        |    |  | SimpleSwap Contract     |  |
    |                      |    |  | (fixed-rate DEX)        |  |
    +----------+-----------+    |  +-------------------------+  |
               |                |  | YourToken (ERC-20)      |  |
          [SQLite/PG]           |  | (capped, mintable)      |  |
               |                |  +-------------------------+  |
    +----------v-----------+    |  | TokenStaking Contract   |  |
    |   DATABASE           |    |  | (Synthetix model)       |  |
    |   - Users            |    |  +-------------------------+  |
    |   - Sessions         |    +---------------+---------------+
    +----------------------+                    |
                                         [Event Logs]
                                                |
                                +---------------v---------------+
                                |   THE GRAPH (Subgraph)        |
                                |                               |
                                |  - Indexes on-chain events    |
                                |  - Token, Swap, Liquidity     |
                                |  - Protocol & Daily Stats     |
                                |  - User Activity Tracking     |
                                +---------------+---------------+
                                                |
                                          [GraphQL API]
                                                |
+-----------------------------------------------v--------------+
|                    FRONTEND (React dApp)                       |
|                                                                |
|  +----------+ +----------+ +-------+ +--------+ +----------+  |
|  |  Home    | |  Create  | |  Swap | | Admin  | | Analytics |  |
|  |  Page    | |  Token   | |  Page | | Panel  | | Dashboard |  |
|  +----------+ +----------+ +-------+ +--------+ +----------+  |
|  +----------+ +-----------+                                    |
|  | Balances | |  Profile  |    Wagmi + Viem + RainbowKit       |
|  |  Page    | |  Page     |    React Query + Tailwind CSS      |
|  +----------+ +-----------+                                    |
+----------------------------------------------------------------+
```

### Data Flow Summary

```
User Action --> Frontend (React) --> Smart Contract (via Wagmi/Viem)
                    |                        |
                    +--> Backend API          +--> Blockchain Event Emitted
                         (SIWE Auth,              |
                          Profiles)               +--> Subgraph Indexes Event
                                                       |
                                                       +--> GraphQL Query
                                                            |
                                                  Frontend <-+
                                                  (Analytics, Stats)
```

---

## 3. Technology Stack

### Complete Technology Matrix

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Smart Contracts** | Solidity | ^0.8.24 | Smart contract language |
| | Hardhat | ^2.20.1 | Development framework, testing, deployment |
| | OpenZeppelin Contracts | ^5.0.1 | Audited base contracts (ERC20, Ownable, ReentrancyGuard) |
| | Ethers.js | ^6.11.0 | Ethereum library for deployment scripts |
| | TypeChain | ^8.3.2 | TypeScript bindings for contracts |
| | Chai | ^4.4.1 | Testing assertions |
| | Solidity Coverage | ^0.8.7 | Test coverage analysis |
| **Backend** | Node.js | 20 (Alpine) | Runtime environment |
| | Express.js | ^4.18.2 | HTTP framework |
| | TypeScript | ^5.3.3 | Type-safe development |
| | Prisma ORM | ^5.9.1 | Database ORM with migrations |
| | SQLite | (bundled) | Development database |
| | JSON Web Token | ^9.0.2 | Stateless authentication tokens |
| | SIWE (siwe) | ^2.1.4 | Sign-In with Ethereum protocol |
| | Zod | ^3.22.4 | Runtime schema validation |
| | Helmet | ^7.1.0 | HTTP security headers |
| | Morgan | ^1.10.0 | HTTP request logging |
| | express-rate-limit | ^7.1.5 | API rate limiting |
| **Frontend** | React | ^18.2.0 | UI framework |
| | TypeScript | ^5.3.3 | Type-safe development |
| | Vite | ^5.1.0 | Build tool and dev server |
| | Wagmi | ^2.5.7 | React hooks for Ethereum |
| | Viem | ^2.7.13 | TypeScript Ethereum library |
| | RainbowKit | ^2.0.2 | Wallet connection UI |
| | TanStack React Query | ^5.20.1 | Server state management |
| | React Router DOM | ^6.22.0 | Client-side routing |
| | Tailwind CSS | ^3.4.1 | Utility-first CSS framework |
| | Recharts | ^2.12.0 | Charting library for analytics |
| | Axios | ^1.6.7 | HTTP client for backend API |
| | date-fns | ^3.3.1 | Date utility functions |
| **Subgraph** | The Graph | - | Blockchain indexing protocol |
| | graph-ts | ^0.31.0 | AssemblyScript runtime |
| | graph-cli | ^0.98.1 | CLI for build and deploy |
| | Matchstick | ^0.6.0 | Unit testing framework |
| | Mustache | ^4.2.0 | Template engine for config |
| **Infrastructure** | Docker | - | Containerization |
| | Docker Compose | v3.8 | Multi-container orchestration |
| | Nginx | Alpine | Static file serving (production) |
| | IPFS (Pinata) | - | Decentralized file storage |

### Dependency Graph

```
                    +------------------+
                    |  OpenZeppelin    |
                    |  Contracts v5    |
                    +--------+---------+
                             |
                    +--------v---------+
                    |   Smart Contracts |
                    | (Solidity 0.8.24) |
                    +--------+---------+
                             |
               +-------------+-------------+
               |                           |
      +--------v---------+       +--------v---------+
      |    ABIs (JSON)    |       |   Subgraph       |
      +--------+---------+       |   (graph-ts)      |
               |                  +--------+---------+
      +--------v---------+                |
      |   Frontend dApp   |      +--------v---------+
      |  (wagmi + viem)   |      |   GraphQL API     |
      +--------+---------+       +--------+---------+
               |                           |
               +-------------+-------------+
                             |
                    +--------v---------+
                    |   React Frontend  |
                    | (React Query +    |
                    |  Recharts)        |
                    +------------------+

      +------------------+
      |   Backend Server  |
      | (Express + Prisma)|-----> SQLite / PostgreSQL
      +------------------+
              |
         SIWE + JWT Auth
```

---

## 4. Monorepo Structure

```
tokenfactory/
|
+-- contracts/                    # Smart Contract Module
|   +-- contracts/
|   |   +-- TokenFactory.sol      # Factory for deploying ERC-20 tokens
|   |   +-- YourToken.sol         # Capped, mintable ERC-20 token
|   |   +-- SimpleSwap.sol        # Fixed-rate DEX for token trading
|   |   +-- TokenStaking.sol      # Synthetix-model staking rewards
|   +-- test/
|   |   +-- TokenFactory.t.ts     # Factory contract tests
|   |   +-- SimpleSwap.t.ts       # DEX contract tests
|   |   +-- TokenStaking.t.ts     # Staking contract tests
|   +-- scripts/
|   |   +-- deploy.ts             # Deployment script
|   |   +-- verify.ts             # Etherscan verification
|   |   +-- copy-abis.ts          # ABI extraction to other modules
|   +-- abis/                     # Compiled ABIs (shared)
|   +-- hardhat.config.ts         # Hardhat configuration
|   +-- package.json
|
+-- server/                       # Backend API Module
|   +-- src/
|   |   +-- index.ts              # Express app entry point
|   |   +-- routes/
|   |   |   +-- auth.ts           # Authentication endpoints
|   |   |   +-- profile.ts        # User profile endpoints
|   |   +-- middleware/
|   |   |   +-- auth.ts           # JWT verification middleware
|   |   |   +-- validation.ts     # Zod schema validation
|   |   |   +-- errorHandler.ts   # Global error handler
|   |   +-- utils/
|   |   |   +-- siwe.ts           # SIWE message verification
|   |   |   +-- jwt.ts            # JWT token operations
|   |   |   +-- ipfs.ts           # IPFS upload (real + mock)
|   |   +-- db/
|   |   |   +-- client.ts         # Prisma client singleton
|   |   |   +-- seed.ts           # Database seed script
|   |   +-- types/
|   |       +-- index.ts          # TypeScript interfaces
|   +-- prisma/
|   |   +-- schema.prisma         # Database schema (User, Session)
|   +-- Dockerfile                # Production Docker image
|   +-- Dockerfile.dev            # Development Docker image
|   +-- package.json
|
+-- dapp/                         # Frontend Module
|   +-- src/
|   |   +-- main.tsx              # React entry point
|   |   +-- App.tsx               # Root component with routing
|   |   +-- pages/
|   |   |   +-- Home.tsx          # Landing page with token list
|   |   |   +-- CreateToken.tsx   # Token creation form
|   |   |   +-- Swap.tsx          # Token swap interface
|   |   |   +-- SwapPro.tsx       # Advanced swap interface
|   |   |   +-- Balances.tsx      # User token balances
|   |   |   +-- Admin.tsx         # DEX admin panel
|   |   |   +-- Profile.tsx       # User profile management
|   |   |   +-- Analytics.tsx     # Protocol analytics dashboard
|   |   +-- components/
|   |   |   +-- Layout.tsx        # App shell with navigation
|   |   |   +-- ConnectButton.tsx # Wallet connection button
|   |   |   +-- NetworkGuard.tsx  # Chain ID enforcement
|   |   |   +-- TokenCard.tsx     # Token display card
|   |   |   +-- SwapForm.tsx      # Swap input form
|   |   |   +-- TransactionPreviewEngine.tsx  # TX preview
|   |   |   +-- TxToast.tsx       # Transaction notifications
|   |   |   +-- ui/              # Reusable UI primitives
|   |   |       +-- Button.tsx
|   |   |       +-- Card.tsx
|   |   |       +-- Input.tsx
|   |   +-- hooks/
|   |   |   +-- useAuth.ts        # SIWE authentication hook
|   |   |   +-- useTokenFactory.ts # Factory contract hooks
|   |   |   +-- useSimpleSwap.ts  # DEX contract hooks
|   |   |   +-- useToken.ts       # ERC-20 token hooks
|   |   +-- lib/
|   |   |   +-- wagmi.ts          # Wagmi chain configuration
|   |   |   +-- contracts.ts      # Contract addresses & config
|   |   |   +-- api.ts            # Backend API client (Axios)
|   |   |   +-- graph.ts          # Subgraph GraphQL queries
|   |   |   +-- format.ts         # Number/address formatting
|   |   +-- abi/                  # Contract ABIs (JSON)
|   |   +-- types/
|   |       +-- index.ts          # Frontend TypeScript types
|   +-- Dockerfile                # Production (Nginx)
|   +-- Dockerfile.dev            # Development (Vite HMR)
|   +-- package.json
|
+-- subgraph/                     # Blockchain Indexing Module
|   +-- schema.graphql            # GraphQL entity definitions
|   +-- subgraph.template.yaml    # Subgraph manifest template
|   +-- src/
|   |   +-- token-factory.ts      # TokenCreated event handler
|   |   +-- simple-swap.ts        # DEX event handlers
|   |   +-- utils.ts              # Helper functions
|   +-- config/
|   |   +-- sepolia.json          # Sepolia network config
|   |   +-- goerli.json           # Goerli network config
|   +-- package.json
|
+-- docs/                         # Documentation
|   +-- deployments.json          # Deployed contract addresses
|   +-- PROJECT_ARCHITECTURE.md   # This document
|
+-- docker-compose.yml            # Production orchestration
+-- docker-compose.dev.yml        # Development orchestration
```

---

## 5. Smart Contract Layer

### 5.1 Contract Architecture Diagram

```
+------------------------------------------+
|            TokenFactory                   |
|  (Factory Pattern - no inheritance)       |
|                                           |
|  + createToken()  --> deploys YourToken   |
|  + getAllTokens()                          |
|  + getMyTokens()                          |
|  + totalTokens()                          |
|                                           |
|  Events: TokenCreated                     |
+---------------------+--------------------+
                      |
                      | deploys
                      v
+------------------------------------------+
|            YourToken (ERC-20)             |
|  extends: ERC20, Ownable                  |
|                                           |
|  + mint()     (onlyOwner)                 |
|  + burn()     (public)                    |
|  + burnFrom() (with allowance)            |
|  + cap        (immutable max supply)      |
|  + decimals   (configurable, immutable)   |
+------------------------------------------+

+------------------------------------------+
|            SimpleSwap (DEX)               |
|  extends: Ownable, ReentrancyGuard       |
|                                           |
|  Admin Functions:                         |
|  + listToken()                            |
|  + unlistToken()                          |
|  + setRate()                              |
|  + addLiquidity()                         |
|  + withdraw()                             |
|                                           |
|  User Functions:                          |
|  + buyToken()   (payable, ETH -> Token)   |
|  + sellToken()  (Token -> ETH)            |
|                                           |
|  View Functions:                          |
|  + previewBuy()                           |
|  + previewSell()                          |
|  + getListedTokens()                      |
|  + getTokenInfo()                         |
|                                           |
|  Events: Listed, Unlisted, RateUpdated,   |
|          Bought, Sold, LiquidityAdded,    |
|          LiquidityWithdrawn               |
+------------------------------------------+

+------------------------------------------+
|          TokenStaking                     |
|  extends: Ownable, ReentrancyGuard       |
|  model: Synthetix Reward Distribution     |
|                                           |
|  User Functions:                          |
|  + stake()                                |
|  + withdraw()                             |
|  + claimReward()                          |
|  + exit() (withdraw + claim)              |
|                                           |
|  Admin Functions:                         |
|  + notifyRewardAmount()                   |
|  + setRewardsDuration()                   |
|  + recoverERC20()                         |
|                                           |
|  View Functions:                          |
|  + balanceOf()                            |
|  + earned()                               |
|  + rewardPerToken()                       |
|  + getRewardForDuration()                 |
|                                           |
|  Events: Staked, Withdrawn, RewardPaid,   |
|          RewardAdded, RewardsDurationUpdated|
+------------------------------------------+
```

### 5.2 Contract Details

#### TokenFactory

- **Purpose**: Factory pattern contract that deploys new ERC-20 token instances
- **Storage**: Tracks all created tokens in an array and maps them to their creators
- **Key Function**: `createToken(name, symbol, decimals, initialSupply, cap)` deploys a new `YourToken` contract
- **Access**: Permissionless - any wallet can create tokens

#### YourToken (ERC-20)

- **Base**: OpenZeppelin `ERC20` + `Ownable`
- **Features**: Immutable supply cap, owner-only minting, public burning with allowance support
- **Decimals**: Configurable at deployment time (immutable)
- **Cap Enforcement**: `totalSupply + amount <= cap` checked on every mint

#### SimpleSwap (DEX)

- **Model**: Fixed-rate exchange (admin-defined `tokenPerEth` rate)
- **Buy Formula**: `tokensOut = (ethIn * tokenPerEth) / 1e18`
- **Sell Formula**: `ethOut = (tokensIn * 1e18) / tokenPerEth`
- **Liquidity**: Admin-managed liquidity pools per token pair (Token/ETH)
- **Safety**: ReentrancyGuard, SafeERC20, minimum ETH liquidity enforcement
- **Access**: Admin (list/unlist/rate/liquidity), Public (buy/sell)

#### TokenStaking

- **Model**: Synthetix reward distribution - rewards distributed linearly per second, proportional to user's stake vs total stake
- **Core Formula**: `earned = (balance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18 + rewards`
- **Reward Period**: Configurable duration (default 7 days)
- **Safety**: ReentrancyGuard, SafeERC20, cannot withdraw allocated rewards, `updateReward` modifier ensures proper accounting

### 5.3 Deployment Configuration

| Network | Chain ID | TokenFactory Address | SimpleSwap Address |
|---|---|---|---|
| Sepolia | 11155111 | `0x6f4a72f532833a02f129dffECbB927b1F58e94C1` | `0xA9900799479A1BA12c239B4aAAA3C2a64b46267f` |
| Localhost | 31337 | (deploy locally) | (deploy locally) |

**Compiler Settings**: Solidity 0.8.24, Optimizer enabled (200 runs), viaIR enabled

---

## 6. Backend Server (API Layer)

### 6.1 Architecture

```
                  +------------------+
                  |   HTTP Request   |
                  +--------+---------+
                           |
                  +--------v---------+
                  |     Helmet       |  Security headers
                  +--------+---------+
                           |
                  +--------v---------+
                  |      CORS        |  Origin whitelist
                  +--------+---------+
                           |
                  +--------v---------+
                  |   Body Parser    |  JSON (10MB limit)
                  +--------+---------+
                           |
                  +--------v---------+
                  |     Morgan       |  Request logging
                  +--------+---------+
                           |
                  +--------v---------+
                  |   Rate Limiter   |  100 req / 15 min
                  +--------+---------+
                           |
              +------------+------------+
              |                         |
     +--------v---------+     +--------v---------+
     |  /api/auth/*     |     |  /api/profile/*  |
     +--------+---------+     +--------+---------+
              |                         |
     +--------v---------+     +--------v---------+
     | Auth Middleware   |     | Auth Middleware   |
     | (JWT Verify)      |     | (Optional/Required)|
     +--------+---------+     +--------+---------+
              |                         |
     +--------v---------+     +--------v---------+
     | Validation (Zod) |     | Validation (Zod) |
     +--------+---------+     +--------+---------+
              |                         |
     +--------v---------+     +--------v---------+
     | Route Handler    |     | Route Handler    |
     | (SIWE, JWT utils)|     | (Prisma, IPFS)   |
     +--------+---------+     +--------+---------+
              |                         |
              +------------+------------+
                           |
                  +--------v---------+
                  |  Error Handler   |  Standardized responses
                  +--------+---------+
                           |
                  +--------v---------+
                  |  404 Handler     |  Unknown routes
                  +------------------+
```

### 6.2 Middleware Stack (Execution Order)

| Order | Middleware | Configuration |
|---|---|---|
| 1 | `helmet()` | X-Frame-Options, HSTS, CSP headers |
| 2 | `cors()` | Allowed origins from `CORS_ORIGIN` env, credentials: true |
| 3 | `express.json()` | 10MB body limit |
| 4 | `express.urlencoded()` | Extended mode, 10MB limit |
| 5 | `morgan()` | 'dev' format (development), 'combined' (production) |
| 6 | `rateLimit()` | 100 requests per 15-minute window on `/api/*` |
| 7 | `express.static()` | Serves `/uploads` for mock IPFS (development) |
| 8 | Route middleware | `authenticate`, `optionalAuth`, `validateBody(schema)` |
| 9 | `errorHandler()` | Catches errors, returns standardized JSON |
| 10 | `notFoundHandler()` | Returns 404 for unknown routes |

### 6.3 Service Layer

```
+------------------+     +------------------+     +------------------+
|   SIWE Utils     |     |   JWT Utils      |     |   IPFS Utils     |
|                  |     |                  |     |                  |
| verifySiweMsg()  |     | generateToken()  |     | uploadToIPFS()   |
| generateSiweMsg()|     | verifyToken()    |     | uploadAvatar()   |
| generateNonce()  |     | decodeToken()    |     | deleteFromIPFS() |
| isValidAddress() |     |                  |     | extractCID()     |
| normalizeAddr()  |     |                  |     |                  |
+------------------+     +------------------+     +------------------+
        |                         |                        |
        v                         v                        v
   ethers.js                 jsonwebtoken            fs + crypto
   siwe library              (HS256, 7d exp)         (mock mode)
                                                     or Pinata API
```

---

## 7. Frontend Application (dApp)

### 7.1 Component Architecture

```
<React.StrictMode>
  <WagmiProvider config={wagmiConfig}>        -- Ethereum provider
    <QueryClientProvider>                      -- React Query cache
      <BrowserRouter>                          -- URL routing
        <NetworkGuard>                         -- Chain ID check
          <Layout>                             -- Nav + footer
            <Routes>
              /           --> <Home />         -- Token list
              /create     --> <CreateToken />  -- Factory form
              /swap       --> <Swap />         -- Basic swap UI
              /balances   --> <Balances />     -- User balances
              /admin      --> <Admin />        -- DEX management
              /profile    --> <Profile />      -- SIWE profile
              /analytics  --> <Analytics />    -- Charts & stats
            </Routes>
          </Layout>
        </NetworkGuard>
      </BrowserRouter>
    </QueryClientProvider>
  </WagmiProvider>
</React.StrictMode>
```

### 7.2 Page Components

| Page | Route | Purpose | Data Sources |
|---|---|---|---|
| **Home** | `/` | Lists all tokens from the factory, shows protocol overview | `useAllTokens()` (on-chain), Subgraph stats |
| **CreateToken** | `/create` | Form to deploy new ERC-20 via TokenFactory | `useTokenFactory().createToken()` (write) |
| **Swap** | `/swap` | Buy/sell tokens on SimpleSwap | `useSimpleSwap()`, `useTokenInfo()`, `useListedTokens()` |
| **SwapPro** | `/swap-pro` | Advanced swap with transaction preview | `useSimpleSwap()`, `TransactionPreviewEngine` |
| **Balances** | `/balances` | Shows user's balances for all created tokens | `useTokenBalance()`, `useMyTokens()` |
| **Admin** | `/admin` | List tokens, set rates, manage liquidity | `useSwapAdmin()` (owner-only operations) |
| **Profile** | `/profile` | Manage nickname, avatar via SIWE auth | `useAuth()`, Backend API (`api.ts`) |
| **Analytics** | `/analytics` | Trading volume, token creation charts | Subgraph GraphQL queries (`graph.ts`) |

### 7.3 Custom Hooks Architecture

```
+--------------------------------------------------+
|                  React Hooks                      |
+--------------------------------------------------+
|                                                   |
|  useAuth()            -- SIWE login/logout/verify |
|    |-- useAccount()   (wagmi)                     |
|    |-- useSignMessage() (wagmi)                   |
|    +-- api.ts         (backend HTTP client)       |
|                                                   |
|  useTokenFactory()    -- Create tokens            |
|    |-- useWriteContract() (wagmi)                 |
|    +-- useWaitForTransactionReceipt() (wagmi)     |
|                                                   |
|  useAllTokens()       -- Read all factory tokens  |
|    +-- useReadContract() (wagmi)                  |
|                                                   |
|  useMyTokens(owner)   -- Read owner's tokens      |
|    +-- useReadContract() (wagmi)                  |
|                                                   |
|  useSimpleSwap()      -- Buy/sell tokens          |
|    |-- useWriteContract() (wagmi)                 |
|    +-- useWaitForTransactionReceipt() (wagmi)     |
|                                                   |
|  useListedTokens()    -- Read DEX listed tokens   |
|    +-- useReadContract() (wagmi)                  |
|                                                   |
|  useTokenInfo(addr)   -- Read token DEX info      |
|    +-- useReadContract() (wagmi)                  |
|                                                   |
|  useSwapAdmin()       -- Admin DEX operations     |
|    |-- useWriteContract() (wagmi)                 |
|    +-- useWaitForTransactionReceipt() (wagmi)     |
|                                                   |
|  useToken(addr)       -- Read ERC-20 metadata     |
|    +-- useReadContract() x6 (name, symbol, etc.)  |
|                                                   |
|  useTokenBalance()    -- Read user balance         |
|    +-- useReadContract() (wagmi)                  |
|                                                   |
|  useTokenApprove()    -- ERC-20 approve            |
|    +-- useWriteContract() (wagmi)                 |
|                                                   |
|  useTokenAllowance()  -- Read allowance            |
|    +-- useReadContract() (wagmi)                  |
+--------------------------------------------------+
```

### 7.4 State Management

The frontend uses a **multi-layered state management** approach:

| Layer | Technology | Scope |
|---|---|---|
| **On-chain State** | Wagmi + React Query | Contract reads (auto-cached, auto-refetched) |
| **Server State** | React Query (via Axios) | Backend API data (profiles, auth) |
| **Subgraph State** | fetch + React Query | GraphQL analytics data |
| **Local State** | React `useState` | Form inputs, UI toggles |
| **Persistent State** | `localStorage` | JWT auth token |

### 7.5 Wallet Configuration

```
Supported Chains: Sepolia (11155111), Goerli (5)
Connectors:
  - Injected (MetaMask, Brave Wallet, etc.)
  - WalletConnect v2 (optional, requires project ID)
Transports:
  - HTTP (public RPC endpoints via wagmi defaults)
```

---

## 8. Subgraph (Indexing Layer)

### 8.1 Entity-Relationship Diagram

```
+-------------------+       +-------------------+
|      Token        |       |       User        |
+-------------------+       +-------------------+
| id (address)      |       | id (address)      |
| name              |  1..* | totalTokensCreated|
| symbol            |<------| firstCreatedAt    |
| decimals          |creator| lastCreatedAt     |
| initialSupply     |       | totalBuys         |
| cap               |       | totalSells        |
| creator --> User  |       | totalBuyVolume    |
| createdAt         |       | totalSellVolume   |
| txHash            |       | totalLiqAdded     |
|                   |       | totalLiqRemoved   |
| isListed          |       | firstSeenAt       |
| tokenPerEth       |       | lastSeenAt        |
| ethBalance        |       | totalTransactions |
| tokenBalance      |       +--------+----------+
| listedAt          |                |
|                   |                |
| totalBuyVolume    |       +--------v----------+
| totalSellVolume   |       |       Swap        |
| totalBuyCount     |       | (immutable)       |
| totalSellCount    |       +-------------------+
| totalLiqAdded     |       | id (txHash+logIdx)|
| totalLiqRemoved   |       | token --> Token   |
+--------+----------+       | user --> User     |
         |                  | type: BUY | SELL  |
         |                  | ethAmount         |
+--------v----------+       | tokenAmount       |
|  LiquidityEvent   |       | timestamp         |
|  (immutable)      |       | blockNumber       |
+-------------------+       | txHash            |
| id (txHash+logIdx)|       +-------------------+
| token --> Token   |
| provider --> User |       +-------------------+
| type: ADD|REMOVE  |       |  ProtocolStats    |
|       |DELIST     |       |  (singleton id=1) |
| ethAmount         |       +-------------------+
| tokenAmount       |       | totalTokensCreated|
| tokenPerEth       |       | totalTokensListed |
| timestamp         |       | totalSwaps/Buys   |
| blockNumber       |       | totalSells        |
| txHash            |       | totalVolumeETH    |
+-------------------+       | totalVolumeUSD    |
                            | totalLiquidityETH |
+-------------------+       | totalUsers        |
|   DailyStats      |       | totalCreators     |
+-------------------+       | totalTraders      |
| id (day timestamp)|       | totalLiqProviders |
| date              |       +-------------------+
| tokensCreated     |
| tokensListed      |
| swaps/buys/sells  |
| volumeETH/USD     |
| uniqueTraders     |
| liquidityAdded    |
| liquidityRemoved  |
| activeUsers       |
| transactions      |
+-------------------+
```

### 8.2 Event Handlers

| Contract | Event | Handler | Entities Updated |
|---|---|---|---|
| TokenFactory | `TokenCreated` | `handleTokenCreated` | Token, User, ProtocolStats, DailyStats |
| SimpleSwap | `Listed` | `handleListed` | Token, LiquidityEvent, ProtocolStats, DailyStats |
| SimpleSwap | `Unlisted` | `handleUnlisted` | Token, LiquidityEvent, ProtocolStats, DailyStats |
| SimpleSwap | `Bought` | `handleBought` | Token, Swap, User, ProtocolStats, DailyStats |
| SimpleSwap | `Sold` | `handleSold` | Token, Swap, User, ProtocolStats, DailyStats |
| SimpleSwap | `LiquidityAdded` | `handleLiquidityAdded` | Token, LiquidityEvent, User, ProtocolStats, DailyStats |
| SimpleSwap | `LiquidityWithdrawn` | `handleLiquidityWithdrawn` | Token, LiquidityEvent, User, ProtocolStats, DailyStats |
| SimpleSwap | `RateUpdated` | `handleRateUpdated` | Token |

### 8.3 GraphQL Queries Used by Frontend

| Query | Purpose | Called From |
|---|---|---|
| `GetTopTokens` | Fetch tokens ordered by creation count | Analytics page |
| `GetTopMarkets` | Fetch markets by trading volume | Analytics page |
| `GetRecentTrades` | Fetch latest trades with pagination | Analytics page |
| `GetUserActivity` | Fetch user's buy/sell/creation counts | Profile page |
| `GetTotalStats` | Fetch protocol-wide statistics | Home page |

---

## 9. Data Flow & Sequence Diagrams

### 9.1 Token Creation Flow

```
User                Frontend            Blockchain           Subgraph
 |                     |                    |                    |
 |  Click "Create"     |                    |                    |
 |-------------------->|                    |                    |
 |                     |  writeContract()   |                    |
 |                     |------------------->|                    |
 |                     |                    |                    |
 |  Sign Transaction   |                    |                    |
 |<--------------------|                    |                    |
 |  (MetaMask popup)   |                    |                    |
 |-------------------->|                    |                    |
 |                     |                    |  TokenFactory      |
 |                     |                    |  .createToken()    |
 |                     |                    |-----+              |
 |                     |                    |     | Deploy       |
 |                     |                    |     | YourToken    |
 |                     |                    |<----+              |
 |                     |                    |                    |
 |                     |                    |  Emit:             |
 |                     |                    |  TokenCreated      |
 |                     |                    |------------------->|
 |                     |                    |                    |
 |                     |  TX Receipt       |                    | Index event
 |                     |<-------------------|                    | Create Token
 |                     |                    |                    | entity
 |  Show success       |                    |                    |
 |<--------------------|                    |                    |
```

### 9.2 Token Swap (Buy) Flow

```
User                Frontend            SimpleSwap           Subgraph
 |                     |                    |                    |
 |  Enter ETH amount   |                    |                    |
 |-------------------->|                    |                    |
 |                     |  previewBuy()      |                    |
 |                     |------------------->|                    |
 |                     |  tokensOut         |                    |
 |                     |<-------------------|                    |
 |  Shows preview      |                    |                    |
 |<--------------------|                    |                    |
 |                     |                    |                    |
 |  Confirm swap       |                    |                    |
 |-------------------->|                    |                    |
 |                     |  buyToken{value}   |                    |
 |                     |------------------->|                    |
 |  Sign TX            |                    |                    |
 |<--------------------|                    |                    |
 |-------------------->|                    |                    |
 |                     |                    |  Transfer tokens   |
 |                     |                    |  to buyer          |
 |                     |                    |  Emit: Bought      |
 |                     |                    |------------------->|
 |                     |  TX Receipt       |                    | Index swap
 |                     |<-------------------|                    |
 |  Show success       |                    |                    |
 |<--------------------|                    |                    |
```

### 9.3 SIWE Authentication Flow

```
User              Frontend            MetaMask         Backend Server      Database
 |                   |                   |                   |                 |
 |  Click "Sign In"  |                   |                   |                 |
 |------------------>|                   |                   |                 |
 |                   |  Create SIWE      |                   |                 |
 |                   |  message object   |                   |                 |
 |                   |                   |                   |                 |
 |                   |  signMessage()    |                   |                 |
 |                   |------------------>|                   |                 |
 |                   |                   |                   |                 |
 |  Sign message     |                   |                   |                 |
 |<------------------|-------------------|                   |                 |
 |  (popup)          |                   |                   |                 |
 |------------------>|                   |                   |                 |
 |                   |  signature        |                   |                 |
 |                   |<------------------|                   |                 |
 |                   |                   |                   |                 |
 |                   |  POST /api/auth/login                 |                 |
 |                   |  {message, signature}                 |                 |
 |                   |-------------------------------------->|                 |
 |                   |                   |                   |                 |
 |                   |                   |  verifySiweMessage(msg, sig)        |
 |                   |                   |                   |---+             |
 |                   |                   |                   |   | Verify      |
 |                   |                   |                   |<--+ signature   |
 |                   |                   |                   |                 |
 |                   |                   |                   |  upsert User   |
 |                   |                   |                   |---------------->|
 |                   |                   |                   |  create Session |
 |                   |                   |                   |---------------->|
 |                   |                   |                   |                 |
 |                   |                   |  {token, walletAddress, user}       |
 |                   |<--------------------------------------|                 |
 |                   |                   |                   |                 |
 |                   |  Store JWT in     |                   |                 |
 |                   |  localStorage     |                   |                 |
 |                   |                   |                   |                 |
 |  Authenticated!   |                   |                   |                 |
 |<------------------|                   |                   |                 |
```

### 9.4 Token Sell Flow (with ERC-20 Approval)

```
User              Frontend            YourToken        SimpleSwap
 |                   |                   |                  |
 |  Enter amount     |                   |                  |
 |------------------>|                   |                  |
 |                   |  allowance()      |                  |
 |                   |------------------>|                  |
 |                   |  current=0        |                  |
 |                   |<------------------|                  |
 |                   |                   |                  |
 |  Click "Approve"  |                   |                  |
 |------------------>|                   |                  |
 |                   |  approve(swap,amt)|                  |
 |                   |------------------>|                  |
 |  Sign TX          |                   |                  |
 |<------------------|                   |                  |
 |------------------>|                   |                  |
 |                   |  TX confirmed     |                  |
 |                   |<------------------|                  |
 |                   |                   |                  |
 |  Click "Sell"     |                   |                  |
 |------------------>|                   |                  |
 |                   |  sellToken()      |                  |
 |                   |------------------------------------>|
 |                   |                   |  transferFrom   |
 |                   |                   |<----------------|
 |                   |                   |  Transfer ETH   |
 |                   |                   |  to seller      |
 |  Sign TX          |                   |                  |
 |<------------------|                   |                  |
 |------------------>|                   |                  |
 |                   |  TX confirmed     |                  |
 |                   |<------------------------------------|
 |  Show success     |                   |                  |
 |<------------------|                   |                  |
```

---

## 10. Authentication Architecture

### 10.1 SIWE (Sign-In with Ethereum) Protocol

```
+--------------------------------------------------+
|              SIWE Message Structure               |
+--------------------------------------------------+
|  {domain}       wants you to sign in with your    |
|  Ethereum account:                                |
|  {address}                                        |
|                                                   |
|  {statement}                                      |
|                                                   |
|  URI: {uri}                                       |
|  Version: {version}                               |
|  Chain ID: {chainId}                              |
|  Nonce: {nonce}                                   |
|  Issued At: {issuedAt}                            |
+--------------------------------------------------+
```

### 10.2 Authentication Layers

```
Layer 1: Wallet Ownership (SIWE)
  +-- Cryptographic proof that user owns the private key
  +-- No passwords stored anywhere
  +-- Replay protection via nonce

Layer 2: Session Management (JWT)
  +-- Signed token with 7-day expiry (HS256)
  +-- Payload: { walletAddress, iat, exp }
  +-- Stored in localStorage on frontend
  +-- Sent as: Authorization: Bearer <token>

Layer 3: Database Sessions (Optional)
  +-- Session records in SQLite for explicit logout
  +-- Token stored for blacklisting on logout
  +-- walletAddress index for session lookups
```

### 10.3 Authorization Matrix

| Endpoint | Auth Required | Who Can Access |
|---|---|---|
| `POST /api/auth/login` | No | Anyone with a wallet |
| `GET /api/auth/nonce` | No | Anyone |
| `POST /api/auth/logout` | Yes | Authenticated user |
| `GET /api/auth/verify` | Yes | Authenticated user |
| `GET /api/profile/:address` | Optional | Anyone (public profile) |
| `GET /api/profile` | Yes | Own profile only |
| `POST /api/profile` | Yes | Own profile only |
| `POST /api/profile/avatar` | Yes | Own profile only |
| `DELETE /api/profile/avatar` | Yes | Own profile only |

---

## 11. Database Design

### 11.1 Schema Diagram

```
+-------------------------------+     +-------------------------------+
|           users               |     |          sessions             |
+-------------------------------+     +-------------------------------+
| id: String (PK, CUID)        |     | id: String (PK, CUID)        |
| walletAddress: String (UQ)   |     | walletAddress: String (IDX)  |
| nickname: String?             |     | token: String (UQ)           |
| avatarUrl: String?            |     | expiresAt: DateTime          |
| createdAt: DateTime (auto)   |     | createdAt: DateTime (auto)   |
| updatedAt: DateTime (auto)   |     +-------------------------------+
+-------------------------------+

UQ = Unique Index
IDX = Non-unique Index
PK = Primary Key
```

### 11.2 ORM Layer

- **Prisma ORM v5.9.1** with auto-generated TypeScript client
- **Development**: SQLite (`file:./dev.db`)
- **Production**: PostgreSQL (configurable via `DATABASE_URL`)
- **Migrations**: `prisma migrate dev` for development, `prisma migrate deploy` for production

---

## 12. API Reference

### 12.1 Authentication Endpoints

#### `POST /api/auth/login`
Sign in with Ethereum wallet.

**Request:**
```json
{
  "message": "<SIWE message string>",
  "signature": "0x<130 hex characters>"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "walletAddress": "0x09764df02e4b03aabe612983d5fc360c54cf966c",
    "user": {
      "walletAddress": "0x09764df02e4b03aabe612983d5fc360c54cf966c",
      "nickname": null,
      "avatarUrl": null,
      "createdAt": "2026-01-09T13:25:13.264Z",
      "updatedAt": "2026-01-09T13:25:13.264Z"
    }
  }
}
```

#### `POST /api/auth/logout`
Invalidate current session.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

#### `GET /api/auth/verify`
Verify JWT token validity and return user data.

**Headers:** `Authorization: Bearer <token>`

**Response (200):**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "user": { /* UserProfile */ }
  }
}
```

#### `GET /api/auth/nonce`
Generate random nonce for SIWE message.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "nonce": "k7x3m9p2q"
  }
}
```

### 12.2 Profile Endpoints

#### `GET /api/profile/:address`
Get public profile by wallet address.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "walletAddress": "0x...",
    "nickname": "TokenMaster",
    "avatarUrl": "https://ipfs.io/ipfs/Qm...",
    "createdAt": "2026-01-09T13:25:13.264Z",
    "updatedAt": "2026-01-10T08:15:00.000Z"
  }
}
```

#### `GET /api/profile`
Get authenticated user's profile.

**Headers:** `Authorization: Bearer <token>`

#### `POST /api/profile`
Update user profile.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "nickname": "TokenMaster",
  "avatarUrl": "https://..."
}
```

#### `POST /api/profile/avatar`
Upload avatar as base64 data URL.

**Headers:** `Authorization: Bearer <token>`

**Request:**
```json
{
  "dataUrl": "data:image/png;base64,iVBORw0KGgo..."
}
```

**Validation:**
- Supported formats: JPEG, PNG, GIF, WebP
- Maximum file size: 5MB
- Stored on IPFS (or local mock storage in development)

#### `DELETE /api/profile/avatar`
Remove avatar from profile.

**Headers:** `Authorization: Bearer <token>`

### 12.3 Health Check

#### `GET /health`
Server health check.

**Response (200):** `OK` or health status JSON

### 12.4 Error Response Format

All errors follow a standardized format:

```json
{
  "success": false,
  "error": "Error description",
  "details": [                     // Only for validation errors
    { "path": "field", "message": "reason" }
  ],
  "stack": "..."                   // Only in development
}
```

| HTTP Code | Meaning |
|---|---|
| 200 | Success |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 404 | Not Found (resource or route) |
| 429 | Too Many Requests (rate limited) |
| 500 | Internal Server Error |

### 12.5 Validation Schemas (Zod)

```typescript
schemas.login = {
  message: z.string().min(1),
  signature: z.string().regex(/^0x[a-fA-F0-9]{130}$/)
}

schemas.profileUpdate = {
  nickname: z.string().min(1).max(50).optional(),
  avatarUrl: z.string().url().optional().or(z.literal(''))
}

schemas.avatarUpload = {
  dataUrl: z.string().regex(/^data:image\/(jpeg|png|gif|webp);base64,/)
}
```

---

## 13. Smart Contract Interfaces

### 13.1 TokenFactory

| Function | Access | Parameters | Returns | Gas Estimate |
|---|---|---|---|---|
| `createToken` | Public | `name`, `symbol`, `decimals`, `initialSupply`, `cap` | `address` | ~2.5M |
| `getAllTokens` | View | - | `address[]` | ~30K |
| `getMyTokens` | View | `owner` | `address[]` | ~30K |
| `totalTokens` | View | - | `uint256` | ~25K |

### 13.2 YourToken (ERC-20)

| Function | Access | Parameters | Returns |
|---|---|---|---|
| `mint` | Owner | `to`, `amount` | - |
| `burn` | Public | `amount` | - |
| `burnFrom` | Public (with allowance) | `from`, `amount` | - |
| `cap` | View | - | `uint256` |
| `decimals` | View | - | `uint8` |
| *Standard ERC-20* | *Various* | *Standard* | *Standard* |

### 13.3 SimpleSwap

| Function | Access | Parameters | Returns |
|---|---|---|---|
| `listToken` | Owner | `token`, `tokenPerEth`, `minEthLiquidity` | - |
| `unlistToken` | Owner | `token` | - |
| `setRate` | Owner | `token`, `newTokenPerEth` | - |
| `addLiquidity` | Owner (payable) | `token`, `tokenAmount` | - |
| `withdraw` | Owner | `token`, `tokenAmount`, `ethAmount` | - |
| `buyToken` | Public (payable) | `token` | - |
| `sellToken` | Public | `token`, `amount` | - |
| `previewBuy` | View | `token`, `ethAmount` | `uint256` |
| `previewSell` | View | `token`, `tokenAmount` | `uint256` |
| `getListedTokens` | View | - | `address[]` |
| `getTokenInfo` | View | `token` | `(bool, uint256, uint256, uint256, uint256)` |

### 13.4 TokenStaking

| Function | Access | Parameters | Returns |
|---|---|---|---|
| `stake` | Public | `amount` | - |
| `withdraw` | Public | `amount` | - |
| `claimReward` | Public | - | - |
| `exit` | Public | - | - |
| `notifyRewardAmount` | Owner | `reward` | - |
| `setRewardsDuration` | Owner | `_rewardsDuration` | - |
| `recoverERC20` | Owner | `tokenAddress`, `tokenAmount` | - |
| `balanceOf` | View | `account` | `uint256` |
| `earned` | View | `account` | `uint256` |
| `rewardPerToken` | View | - | `uint256` |
| `getRewardForDuration` | View | - | `uint256` |

---

## 14. Infrastructure & Deployment

### 14.1 Docker Architecture

```
docker-compose.yml (Production)
+-----------------------------------------------+
|                                                |
|  +------------------+   +-----------------+    |
|  |    backend        |   |    frontend     |    |
|  |  (Node 20 Alpine) |   |  (Nginx Alpine) |    |
|  |                   |   |                 |    |
|  |  Port: 3001       |   |  Port: 80       |    |
|  |  Healthcheck: /   |   |  Depends on:    |    |
|  |    health         |   |    backend      |    |
|  |                   |   |  (healthy)      |    |
|  |  Volumes:         |   |                 |    |
|  |  - data (SQLite)  |   |  Static files   |    |
|  |  - uploads (IPFS) |   |  from Vite build|    |
|  +------------------+   +-----------------+    |
|                                                |
|  Network: tokenfactory-network (bridge)        |
|  Volumes: backend-data, backend-uploads        |
+-----------------------------------------------+

docker-compose.dev.yml (Development)
+-----------------------------------------------+
|                                                |
|  +------------------+   +-----------------+    |
|  |   backend-dev     |   |   frontend-dev  |    |
|  |  (Node 20 Alpine) |   |  (Node 20 Alpine)|   |
|  |                   |   |                 |    |
|  |  Port: 3001       |   |  Port: 5173     |    |
|  |  Hot reload: tsx   |   |  Hot reload:    |    |
|  |    watch          |   |    Vite HMR     |    |
|  |                   |   |                 |    |
|  |  Volume mounts:   |   |  Volume mounts: |    |
|  |  ./server:/app    |   |  ./dapp:/app    |    |
|  +------------------+   +-----------------+    |
|                                                |
|  Network: tokenfactory-dev (bridge)            |
+-----------------------------------------------+
```

### 14.2 Production Build Pipeline

```
Contracts:
  npm run compile     --> Hardhat compiles Solidity to ABI + bytecode
  npm run test        --> Hardhat + Chai tests
  npm run deploy:sep  --> Deploy to Sepolia via Hardhat script
  npm run verify:sep  --> Verify on Etherscan

Backend:
  npm run build       --> tsc compiles to dist/
  prisma generate     --> Generate Prisma Client
  prisma migrate      --> Apply database migrations
  Docker multi-stage  --> deps -> builder -> runner (node:20-alpine)

Frontend:
  npm run build       --> tsc + vite build (static files)
  Docker multi-stage  --> deps -> builder -> nginx:alpine serves dist/

Subgraph:
  npm run codegen     --> Generate AssemblyScript types from schema
  npm run build       --> Compile to WASM
  npm run deploy      --> Deploy to The Graph Studio
```

### 14.3 Environment Configuration

| Module | Key Variables | Description |
|---|---|---|
| **contracts** | `PRIVATE_KEY`, `RPC_URL`, `ETHERSCAN_API_KEY` | Deployment wallet, RPC provider, verification |
| **server** | `JWT_SECRET`, `DATABASE_URL`, `CORS_ORIGIN`, `IPFS_MOCK` | Auth, database, CORS, storage mode |
| **dapp** | `VITE_FACTORY_ADDRESS`, `VITE_SWAP_ADDRESS`, `VITE_BACKEND_URL`, `VITE_SUBGRAPH_URL` | Contract addresses, API URLs |
| **subgraph** | Network configs in `config/*.json` | Contract addresses, start blocks |

---

## 15. Security Architecture

### 15.1 Security Layers Diagram

```
+------------------------------------------------------------------+
|                    SECURITY ARCHITECTURE                          |
+------------------------------------------------------------------+
|                                                                   |
|  NETWORK LAYER                                                    |
|  +------------------------------------------------------------+  |
|  | Helmet.js: X-Frame-Options, HSTS, Content-Security-Policy  |  |
|  | CORS: Whitelist specific origins                            |  |
|  | Rate Limiting: 100 req / 15 min per IP                     |  |
|  | HTTPS: Required in production                               |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  APPLICATION LAYER                                                |
|  +------------------------------------------------------------+  |
|  | SIWE: Cryptographic wallet verification (no passwords)      |  |
|  | JWT: HS256 signed tokens with 7-day expiry                  |  |
|  | Zod: Runtime input validation on all endpoints              |  |
|  | Body Size Limit: 10MB maximum request body                  |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  SMART CONTRACT LAYER                                             |
|  +------------------------------------------------------------+  |
|  | OpenZeppelin: Audited base contracts                        |  |
|  | ReentrancyGuard: Prevents reentrant calls on DEX/staking   |  |
|  | SafeERC20: Safe token transfer wrappers                     |  |
|  | Ownable: Role-based access control (admin functions)        |  |
|  | Supply Cap: Immutable maximum token supply                  |  |
|  | Min Liquidity: Prevents complete DEX pool drain             |  |
|  +------------------------------------------------------------+  |
|                                                                   |
|  DATA LAYER                                                       |
|  +------------------------------------------------------------+  |
|  | No password storage (wallet-based auth)                     |  |
|  | Address normalization (lowercase consistency)               |  |
|  | Parameterized queries via Prisma (SQL injection prevention) |  |
|  | File type + size validation on uploads                      |  |
|  +------------------------------------------------------------+  |
+------------------------------------------------------------------+
```

### 15.2 Smart Contract Security Patterns

| Pattern | Contract | Protection Against |
|---|---|---|
| ReentrancyGuard | SimpleSwap, TokenStaking | Reentrancy attacks on ETH transfers |
| SafeERC20 | SimpleSwap, TokenStaking | Non-standard ERC-20 transfer failures |
| Ownable | YourToken, SimpleSwap, TokenStaking | Unauthorized admin operations |
| Supply Cap | YourToken | Infinite minting / supply inflation |
| Min Liquidity | SimpleSwap | Complete pool drainage |
| Checks-Effects-Interactions | SimpleSwap | State manipulation during external calls |

---

## 16. Component Interaction Diagrams

### 16.1 Full System Interaction Map

```
+-----+
|User |
+--+--+
   |
   | Browser + Wallet
   |
+--v------------------------------------------------------+
|                    FRONTEND (dApp)                        |
|                                                          |
|  +------------+  +----------+  +-------------------+     |
|  | Wagmi/Viem |  | Axios    |  | Graph Client      |     |
|  | (on-chain) |  | (backend)|  | (subgraph)        |     |
|  +-----+------+  +----+-----+  +--------+----------+     |
+--------|---------------|-----------------|----------------+
         |               |                 |
    [JSON-RPC]      [REST API]       [GraphQL]
         |               |                 |
+--------v----+  +-------v------+  +-------v---------+
| Ethereum    |  | Express.js   |  | The Graph       |
| Blockchain  |  | Backend      |  | Hosted Service  |
|             |  |              |  |                 |
| TokenFactory|  | Auth Routes  |  | Token Entity    |
| SimpleSwap  |  | Profile Route|  | Swap Entity     |
| YourToken   |  | JWT/SIWE     |  | User Entity     |
| TokenStaking|  | Prisma ORM   |  | ProtocolStats   |
|             |  |              |  | DailyStats      |
+--------+----+  +-------+------+  +-----------------+
         |               |
    [Event Logs]    [SQL Queries]
         |               |
+--------v----+  +-------v------+
| Subgraph    |  | SQLite /     |
| Indexer     |  | PostgreSQL   |
| (graph-ts)  |  |              |
+-------------+  | users        |
                 | sessions     |
                 +--------------+
```

### 16.2 Technology Connections Summary

```
contracts/ ----[ABIs]----> dapp/src/abi/
contracts/ ----[ABIs]----> subgraph/ (via abis reference)
contracts/ ----[deploy]--> Ethereum (Sepolia)

server/    ----[REST]----> dapp/ (via Axios)
server/    ----[Prisma]--> SQLite/PostgreSQL

dapp/      ----[wagmi]---> Ethereum (JSON-RPC)
dapp/      ----[axios]---> server/ (REST API)
dapp/      ----[fetch]---> subgraph/ (GraphQL)

subgraph/  ----[index]---> Ethereum (event logs)
subgraph/  ----[serve]---> dapp/ (GraphQL queries)
```

---

## Appendix A: Deployed Contract Addresses

| Network | Contract | Address |
|---|---|---|
| Sepolia | TokenFactory | `0x6f4a72f532833a02f129dffECbB927b1F58e94C1` |
| Sepolia | SimpleSwap | `0xA9900799479A1BA12c239B4aAAA3C2a64b46267f` |
| Sepolia | Deployer | `0x09764Df02E4B03aabe612983d5fC360C54cf966C` |

## Appendix B: TypeScript Type Definitions

### Frontend Types

```typescript
interface Token {
  address: Address;
  name: string;
  symbol: string;
  decimals: number;
  totalSupply: bigint;
  cap: bigint;
  owner: Address;
}

interface TokenInfo {
  isListed: boolean;
  tokenPerEth: bigint;
  minEthLiquidity: bigint;
  tokenBalance: bigint;
  ethBalance: bigint;
}

interface UserProfile {
  walletAddress: string;
  nickname?: string | null;
  avatarUrl?: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  walletAddress: string | null;
  profile: UserProfile | null;
}
```

### Backend Types

```typescript
interface AuthenticatedRequest extends Request {
  walletAddress?: string;
  userId?: string;
}

interface JWTPayload {
  walletAddress: string;
  iat?: number;
  exp?: number;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

interface IPFSUploadResult {
  cid: string;
  url: string;
}
```

## Appendix C: Development Quick Reference

```bash
# Smart Contracts
cd contracts
npm run compile              # Compile Solidity
npm run test                 # Run tests
npm run deploy:sepolia       # Deploy to Sepolia
npm run verify:sepolia       # Verify on Etherscan

# Backend Server
cd server
npm run dev                  # Start dev server (tsx watch)
npm run prisma:migrate       # Run DB migrations
npm run prisma:studio        # Open Prisma Studio GUI
npm run db:seed              # Seed database

# Frontend dApp
cd dapp
npm run dev                  # Start Vite dev server (:5173)
npm run build                # Production build
npm run type-check           # TypeScript check

# Subgraph
cd subgraph
npm run prepare:sepolia      # Generate subgraph.yaml for Sepolia
npm run codegen              # Generate AssemblyScript types
npm run build                # Compile subgraph
npm run deploy               # Deploy to The Graph Studio

# Docker
docker compose up            # Production
docker compose -f docker-compose.dev.yml up  # Development
```

---

*Document generated from source code analysis of the TokenFactory project.*
*All diagrams use ASCII art for maximum compatibility.*
