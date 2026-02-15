# TokenStaking Module Documentation

## Overview

The TokenStaking contract implements a production-ready staking system using the **Synthetix StakingRewards** model, which is battle-tested and gas-efficient. Users can stake ERC-20 tokens and earn rewards proportionally to their stake and staking duration.

---

## Reward Math Explanation

### Core Formulas

The staking contract uses three key formulas:

#### 1. Reward Per Token

```
rewardPerToken = rewardPerTokenStored + ((currentTime - lastUpdateTime) × rewardRate × 1e18 / totalStaked)
```

**Explanation**:
- `rewardPerTokenStored`: Accumulated rewards per token from previous updates
- `currentTime - lastUpdateTime`: Time elapsed since last update
- `rewardRate`: Rewards distributed per second (set by owner)
- `totalStaked`: Total tokens staked in the contract
- `1e18`: Scaling factor for precision

**Example**:
- 10,000 tokens staked total
- Reward rate: 1 token/second
- 100 seconds elapsed
- `rewardPerToken = 0 + (100 × 1 × 1e18 / 10000) = 1e16`

This means each staked token has earned 0.01 tokens in rewards.

#### 2. User Earned Rewards

```
earned = (userBalance × (rewardPerToken - userRewardPerTokenPaid) / 1e18) + storedRewards
```

**Explanation**:
- `userBalance`: Amount user has staked
- `rewardPerToken - userRewardPerTokenPaid`: New rewards accumulated since user's last update
- `storedRewards`: Previously calculated rewards not yet claimed
- Division by `1e18` to scale back from precision

**Example**:
- User staked: 1,000 tokens
- rewardPerToken: 1e16 (from above)
- userRewardPerTokenPaid: 0 (first time)
- `earned = (1000 × 1e16 / 1e18) = 10 tokens`

#### 3. Reward Rate

```
rewardRate = totalRewards / rewardsDuration
```

**Example**:
- Total rewards: 10,000 tokens
- Duration: 7 days (604,800 seconds)
- `rewardRate = 10000 / 604800 ≈ 0.0165 tokens/second`

### Why This Model?

1. **Gas Efficient**: Only updates state when users interact, not on every block
2. **Fair Distribution**: Rewards distributed proportionally to stake and time
3. **Flexible**: Supports variable staking amounts and times
4. **Battle-Tested**: Used by Synthetix, Curve, and other major DeFi protocols

---

## Contract Functions

### User Functions

#### `stake(uint256 amount)`
Deposit tokens into the staking contract.

**Parameters**:
- `amount`: Number of tokens to stake

**Requirements**:
- `amount > 0`
- User must have approved contract to spend tokens
- User must have sufficient balance

**Events**: `Staked(user, amount)`

**Example**:
```solidity
stakingToken.approve(stakingAddress, amount);
staking.stake(ethers.parseEther("100"));
```

#### `withdraw(uint256 amount)`
Remove staked tokens from the contract.

**Parameters**:
- `amount`: Number of tokens to withdraw

**Requirements**:
- `amount > 0`
- User has staked at least `amount`

**Events**: `Withdrawn(user, amount)`

#### `claimReward()`
Claim all accumulated rewards.

**Events**: `RewardPaid(user, reward)`

**Note**: Rewards are automatically calculated based on time staked.

#### `exit()`
Convenience function that withdraws all stake and claims all rewards in one transaction.

**Equivalent to**: `withdraw(balance) + claimReward()`

### View Functions

#### `balanceOf(address account) → uint256`
Get the staked balance of an account.

#### `earned(address account) → uint256`
Calculate total earned rewards (claimed + unclaimed).

#### `rewardPerToken() → uint256`
Get the current accumulated reward per staked token.

#### `lastTimeRewardApplicable() → uint256`
Get the last valid timestamp for reward calculation (min of current time and period end).

#### `getRewardForDuration() → uint256`
Get total rewards for the entire duration.

### Owner Functions

#### `notifyRewardAmount(uint256 reward)`
Fund the contract with rewards and start/extend reward distribution.

**Parameters**:
- `reward`: Amount of reward tokens to distribute over the duration

**Requirements**:
- Only callable by owner
- Contract must have sufficient reward token balance
- `reward / duration` must not exceed available balance

