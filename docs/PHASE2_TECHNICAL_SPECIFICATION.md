# PHASE 2 -- Research-Ready Technical System Specification

## 1. System Overview

TokenFactory is an integrated decentralized finance (DeFi) protocol comprising four interdependent on-chain modules deployed on the Ethereum Sepolia testnet, complemented by an off-chain indexing layer and an authenticated backend service. The system enables permissionless ERC-20 token creation, administrator-managed fixed-rate token exchange, and time-weighted staking reward distribution. Unlike production DeFi protocols that rely on automated market makers (AMMs) and decentralized governance, TokenFactory adopts a centrally administered exchange model, presenting a structurally distinct approach to token lifecycle management within a unified contract ecosystem.

The protocol's architecture is decomposed into four layers: (i) the smart contract layer, responsible for all on-chain state transitions and economic logic; (ii) the subgraph indexing layer, which transforms emitted events into queryable analytics entities via The Graph Protocol; (iii) the backend authentication layer, implementing Sign-In with Ethereum (SIWE, EIP-4361) for off-chain identity binding; and (iv) the frontend client layer. This specification focuses on layers (i) through (iii), as they constitute the system's engineering and research-relevant surface.

---

## 2. Architectural Design

The on-chain architecture follows a modular composition pattern. `TokenFactory` deploys instances of `YourToken` via the `CREATE` opcode, registering each in an append-only registry. `SimpleSwap` provides a fixed-rate exchange venue where listed tokens trade against ETH. `TokenStaking` operates independently, distributing time-weighted rewards to stakers of any designated ERC-20 token pair.

No direct contract-to-contract invocation exists between `TokenFactory`, `SimpleSwap`, and `TokenStaking`. Integration is achieved through shared token addresses: a token created by the factory can be listed on the DEX and designated as a staking or reward token. This loose coupling simplifies the trust model -- each contract's security properties can be analyzed in isolation -- but requires off-chain coordination (the administrator) to connect the modules operationally.

The off-chain subgraph subscribes to events from `TokenFactory` and `SimpleSwap`, maintaining denormalized analytics entities including per-token volume aggregates, per-user activity profiles, protocol-wide singleton statistics, and daily time-series data. The backend server operates on an entirely separate trust domain: it authenticates users via cryptographic wallet signatures but neither reads from nor writes to any smart contract.

---

## 3. Smart Contract Design

### 3.1 Token Model

`YourToken` extends OpenZeppelin's `ERC20` and `Ownable` contracts with two additions: an immutable supply cap enforced on `mint()`, and public `burn()` / `burnFrom()` functions. The cap is set at construction time and cannot be modified, establishing a hard upper bound on token supply. The use of `immutable` for both `cap` and `_decimals` eliminates storage reads (SLOAD) on these frequently accessed values, reducing gas cost by approximately 2,100 gas per access compared to standard storage variables.

### 3.2 Factory Model

`TokenFactory` implements a permissionless deployer pattern. Any address may invoke `createToken()`, which executes a full contract deployment via Solidity's `new` keyword (CREATE opcode). The caller is set as the deployed token's `Ownable` owner. The factory maintains two registries: a global `allTokens[]` array and a per-creator `tokensByOwner` mapping. Both are append-only; no deletion or deactivation mechanism exists.

A critical scalability constraint arises from `getAllTokens()`, which returns the entire `allTokens[]` array. As this array grows unboundedly, the function's gas cost will eventually exceed block gas limits, rendering it uncallable. This is an acknowledged design simplification appropriate for testnet deployment but unacceptable in production.

### 3.3 Exchange Model

`SimpleSwap` implements a fixed-rate exchange where an administrator sets the price of each listed token in terms of ETH. The exchange rate `R` (expressed as `tokenPerEth`) defines a linear pricing function:

**Buy operation:**

```
T_out = (E_in * R) / 10^18
```

**Sell operation:**

```
E_out = (T_in * 10^18) / R
```

where `E` denotes ETH amounts in wei, `T` denotes token amounts in the token's smallest unit, and `R` is the administrator-set rate. This pricing model has several distinctive properties:

1. **Deterministic execution:** Trade output is fully determined by input amount and current rate, with no path dependency or slippage.
2. **Zero fees:** No protocol fee, liquidity provider fee, or spread exists. Buy and sell operations are exact inverses at the same rate.
3. **No price discovery:** The exchange rate is exogenously set by the contract owner, not derived from pool reserves or market activity.
4. **No impermanent loss:** Since liquidity is single-sided and administrator-managed, the concept of impermanent loss does not apply.

Liquidity is managed exclusively by the contract owner through `addLiquidity()` and `withdraw()`. A configurable `minEthLiquidity` floor per token prevents complete ETH drainage through sell operations. The owner is the sole liquidity provider; no LP token or proportional share mechanism exists.

---

## 4. Economic and Tokenomics Model

The protocol's economic model is characterized by the absence of automated incentive mechanisms. Token supply is controlled entirely by the token owner via manual `mint()` calls, bounded by the immutable cap. No emission schedule, bonding curve, or algorithmic supply adjustment exists.

Staking rewards are funded by discrete owner deposits through `notifyRewardAmount()`. The reward budget must be explicitly transferred to the staking contract before notification. No protocol revenue (fees, spread, or MEV capture) feeds into the reward pool, making the system's economic sustainability entirely dependent on exogenous funding.

