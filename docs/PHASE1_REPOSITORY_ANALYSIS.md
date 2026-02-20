# PHASE 1 -- Full Repository Analysis: Structured Technical Findings

## 1. High-Level Architecture

**On-chain components:** Four Solidity 0.8.24 contracts -- `YourToken` (ERC-20), `TokenFactory` (deployer), `SimpleSwap` (fixed-rate DEX), `TokenStaking` (Synthetix-model rewards). All target Sepolia testnet.

**Off-chain components:** Express/TypeScript backend (SIWE authentication, Prisma/SQLite persistence, mock IPFS); Graph Protocol subgraph (event indexing, analytics aggregation); React frontend (dApp).

**Interaction flow:** Users create tokens via `TokenFactory`, list them on `SimpleSwap` (owner-only), trade at admin-set fixed rates, and stake via `TokenStaking`. The subgraph indexes all contract events into queryable entities. The backend handles identity (SIWE + JWT) independently of on-chain state -- no oracle bridge exists between layers.

**Modular structure:** Clean four-layer separation: contracts / subgraph / server / dApp. No cross-compilation dependency. The subgraph binds directly to deployed contract ABIs.

---

## 2. Smart Contract Layer

### YourToken.sol
- **Purpose:** Capped ERC-20 with owner-controlled minting and public burning.
- **State model:** Immutable `cap` and `_decimals`; inherited `Ownable` + `ERC20` state.
- **Core logic:** `mint()` enforces `totalSupply() + amount <= cap`; `burn()` / `burnFrom()` use standard OpenZeppelin internals.
- **Access control:** `onlyOwner` on `mint()`; burning is permissionless for own tokens, allowance-gated for others.
- **Gas design:** Immutable cap/decimals avoids SLOAD on reads.

### TokenFactory.sol
- **Purpose:** Permissionless deployer of `YourToken` instances via `CREATE` opcode.
- **State model:** `allTokens[]` array + `tokensByOwner` mapping. Append-only, no deletion.
- **Core logic:** `createToken()` deploys with `new YourToken(...)`, sets `msg.sender` as token owner.
- **Economic assumption:** No fee on creation -- zero-cost token deployment.
- **Scalability concern:** `getAllTokens()` returns unbounded array; will revert at scale.
- **Event model:** Single `TokenCreated` event with indexed `owner` and `token`.

### SimpleSwap.sol
- **Purpose:** Admin-managed fixed-rate token/ETH exchange.
- **Pricing logic:** `tokensOut = (ethIn * tokenPerEth) / 1e18`; `ethOut = (tokensIn * 1e18) / tokenPerEth`. Deterministic, no curve, no slippage function, no fees.
- **State model:** `TokenInfo` struct per listed token tracking `isListed`, `tokenPerEth`, `minEthLiquidity`, balances.
- **Security:** `ReentrancyGuard` on `buyToken()`, `sellToken()`, `withdraw()`. Uses `SafeERC20` for all token transfers. ETH sent via low-level `call{value}`.
- **Liquidity management:** Owner-only `addLiquidity()` / `withdraw()`. `minEthLiquidity` floor enforced on sells and withdrawals.
- **Access control:** Listing, unlisting, rate-setting, and liquidity ops are all `onlyOwner`. Trading is permissionless.
- **Critical observation:** `sellToken()` updates internal balances before external `safeTransferFrom()` -- state is updated optimistically, then the token pull occurs. The ETH send to seller follows. This ordering is safe under `nonReentrant` but would be vulnerable without it.
- **Limitation:** `unlistToken()` uses O(n) loop over `listedTokens` array.

### TokenStaking.sol
- **Purpose:** Time-weighted reward distribution (Synthetix `StakingRewards` pattern).
- **Reward math:**
  - `rewardPerToken = rewardPerTokenStored + ((lastTimeRewardApplicable - lastUpdateTime) * rewardRate * 1e18 / totalStaked)`
  - `earned(account) = (balance * (rewardPerToken - userRewardPerTokenPaid)) / 1e18 + rewards[account]`
- **State model:** `rewardRate`, `periodFinish`, `rewardPerTokenStored`, per-user `rewards[]`, `userRewardPerTokenPaid[]`, `_balances[]`.
- **Security:** `nonReentrant` on `stake()`, `withdraw()`, `claimReward()`. `updateReward` modifier snapshots global + per-user state before any balance mutation.
- **Edge case handling:** `notifyRewardAmount()` correctly handles mid-period reward additions by computing leftover and re-averaging. Same-token staking/reward case explicitly deducts `totalStaked` from available balance.
- **Precision:** 1e18 scaling for `rewardPerToken`; integer division truncation is the known precision loss vector (identical to Synthetix).
- **Access control:** Owner sets rewards and duration. Users stake/withdraw/claim freely.

---

## 3. DEX Model Analysis

**Model:** Fixed-rate order book without spread, fees, or AMM curve. Price is set administratively via `setRate()`. This is not a market-making model -- it is a centralized price-feed exchange with on-chain settlement.

**Mathematical formulation:**
- Buy: `T_out = (E_in * R) / 10^18`, where R = `tokenPerEth`
- Sell: `E_out = (T_in * 10^18) / R`

**Security implications:** No slippage protection needed (fixed rate), but zero fee means no protocol revenue and no economic disincentive for wash trading. The `minEthLiquidity` floor is the only drain protection.