**Events**: `RewardAdded(reward, rewardRate, periodFinish)`

**Example**:
```javascript
// Fund contract with 10,000 tokens for 7-day period
rewardToken.transfer(stakingAddress, ethers.parseEther("10000"));
staking.notifyRewardAmount(ethers.parseEther("10000"));
```

#### `setRewardsDuration(uint256 duration)`
Change the rewards distribution period.

**Parameters**:
- `duration`: New duration in seconds

**Requirements**:
- Only callable by owner
- Previous reward period must be finished

**Events**: `RewardsDurationUpdated(newDuration)`

#### `recoverERC20(address token, uint256 amount)`
Recover mistakenly sent tokens (except staking/reward tokens in use).

**Parameters**:
- `token`: Address of token to recover
- `amount`: Amount to recover

**Requirements**:
- Cannot recover staking tokens
- Cannot recover allocated reward tokens

---

## Frontend Integration (React + wagmi)

### Setup

Install required packages:
```bash
npm install wagmi viem @tanstack/react-query
```

### Contract ABI (Required Methods)

```typescript
const stakingABI = [
  // User functions
  "function stake(uint256 amount) external",
  "function withdraw(uint256 amount) external",
  "function claimReward() external",
  "function exit() external",

  // View functions
  "function balanceOf(address account) external view returns (uint256)",
  "function earned(address account) external view returns (uint256)",
  "function rewardPerToken() external view returns (uint256)",
  "function totalStaked() external view returns (uint256)",
  "function rewardRate() external view returns (uint256)",
  "function periodFinish() external view returns (uint256)",

  // Token addresses
  "function stakingToken() external view returns (address)",
  "function rewardToken() external view returns (address)",

  // Events
  "event Staked(address indexed user, uint256 amount)",
  "event Withdrawn(address indexed user, uint256 amount)",
  "event RewardPaid(address indexed user, uint256 reward)"
] as const;
```

### React Hooks Examples

#### 1. Read User Balance

```typescript
import { useReadContract } from 'wagmi';

function StakingBalance() {
  const { data: stakedBalance } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'balanceOf',
    args: [userAddress],
  });

  return <div>Staked: {formatEther(stakedBalance || 0n)}</div>;
}
```

#### 2. Read Earned Rewards

```typescript
function EarnedRewards() {
  const { data: earned } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'earned',
    args: [userAddress],
    // Refresh every 10 seconds
    query: { refetchInterval: 10000 }
  });

  return <div>Earned: {formatEther(earned || 0n)} RWD</div>;
}
```

#### 3. Stake Tokens

```typescript
import { useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther } from 'viem';

function StakeButton({ amount }: { amount: string }) {
  const { writeContract, data: hash } = useWriteContract();
  const { isLoading, isSuccess } = useWaitForTransactionReceipt({ hash });

  const handleStake = async () => {
    // First approve tokens
    await writeContract({
      address: STAKING_TOKEN_ADDRESS,
      abi: erc20ABI,
      functionName: 'approve',
      args: [STAKING_ADDRESS, parseEther(amount)]
    });

    // Then stake
    writeContract({
      address: STAKING_ADDRESS,
      abi: stakingABI,
      functionName: 'stake',
      args: [parseEther(amount)]
    });
  };

  return (
    <button onClick={handleStake} disabled={isLoading}>
      {isLoading ? 'Staking...' : 'Stake'}
    </button>
  );
}
```

#### 4. Claim Rewards

```typescript
function ClaimButton() {
  const { writeContract } = useWriteContract();

  const handleClaim = () => {
    writeContract({
      address: STAKING_ADDRESS,
      abi: stakingABI,
      functionName: 'claimReward'
    });
  };

  return <button onClick={handleClaim}>Claim Rewards</button>;
}
```

#### 5. Exit (Withdraw + Claim)

```typescript
function ExitButton() {
  const { writeContract } = useWriteContract();

  const handleExit = () => {
    writeContract({
      address: STAKING_ADDRESS,
      abi: stakingABI,
      functionName: 'exit'
    });
  };

  return <button onClick={handleExit}>Unstake All & Claim</button>;
}
```

