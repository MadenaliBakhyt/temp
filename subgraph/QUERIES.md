# Example GraphQL Queries

This document contains useful GraphQL queries for the TokenFactory subgraph.

## Table of Contents

- [Token Queries](#token-queries)
- [User Queries](#user-queries)
- [Swap Queries](#swap-queries)
- [Liquidity Queries](#liquidity-queries)
- [Protocol Stats](#protocol-stats)
- [Analytics Queries](#analytics-queries)

---

## Token Queries

### Get All Tokens (Recent First)

```graphql
{
  tokens(first: 20, orderBy: createdAt, orderDirection: desc) {
    id
    name
    symbol
    decimals
    initialSupply
    cap
    creator {
      id
    }
    isListed
    createdAt
  }
}
```

### Get Listed Tokens Only

```graphql
{
  tokens(
    where: { isListed: true }
    orderBy: totalBuyVolume
    orderDirection: desc
  ) {
    id
    name
    symbol
    tokenPerEth
    ethBalance
    tokenBalance
    totalBuyVolume
    totalSellVolume
    totalBuyCount
    totalSellCount
  }
}
```

### Get Token by Address

```graphql
{
  token(id: "0x1234...") {
    name
    symbol
    decimals
    initialSupply
    cap
    creator {
      id
      totalTokensCreated
    }
    isListed
    tokenPerEth
    ethBalance
    tokenBalance
    totalBuyVolume
    totalSellVolume
    totalBuyCount
    totalSellCount
    totalLiquidityAdded
    totalLiquidityRemoved
    createdAt
    listedAt
  }
}
```

### Get Token with Recent Activity

```graphql
{
  token(id: "0x1234...") {
    name
    symbol
    swaps(first: 10, orderBy: timestamp, orderDirection: desc) {
      id
      type
      user {
        id
      }
      ethAmount
      tokenAmount
      timestamp
      txHash
    }
    liquidityEvents(first: 5, orderBy: timestamp, orderDirection: desc) {
      id
      type
      provider {
        id
      }
      ethAmount
      tokenAmount
      timestamp
    }
  }
}
```

### Search Tokens by Symbol

```graphql
{
  tokens(
    where: { symbol_contains_nocase: "USDC" }
    orderBy: createdAt
    orderDirection: desc
  ) {
    id
    name
    symbol
    isListed
    creator {
      id
    }
  }
}
```

---

## User Queries

### Get User Profile

```graphql
{
  user(id: "0xabcd...") {
    id
    totalTokensCreated
    totalBuys
    totalSells
    totalBuyVolume
    totalSellVolume
    totalLiquidityAdded
    totalLiquidityRemoved
    totalTransactions
    firstSeenAt
    lastSeenAt
  }
}
```

### Get User's Created Tokens

```graphql
{
  user(id: "0xabcd...") {
    tokensCreated {
      id
      name
      symbol
      isListed
      createdAt
      totalBuyVolume
      totalSellVolume
    }
  }
}
```

### Get User's Trading History

```graphql
{
  user(id: "0xabcd...") {
    swaps(first: 50, orderBy: timestamp, orderDirection: desc) {
      id
      type
      token {
        name
        symbol
      }
      ethAmount
      tokenAmount
      timestamp
      txHash
    }
  }
}
```

### Get User's Liquidity Positions

```graphql
{
  user(id: "0xabcd...") {
    liquidityEvents(orderBy: timestamp, orderDirection: desc) {
      id
      type
      token {
        name
        symbol
      }
      ethAmount
      tokenAmount
      tokenPerEth
      timestamp
    }
  }
}
```

### Get Top Token Creators

```graphql
{
  users(
    first: 10
    orderBy: totalTokensCreated
    orderDirection: desc
    where: { totalTokensCreated_gt: 0 }
  ) {
    id
    totalTokensCreated
    firstCreatedAt
    lastCreatedAt
    tokensCreated {
      name
      symbol
      isListed
    }
  }
}
```

### Get Top Traders by Volume

```graphql
{
  users(
    first: 10
    orderBy: totalBuyVolume
    orderDirection: desc
    where: { totalBuys_gt: 0 }
  ) {
    id
    totalBuys
    totalSells
    totalBuyVolume
    totalSellVolume
  }
}
```

---

## Swap Queries

### Get Recent Swaps (All Tokens)

```graphql
{
  swaps(first: 20, orderBy: timestamp, orderDirection: desc) {
    id
    type
    token {
      name
      symbol
    }
    user {
      id
    }
    ethAmount
    tokenAmount
    timestamp
    blockNumber
    txHash
  }
}
```

### Get Buys Only

```graphql
{
  swaps(
    where: { type: BUY }
    first: 20
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    token {
      name
      symbol
    }
    user {
      id
    }
    ethAmount
    tokenAmount
    timestamp
  }
}
```

### Get Swaps for Specific Token

```graphql
{
  swaps(
    where: { token: "0x1234..." }
    first: 50
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    type
    user {
      id
    }
    ethAmount
    tokenAmount
    timestamp
  }
}
```

### Get Large Trades (>1 ETH)

```graphql
{
  swaps(
    where: { ethAmount_gt: "1000000000000000000" }
    orderBy: ethAmount
    orderDirection: desc
  ) {
    id
    type
    token {
      name
      symbol
    }
    user {
      id
    }
    ethAmount
    tokenAmount
    timestamp
  }
}
```

---

## Liquidity Queries

### Get Recent Liquidity Events

```graphql
{
  liquidityEvents(first: 20, orderBy: timestamp, orderDirection: desc) {
    id
    type
    token {
      name
      symbol
    }
    provider {
      id
    }
    ethAmount
    tokenAmount
    tokenPerEth
    timestamp
    txHash
  }
}
```

### Get Liquidity Additions Only

```graphql
{
  liquidityEvents(
    where: { type: ADD }
    orderBy: timestamp
    orderDirection: desc
  ) {
    id
    token {
      name
      symbol
    }
    provider {
      id
    }
    ethAmount
    tokenAmount
    timestamp
  }
}
```

### Get Liquidity for Specific Token

```graphql
{
  token(id: "0x1234...") {
    liquidityEvents(orderBy: timestamp, orderDirection: desc) {
      id
      type
      provider {
        id
      }
      ethAmount
      tokenAmount
      tokenPerEth
      timestamp
    }
  }
}
```

---

## Protocol Stats

### Get Overall Statistics

```graphql
{
  protocolStats(id: "1") {
    # Token stats
    totalTokensCreated
    totalTokensListed

    # Trading stats
    totalSwaps
    totalBuys
    totalSells
    totalVolumeETH

    # Liquidity stats
    totalLiquidityAddedETH
    totalLiquidityRemovedETH
    currentTotalLiquidityETH

    # User stats
    totalUsers
    totalCreators
    totalTraders
    totalLiquidityProviders

    # Timestamps
    firstActivityAt
    lastActivityAt
    lastUpdatedBlock
  }
}
```

---

## Analytics Queries

### Get Daily Stats (Last 30 Days)

```graphql
{
  dailyStats(
    first: 30
    orderBy: date
    orderDirection: desc
  ) {
    id
    date
    tokensCreated
    tokensListed
    swaps
    buys
    sells
    volumeETH
    uniqueTraders
    liquidityAddedETH
    liquidityRemovedETH
    activeUsers
    transactions
  }
}
```

### Get Stats for Specific Day

```graphql
{
  dailyStats(id: "19000") {  # Day ID = timestamp / 86400
    date
    tokensCreated
    swaps
    volumeETH
    activeUsers
  }
}
```

### Get Daily Volume Chart Data

```graphql
{
  dailyStats(
    first: 90
    orderBy: date
    orderDirection: desc
  ) {
    date
    volumeETH
    buys
    sells
  }
}
```

### Get Token Creation Trend

```graphql
{
  dailyStats(
    first: 30
    orderBy: date
    orderDirection: desc
  ) {
    date
    tokensCreated
    tokensListed
  }
}
```

---

## Advanced Queries

### Get Token Leaderboard

```graphql
{
  tokens(
    first: 10
    where: { isListed: true }
    orderBy: totalBuyVolume
    orderDirection: desc
  ) {
    name
    symbol
    totalBuyVolume
    totalSellVolume
    totalBuyCount
    totalSellCount
    ethBalance
    tokenBalance
  }
}
```

### Get Active Users (Last 24h)

```graphql
{
  users(
    where: { lastSeenAt_gt: "1704067200" }  # Replace with (now - 86400)
    orderBy: lastSeenAt
    orderDirection: desc
  ) {
    id
    totalTransactions
    lastSeenAt
  }
}
```

### Get Token with Full Stats

```graphql
{
  token(id: "0x1234...") {
    # Basic info
    name
    symbol
    decimals
    creator {
      id
    }

    # DEX info
    isListed
    tokenPerEth
    ethBalance
    tokenBalance

    # Volume stats
    totalBuyVolume
    totalSellVolume
    totalBuyCount
    totalSellCount

    # Recent swaps
    swaps(first: 5, orderBy: timestamp, orderDirection: desc) {
      type
      ethAmount
      tokenAmount
      timestamp
    }

    # Liquidity events
    liquidityEvents(first: 5, orderBy: timestamp, orderDirection: desc) {
      type
      ethAmount
      timestamp
    }
  }
}
```

### Get Market Overview

```graphql
{
  protocolStats(id: "1") {
    totalTokensListed
    currentTotalLiquidityETH
    totalVolumeETH
  }

  tokens(first: 5, where: { isListed: true }, orderBy: totalBuyVolume, orderDirection: desc) {
    name
    symbol
    totalBuyVolume
  }

  dailyStats(first: 1, orderBy: date, orderDirection: desc) {
    date
    swaps
    volumeETH
    activeUsers
  }
}
```

---

## Pagination Example

```graphql
# First page
{
  tokens(first: 10, skip: 0, orderBy: createdAt, orderDirection: desc) {
    id
    name
    symbol
  }
}

# Second page
{
  tokens(first: 10, skip: 10, orderBy: createdAt, orderDirection: desc) {
    id
    name
    symbol
  }
}
```

---

## Filtering Examples

### By Time Range

```graphql
{
  swaps(
    where: {
      timestamp_gt: "1704067200"  # After Jan 1, 2024
      timestamp_lt: "1706745600"  # Before Feb 1, 2024
    }
    orderBy: timestamp
  ) {
    id
    ethAmount
    timestamp
  }
}
```

### By Multiple Conditions

```graphql
{
  tokens(
    where: {
      isListed: true
      totalBuyVolume_gt: "1000000000000000000"  # > 1 ETH
      totalBuyCount_gt: 10
    }
    orderBy: totalBuyVolume
    orderDirection: desc
  ) {
    name
    symbol
    totalBuyVolume
    totalBuyCount
  }
}
```

---

## Meta Queries

### Check Subgraph Status

```graphql
{
  _meta {
    block {
      number
      hash
      timestamp
    }
    deployment
    hasIndexingErrors
  }
}
```

---

## Tips

1. **Use pagination** for large result sets (first, skip)
2. **Filter early** to reduce data transferred
3. **Request only needed fields** to optimize performance
4. **Use orderBy** for sorted results
5. **Cache queries** on the client side
6. **Use variables** for dynamic queries in your app

Example with variables:
```graphql
query GetToken($tokenId: ID!) {
  token(id: $tokenId) {
    name
    symbol
    totalBuyVolume
  }
}
```

Variables:
```json
{
  "tokenId": "0x1234..."
}
```