**Limitation vs. production DEX:** No AMM bonding curve, no LP tokens, no fee accrual, no price discovery mechanism. The owner is the sole market maker and price setter.

---

## 4. Staking Module Analysis

**Model:** Direct implementation of Synthetix `StakingRewards`. Continuous reward accrual over a fixed `rewardsDuration` (default 7 days).

**Economic sustainability:** Entirely dependent on owner funding via `notifyRewardAmount()`. No protocol-generated revenue feeds rewards.

**Attack vectors:**
- *Dust staking:* If `totalStaked` is very small, a single staker captures nearly all rewards -- not an attack per se, but an economic concentration risk.
- *Front-running `notifyRewardAmount()`:* A staker observing a reward notification in the mempool could stake just before, capturing a disproportionate share. Standard Synthetix limitation.
- *Precision loss:* Truncation in integer division of `rewardRate = reward / rewardsDuration` can leave dust rewards unclaimable.

---

## 5. Tokenomics Model

**Emission:** No automated emission. Token supply is capped at deployment (`YourToken.cap`). Owner mints manually. Reward tokens for staking are deposited manually.

**Incentive structure:** Staking rewards incentivize holding; trading has no fee incentive or penalty. No burn-on-trade, no buyback, no deflationary mechanism.

**APR formulation:** `APR = (rewardRate * 365 * 86400 * 100) / totalStaked` (assuming same-denomination tokens). Not computed on-chain.

---

## 6. Security Model

- **Reentrancy:** `ReentrancyGuard` on all state-mutating external calls in `SimpleSwap` and `TokenStaking`. `TokenFactory` has no ETH handling.
- **State update order:** `SimpleSwap.sellToken()` writes balances before external calls -- safe only because of `nonReentrant`. `TokenStaking` uses `updateReward` modifier as a pre-hook, which is the canonical safe pattern.
- **Centralization risks:** Owner controls listing/delisting, exchange rates, liquidity, reward funding, and reward duration. Single owner key compromise would allow pool draining via `withdraw()` and price manipulation via `setRate()`. No multisig, no timelock, no governance.
- **Missing protections:** No pause mechanism on any contract. No maximum rate bounds on `setRate()`. No event on `unlistToken()` (uses `Unlisted` event, distinct from subgraph's expected `Delisted`).

---

## 7. Indexing and Analytics Layer

**Event strategy:** Each contract emits granular events. The subgraph maps `TokenCreated`, `Listed`, `Delisted`, `Bought`, `Sold`, `LiquidityAdded`, `LiquidityRemoved`, `RateUpdated` to six entity types: `Token`, `User`, `Swap`, `LiquidityEvent`, `ProtocolStats` (singleton), `DailyStats`.

**Aggregation:** Protocol-wide and per-day counters are maintained via `getOrCreateProtocolStats()` / `getOrCreateDailyStats()` helper functions with lazy initialization.

**Data integrity:** USD volume estimation is stubbed (`estimateUSDValue` returns 0). No oracle integration. `uniqueTraders` and `activeUsers` in `DailyStats` are declared but never incremented -- the schema has unfulfilled fields.

**Scalability:** `DailyStats` uses `timestamp / 86400` as ID. Bounded growth. `Swap` and `LiquidityEvent` entities grow linearly with transactions.

---

## 8. Backend Layer

**Authentication:** SIWE (EIP-4361) flow: client signs a structured message, server verifies via `siwe` library + `ethers.js`, issues JWT (7-day expiry), stores session in SQLite via Prisma.

**Session model:** Dual-tracked: stateless JWT for request auth + server-side `Session` table for explicit logout/invalidation.

**Trust boundary:** Backend trusts on-chain identity (wallet signature) but holds no on-chain state. Profile data (nickname, avatar) is purely off-chain. No read from or write to contracts.

**Security:** Helmet headers, CORS whitelist, Zod schema validation, rate limiting (100 req/15 min). IPFS upload is mocked; production path is stubbed but unimplemented.

---

## 9. Performance and Gas Considerations

- `YourToken`: Immutable `cap`/`decimals` saves ~2100 gas per read vs. storage.
- `TokenFactory`: Unbounded `allTokens[]` array in `getAllTokens()` is a gas bomb at scale.
- `SimpleSwap`: `unlistToken()` O(n) scan of `listedTokens`. All trading operations are O(1) in storage reads/writes.
- `TokenStaking`: `updateReward` modifier performs 2 SLOADs (global) + 2 SSTOREs (per-user) on every `stake`/`withdraw`/`claim` -- constant overhead, well-optimized.

---

## 10. Research-Relevant Observations

- **Novel aspect:** Integration of factory-pattern token creation with fixed-rate DEX and Synthetix staking into a single cohesive protocol -- an educational DeFi stack.
- **Key tradeoff:** Fixed-rate pricing eliminates impermanent loss and MEV but removes price discovery, making the DEX a centralized settlement layer.
- **Simplification vs. production:** No LP tokens, no governance, no fee mechanism, no oracle, no upgradeability, no timelock. Compared to Uniswap V2/V3, this is a single-sided, admin-managed pool.
- **Empirical evaluation opportunity:** Compare gas costs and capital efficiency of fixed-rate vs. CPMM under identical token/ETH pair conditions.
- **Comparable systems:** Synthetix StakingRewards (staking model), Uniswap V2 (AMM baseline), pump.fun (factory + bonding curve), OpenZeppelin token templates.