#### 6. Display APR (Annual Percentage Rate)

```typescript
function StakingAPR() {
  const { data: rewardRate } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'rewardRate'
  });

  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'totalStaked'
  });

  const calculateAPR = () => {
    if (!rewardRate || !totalStaked || totalStaked === 0n) return 0;

    // APR = (rewardRate * secondsPerYear / totalStaked) * 100
    const secondsPerYear = 365n * 24n * 60n * 60n;
    const apr = (rewardRate * secondsPerYear * 100n) / totalStaked;

    return Number(apr);
  };

  return <div>APR: {calculateAPR()}%</div>;
}
```

### Complete Staking Dashboard Component

```typescript
import { formatEther, parseEther } from 'viem';
import { useAccount, useReadContract, useWriteContract } from 'wagmi';
import { useState } from 'react';

const STAKING_ADDRESS = '0x...';

export function StakingDashboard() {
  const { address } = useAccount();
  const [stakeAmount, setStakeAmount] = useState('');
  const { writeContract } = useWriteContract();

  // Read contract data
  const { data: stakedBalance } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'balanceOf',
    args: address ? [address] : undefined,
  });

  const { data: earned } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'earned',
    args: address ? [address] : undefined,
    query: { refetchInterval: 10000 } // Update every 10s
  });

  const { data: totalStaked } = useReadContract({
    address: STAKING_ADDRESS,
    abi: stakingABI,
    functionName: 'totalStaked'
  });

  const handleStake = async () => {
    const amount = parseEther(stakeAmount);

    // Approve first
    await writeContract({
      address: STAKING_TOKEN_ADDRESS,
      abi: erc20ABI,
      functionName: 'approve',
      args: [STAKING_ADDRESS, amount]
    });

    // Then stake
    writeContract({
      address: STAKING_ADDRESS,
      abi: stakingABI,
      functionName: 'stake',
      args: [amount]
    });
  };

  return (
    <div className="staking-dashboard">
      <h2>Token Staking</h2>

      <div className="stats">
        <div>Your Staked: {formatEther(stakedBalance || 0n)} STK</div>
        <div>Earned Rewards: {formatEther(earned || 0n)} RWD</div>
        <div>Total Staked: {formatEther(totalStaked || 0n)} STK</div>
      </div>

      <div className="actions">
        <input
          type="text"
          value={stakeAmount}
          onChange={(e) => setStakeAmount(e.target.value)}
          placeholder="Amount to stake"
        />
        <button onClick={handleStake}>Stake</button>

        <button onClick={() => writeContract({
          address: STAKING_ADDRESS,
          abi: stakingABI,
          functionName: 'claimReward'
        })}>
          Claim Rewards
        </button>

        <button onClick={() => writeContract({
          address: STAKING_ADDRESS,
          abi: stakingABI,
          functionName: 'exit'
        })}>
          Unstake All & Claim
        </button>
      </div>
    </div>
  );
}
```

---

## The Graph Subgraph Integration

### Schema (schema.graphql)

```graphql
type StakingContract @entity {
  id: ID! # Contract address
  stakingToken: Bytes!
  rewardToken: Bytes!
  totalStaked: BigInt!
  rewardRate: BigInt!
  periodFinish: BigInt!
  totalRewardsPaid: BigInt!
  totalStakers: BigInt!
}

type User @entity {
  id: ID! # User address
  stakedBalance: BigInt!
  rewardsClaimed: BigInt!
  totalStaked: BigInt! # Historical total
  totalWithdrawn: BigInt!
  stakes: [StakeEvent!]! @derivedFrom(field: "user")
  withdrawals: [WithdrawEvent!]! @derivedFrom(field: "user")
  claims: [ClaimEvent!]! @derivedFrom(field: "user")
}

type StakeEvent @entity {
  id: ID! # tx hash + log index
  user: User!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type WithdrawEvent @entity {
  id: ID!
  user: User!
  amount: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type ClaimEvent @entity {
  id: ID!
  user: User!
  reward: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
  transactionHash: Bytes!
}

type RewardAddedEvent @entity {
  id: ID!
  reward: BigInt!
  rewardRate: BigInt!
  periodFinish: BigInt!
  timestamp: BigInt!
  blockNumber: BigInt!
}
```