The incentive structure creates an asymmetry: staking provides time-proportional yield, while trading on the DEX incurs no cost and generates no protocol benefit. This design lacks the self-reinforcing feedback loops characteristic of production DeFi systems (e.g., Uniswap's fee-to-LP-to-liquidity-to-volume cycle).

---

## 5. Staking Algorithm Formulation

The staking module implements the Synthetix `StakingRewards` continuous reward distribution algorithm. The core state variables are:

- `rewardRate` (r): reward tokens distributed per second
- `totalStaked` (S): aggregate staked balance
- `rewardPerTokenStored` (P): accumulated reward per unit of stake
- `lastUpdateTime` (t_last): timestamp of last state update
- `periodFinish` (t_end): timestamp when current reward period expires

The global accumulator is updated on every state-mutating operation:

```
P_new = P_old + (r * (min(t_now, t_end) - t_last) * 10^18) / S
```

Per-user earned rewards are computed as:

```
earned(u) = (balance(u) * (P_new - P_paid(u))) / 10^18 + rewards(u)
```

where `P_paid(u)` is the value of P at the user's last interaction, and `rewards(u)` is the user's previously accumulated but unclaimed reward balance.

When a new reward amount `R_new` is notified mid-period, the remaining undistributed rewards are combined:

```
r_new = (R_new + (t_end - t_now) * r_old) / D
```

where `D` is `rewardsDuration`. This ensures smooth reward rate transitions without discontinuities.

**Precision analysis:** All intermediate calculations use `uint256` with 1e18 scaling. The primary precision loss occurs in the integer division `reward / rewardsDuration` when computing `rewardRate`, which can leave up to `rewardsDuration - 1` wei of reward tokens unclaimable (dust). This is identical to the known Synthetix limitation.

---

## 6. Security Architecture

**Reentrancy protection:** `SimpleSwap` and `TokenStaking` inherit OpenZeppelin's `ReentrancyGuard`. All functions that perform external calls (`buyToken`, `sellToken`, `withdraw`, `stake`, `claimReward`) are guarded with the `nonReentrant` modifier.

**State update ordering:** In `SimpleSwap.sellToken()`, internal balance decrements precede external token transfers and ETH sends. While this follows the checks-effects-interactions pattern, the ETH transfer via `call{value}` to an arbitrary `msg.sender` would be a reentrancy vector without the `nonReentrant` guard. In `TokenStaking`, the `updateReward` modifier executes before the function body, ensuring reward state is snapshotted prior to any balance changes.

**Centralization risks:** The owner address controls: (a) all DEX operations -- listing, delisting, rate setting, liquidity management; (b) all staking parameters -- reward funding, duration changes, token recovery; (c) token minting. No multisig, timelock, governance mechanism, or role separation exists. Compromise of the owner key permits: draining all DEX liquidity via `withdraw()`, manipulating exchange rates via `setRate()`, and minting tokens to cap.

**Missing protections:** No emergency pause mechanism exists on any contract. `setRate()` accepts any non-zero value without bounds checking, enabling arbitrarily favorable rates. No upgrade path exists (contracts are non-upgradeable), which eliminates proxy-related attack surfaces but prevents post-deployment patching.

---

## 7. Off-Chain Integration

### 7.1 Subgraph Indexing

The subgraph defines six entity types mapped from seven event types. `ProtocolStats` is a singleton entity (ID = "1") aggregating protocol-wide counters. `DailyStats` partitions activity by UTC day using `timestamp / 86400` as entity ID.

The USD volume estimation function (`estimateUSDValue`) is stubbed, returning zero. The `uniqueTraders` and `activeUsers` fields in `DailyStats` are declared in the schema but never incremented in handlers, representing unfulfilled analytics dimensions.

### 7.2 Authentication Layer

The backend implements SIWE (EIP-4361) authentication: the client signs a structured message with their Ethereum private key, the server verifies the signature using the `siwe` library, and issues a JWT with a 7-day expiry. Sessions are dual-tracked: the JWT provides stateless verification for API requests, while a server-side `Session` table enables explicit logout and invalidation.

The backend stores off-chain profile data (nickname, avatar URL) keyed by wallet address. No on-chain state is read or written by the server. The trust boundary is clearly defined: the server trusts wallet ownership proofs but makes no assumptions about on-chain token balances, staking positions, or trading history.

---

## 8. Performance Considerations

Gas-critical operations are bounded: `buyToken()` and `sellToken()` each require exactly 2 SSTOREs (pool balance updates) plus one external token transfer. `stake()` and `withdraw()` incur the `updateReward` modifier overhead (2 SLOADs for global state, 2 SSTOREs for per-user state) plus 1 SSTORE for balance update.

The primary gas bottleneck is `TokenFactory.getAllTokens()`, which copies an unbounded storage array to memory. Secondary is `SimpleSwap.unlistToken()`, which performs an O(n) linear scan to remove an element from `listedTokens[]`.

---

## 9. Design Tradeoffs

| Decision | Benefit | Cost |
|---|---|---|
| Fixed-rate vs. AMM | Deterministic pricing, zero slippage, no IL | No price discovery, no market efficiency |
| Owner-managed liquidity | Simplified contract, no LP token accounting | Single point of failure, no community liquidity |
| Synthetix staking model | Battle-tested, gas-efficient, continuous accrual | Requires exogenous reward funding, front-run risk |
| No upgradeability | Eliminates proxy attack surface | Cannot patch vulnerabilities post-deployment |
| No fee mechanism | Simplicity, zero trading cost | No protocol revenue, no self-sustaining economics |
| Append-only registries | Simple state management | Unbounded growth, gas limit risk on reads |

---

## 10. Identified Research Contributions

1. **Integrated token lifecycle protocol:** The combination of factory-pattern creation, fixed-rate exchange, and Synthetix-model staking into a single protocol presents a minimal but complete DeFi stack suitable for formal analysis of module interaction properties.

2. **Fixed-rate DEX formalization:** The deterministic pricing model, while simpler than AMMs, has not been formally characterized in the literature regarding capital efficiency, liquidity utilization ratios, and administrator risk compared to CPMM models.

3. **Centralized vs. decentralized exchange tradeoff analysis:** The system provides a concrete implementation for empirical comparison of gas costs, MEV exposure, and capital efficiency between fixed-rate (admin-set) and automated (curve-derived) pricing under identical asset pairs.

4. **Cross-layer trust boundary analysis:** The clean separation between on-chain economic logic and off-chain identity (SIWE) with no oracle bridge presents an analyzable case study for trust model decomposition in hybrid DeFi architectures.

5. **Event-driven analytics completeness:** The subgraph layer demonstrates both the capabilities and limitations of purely event-driven off-chain analytics, including the challenge of maintaining denormalized aggregate consistency without database transactions.