### Subgraph Manifest (subgraph.yaml snippet)

```yaml
dataSources:
  - kind: ethereum/contract
    name: TokenStaking
    network: sepolia
    source:
      address: "0x..." # Your staking contract address
      abi: TokenStaking
      startBlock: 12345678 # Block where contract was deployed
    mapping:
      kind: ethereum/events
      apiVersion: 0.0.7
      language: wasm/assemblyscript
      entities:
        - StakingContract
        - User
        - StakeEvent
        - WithdrawEvent
        - ClaimEvent
      abis:
        - name: TokenStaking
          file: ./abis/TokenStaking.json
      eventHandlers:
        - event: Staked(indexed address,uint256)
          handler: handleStaked
        - event: Withdrawn(indexed address,uint256)
          handler: handleWithdrawn
        - event: RewardPaid(indexed address,uint256)
          handler: handleRewardPaid
        - event: RewardAdded(uint256,uint256,uint256)
          handler: handleRewardAdded
      file: ./src/token-staking.ts
```

### Mapping (src/token-staking.ts)

```typescript
import { BigInt } from "@graphprotocol/graph-ts";
import {
  Staked,
  Withdrawn,
  RewardPaid,
  RewardAdded,
  TokenStaking
} from "../generated/TokenStaking/TokenStaking";
import {
  StakingContract,
  User,
  StakeEvent,
  WithdrawEvent,
  ClaimEvent,
  RewardAddedEvent
} from "../generated/schema";

export function handleStaked(event: Staked): void {
  // Update or create user
  let user = User.load(event.params.user.toHexString());
  if (user == null) {
    user = new User(event.params.user.toHexString());
    user.stakedBalance = BigInt.fromI32(0);
    user.rewardsClaimed = BigInt.fromI32(0);
    user.totalStaked = BigInt.fromI32(0);
    user.totalWithdrawn = BigInt.fromI32(0);
  }

  user.stakedBalance = user.stakedBalance.plus(event.params.amount);
  user.totalStaked = user.totalStaked.plus(event.params.amount);
  user.save();

  // Create stake event
  let stakeEvent = new StakeEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  stakeEvent.user = user.id;
  stakeEvent.amount = event.params.amount;
  stakeEvent.timestamp = event.block.timestamp;
  stakeEvent.blockNumber = event.block.number;
  stakeEvent.transactionHash = event.transaction.hash;
  stakeEvent.save();

  // Update contract stats
  let contract = StakingContract.load(event.address.toHexString());
  if (contract == null) {
    contract = new StakingContract(event.address.toHexString());
    let stakingContract = TokenStaking.bind(event.address);
    contract.stakingToken = stakingContract.stakingToken();
    contract.rewardToken = stakingContract.rewardToken();
    contract.totalStaked = BigInt.fromI32(0);
    contract.rewardRate = BigInt.fromI32(0);
    contract.periodFinish = BigInt.fromI32(0);
    contract.totalRewardsPaid = BigInt.fromI32(0);
    contract.totalStakers = BigInt.fromI32(0);
  }

  contract.totalStaked = contract.totalStaked.plus(event.params.amount);
  contract.save();
}

export function handleWithdrawn(event: Withdrawn): void {
  let user = User.load(event.params.user.toHexString());
  if (user != null) {
    user.stakedBalance = user.stakedBalance.minus(event.params.amount);
    user.totalWithdrawn = user.totalWithdrawn.plus(event.params.amount);
    user.save();
  }

  let withdrawEvent = new WithdrawEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  withdrawEvent.user = event.params.user.toHexString();
  withdrawEvent.amount = event.params.amount;
  withdrawEvent.timestamp = event.block.timestamp;
  withdrawEvent.blockNumber = event.block.number;
  withdrawEvent.transactionHash = event.transaction.hash;
  withdrawEvent.save();

  let contract = StakingContract.load(event.address.toHexString());
  if (contract != null) {
    contract.totalStaked = contract.totalStaked.minus(event.params.amount);
    contract.save();
  }
}

export function handleRewardPaid(event: RewardPaid): void {
  let user = User.load(event.params.user.toHexString());
  if (user != null) {
    user.rewardsClaimed = user.rewardsClaimed.plus(event.params.reward);
    user.save();
  }

  let claimEvent = new ClaimEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  claimEvent.user = event.params.user.toHexString();
  claimEvent.reward = event.params.reward;
  claimEvent.timestamp = event.block.timestamp;
  claimEvent.blockNumber = event.block.number;
  claimEvent.transactionHash = event.transaction.hash;
  claimEvent.save();

  let contract = StakingContract.load(event.address.toHexString());
  if (contract != null) {
    contract.totalRewardsPaid = contract.totalRewardsPaid.plus(event.params.reward);
    contract.save();
  }
}

export function handleRewardAdded(event: RewardAdded): void {
  let contract = StakingContract.load(event.address.toHexString());
  if (contract != null) {
    let stakingContract = TokenStaking.bind(event.address);
    contract.rewardRate = stakingContract.rewardRate();
    contract.periodFinish = stakingContract.periodFinish();
    contract.save();
  }

  let rewardEvent = new RewardAddedEvent(
    event.transaction.hash.toHexString() + "-" + event.logIndex.toString()
  );
  rewardEvent.reward = event.params.reward;
  rewardEvent.rewardRate = event.params.rewardRate;
  rewardEvent.periodFinish = event.params.periodFinish;
  rewardEvent.timestamp = event.block.timestamp;
  rewardEvent.blockNumber = event.block.number;
  rewardEvent.save();
}
```

### GraphQL Query Examples

```graphql
# Get staking contract stats
query {
  stakingContract(id: "0x...") {
    totalStaked
    rewardRate
    periodFinish
    totalRewardsPaid
  }
}

# Get user staking info
query {
  user(id: "0x...") {
    stakedBalance
    rewardsClaimed
    totalStaked
    stakes(orderBy: timestamp, orderDirection: desc) {
      amount
      timestamp
    }
  }
}

# Get recent stakes
query {
  stakeEvents(first: 10, orderBy: timestamp, orderDirection: desc) {
    user {
      id
    }
    amount
    timestamp
  }
}

# Get top stakers
query {
  users(first: 10, orderBy: stakedBalance, orderDirection: desc) {
    id
    stakedBalance
    rewardsClaimed
  }
}
```

---

## Gas Optimization Notes

1. **Immutable Variables**: `stakingToken` and `rewardToken` are immutable, saving ~2,100 gas per read
2. **ReentrancyGuard**: Uses OpenZeppelin's optimized implementation
3. **UpdateReward Modifier**: Batches state updates to minimize storage writes
4. **SafeERC20**: Only adds overhead when necessary (non-standard tokens)
5. **Packed Storage**: Variables ordered for optimal slot packing

**Typical Gas Costs** (Sepolia):
- Stake: ~120,000 gas
- Withdraw: ~80,000 gas
- Claim: ~70,000 gas
- Exit: ~140,000 gas

---

## Security Checklist

- ✅ Reentrancy protection with OpenZeppelin's ReentrancyGuard
- ✅ SafeERC20 for token transfers
- ✅ Owner cannot withdraw user stakes
- ✅ Reward allocation checked before distribution
- ✅ Integer overflow protection (Solidity 0.8.24)
- ✅ Access control with Ownable
- ✅ Event emission for all state changes
- ✅ No timestamp manipulation vulnerabilities
- ✅ Comprehensive test coverage

---

## Deployment Checklist

- [ ] Deploy staking and reward tokens (or use existing)
- [ ] Deploy TokenStaking contract
- [ ] Fund contract with reward tokens
- [ ] Call `notifyRewardAmount()` to start distribution
- [ ] Verify contracts on Etherscan
- [ ] Deploy subgraph to The Graph
- [ ] Integrate frontend with wagmi hooks
- [ ] Test on testnet before mainnet
- [ ] Conduct security audit (for production)

---

## Further Reading

- [Synthetix StakingRewards](https://github.com/Synthetixio/synthetix/blob/master/contracts/StakingRewards.sol)
- [OpenZeppelin Security](https://docs.openzeppelin.com/contracts/5.x/api/security)
- [The Graph Documentation](https://thegraph.com/docs/en/)
- [wagmi Documentation](https://wagmi.sh/)
